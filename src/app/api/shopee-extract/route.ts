import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    let targetUrl = url;
    
    // 1. Lidar com links encurtados (s.shopee.com.br)
    if (url.includes('s.shopee.com.br')) {
      console.log(`[SHOPEE-EXTRACT] Seguindo redirecionamento de link curto: ${url}`);
      try {
        const h = await fetch(url, { 
          method: 'HEAD', 
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          }
        });
        targetUrl = h.url;
        console.log(`[SHOPEE-EXTRACT] URL Final: ${targetUrl}`);
      } catch (e) {
        console.error('[SHOPEE-EXTRACT] Erro ao seguir redirect:', e);
      }
    }

    console.log(`[SHOPEE-EXTRACT] Extraindo de: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });

    const html = await response.text();
    console.log(`[SHOPEE-EXTRACT] HTML recebido, tamanho: ${html.length}`);

    // Regex para extrair metadados OG (Open Graph)
    let titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i);
    let imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
    const descriptionMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);

    // Fallbacks para título
    if (!titleMatch) titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (!titleMatch) titleMatch = html.match(/"name":\s?"([^"]+)"/i);

    // Fallbacks para imagem
    if (!imageMatch) imageMatch = html.match(/"image":\s?"([^"]+)"/i);
    if (!imageMatch) imageMatch = html.match(/https:\/\/down-[a-z]+\.img\.susercontent\.com\/file\/([a-zA-Z0-9_-]+)/i);

    // Tentar extrair preço com regex mais abrangente
    const priceMatch = html.match(/R\$\s?([0-9.,]+)/i) || html.match(/"price":\s?([0-9.]+)/i) || html.match(/"amount":\s?([0-9.]+)/i);

    let title = titleMatch ? titleMatch[1].split('|')[0].trim() : 'Produto Shopee';
    // Limpar escapes comuns em JSON
    title = title.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
    title = title.replace(/\\/g, '');

    let imageUrl = imageMatch ? imageMatch[1] : '';
    
    // Normalização de URL de imagem
    if (imageUrl) {
        if (imageUrl.startsWith('//')) {
            imageUrl = 'https:' + imageUrl;
        } else if (!imageUrl.startsWith('http') && imageUrl.length > 20) {
            imageUrl = `https://down-br.img.susercontent.com/file/${imageUrl}`;
        }
    }

    const description = descriptionMatch ? descriptionMatch[1] : '';
    let price = 0;
    
    if (priceMatch) {
       if (priceMatch[0].includes('R$')) {
          price = parseFloat(priceMatch[1].replace('.', '').replace(',', '.'));
       } else {
          price = parseFloat(priceMatch[1]);
          if (price > 1000) price = price / 100000;
       }
    }

    // Se falhou em pegar a imagem via OG, tenta buscar no JSON interno
    if (!imageUrl || imageUrl.includes('placeholder')) {
        const scriptMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
        if (scriptMatch) {
            try {
                const ldJson = JSON.parse(scriptMatch[1]);
                if (ldJson.image) imageUrl = Array.isArray(ldJson.image) ? ldJson.image[0] : ldJson.image;
                if (!price && ldJson.offers) {
                    const offerPrice = ldJson.offers.price || ldJson.offers[0]?.price;
                    if (offerPrice) price = parseFloat(offerPrice);
                }
            } catch (e) {}
        }
    }

    // Normalização final da imagem pós-LD+JSON
    if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;


    // fallback final para imagem
    if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
    }

    return NextResponse.json({
      success: true,
      data: {
        id: Math.random().toString(36).substr(2, 9),
        title: title,
        price: price || 0,
        imageUrl: imageUrl,
        affiliateUrl: url, // Mantém a URL original de afiliado
        description: description
      }
    });

  } catch (error) {
    console.error('[SHOPEE-EXTRACT] Erro:', error);
    return NextResponse.json({ error: 'Falha ao extrair dados do produto: ' + (error as Error).message }, { status: 500 });
  }
}

