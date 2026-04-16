import { NextRequest, NextResponse } from 'next/server';
import type { InstagramConversationsResponse, ApiSuccessResponse, ApiErrorResponse } from '@/types/social-api';

const INSTAGRAM_GRAPH_API_VERSION = 'v21.0';
const DEFAULT_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accessToken = searchParams.get('accessToken') || DEFAULT_TOKEN;
    const limit = searchParams.get('limit') || '10';
    const cursor = searchParams.get('cursor');

    if (!accessToken) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'Token de acesso não configurado' } },
        { status: 401 }
      );
    }

    const params = new URLSearchParams({
      fields: 'id,comments.limit(5)',
      limit,
    });

    if (cursor) {
      params.set('after', cursor);
    }

    const url = `https://graph.instagram.com/${INSTAGRAM_GRAPH_API_VERSION}/me/conversations?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data: InstagramConversationsResponse = await response.json();

    if (!response.ok) {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: (data.error as any)?.message || 'Erro ao buscar conversas',
          code: (data.error as any)?.code,
          type: (data.error as any)?.type,
        },
      };

      return NextResponse.json<ApiErrorResponse>(errorResponse, { status: response.status });
    }

    const successResponse: ApiSuccessResponse<InstagramConversationsResponse> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json<ApiSuccessResponse<InstagramConversationsResponse>>(successResponse, { status: 200 });

  } catch (error) {
    console.error('Erro ao listar conversas Instagram:', error);

    const errorResponse: ApiErrorResponse = {
      error: {
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
      },
    };

    return NextResponse.json<ApiErrorResponse>(errorResponse, { status: 500 });
  }
}
