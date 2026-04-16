import { NextRequest, NextResponse } from 'next/server';
import type { WhatsAppPixOrder, WhatsAppApiResponse, ApiSuccessResponse, ApiErrorResponse } from '@/types/social-api';
import { sendPixOrder } from '@/lib/whatsapp';
import { prisma } from '@/lib/prisma';

const VALID_PIX_KEY_TYPES = ['EVP', 'CPF', 'CNPJ', 'EMAIL', 'PHONE'] as const;

function validateBody(body: Partial<WhatsAppPixOrder>): { valid: boolean; error?: string } {
  if (!body.to) {
    return { valid: false, error: 'to é obrigatório' };
  }

  if (!body.referenceId) {
    return { valid: false, error: 'referenceId é obrigatório' };
  }

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return { valid: false, error: 'items é obrigatório e deve ser um array não-vazio' };
  }

  if (!body.pixCode) {
    return { valid: false, error: 'pixCode é obrigatório' };
  }

  if (!body.pixKey) {
    return { valid: false, error: 'pixKey é obrigatório' };
  }

  if (!body.pixKeyType || !VALID_PIX_KEY_TYPES.includes(body.pixKeyType)) {
    return { valid: false, error: 'pixKeyType é obrigatório e deve ser EVP, CPF, CNPJ, EMAIL ou PHONE' };
  }

  if (!body.merchantName) {
    return { valid: false, error: 'merchantName é obrigatório' };
  }

  return { valid: true };
}

async function persistOutboundMessage(
  to: string,
  content: string,
  waMessageId: string | undefined,
  metadata: string,
) {
  const contact = await prisma.whatsAppContact.upsert({
    where: { waId: to },
    update: { updatedAt: new Date() },
    create: { waId: to },
  });

  let conversation = await prisma.whatsAppConversation.findFirst({
    where: { contactId: contact.id },
    orderBy: { lastMessageAt: 'desc' },
  });

  if (!conversation) {
    conversation = await prisma.whatsAppConversation.create({
      data: {
        contactId: contact.id,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      },
    });
  }

  await prisma.whatsAppConversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() },
  });

  await prisma.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      waMessageId: waMessageId || undefined,
      direction: 'outbound',
      type: 'interactive',
      content,
      status: 'sent',
      metadata,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<WhatsAppPixOrder>;

    const validation = validateBody(body);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: validation.error || 'Validação falhou' } },
        { status: 400 },
      );
    }

    const validBody = body as WhatsAppPixOrder;

    const apiResponse = await sendPixOrder(validBody);

    // Extract waMessageId from API response
    const waMessageId = apiResponse.messages?.[0]?.id;

    // Build metadata with order details
    const metadata = JSON.stringify({
      referenceId: validBody.referenceId,
      pixCode: validBody.pixCode,
      pixKey: validBody.pixKey,
      pixKeyType: validBody.pixKeyType,
      merchantName: validBody.merchantName,
      itemCount: validBody.items.length,
      items: validBody.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        amount: item.amount,
      })),
      ...(validBody.tax && { tax: validBody.tax }),
      ...(validBody.shipping && { shipping: validBody.shipping }),
      ...(validBody.discount && { discount: validBody.discount }),
    });

    // Persist outbound message
    try {
      await persistOutboundMessage(
        validBody.to,
        validBody.bodyText || 'Detalhes do seu pedido',
        waMessageId,
        metadata,
      );
    } catch (dbError) {
      console.error('Erro ao persistir mensagem PIX no banco:', dbError);
      // Don't fail the request if DB persistence fails
    }

    const successResponse: ApiSuccessResponse<WhatsAppApiResponse> = {
      success: true,
      data: apiResponse,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json<ApiSuccessResponse<WhatsAppApiResponse>>(successResponse, { status: 200 });

  } catch (error) {
    console.error('Erro ao enviar pedido PIX WhatsApp:', error);

    const errorResponse: ApiErrorResponse = {
      error: {
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
      },
    };

    return NextResponse.json<ApiErrorResponse>(errorResponse, { status: 500 });
  }
}
