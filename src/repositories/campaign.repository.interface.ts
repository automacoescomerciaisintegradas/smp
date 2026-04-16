import { Campaign } from '@/types/sama';

export interface ICampaignRepository {
  create(data: {
    userId: string;
    name: string;
    objective: string;
    status: string;
    budget?: Record<string, unknown>;
    startTime?: Date;
    endTime?: Date;
    metaCampaignId?: string;
  }): Promise<Campaign>;

  findById(id: string): Promise<Campaign | null>;
  findByUserId(userId: string): Promise<Campaign[]>;
  findByMetaId(metaCampaignId: string): Promise<Campaign | null>;

  update(
    id: string,
    data: Partial<{
      name: string;
      status: string;
      budget: Record<string, unknown>;
      metaCampaignId: string;
    }>
  ): Promise<Campaign>;

  delete(id: string): Promise<void>;

  updateMetaId(id: string, metaCampaignId: string): Promise<Campaign>;
}
