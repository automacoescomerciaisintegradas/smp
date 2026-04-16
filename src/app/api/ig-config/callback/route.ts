import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { appConfig } from '@/config/app-config';
import {
  getMetaAppCredentials,
  readAppEnv,
  resolveAppBaseUrl,
  resolveInstagramRedirectUri,
} from '@/config/app-env.server';

type PagesResponse = {
  data?: Array<{
    name?: string;
    instagram_business_account?: {
      id: string;
    };
  }>;
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ error: 'Code not found' }, { status: 400 });
  }

  try {
    const { clientId, clientSecret } = getMetaAppCredentials();
    if (!clientId || !clientSecret) {
      console.error('[IG-CONFIG] Missing META_APP_ID/FACEBOOK_CLIENT_ID or META_APP_SECRET/FACEBOOK_CLIENT_SECRET');
      return NextResponse.json(
        { error: 'Credenciais do app Meta não configuradas.' },
        { status: 500 }
      );
    }
    const baseUrl = resolveAppBaseUrl(process.env, req.nextUrl.origin);
    const redirectUri = resolveInstagramRedirectUri(process.env, baseUrl);
    const { META_API_VERSION } = readAppEnv();
    const API_VERSION = META_API_VERSION;

    console.log(`[IG-CONFIG] Iniciando troca de código por token (v${API_VERSION})...`);

    // 1. Troca o CODE pelo Short-Lived Token
    const url = `https://graph.facebook.com/${API_VERSION}/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;
    
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
       console.error('[IG-CONFIG] Erro na troca do código:', data.error);
       return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    const shortToken = data.access_token;

    // 2. Troca pelo Long-Lived Token (Dura 60 dias)
    const longTokenUrl = `https://graph.facebook.com/${API_VERSION}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortToken}`;
    
    const longRes = await fetch(longTokenUrl);
    const longData = await longRes.json();
    const token = longData.access_token;

    // 3. BUSCAR AUTOMATICAMENTE O ID DA CONTA DO INSTAGRAM
    // Precisamos primeiro listar as páginas e depois buscar a conta comercial vinculada
    let igAccountId = "";
    try {
        const pagesUrl = `https://graph.facebook.com/${API_VERSION}/me/accounts?fields=instagram_business_account,name&access_token=${token}`;
        const pagesRes = await fetch(pagesUrl);
        const pagesData = (await pagesRes.json()) as PagesResponse;
        
        if (pagesData.data && pagesData.data.length > 0) {
            // Pega a primeira conta que possui um instagram_business_account vinculado
            const linkedPage = pagesData.data.find((p) => p.instagram_business_account?.id);
            if (linkedPage?.instagram_business_account?.id) {
                igAccountId = linkedPage.instagram_business_account.id;
                console.log(`[IG-CONFIG] Conta do Instagram encontrada: ${igAccountId} (via página ${linkedPage.name})`);
            }
        }
    } catch (e) {
        console.error('[IG-CONFIG] Falha ao buscar IG Account ID automaticamente:', e);
    }

    // 4. PERSISTÊNCIA NO .ENV.LOCAL
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    const updates: Record<string, string> = {
        'INSTAGRAM_ACCESS_TOKEN': token,
        'INSTAGRAM_ACCOUNT_ID': igAccountId || process.env.INSTAGRAM_ACCOUNT_ID || '',
        'FACEBOOK_CLIENT_ID': clientId,
        'META_APP_ID': clientId,
        'META_API_VERSION': API_VERSION
    };

    for (const [key, value] of Object.entries(updates)) {
        if (envContent.includes(`${key}=`)) {
            const regex = new RegExp(`${key}=.*`, 'g');
            envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
            envContent += `\n${key}=${value}`;
        }
    }
    
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    // Atualiza o process.env em tempo real para evitar restart do dev server
    for (const [key, value] of Object.entries(updates)) {
      process.env[key] = value;
    }

    return new NextResponse(`
      <html>
        <head>
          <title>Autenticação Concluída</title>
          <style>
            body { background: #020202; color: white; font-family: -apple-system, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { text-align: center; border: 1px solid #333; padding: 60px; border-radius: 40px; background: rgba(15,15,15,0.8); backdrop-filter: blur(20px); max-width: 400px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
            h1 { color: #f97316; font-size: 32px; font-weight: 900; margin-bottom: 20px; letter-spacing: -1px; }
            p { color: #888; margin-bottom: 40px; line-height: 1.6; }
            .btn { background: #f97316; color: white; padding: 18px 40px; border-radius: 20px; text-decoration: none; font-weight: bold; display: inline-block; transition: all 0.2s; }
            .btn:hover { transform: scale(1.05); filter: brightness(1.1); }
            .badge { background: #1e1e1e; padding: 8px 15px; border-radius: 10px; font-size: 12px; font-family: monospace; color: #555; margin-top: 20px; display: block; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Conectado! 🚀</h1>
            <p>Seu perfil do Instagram foi vinculado ao ${appConfig.productName}.<br>O token de longa duração e o ID da conta foram salvos no sistema.</p>
            <a href="/automation/publisher" class="btn">Voltar para o Publisher</a>
            <span class="badge">Session: Active (v${API_VERSION})</span>
          </div>
          <script>
            // Tenta fechar o popup se o usuário abriu como popup
            setTimeout(() => {
              if (window.name === 'fbLogin') {
                 // window.close(); // Opcional
              }
            }, 3000);
          </script>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } });

  } catch (error) {
    console.error('[IG-CONFIG] Erro fatal no callback:', error);
    return NextResponse.json({ error: 'Erro no callback: ' + (error as Error).message }, { status: 500 });
  }
}
