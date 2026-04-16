import { NextRequest, NextResponse } from 'next/server';
import type { WhatsAppApiResponse, ApiSuccessResponse, ApiErrorResponse } from '@/types/social-api';
import { sendTemplateMessage } from '@/lib/whatsapp';
import { prisma } from '@/lib/prisma';

interface TemplateBody {
  to: string;
  templateName: string;
  language: string;
  components?: Array<{
    type: string;
    parameters: Array<Record<string, unknown>>;
  }>;
  accessToken?: string;
}

function validateBody(body: Partial<TemplateBody>): { valid: boolean; error?: string } {
  if (!body.to) {
    return { valid: false, error: 'to é obrigatório' };
  }

  if (!body.templateName) {
    return { valid: false, error: 'templateName é obrigatório' };
  }

  if (!body.language) {
    return { valid: false, error: 'language é obrigatório (ex: pt_BR, en_US)' };
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
      type: 'template',
      content,
      status: 'sent',
      metadata,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<TemplateBody>;

    const validation = validateBody(body);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: validation.error || 'Validação falhou' } },
        { status: 400 },
      );
    }

    const validBody = body as TemplateBody;

    const apiResponse = await sendTemplateMessage(
      validBody.to,
      validBody.templateName,
      validBody.language,
      validBody.components,
      validBody.accessToken,
    );

    // Extract waMessageId from API response
    const waMessageId = apiResponse.messages?.[0]?.id;

    // Persist outbound message
    const metadata = JSON.stringify({
      templateName: validBody.templateName,
      language: validBody.language,
      ...(validBody.components && { components: validBody.components }),
    });

    try {
      await persistOutboundMessage(
        validBody.to,
        validBody.templateName,
        waMessageId,
        metadata,
      );
    } catch (dbError) {
      console.error('Erro ao persistir mensagem template no banco:', dbError);
      // Don't fail the request if DB persistence fails
    }

    const successResponse: ApiSuccessResponse<WhatsAppApiResponse> = {
      success: true,
      data: apiResponse,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json<ApiSuccessResponse<WhatsAppApiResponse>>(successResponse, { status: 200 });

  } catch (error) {
    console.error('Erro ao enviar mensagem template WhatsApp:', error);

    const errorResponse: ApiErrorResponse = {
      error: {
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
      },
    };

    return NextResponse.json<ApiErrorResponse>(errorResponse, { status: 500 });
  }
}
