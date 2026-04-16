import { NextRequest, NextResponse } from 'next/server';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  WhatsAppConversationSummary,
} from '@/types/social-api';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// GET - List WhatsApp conversations with latest message preview
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const cursor = searchParams.get('cursor'); // conversation ID for cursor-based pagination

    const conversations = await prisma.whatsAppConversation.findMany({
      take: limit,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        contact: true,
      },
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });

    // Fetch latest message for each conversation
    const summaries: WhatsAppConversationSummary[] = await Promise.all(
      conversations.map(async (conv) => {
        const latestMessage = await prisma.whatsAppMessage.findFirst({
          where: { conversationId: conv.id },
          orderBy: { createdAt: 'desc' },
          take: 1,
        });

        return {
          id: conv.id,
          contactPhone: conv.contact.waId,
          contactName: conv.contact.profileName || conv.contact.waId,
          lastMessageText: latestMessage?.content || '',
          lastMessageAt: conv.lastMessageAt.toISOString(),
          unreadCount: conv.unreadCount,
          platform: 'whatsapp' as const,
        };
      })
    );

    const response: ApiSuccessResponse<WhatsAppConversationSummary[]> = {
      success: true,
      data: summaries,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar conversas WhatsApp:', error);

    const errorResponse: ApiErrorResponse = {
      error: {
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
