// Instagram Publisher Utilities

export interface CaptionAnalysis {
  length: number;
  maxLength: number;
  hashtagCount: number;
  mentionCount: number;
  emojiCount: number;
  lineCount: number;
  firstLineHook: string;
  hasCTA: boolean;
  readability: 'high' | 'medium' | 'low';
}

/**
 * Analisa uma caption e retorna métricas úteis
 */
export function analyzeCaption(caption: string): CaptionAnalysis {
  const maxLength = 2200;
  
  // Count hashtags
  const hashtags = caption.match(/#[a-zA-Z0-9_áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+/g) || [];
  
  // Count mentions
  const mentions = caption.match(/@[a-zA-Z0-9_.]+/g) || [];
  
  // Count emojis (basic detection)
  const emojis = caption.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || [];
  
  // Count lines
  const lines = caption.split('\n').filter(line => line.trim().length > 0);
  
  // Get first line (hook)
  const firstLine = caption.split('\n')[0] || '';
  
  // Check for CTA keywords
  const ctaKeywords = ['salve', 'compartilhe', 'siga', 'comment', 'link na bio', 'clique', 'saiba mais', 'confira'];
  const hasCTA = ctaKeywords.some(keyword => 
    caption.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Readability score
  const avgLineLength = caption.length / (lines.length || 1);
  let readability: 'high' | 'medium' | 'low' = 'medium';
  
  if (avgLineLength < 80 && lines.length > 3) {
    readability = 'high'; // Short lines, good spacing
  } else if (avgLineLength > 150 || lines.length <= 1) {
    readability = 'low'; // Dense text
  }
  
  return {
    length: caption.length,
    maxLength,
    hashtagCount: hashtags.length,
    mentionCount: mentions.length,
    emojiCount: emojis.length,
    lineCount: lines.length,
    firstLineHook: firstLine.slice(0, 125), // First 125 chars before "...more"
    hasCTA,
    readability
  };
}

/**
 * Extrai hashtags de uma string e retorna array
 */
export function extractHashtags(caption: string): string[] {
  return caption.match(/#[a-zA-Z0-9_áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+/g) || [];
}

/**
 * Valida URLs de imagens (básico)
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    // For blob URLs (local files), assume valid
    if (url.startsWith('blob:')) return true;
    
    // For HTTP URLs, try to fetch headers only
    const response = await fetch(url, { method: 'HEAD' });
    
    if (!response.ok) return false;
    
    const contentType = response.headers.get('content-type');
    return contentType?.startsWith('image/') || false;
  } catch {
    return false;
  }
}

/**
 * Gera sugestão de hashtags baseada no conteúdo
 */
export function suggestHashtags(caption: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'marketing': ['#marketing', '#marketingdigital', '#socialmedia', '#contentmarketing'],
    'venda': ['#vendas', '#ecommerce', '#vendasonline', '#faturamento'],
    'instagram': ['#instagram', '#instagramtips', '#instagrowth', '#socialmediamarketing'],
    'negócio': ['#negócios', '#empreendedorismo', '#business', '#empreender'],
    'design': ['#design', '#graphicdesign', '#branding', '#visualidentity'],
    'tecnologia': ['#tecnologia', '#tech', '#inovação', '#startup'],
    'produtividade': ['#produtividade', '#foco', '#gestão', '#timemanagement'],
    'mindset': ['#mindset', '#crescimentopessoal', '#desenvolvimentopessoal', '#sucesso'],
  };
  
  const suggested: string[] = [];
  const lowerCaption = caption.toLowerCase();
  
  for (const [keyword, tags] of Object.entries(keywordMap)) {
    if (lowerCaption.includes(keyword)) {
      suggested.push(...tags);
    }
  }
  
  // Add generic tags if no matches
  if (suggested.length === 0) {
    suggested.push('#marketing', '#empreendedorismo', '#business', '#sucesso');
  }
  
  // Return unique tags, max 15
  return [...new Set(suggested)].slice(0, 15);
}

/**
 * Formata caption para Instagram (adiciona espaçamento)
 */
export function formatCaptionForInstagram(text: string): string {
  // Replace multiple newlines with double newlines (IG spacing)
  let formatted = text.replace(/\n{3,}/g, '\n\n');
  
  // Add space after emojis if missing
  formatted = formatted.replace(/([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])([^\s\n])/gu, '$1 $2');
  
  return formatted;
}

/**
 * Calcula score de engajamento estimado (heurístico)
 */
export function estimateEngagementScore(analysis: CaptionAnalysis): number {
  let score = 50; // Base score
  
  // Hashtags (ideal: 10-20)
  if (analysis.hashtagCount >= 10 && analysis.hashtagCount <= 20) {
    score += 15;
  } else if (analysis.hashtagCount > 0) {
    score += 5;
  }
  
  // CTA presence
  if (analysis.hasCTA) {
    score += 15;
  }
  
  // Readability
  if (analysis.readability === 'high') {
    score += 10;
  } else if (analysis.readability === 'medium') {
    score += 5;
  }
  
  // Emoji usage (sweet spot: 3-7)
  if (analysis.emojiCount >= 3 && analysis.emojiCount <= 7) {
    score += 10;
  } else if (analysis.emojiCount > 0) {
    score += 5;
  }
  
  // First line hook length (ideal: 60-120 chars)
  if (analysis.firstLineHook.length >= 60 && analysis.firstLineHook.length <= 120) {
    score += 10;
  } else if (analysis.firstLineHook.length > 0) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Exporta post para JSON (backup/sharing)
 */
export function exportPostToJson(caption: string, imageUrls: string[]) {
  const validUrls = imageUrls.filter(url => url.trim().length > 0);
  
  const postData = {
    caption,
    imageUrls: validUrls,
    isCarousel: validUrls.length > 1,
    exportedAt: new Date().toISOString(),
    strategy: {
      structure: validUrls.length > 1 ? 'carousel' : 'single',
      slides: validUrls.length,
      captionLength: caption.length,
      hashtags: extractHashtags(caption)
    }
  };
  
  const blob = new Blob([JSON.stringify(postData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `post-${Date.now()}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Importa post de JSON
 */
export function importPostFromJson(): Promise<{ caption: string; imageUrls: string[] } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          resolve({
            caption: data.caption || '',
            imageUrls: data.imageUrls || []
          });
        } catch {
          resolve(null);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  });
}
