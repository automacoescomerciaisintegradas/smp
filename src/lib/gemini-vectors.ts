import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";

type EnvSource = Readonly<Record<string, string | undefined>>;

type VectorStoreRuntime = {
  accountId: string;
  databaseId: string;
  token: string;
};

const DEFAULT_DIMENSIONS = 768;
const EMBEDDING_MODELS = [
  "gemini-embedding-001",
  "embedding-001",
  "text-embedding-004",
] as const;

function trimEnvValue(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function isPlaceholderValue(value?: string) {
  if (!value) {
    return true;
  }

  const normalized = value.toLowerCase();
  return (
    normalized.includes("placeholder") ||
    normalized.includes("seu_") ||
    normalized.includes("sua_") ||
    normalized.endsWith("_aqui")
  );
}

function isLikelyCloudflareAccountId(value?: string) {
  return Boolean(value && /^[a-f0-9]{32}$/i.test(value));
}

function getGeminiApiKey(env: EnvSource = process.env) {
  const apiKey = trimEnvValue(env.GEMINI_API_KEY) || trimEnvValue(env.GOOGLE_API_KEY);

  if (!apiKey || isPlaceholderValue(apiKey)) {
    throw new Error("GEMINI_API_KEY não configurada.");
  }

  return apiKey;
}

function getGenAI(env: EnvSource = process.env) {
  return new GoogleGenerativeAI(getGeminiApiKey(env));
}

export function resolveVectorStoreRuntime(env: EnvSource = process.env): VectorStoreRuntime | null {
  const primaryAccountId = trimEnvValue(env.CLOUDFLARE_ACCOUNT_ID);
  const fallbackAccountId = trimEnvValue(env.R2_ACCOUNT_ID);
  const accountId = isLikelyCloudflareAccountId(primaryAccountId)
    ? primaryAccountId
    : isLikelyCloudflareAccountId(fallbackAccountId)
      ? fallbackAccountId
      : undefined;
  const databaseId = trimEnvValue(env.CLOUDFLARE_DATABASE_ID);
  const token = trimEnvValue(env.CLOUDFLARE_D1_TOKEN);

  if (!accountId || !databaseId || !token) {
    return null;
  }

  if (isPlaceholderValue(databaseId) || isPlaceholderValue(token)) {
    return null;
  }

  return {
    accountId,
    databaseId,
    token,
  };
}

async function generateEmbeddingWithModel(
  modelName: string,
  text: string,
  taskType: TaskType,
  env: EnvSource
) {
  const model = getGenAI(env).getGenerativeModel(
    { model: modelName },
    { apiVersion: "v1beta", timeout: 20000 }
  );

  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    taskType,
  });

  const values = result.embedding?.values;

  if (!Array.isArray(values) || !values.length) {
    throw new Error(`Resposta de embedding vazia para ${modelName}.`);
  }

  return values;
}

/**
 * Gera embeddings com fallback entre modelos compatíveis do Gemini.
 * @param text O conteúdo para converter
 * @param dimensions O tamanho do vetor (ex: 768, 512, 256). Otimiza o uso de armazenamento no D1.
 */
export async function generateEmbedding(
  text: string,
  dimensions: number = DEFAULT_DIMENSIONS,
  taskType: TaskType = TaskType.RETRIEVAL_QUERY,
  env: EnvSource = process.env
) {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return [];
  }

  const normalizedDimensions = Math.max(128, Math.min(3072, Math.trunc(dimensions || DEFAULT_DIMENSIONS)));
  let lastError: unknown;

  for (const modelName of EMBEDDING_MODELS) {
    try {
      const values = await generateEmbeddingWithModel(modelName, normalizedText, taskType, env);
      return values.slice(0, normalizedDimensions);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Falha ao gerar embedding.");
}

/**
 * Salva o vetor e metadados no Cloudflare D1 via API REST
 */
export async function saveToVectorStore({
  id,
  type,
  content,
  url,
  tags,
  dimensions = 768
}: {
  id: string,
  type: 'text' | 'video' | 'image' | 'doc',
  content: string,
  url?: string,
  tags?: string[],
  dimensions?: number
}) {
  const vector = await generateEmbedding(
    content,
    dimensions,
    TaskType.RETRIEVAL_DOCUMENT
  );
  const runtime = resolveVectorStoreRuntime();

  if (!runtime) {
    throw new Error("Cloudflare D1 não configurado.");
  }
  
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${runtime.accountId}/d1/database/${runtime.databaseId}/query`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${runtime.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql: "INSERT INTO creao_vector_store (id, content_type, content_body, asset_url, vector_data, tags) VALUES (?, ?, ?, ?, ?, ?)",
        params: [
          id,
          type,
          content,
          url || null,
          JSON.stringify(vector), // Armazenando como string JSON para compatibilidade simples
          tags ? tags.join(',') : null
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Falha ao salvar no Cloudflare D1: ${response.status}`);
  }

  return response.json();
}
