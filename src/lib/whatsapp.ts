import crypto from 'crypto';
import {
  WHATSAPP_API_VERSION,
  WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_BUSINESS_ACCOUNT_ID,
  WHATSAPP_ACCESS_TOKEN,
} from './meta-api-config';
import type {
  WhatsAppMediaType,
  WhatsAppPixOrder,
  WhatsAppApiResponse,
  WhatsAppWelcomeSequence,
} from '@/types/social-api';

const GRAPH_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

function getToken(overrideToken?: string): string {
  const token = overrideToken || WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    throw new Error('Token de acesso WhatsApp não configurado. Configure WHATSAPP_ACCESS_TOKEN ou forneça accessToken.');
  }
  return token;
}

function getPhoneNumberId(): string {
  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID não configurado.');
  }
  return WHATSAPP_PHONE_NUMBER_ID;
}

async function callWhatsAppApi<T = unknown>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE',
  body?: unknown,
  token?: string
): Promise<T> {
  const requestInit: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${getToken(token)}`,
      'Content-Type': 'application/json',
    },
  };

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, requestInit);

  const data = await response.json();

  if (!response.ok) {
    const err = data.error || {};
    const error = new Error(err.message || 'Erro na API do WhatsApp') as Error & {
      code?: number;
      type?: string;
      fbtrace_id?: string;
    };
    error.code = err.code;
    error.type = err.type;
    error.fbtrace_id = err.fbtrace_id;
    throw error;
  }

  return data as T;
}

// ============
// Send Messages
// ============

export async function sendTextMessage(
  to: string,
  text: string,
  previewUrl = false,
  token?: string
): Promise<WhatsAppApiResponse> {
  const phoneId = getPhoneNumberId();
  return callWhatsAppApi<WhatsAppApiResponse>(
    `${GRAPH_BASE}/${phoneId}/messages`,
    'POST',
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: previewUrl, body: text },
    },
    token
  );
}

export async function sendMediaMessage(
  to: string,
  mediaType: WhatsAppMediaType,
  media: { url?: string; id?: string; caption?: string; filename?: string },
  token?: string
): Promise<WhatsAppApiResponse> {
  const phoneId = getPhoneNumberId();

  const mediaPayload: Record<string, unknown> = {};
  if (media.url) mediaPayload.link = media.url;
  if (media.id) mediaPayload.id = media.id;
  if (media.caption) mediaPayload.caption = media.caption;
  if (media.filename) mediaPayload.filename = media.filename;

  return callWhatsAppApi<WhatsAppApiResponse>(
    `${GRAPH_BASE}/${phoneId}/messages`,
    'POST',
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: mediaType,
      [mediaType]: mediaPayload,
    },
    token
  );
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  language: string,
  components?: Array<{
    type: string;
    parameters: Array<Record<string, unknown>>;
  }>,
  token?: string
): Promise<WhatsAppApiResponse> {
  const phoneId = getPhoneNumberId();
  return callWhatsAppApi<WhatsAppApiResponse>(
    `${GRAPH_BASE}/${phoneId}/messages`,
    'POST',
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        ...(components && { components }),
      },
    },
    token
  );
}

export async function sendInteractiveMessage(
  to: string,
  interactive: Record<string, unknown>,
  token?: string
): Promise<WhatsAppApiResponse> {
  const phoneId = getPhoneNumberId();
  return callWhatsAppApi<WhatsAppApiResponse>(
    `${GRAPH_BASE}/${phoneId}/messages`,
    'POST',
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive,
    },
    token
  );
}

export async function sendPixOrder(order: WhatsAppPixOrder): Promise<WhatsAppApiResponse> {
  const phoneId = getPhoneNumberId();

  const subtotalValue = order.items.reduce((sum, item) => sum + item.amount.value * item.quantity, 0);
  const taxValue = order.tax?.value || 0;
  const shippingValue = order.shipping?.value || 0;
  const discountValue = order.discount?.value || 0;
  const totalValue = subtotalValue + taxValue + shippingValue - discountValue;
  const offset = order.items[0]?.amount.offset || 100;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: order.to,
    type: 'interactive',
    interactive: {
      type: 'order_details',
      body: { text: order.bodyText || 'Detalhes do seu pedido' },
      action: {
        name: 'review_and_pay',
        parameters: {
          reference_id: order.referenceId,
          type: 'digital-goods',
          payment_type: 'br',
          payment_settings: [
            {
              type: 'pix_dynamic_code',
              pix_dynamic_code: {
                code: order.pixCode,
                merchant_name: order.merchantName,
                key: order.pixKey,
                key_type: order.pixKeyType,
              },
            },
          ],
          currency: 'BRL',
          total_amount: { value: totalValue, offset },
          order: {
            status: 'pending',
            ...(order.tax && { tax: { ...order.tax, offset } }),
            ...(order.shipping && { shipping: { ...order.shipping, offset } }),
            ...(order.discount && { discount: { ...order.discount, offset } }),
            items: order.items.map((item) => ({
              retailer_id: item.retailer_id || '',
              name: item.name,
              amount: item.amount,
              quantity: item.quantity,
              ...(item.sale_amount && { sale_amount: item.sale_amount }),
            })),
            subtotal: { value: subtotalValue, offset },
          },
        },
      },
    },
  };

  return callWhatsAppApi<WhatsAppApiResponse>(
    `${GRAPH_BASE}/${phoneId}/messages`,
    'POST',
    payload,
    order.accessToken
  );
}

// ============
// Media
// ============

export async function uploadMedia(
  file: Buffer,
  mimeType: string,
  filename: string,
  token?: string
): Promise<{ id: string }> {
  const phoneId = getPhoneNumberId();
  const formData = new FormData();
  formData.append('messaging_product', 'whatsapp');
  formData.append('file', new Blob([new Uint8Array(file)], { type: mimeType }), filename);
  formData.append('type', mimeType);

  const response = await fetch(`${GRAPH_BASE}/${phoneId}/media`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken(token)}` },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Erro ao fazer upload de mídia');
  return { id: data.id };
}

