/**
 * ACI Meta API Utility
 * Provides methods for validating tokens, checking permissions, and health checks.
 */

export interface MetaHealthCheckResult {
  status: 'healthy' | 'unhealthy';
  details: {
    token: { status: 'ok' | 'error'; message: string };
    permissions: { status: 'ok' | 'error'; missing: string[] };
    business_account: { status: 'ok' | 'error'; id?: string; name?: string; username?: string };
  };
}

const REQUIRED_PERMISSIONS = [
  'instagram_basic',
  'instagram_manage_messages',
  'instagram_manage_comments',
  'pages_show_list',
  'pages_read_engagement'
];

export async function checkMetaHealth(token: string): Promise<MetaHealthCheckResult> {
  const apiVersion = process.env.META_API_VERSION || 'v23.0';
  const baseUrl = 'https://graph.facebook.com'; // Use FB Graph for Business accounts
  
  const result: MetaHealthCheckResult = {
    status: 'healthy',
    details: {
      token: { status: 'ok', message: 'Token válido' },
      permissions: { status: 'ok', missing: [] },
      business_account: { status: 'ok' },
    },
  };

  try {
    // 1. Validate Token & Get User Info
    const meRes = await fetch(`${baseUrl}/${apiVersion}/me?fields=id,name&access_token=${token}`);
    const meData = await meRes.json();

    if (!meRes.ok) {
      result.status = 'unhealthy';
      result.details.token = { status: 'error', message: meData?.error?.message || 'Falha ao validar token' };
      return result;
    }

    result.details.business_account.id = meData.id;
    result.details.business_account.name = meData.name;

    // 2. Check Permissions
    const permRes = await fetch(`${baseUrl}/${apiVersion}/me/permissions?access_token=${token}`);
    const permData = await permRes.json();

    if (permRes.ok && permData.data) {
      const grantedPermissions = permData.data
        .filter((p: any) => p.status === 'granted')
        .map((p: any) => p.permission);

      const missing = REQUIRED_PERMISSIONS.filter(p => !grantedPermissions.includes(p));
      
      if (missing.length > 0) {
        result.status = 'unhealthy';
        result.details.permissions = { status: 'error', missing };
      }
    }

    // 3. Try to find an Instagram Account linked to this user/page
    // Usually we need to check accounts (pages) first
    const accountsRes = await fetch(`${baseUrl}/${apiVersion}/me/accounts?fields=instagram_business_account{id,username}&access_token=${token}`);
    const accountsData = await accountsRes.json();
    
    if (accountsRes.ok && accountsData.data?.[0]?.instagram_business_account) {
       result.details.business_account.username = accountsData.data[0].instagram_business_account.username;
    }

    return result;
  } catch (error: any) {
    result.status = 'unhealthy';
    result.details.token = { status: 'error', message: error.message || 'Erro de conexão com a Meta' };
    return result;
  }
}
