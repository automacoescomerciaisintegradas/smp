import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ensureValidToken } from "@/lib/instagram-token-manager"

// POST /api/instagram/publish
// Publica um post no Instagram usando a Content Publishing API
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { imageUrl, caption } = await req.json()

    if (!imageUrl || !caption) {
      return NextResponse.json(
        { error: "imageUrl e caption são obrigatórios" },
        { status: 400 }
      )
    }

    // Verifica e renova o token automaticamente se necessário
    const tokenValidation = await ensureValidToken(session.user.id)

    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: tokenValidation.error || 'Token inválido' },
        { status: 400 }
      )
    }

    const accessToken = tokenValidation.account!.accessToken
    const accountId = tokenValidation.account!.instagramId

    console.log('[INSTAGRAM_PUBLISH] Token validado para:', tokenValidation.account!.username)

    console.log('[INSTAGRAM_PUBLISH] Publicando para:', { accountId, imageUrl })

    // Constrói URL completa se for relativa
    const fullImageUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}${imageUrl}`

    // Passo 1: Criar container de mídia
    const createContainerRes = await fetch(
      `https://graph.facebook.com/v22.0/${accountId}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          image_url: fullImageUrl,
          caption: caption,
        }),
      }
    )

    const containerData = await createContainerRes.json()

    if (!createContainerRes.ok) {
      console.error("[INSTAGRAM_PUBLISH] Erro ao criar container:", JSON.stringify(containerData, null, 2))
      return NextResponse.json(
        { error: "Falha ao criar container de mídia", details: containerData },
        { status: 500 }
      )
    }

    const containerId = containerData.id
    console.log('[INSTAGRAM_PUBLISH] Container criado:', containerId)

    // Aguarda processamento
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Passo 2: Publicar o container
    const publishRes = await fetch(
      `https://graph.facebook.com/v22.0/${accountId}/media_publish`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          creation_id: containerId,
        }),
      }
    )

    const publishData = await publishRes.json()

    if (!publishRes.ok) {
      console.error("[INSTAGRAM_PUBLISH] Erro ao publicar:", JSON.stringify(publishData, null, 2))
      return NextResponse.json(
        { error: "Falha ao publicar no Instagram", details: publishData },
        { status: 500 }
      )
    }

    console.log('[INSTAGRAM_PUBLISH] Post publicado:', publishData.id)

    return NextResponse.json({
      success: true,
      id: publishData.id,
      message: "Post publicado com sucesso no Instagram!",
    })
  } catch (error) {
    console.error("Erro na API de publicação:", error)
    return NextResponse.json(
      { error: "Erro interno ao publicar no Instagram" },
      { status: 500 }
    )
  }
}

// GET /api/instagram/publish
// Verifica o status de uma publicação
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const mediaId = searchParams.get("mediaId")

    if (!mediaId) {
      return NextResponse.json(
        { error: "mediaId é obrigatório" },
        { status: 400 }
      )
    }

    // Busca conta do Instagram do usuário
    const instagramAccount = await prisma.instagramAccount.findFirst({
      where: {
        userId: session.user.id,
      },
    })

    if (!instagramAccount) {
      return NextResponse.json(
        { error: "Nenhuma conta do Instagram conectada" },
        { status: 400 }
      )
    }

    const accessToken = instagramAccount.accessToken

    const res = await fetch(
      `https://graph.facebook.com/v22.0/${mediaId}?fields=id,caption,media_url,permalink,timestamp`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: "Falha ao buscar status da mídia", details: data },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao verificar status:", error)
    return NextResponse.json(
      { error: "Erro interno ao verificar status" },
      { status: 500 }
    )
  }
}
