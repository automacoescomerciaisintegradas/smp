import { Asset } from '@/types/sama';

export interface IAssetRepository {
  create(data: {
    userId: string;
    name: string;
    type: string;
    url: string;
    metadata: Record<string, unknown>;
    status: string;
    tags: string[];
  }): Promise<Asset>;

  findById(id: string): Promise<Asset | null>;
  findByUserId(userId: string): Promise<Asset[]>;
  findByMetaId(metaAssetId: string): Promise<Asset | null>;

  update(
    id: string,
    data: Partial<{
      name: string;
      status: string;
      metaAssetId: string;
      tags: string[];
      url: string;
    }>
  ): Promise<Asset>;

  delete(id: string): Promise<void>;

  findByTags(userId: string, tags: string[]): Promise<Asset[]>;
}
