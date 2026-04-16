import { NextRequest, NextResponse } from 'next/server';

const IG_APP_ID = '936619743392459';
const ANDROID_UA = 'Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2400; samsung; SM-G991B; o1s; exynos2100; en_US; 458229258)';

export async function POST(req: NextRequest) {
  try {
    const { sessionCookie, limit } = await req.json();

    const cookie = sessionCookie || process.env.INSTAGRAM_SESSION_COOKIE;
    if (!cookie) {
      return NextResponse.json({ error: 'Session cookie não configurado' }, { status: 401 });
    }

    const csrfMatch = cookie.match(/csrftoken=([^;]+)/);
    const csrf = csrfMatch ? csrfMatch[1] : '';

    const res = await fetch(
      `https://i.instagram.com/api/v1/direct_v2/inbox/?persistentBadging=true&folder=&limit=${limit || 20}&thread_message_limit=1`,
      {
        headers: {
          'User-Agent': ANDROID_UA,
          'Cookie': cookie,
          'X-CSRFToken': csrf,
          'X-IG-App-ID': IG_APP_ID,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Instagram retornou ${res.status}`, details: text.substring(0, 300) },
        { status: res.status }
      );
    }

    const data = await res.json();
    const threads = data.inbox?.threads || [];

    const conversations = threads.map((thread: any) => ({
      thread_id: thread.thread_id,
      thread_title: thread.thread_title,
      users: thread.users?.map((u: any) => ({
        pk: String(u.pk),
        username: u.username,
        full_name: u.full_name,
        profile_pic_url: u.profile_pic_url,
      })) || [],
      last_message: thread.items?.[0]?.text || thread.items?.[0]?.item_type || '',
      last_activity_at: thread.last_activity_at,
      is_group: thread.is_group,
      read_state: thread.read_state,
    }));

    return NextResponse.json({
      success: true,
      data: conversations,
      count: conversations.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[IG-INBOX] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}
