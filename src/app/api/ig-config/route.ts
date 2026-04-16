import { NextRequest, NextResponse } from 'next/server';
import {
  getMetaAppCredentials,
  readAppEnv,
  resolveAppBaseUrl,
  resolveInstagramRedirectUri,
} from '@/config/app-env.server';

const SCOPES = [
  'public_profile',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_metadata',
  'pages_messaging',
  'business_management',
  'instagram_basic',
  'instagram_manage_comments',
  'instagram_manage_messages',
  'instagram_content_publish',
  'instagram_manage_insights',
].join(',');


export async function GET(request: NextRequest) {
  const { clientId } = getMetaAppCredentials();
  if (!clientId) {
    console.error('[IG_CONFIG] Missing META_APP_ID/FACEBOOK_CLIENT_ID');
    return NextResponse.json(
      { error: 'Missing META_APP_ID/FACEBOOK_CLIENT_ID' },
      { status: 500 }
    );
  }

  const { META_API_VERSION } = readAppEnv();
  const baseUrl = resolveAppBaseUrl(process.env, request.nextUrl.origin);
  const redirectUri = resolveInstagramRedirectUri(process.env, baseUrl);
  const url = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${SCOPES}&response_type=code&display=popup`;

  console.log('[IG_CONFIG] Redirecionando para:', url);

  return NextResponse.redirect(url);
}
