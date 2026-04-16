import { NextRequest, NextResponse } from 'next/server';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/social-api';

const FACEBOOK_GRAPH_API_VERSION = 'v21.0';
const DEFAULT_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

interface FacebookMessageRequest {
  recipientId: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  quickReplies?: Array<{
    content_type: 'text' | 'location';
    title: string;
    payload: string;
  }>;
  accessToken?: string;
}

function validateFacebookMessageRequest(body: Partial<FacebookMessageRequest>): { valid: boolean; error?: string } {
  if (!body.recipientId) {
    return { valid: false, error: 'recipientId (PSID) é obrigatório' };
  }

  if (!body.text && !body.imageUrl && !body.videoUrl) {
    return { valid: false, error: 'Pelo menos um conteúdo deve ser fornecido (text, imageUrl ou videoUrl)' };
  }

  return { valid: true };
}

function buildFacebookMessagePayload(body: FacebookMessageRequest): Record<string, unknown> {
  const message: Record<string, unknown> = {};

  if (body.text) {
    message.text = body.text;

    if (body.quickReplies && body.quickReplies.length > 0) {
      message.quick_replies = body.quickReplies;
    }
  } else if (body.imageUrl) {
    message.attachment = {
      type: 'image',
      payload: { url: body.imageUrl },
    };
  } else if (body.videoUrl) {
    message.attachment = {
      type: 'video',
      payload: { url: body.videoUrl },
    };
  }

  return {
    messaging_product: 'RESPONSE',
    recipient: { id: body.recipientId },
    message,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<FacebookMessageRequest>;

    const validation = validateFacebookMessageRequest(body);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: validation.error || 'Validação falhou' } },
        { status: 400 }
      );
    }

    const token = body.accessToken || DEFAULT_TOKEN;
    if (!token) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'Token de acesso não configurado. Forneça accessToken no body ou configure FACEBOOK_PAGE_ACCESS_TOKEN' } },
        { status: 401 }
      );
    }

    const payload = buildFacebookMessagePayload(body as FacebookMessageRequest);
    const pageId = body.recipientId; // Na prática, você pode precisar extrair isso de outro lugar

    const url = `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${pageId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: data.error?.message || 'Erro na API do Facebook',
          code: data.error?.code,
          type: data.error?.type,
          fbtrace_id: data.error?.fbtrace_id,
        },
      };

      return NextResponse.json<ApiErrorResponse>(errorResponse, { status: response.status });
    }

    const successResponse: ApiSuccessResponse<typeof data> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json<ApiSuccessResponse<typeof data>>(successResponse, { status: 200 });

  } catch (error) {
    console.error('Erro ao enviar mensagem Facebook:', error);

    const errorResponse: ApiErrorResponse = {
      error: {
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
      },
    };

    return NextResponse.json<ApiErrorResponse>(errorResponse, { status: 500 });
  }
}
