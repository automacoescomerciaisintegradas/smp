import { NextRequest, NextResponse } from 'next/server';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '@/types/social-api';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// GET - List messages for a specific WhatsApp conversation
// ---------------------------------------------------------------------------

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    const messages = await prisma.whatsAppMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const response: ApiSuccessResponse<typeof messages> = {
      success: true,
      data: messages,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar mensagens da conversa:', error);

    const errorResponse: ApiErrorResponse = {
      error: {
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
