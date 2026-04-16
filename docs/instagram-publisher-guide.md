# Instagram Publisher - Guia Completo

## 📸 Visão Geral

O Publisher é uma ferramenta completa para publicar **posts individuais** e **carrosséis** no Instagram via Graph API, com suporte a templates, rascunhos e upload de imagens.

## ✨ Funcionalidades

### 🖼️ Gerenciamento de Imagens

- **Drag & Drop**: Arraste imagens diretamente do computador
- **Seletor de Arquivos**: Selecione imagens via dialog
- **URLs Públicas**: Cole URLs de imagens hospedadas
- **Até 10 slides** por carrossel
- **Reordenação**: Mova slides para cima/baixo
- **Preview em tempo real**: Veja como ficará no Instagram

### 📝 Caption Inteligente

- **4 Templates prontos**:
  - 📚 Educativo
  - 📖 Storytelling
  - 🎯 Promoção
  - 📝 Lista/Dicas
  
- **Contador de caracteres**: Limite de 2200 caracteres
- **Quick Hashtags**: Botões de hashtags populares
- **Validação em tempo real**

### 💾 Rascunhos

- **Salvar rascunhos**: Guarde posts para continuar depois
- **Carregar rascunhos**: Acesse posts salvos rapidamente
- **Persistência local**: Salvo no localStorage do navegador
- **Até 20 rascunhos** mantidos automaticamente

### 🚀 Publicação

- **Detecção automática**: Single post vs Carousel baseado no número de imagens
- **Feedback visual**: Etapas do processo de publicação
- **Polling inteligente**: Aguarda processamento do Instagram
- **Relatório de resultado**: Success/Error detalhado

## 🎯 Como Usar

### Passo 1: Configurar Acesso

Antes de publicar, você precisa de:

1. **Access Token do Instagram Business**
2. **Conta Instagram Business ou Creator** conectada via OAuth

Veja [Configuração OAuth](../../docs/facebook-oauth.md) para detalhes.

### Passo 2: Adicionar Imagens

**Opção A - Drag & Drop:**
1. Abra a pasta com suas imagens
2. Arraste para a zona de upload
3. As imagens são adicionadas automaticamente

**Opção B - Seletor:**
1. Clique em "Selecionar do Computador"
2. Escolha até 10 imagens
3. Preview instantâneo

**Opção C - URLs:**
1. Cole URLs públicas de imagens
2. Preview automático ao preencher
3. Use CDN ou hosting confiável

### Passo 3: Escrever Legenda

**Usando Templates:**
1. Clique em **"📄 Templates"**
2. Escolha o tipo de post
3. Substitua os placeholders pelo seu conteúdo

**Do zero:**
1. Escreva na caixa de texto
2. Use hashtags dos botões rápidos
3. Observe o contador de caracteres

### Passo 4: Salvar Rascunho (Opcional)

1. Clique em **"💾 Salvar Rascunho"**
2. O post é salvo com timestamp
3. Acesse depois via **"📁 Rascunhos"**

### Passo 5: Publicar

1. Revise o **Preview** à direita
2. Verifique o checklist de requisitos
3. Clique em **"🚀 Publicar"**
4. Aguarde o processamento (30-60s)
5. Veja o resultado com Media ID

## 📊 Tipos de Publicação

### Post Único (Single)
- **Requisitos**: 1 imagem + caption
- **Tempo**: ~30 segundos
- **Fluxo**: Container → Process → Publish

### Carrossel
- **Requisitos**: 2-10 imagens + caption
- **Tempo**: ~60-90 segundos
- **Fluxo**: 
  1. Cria containers individuais (slides)
  2. Aguarda processamento de cada um
  3. Cria container do carousel
  4. Publica o carousel completo

## ⚠️ Requisitos e Limitações

### Imagens
- ✅ JPG, PNG
- ✅ Proporção 1:1 (quadrado) recomendada
- ✅ Mínimo 320x320, máximo 1080x1080
- ✅ URLs devem ser publicamente acessíveis
- ❌ Não aceita GIFs animados
- ❌ Não aceita vídeos (feature futura)

### Caption
- ✅ Máximo 2200 caracteres
- ✅ Suporta emojis
- ✅ Suporta @menções
- ✅ Suporta quebras de linha
- ❌ Não editável após publicação

### Rate Limits
- **Instagram Graph API**: ~200 requests/hora
- **Carrosséis**: Contam como múltiplos requests
- **Recomendação**: Máximo 20-30 posts/dia

## 🔧 Estrutura Técnica

### API Route: `/api/ig-publish`

