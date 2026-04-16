# Publisher de Posts/Carrosséis - Documentação

## Visão Geral

O Publisher é uma funcionalidade completa que permite criar, agendar e publicar posts no Instagram, incluindo suporte a:

- ✅ Posts únicos (imagem)
- ✅ Posts de vídeo
- ✅ Carrosséis (2-10 mídias)
- ✅ Agendamento de posts
- ✅ Geração de legendas com IA
- ✅ Upload de mídias
- ✅ Preview em tempo real

## Estrutura de Arquivos

### APIs

```
src/app/api/
├── posts/
│   ├── route.ts              # CRUD de posts
│   └── [id]/
│       └── publish/
│           └── route.ts      # Publica post no Instagram
├── upload/
│   └── route.ts              # Upload de arquivos
└── instagram/
    └── publish/
        └── route.ts          # Publicação direta (para offers)
```

### Componentes

```
src/components/publisher/
├── CaptionEditor.tsx         # Editor de legenda com emojis e hashtags
├── CarouselPreview.tsx       # Preview interativo de carrossel
├── MediaUploader.tsx         # Upload drag-and-drop de mídias
└── SchedulePicker.tsx        # Seletor de data/hora

src/app/
└── publisher/
    └── page.tsx              # Página principal do Publisher
```

## Schema do Banco de Dados

### Post

```prisma
model Post {
  id                String   @id @default(cuid())
  instagramId       String?  @unique
  caption           String?
  mediaType         String   // IMAGE, VIDEO, CAROUSEL
  status            String   @default("DRAFT")
  scheduledAt       DateTime?
  publishedAt       DateTime?
  instagramPostId   String?  // ID retornado pelo Instagram
  error             String?
  userId            String
  
  mediaUrl          String?  // Para posts únicos
  mediaItems        PostMedia[]  // Para carrosséis
  
  user              User     @relation(fields: [userId], references: [id])
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model PostMedia {
  id          String   @id @default(cuid())
  postId      String
  url         String
  mediaType   String   // IMAGE, VIDEO
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  
  post        Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  
  @@index([postId, order])
}
```

## Fluxo de Publicação

### 1. Post Único (Imagem/Vídeo)

```
Usuário → Publisher → Upload → Cria Post (DRAFT)
                                    ↓
                    Publicar (API /api/posts/[id]/publish)
                                    ↓
              1. Cria container na Instagram API
              2. Aguarda processamento
              3. Publica container
              4. Atualiza post status = PUBLISHED
                                    ↓
                              Retorna sucesso
```

### 2. Carrossel

```
Usuário → Publisher → Upload (2-10 arquivos) → Cria Post (DRAFT)
                                                    ↓
                            Publicar (API /api/posts/[id]/publish)
                                                    ↓
              1. Cria container para CADA mídia (com delay de 2s)
              2. Cria container do carrossel com children
              3. Aguarda processamento (3s)
              4. Publica carrossel
              5. Atualiza post status = PUBLISHED
                                                    ↓
                                              Retorna sucesso
```

## Como Usar

### Acessando o Publisher

```
http://localhost:3000/publisher
```

### Criando um Post

1. **Escolha o tipo de conteúdo**:
   - Imagem: Upload de 1 arquivo (JPEG, PNG, WebP)
   - Vídeo: Upload de 1 arquivo (MP4, max 60s)
   - Carrossel: Upload de 2-10 imagens/vídeos

2. **Faça upload das mídias**:
   - Arraste arquivos para a área de upload
   - Ou clique para selecionar
   - Limite: 10MB por arquivo

3. **Escreva a legenda**:
   - Use o editor com suporte a emojis
   - Clique em "Gerar com IA" para sugestões automáticas
   - Adicione hashtags com o botão #

4. **Agende (opcional)**:
   - Selecione data e hora no SchedulePicker
   - Status mudará para SCHEDULED

5. **Salve ou Publique**:
   - **Salvar Rascunho**: Salva como DRAFT
   - **Agendar Post**: Salva como SCHEDULED
   - **Publicar**: Publica imediatamente no Instagram

### Publicando um Post Existente

Na lista de posts recentes, clique em **Publicar** (ícone Send).

## APIs Detalhadas

### GET /api/posts

Lista posts do usuário.

**Query Params:**
- `status`: Filtra por status (DRAFT, SCHEDULED, PUBLISHED, FAILED)
- `limit`: Número máximo de posts (default: 50)

**Response:**
```json
[
  {
    "id": "post_id",
    "caption": "Legenda do post",
    "mediaType": "IMAGE",
    "status": "DRAFT",
    "mediaUrl": "/uploads/images/file.jpg",
    "mediaItems": [],
    "scheduledAt": null,
    "publishedAt": null,
    "createdAt": "2026-04-10T..."
  }
]
```

### POST /api/posts

