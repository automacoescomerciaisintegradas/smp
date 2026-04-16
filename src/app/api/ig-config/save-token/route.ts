import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 });
    }

    // 1. Validação básica via Instagram Graph API
    const apiVersion = 'v21.0';
    const validationRes = await fetch(`https://graph.instagram.com/${apiVersion}/me?fields=id,username`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const validationData = await validationRes.json();

    if (!validationRes.ok) {
      return NextResponse.json(
        {
          error: 'Token inválido',
          details: validationData?.error?.message || 'Falha ao validar token',
        },
        { status: 400 }
      );
    }

    // 2. Persistência no .env.local (Mesma lógica do callback)
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, '');
    }
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('INSTAGRAM_ACCESS_TOKEN=')) {
      envContent = envContent.replace(/INSTAGRAM_ACCESS_TOKEN=.*/, `INSTAGRAM_ACCESS_TOKEN=${token}`);
    } else {
      envContent += `\nINSTAGRAM_ACCESS_TOKEN=${token}`;
    }

    if (validationData?.id) {
      if (envContent.includes('INSTAGRAM_ACCOUNT_ID=')) {
        envContent = envContent.replace(/INSTAGRAM_ACCOUNT_ID=.*/, `INSTAGRAM_ACCOUNT_ID=${validationData.id}`);
      } else {
        envContent += `\nINSTAGRAM_ACCOUNT_ID=${validationData.id}`;
      }
    }
    
    fs.writeFileSync(envPath, envContent);
    process.env.INSTAGRAM_ACCESS_TOKEN = token;
    if (validationData?.id) {
      process.env.INSTAGRAM_ACCOUNT_ID = validationData.id;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Token salvo e ativado com sucesso!',
      user: validationData.username || validationData.id
    });

  } catch (error) {
    console.error('[SAVE_TOKEN_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao salvar o token' }, { status: 500 });
  }
}
