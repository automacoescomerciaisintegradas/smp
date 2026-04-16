import { NextResponse } from "next/server";
import { saveToVectorStore } from "@/lib/gemini-vectors";

export async function POST(req: Request) {
  try {
    const { content, type, tags, assetUrl, dimensions } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "O campo 'content' é obrigatório." }, { status: 400 });
    }

    // Gerando ID único para o teste
    const id = `test_${Date.now()}`;

    // Executando o motor de inteligência
    const result = await saveToVectorStore({
      id,
      type: type || 'text',
      content,
      url: assetUrl,
      tags: tags || ['test', 'gemini-v2'],
      // @ts-ignore (Adicionando suporte a dimensões no engine)
      dimensions: dimensions || 768
    });

    return NextResponse.json({
      message: "Processamento vetorial concluído com sucesso!",
      id,
      cloudflare_response: result
    });

  } catch (error: any) {
    console.error("Erro na rota de vetores:", error);
    return NextResponse.json({ 
      error: "Falha ao processar vetor.", 
      details: error.message 
    }, { status: 500 });
  }
}
