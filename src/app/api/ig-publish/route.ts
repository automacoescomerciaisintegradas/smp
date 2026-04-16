import { NextRequest, NextResponse } from 'next/server';

const API_VERSION = process.env.META_API_VERSION || 'v23.0';
const GRAPH_BASE = 'https://graph.facebook.com';
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || '';

interface PublishRequest {
  accessToken?: string;
  caption: string;
  imageUrls: string[];  // 1 = single post, 2-10 = carousel
  igUserId?: string;    // Will be fetched if not provided
}

// Get Instagram Business Account ID from token
async function getIgUserId(token: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://graph.instagram.com/${API_VERSION}/me?fields=id,username&access_token=${token}`
    );
    const data = await res.json();
    return data.id || null;
  } catch {
    return null;
  }
}

function normalizeMediaUrl(rawUrl: string): { url?: string; error?: string } {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return { error: 'URL vazia' };
  }

  if (/^(blob:|data:|file:)/i.test(trimmed)) {
    return { error: 'URL local (blob/data/file) não é suportada. Use uma URL pública.' };
  }

  let normalized = trimmed;
  if (trimmed.startsWith('/')) {
    if (!PUBLIC_BASE_URL) {
      return { error: 'URL relativa fornecida, mas NEXT_PUBLIC_APP_URL não está configurada.' };
    }
    normalized = `${PUBLIC_BASE_URL}${trimmed}`;
  }

  if (!/^https?:\/\//i.test(normalized)) {
    return { error: 'URL inválida. Use http ou https.' };
  }

  try {
    const hostname = new URL(normalized).hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
      return { error: 'URLs locais (localhost) não são acessíveis pelo Instagram. Use uma URL pública.' };
    }
  } catch {
    return { error: 'URL inválida.' };
  }

  return { url: normalized };
}

// Step 1: Create media container (single image or carousel item)
async function createMediaContainer(
  igUserId: string,
  token: string,
  imageUrl: string,
  caption?: string,
  isCarouselItem = false
): Promise<{ id?: string; error?: string }> {
  const params = new URLSearchParams();
  params.append('image_url', imageUrl);
  params.append('access_token', token);

  if (isCarouselItem) {
    params.append('is_carousel_item', 'true');
  } else if (caption) {
    params.append('caption', caption);
  }

  console.log(`[IG-PUBLISH] Usando API ${API_VERSION} para conta ${igUserId}`);
  const res = await fetch(
    `${GRAPH_BASE}/${API_VERSION}/${igUserId}/media`,
    { method: 'POST', body: params }
  );

  const data = await res.json();

  if (data.id) {
    return { id: data.id };
  }
  
  // Reporte de erro completo para debug
  const errorMsg = data.error?.error_user_msg || data.error?.message || 'Falha ao criar container';
  console.error(`[IG-PUBLISH] Erro: ${errorMsg}`, data.error);
  
  return { error: errorMsg };
}

// Step 2: Create carousel container
async function createCarouselContainer(
  igUserId: string,
  token: string,
  childrenIds: string[],
  caption: string
): Promise<{ id?: string; error?: string }> {
  const params = new URLSearchParams();
  params.append('media_type', 'CAROUSEL');
  params.append('caption', caption);
  params.append('children', childrenIds.join(','));
  params.append('access_token', token);

  const res = await fetch(
    `${GRAPH_BASE}/${API_VERSION}/${igUserId}/media`,
    { method: 'POST', body: params }
  );

  const data = await res.json();

  if (data.id) {
    return { id: data.id };
  }
  return { error: data.error?.message || 'Falha ao criar container de carrossel' };
}

// Step 3: Publish the container
async function publishMedia(
  igUserId: string,
  token: string,
  creationId: string
): Promise<{ id?: string; error?: string }> {
  const params = new URLSearchParams();
  params.append('creation_id', creationId);
  params.append('access_token', token);

  const res = await fetch(
    `${GRAPH_BASE}/${API_VERSION}/${igUserId}/media_publish`,
    { method: 'POST', body: params }
  );

  const data = await res.json();

  if (data.id) {
    return { id: data.id };
  }
  return { error: data.error?.message || 'Falha ao publicar mídia' };
}

// Check container status (for async processing)
async function checkContainerStatus(
  containerId: string,
  token: string
): Promise<{ status: string; error?: string }> {
  const res = await fetch(
    `${GRAPH_BASE}/${API_VERSION}/${containerId}?fields=status_code,status&access_token=${token}`
  );
  const data = await res.json();
  return { status: data.status_code || 'UNKNOWN', error: data.status };
}

