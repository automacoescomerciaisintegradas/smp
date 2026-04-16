# 📸 Instagram Publisher

Ferramenta profissional para publicação de posts e carrosséis no Instagram via Graph API.

## 🚀 Acesso Rápido

- **Interface**: `/automation/publisher`
- **API**: `POST /api/ig-publish`
- **Documentação Completa**: [Guia do Publisher](../../docs/instagram-publisher-guide.md)

## ✨ Funcionalidades Implementadas

### 🖼️ Gerenciamento de Imagens
- ✅ **Drag & Drop**: Arraste imagens do computador
- ✅ **Seletor de Arquivos**: Seleção via dialog
- ✅ **URLs Públicas**: Cole links de imagens
- ✅ **Até 10 slides** por carrossel
- ✅ **Reordenação**: Mova slides up/down
- ✅ **Preview em tempo real** estilo Instagram

### 📝 Caption Intelligence
- ✅ **4 Templates Prontos**:
  - 📚 Educativo
  - 📖 Storytelling  
  - 🎯 Promoção
  - 📝 Lista/Dicas
- ✅ **Contador de Caracteres** (limite 2200)
- ✅ **Quick Hashtags**: Botões de tags populares
- ✅ **Validação em tempo real**

### 💾 Sistema de Rascunhos
- ✅ **Salvar posts** para continuar depois
- ✅ **Carregar rascunhos** rapidamente
- ✅ **Persistência local** (localStorage)
- ✅ **Até 20 rascunhos** mantidos

### 🚀 Publicação
- ✅ **Detecção automática**: Single vs Carousel
- ✅ **Feedback visual** por etapas
- ✅ **Polling inteligente** (aguarda Instagram)
- ✅ **Relatório completo** (sucesso/erro)

### 🛠️ Utilitários (`src/lib/publisher-utils.ts`)
- ✅ `analyzeCaption()` - Análise completa de legendas
- ✅ `extractHashtags()` - Extração de hashtags
- ✅ `validateImageUrl()` - Validação de URLs
- ✅ `suggestHashtags()` - Sugestões inteligentes
- ✅ `formatCaptionForInstagram()` - Formatação automática
- ✅ `estimateEngagementScore()` - Score de engajamento
- ✅ `exportPostToJson()` - Backup/export de posts
- ✅ `importPostFromJson()` - Importação de posts

## 📋 Requisitos

### Variáveis de Ambiente
```bash
# Obrigatório
INSTAGRAM_ACCESS_TOKEN=seu_token
INSTAGRAM_ACCOUNT_ID=id_da_conta

# Ou faça OAuth via /api/auth/instagram
```

### Conta Instagram
- ✅ Business ou Creator account
- ✅ Conectada via OAuth (recomendado)
- ✅ Token válido e não expirado

## 🎯 Como Usar

### 1. Acesse o Publisher
```
http://localhost:3000/automation/publisher
```

### 2. Adicione Imagens
- Arraste do computador
- Selecione via dialog
- Cole URLs públicas

### 3. Escreva Legenda
- Use templates prontos OU
- Escreva do zero com quick hashtags

### 4. Publique
- Revise o preview
- Clique em "Publicar Post" ou "Publicar Carrossel"
- Aguarde 30-90 segundos
- Media ID retornado como confirmação

## 🔧 Estrutura de Arquivos

```
src/
├── app/
│   ├── automation/publisher/
│   │   └── page.tsx              # Interface principal
│   └── api/
│       └── ig-publish/
│           └── route.ts          # API de publicação
├── lib/
│   ├── publisher-utils.ts        # Utilitários
│   └── cookie-encryption.ts      # Criptografia de cookies

docs/
└── instagram-publisher-guide.md  # Guia completo
```

## 📊 Métricas de Caption

O publisher analisa automaticamente:

| Métrica | Ideal | Peso |
|---------|-------|------|
| **Hashtags** | 10-20 | 15% |
| **CTA** | Presente | 15% |
| **Readability** | High (parágrafos curtos) | 10% |
| **Emojis** | 3-7 | 10% |
| **First Line Hook** | 60-120 chars | 10% |

**Score Máximo**: 100 pontos

## 🚦 Limitações

| Item | Limite |
|------|--------|
| Imagens por carousel | 10 |
| Caracteres caption | 2,200 |
| Posts por hora | ~200 (API limit) |
| Tamanho máximo imagem | 10MB |
| Formatos | JPG, PNG |

## 💡 Dicas Pro

1. **Carrosséis performam melhor** que posts únicos
2. **Primeira linha é crucial** - deve funcionar antes do "...more"
3. **10-20 hashtags** é o sweet spot
4. **CTA claro** aumenta engajamento em 30%+
5. **3-7 emojis** melhora legibilidade sem poluir

## 🐛 Troubleshooting Rápido

| Erro | Solução |
|------|---------|
| "Token não configurado" | Configure `.env` ou faça OAuth |
| "Container não ficou pronto" | Verifique URL da imagem, tente novamente |
| "Falha ao criar container" | URL inválida, formato errado, ou token expirado |
| "Máximo de 10 imagens" | Divida em múltiplos carrosséis |

## 🔗 Links Relacionados

- [Guia Completo do Publisher](../../docs/instagram-publisher-guide.md)
- [Configuração de Cookies](../../docs/instagram-cookie-setup.md)
- [OAuth Instagram Setup](../../docs/facebook-oauth.md)
- [Instagram Tools](../automation/instagram-tools)

## 🎬 Exemplo de Uso da API

```bash
curl -X POST http://localhost:3000/api/ig-publish \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrls": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "caption": "Post incrível! 🚀\n\n#marketing #business"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "type": "carousel",
  "data": {
    "media_id": "18123456789012345",
    "slides": 2
  },
  "timestamp": "2026-04-10T12:00:00.000Z"
}
```

---

**Desenvolvido para automatizar sua presença no Instagram** 📱✨
