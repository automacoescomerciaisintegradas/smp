import { GoogleGenerativeAI } from "@google/generative-ai";
import { appConfig } from "@/config/app-config";
import { prisma } from "@/lib/prisma";

/**
 * Utilitário de AI para Automação de Comentários (Módulo 3) com Base de Conhecimento (Módulo 2)
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateSmartReply(commentText: string, username: string, businessName: string = appConfig.productName): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Módulo 2: Buscar contexto relevante da Base de Conhecimento
    const knowledgeItems = await prisma.knowledgeBase.findMany({
      take: 5, // Pegar os mais recentes/importantes
      orderBy: { updatedAt: 'desc' }
    });

    const businessContext = knowledgeItems.map(item => `- ${item.title}: ${item.content}`).join('\n');

    const prompt = `
      Você é um assistente de redes sociais para a marca "${businessName}".
      
      CONTEXTO DO NEGÓCIO (Use estas informações para responder se relevante):
      ${businessContext || "Nenhuma informação específica fornecida. Use seu conhecimento geral da marca."}
      
      Sua tarefa é responder a um comentário de um usuário no Instagram de forma amigável, profissional e engajadora.
      
      Regras:
      1. Use o nome do usuário (@${username}) na resposta.
      2. Seja conciso (máximo 2 sentenças).
      3. Use emojis para tornar a resposta calorosa.
      4. Se o usuário estiver perguntando sobre algo que você não sabe, convide-o gentilmente para falar via Direct.
      5. Nunca invente informações que não estejam no contexto acima.
      6. Responda em Português do Brasil.
      
      Comentário do usuário: "${commentText}"
      
      Resposta:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Limpeza básica se a IA retornar aspas
    text = text.replace(/^["']|["']$/g, '');

    return text;
  } catch (error) {
    console.error('❌ Erro ao gerar resposta com Gemini:', error);
    // Fallback amigável
    return `Olá @${username}! Que bom ter você por aqui. ✨ Como podemos te ajudar hoje?`;
  }
}
