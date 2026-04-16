import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const knowledgeBase = (prisma as typeof prisma & {
  knowledgeBase: {
    findMany: (...args: any[]) => Promise<any[]>;
    create: (...args: any[]) => Promise<any>;
    delete: (...args: any[]) => Promise<any>;
  };
}).knowledgeBase;

/**
 * API para Gestão da Base de Conhecimento (Módulo 2)
 */

export async function GET(req: NextRequest) {
  try {
    const knowledge = await knowledgeBase.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(knowledge);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar base de conhecimento' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, userId } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
    }

    // Buscar o primeiro usuário se nenhum for fornecido (ambiente demo)
    let targetUserId = userId;
    if (!targetUserId) {
      const user = await prisma.user.findFirst();
      if (user) targetUserId = user.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const item = await knowledgeBase.create({
      data: {
        title,
        content,
        userId: targetUserId
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('[KNOWLEDGE_POST_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao criar item na base de conhecimento' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    await knowledgeBase.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir item' }, { status: 500 });
  }
}
