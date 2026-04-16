import { Ad } from '@/types/sama';

export interface IAdRepository {
  create(data: {
    adSetId: string;
    name: string;
    creative: Record<string, unknown>;
    status: string;
    trackingTemplate?: string;
    metaAdId?: string;
  }): Promise<Ad>;

  findById(id: string): Promise<Ad | null>;
  findByAdSetId(adSetId: string): Promise<Ad[]>;
  findByMetaId(metaAdId: string): Promise<Ad | null>;

  update(
    id: string,
    data: Partial<{
      name: string;
      status: string;
      creative: Record<string, unknown>;
      metaAdId: string;
      rejectionReason: string;
    }>
  ): Promise<Ad>;

  delete(id: string): Promise<void>;

  updateMetaId(id: string, metaAdId: string): Promise<Ad>;
}
