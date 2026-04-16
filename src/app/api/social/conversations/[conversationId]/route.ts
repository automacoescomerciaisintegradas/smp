import { NextRequest, NextResponse } from 'next/server';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/social-api';

const INSTAGRAM_GRAPH_API_VERSION = 'v21.0';
const DEFAULT_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const { searchParams } = new URL(req.url);
    const accessToken = searchParams.get('accessToken') || DEFAULT_TOKEN;
    const limit = searchParams.get('limit') || '20';
    const cursor = searchParams.get('cursor');

    if (!conversationId) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'conversationId é obrigatório' } },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'Token de acesso não configurado' } },
        { status: 401 }
      );
    }

    const fields = [
      'id',
      'comments.limit(' + limit + '){id,from,media,text,timestamp,like_count,replies.limit(5){id,from,text,timestamp}}',
    ];

    const paramsObj = new URLSearchParams({
      fields: fields.join(','),
    });

    if (cursor) {
      paramsObj.set('after', cursor);
    }

    const url = `https://graph.instagram.com/${INSTAGRAM_GRAPH_API_VERSION}/${conversationId}?${paramsObj.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: data.error?.message || 'Erro ao buscar detalhes da conversa',
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
    console.error('Erro ao obter detalhes da conversa:', error);

    const errorResponse: ApiErrorResponse = {
      error: {
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
      },
    };

    return NextResponse.json<ApiErrorResponse>(errorResponse, { status: 500 });
  }
}
