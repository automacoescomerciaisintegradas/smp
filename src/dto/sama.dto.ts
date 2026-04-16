import { z } from 'zod';

// ========================
// Campaign DTOs
// ========================

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100),
  objective: z.enum([
    'CONVERSIONS',
    'TRAFFIC',
    'ENGAGEMENT',
    'LEAD_GENERATION',
    'APP_INSTALLS',
    'VIDEO_VIEWS',
    'BRAND_AWARENESS',
    'REACH',
  ]),
  buyingType: z.enum(['AUCTION', 'RESERVED']).optional().default('AUCTION'),
  budget: z.object({
    amount: z.number().positive('Budget must be positive'),
    currency: z.string().default('BRL'),
    type: z.enum(['LIFETIME', 'DAILY']),
  }).optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
  budget: z.object({
    amount: z.number().positive(),
    currency: z.string(),
    type: z.enum(['LIFETIME', 'DAILY']),
  }).optional(),
});

export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

// ========================
// AdSet DTOs
// ========================

export const createAdSetSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID'),
  name: z.string().min(1).max(100),
  targeting: z.object({
    ageMin: z.number().min(13).max(65).optional(),
    ageMax: z.number().min(13).max(65).optional(),
    genders: z.array(z.number()).optional(),
    locations: z.array(z.object({
      id: z.number(),
      name: z.string(),
    })).optional(),
    interests: z.array(z.object({
      id: z.number(),
      name: z.string(),
    })).optional(),
    customAudiences: z.array(z.string()).optional(),
    lookalikeAudiences: z.array(z.string()).optional(),
  }),
  placements: z.array(z.object({
    platform: z.enum(['facebook', 'instagram', 'audience_network', 'messenger']),
    positions: z.array(z.enum(['feed', 'stories', 'reels', 'instream_video', 'search', 'inbox'])),
  })),
  budget: z.object({
    amount: z.number().positive(),
    currency: z.string().default('BRL'),
    type: z.enum(['LIFETIME', 'DAILY']),
  }),
  schedule: z.object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date().optional(),
  }),
  optimizationGoal: z.enum([
    'NONE',
    'LINK_CLICKS',
    'IMPRESSIONS',
    'REACH',
    'CONVERSIONS',
  ]),
  bidStrategy: z.enum([
    'LOWEST_COST_WITHOUT_CAP',
    'LOWEST_COST_WITH_BID_CAP',
    'COST_CAP',
    'TARGET_COST',
  ]),
  pixelId: z.string().optional(),
});

export type CreateAdSetInput = z.infer<typeof createAdSetSchema>;

// ========================
// Ad DTOs
// ========================

export const createAdSchema = z.object({
  adSetId: z.string().uuid('Invalid adSet ID'),
  name: z.string().min(1).max(100),
  creative: z.object({
    mediaId: z.string(),
    primaryText: z.string().min(1).max(5000),
    headline: z.string().max(100).optional(),
    description: z.string().max(100).optional(),
    callToAction: z.enum([
      'LEARN_MORE',
      'SHOP_NOW',
      'SIGN_UP',
      'DOWNLOAD',
      'BOOK_NOW',
      'CONTACT_US',
      'APPLY_NOW',
      'PLAY_GAME',
      'INSTALL_APP',
      'OPEN_LINK',
    ]),
    linkUrl: z.string().url('Invalid URL'),
  }),
  trackingTemplate: z.string().url().optional(),
  status: z.enum(['ACTIVE', 'PAUSED']).optional().default('ACTIVE'),
});

export type CreateAdInput = z.infer<typeof createAdSchema>;

// ========================
// Deploy DTOs
// ========================

export const deploySchema = z.object({
  campaign: createCampaignSchema,
  adSets: z.array(createAdSetSchema).min(1, 'At least one adSet is required'),
  ads: z.array(createAdSchema).min(1, 'At least one ad is required'),
  mode: z.enum(['DRAFT', 'LIVE']),
  dryRun: z.boolean().optional().default(false),
});

export type DeployInput = z.infer<typeof deploySchema>;

// ========================
// Insight DTOs
// ========================

export const fetchInsightsSchema = z.object({
  campaignId: z.string().optional(),
  adId: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  metrics: z.array(z.string()).optional(),
});

export type FetchInsightsInput = z.infer<typeof fetchInsightsSchema>;

// ========================
// Asset DTOs
// ========================

export const uploadAssetSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['IMAGE', 'VIDEO']),
  tags: z.array(z.string()).optional(),
});

export type UploadAssetInput = z.infer<typeof uploadAssetSchema>;
