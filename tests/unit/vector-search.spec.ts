import { describe, expect, it } from 'vitest';
import { rankVectorSearchResults } from '@/lib/vector-search';
import { resolveVectorStoreRuntime } from '@/lib/gemini-vectors';

describe('rankVectorSearchResults', () => {
  it('prioriza o item semanticamente mais próximo quando vetores estão disponíveis', () => {
    const results = rankVectorSearchResults({
      query: 'videos de bastidores',
      queryVector: [1, 0, 0],
      items: [
        {
          id: 'video-1',
          content_type: 'video',
          content_body: 'Bastidores da gravação com luz quente',
          tags: 'bastidores,video',
          vector_data: JSON.stringify([0.98, 0.02, 0]),
        },
        {
          id: 'doc-1',
          content_type: 'doc',
          content_body: 'Planilha financeira trimestral',
          tags: 'financeiro,relatorio',
          vector_data: JSON.stringify([0, 1, 0]),
        },
      ],
    });

    expect(results[0]?.id).toBe('video-1');
    expect(results[0]?.relevance).toBeGreaterThan(results[1]?.relevance ?? 0);
  });

  it('faz fallback textual quando não há vetores válidos', () => {
    const results = rankVectorSearchResults({
      query: 'iluminacao quente para reels',
      items: [
        {
          id: 'video-1',
          content_type: 'video',
          content_body: 'Bastidores com iluminação quente para reels',
          tags: 'reels,iluminacao,bastidores',
        },
        {
          id: 'image-1',
          content_type: 'image',
          content_body: 'Foto de produto com fundo branco',
          tags: 'catalogo,ecommerce',
        },
      ],
    });

    expect(results[0]?.id).toBe('video-1');
    expect(results[0]?.relevance).toBeGreaterThan(results[1]?.relevance ?? 0);
  });
});

describe('resolveVectorStoreRuntime', () => {
  it('usa R2_ACCOUNT_ID como fallback quando CLOUDFLARE_ACCOUNT_ID é placeholder', () => {
    const runtime = resolveVectorStoreRuntime({
      CLOUDFLARE_ACCOUNT_ID: 'seu_account_id_aqui',
      R2_ACCOUNT_ID: '62e8a90b2b0a16b3b8c4098924d1a273',
      CLOUDFLARE_DATABASE_ID: '81008620-4494-47d9-8180-ed2f99b838f5',
      CLOUDFLARE_D1_TOKEN: 'token-valido',
    });

    expect(runtime).toEqual({
      accountId: '62e8a90b2b0a16b3b8c4098924d1a273',
      databaseId: '81008620-4494-47d9-8180-ed2f99b838f5',
      token: 'token-valido',
    });
  });
});
