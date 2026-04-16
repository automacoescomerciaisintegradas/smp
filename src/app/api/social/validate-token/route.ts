import { NextRequest, NextResponse } from 'next/server';
import type { ApiSuccessResponse, ApiErrorResponse, InstagramAccountInfo } from '@/types/social-api';
import { getMetaAppCredentials, readAppEnv } from '@/config/app-env.server';

const GRAPH_API_VERSION = 'v21.0';
const { META_API_VERSION, INSTAGRAM_ACCESS_TOKEN } = readAppEnv();
const FB_GRAPH_VERSION = META_API_VERSION;

type DebugTokenResponse = {
  data?: {
    app_id?: string;
    type?: string;
    is_valid?: boolean;
    expires_at?: number;
    data_access_expires_at?: number;
  };
  error?: { message?: string };
};

async function getTokenDebugInfo(accessToken: string) {
  const { clientId: appId, clientSecret: appSecret } = getMetaAppCredentials();

  if (!appId || !appSecret) return null;

  const appAccessToken = `${appId}|${appSecret}`;
  const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appAccessToken)}`;
  const response = await fetch(url);
  const data = (await response.json()) as DebugTokenResponse;

  if (!response.ok || !data?.data) return null;
  return data.data;
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    const token = accessToken || INSTAGRAM_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'Nenhum token fornecido' } },
        { status: 400 }
      );
    }

    const fields = 'id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography';
    const url = `https://graph.instagram.com/${GRAPH_API_VERSION}/me?fields=${fields}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: {
            message: data.error?.message || 'Token inválido ou expirado',
            code: data.error?.code,
            type: data.error?.type,
          },
        },
        { status: response.status }
      );
    }

    const account: InstagramAccountInfo = {
      id: data.id,
      username: data.username,
      name: data.name,
      profile_picture_url: data.profile_picture_url,
      followers_count: data.followers_count,
      follows_count: data.follows_count,
      media_count: data.media_count,
      biography: data.biography,
    };

    const debugInfo = await getTokenDebugInfo(token);
    if (debugInfo?.expires_at) {
      account.token_expires_at = debugInfo.expires_at;
    }
    if (debugInfo?.data_access_expires_at) {
      account.token_data_access_expires_at = debugInfo.data_access_expires_at;
    }

    return NextResponse.json<ApiSuccessResponse<InstagramAccountInfo>>(
      { success: true, data: account, timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiErrorResponse>(
      { error: { message: error instanceof Error ? error.message : 'Erro interno' } },
      { status: 500 }
    );
  }
}
