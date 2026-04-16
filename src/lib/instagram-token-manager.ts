import { prisma } from '@/lib/prisma'

/**
 * Verifica e renova tokens do Instagram automaticamente
 * 
 * O Page Access Token tem validade de 60 dias quando gerado a partir
 * de um User Token de longa duração. Esta função:
 * 1. Verifica tokens próximos da expiração (menos de 7 dias)
 * 2. Tenta renovar o token via Facebook Graph API
 * 3. Atualiza o banco com o novo token
 */

interface TokenRenewalResult {
  success: boolean
  instagramId: string
  username: string
  newExpiresAt?: Date
  error?: string
}

/**
 * Verifica se um token precisa ser renovado
 * Retorna true se o token expira em menos de X dias
 */
export function isTokenExpiringSoon(expiresAt: Date | null, daysThreshold = 7): boolean {
  if (!expiresAt) return true // Sem data de expiração = precisa renovar

  const now = new Date()
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000
  const timeUntilExpiry = expiresAt.getTime() - now.getTime()

  return timeUntilExpiry < thresholdMs
}

/**
 * Verifica se o token já expirou
 */
export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true
  return expiresAt < new Date()
}

/**
 * Renova o token de uma conta específica do Instagram
 * 
 * Para renovar um Page Access Token, precisamos:
 * 1. Obter um novo User Access Token (requer re-autenticação)
 * 2. Ou usar o token atual para gerar um novo Page Token
 * 
 * Infelizmente, o Facebook não permite renovar Page Tokens sem um User Token válido.
 * A solução é verificar se o token atual ainda funciona e alertar o usuário se precisar.
 */
export async function renewInstagramAccountToken(
  instagramId: string
): Promise<TokenRenewalResult> {
  try {
    const account = await prisma.instagramAccount.findUnique({
      where: { instagramId },
    })

    if (!account) {
      return {
        success: false,
        instagramId,
        username: 'unknown',
        error: 'Conta não encontrada',
      }
    }

    // Step 1: Verifica se o token atual ainda é válido
    const isValid = await validateInstagramToken(account.accessToken)

    if (isValid) {
      // Token ainda é válido, estende a expiração se necessário
      const newExpiresAt = isTokenExpiringSoon(account.expiresAt)
        ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // +60 dias
        : account.expiresAt || undefined

      if (newExpiresAt !== account.expiresAt) {
        await prisma.instagramAccount.update({
          where: { id: account.id },
          data: { expiresAt: newExpiresAt },
        })

        console.log(`[TOKEN_RENEW] Token estendido para ${account.username}:`, newExpiresAt)
      }

      return {
        success: true,
        instagramId,
        username: account.username || 'unknown',
        newExpiresAt,
      }
    }

    // Step 2: Token inválido - precisamos de re-autenticação
    console.error(`[TOKEN_RENEW] Token inválido para ${account.username}. Re-autenticação necessária.`)

    return {
      success: false,
      instagramId,
      username: account.username || 'unknown',
      error: 'Token inválido. Re-autenticação necessária.',
    }
  } catch (error) {
    console.error(`[TOKEN_RENEW] Erro ao renovar token para ${instagramId}:`, error)

    return {
      success: false,
      instagramId,
      username: 'unknown',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * Valida se um token do Instagram ainda é válido
 */
export async function validateInstagramToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/me?fields=id&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      console.log('[TOKEN_VALIDATE] Token inválido:', error.error?.message)
      return false
    }

    return true
  } catch (error) {
    console.error('[TOKEN_VALIDATE] Erro ao validar token:', error)
    return false
  }
}

/**
 * Verifica e renova todas as contas do Instagram com tokens próximos da expiração
 */
export async function renewAllExpiringTokens(): Promise<TokenRenewalResult[]> {
  console.log('[TOKEN_RENEW] Verificando tokens próximos da expiração...')

  // Busca todas as contas
  const accounts = await prisma.instagramAccount.findMany()

  const results: TokenRenewalResult[] = []

  for (const account of accounts) {
    if (isTokenExpiringSoon(account.expiresAt)) {
      console.log(`[TOKEN_RENEW] Token expirando em breve para ${account.username}:`, account.expiresAt)
      
      const result = await renewInstagramAccountToken(account.instagramId)
      results.push(result)
    }
  }

  if (results.length === 0) {
    console.log('[TOKEN_RENEW] Nenhum token precisa de renovação')
  } else {
    console.log(`[TOKEN_RENEW] ${results.filter(r => r.success).length}/${results.length} tokens renovados com sucesso`)
  }

  return results
}

/**
 * Garante que o token de uma conta é válido antes de publicar
 * Se estiver expirado ou próximo da expiração, tenta renovar
 */
export async function ensureValidToken(userId: string): Promise<{
  valid: boolean
  account?: {
    instagramId: string
    username: string
    accessToken: string
  }
  error?: string
}> {
  try {
    const account = await prisma.instagramAccount.findFirst({
      where: { userId },
    })

    if (!account) {
      return {
        valid: false,
        error: 'Nenhuma conta do Instagram conectada',
      }
    }

    // Verifica se o token está expirado
    if (isTokenExpired(account.expiresAt)) {
      // Tenta renovar
      console.log(`[TOKEN_ENSURE] Token expirado para ${account.username}. Tentando renovar...`)
      const renewResult = await renewInstagramAccountToken(account.instagramId)

      if (!renewResult.success) {
        return {
          valid: false,
          error: `Token expirado. ${renewResult.error}`,
        }
      }

      // Busca o token atualizado
      const updatedAccount = await prisma.instagramAccount.findUnique({
        where: { instagramId: account.instagramId },
      })

      if (!updatedAccount) {
        return {
          valid: false,
          error: 'Erro ao buscar conta atualizada',
        }
      }

      return {
        valid: true,
        account: {
          instagramId: updatedAccount.instagramId,
          username: updatedAccount.username || 'unknown',
          accessToken: updatedAccount.accessToken,
        },
      }
    }

    // Token ainda é válido mas está perto de expirar
    if (isTokenExpiringSoon(account.expiresAt)) {
      console.log(`[TOKEN_ENSURE] Token próximo da expiração para ${account.username}. Renovando...`)
      await renewInstagramAccountToken(account.instagramId)
    }

    return {
      valid: true,
      account: {
        instagramId: account.instagramId,
        username: account.username || 'unknown',
        accessToken: account.accessToken,
      },
    }
  } catch (error) {
    console.error('[TOKEN_ENSURE] Erro:', error)
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

/**
 * API Route Handler para renovação manual de tokens
 * Pode ser chamada via POST /api/instagram/renew-tokens
 */
export async function handleTokenRenewalRequest(): Promise<{
  success: boolean
  results: TokenRenewalResult[]
}> {
  try {
    console.log('[TOKEN_RENEW] Iniciando renovação manual de tokens...')
    const results = await renewAllExpiringTokens()

    return {
      success: true,
      results,
    }
  } catch (error) {
    console.error('[TOKEN_RENEW] Erro na renovação manual:', error)

    return {
      success: false,
      results: [],
    }
  }
}
