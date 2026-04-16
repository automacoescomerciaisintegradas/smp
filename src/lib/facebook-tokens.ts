/**
 * Utilitários para gerenciamento de tokens do Facebook/Instagram
 * 
 * Fluxo de tokens:
 * 1. Code -> Short-lived Access Token (1-2 horas)
 * 2. Short-lived -> Long-lived Access Token (60 dias)
 * 3. Long-lived -> Refresh quando necessário
 */

interface FacebookTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface InstagramLongLivedTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

/**
 * Troca o código de autorização por um token de acesso de curta duração (1-2 horas)
 */
export async function exchangeCodeForShortLivedToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<FacebookTokenResponse> {
  const response = await fetch('https://graph.facebook.com/v22.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Failed to exchange code for token: ${error.error?.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Troca token de curta duração por token de longa duração (60 dias)
 * Usado para tokens do Facebook
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
  clientId: string,
  clientSecret: string
): Promise<FacebookTokenResponse> {
  const response = await fetch(
    `https://graph.facebook.com/v22.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Failed to exchange for long-lived token: ${error.error?.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Troca token de curta duração do Instagram por token de longa duração (60 dias)
 * Endpoint específico do Instagram Graph API
 */
export async function exchangeInstagramForLongLivedToken(
  shortLivedToken: string,
  clientSecret: string
): Promise<InstagramLongLivedTokenResponse> {
  const response = await fetch(
    `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Failed to exchange Instagram token: ${error.error?.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Renova um token de longa duração do Instagram
 * Deve ser chamado antes da expiração do token atual
 */
export async function refreshInstagramLongLivedToken(
  longLivedToken: string
): Promise<InstagramLongLivedTokenResponse> {
  const response = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${longLivedToken}`
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Failed to refresh token: ${error.error?.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Valida se um token de acesso ainda é válido
 */
export async function validateAccessToken(
  accessToken: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`
    )

    if (!response.ok) {
      return { valid: false, error: 'Failed to validate token' }
    }

    const data = await response.json()
    const isValid = data.data?.is_valid === true

    return {
      valid: isValid,
      error: isValid ? undefined : 'Token is invalid',
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Verifica quando um token vai expirar
 */
export async function getTokenExpiration(
  accessToken: string,
  appId: string,
  appSecret: string
): Promise<{ expiresAt?: Date; error?: string }> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`
    )

    if (!response.ok) {
      return { error: 'Failed to get token info' }
    }

    const data = await response.json()
    const expiresAt = data.data?.expires_at
      ? new Date(data.data.expires_at * 1000)
      : undefined

    return { expiresAt }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
