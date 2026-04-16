# APIs de Mensagens Sociais

Este documento descreve os endpoints disponíveis para integração com Instagram, WhatsApp e Facebook.

## Configuração de Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
# Instagram
INSTAGRAM_ACCESS_TOKEN=seu_token_do_instagram
INSTAGRAM_ACCOUNT_ID=id_da_conta

# WhatsApp  
WHATSAPP_ACCESS_TOKEN=seu_token_do_whatsapp

# Facebook
FACEBOOK_APP_ID=seu_app_id
FACEBOOK_APP_SECRET=seu_app_secret
FACEBOOK_PAGE_ACCESS_TOKEN=token_da_pagina
```

## Endpoints Disponíveis

### 1. Enviar Mensagem no Instagram

**Endpoint:** `POST /api/social/messages/send`

**Descrição:** Envia uma mensagem direta para um usuário no Instagram DM.

**Body (JSON):**
```json
{
  "recipientId": "instagram_user_id",
  "text": "Olá! Como posso ajudar?",
  "imageUrl": "https://exemplo.com/imagem.jpg", // opcional
  "videoUrl": "https://exemplo.com/video.mp4", // opcional
  "accessToken": "token_opcional" // opcional se configurado no .env
}
```

**Exemplos de uso:**

```bash
# Enviar mensagem de texto
curl -X POST http://localhost:3000/api/social/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "123456789",
    "text": "Olá! Bem-vindo ao nosso serviço!"
  }'

# Enviar imagem
curl -X POST http://localhost:3000/api/social/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "123456789",
    "imageUrl": "https://exemplo.com/promo.jpg"
  }'
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "message_id": "mid.1234567890",
    "messaging_product": "instagram"
  },
  "timestamp": "2026-04-10T12:00:00.000Z"
}
```

**Resposta de Erro:**
```json
{
  "error": {
    "message": "Erro na API do Instagram",
    "code": 190,
    "type": "OAuthException",
    "fbtrace_id": "ABC123"
  }
}
```

---

### 2. Listar Conversas do Instagram

**Endpoint:** `GET /api/social/conversations`

**Descrição:** Lista as conversas recentes da conta Instagram.

**Query Parameters:**
- `accessToken` (opcional) - Token de acesso
- `limit` (opcional, padrão: 10) - Número máximo de conversas
- `cursor` (opcional) - Cursor para paginação

**Exemplo:**
```bash
curl -X GET "http://localhost:3000/api/social/conversations?limit=20" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### 3. Obter Detalhes de uma Conversa

**Endpoint:** `GET /api/social/conversations/[conversationId]`

**Descrição:** Obtém os detalhes e mensagens de uma conversa específica.

**Query Parameters:**
- `accessToken` (opcional) - Token de acesso
- `limit` (opcional, padrão: 20) - Número máximo de mensagens
- `cursor` (opcional) - Cursor para paginação

**Exemplo:**
```bash
curl -X GET "http://localhost:3000/api/social/conversations/t_12345?limit=50"
```

---

### 4. Enviar Mensagem Template (WhatsApp)

**Endpoint:** `POST /api/social/messages/template`

**Descrição:** Envia uma mensagem usando template aprovado no WhatsApp Business.

**Body (JSON):**
```json
{
  "recipientId": "5511999999999",
  "templateName": "hello_world",
  "language": "pt_BR",
  "components": [
    {
      "type": "body",
      "parameters": [
        {
          "type": "text",
          "text": "João"
        }
      ]
    }
  ],
  "accessToken": "token_opcional"
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/social/messages/template \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "5511999999999",
    "templateName": "welcome_message",
    "language": "pt_BR"
  }'
```

---

### 5. Gerenciar Tokens

**Endpoint:** `POST /api/social/token`

**Descrição:** Valida, renova ou verifica expiração de tokens de acesso.

**Body (JSON):**
```json
{
  "accessToken": "seu_token",
  "action": "validate" // validate, refresh, check-expiration, auto-refresh
}
```

**Ações Disponíveis:**

- **validate** - Verifica se o token é válido e retorna informações
- **refresh** - Renova o token de acesso
- **check-expiration** - Verifica se o token está prestes a expirar (7 dias)
- **auto-refresh** - Renova automaticamente se estiver próximo da expiração

**Exemplo:**
```bash
# Validar token
curl -X POST http://localhost:3000/api/social/token \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "seu_token",
    "action": "validate"
  }'

# Renovar automaticamente
curl -X POST http://localhost:3000/api/social/token \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "seu_token",
    "action": "auto-refresh"
  }'
```

---

### 6. Enviar Mensagem no Facebook

**Endpoint:** `POST /api/social/facebook/messages`

**Descrição:** Envia uma mensagem para um usuário via Messenger.

**Body (JSON):**
```json
{
  "recipientId": "psid_do_usuario",
  "text": "Olá! Como podemos ajudar?",
  "quickReplies": [
    {
      "content_type": "text",
      "title": "Sim",
      "payload": "USER_CLICKED_YES"
    },
    {
      "content_type": "text",
      "title": "Não",
      "payload": "USER_CLICKED_NO"
    }
  ],
  "accessToken": "token_opcional"
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/social/facebook/messages \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "123456789",
    "text": "Escolha uma opção:",
    "quickReplies": [
      {
        "content_type": "text",
        "title": "Opção 1",
        "payload": "OPTION_1"
      }
    ]
  }'
```

---

## Tipos TypeScript

Todos os tipos estão disponíveis em `src/types/social-api.ts`:

```typescript
import type { 
  InstagramMessageRequest,
  WhatsAppTemplateMessage,
  ApiSuccessResponse,
  ApiErrorResponse 
} from '@/types/social-api';
```

## Utilitários de Token

Funções auxiliares disponíveis em `src/lib/social-token-utils.ts`:

```typescript
import { 
  validateAccessToken,
  refreshLongLivedToken,
  isTokenExpiringSoon,
  autoRefreshToken 
} from '@/lib/social-token-utils';

// Validar token
const validation = await validateAccessToken('seu_token');

// Renovar token
const refresh = await refreshLongLivedToken('seu_token');

// Verificar se está expirando
const expiring = await isTokenExpiringSoon('seu_token');

// Auto-renovação
const result = await autoRefreshToken('seu_token');
```

## Códigos de Erro Comuns

| Código | Descrição | Solução |
|--------|-----------|---------|
| 190 | Token inválido ou expirado | Renove o token via `/api/social/token` |
| 100 | Parâmetro inválido | Verifique o recipientId e payload |
| 368 | Conta bloqueada | Verifique as políticas da plataforma |
| 4 | Rate limit | Aguarde e tente novamente |

## Notas de Segurança

1. **Nunca exponha tokens no frontend** - Use apenas em rotas API server-side
2. **Renove tokens regularmente** - Tokens de longa duração expiram em 60 dias
3. **Use variáveis de ambiente** - Não hardcode tokens no código
4. **Monitore rate limits** - Cada plataforma tem limites de requisições

## Próximos Passos

- [ ] Implementar webhooks para receber mensagens
- [ ] Adicionar suporte a mensagens em massa
- [ ] Criar sistema de filas para envio assíncrono
- [ ] Implementar analytics de mensagens
- [ ] Adicionar suporte a mensagens de áudio
