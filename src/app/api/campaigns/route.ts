// Next.js API Route para gerenciar campanhas
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Lista todas as campanhas do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    // TODO: Implementar autenticação e pegar userId da sessão
    // Por enquanto, pega o usuário mais recente
    const firstUser = await prisma.user.findFirst({
      orderBy: { id: "desc" },
    })
    
    if (!firstUser) {
      return NextResponse.json([])
    }
    
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: firstUser.id,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("[CAMPAIGNS_GET]", error)
    return NextResponse.json(
      { error: "Erro ao buscar campanhas" },
      { status: 500 }
    )
  }
}

// POST - Cria uma nova campanha
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, platform, scheduledAt, content, imageUrl } = body

    // Validações básicas
    if (!name || !platform || !scheduledAt || !content) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando: name, platform, scheduledAt, content" },
        { status: 400 }
      )
    }

    // Valida plataforma
    const validPlatforms = ["instagram", "facebook", "whatsapp"]
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return NextResponse.json(
        { error: `Plataforma inválida. Deve ser uma das: ${validPlatforms.join(", ")}` },
        { status: 400 }
      )
    }

    // TODO: Pegar userId da sessão autenticada
    // Temporariamente usando um userId fixo para desenvolvimento
    // Busca o primeiro usuário do banco como fallback
    const firstUser = await prisma.user.findFirst({
      orderBy: { id: "desc" },
    })
    
    if (!firstUser) {
      return NextResponse.json(
        { error: "Nenhum usuário encontrado. Faça login primeiro." },
        { status: 401 }
      )
    }
    
    const userId = firstUser.id

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name,
        platform: platform.toLowerCase(),
        scheduledAt: new Date(scheduledAt),
        content,
        imageUrl: imageUrl || null,
        status: "scheduled",
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error("[CAMPAIGNS_POST]", error)
    return NextResponse.json(
      { error: "Erro ao criar campanha" },
      { status: 500 }
    )
  }
}

// PATCH - Atualiza uma campanha existente
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID da campanha é obrigatório" },
        { status: 400 }
      )
    }
    
    // Verifica se a campanha existe e pertence ao usuário
    const firstUser = await prisma.user.findFirst({
      orderBy: { id: "desc" },
    })
    
    if (!firstUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      )
    }

    const campaign = await prisma.campaign.update({
      where: { 
        id,
        userId: firstUser.id,
      },
      data,
    })

    return NextResponse.json(campaign)
  } catch (error) {
    console.error("[CAMPAIGNS_PATCH]", error)
    return NextResponse.json(
      { error: "Erro ao atualizar campanha" },
      { status: 500 }
    )
  }
}

// DELETE - Remove uma campanha
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID da campanha é obrigatório" },
        { status: 400 }
      )
    }

    await prisma.campaign.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CAMPAIGNS_DELETE]", error)
    return NextResponse.json(
      { error: "Erro ao deletar campanha" },
      { status: 500 }
    )
  }
}
