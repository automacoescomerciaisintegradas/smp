/**
 * SAMA - Meta Ads Automation Types and Interfaces
 */

// ========================
// Campaign Types
// ========================

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';

export type CampaignObjective =
  | 'CONVERSIONS'
  | 'TRAFFIC'
  | 'ENGAGEMENT'
  | 'LEAD_GENERATION'
  | 'APP_INSTALLS'
  | 'VIDEO_VIEWS'
  | 'BRAND_AWARENESS'
  | 'REACH';

export type BuyingType = 'AUCTION' | 'RESERVED';

export interface CreateCampaignDto {
  name: string;
  objective: CampaignObjective;
  buyingType?: BuyingType;
  budget?: {
    amount: number;
    currency: string;
    type: 'LIFETIME' | 'DAILY';
  };
  startTime?: Date;
  endTime?: Date;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  metaCampaignId?: string;
  budget?: {
    amount: number;
    currency: string;
    type: 'LIFETIME' | 'DAILY';
  };
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ========================
// AdSet Types
// ========================

export type OptimizationGoal = 'NONE' | 'LINK_CLICKS' | 'IMPRESSIONS' | 'REACH' | 'CONVERSIONS';

export type BidStrategy = 'LOWEST_COST_WITHOUT_CAP' | 'LOWEST_COST_WITH_BID_CAP' | 'COST_CAP' | 'TARGET_COST';

export interface Targeting {
  ageMin?: number;
  ageMax?: number;
  genders?: number[]; // 1 = male, 2 = female
  locations?: Array<{
    id: number;
    name: string;
  }>;
  interests?: Array<{
    id: number;
    name: string;
  }>;
  behaviors?: Array<{
    id: number;
    name: string;
  }>;
  customAudiences?: string[]; // Meta audience IDs
  lookalikeAudiences?: string[];
}

export interface PlacementConfig {
  platform: 'facebook' | 'instagram' | 'audience_network' | 'messenger';
  positions: ('feed' | 'stories' | 'reels' | 'instream_video' | 'search' | 'inbox')[];
}

export interface CreateAdSetDto {
  campaignId: string;
  name: string;
  targeting: Targeting;
  placements: PlacementConfig[];
  budget: {
    amount: number;
    currency: string;
    type: 'LIFETIME' | 'DAILY';
  };
  schedule: {
    startTime: Date;
    endTime?: Date;
  };
  optimizationGoal: OptimizationGoal;
  bidStrategy: BidStrategy;
  pixelId?: string;
}

export interface AdSet {
  id: string;
  campaignId: string;
  name: string;
  metaAdSetId?: string;
  targeting: Targeting;
  placements: PlacementConfig[];
  budget: {
    amount: number;
    currency: string;
    type: 'LIFETIME' | 'DAILY';
  };
  schedule: {
    startTime: Date;
    endTime?: Date;
  };
  optimizationGoal: OptimizationGoal;
  bidStrategy: BidStrategy;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

// ========================
// Ad Types
// ========================

export type AdFormat = 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'COLLECTION';

export type CallToAction =
  | 'LEARN_MORE'
  | 'SHOP_NOW'
  | 'SIGN_UP'
  | 'DOWNLOAD'
  | 'BOOK_NOW'
  | 'CONTACT_US'
  | 'APPLY_NOW'
  | 'PLAY_GAME'
  | 'INSTALL_APP'
  | 'OPEN_LINK';

export interface CreateAdDto {
  adSetId: string;
  name: string;
  creative: {
    mediaId: string; // Reference to asset
    primaryText: string;
    headline?: string;
    description?: string;
    callToAction: CallToAction;
    linkUrl: string;
  };
  trackingTemplate?: string;
  status?: 'ACTIVE' | 'PAUSED';
}

export interface Ad {
  id: string;
  adSetId: string;
  name: string;
  metaAdId?: string;
  creative: {
    mediaId: string;
    primaryText: string;
    headline?: string;
    description?: string;
    callToAction: CallToAction;
    linkUrl: string;
    mediaUrl?: string;
  };
  trackingTemplate?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========================
// Asset Types
// ========================

export type AssetType = 'IMAGE' | 'VIDEO';

export type AssetStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';

export interface AssetMetadata {
  width: number;
  height: number;
  fileSize: number;
  format: string;
  duration?: number; // For videos (seconds)
  thumbnailUrl?: string;
}

export interface Asset {
  id: string;
  userId: string;
  name: string;
  type: AssetType;
  url: string;
  metaAssetId?: string;
  metadata: AssetMetadata;
  status: AssetStatus;
  tags: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetVariation {
  id: string;
  assetId: string;
  platform: 'feed' | 'stories' | 'reels';
  url: string;
  metadata: AssetMetadata;
  createdAt: Date;
}

// ========================
// Insight Types
// ========================

export type PerformanceClassification = 'WIN' | 'LOSS' | 'NEUTRAL';

export interface InsightMetrics {
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpm: number; // Cost per mille
  cpa: number; // Cost per acquisition
  roas: number; // Return on ad spend
  frequency: number;
}

export interface AdInsight {
  adId: string;
  adName: string;
  campaignId: string;
  campaignName: string;
  metrics: InsightMetrics;
  classification: PerformanceClassification;
  score: number; // 0-100
  period: {
    start: Date;
    end: Date;
  };
}

export interface CampaignInsight {
  campaignId: string;
  campaignName: string;
  totalMetrics: InsightMetrics;
  adCount: number;
  adInsights: AdInsight[];
  topPerformers: AdInsight[];
  worstPerformers: AdInsight[];
}

// ========================
// Deploy Types
// ========================

export interface DeployConfig {
  campaign: CreateCampaignDto;
  adSets: CreateAdSetDto[];
  ads: CreateAdDto[];
  mode: 'DRAFT' | 'LIVE';
  dryRun?: boolean;
}

export interface DeployResult {
  success: boolean;
  campaign?: {
    id: string;
    metaCampaignId: string;
    name: string;
  };
  adSets: Array<{
    id: string;
    metaAdSetId: string;
    name: string;
  }>;
  ads: Array<{
    id: string;
    metaAdId: string;
    name: string;
  }>;
  errors?: Array<{
    level: 'campaign' | 'adset' | 'ad';
    message: string;
    originalError?: string;
  }>;
  deployedAt: Date;
}

export interface DeployValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ========================
// Meta API Types
// ========================

export interface MetaApiConfig {
  accessToken: string;
  adAccountId: string;
  businessId?: string;
  apiVersion: string;
  baseUrl: string;
}

export interface MetaApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    type: string;
    code: number;
    fbtraceId: string;
  };
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}
