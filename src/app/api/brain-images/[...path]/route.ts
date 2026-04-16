import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join, normalize, resolve, sep } from 'path';
import { existsSync } from 'fs';

const DEFAULT_BRAIN_BASE_DIR = join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'brain');

function getBrainBaseDir() {
  const configuredBaseDir = process.env.BRAIN_BASE_DIR?.trim();
  return resolve(configuredBaseDir || DEFAULT_BRAIN_BASE_DIR);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const relativePath = pathSegments.join('/');
    const brainBaseDir = getBrainBaseDir();
    
    // Constrói o caminho absoluto final
    const absolutePath = resolve(brainBaseDir, relativePath);

    // Segurança: Garante que o arquivo está dentro da pasta brain e não tentou sair via ../
    const normalizedPath = normalize(absolutePath);
    const normalizedBaseDir = normalize(brainBaseDir + sep);
    if (normalizedPath !== normalize(brainBaseDir) && !normalizedPath.startsWith(normalizedBaseDir)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (!existsSync(absolutePath)) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    // Lê o arquivo
    const fileBuffer = await readFile(absolutePath);
    
    // Determina o Content-Type básica pela extensão
    const ext = absolutePath.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    };
    
    const contentType = (ext && mimeTypes[ext]) || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[BRAIN_IMAGES_API_ERROR]', error);
    return NextResponse.json({ error: 'Erro ao processar imagem' }, { status: 500 });
  }
}
