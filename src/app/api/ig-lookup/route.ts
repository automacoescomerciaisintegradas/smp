import { NextRequest, NextResponse } from 'next/server';

const IG_APP_ID = '936619743392459';
const ANDROID_UA = 'Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2400; samsung; SM-G991B; o1s; exynos2100; en_US; 458229258)';

// Strategy 1: web_profile_info (most data, rate-limited)
async function lookupViaWebProfile(username: string, cookie: string) {
  const res = await fetch(
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
    {
      headers: {
        'User-Agent': ANDROID_UA,
        'Cookie': cookie,
        'X-IG-App-ID': IG_APP_ID,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const user = data?.data?.user;
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    profile_pic_url: user.profile_pic_url,
    followers: user.edge_followed_by?.count,
    following: user.edge_follow?.count,
    posts_count: user.edge_owner_to_timeline_media?.count,
    is_private: user.is_private,
    is_verified: user.is_verified,
    biography: user.biography,
  };
}

// Strategy 2: search endpoint (less data, different rate limit)
async function lookupViaSearch(username: string, cookie: string) {
  const res = await fetch(
    `https://i.instagram.com/api/v1/users/search/?q=${encodeURIComponent(username)}&count=5`,
    {
      headers: {
        'User-Agent': ANDROID_UA,
        'Cookie': cookie,
        'X-IG-App-ID': IG_APP_ID,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const users = data?.users || [];
  const exactMatch = users.find((u: any) => u.username?.toLowerCase() === username.toLowerCase());

  if (!exactMatch) return null;

  return {
    id: String(exactMatch.pk),
    username: exactMatch.username,
    full_name: exactMatch.full_name,
    profile_pic_url: exactMatch.profile_pic_url,
    followers: exactMatch.follower_count,
    following: exactMatch.following_count,
    posts_count: exactMatch.media_count,
    is_private: exactMatch.is_private,
    is_verified: exactMatch.is_verified,
    biography: '',
  };
}

// Strategy 3: Graph API (if token available, most reliable)
async function lookupViaGraphAPI(username: string) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;

  try {
    // Search via business discovery
    const igUserId = await getIgUserId(token);
    if (!igUserId) return null;

    const fields = 'username,name,profile_picture_url,followers_count,follows_count,media_count,biography';
    const res = await fetch(
      `https://graph.instagram.com/v23.0/${igUserId}?fields=business_discovery.fields(${fields}){username=${username}}&access_token=${token}`
    );

    if (!res.ok) return null;

    const data = await res.json();
    const bd = data?.business_discovery;
    if (!bd) return null;

    return {
      id: bd.id,
      username: bd.username,
      full_name: bd.name || '',
      profile_pic_url: bd.profile_picture_url,
      followers: bd.followers_count,
      following: bd.follows_count,
      posts_count: bd.media_count,
      is_private: false,
      is_verified: false,
      biography: bd.biography || '',
    };
  } catch {
    return null;
  }
}

async function getIgUserId(token: string): Promise<string | null> {
  try {
    const res = await fetch(`https://graph.instagram.com/v23.0/me?fields=id&access_token=${token}`);
    const data = await res.json();
    return data.id || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, sessionCookie } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'username é obrigatório' }, { status: 400 });
    }

    const cookie = sessionCookie || process.env.INSTAGRAM_SESSION_COOKIE;
    const cleanUsername = username.replace('@', '').trim();

    // Try strategies in order (fastest/most-reliable first)
    const strategies = [
      { name: 'graph_api', fn: () => lookupViaGraphAPI(cleanUsername) },
      { name: 'search', fn: () => cookie ? lookupViaSearch(cleanUsername, cookie) : null },
      { name: 'web_profile', fn: () => cookie ? lookupViaWebProfile(cleanUsername, cookie) : null },
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy.fn();
        if (result) {
          return NextResponse.json({
            success: true,
            method: strategy.name,
            data: result,
          });
        }
      } catch {
        // try next strategy
      }
    }

    return NextResponse.json(
      { error: `Usuário @${cleanUsername} não encontrado. Todas as estratégias falharam (possível rate-limit).` },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}
