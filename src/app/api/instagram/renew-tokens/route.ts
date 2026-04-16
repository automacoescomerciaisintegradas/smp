import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { handleTokenRenewalRequest } from '@/lib/instagram-token-manager'

/**
 * POST /api/instagram/renew-tokens
 * 
 * Renova manualmente todos os tokens do Instagram
 * Pode ser chamado via UI ou cron job
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const result = await handleTokenRenewalRequest()

    return NextResponse.json(result)
  } catch (error) {
    console.error('[RENEW_TOKENS_API] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/instagram/renew-tokens
 * 
 * Verifica status dos tokens sem renovar
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { prisma } = await import('@/lib/prisma')
    const { isTokenExpiringSoon, isTokenExpired } = await import('@/lib/instagram-token-manager')

    const accounts = await prisma.instagramAccount.findMany({
      where: {
        userId: session.user.id,
      },
    })

    const status = accounts.map(account => ({
      instagramId: account.instagramId,
      username: account.username,
      expiresAt: account.expiresAt,
      isExpired: isTokenExpired(account.expiresAt),
      isExpiringSoon: isTokenExpiringSoon(account.expiresAt),
      daysUntilExpiry: account.expiresAt
        ? Math.floor((account.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
    }))

    return NextResponse.json({
      accounts: status,
      total: accounts.length,
      expired: status.filter(s => s.isExpired).length,
      expiringSoon: status.filter(s => s.isExpiringSoon && !s.isExpired).length,
    })
  } catch (error) {
    console.error('[CHECK_TOKENS_API] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
