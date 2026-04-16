import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Permite uploads de até 10MB

export async function POST(request: NextRequest) {
  try {
    // Para ambiente local e Command Center, permitimos upload sem sessão
    // const session = await getServerSession(authOptions)
    
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo não fornecido' },
        { status: 400 }
      )
    }

    // Valida tipo de arquivo
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/quicktime',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP para imagens ou MP4 para vídeos.' },
        { status: 400 }
      )
    }

    // Valida tamanho (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Limite de 10MB.' },
        { status: 400 }
      )
    }

    // Gera nome único para o arquivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const fileName = `upload_${timestamp}_${randomString}.${extension}`

    // Determina se é imagem ou vídeo
    const isVideo = file.type.startsWith('video/')
    const uploadDir = isVideo ? 'videos' : 'images'

    // Cria diretório se não existir
    const publicDir = join(process.cwd(), 'public', 'uploads', uploadDir)
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true })
    }

    // Lê bytes do arquivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Salva arquivo
    const filePath = join(publicDir, fileName)
    await writeFile(filePath, buffer)

    // URL pública do arquivo
    const fileUrl = `/uploads/${uploadDir}/${fileName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('[UPLOAD_POST]', error)
    return NextResponse.json(
      { error: 'Erro no upload do arquivo' },
      { status: 500 }
    )
  }
}
