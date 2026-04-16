import { NextRequest, NextResponse } from 'next/server';
import type {
  WhatsAppMediaType,
  WhatsAppApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '@/types/social-api';
import {
  sendTextMessage,
  sendMediaMessage,
  sendInteractiveMessage,
} from '@/lib/whatsapp';
import { prisma } from '@/lib/prisma';

// Discriminated union for request body
interface TextBody {
  type: 'text';
  to: string;
  text: string;
  preview_url?: boolean;
  accessToken?: string;
}

interface MediaBody {
  type: 'media';
  to: string;
  mediaType: WhatsAppMediaType;
  mediaUrl?: string;
  mediaId?: string;
  caption?: string;
  filename?: string;
  accessToken?: string;
}

interface InteractiveBody {
  type: 'interactive';
  to: string;
  interactive: Record<string, unknown>;
  accessToken?: string;
}

type SendMessageBody = TextBody | MediaBody | InteractiveBody;

const VALID_TYPES = ['text', 'media', 'interactive'] as const;
const VALID_MEDIA_TYPES: WhatsAppMediaType[] = ['image', 'video', 'audio', 'document', 'sticker'];

function validateBody(body: Partial<SendMessageBody>): { valid: boolean; error?: string } {
  if (!body.to) {
    return { valid: false, error: 'to é obrigatório' };
  }

  if (!body.type || !VALID_TYPES.includes(body.type as typeof VALID_TYPES[number])) {
    return { valid: false, error: 'type é obrigatório e deve ser text, media ou interactive' };
  }

  if (body.type === 'text') {
    const textBody = body as Partial<TextBody>;
    if (!textBody.text) {
      return { valid: false, error: 'text é obrigatório para mensagens do tipo text' };
    }
  }

  if (body.type === 'media') {
    const mediaBody = body as Partial<MediaBody>;
    if (!mediaBody.mediaType || !VALID_MEDIA_TYPES.includes(mediaBody.mediaType)) {
      return { valid: false, error: 'mediaType é obrigatório e deve ser image, video, audio, document ou sticker' };
    }
    if (!mediaBody.mediaUrl && !mediaBody.mediaId) {
      return { valid: false, error: 'mediaUrl ou mediaId é obrigatório para mensagens do tipo media' };
    }
  }

  if (body.type === 'interactive') {
    const interactiveBody = body as Partial<InteractiveBody>;
    if (!interactiveBody.interactive || typeof interactiveBody.interactive !== 'object') {
      return { valid: false, error: 'interactive é obrigatório para mensagens do tipo interactive' };
    }
  }

  return { valid: true };
}

async function persistOutboundMessage(
  to: string,
  type: string,
  content: string,
  waMessageId: string | undefined,
  mediaUrl?: string,
  mediaId?: string,
  metadata?: string,
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
      type,
      content,
      mediaUrl: mediaUrl || undefined,
      mediaId: mediaId || undefined,
      status: 'sent',
      metadata: metadata || undefined,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<SendMessageBody>;

    const validation = validateBody(body);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: validation.error || 'Validação falhou' } },
        { status: 400 },
      );
    }

    const validBody = body as SendMessageBody;
    let apiResponse: WhatsAppApiResponse;
    let messageType: string;
    let content: string;
    let mediaUrl: string | undefined;
    let mediaId: string | undefined;

    switch (validBody.type) {
      case 'text': {
        apiResponse = await sendTextMessage(
          validBody.to,
          validBody.text,
          validBody.preview_url ?? false,
          validBody.accessToken,
        );
        messageType = 'text';
        content = validBody.text;
        break;
      }

      case 'media': {
        apiResponse = await sendMediaMessage(
          validBody.to,
          validBody.mediaType,
          {
            url: validBody.mediaUrl,
            id: validBody.mediaId,
            caption: validBody.caption,
            filename: validBody.filename,
          },
          validBody.accessToken,
        );
        messageType = validBody.mediaType;
        content = validBody.caption || '';
        mediaUrl = validBody.mediaUrl;
        mediaId = validBody.mediaId;
        break;
      }

      case 'interactive': {
        apiResponse = await sendInteractiveMessage(
          validBody.to,
          validBody.interactive,
          validBody.accessToken,
        );
        messageType = 'interactive';
        content = JSON.stringify(validBody.interactive);
        break;
      }
    }

    // Extract waMessageId from API response
    const waMessageId = apiResponse.messages?.[0]?.id;

    // Persist outbound message
    try {
      await persistOutboundMessage(
        validBody.to,
        messageType,
        content,
        waMessageId,
        mediaUrl,
        mediaId,
      );
    } catch (dbError) {
      console.error('Erro ao persistir mensagem no banco:', dbError);
      // Don't fail the request if DB persistence fails
    }

    const successResponse: ApiSuccessResponse<WhatsAppApiResponse> = {
      success: true,
      data: apiResponse,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json<ApiSuccessResponse<WhatsAppApiResponse>>(successResponse, { status: 200 });

  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);

    const errorResponse: ApiErrorResponse = {
      error: {
        message: error instanceof Error ? error.message : 'Erro interno do servidor',
      },
    };

    return NextResponse.json<ApiErrorResponse>(errorResponse, { status: 500 });
  }
}
