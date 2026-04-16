import { AdInsight, CampaignInsight } from '@/types/sama';

export interface IInsightRepository {
  cacheInsights(data: {
    adId: string;
    metrics: Record<string, unknown>;
    period: { start: Date; end: Date };
  }): Promise<void>;

  getCachedInsights(adId: string): Promise<AdInsight | null>;

  getCampaignInsights(
    campaignId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      classification?: string;
    }
  ): Promise<CampaignInsight>;

  getTopPerformers(
    userId: string,
    options?: {
      limit?: number;
      startDate?: Date;
      endDate?: Date;
      classification?: 'WIN' | 'LOSS';
    }
  ): Promise<AdInsight[]>;

  deleteOldInsights(before: Date): Promise<number>;
}
