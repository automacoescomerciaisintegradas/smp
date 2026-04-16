import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { resolveAppBaseUrl } from '@/config/app-env.server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      const errorReason = searchParams.get('error_reason')
      const errorDescription = searchParams.get('error_description')
      console.error('[INSTAGRAM_CALLBACK] OAuth Error:', { error, errorReason, errorDescription })
      return NextResponse.redirect(
        new URL(`/settings?error=instagram_auth_denied&reason=${error}`, request.url)
      )
    }

    if (!code) {
      console.error('[INSTAGRAM_CALLBACK] No code provided')
      return NextResponse.redirect(
        new URL('/settings?error=no_instagram_code', request.url)
      )
    }

    const IG_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID
    const IG_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET
    const REDIRECT_URI =
      process.env.INSTAGRAM_REDIRECT_URI ||
      new URL('/api/auth/instagram/callback', resolveAppBaseUrl(process.env, request.nextUrl.origin)).toString()

    if (!IG_CLIENT_ID || !IG_CLIENT_SECRET) {
      console.error('[INSTAGRAM_CALLBACK] Missing credentials')
      return NextResponse.redirect(
        new URL('/settings?error=missing_credentials', request.url)
      )
    }

    // Step 1: Troca o código por um User Access Token de longa duração (60 dias)
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: IG_CLIENT_ID,
          client_secret: IG_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code,
        }),
      }
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error('[INSTAGRAM_CALLBACK] Token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/settings?error=token_exchange_failed', request.url)
      )
    }

    const tokenData = await tokenResponse.json()
    const userAccessToken = tokenData.access_token
    const expiresIn = tokenData.expires_in // 5184000 segundos = 60 dias

    console.log('[INSTAGRAM_CALLBACK] User Access Token obtido, expires_in:', expiresIn)

    // Step 2: Busca as páginas do usuário (Facebook Pages)
    const pagesResponse = await fetch(
      'https://graph.facebook.com/v22.0/me/accounts?fields=id,name,access_token,instagram_business_account,instagram_business_account.id,instagram_business_account.username',
      {
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
        },
      }
    )

    if (!pagesResponse.ok) {
      console.error('[INSTAGRAM_CALLBACK] Failed to fetch pages:', await pagesResponse.json())
      return NextResponse.redirect(
        new URL('/settings?error=fetch_pages_failed', request.url)
      )
    }

    const pagesData = await pagesResponse.json()
    console.log('[INSTAGRAM_CALLBACK] Pages:', JSON.stringify(pagesData, null, 2))

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error('[INSTAGRAM_CALLBACK] No Facebook Pages found')
      return NextResponse.redirect(
        new URL('/settings?error=no_pages_found', request.url)
      )
    }

    // Encontra a primeira página que tem uma conta do Instagram conectada
    let instagramAccountData: {
      pageId: string
      pageName: string
      pageAccessToken: string
      instagramId: string
      instagramUsername?: string
    } | null = null

    for (const page of pagesData.data) {
      if (page.instagram_business_account && page.instagram_business_account.id) {
        const instagramId = page.instagram_business_account.id
        
        const igInfoResponse = await fetch(
          `https://graph.facebook.com/v22.0/${instagramId}?fields=id,username,media_count,followers_count,profile_picture_url`,
          {
            headers: {
              Authorization: `Bearer ${userAccessToken}`,
            },
          }
        )

        if (igInfoResponse.ok) {
          const igInfo = await igInfoResponse.json()
          instagramAccountData = {
            pageId: page.id,
            pageName: page.name,
            pageAccessToken: page.access_token,
            instagramId: igInfo.id,
            instagramUsername: igInfo.username,
          }
          break
        }
      }
    }

    if (!instagramAccountData) {
      console.error('[INSTAGRAM_CALLBACK] No Instagram Business Account found')
      return NextResponse.redirect(
        new URL('/settings?error=no_instagram_account', request.url)
      )
    }

    const longLivedPageToken = instagramAccountData.pageAccessToken
    const expiresAt = new Date(Date.now() + expiresIn * 1000) // 60 dias

    console.log('[INSTAGRAM_CALLBACK] Salvando conta:', {
      instagramId: instagramAccountData.instagramId,
      username: instagramAccountData.instagramUsername,
      expiresAt: expiresAt.toISOString(),
    })

    // Step 4: Salva no banco com PERSISTÊNCIA TOTAL
    await prisma.instagramAccount.upsert({
      where: { instagramId: instagramAccountData.instagramId },
      update: {
        accessToken: longLivedPageToken,
        expiresAt,
        username: instagramAccountData.instagramUsername,
        followersCount: 0,
      },
      create: {
        userId: session.user.id!,
        instagramId: instagramAccountData.instagramId,
        accessToken: longLivedPageToken,
        expiresAt,
        username: instagramAccountData.instagramUsername,
        profilePictureUrl: null,
        followersCount: 0,
      },
    })

    console.log('[INSTAGRAM_CALLBACK] ✅ Conta salva com sucesso! Token persistido no banco.')
    console.log('[INSTAGRAM_CALLBACK] Token válido até:', expiresAt.toISOString())

    // Log do token em DEV para debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('[INSTAGRAM_CALLBACK] Token (apenas DEV):', longLivedPageToken.substring(0, 30) + '...')
    }

    return NextResponse.redirect(
      new URL('/settings?success=instagram_connected', request.url)
    )
  } catch (error) {
    console.error('[INSTAGRAM_CALLBACK] Unexpected error:', error)
    return NextResponse.redirect(
      new URL('/settings?error=unexpected_error', request.url)
    )
  }
}
