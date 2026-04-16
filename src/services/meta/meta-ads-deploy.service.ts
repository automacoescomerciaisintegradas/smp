import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createLogger } from '../../lib/logger';
import { ExternalApiError, ValidationError } from '../../errors';
import type { CallToAction, CampaignObjective } from '../../types/sama';

const logger = createLogger('MetaAdsDeployService');

const REQUIRED_VARIANTS = ['vertical', 'horizontal', 'quadrado'] as const;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v']);

type VariantName = typeof REQUIRED_VARIANTS[number];
type MediaType = 'IMAGE' | 'VIDEO';

interface MetaClientLike {
  post<T = unknown>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<{ success: boolean; data?: T }>;
  uploadFile(
    endpoint: string,
    formData: FormData
  ): Promise<{ success: boolean; data?: unknown }>;
}

export interface MetaAdsDeployVariant {
  format: VariantName;
  fileName: string;
  filePath: string;
  mediaType: MediaType;
}

export interface MetaAdsDeployAssetGroup {
  slug: string;
  name: string;
  mediaType: MediaType;
  variants: Record<VariantName, MetaAdsDeployVariant>;
}

export interface MetaAdsDeployRequest {
  sourceDir: string;
  campaignName: string;
  adSetName: string;
  objective: CampaignObjective;
  dailyBudget: number;
  destinationUrl: string;
  primaryText: string;
  headline?: string;
  description?: string;
  cta?: CallToAction;
  countries?: string[];
  mode?: 'DRAFT' | 'LIVE';
  dryRun?: boolean;
}

type NormalizedMetaAdsDeployRequest = Omit<
  MetaAdsDeployRequest,
  'cta' | 'countries' | 'mode' | 'dryRun'
> & {
  cta: CallToAction;
  countries: string[];
  mode: 'DRAFT' | 'LIVE';
  dryRun: boolean;
};

export interface MetaAdsDeployResult {
  success: boolean;
  campaign?: {
    id: string;
    metaCampaignId: string;
    name: string;
  };
  adSet?: {
    id: string;
    metaAdSetId: string;
    name: string;
  };
  ads: Array<{
    id: string;
    metaAdId: string;
    creativeId?: string;
    name: string;
  }>;
  plan?: {
    campaign: Record<string, unknown>;
    adSet: Record<string, unknown>;
    ads: Array<{
      name: string;
      creative: Record<string, unknown>;
    }>;
    assetGroups: MetaAdsDeployAssetGroup[];
  };
}

export class MetaAdsDeployService {
  constructor(
    private metaClient: MetaClientLike,
    private runtime: {
      adAccountId: string;
      pageId: string;
      instagramActorId?: string;
    }
  ) {}

  async collectAssetGroups(sourceDir: string): Promise<MetaAdsDeployAssetGroup[]> {
    const opLogger = logger.createChild('collectAssetGroups');
    opLogger.info('Collecting asset groups', { sourceDir });

    const entries = await readdir(sourceDir, { withFileTypes: true }).catch(error => {
      throw new ValidationError(
        `Unable to read source directory: ${sourceDir}`,
        [{ field: 'sourceDir', message: error instanceof Error ? error.message : 'Unknown error' }]
      );
    });

    const groups = new Map<
      string,
      {
        name: string;
        mediaType?: MediaType;
        variants: Partial<Record<VariantName, MetaAdsDeployVariant>>;
      }
    >();

    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        continue;
      }

      if (entry.isDirectory()) {
        const nestedDir = path.join(sourceDir, entry.name);
        const nestedFiles = await readdir(nestedDir, { withFileTypes: true });

        for (const nestedFile of nestedFiles) {
          if (!nestedFile.isFile()) {
            continue;
          }

          this.registerAssetFile({
            groups,
            groupName: entry.name,
            filePath: path.join(nestedDir, nestedFile.name),
            fileName: nestedFile.name,
          });
        }

        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const parsed = this.parseFlatFileName(entry.name);
      if (!parsed) {
        continue;
      }

      this.registerAssetFile({
        groups,
        groupName: parsed.groupName,
        filePath: path.join(sourceDir, entry.name),
        fileName: entry.name,
        explicitVariant: parsed.variant,
      });
    }

