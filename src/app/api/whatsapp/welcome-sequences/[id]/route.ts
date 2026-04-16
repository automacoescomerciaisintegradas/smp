import { NextRequest, NextResponse } from 'next/server';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/social-api';
import { prisma } from '@/lib/prisma';
import { deleteWelcomeSequence } from '@/lib/whatsapp';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sequence = await prisma.whatsAppWelcomeSequence.findUnique({ where: { id } });

    if (!sequence) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'Sequência não encontrada' } },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiSuccessResponse>({
      success: true,
      data: { ...sequence, messages: JSON.parse(sequence.messages) },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao buscar sequência:', error);
    return NextResponse.json<ApiErrorResponse>(
      { error: { message: error instanceof Error ? error.message : 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.whatsAppWelcomeSequence.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'Sequência não encontrada' } },
        { status: 404 }
      );
    }

    const sequence = await prisma.whatsAppWelcomeSequence.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.welcomeMessage && { messages: JSON.stringify(body.welcomeMessage) }),
        ...(typeof body.isActive === 'boolean' && { isActive: body.isActive }),
      },
    });

    return NextResponse.json<ApiSuccessResponse>({
      success: true,
      data: { ...sequence, messages: JSON.parse(sequence.messages) },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao atualizar sequência:', error);
    return NextResponse.json<ApiErrorResponse>(
      { error: { message: error instanceof Error ? error.message : 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.whatsAppWelcomeSequence.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'Sequência não encontrada' } },
        { status: 404 }
      );
    }

    // Delete from WhatsApp API (if we have the sequence_id)
    try {
      await deleteWelcomeSequence(id);
    } catch {
      // API deletion may fail if sequence was already deleted externally
    }

    await prisma.whatsAppWelcomeSequence.delete({ where: { id } });

    return NextResponse.json<ApiSuccessResponse>({
      success: true,
      data: { deleted: true },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao deletar sequência:', error);
    return NextResponse.json<ApiErrorResponse>(
      { error: { message: error instanceof Error ? error.message : 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}
