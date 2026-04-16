import { NextRequest, NextResponse } from 'next/server';
import type { ApiSuccessResponse, ApiErrorResponse } from '@/types/social-api';
import { prisma } from '@/lib/prisma';
import { createWelcomeSequence, getWelcomeSequences } from '@/lib/whatsapp';

export async function GET() {
  try {
    const sequences = await prisma.whatsAppWelcomeSequence.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json<ApiSuccessResponse>({
      success: true,
      data: sequences.map((s) => ({
        ...s,
        messages: JSON.parse(s.messages),
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao listar sequências de boas-vindas:', error);
    return NextResponse.json<ApiErrorResponse>(
      { error: { message: error instanceof Error ? error.message : 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'name é obrigatório' } },
        { status: 400 }
      );
    }

    if (!body.welcomeMessage?.text) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'welcomeMessage.text é obrigatório' } },
        { status: 400 }
      );
    }

    // Create on WhatsApp API
    const apiResult = await createWelcomeSequence({
      name: body.name,
      welcomeMessage: body.welcomeMessage,
    }, body.accessToken);

    // Persist locally
    const sequence = await prisma.whatsAppWelcomeSequence.create({
      data: {
        name: body.name,
        messages: JSON.stringify(body.welcomeMessage),
        isActive: true,
      },
    });

    return NextResponse.json<ApiSuccessResponse>({
      success: true,
      data: { ...sequence, sequenceId: apiResult.sequence_id },
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar sequência de boas-vindas:', error);
    return NextResponse.json<ApiErrorResponse>(
      { error: { message: error instanceof Error ? error.message : 'Erro interno do servidor' } },
      { status: 500 }
    );
  }
}
