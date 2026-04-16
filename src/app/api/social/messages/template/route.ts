import { NextRequest, NextResponse } from 'next/server';
import type { WhatsAppTemplateMessage, ApiSuccessResponse, ApiErrorResponse } from '@/types/social-api';

const WHATSAPP_GRAPH_API_VERSION = 'v21.0';
const DEFAULT_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

function validateTemplateMessage(body: Partial<WhatsAppTemplateMessage>): { valid: boolean; error?: string } {
  if (!body.recipientId) {
    return { valid: false, error: 'recipientId é obrigatório' };
  }

  if (!body.templateName) {
    return { valid: false, error: 'templateName é obrigatório' };
  }

  if (!body.language) {
    return { valid: false, error: 'language é obrigatório (ex: pt_BR, en_US)' };
  }

  return { valid: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<WhatsAppTemplateMessage>;

    const validation = validateTemplateMessage(body);
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: validation.error || 'Validação falhou' } },
        { status: 400 }
      );
    }

    const token = body.accessToken || DEFAULT_TOKEN;
    if (!token) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { message: 'Token de acesso não configurado. Forneça accessToken no body ou configure WHATSAPP_ACCESS_TOKEN' } },
        { status: 401 }
      );
    }

    // Busca o WhatsApp Business Account ID
    const phoneNumberId = body.recipientId?.split(':')[0] || body.recipientId; // Extrai o phone_number_id do recipient

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: body.recipientId,
      type: 'template',
      template: {
        name: body.templateName,
        language: {
          code: body.language,
        },
        ...(body.components && { components: body.components }),
      },
    };

    const url = `https://graph.facebook.com/${WHATSAPP_GRAPH_API_VERSION}/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorResponse: ApiErrorResponse = {
        error: {
          message: data.error?.message || 'Erro na API do WhatsApp',
          code: data.error?.code,
          type: data.error?.type,
          fbtrace_id: data.error?.fbtrace_id,
        },
      };

      return NextResponse.json<ApiErrorResponse>(errorResponse, { status: response.status });
    }

    const successResponse: ApiSuccessResponse<typeof data> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json<ApiSuccessResponse<typeof data>>(successResponse, { status: 200 });

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
