import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  MetaAdsDeployService,
  type MetaAdsDeployRequest,
} from '../../src/services/meta/meta-ads-deploy.service';

async function createAdFolder(rootDir: string, folderName: string, extension = 'mp4') {
  const adDir = path.join(rootDir, folderName);
  await mkdir(adDir, { recursive: true });

  await Promise.all([
    writeFile(path.join(adDir, `vertical.${extension}`), 'video-vertical'),
    writeFile(path.join(adDir, `horizontal.${extension}`), 'video-horizontal'),
    writeFile(path.join(adDir, `quadrado.${extension}`), 'video-quadrado'),
  ]);
}

describe('MetaAdsDeployService', () => {
  let tempDir: string;
  let mockMetaClient: {
    post: ReturnType<typeof vi.fn>;
    uploadFile: ReturnType<typeof vi.fn>;
  };
  let service: MetaAdsDeployService;
  let request: MetaAdsDeployRequest;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'meta-ads-deploy-'));
    mockMetaClient = {
      post: vi.fn(),
      uploadFile: vi.fn(),
    };

    service = new MetaAdsDeployService(mockMetaClient as any, {
      adAccountId: 'act_123456789',
      pageId: '1234567890',
      instagramActorId: '987654321',
    });

    request = {
      sourceDir: tempDir,
      campaignName: 'Campanha Abril',
      adSetName: 'Conjunto Principal',
      objective: 'TRAFFIC',
      dailyBudget: 150,
      destinationUrl: 'https://example.com/oferta',
      primaryText: 'Texto principal do anuncio',
      headline: 'Headline principal',
      description: 'Descricao curta',
      cta: 'LEARN_MORE',
      countries: ['BR'],
      mode: 'DRAFT',
    };
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('agrupa 3 anuncios com os formatos obrigatorios', async () => {
    await createAdFolder(tempDir, 'anuncio-1');
    await createAdFolder(tempDir, 'anuncio-2');
    await createAdFolder(tempDir, 'anuncio-3');

    const groups = await service.collectAssetGroups(tempDir);

    expect(groups).toHaveLength(3);
    expect(groups.map(group => group.slug)).toEqual([
      'anuncio-1',
      'anuncio-2',
      'anuncio-3',
    ]);
    expect(groups[0].mediaType).toBe('VIDEO');
    expect(groups[0].variants.vertical.fileName).toBe('vertical.mp4');
    expect(groups[0].variants.horizontal.fileName).toBe('horizontal.mp4');
    expect(groups[0].variants.quadrado.fileName).toBe('quadrado.mp4');
  });

  it('gera um dry-run com 1 campanha, 1 conjunto e 3 anuncios logicos', async () => {
    await createAdFolder(tempDir, 'anuncio-1');
    await createAdFolder(tempDir, 'anuncio-2');
    await createAdFolder(tempDir, 'anuncio-3');

    const result = await service.deploy({
      ...request,
      dryRun: true,
    });

    expect(mockMetaClient.post).not.toHaveBeenCalled();
    expect(mockMetaClient.uploadFile).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.plan?.campaign.name).toBe('Campanha Abril');
    expect(result.plan?.adSet.name).toBe('Conjunto Principal');
    expect(result.plan?.ads).toHaveLength(3);
    expect(
      ((result.plan?.ads[0].creative as any).asset_feed_spec.asset_customization_rules as unknown[])
    ).toHaveLength(3);
  });

  it('faz deploy da campanha, do conjunto e dos 3 anuncios com upload das variacoes', async () => {
    await createAdFolder(tempDir, 'criativo-a');
    await createAdFolder(tempDir, 'criativo-b');
    await createAdFolder(tempDir, 'criativo-c');

    let uploadId = 0;
    mockMetaClient.uploadFile.mockImplementation(async () => ({
      success: true,
      data: { id: `video_${++uploadId}` },
    }));

    mockMetaClient.post
      .mockResolvedValueOnce({ success: true, data: { id: 'cmp_1' } })
      .mockResolvedValueOnce({ success: true, data: { id: 'adset_1' } })
      .mockResolvedValueOnce({ success: true, data: { id: 'creative_1' } })
      .mockResolvedValueOnce({ success: true, data: { id: 'ad_1' } })
      .mockResolvedValueOnce({ success: true, data: { id: 'creative_2' } })
      .mockResolvedValueOnce({ success: true, data: { id: 'ad_2' } })
      .mockResolvedValueOnce({ success: true, data: { id: 'creative_3' } })
      .mockResolvedValueOnce({ success: true, data: { id: 'ad_3' } });

    const result = await service.deploy(request);

    expect(mockMetaClient.uploadFile).toHaveBeenCalledTimes(9);
    expect(mockMetaClient.post).toHaveBeenNthCalledWith(
      1,
      'act_123456789/campaigns',
      expect.objectContaining({
        name: 'Campanha Abril',
      })
    );
    expect(mockMetaClient.post).toHaveBeenNthCalledWith(
      2,
      'act_123456789/adsets',
      expect.objectContaining({
        campaign_id: 'cmp_1',
        name: 'Conjunto Principal',
      })
    );
    expect(mockMetaClient.post).toHaveBeenNthCalledWith(
      3,
      'act_123456789/adcreatives',
      expect.objectContaining({
        name: 'criativo-a',
        asset_feed_spec: expect.objectContaining({
          videos: [
            expect.objectContaining({ video_id: 'video_1' }),
            expect.objectContaining({ video_id: 'video_2' }),
            expect.objectContaining({ video_id: 'video_3' }),
          ],
        }),
      })
    );
    expect(mockMetaClient.post).toHaveBeenNthCalledWith(
      4,
      'act_123456789/ads',
      expect.objectContaining({
        adset_id: 'adset_1',
        creative: { creative_id: 'creative_1' },
      })
    );
    expect(result.success).toBe(true);
    expect(result.campaign?.metaCampaignId).toBe('cmp_1');
    expect(result.adSet?.metaAdSetId).toBe('adset_1');
    expect(result.ads).toHaveLength(3);
  });

  it('falha quando um anuncio nao tem os 3 formatos obrigatorios', async () => {
    const adDir = path.join(tempDir, 'anuncio-incompleto');
    await mkdir(adDir, { recursive: true });
    await Promise.all([
      writeFile(path.join(adDir, 'vertical.mp4'), 'video-vertical'),
      writeFile(path.join(adDir, 'horizontal.mp4'), 'video-horizontal'),
    ]);

    await expect(service.collectAssetGroups(tempDir)).rejects.toThrow(
      'must include vertical, horizontal, and quadrado'
    );
  });
});
