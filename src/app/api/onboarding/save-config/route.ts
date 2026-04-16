import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkMetaHealth } from '@/lib/meta-api';

export async function POST(req: NextRequest) {
  try {
    const { token, userId } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 });
    }

    // 1. Re-validar saúde antes de salvar
    const health = await checkMetaHealth(token);
    if (health.status === 'unhealthy') {
      return NextResponse.json({ 
        error: 'Não é possível salvar um token inválido ou com permissões faltando.',
        details: health.details 
      }, { status: 400 });
    }

    // 2. Persistir no Banco de Dados
    // Para simplificar agora, se não houver userId (ex: modo demo), buscamos o primeiro usuário ou criamos um temporário.
    let targetUserId = userId;
    
    if (!targetUserId) {
      const user = await prisma.user.findFirst();
      if (!user) {
        // Criar usuário admin padrão se não existir nenhum
        const newUser = await prisma.user.create({
          data: {
            email: 'admin@instabot.ai',
            name: 'InstaBot Admin'
          }
        });
        targetUserId = newUser.id;
      } else {
        targetUserId = user.id;
      }
    }

    const igAccount = await prisma.instagramAccount.upsert({
      where: { instagramId: health.details.business_account.id! },
      update: {
        accessToken: token,
        username: health.details.business_account.username,
        updatedAt: new Date(),
      },
      create: {
        userId: targetUserId,
        instagramId: health.details.business_account.id!,
        accessToken: token,
        username: health.details.business_account.username,
      },
    });

    return NextResponse.json({ 
      success: true, 
      account: igAccount 
    });

  } catch (error) {
    console.error('[ONBOARDING_SAVE_CONFIG_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao salvar configuração no banco de dados' }, { status: 500 });
  }
}
