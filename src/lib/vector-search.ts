type NullableString = string | null | undefined;

export type VectorSearchRow = {
  id: string;
  content_type?: NullableString;
  content_body?: NullableString;
  asset_url?: NullableString;
  tags?: string | string[] | null;
  created_at?: NullableString;
  vector_data?: string | number[] | null;
};

export type RankedVectorSearchResult = Omit<VectorSearchRow, 'tags' | 'vector_data'> & {
  tags: string[];
  relevance: number;
};

const STOP_WORDS = new Set([
  'a',
  'ao',
  'aos',
  'as',
  'com',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'na',
  'nas',
  'no',
  'nos',
  'o',
  'os',
  'para',
  'por',
  'sem',
  'um',
  'uma',
]);

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function normalizeText(value: NullableString) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeText(value: string) {
  const tokens = normalizeText(value)
    .split(' ')
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));

  return Array.from(new Set(tokens));
}

function normalizeTags(tags: VectorSearchRow['tags']) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(/[;,|]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function parseVectorData(vectorData: VectorSearchRow['vector_data']) {
  if (Array.isArray(vectorData)) {
    return vectorData.filter((value) => typeof value === 'number');
  }

  if (typeof vectorData !== 'string' || !vectorData.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(vectorData);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'number') : null;
  } catch {
    return null;
  }
}

function cosineSimilarity(a: number[], b: number[]) {
  const length = Math.min(a.length, b.length);
  if (!length) {
    return null;
  }

  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < length; index += 1) {
    dot += a[index] * b[index];
    magnitudeA += a[index] * a[index];
    magnitudeB += b[index] * b[index];
  }

  if (!magnitudeA || !magnitudeB) {
    return null;
  }

  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function toTimestamp(value: NullableString) {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function calculateKeywordScore(
  normalizedQuery: string,
  queryTokens: string[],
  row: VectorSearchRow,
  tags: string[]
) {
  if (!queryTokens.length) {
    return 0;
  }

  const body = normalizeText(row.content_body);
  const type = normalizeText(row.content_type);
  const normalizedTags = tags.map(normalizeText);
  const haystack = [body, type, ...normalizedTags].filter(Boolean).join(' ');

  if (!haystack) {
    return 0;
  }

  const tokenMatches = queryTokens.filter((token) => haystack.includes(token)).length;
  const tagMatches = queryTokens.filter((token) =>
    normalizedTags.some((tag) => tag.includes(token))
  ).length;
  const phraseBoost = normalizedQuery && haystack.includes(normalizedQuery) ? 0.2 : 0;
  const typeBoost = type && normalizedQuery.includes(type) ? 0.05 : 0;

  return clamp01(
    (tokenMatches / queryTokens.length) * 0.7 +
      (tagMatches / queryTokens.length) * 0.2 +
      phraseBoost +
      typeBoost
  );
}

type RankVectorSearchResultsParams = {
  query: string;
  queryVector?: number[] | null;
  items: VectorSearchRow[];
  limit?: number;
};

export function rankVectorSearchResults({
  query,
  queryVector,
  items,
  limit = 20,
}: RankVectorSearchResultsParams): RankedVectorSearchResult[] {
  const normalizedQuery = normalizeText(query);
  const queryTokens = tokenizeText(query);

  return items
    .map((item, index) => {
      const tags = normalizeTags(item.tags);
      const keywordScore = calculateKeywordScore(normalizedQuery, queryTokens, item, tags);
      const candidateVector = parseVectorData(item.vector_data);
      const vectorScore =
        queryVector && queryVector.length && candidateVector
          ? cosineSimilarity(queryVector, candidateVector)
          : null;

      const normalizedVectorScore =
        typeof vectorScore === 'number' ? clamp01((vectorScore + 1) / 2) : null;

      const relevance =
        normalizedVectorScore === null
          ? clamp01(Math.max(keywordScore, 0.12))
          : clamp01(normalizedVectorScore * 0.85 + keywordScore * 0.15);

      return {
        id: item.id,
        content_type: item.content_type,
        content_body: item.content_body,
        asset_url: item.asset_url,
        tags,
        created_at: item.created_at,
        relevance,
        sortDate: toTimestamp(item.created_at),
        sortIndex: index,
      };
    })
    .sort((left, right) => {
      if (right.relevance !== left.relevance) {
        return right.relevance - left.relevance;
      }

      if (right.sortDate !== left.sortDate) {
        return right.sortDate - left.sortDate;
      }

      return left.sortIndex - right.sortIndex;
    })
    .slice(0, limit)
    .map(({ sortDate: _sortDate, sortIndex: _sortIndex, ...item }) => item);
}
