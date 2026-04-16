import { NextRequest, NextResponse } from 'next/server';
import type {
  WhatsAppWebhookPayload,
  WhatsAppIncomingMessage,
  WhatsAppStatusUpdate,
} from '@/types/social-api';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/whatsapp';

// ---------------------------------------------------------------------------
// GET - Meta webhook verification (hub.mode / hub.verify_token / hub.challenge)
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge || '', { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// ---------------------------------------------------------------------------
// POST - Receive inbound messages and delivery-status updates
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Read raw body for signature verification, then parse JSON
  const rawBody = await req.text();

  const signature = req.headers.get('X-Hub-Signature-256') || '';
  if (!verifyWebhookSignature(signature, rawBody)) {
    console.warn('WhatsApp webhook: assinatura inv\u00e1lida');
    return new Response('Forbidden', { status: 403 });
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  // Always respond 200 quickly so Meta does not retry
  // Process DB operations in background-safe try/catch blocks
  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const value = change.value;

      // ---- Incoming messages ------------------------------------------------
      if (value.messages && value.messages.length > 0) {
        const contactsMap = new Map<string, string>();
        if (value.contacts) {
          for (const c of value.contacts) {
            contactsMap.set(c.wa_id, c.profile.name);
          }
        }

        const phoneNumberId = value.metadata.phone_number_id;

        for (const message of value.messages) {
          try {
            await processIncomingMessage(message, contactsMap, phoneNumberId);
          } catch (err) {
            console.error('WhatsApp webhook: erro ao processar mensagem', message.id, err);
          }
        }
      }

      // ---- Status updates ---------------------------------------------------
      if (value.statuses && value.statuses.length > 0) {
        for (const status of value.statuses) {
          try {
            await processStatusUpdate(status);
          } catch (err) {
            console.error('WhatsApp webhook: erro ao processar status', status.id, err);
          }
        }
      }
    }
  }

  return new Response('EVENT_RECEIVED', { status: 200 });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function processIncomingMessage(
  message: WhatsAppIncomingMessage,
  contactsMap: Map<string, string>,
  phoneNumberId: string
) {
  // 1. Upsert WhatsAppContact
  const profileName = contactsMap.get(message.from) || null;
  const contact = await prisma.whatsAppContact.upsert({
    where: { waId: message.from },
    update: {
      ...(profileName ? { profileName } : {}),
    },
    create: {
      waId: message.from,
      profileName,
    },
  });

  // 2. Find or create WhatsAppConversation for this contact + phoneNumberId
  let conversation = await prisma.whatsAppConversation.findFirst({
    where: {
      contactId: contact.id,
      phoneNumberId,
    },
  });

  if (!conversation) {
    conversation = await prisma.whatsAppConversation.create({
      data: {
        contactId: contact.id,
        phoneNumberId,
        status: 'open',
      },
    });
  }

  // 3. Extract content based on message type
  const content = extractMessageContent(message);

  // 4. Create WhatsAppMessage
  await prisma.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      waMessageId: message.id,
      direction: 'inbound',
      type: message.type,
      content,
      mediaId: extractMediaId(message),
      status: 'delivered', // inbound messages are already delivered to us
      metadata: message.referral ? JSON.stringify(message.referral) : null,
    },
  });

  // 5. Increment unreadCount and update lastMessageAt
  await prisma.whatsAppConversation.update({
    where: { id: conversation.id },
    data: {
      unreadCount: { increment: 1 },
      lastMessageAt: new Date(),
      status: 'open',
    },
  });
}

function extractMessageContent(message: WhatsAppIncomingMessage): string {
  switch (message.type) {
    case 'text':
      return message.text?.body || '';
    case 'image':
      return message.image?.caption || '[Imagem]';
    case 'video':
      return message.video?.caption || '[V\u00eddeo]';
    case 'audio':
      return '[Audio]';
    case 'document':
      return message.document?.caption || message.document?.filename || '[Documento]';
    case 'sticker':
      return '[Sticker]';
    case 'location':
      return message.location
        ? `[Localiza\u00e7\u00e3o: ${message.location.latitude}, ${message.location.longitude}]`
        : '[Localiza\u00e7\u00e3o]';
    default:
      return JSON.stringify(message);
  }
}

function extractMediaId(message: WhatsAppIncomingMessage): string | null {
  switch (message.type) {
    case 'image':
      return message.image?.id || null;
    case 'video':
      return message.video?.id || null;
    case 'audio':
      return message.audio?.id || null;
    case 'document':
      return message.document?.id || null;
    case 'sticker':
      return message.sticker?.id || null;
    default:
      return null;
  }
}

async function processStatusUpdate(status: WhatsAppStatusUpdate) {
  // Find the WhatsAppMessage by waMessageId
  const existingMessage = await prisma.whatsAppMessage.findUnique({
    where: { waMessageId: status.id },
  });

  if (!existingMessage) {
    // Message not tracked locally (could be from before integration was set up)
    return;
  }

  const updateData: { status: string; errorMessage?: string } = {
    status: status.status,
  };

  if (status.status === 'failed' && status.errors && status.errors.length > 0) {
    const err = status.errors[0];
    updateData.errorMessage = `[${err.code}] ${err.title}: ${err.message}`;
  }

  await prisma.whatsAppMessage.update({
    where: { waMessageId: status.id },
    data: updateData,
  });
}
