import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/instagram/manual-setup
 * 
 * Configura manualmente uma conta do Instagram com token existente
 * Útil para quando você já tem um Page Access Token válido
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      instagramId,
      username,
      accessToken,
      pageId,
      pageName,
    } = body

    // Validações
    if (!instagramId || !username || !accessToken) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: instagramId, username, accessToken' },
        { status: 400 }
      )
    }

    // Verifica se o token é válido testando uma requisição
    console.log('[MANUAL_SETUP] Verificando token...')
    const testResponse = await fetch(
      `https://graph.facebook.com/v22.0/${instagramId}?fields=id,username&access_token=${accessToken}`
    )

    if (!testResponse.ok) {
      const error = await testResponse.json()
      console.error('[MANUAL_SETUP] Token inválido:', error)
      return NextResponse.json(
        { error: 'Token inválido. Verifique o Instagram ID e Access Token.', details: error },
        { status: 400 }
      )
    }

    const testData = await testResponse.json()
    console.log('[MANUAL_SETUP] Token válido! Conta:', testData)

    // Calcula expiração (60 dias a partir de agora)
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)

    // Salva no banco
    const account = await prisma.instagramAccount.upsert({
      where: { instagramId: testData.id || instagramId },
      update: {
        accessToken,
        expiresAt,
        username: testData.username || username,
      },
      create: {
        userId: session.user.id,
        instagramId: testData.id || instagramId,
        accessToken,
        expiresAt,
        username: testData.username || username,
        profilePictureUrl: null,
        followersCount: 0,
      },
    })

    console.log('[MANUAL_SETUP] ✅ Conta configurada com sucesso:', {
      instagramId: account.instagramId,
      username: account.username,
      expiresAt: account.expiresAt,
    })

    return NextResponse.json({
      success: true,
      account: {
        instagramId: account.instagramId,
        username: account.username,
        expiresAt: account.expiresAt,
        daysUntilExpiry: 60,
      },
      message: 'Conta configurada com sucesso! Token válido por 60 dias.',
    })
  } catch (error) {
    console.error('[MANUAL_SETUP] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/instagram/manual-setup
 * 
 * Lista todos os usuários para obter o ID
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

    // Busca conta atual
    const accounts = await prisma.instagramAccount.findMany({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      userId: session.user.id,
      email: session.user.email,
      accounts,
    })
  } catch (error) {
    console.error('[MANUAL_SETUP_LIST] Erro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
