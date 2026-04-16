import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Lista todos os posts do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const posts = await prisma.post.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status }),
      },
      include: {
        mediaItems: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('[POSTS_GET]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar posts' },
      { status: 500 }
    )
  }
}

// POST - Cria um novo post (draft ou agendado)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    const body = await request.json()
    const {
      caption,
      mediaType, // IMAGE, VIDEO, CAROUSEL
      mediaUrl, // Para posts únicos
      mediaItems, // Array de { url, mediaType, order } para carrosséis
      scheduledAt,
      status = 'DRAFT',
    } = body

    // Validações
    if (!mediaType) {
      return NextResponse.json(
        { error: 'mediaType é obrigatório' },
        { status: 400 }
      )
    }

    const validMediaTypes = ['IMAGE', 'VIDEO', 'CAROUSEL']
    if (!validMediaTypes.includes(mediaType)) {
      return NextResponse.json(
        { error: `mediaType deve ser um de: ${validMediaTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Valida mídia
    if (mediaType !== 'CAROUSEL' && !mediaUrl) {
      return NextResponse.json(
        { error: 'mediaUrl é obrigatório para posts únicos' },
        { status: 400 }
      )
    }

    if (mediaType === 'CAROUSEL' && (!mediaItems || mediaItems.length < 2)) {
      return NextResponse.json(
        { error: 'Carrossel requer pelo menos 2 mídias' },
        { status: 400 }
      )
    }

    if (mediaType === 'CAROUSEL' && mediaItems.length > 10) {
      return NextResponse.json(
        { error: 'Carrossel suporta no máximo 10 mídias' },
        { status: 400 }
      )
    }

    // Valida status
    const validStatuses = ['DRAFT', 'SCHEDULED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status inicial deve ser um de: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Se está agendando, verifica data
    if (status === 'SCHEDULED' && !scheduledAt) {
      return NextResponse.json(
        { error: 'scheduledAt é obrigatório para posts agendados' },
        { status: 400 }
      )
    }

    // Cria o post com transação
    const post = await prisma.$transaction(async (tx) => {
      const newPost = await tx.post.create({
        data: {
          user: {
            connect: { id: userId },
          },
          caption,
          mediaType,
          mediaUrl: mediaUrl || undefined,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
          status,
        },
      })

      // Se for carrossel, cria os media items
      if (mediaType === 'CAROUSEL' && mediaItems) {
        await tx.postMedia.createMany({
          data: mediaItems.map((item: { url: string; mediaType: string; order: number }) => ({
            postId: newPost.id,
            url: item.url,
            mediaType: item.mediaType,
            order: item.order,
          })),
        })
      }

      return newPost
    })

    // Busca o post completo com media items
    const fullPost = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        mediaItems: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(fullPost, { status: 201 })
  } catch (error) {
    console.error('[POSTS_POST]', error)
    return NextResponse.json(
      { error: 'Erro ao criar post' },
      { status: 500 }
    )
  }
}

// PATCH - Atualiza um post
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID do post é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica se o post pertence ao usuário
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Não permite editar posts já publicados
    if (existingPost.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Não é possível editar posts já publicados' },
        { status: 400 }
      )
    }

    // Atualiza o post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      },
      include: {
        mediaItems: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('[POSTS_PATCH]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar post' },
      { status: 500 }
    )
  }
}

// DELETE - Remove um post
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do post é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica se o post pertence ao usuário
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      )
    }

    // Não permite deletar posts publicados
    if (existingPost.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Não é possível deletar posts já publicados' },
        { status: 400 }
      )
    }

    await prisma.post.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POSTS_DELETE]', error)
    return NextResponse.json(
      { error: 'Erro ao deletar post' },
      { status: 500 }
    )
  }
}