// Wait for container to be ready
async function waitForContainer(
  containerId: string,
  token: string,
  maxAttempts = 30
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const { status } = await checkContainerStatus(containerId, token);
    if (status === 'FINISHED') return true;
    if (status === 'ERROR') return false;
    await new Promise(r => setTimeout(r, 2000));
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PublishRequest;
    const token = body.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: 'Token de acesso não configurado' },
        { status: 401 }
      );
    }

    // Alerta sobre tipo de token incompatível
    if (token.startsWith('IGAA')) {
      return NextResponse.json(
        { 
          error: 'Token incompatível', 
          details: 'Você está usando um token "Basic Display" (IGAA). Para publicar, você precisa de um token "Graph API" (EA) gerado via login do Facebook Business.' 
        },
        { status: 403 }
      );
    }

    if (!body.imageUrls || body.imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos uma URL de imagem é obrigatória' },
        { status: 400 }
      );
    }

    if (body.imageUrls.length > 10) {
      return NextResponse.json(
        { error: 'Máximo de 10 imagens por carrossel' },
        { status: 400 }
      );
    }

    if (!body.caption?.trim()) {
      return NextResponse.json(
        { error: 'Caption é obrigatório' },
        { status: 400 }
      );
    }

    const normalizedUrls: string[] = [];
    const urlErrors: string[] = [];

    body.imageUrls.forEach((url, index) => {
      const normalized = normalizeMediaUrl(url);
      if (!normalized.url) {
        urlErrors.push(`Slide ${index + 1}: ${normalized.error}`);
        return;
      }
      normalizedUrls.push(normalized.url);
    });

    if (urlErrors.length > 0) {
      return NextResponse.json(
        { error: 'URLs inválidas para publicação', details: urlErrors },
        { status: 400 }
      );
    }

    // Get IG User ID from Env or API
    let igUserId: string | undefined = body.igUserId || process.env.INSTAGRAM_ACCOUNT_ID || undefined;
    
    if (!igUserId) {
      igUserId = (await getIgUserId(token)) || undefined;
    }

    if (!igUserId) {
      return NextResponse.json(
        { error: 'Não foi possível obter o ID da conta Instagram. Configure INSTAGRAM_ACCOUNT_ID no .env.local' },
        { status: 400 }
      );
    }

    const isCarousel = normalizedUrls.length > 1;

    if (isCarousel) {
      // === CAROUSEL FLOW ===
      // Step 1: Create individual item containers
      const childrenIds: string[] = [];
      const errors: string[] = [];

      for (let i = 0; i < normalizedUrls.length; i++) {
        const result = await createMediaContainer(igUserId, token, normalizedUrls[i], undefined, true);
        if (result.id) {
          childrenIds.push(result.id);
        } else {
          errors.push(`Slide ${i + 1}: ${result.error}`);
        }
      }

      if (childrenIds.length < 2) {
        return NextResponse.json(
          { error: 'Carrossel precisa de pelo menos 2 imagens válidas', details: errors },
          { status: 400 }
        );
      }

      // Step 2: Wait for all items to be processed
      for (const childId of childrenIds) {
        const ready = await waitForContainer(childId, token);
        if (!ready) {
          return NextResponse.json(
            { error: `Container ${childId} falhou no processamento` },
            { status: 500 }
          );
        }
      }

      // Step 3: Create carousel container
      const carousel = await createCarouselContainer(igUserId, token, childrenIds, body.caption);
      if (!carousel.id) {
        return NextResponse.json(
          { error: carousel.error || 'Falha ao criar carrossel' },
          { status: 500 }
        );
      }

      // Step 4: Wait for carousel to be ready
      const carouselReady = await waitForContainer(carousel.id, token);
      if (!carouselReady) {
        return NextResponse.json(
          { error: 'Carrossel não ficou pronto no tempo esperado' },
          { status: 500 }
        );
      }

      // Step 5: Publish
      const published = await publishMedia(igUserId, token, carousel.id);
      if (!published.id) {
        return NextResponse.json(
          { error: published.error || 'Falha ao publicar carrossel' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        type: 'carousel',
        data: {
          media_id: published.id,
          slides: childrenIds.length,
          ig_user_id: igUserId,
        },
        timestamp: new Date().toISOString(),
      });

    } else {
      // === SINGLE POST FLOW ===
      // Step 1: Create container
      const container = await createMediaContainer(igUserId, token, normalizedUrls[0], body.caption);
      if (!container.id) {
        return NextResponse.json(
          { error: container.error || 'Falha ao criar container' },
          { status: 500 }
        );
      }

      // Step 2: Wait for processing
      const ready = await waitForContainer(container.id, token);
      if (!ready) {
        return NextResponse.json(
          { error: 'Container não ficou pronto no tempo esperado' },
          { status: 500 }
        );
      }

      // Step 3: Publish
      const published = await publishMedia(igUserId, token, container.id);
      if (!published.id) {
        return NextResponse.json(
          { error: published.error || 'Falha ao publicar' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        type: 'single',
        data: {
          media_id: published.id,
          ig_user_id: igUserId,
        },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('[IG-PUBLISH] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    );
  }
}
