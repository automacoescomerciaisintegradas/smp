# 📋 Configuração Completa do Instagram OAuth - Passo a Passo

## 📱 Informações do Seu App

```
Facebook App ID:          3728761024095089
Instagram App ID:         1089163016219900
App Name:                 ecommerce-IG
Redirect URI (produção):  https://aci.automacoescomerciais.com.br/User/Instagram/Callback
```

---

## ⚙️ Passo 1: Configurar no Meta Developers

### 1.1 Adicionar Redirect URI de Desenvolvimento

1. Acesse: https://developers.facebook.com/apps/3728761024095089/instagram-basic-display/
2. Em **Configurações do App Instagram**, adicione o redirect URI local:
   ```
   http://localhost:3000/api/auth/instagram/callback
   ```
3. Mantenha também o redirect URI de produção:
   ```
   https://aci.automacoescomerciais.com.br/User/Instagram/Callback
   ```

### 1.2 Verificar Permissões (Scopes)

Seu app precisa ter aprovado estas permissões:

**Instagram Business Basic:**
- ✅ `instagram_business_basic`
- ✅ `instagram_business_content_publish` (para publicar posts)
- ✅ `instagram_business_manage_comments`
- ✅ `instagram_business_manage_insights`
- ✅ `instagram_business_manage_messages`

### 1.3 Modo do App

- Se estiver em **Development**, apenas Admins/Developers podem usar
- Para produção, mude para **Live Mode** e submeta para revisão

---

## 🔧 Passo 2: Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Edite o `.env.local`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gerar-com-openssl-rand-base64-32

# Facebook App ID (que contém o Instagram)
FACEBOOK_CLIENT_ID=3728761024095089
FACEBOOK_CLIENT_SECRET=COLE_SEU_FACEBOOK_APP_SECRET_AQUI

# Instagram Business App
INSTAGRAM_CLIENT_ID=1089163016219900
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback

# Database
DATABASE_URL="file:./dev.db"
```

### Como obter o Facebook App Secret:

1. Acesse: https://developers.facebook.com/apps/3728761024095089/settings/basic/
2. Em **App Secret**, clique em **Show**
3. Copie e cole no `.env.local`

### Como gerar NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

Ou use: https://generate-secret.vercel.app/32

---

## 🚀 Passo 3: Testar o Fluxo de Autenticação

### 3.1 Iniciar o Servidor

```bash
npm run dev
```

### 3.2 Acessar a URL de Autorização

Abra no navegador:

```
http://localhost:3000/api/auth/instagram
```

Isso vai redirecionar para o Facebook OAuth com a URL:

```
https://www.facebook.com/v22.0/dialog/oauth?client_id=3728761024095089&redirect_uri=http://localhost:3000/api/auth/instagram/callback&scope=email,public_profile,instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts&response_type=code
```

### 3.3 Autorizar o App

1. Faça login com sua conta do Facebook
2. Selecione a página **Automacoescomerciais** ou **Automações Comerciais Integradas**
3. Autorize as permissões solicitadas
4. Você será redirecionado para `/settings?success=instagram_connected`

---

## 🔍 Passo 4: Verificar se Funcionou

### 4.1 Verificar Logs do Servidor

Procure por estas mensagens no terminal:

```
[INSTAGRAM_CALLBACK] User Access Token obtido, expires_in: 5184000
[INSTAGRAM_CALLBACK] Pages: { data: [...] }
[INSTAGRAM_CALLBACK] Salvando conta: { instagramId: '...', username: '...' }
[INSTAGRAM_CALLBACK] ✅ Conta salva com sucesso! Token persistido no banco.
[INSTAGRAM_CALLBACK] Token válido até: 2026-06-09T...
```

### 4.2 Verificar no Banco de Dados

```bash
npx prisma studio
```

Abre http://localhost:5555 e verifique a tabela `InstagramAccount`:
- ✅ Deve ter um registro
- ✅ `accessToken` preenchido
- ✅ `expiresAt` daqui a 60 dias
- ✅ `username` preenchido

### 4.3 Ou use a API

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/instagram/manual-setup" | ConvertTo-Json
```

---

## 🎯 Passo 5: Testar Publicação

### 5.1 Acesse o Publisher

```
http://localhost:3000/publisher
```

### 5.2 Crie um Post de Teste

1. Escolha tipo **IMAGE**
2. Faça upload de uma imagem
3. Escreva uma legenda
4. Clique em **Salvar Rascunho**
5. Na lista de posts, clique em **Publicar** (ícone Send)

### 5.3 Verifique o Instagram

O post deve aparecer no seu perfil do Instagram!

---

## 🔧 Configuração Alternativa: Manual com Tokens Existentes

Se você já tem os Page Access Tokens (como mostrou anteriormente), pode configurar diretamente:

### Opção A: Script PowerShell

```powershell
# Execute primeiro para obter os Instagram IDs
.\scripts\verify-pages.ps1

# Depois execute para configurar
.\scripts\setup-instagram-auto.ps1
```

### Opção B: Via API Direta