Cria um novo post.

**Body:**
```json
{
  "caption": "Texto da legenda",
  "mediaType": "CAROUSEL",
  "mediaItems": [
    { "url": "/uploads/1.jpg", "mediaType": "IMAGE", "order": 0 },
    { "url": "/uploads/2.jpg", "mediaType": "IMAGE", "order": 1 }
  ],
  "scheduledAt": "2026-04-11T10:00:00Z",
  "status": "SCHEDULED"
}
```

### POST /api/posts/[id]/publish

Publica um post no Instagram.

**Response de Sucesso:**
```json
{
  "success": true,
  "instagramPostId": "1234567890",
  "message": "Post publicado com sucesso!"
}
```

**Response de Erro:**
```json
{
  "error": "Falha ao publicar no Instagram",
  "details": "Erro ao criar container: ..."
}
```

### POST /api/upload

Faz upload de um arquivo.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Arquivo a ser enviado

**Response:**
```json
{
  "success": true,
  "url": "/uploads/images/arquivo.jpg",
  "fileName": "arquivo.jpg",
  "size": 123456,
  "type": "image/jpeg"
}
```

## Troubleshooting

### "Falha ao criar container de mídia"

**Causas comuns:**

1. **URL da mídia não acessível**
   - O Instagram precisa acessar a URL publicamente
   - Se estiver em dev, use `http://localhost:3000` como base
   - Em produção, use HTTPS obrigatoriamente

2. **Token do Instagram expirado**
   - Reconecte a conta do Instagram
   - Verifique `expiresAt` no banco

3. **Formato inválido**
   - Imagens: JPEG, PNG, WebP apenas
   - Vídeos: MP4, máximo 60 segundos
   - Proporção: 1:1 a 4:5

4. **Permissões insuficientes**
   - App precisa de `instagram_content_publish`
   - Conta do Instagram deve ser Business ou Creator

### Posts falhando silenciosamente

Verifique os logs do servidor com prefixo `[PUBLISH_DEBUG]`:

```bash
npm run dev
# Procure por linhas como:
# [PUBLISH_DEBUG] Criando container para: { mediaType: 'IMAGE', mediaUrl: '...' }
# [PUBLISH_DEBUG] Erro ao criar container: { ... }
```

### Carrossel não publica

1. **Verifique se há pelo menos 2 mídias**
2. **Aguarde entre cada criação de container** (o código já faz isso automaticamente)
3. **Todas as mídias devem ser válidas** (acessíveis e no formato correto)

## Requisitos do Instagram

### Tipos de Mídia Suportados

| Tipo | Formato | Tamanho Máx | Duração |
|------|---------|-------------|---------|
| Imagem | JPEG, PNG, WebP | 10MB | - |
| Vídeo | MP4 | 10MB | 60s |
| Carrossel | Mix de imagens/vídeos | 10MB cada | 60s por vídeo |

### Limites

- **Carrossel**: 2-10 mídias
- **Legenda**: 2.200 caracteres
- **Hashtags**: Máximo 30 por post
- **Vídeos**: Máximo 60 segundos

### Conta Necessária

- **Instagram Business ou Creator** (obrigatório)
- **Página do Facebook** vinculada à conta do Instagram
- **App aprovado** no Meta Developers com as permissões:
  - `instagram_basic`
  - `instagram_content_publish` (para publicar posts)
  - `pages_show_list` (para acessar páginas)
  - `pages_manage_posts` (para gerenciar posts das páginas)

### Fluxo de Autenticação (IMPORTANTE!)

O sistema usa o **Instagram Graph API** (não o Basic Display API):

1. Usuário autoriza via Facebook OAuth
2. Sistema obtém User Access Token (60 dias)
3. Sistema busca as Facebook Pages do usuário
4. Sistema encontra a Page vinculada ao Instagram
5. Sistema salva o Page Access Token (60 dias)

**Se você usar Instagram Basic Display API, os posts FALHARÃO com "Invalid OAuth access token"**

## Exemplo de Uso Programático

```typescript
// Criar um post
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    caption: 'Meu post incrível! 🚀 #hashtag',
    mediaType: 'IMAGE',
    mediaUrl: '/uploads/images/foto.jpg',
    status: 'DRAFT',
  }),
})

const post = await response.json()

// Publicar o post
const publishResponse = await fetch(`/api/posts/${post.id}/publish`, {
  method: 'POST',
})

const result = await publishResponse.json()
console.log('Instagram Post ID:', result.instagramPostId)
```

## Próximos Melhoramentos

- [ ] Agendamento recorrente
- [ ] Templates de posts
- [ ] Preview em tempo real do Instagram
- [ ] Analytics de performance
- [ ] Publicação em múltiplas contas
- [ ] Aprovação de posts por equipe
- [ ] Integração com IA para gerar legendas contextuais