export async function getMediaUrl(mediaId: string, token?: string): Promise<string> {
  const data = await callWhatsAppApi<{ url: string }>(
    `${GRAPH_BASE}/${mediaId}`,
    'GET',
    undefined,
    token
  );
  return data.url;
}

export async function downloadMedia(mediaUrl: string, token?: string): Promise<Buffer> {
  const response = await fetch(mediaUrl, {
    headers: { 'Authorization': `Bearer ${getToken(token)}` },
  });
  if (!response.ok) throw new Error('Erro ao baixar mídia do WhatsApp');
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ============
// Welcome Sequences
// ============

export async function createWelcomeSequence(
  sequence: WhatsAppWelcomeSequence,
  token?: string
): Promise<{ sequence_id: string }> {
  const wabaId = WHATSAPP_BUSINESS_ACCOUNT_ID;
  if (!wabaId) throw new Error('WHATSAPP_BUSINESS_ACCOUNT_ID não configurado.');

  return callWhatsAppApi<{ sequence_id: string }>(
    `${GRAPH_BASE}/${wabaId}/welcome_message_sequences`,
    'POST',
    {
      name: sequence.name,
      welcome_message_sequence: sequence.welcomeMessage,
    },
    token
  );
}

export async function getWelcomeSequences(token?: string): Promise<unknown[]> {
  const wabaId = WHATSAPP_BUSINESS_ACCOUNT_ID;
  if (!wabaId) throw new Error('WHATSAPP_BUSINESS_ACCOUNT_ID não configurado.');

  const data = await callWhatsAppApi<{ data: unknown[] }>(
    `${GRAPH_BASE}/${wabaId}/welcome_message_sequences`,
    'GET',
    undefined,
    token
  );
  return data.data || [];
}

export async function deleteWelcomeSequence(sequenceId: string, token?: string): Promise<void> {
  const wabaId = WHATSAPP_BUSINESS_ACCOUNT_ID;
  if (!wabaId) throw new Error('WHATSAPP_BUSINESS_ACCOUNT_ID não configurado.');

  await callWhatsAppApi(
    `${GRAPH_BASE}/${wabaId}/welcome_message_sequences?sequence_id=${sequenceId}`,
    'DELETE',
    undefined,
    token
  );
}

// ============
// Webhook Verification
// ============

export function verifyWebhookSignature(
  signature: string,
  rawBody: string,
  appSecret?: string
): boolean {
  const secret = appSecret || process.env.FACEBOOK_APP_SECRET || process.env.FACEBOOK_CLIENT_SECRET;
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return signature === `sha256=${expectedSignature}`;
}