```powershell
# Para Página 1: Automacoescomerciais
# SUBSTITUA INSTAGRAM_ID pelo valor obtido no script verify-pages.ps1

Invoke-RestMethod -Uri "http://localhost:3000/api/instagram/manual-setup" -Method POST -Headers @{"Content-Type"="application/json"} -Body (@{
  instagramId = "INSTAGRAM_ID_AQUI"
  username = "automacoescomerciais"
  accessToken = "EAA0ZCSdRLI3EBRIPDZCydCuj91HU2hiHOTqfOdOyCLRMRdVWZBZCHRXK0YIgtFVrgBMaIMJnPNF7RqAEYZAaoQ2Vj12YJffeZC1vhv4yT6e6ZAyBRmmWxt9wWvi3y4E5OCStlljcn33lv3npeNssV9om7SASjjR2ZAJRnu5MH2Fqy9AryAvqMnxlicW798hErqVKqWsjhGZAoynPD4Cf0pZBLNFd3B2oiWLLjoqzufdgohifAZD"
} | ConvertTo-Json)
```

---

## 📊 Monitoramento de Tokens

### Via Interface

1. Acesse: http://localhost:3000/settings
2. Procure o componente **TokenManager**
3. Veja o status de cada token:
   - ✅ Verde: Token válido
   - ⚠️ Amarelo: Expirando em breve (< 7 dias)
   - ❌ Vermelho: Expirado

### Via API

```powershell
# Verificar status
Invoke-RestMethod -Uri "http://localhost:3000/api/instagram/renew-tokens" | ConvertTo-Json

# Renovar tokens manualmente
Invoke-RestMethod -Uri "http://localhost:3000/api/instagram/renew-tokens" -Method POST | ConvertTo-Json
```

---

## 🔄 Fluxo de Renovação Automática

O sistema renova automaticamente os tokens:

1. **Antes de publicar**: `ensureValidToken()` é chamado
2. **Se expirando** (< 7 dias): Tenta renovar
3. **Se expirado**: Retorna erro pedindo re-autenticação

### Renovção Programada (Produção)

Em produção, configure um cron job:

```typescript
// src/lib/cron/renew-tokens.ts
import { renewTokensCron } from '@/lib/cron/renew-tokens'

// Executa diariamente às 3am
renewTokensCron()
```

Ou use **Vercel Cron Jobs**:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/renew-tokens",
      "schedule": "0 3 * * *"
    }
  ]
}
```

---

## ❌ Troubleshooting

### "Invalid OAuth access token"

**Causa:** Token mal formado ou de API errada (Basic Display vs Graph API)

**Solução:**
1. Reconecte a conta: http://localhost:3000/api/auth/instagram
2. Verifique se está usando o **Facebook App ID** (3728761024095089) e não o Instagram App ID
3. Veja os logs com prefixo `[INSTAGRAM_CALLBACK]`

### "No Facebook Pages found"

**Causa:** Usuário não tem páginas ou não selecionou durante autorização

**Solução:**
1. Verifique se você é admin de uma Página do Facebook
2. Reconecte e selecione a página na tela de permissões

### "No Instagram Business Account found"

**Causa:** Página do Facebook não tem Instagram Business vinculado

**Solução:**
1. Abra a Página do Facebook
2. Configurações → Instagram
3. Vincule sua conta do Instagram Business

### "Falha ao criar container de mídia"

**Causas possíveis:**
- Token expirado
- URL da imagem não acessível (precisa ser HTTPS pública)
- Formato inválido

**Solução:**
1. Verifique logs com `[PUBLISH_DEBUG]`
2. Renove o token: http://localhost:3000/api/instagram/renew-tokens (POST)
3. Use URLs HTTPS públicas para imagens

---

## 📝 Resumo dos IDs

Guarde estas informações:

```
Facebook App ID:          3728761024095089
Instagram App ID:         1089163016219900

Página 1:
  Name:                   Automacoescomerciais
  Page ID:                848566961676704
  Token:                  EAA0ZCSdRLI3EB...

Página 2:
  Name:                   Automações Comerciais Integradas
  Page ID:                683438541527720
  Token:                  EAA0ZCSdRLI3EB...
```

---

## ✅ Checklist Final

Antes de usar, verifique:

- [ ] `.env.local` criado com `FACEBOOK_CLIENT_SECRET`
- [ ] Servidor rodando (`npm run dev`)
- [ ] Redirect URI configurado no Meta Developers
- [ ] Conta do Instagram conectada via `/api/auth/instagram`
- [ ] Token salvo no banco (verifique com Prisma Studio)
- [ ] Teste de publicação funcionou
- [ ] Post apareceu no Instagram

---

## 🆘 Precisa de Ajuda?

Execute os scripts de diagnóstico:

```powershell
# Verifica suas páginas
.\scripts\verify-pages.ps1

# Gera comandos de configuração
.\scripts\setup-instagram-auto.ps1
```

Ou verifique os logs do servidor com prefixos:
- `[INSTAGRAM_CALLBACK]` - Fluxo de autenticação
- `[PUBLISH_DEBUG]` - Publicação de posts
- `[TOKEN_ENSURE]` - Validação de tokens
