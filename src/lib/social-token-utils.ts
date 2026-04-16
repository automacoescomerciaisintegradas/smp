import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/social-api';

export interface TokenValidationResult {
  isValid: boolean;
  data?: {
    app_id: string;
    type: string;
    application: string;
    data_access_expires_at: number;
    expires_at: number;
    is_valid: boolean;
    scopes: string[];
    user_id: string;
  };
  error?: string;
}

export interface TokenRefreshResult {
  success: boolean;
  accessToken?: string;
  expiresIn?: number;
  error?: string;
}

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

/**
 * Valida um token de acesso da Meta/Facebook
 */
export async function validateAccessToken(
  accessToken: string
): Promise<TokenValidationResult> {
  try {
    const url = `${GRAPH_API_BASE}/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
    
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        isValid: false,
        error: data.error?.message || 'Token inválido',
      };
    }

    return {
      isValid: data.data?.is_valid || false,
      data: data.data,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Erro ao validar token',
    };
  }
}

/**
 * Refresh de um token de acesso de longa duração
 * Tokens de longa duração expiram em 60 dias
 */
export async function refreshLongLivedToken(
  accessToken: string
): Promise<TokenRefreshResult> {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      return {
        success: false,
        error: 'FACEBOOK_APP_ID e FACEBOOK_APP_SECRET devem estar configurados',
      };
    }

    const url = `${GRAPH_API_BASE}/oauth/access_token?
      grant_type=fb_exchange_token&
      client_id=${appId}&
      client_secret=${appSecret}&
      fb_exchange_token=${accessToken}`;

    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Erro ao fazer refresh do token',
      };
    }

    return {
      success: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao fazer refresh do token',
    };
  }
}

/**
 * Verifica se um token está próximo da expiração (menos de 7 dias)
 */
export async function isTokenExpiringSoon(accessToken: string): Promise<boolean> {
  const validation = await validateAccessToken(accessToken);
  
  if (!validation.isValid || !validation.data) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  const sevenDays = 7 * 24 * 60 * 60; // 7 dias em segundos
  
  return validation.data.expires_at - now < sevenDays;
}

/**
 * Renova automaticamente o token se estiver prestes a expirar
 */
export async function autoRefreshToken(
  accessToken: string
): Promise<{ token: string; refreshed: boolean; error?: string }> {
  const shouldRefresh = await isTokenExpiringSoon(accessToken);

  if (!shouldRefresh) {
    return { token: accessToken, refreshed: false };
  }

  const refreshResult = await refreshLongLivedToken(accessToken);

  if (!refreshResult.success || !refreshResult.accessToken) {
    return {
      token: accessToken,
      refreshed: false,
      error: refreshResult.error || 'Falha ao renovar token',
    };
  }

  return {
    token: refreshResult.accessToken,
    refreshed: true,
  };
}

/**
 * Middleware para validar token em rotas API
 */
export function requireValidToken(accessToken: string | undefined): 
  | { valid: true; token: string }
  | { valid: false; response: Response } {
  
  if (!accessToken) {
    return {
      valid: false,
      response: new Response(
        JSON.stringify({ error: { message: 'Token de acesso não fornecido' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return { valid: true, token: accessToken };
}
