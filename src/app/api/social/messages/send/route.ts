import { NextRequest, NextResponse } from 'next/server';
import type { InstagramMessageRequest, ApiSuccessResponse, ApiErrorResponse } from '@/types/social-api';

const INSTAGRAM_GRAPH_API_VERSION = 'v21.0';
const DEFAULT_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

function validateMessageRequest(body: Partial<InstagramMessageRequest>): { valid: boolean; error?: string } {
  if (!body.recipientId) {
    return { valid: false, error: 'recipientId é obrigatório' };
  }

  if (!body.text && !body.imageUrl && !body.videoUrl && !body.attachmentId) {
    return { valid: false, error: 'Pelo menos um conteúdo deve ser fornecido (text, imageUrl, videoUrl ou attachmentId)' };
  }

  return { valid: true };
}

function buildMessagePayload(body: InstagramMessageRequest): Record<string, unknown> {
  const message: Record<string, unknown> = {};
  const recipient = { id: body.recipientId };

  if (body.text) {
    message.text = body.text;
  } else if (body.imageUrl) {
    message.attachment = { type: 'IMAGE', payload: { url: body.imageUrl } };
  } else if (body.videoUrl) {
    message.attachment = { type: 'VIDEO', payload: { url: body.videoUrl } };
  } else if (body.attachmentId) {
    message.attachment = { attachment_id: body.attachmentId };
  }

  return {
    message,
    recipient,
    messaging_product: 'instagram',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<InstagramMessageRequest>;

    const validation = validateMessageRequest(body);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: validation.error || 'Validação falhou' } },
        { status: 400 }
      );
    }

    const token = body.accessToken || DEFAULT_TOKEN;
    if (!token) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'Token de acesso não configurado. Forneça accessToken no body ou configure INSTAGRAM_ACCESS_TOKEN' } },
        { status: 401 }
      );
    }

    const payload = buildMessagePayload(body as InstagramMessageRequest);
    const url = `https://graph.instagram.com/${INSTAGRAM_GRAPH_API_VERSION}/me/messages`;

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
          message: data.error?.message || 'Erro na API do Instagram',
          code: data.error?.code,
          type: data.error?.type,
          fbtrace_id: data.error?.fbtrace_id,
        },
      };

      return NextResponse.json<ApiErrorResponse>(errorResponse, { status: response.status });
    }

    const successResponse: ApiSuccessResponse = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json<ApiSuccessResponse>(successResponse, { status: 200 });

  } catch (error) {
    console.error('Erro ao enviar mensagem Instagram:', error);
    
    const errorResponse: ApiErrorResponse = {
      error: {
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
      },
    };

    return NextResponse.json<ApiErrorResponse>(errorResponse, { status: 500 });
  }
}