```typescript
POST /api/ig-publish

Body:
{
  "imageUrls": ["https://...", "https://..."],
  "caption": "Sua legenda aqui",
  "accessToken": "opcional se configurado no .env"
}

Response Success:
{
  "success": true,
  "type": "carousel", // ou "single"
  "data": {
    "media_id": "123456789",
    "slides": 5
  }
}
```

### Fluxo de Publicação

```
1. Create Media Container (por imagem)
   ↓
2. Polling Status (aguarda "FINISHED")
   ↓
3. Create Carousel Container (se multiplas imagens)
   ↓
4. Polling Status novamente
   ↓
5. Publish Media
   ↓
6. Return Media ID
```

## 🎨 Templates de Caption

### 📚 Educativo
Ideal para posts que ensinam conceitos ou frameworks.

**Estrutura:**
- Gancho impactante
- Desenvolvimento conceitual
- Dica bônus
- CTA para engajamento
- Hashtags estratégicas

### 📖 Storytelling
Perfeito para compartilhar jornadas e experiências.

**Estrutura:**
- Situação inicial (passado)
- Resultados atuais
- Lições aprendidas (lista numerada)
- CTA emocional

### 🎯 Promoção
Para lançamentos, produtos ou serviços.

**Estrutura:**
- Anúncio claro
- Benefícios (3-5 bullets)
- Urgência/escassez
- CTA direto

### 📝 Lista/Dicas
Conteúdo rápido e escaneável.

**Estrutura:**
- Título com número
- Lista de dicas (5-10 items)
- Pergunta de engajamento
- CTA para salvar

## 💡 Dicas Profissionais

### Para Carrosséis de Sucesso

1. **Slide 1 = Gancho Visual**
   - Headline clara e impactante
   - Design que chama atenção
   - Promessa de valor

2. **Meio = Conteúdo Denso**
   - Uma ideia por slide
   - Visual limpo
   - Texto complementar, não duplicado

3. **Último Slide = CTA Forte**
   - Salvar, compartilhar, seguir
   - Resumo rápido (opcional)
   - Próximo passo claro

### Para Captions que Convertem

1. **Primeira linha é tudo**
   - Deve funcionar sozinha (antes do "...more")
   - Gancho emocional ou curiosidade
   - Máximo 125 caracteres antes do corte

2. **Espaçamento estratégico**
   - Parágrafos curtos (2-3 linhas)
   - Emojis como bullets visuais
   - Respiro entre seções

3. **CTA único**
   - Uma ação principal por post
   - Clara e específica
   - Alinhada ao objetivo do post

### Hashtags que Funcionam

**Estratégia 3-Tier:**
- **3-5 grandes** (1M+ posts): #business #entrepreneur
- **5-10 médias** (100K-1M): #solopreneur #digitalnomad
- **3-5 nichadas** (<100K): #lifestylebusiness #systemsbuilding

**Total**: 10-20 hashtags por post

## 🐛 Troubleshooting

### Erro: "Token de acesso não configurado"

**Solução:**
1. Configure `INSTAGRAM_ACCESS_TOKEN` no `.env.local`
2. OU faça OAuth via `/api/auth/instagram`
3. Reinicie o servidor após mudar `.env`

### Erro: "Container não ficou pronto"

**Causa:** Instagram demorou >60s para processar imagem.

**Solução:**
1. Verifique se a URL da imagem é acessível
2. T novamente (pode ser rate limit temporário)
3. Use imagens de CDN confiável

### Erro: "Falha ao criar container de mídia"

**Causas comuns:**
- URL inválida ou inacessível
- Formato não suportado
- Token expirado ou inválido
- Imagem muito grande (>10MB)

**Solução:**
1. Teste a URL no navegador
2. Verifique formato e tamanho
3. Renove o token via OAuth
4. Comprima a imagem se necessário

### Carrossel com Menos de 10 Slides

**Problema:** Instagram limita a 10 slides por carrossel.

**Solução:**
1. Divida em múltiplos carrosséis (Parte 1, Parte 2)
2. Crie uma série de posts conectados
3. Use "Continue no próximo post" como CTA

## 🚀 Futuro (Roadmap)

- [ ] Upload direto de imagens (sem URL)
- [ ] Suporte a vídeos (Reels)
- [ ] Agendamento de posts
- [ ] Editor visual de carousel
- [ ] Templates de design
- [ ] Analytics pós-publicação
- [ ] Integração com IA para gerar captions
- [ ] Fila de conteúdo automatizada

## 📚 Referências

- [Documentação Oficial Graph API](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Configuração de Cookies](../instagram-cookie-setup.md)
- [OAuth Instagram Setup](../../docs/facebook-oauth.md)

---

**Dica Pro**: Combine o Publisher com o [Instagram Tools](../automation/instagram-tools) para lookup de perfis e envio de DMs automatizados!
