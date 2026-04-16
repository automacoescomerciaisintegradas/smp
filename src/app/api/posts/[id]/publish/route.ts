import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ensureValidToken } from '@/lib/instagram-token-manager'

/**
 * POST /api/posts/[id]/publish
 * 
 * Publica um post no Instagram usando a Instagram Graph API
 * Suporta: IMAGE, VIDEO, CAROUSEL
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id: postId } = await params

    // Busca o post
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        userId: session.user.id,
      },
      include: {
        mediaItems: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Não permite publicar se já está publicado
    if (post.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Post já foi publicado' },
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

    const igToken = tokenValidation.account!.accessToken
    const igUserId = tokenValidation.account!.instagramId
    const baseUrl = 'https://graph.facebook.com/v22.0'

    console.log('[PUBLISH] Token validado para:', tokenValidation.account!.username)

    let instagramPostId: string | null = null

    try {
      // PUBLICAÇÃO DE IMAGEM OU VÍDEO ÚNICO
      if (post.mediaType === 'IMAGE' || post.mediaType === 'VIDEO') {
        if (!post.mediaUrl) {
          throw new Error('URL da mídia não encontrada')
        }

        // Constrói URL completa se for relativa
        const mediaUrl = post.mediaUrl.startsWith('http')
          ? post.mediaUrl
          : `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}${post.mediaUrl}`

        console.log('[PUBLISH_DEBUG] Criando container para:', { mediaType: post.mediaType, mediaUrl })

        // Step 1: Cria container de mídia
        const containerParams = new URLSearchParams({
          is_carousel: 'false',
        })

        if (post.mediaType === 'IMAGE') {
          containerParams.set('image_url', mediaUrl)
        } else {
          containerParams.set('video_url', mediaUrl)
        }

        if (post.caption) {
          containerParams.set('caption', post.caption)
        }

        console.log('[PUBLISH_DEBUG] URL do container:', `${baseUrl}/${igUserId}/media?${containerParams.toString()}`)

        const containerResponse = await fetch(
          `${baseUrl}/${igUserId}/media?${containerParams.toString()}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${igToken}`,
            },
          }
        )

        if (!containerResponse.ok) {
          const error = await containerResponse.json()
          console.error('[PUBLISH_DEBUG] Erro ao criar container:', JSON.stringify(error, null, 2))
          throw new Error(`Erro ao criar container: ${error.error?.message || 'Unknown error'}`)
        }

        const containerData = await containerResponse.json()
        const containerId = containerData.id

        console.log('[PUBLISH_DEBUG] Container criado:', containerId)

        // Aguarda processamento (pode levar alguns segundos para vídeos)
        if (post.mediaType === 'VIDEO') {
          await new Promise(resolve => setTimeout(resolve, 5000))
        }

        // Step 2: Publica o container
        const publishResponse = await fetch(
          `${baseUrl}/${igUserId}/media_publish`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${igToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              creation_id: containerId,
            }),
          }
        )

        if (!publishResponse.ok) {
          const error = await publishResponse.json()
          console.error('[PUBLISH_DEBUG] Erro ao publicar:', JSON.stringify(error, null, 2))
          throw new Error(`Erro ao publicar: ${error.error?.message || 'Unknown error'}`)
        }

        const publishData = await publishResponse.json()
        instagramPostId = publishData.id

        console.log('[PUBLISH_DEBUG] Post publicado:', instagramPostId)
      }

      // PUBLICAÇÃO DE CARROSSEL
      if (post.mediaType === 'CAROUSEL') {
        if (!post.mediaItems || post.mediaItems.length < 2) {
          throw new Error('Carrossel requer pelo menos 2 mídias')
        }

        console.log('[PUBLISH_DEBUG] Publicando carrossel com', post.mediaItems.length, 'mídias')

        // Step 1: Cria um container para cada mídia do carrossel
        const containerIds: string[] = []

        for (let i = 0; i < post.mediaItems.length; i++) {
          const mediaItem = post.mediaItems[i]
          const mediaUrl = mediaItem.url.startsWith('http')
            ? mediaItem.url
            : `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}${mediaItem.url}`

          const isVideo = mediaItem.mediaType === 'VIDEO'

          console.log(`[PUBLISH_DEBUG] Criando container ${i + 1}/${post.mediaItems.length}:`, { mediaUrl, isVideo })

          // Cria container para cada mídia
          const containerParams = new URLSearchParams({
            is_carousel: 'false',
          })

          if (isVideo) {
            containerParams.set('video_url', mediaUrl)
          } else {
            containerParams.set('image_url', mediaUrl)
          }

          const containerResponse = await fetch(
            `${baseUrl}/${igUserId}/media?${containerParams.toString()}`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${igToken}`,
              },
            }
          )

          if (!containerResponse.ok) {
            const error = await containerResponse.json()
            console.error(`[PUBLISH_DEBUG] Erro ao criar container ${i + 1}:`, JSON.stringify(error, null, 2))
            throw new Error(`Erro ao criar container ${i + 1}: ${error.error?.message || 'Unknown error'}`)
          }

          const containerData = await containerResponse.json()
          containerIds.push(containerData.id)
          console.log(`[PUBLISH_DEBUG] Container ${i + 1} criado:`, containerData.id)

          // Aguarda um pouco entre cada criação
          await new Promise(resolve => setTimeout(resolve, 2000))
        }

        // Step 2: Cria container do carrossel com todos os children
        const carouselContainerParams = new URLSearchParams({
          media_type: 'CAROUSEL',
          children: containerIds.join(','),
        })

        if (post.caption) {
          carouselContainerParams.set('caption', post.caption)
        }

        console.log('[PUBLISH_DEBUG] Criando container do carrossel...')

        const carouselContainerResponse = await fetch(
          `${baseUrl}/${igUserId}/media?${carouselContainerParams.toString()}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${igToken}`,
            },
          }
        )

        if (!carouselContainerResponse.ok) {
          const error = await carouselContainerResponse.json()
          console.error('[PUBLISH_DEBUG] Erro ao criar container do carrossel:', JSON.stringify(error, null, 2))
          throw new Error(`Erro ao criar container do carrossel: ${error.error?.message || 'Unknown error'}`)
        }

        const carouselContainerData = await carouselContainerResponse.json()
        const carouselContainerId = carouselContainerData.id

        console.log('[PUBLISH_DEBUG] Container do carrossel criado:', carouselContainerId)

        // Aguarda processamento
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Step 3: Publica o carrossel
        const carouselPublishResponse = await fetch(
          `${baseUrl}/${igUserId}/media_publish`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${igToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              creation_id: carouselContainerId,
            }),
          }
        )

        if (!carouselPublishResponse.ok) {
          const error = await carouselPublishResponse.json()
          console.error('[PUBLISH_DEBUG] Erro ao publicar carrossel:', JSON.stringify(error, null, 2))
          throw new Error(`Erro ao publicar carrossel: ${error.error?.message || 'Unknown error'}`)
        }

        const carouselPublishData = await carouselPublishResponse.json()
        instagramPostId = carouselPublishData.id

        console.log('[PUBLISH_DEBUG] Carrossel publicado:', instagramPostId)
      }

      // Atualiza o post no banco
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          instagramPostId,
          error: null,
        },
      })

      return NextResponse.json({
        success: true,
        instagramPostId,
        message: 'Post publicado com sucesso!',
      })
    } catch (publishError) {
      console.error('[PUBLISH_ERROR]', publishError)

      // Atualiza o post com erro
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'FAILED',
          error: publishError instanceof Error ? publishError.message : 'Erro desconhecido',
        },
      })

      return NextResponse.json(
        {
          error: 'Falha ao publicar no Instagram',
          details: publishError instanceof Error ? publishError.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[PUBLISH_POST]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