    if (groups.size === 0) {
      throw new ValidationError('No ad assets were found in the source directory', [
        {
          field: 'sourceDir',
          message:
            'Expected folders or files containing the tokens vertical, horizontal, and quadrado',
        },
      ]);
    }

    return Array.from(groups.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([groupKey, group]) => {
        const variants = group.variants as Record<VariantName, MetaAdsDeployVariant>;

        for (const variant of REQUIRED_VARIANTS) {
          if (!variants[variant]) {
            throw new ValidationError(
              `Ad group "${groupKey}" must include vertical, horizontal, and quadrado`,
              [{ field: groupKey, message: 'must include vertical, horizontal, and quadrado' }]
            );
          }
        }

        if (!group.mediaType) {
          throw new ValidationError(`Could not infer media type for "${groupKey}"`);
        }

        return {
          slug: this.toSlug(group.name),
          name: group.name,
          mediaType: group.mediaType,
          variants,
        };
      });
  }

  async deploy(request: MetaAdsDeployRequest): Promise<MetaAdsDeployResult> {
    const opLogger = logger.createChild('deploy');
    const normalizedRequest = this.normalizeRequest(request);
    const assetGroups = await this.collectAssetGroups(normalizedRequest.sourceDir);

    opLogger.info('Deploy request received', {
      adCount: assetGroups.length,
      dryRun: normalizedRequest.dryRun,
      mode: normalizedRequest.mode,
    });

    const plan = this.buildPlan(assetGroups, normalizedRequest);

    if (normalizedRequest.dryRun) {
      return {
        success: true,
        ads: [],
        plan,
      };
    }

    const campaignResponse = await this.metaClient.post<{ id: string }>(
      `${this.runtime.adAccountId}/campaigns`,
      plan.campaign
    );
    const metaCampaignId = this.requireId(campaignResponse.data, 'campaign');

    const adSetPayload = {
      ...plan.adSet,
      campaign_id: metaCampaignId,
    };
    const adSetResponse = await this.metaClient.post<{ id: string }>(
      `${this.runtime.adAccountId}/adsets`,
      adSetPayload
    );
    const metaAdSetId = this.requireId(adSetResponse.data, 'adset');

    const ads: MetaAdsDeployResult['ads'] = [];

    for (const assetGroup of assetGroups) {
      const uploadedAssets = await this.uploadAssetGroup(assetGroup);
      const creativePayload = this.buildCreativePayload(
        assetGroup,
        uploadedAssets,
        normalizedRequest
      );

      const creativeResponse = await this.metaClient.post<{ id: string }>(
        `${this.runtime.adAccountId}/adcreatives`,
        creativePayload
      );
      const creativeId = this.requireId(creativeResponse.data, 'creative');

      const adResponse = await this.metaClient.post<{ id: string }>(
        `${this.runtime.adAccountId}/ads`,
        {
          name: assetGroup.name,
          status: normalizedRequest.mode === 'LIVE' ? 'ACTIVE' : 'PAUSED',
          adset_id: metaAdSetId,
          creative: { creative_id: creativeId },
        }
      );
      const metaAdId = this.requireId(adResponse.data, 'ad');

      ads.push({
        id: assetGroup.slug,
        metaAdId,
        creativeId,
        name: assetGroup.name,
      });
    }

    return {
      success: true,
      campaign: {
        id: normalizedRequest.campaignName,
        metaCampaignId,
        name: normalizedRequest.campaignName,
      },
      adSet: {
        id: normalizedRequest.adSetName,
        metaAdSetId,
        name: normalizedRequest.adSetName,
      },
      ads,
      plan,
    };
  }

  private normalizeRequest(request: MetaAdsDeployRequest): NormalizedMetaAdsDeployRequest {
    if (!request.sourceDir?.trim()) {
      throw new ValidationError('sourceDir is required');
    }

    if (!request.campaignName?.trim()) {
      throw new ValidationError('campaignName is required');
    }

    if (!request.adSetName?.trim()) {
      throw new ValidationError('adSetName is required');
    }

    if (!request.primaryText?.trim()) {
      throw new ValidationError('primaryText is required');
    }

    if (!request.destinationUrl?.trim()) {
      throw new ValidationError('destinationUrl is required');
    }

    if (!Number.isFinite(request.dailyBudget) || request.dailyBudget <= 0) {
      throw new ValidationError('dailyBudget must be greater than zero');
    }

    try {
      new URL(request.destinationUrl);
    } catch {
      throw new ValidationError('destinationUrl must be a valid URL');
    }

    return {
      ...request,
      countries: request.countries?.length ? request.countries : ['BR'],
      cta: request.cta || 'LEARN_MORE',
      mode: request.mode || 'DRAFT',
      dryRun: Boolean(request.dryRun),
    };
  }

  private buildPlan(
    assetGroups: MetaAdsDeployAssetGroup[],
    request: NormalizedMetaAdsDeployRequest
  ): NonNullable<MetaAdsDeployResult['plan']> {
    return {
      campaign: this.buildCampaignPayload(request),
      adSet: this.buildAdSetPayload(request),
      ads: assetGroups.map(assetGroup => ({
        name: assetGroup.name,
        creative: this.buildCreativePayload(
          assetGroup,
          {
            vertical: `preview_${assetGroup.slug}_vertical`,
            horizontal: `preview_${assetGroup.slug}_horizontal`,
            quadrado: `preview_${assetGroup.slug}_quadrado`,
          },
          request
        ),
      })),
      assetGroups,
    };
  }

  private buildCampaignPayload(request: NormalizedMetaAdsDeployRequest) {
    return {
      name: request.campaignName,
      objective: this.mapCampaignObjective(request.objective),
      special_ad_categories: 'NONE',
      status: request.mode === 'LIVE' ? 'ACTIVE' : 'PAUSED',
      buying_type: 'AUCTION',
    };
  }

  private buildAdSetPayload(request: NormalizedMetaAdsDeployRequest) {
    return {
      name: request.adSetName,
      objective: this.mapAdSetObjective(request.objective),
      billing_event: 'IMPRESSIONS',
      status: request.mode === 'LIVE' ? 'ACTIVE' : 'PAUSED',
      targeting: {
        age_min: 21,
        age_max: 65,
        geo_locations: {
          countries: request.countries,
          location_types: ['home', 'recent'],
        },
        publisher_platforms: ['facebook', 'instagram'],
        facebook_positions: ['feed', 'story', 'facebook_reels', 'video_feeds', 'instream_video'],
        instagram_positions: ['stream', 'story', 'reels'],
      },
      daily_budget: this.toMinorUnits(request.dailyBudget),
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    };
  }

  private buildCreativePayload(
    assetGroup: MetaAdsDeployAssetGroup,
    uploadedAssets: Record<VariantName, string>,
    request: NormalizedMetaAdsDeployRequest
  ) {
    const assetFeedKey = assetGroup.mediaType === 'VIDEO' ? 'videos' : 'images';
    const mediaPayload = REQUIRED_VARIANTS.map(variant => {
      const idValue = uploadedAssets[variant];
      if (assetGroup.mediaType === 'VIDEO') {
        return {
          video_id: idValue,
          adlabels: [{ name: variant }],
        };
      }

      return {
        hash: idValue,
        adlabels: [{ name: variant }],
      };
    });

    const asset_feed_spec: Record<string, unknown> = {
      ad_formats: [assetGroup.mediaType === 'VIDEO' ? 'SINGLE_VIDEO' : 'SINGLE_IMAGE'],
      [assetFeedKey]: mediaPayload,
      bodies: [{ text: request.primaryText }],
      link_urls: [{ website_url: request.destinationUrl }],
      call_to_action_types: [request.cta],
      asset_customization_rules: this.buildCustomizationRules(assetGroup.mediaType),
    };

    if (request.headline) {
      asset_feed_spec.titles = [{ text: request.headline }];
    }

    if (request.description) {
      asset_feed_spec.descriptions = [{ text: request.description }];
    }

    return {
      name: assetGroup.name,
      object_story_spec: {
        page_id: this.runtime.pageId,
        ...(this.runtime.instagramActorId
          ? { instagram_actor_id: this.runtime.instagramActorId }
          : {}),
      },
      asset_feed_spec,
      degrees_of_freedom_spec: {
        creative_features_spec: {
          standard_enhancements: {
            enroll_status: 'OPT_IN',
          },
        },
      },
    };
  }

  private buildCustomizationRules(mediaType: MediaType) {
    const labelKey = mediaType === 'VIDEO' ? 'video_label' : 'image_label';

    return [
      {
        customization_spec: {
          publisher_platforms: ['facebook', 'instagram'],
          facebook_positions: ['story', 'facebook_reels'],
          instagram_positions: ['story', 'reels'],
        },
        [labelKey]: { name: 'vertical' },
      },
      {
        customization_spec: {
          publisher_platforms: ['facebook', 'instagram'],
          facebook_positions: ['feed'],
          instagram_positions: ['stream'],
        },
        [labelKey]: { name: 'quadrado' },
      },
      {
        customization_spec: {
          publisher_platforms: ['facebook'],
          facebook_positions: ['video_feeds', 'instream_video'],
        },
        [labelKey]: { name: 'horizontal' },
      },
    ];
  }

  private async uploadAssetGroup(
    assetGroup: MetaAdsDeployAssetGroup
  ): Promise<Record<VariantName, string>> {
    const uploads = {} as Record<VariantName, string>;

    for (const variant of REQUIRED_VARIANTS) {
      uploads[variant] = await this.uploadVariant(assetGroup.variants[variant]);
    }

    return uploads;
  }

  private async uploadVariant(variant: MetaAdsDeployVariant): Promise<string> {
    const bytes = await readFile(variant.filePath);
    const formData = new FormData();
    const mimeType = this.getMimeType(variant.fileName, variant.mediaType);
    const blob = new Blob([bytes], { type: mimeType });

    if (variant.mediaType === 'VIDEO') {
      formData.append('source', blob, variant.fileName);
      formData.append('name', path.parse(variant.fileName).name);
    } else {
      formData.append('filename', blob, variant.fileName);
    }

    const endpoint = `${this.runtime.adAccountId}/${variant.mediaType === 'VIDEO' ? 'advideos' : 'adimages'}`;
    const response = await this.metaClient.uploadFile(endpoint, formData);

    return this.extractUploadedAssetId(response.data, variant);
  }

  private extractUploadedAssetId(data: unknown, variant: MetaAdsDeployVariant): string {
    if (!data || typeof data !== 'object') {
      throw new ExternalApiError(`Upload response for ${variant.fileName} did not include data`);
    }

    if (variant.mediaType === 'VIDEO') {
      const maybeVideoId = (data as { id?: unknown }).id;
      if (typeof maybeVideoId === 'string' && maybeVideoId.length > 0) {
        return maybeVideoId;
      }
    } else {
      const maybeHash = (data as { hash?: unknown }).hash;
      if (typeof maybeHash === 'string' && maybeHash.length > 0) {
        return maybeHash;
      }

      const images = (data as { images?: Record<string, { hash?: string }> }).images;
      if (images && typeof images === 'object') {
        const firstImage = Object.values(images)[0];
        if (firstImage?.hash) {
          return firstImage.hash;
        }
      }
    }

    throw new ExternalApiError(`Could not extract uploaded asset ID for ${variant.fileName}`);
  }

  private registerAssetFile(params: {
    groups: Map<
      string,
      {
        name: string;
        mediaType?: MediaType;
        variants: Partial<Record<VariantName, MetaAdsDeployVariant>>;
      }
    >;
    groupName: string;
    filePath: string;
    fileName: string;
    explicitVariant?: VariantName;
  }) {
    const variant = params.explicitVariant || this.inferVariant(params.fileName);
    if (!variant) {
      return;
    }

    const mediaType = this.getMediaType(params.fileName);
    if (!mediaType) {
      return;
    }

    const groupKey = params.groupName.trim();
    const currentGroup = params.groups.get(groupKey) || {
      name: groupKey,
      variants: {},
    };

    if (currentGroup.mediaType && currentGroup.mediaType !== mediaType) {
      throw new ValidationError(`All variants in "${groupKey}" must have the same media type`);
    }

    if (currentGroup.variants[variant]) {
      throw new ValidationError(`Duplicate ${variant} asset found for "${groupKey}"`);
    }

    currentGroup.mediaType = mediaType;
    currentGroup.variants[variant] = {
      format: variant,
      fileName: params.fileName,
      filePath: params.filePath,
      mediaType,
    };

    params.groups.set(groupKey, currentGroup);
  }

  private parseFlatFileName(fileName: string): { groupName: string; variant: VariantName } | null {
    const fileExtension = path.extname(fileName).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(fileExtension) && !VIDEO_EXTENSIONS.has(fileExtension)) {
      return null;
    }

    const baseName = path.basename(fileName, fileExtension);
    const match = baseName.match(/^(.*?)[\s._-]+(vertical|horizontal|quadrado)$/i);
    if (!match) {
      return null;
    }

    return {
      groupName: match[1],
      variant: match[2].toLowerCase() as VariantName,
    };
  }

  private inferVariant(fileName: string): VariantName | null {
    const baseName = path.parse(fileName).name.toLowerCase();
    for (const variant of REQUIRED_VARIANTS) {
      if (baseName === variant || baseName.includes(variant)) {
        return variant;
      }
    }

    return null;
  }

  private getMediaType(fileName: string): MediaType | null {
    const extension = path.extname(fileName).toLowerCase();
    if (IMAGE_EXTENSIONS.has(extension)) {
      return 'IMAGE';
    }

    if (VIDEO_EXTENSIONS.has(extension)) {
      return 'VIDEO';
    }

    return null;
  }

  private getMimeType(fileName: string, mediaType: MediaType) {
    const extension = path.extname(fileName).toLowerCase();
    if (mediaType === 'IMAGE') {
      return extension === '.png' ? 'image/png' : 'image/jpeg';
    }

    if (extension === '.mov') {
      return 'video/quicktime';
    }

    return 'video/mp4';
  }

  private toSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private toMinorUnits(value: number): number {
    return Math.round(value * 100);
  }

  private requireId(data: unknown, entity: string): string {
    const id = data && typeof data === 'object' ? (data as { id?: unknown }).id : undefined;
    if (typeof id !== 'string' || id.length === 0) {
      throw new ExternalApiError(`Meta did not return an ID for the ${entity} request`);
    }

    return id;
  }

  private mapCampaignObjective(objective: CampaignObjective): string {
    switch (objective) {
      case 'TRAFFIC':
        return 'OUTCOME_TRAFFIC';
      case 'ENGAGEMENT':
        return 'OUTCOME_ENGAGEMENT';
      case 'LEAD_GENERATION':
        return 'OUTCOME_LEADS';
      case 'APP_INSTALLS':
        return 'OUTCOME_APP_PROMOTION';
      case 'CONVERSIONS':
        return 'OUTCOME_SALES';
      case 'VIDEO_VIEWS':
      case 'BRAND_AWARENESS':
      case 'REACH':
        return 'OUTCOME_AWARENESS';
      default:
        return objective;
    }
  }

  private mapAdSetObjective(objective: CampaignObjective): string {
    switch (objective) {
      case 'TRAFFIC':
      case 'CONVERSIONS':
      case 'LEAD_GENERATION':
        return 'LINK_CLICKS';
      case 'VIDEO_VIEWS':
        return 'VIDEO_VIEWS';
      case 'ENGAGEMENT':
        return 'POST_ENGAGEMENT';
      case 'APP_INSTALLS':
        return 'APP_INSTALLS';
      case 'BRAND_AWARENESS':
      case 'REACH':
        return 'IMPRESSIONS';
      default:
        return 'LINK_CLICKS';
    }
  }
}
