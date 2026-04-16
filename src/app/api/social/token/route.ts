import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken, refreshLongLivedToken, isTokenExpiringSoon, autoRefreshToken } from '@/lib/social-token-utils';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/social-api';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, action } = await req.json();

    if (!accessToken) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'accessToken é obrigatório' } },
        { status: 400 }
      );
    }

    // Ação padrão é validar o token
    const actionType = action || 'validate';

    if (actionType === 'validate') {
      const validation = await validateAccessToken(accessToken);

      if (!validation.isValid) {
        return NextResponse.json<ApiErrorResponse>(
          { error: { message: validation.error || 'Token inválido' } },
          { status: 401 }
        );
      }

      const response: ApiSuccessResponse<typeof validation.data> = {
        success: true,
        data: validation.data!,
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json<ApiSuccessResponse<typeof validation.data>>(response);
    }

    if (actionType === 'refresh') {
      const refreshResult = await refreshLongLivedToken(accessToken);

      if (!refreshResult.success) {
        return NextResponse.json<ApiErrorResponse>(
          { error: { message: refreshResult.error || 'Falha ao renovar token' } },
          { status: 400 }
        );
      }

      const response: ApiSuccessResponse<{ accessToken: string; expiresIn?: number }> = {
        success: true,
        data: {
          accessToken: refreshResult.accessToken!,
          expiresIn: refreshResult.expiresIn,
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json<ApiSuccessResponse<{ accessToken: string; expiresIn?: number }>>(response);
    }

    if (actionType === 'check-expiration') {
      const expiringSoon = await isTokenExpiringSoon(accessToken);

      const response: ApiSuccessResponse<{ expiringSoon: boolean }> = {
        success: true,
        data: { expiringSoon },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json<ApiSuccessResponse<{ expiringSoon: boolean }>>(response);
    }

    if (actionType === 'auto-refresh') {
      const result = await autoRefreshToken(accessToken);

      const response: ApiSuccessResponse<{ token: string; refreshed: boolean }> = {
        success: true,
        data: {
          token: result.token,
          refreshed: result.refreshed,
        },
        timestamp: new Date().toISOString(),
      };

      if (result.error) {
        (response as any).warning = result.error;
      }

      return NextResponse.json<ApiSuccessResponse<{ token: string; refreshed: boolean }>>(response);
    }

    return NextResponse.json<ApiErrorResponse>(
      { error: { message: `Ação '${actionType}' não reconhecida. Use: validate, refresh, check-expiration ou auto-refresh` } },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro ao gerenciar token:', error);

    return NextResponse.json<ApiErrorResponse>(
      { error: { message: error instanceof Error ? error.message : 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}
