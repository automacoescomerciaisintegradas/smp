import { NextRequest, NextResponse } from 'next/server';
import { checkMetaHealth } from '@/lib/meta-api';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 400 });
    }

    const health = await checkMetaHealth(token);

    return NextResponse.json(health);
  } catch (error) {
    console.error('[ONBOARDING_HEALTH_CHECK_ERROR]', error);
    return NextResponse.json({ error: 'Erro interno ao realizar health check' }, { status: 500 });
  }
}
