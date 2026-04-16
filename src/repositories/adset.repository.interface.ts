import { AdSet } from '@/types/sama';

export interface IAdSetRepository {
  create(data: {
    campaignId: string;
    name: string;
    targeting: Record<string, unknown>;
    placements: Array<Record<string, unknown>>;
    budget: Record<string, unknown>;
    schedule: { startTime: Date; endTime?: Date };
    optimizationGoal: string;
    bidStrategy: string;
    metaAdSetId?: string;
  }): Promise<AdSet>;

  findById(id: string): Promise<AdSet | null>;
  findByCampaignId(campaignId: string): Promise<AdSet[]>;
  findByMetaId(metaAdSetId: string): Promise<AdSet | null>;

  update(
    id: string,
    data: Partial<{
      name: string;
      status: string;
      metaAdSetId: string;
    }>
  ): Promise<AdSet>;

  delete(id: string): Promise<void>;

  updateMetaId(id: string, metaAdSetId: string): Promise<AdSet>;
}
