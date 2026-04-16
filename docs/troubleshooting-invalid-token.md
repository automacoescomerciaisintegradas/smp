# Troubleshooting: "Invalid OAuth access token"

## Problema

```
Invalid OAuth access token - Cannot parse access token
```

## Causa Raiz

Você estava usando o **Instagram Basic Display API** (`api.instagram.com`) que fornece tokens APENAS para leitura de dados básicos. Para **PUBLICAR conteúdo**, você precisa do **Instagram Graph API** que usa tokens de Página do Facebook.

## Solução Aplicada

### Fluxo Antigo (INCORRETO) ❌

```
Código → api.instagram.com → Instagram Token → Falha ao publicar
```

### Fluxo Novo (CORRETO) ✅

```
Código → graph.facebook.com → Facebook User Token → Facebook Pages → Page Access Token → Sucesso ao publicar
```

## O que mudou

### 1. Endpoint de OAuth

**Antes:**
```
https://api.instagram.com/oauth/access_token
```

**Agora:**
```
https://graph.facebook.com/v22.0/oauth/access_token
```

### 2. Fluxo de obtenção do token

**Antes:**
1. Troca código por token do Instagram Basic Display
2. Tenta usar para publicar → FALHA

**Agora:**
1. Troca código por Facebook User Access Token (60 dias)
2. Busca todas as Facebook Pages do usuário
3. Encontra a Page vinculada ao Instagram Business Account
4. Usa o Page Access Token para publicar → SUCESSO

### 3. Scopes utilizados

**Antes:**
- Foco em muitos scopes desnecessários

**Agora:**
```
email, public_profile, instagram_basic, instagram_content_publish,
pages_show_list, pages_read_engagement, pages_manage_posts
```

## Como testar

### 1. Reconecte sua conta do Instagram

```
http://localhost:3000/api/auth/instagram
```

Isso irá:
- Redirecionar para o Facebook
- Pedir permissões
- Buscar suas Páginas
- Salvar o token correto

### 2. Verifique os logs

Procure por:
```
[INSTAGRAM_CALLBACK] User Access Token obtido, expires_in: 5184000
[INSTAGRAM_CALLBACK] Pages: { data: [...] }
[INSTAGRAM_CALLBACK] Salvando conta: { instagramId: '...', username: '...' }
[INSTAGRAM_CALLBACK] Conta salva com sucesso!
```

### 3. Tente publicar novamente

Vá para `/publisher` e tente publicar um post.

## Requisitos para funcionar

### 1. Instagram Business ou Creator

Sua conta do Instagram **DEVE** ser:
- Business (Empresa)
- Creator (Criador de conteúdo)

**Contas pessoais NÃO funcionam com a Graph API**

### 2. Página do Facebook vinculada

Sua conta do Instagram deve estar vinculada a uma Página do Facebook:

1. Abra o Instagram
2. Vá para Configurações
3. Conta → Vincular à Página do Facebook
4. Selecione sua Página

### 3. Permissões do App no Meta Developers

Seu app precisa ter aprovado:
- `instagram_basic`
- `instagram_content_publish`
- `pages_show_list`
- `pages_manage_posts`

### 4. App em modo "Live"

No Meta Developers Dashboard:
- App Mode deve estar como **Live** (não Development)
- Ou você deve estar como Admin/Developer do app

## Erros comuns e soluções

### "No Facebook Pages found"

**Problema:** Usuário não tem páginas do Facebook

**Solução:**
1. Crie uma Página do Facebook
2. Vincule sua conta do Instagram Business a ela

### "No Instagram Business Account found"

**Problema:** Página do Facebook não tem Instagram vinculado

**Solução:**
1. Vá para configurações da Página do Facebook
2. Vincule uma conta do Instagram Business

### "Token exchange failed"

**Problema:** Código OAuth inválido ou expirado

**Solução:**
1. Verifique se `FACEBOOK_CLIENT_ID` e `FACEBOOK_CLIENT_SECRET` estão corretos
2. Verifique se o redirect URI está configurado no app
3. Tente autorizar novamente

### "Falha ao criar container de mídia"

**Problema:** Token não tem permissão de publicação OU URL da mídia não acessível

**Solução:**
1. Reconecte a conta do Instagram
2. Verifique se a URL da mídia é pública
3. Veja os logs com `[PUBLISH_DEBUG]`

## Verificando seu token atual

Execute no banco de dados:

```sql
SELECT 
  id,
  username,
  instagramId,
  expiresAt,
  CASE 
    WHEN expiresAt > datetime('now') THEN 'VÁLIDO'
    ELSE 'EXPIRADO'
  END as status
FROM InstagramAccount;
```

Se o token estiver expirado, reconecte a conta.

## Diferença entre as APIs

| Feature | Basic Display API | Graph API |
|---------|------------------|-----------|
| Publicar posts | ❌ Não | ✅ Sim |
| Ler comentários | ✅ Sim | ✅ Sim |
| Ler insights | ✅ Sim | ✅ Sim |
| Criar carrossel | ❌ Não | ✅ Sim |
| Gerenciar mensagens | ✅ Sim | ✅ Sim |
| Token duration | 60 dias | 60 dias |
| Auth via | Instagram | Facebook |

## Logs úteis

Procure estes logs no console:

```bash
# OAuth
[INSTAGRAM_OAUTH] Redirecionando para: ...
[INSTAGRAM_CALLBACK] User Access Token obtido, expires_in: 5184000
[INSTAGRAM_CALLBACK] Pages: { ... }
[INSTAGRAM_CALLBACK] Salvando conta: { ... }

# Publicação
[PUBLISH_DEBUG] Criando container para: { mediaType: 'IMAGE', mediaUrl: '...' }
[PUBLISH_DEBUG] Container criado: 12345
[PUBLISH_DEBUG] Post publicado: 67890
```

## Próximos passos se ainda falhar

1. **Verifique o Meta Developers Dashboard**
   - App está em modo Live?
   - Permissões estão aprovadas?
   - Redirect URI está configurado?

2. **Teste com o Access Token Tool**
   - https://developers.facebook.com/tools/accesstoken/
   - Verifique se o token tem as permissões corretas

3. **Debug do token**
   - https://graph.facebook.com/debug_token?input_token=SEU_TOKEN
   - Verifique se o token é válido e quais permissões possui

4. **Verifique o tipo de conta do Instagram**
   - Deve ser Business ou Creator
   - Não funciona com conta pessoal
