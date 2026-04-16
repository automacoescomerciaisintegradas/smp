import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSmartReply } from '@/lib/comment-ai';

/**
 * Webhook do Instagram para Automação de Comentários (Módulo 3)
 */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verificado com sucesso!');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📩 Webhook Recebido:', JSON.stringify(body, null, 2));

    // Processar cada entrada do webhook
    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        if (!entry.changes) continue;

        for (const change of entry.changes) {
          if (change.field === 'comments') {
            const comment = change.value;
            await handleComment(comment, entry.id);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erro no processamento do Webhook:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

async function handleComment(comment: any, businessId: string) {
  const { id: commentId, text, from } = comment;

  console.log(`💬 Novo comentário de @${from.username}: "${text}"`);

  // 1. Verificar se a conta está configurada no nosso banco
  const igAccount = await prisma.instagramAccount.findUnique({
    where: { instagramId: businessId }
  });

  if (!igAccount) {
    console.warn(`⚠️ Conta ${businessId} não encontrada no banco. Ignorando.`);
    return;
  }

  // 2. Chamar IA para gerar resposta (Módulo 3 Core)
  const replyText = await generateAiReply(text, from.username);

  // 3. Postar resposta no Instagram
  await postReply(commentId, replyText, igAccount.accessToken);
}

async function generateAiReply(commentText: string, username: string): Promise<string> {
  console.log(`🤖 Gerando resposta inteligente para: "${commentText}"`);
  return await generateSmartReply(commentText, username);
}

async function postReply(commentId: string, text: string, token: string) {
  try {
    const res = await fetch(`https://graph.instagram.com/v21.0/${commentId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        access_token: token
      })
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Resposta enviada com sucesso para o comentário ${commentId}`);
    } else {
      console.error('❌ Falha ao enviar resposta:', data);
    }
  } catch (error) {
    console.error('❌ Erro ao postar resposta via Graph API:', error);
  }
}
