import { NextRequest, NextResponse } from 'next/server';
import { encryptCookie, decryptCookie, validateInstagramCookies } from '@/lib/cookie-encryption';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Cookie store - em produção, usar banco de dados ou Redis
// Por enquanto, usando Map em memória (perde ao reiniciar o servidor)
const cookieStore = new Map<string, string>();

// GET - Obter cookies salvos (apenas metadados, nunca o cookie completo)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const hasSavedCookies = cookieStore.has(userEmail);

    if (!hasSavedCookies) {
      return NextResponse.json({
        success: true,
        hasCookies: false,
        message: 'Nenhum cookie configurado'
      });
    }

    // Retorna apenas validação, nunca o cookie criptografado
    const encryptedCookie = cookieStore.get(userEmail)!;
    const decryptedCookie = decryptCookie(encryptedCookie);
    const validation = validateInstagramCookies(decryptedCookie);

    return NextResponse.json({
      success: true,
      hasCookies: true,
      validation: {
        valid: validation.valid,
        missing: validation.missing,
        present: validation.present
      },
      lastSaved: null // TODO: Adicionar timestamp ao salvar
    });
  } catch (error) {
    console.error('Erro ao obter cookies:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// POST - Salvar cookies criptografados
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { cookieString } = body;

    if (!cookieString || typeof cookieString !== 'string') {
      return NextResponse.json(
        { error: 'Cookie string é obrigatória' },
        { status: 400 }
      );
    }

    // Validar cookies antes de salvar
    const validation = validateInstagramCookies(cookieString);

    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Cookies incompletos',
          missing: validation.missing,
          message: `Cookies obrigatórios faltando: ${validation.missing.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Criptografar e salvar
    const encryptedCookie = encryptCookie(cookieString);
    cookieStore.set(session.user.email, encryptedCookie);

    console.log(`✅ Cookies salvos para usuário: ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Cookies salvos com sucesso',
      validation: {
        valid: validation.valid,
        missing: validation.missing,
        present: validation.present
      }
    });
  } catch (error) {
    console.error('Erro ao salvar cookies:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao salvar cookies',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// DELETE - Remover cookies salvos
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    cookieStore.delete(userEmail);

    console.log(`🗑️ Cookies removidos para usuário: ${userEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Cookies removidos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover cookies:', error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}

// Helper para outras rotas obterem o cookie do usuário
export async function getSavedCookieForUser(userEmail: string): Promise<string | null> {
  const encryptedCookie = cookieStore.get(userEmail);
  
  if (!encryptedCookie) {
    return null;
  }

  try {
    return decryptCookie(encryptedCookie);
  } catch (error) {
    console.error('Erro ao descriptografar cookie:', error);
    return null;
  }
}

// Helper para obter cookie da sessão atual
export async function getCurrentSessionCookie(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  return getSavedCookieForUser(session.user.email);
}

// Exportar cookieStore para uso interno (não exposto na API)
export { cookieStore };
