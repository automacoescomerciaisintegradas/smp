import { NextResponse } from "next/server";
import { TaskType } from "@google/generative-ai";
import { generateEmbedding, resolveVectorStoreRuntime } from "@/lib/gemini-vectors";
import { rankVectorSearchResults, type VectorSearchRow } from "@/lib/vector-search";

type CloudflareD1QueryResponse = {
  success?: boolean;
  errors?: Array<{ message?: string }>;
  messages?: Array<{ message?: string }>;
  result?: Array<{
    results?: VectorSearchRow[];
  }>;
};

const DEFAULT_DIMENSIONS = 768;
const D1_QUERY_LIMIT = 100;
const SEARCH_SQL = `
  SELECT id, content_type, content_body, asset_url, vector_data, tags, created_at
  FROM creao_vector_store
  ORDER BY created_at DESC
  LIMIT ${D1_QUERY_LIMIT}
`;

function getCloudflareRows(payload: CloudflareD1QueryResponse) {
  return Array.isArray(payload.result?.[0]?.results) ? payload.result[0].results : [];
}

function getCloudflareErrorMessage(response: Response, payload: CloudflareD1QueryResponse | null) {
  const payloadMessage =
    payload?.errors?.find((item) => item.message)?.message ||
    payload?.messages?.find((item) => item.message)?.message;

  const normalizedMessage = payloadMessage?.toLowerCase() || "";

  if (normalizedMessage.includes("authentication error")) {
    return "Falha de autenticação no Cloudflare D1. Revise CLOUDFLARE_D1_TOKEN, CLOUDFLARE_DATABASE_ID e o account id usado pela aplicação.";
  }

  if (normalizedMessage.includes("permission")) {
    return "A aplicação não tem permissão para consultar o Cloudflare D1. Revise as credenciais e escopos do token.";
  }

  return payloadMessage || `Falha ao consultar a base vetorial (${response.status}).`;
}

export async function POST(req: Request) {
  try {
    let body: { query?: unknown; dimensions?: unknown };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Body JSON inválido." }, { status: 400 });
    }

    const query = typeof body.query === "string" ? body.query.trim() : "";
    const dimensions =
      typeof body.dimensions === "number" && Number.isFinite(body.dimensions)
        ? Math.trunc(body.dimensions)
        : DEFAULT_DIMENSIONS;

    if (!query) {
      return NextResponse.json({ error: "A consulta é obrigatória." }, { status: 400 });
    }

    const runtime = resolveVectorStoreRuntime();
    if (!runtime) {
      return NextResponse.json(
        { error: "Busca vetorial não configurada. Revise as variáveis do Cloudflare D1." },
        { status: 503 }
      );
    }

    let queryVector: number[] | null = null;
    let mode: "embedding" | "fallback" = "fallback";
    let warning: string | undefined;

    try {
      queryVector = await generateEmbedding(query, dimensions, TaskType.RETRIEVAL_QUERY);
      mode = "embedding";
    } catch (error) {
      warning = "Embeddings indisponíveis no momento. A busca usou fallback textual.";
      console.error("Erro ao gerar embedding de busca:", error);
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
          sql: SEARCH_SQL,
          params: [],
        }),
        cache: "no-store",
      }
    );

    let data: CloudflareD1QueryResponse | null = null;

    try {
      data = (await response.json()) as CloudflareD1QueryResponse;
    } catch {
      data = null;
    }

    if (!response.ok || !data || data.success === false || (data.errors?.length ?? 0) > 0) {
      const message = getCloudflareErrorMessage(response, data);
      console.error("Erro ao consultar Cloudflare D1:", message, data?.errors);
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const rows = getCloudflareRows(data);
    const results = rankVectorSearchResults({
      query,
      queryVector,
      items: rows,
    });

    return NextResponse.json({
      query,
      mode,
      warning,
      results,
    });

  } catch (error) {
    console.error("Erro na busca vetorial:", error);
    return NextResponse.json({ error: "Falha na busca semântica." }, { status: 500 });
  }
}
