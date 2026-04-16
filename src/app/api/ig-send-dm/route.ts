import { NextRequest, NextResponse } from 'next/server';

const IG_APP_ID = '936619743392459';
const ANDROID_UA = 'Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2400; samsung; SM-G991B; o1s; exynos2100; en_US; 458229258)';

function extractCsrfToken(cookie: string): string {
  const match = cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

function makeHeaders(cookie: string, csrf: string, contentType = 'application/x-www-form-urlencoded') {
  return {
    'User-Agent': ANDROID_UA,
    'Cookie': cookie,
    'X-CSRFToken': csrf,
    'X-IG-App-ID': IG_APP_ID,
    'X-Instagram-AJAX': '1',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': contentType,
    'Origin': 'https://www.instagram.com',
    'Referer': 'https://www.instagram.com/direct/inbox/',
    'Sec-Fetch-Site': 'same-site',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
  };
}

// Strategy 1: Direct thread send (works for existing conversations)
async function sendViaThread(recipientId: string, text: string, cookie: string, csrf: string) {
  // First, get or create a thread
  const createBody = new URLSearchParams();
  createBody.append('recipient_users', JSON.stringify([recipientId]));

  const createRes = await fetch('https://i.instagram.com/api/v1/direct_v2/create_group_thread/', {
    method: 'POST',
    headers: makeHeaders(cookie, csrf),
    body: createBody.toString(),
  });
  const createData = await createRes.json();
  const threadId = createData.thread_id;
  if (!threadId) return { ok: false, data: createData, method: 'create_thread' };

  // Send message to the thread
  const sendBody = new URLSearchParams();
  sendBody.append('text', text);
  sendBody.append('action', 'send_item');
  sendBody.append('thread_ids', JSON.stringify([threadId]));

  const sendRes = await fetch('https://i.instagram.com/api/v1/direct_v2/threads/broadcast/text/', {
    method: 'POST',
    headers: makeHeaders(cookie, csrf),
    body: sendBody.toString(),
  });
  const sendData = await sendRes.json();
  if (sendRes.ok && sendData.status === 'ok') {
    return { ok: true, data: { thread_id: threadId, ...sendData.payload }, method: 'thread' };
  }
  return { ok: false, data: sendData, method: 'thread_send' };
}

// Strategy 2: Broadcast (works for mutual followers)
async function sendViaBroadcast(recipientId: string, text: string, cookie: string, csrf: string) {
  const formData = new URLSearchParams();
  formData.append('recipient_users', JSON.stringify([recipientId]));
  formData.append('text', text);
  formData.append('action', 'send_item');

  const res = await fetch('https://i.instagram.com/api/v1/direct_v2/threads/broadcast/text/', {
    method: 'POST',
    headers: makeHeaders(cookie, csrf),
    body: formData.toString(),
  });
  const data = await res.json();
  if (res.ok && data.status === 'ok') {
    return { ok: true, data: data.payload, method: 'broadcast' };
  }
  return { ok: false, data, method: 'broadcast' };
}

// Strategy 3: Web endpoint (different rate limits)
async function sendViaWeb(recipientId: string, text: string, cookie: string, csrf: string) {
  const payload = {
    action: 'send_item',
    is_shh_mode: false,
    send_attribution: 'direct_thread',
    client_context: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
    mutation_token: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
    text: text,
    offline_threading_id: `${Date.now()}`,
    recipient_users: [recipientId],
  };

  const res = await fetch('https://www.instagram.com/api/v1/direct_v2/threads/broadcast/text/', {
    method: 'POST',
    headers: makeHeaders(cookie, csrf, 'application/json'),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (res.ok && data.status === 'ok') {
    return { ok: true, data: data.payload, method: 'web' };
  }
  return { ok: false, data, method: 'web' };
}

export async function POST(req: NextRequest) {
  try {
    const { recipientIds, text, sessionCookie } = await req.json();

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json({ error: 'recipientIds é obrigatório (array de IDs)' }, { status: 400 });
    }
    if (!text) {
      return NextResponse.json({ error: 'text é obrigatório' }, { status: 400 });
    }

    const cookie = sessionCookie || process.env.INSTAGRAM_SESSION_COOKIE;
    if (!cookie) {
      return NextResponse.json({ error: 'Session cookie não configurado' }, { status: 401 });
    }

    const csrfToken = extractCsrfToken(cookie);
    if (!csrfToken) {
      return NextResponse.json({ error: 'csrftoken não encontrado nos cookies' }, { status: 400 });
    }

    const recipientId = recipientIds[0];

    // Try all strategies in order
    const strategies = [
      () => sendViaBroadcast(recipientId, text, cookie, csrfToken),
      () => sendViaThread(recipientId, text, cookie, csrfToken),
      () => sendViaWeb(recipientId, text, cookie, csrfToken),
    ];

    for (const strategy of strategies) {
      const result = await strategy();
      if (result.ok) {
        return NextResponse.json({
          success: true,
          method: result.method,
          data: result.data,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // All strategies failed
    return NextResponse.json(
      {
        error: 'Todas as estratégias falharam',
        hint: 'O Instagram bloqueia DMs para contas sem interação prévia. Siga a conta primeiro ou espere ela interagir com você.',
        error_code: 4415001,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[IG-SEND-DM] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}
