# Integração OAuth do Facebook/Instagram

Este documento explica como configurar e usar a autenticação OAuth do Facebook e Instagram no projeto.

## Configuração no Meta for Developers

### 1. Criar um App no Meta

1. Acesse [https://developers.facebook.com/](https://developers.facebook.com/)
2. Clique em **My Apps** > **Create App**
3. Escolha o tipo de app: **Business** ou **Other**
4. Preencha os detalhes do app

### 2. Configurar o Product: Instagram Basic Display

1. No dashboard do app, vá para **Products**
2. Adicione **Instagram Basic Display**
3. Configure o **Valid OAuth Redirect URIs** com:
   ```
   http://localhost:3000/api/auth/instagram/callback
   ```
   (Em produção, adicione também a URL do seu domínio)

### 3. Configurar Permissões (Scopes)

Vá para **App Review** > **Permissions and Features** e solicite:

- `email`
- `public_profile`
- `pages_show_list`
- `pages_read_engagement`
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_comments`
- `instagram_manage_insights`

> **Nota:** Algumas permissões requerem revisão do app antes de irem para produção.

### 4. Obter Credenciais

No **App Settings** > **Basic**, copie:
- **App ID** → `FACEBOOK_CLIENT_ID`
- **App Secret** → `FACEBOOK_CLIENT_SECRET`

## Configuração no Projeto

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

```bash
cp .env.example .env.local
```

Preencha as variáveis:

```env
# Facebook/Instagram OAuth
FACEBOOK_CLIENT_ID=seu-app-id-aqui
FACEBOOK_CLIENT_SECRET=seu-app-secret-aqui
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gerar-com-openssl-rand-base64-32
```

### 2. Gerar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Ou use: [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

## Uso no Código

### Login com Facebook (via NextAuth)

```tsx
import { signIn } from 'next-auth/react'

// Em um componente
const handleLogin = () => {
  signIn('facebook', { callbackUrl: '/' })
}
```

Ou use o componente pronto:

```tsx
import { FacebookLoginButton } from '@/components/auth/FacebookLoginButton'

<FacebookLoginButton
  onSuccess={() => console.log('Login succeeded')}
  onError={(error) => console.error('Login failed', error)}
/>
```

### Conectar Conta do Instagram

```tsx
import { InstagramConnectButton } from '@/components/auth/InstagramConnectButton'

<InstagramConnectButton
  onSuccess={() => console.log('Instagram connected')}
  onError={(error) => console.error('Connection failed', error)}
/>
```

### Gerenciamento de Tokens

Use o utilitário `facebook-tokens.ts` para gerenciar tokens:

```ts
import {
  exchangeCodeForShortLivedToken,
  exchangeInstagramForLongLivedToken,
  refreshInstagramLongLivedToken,
  validateAccessToken,
} from '@/lib/facebook-tokens'

// O fluxo de callback do Instagram já cuida disso automaticamente
// Mas você pode usar essas funções para operações manuais
```

## Fluxo de Autenticação do Instagram

1. **Usuário clica em "Conectar Instagram"**
2. **Redireciona para `GET /api/auth/instagram`**
3. **Usuário autentica no Facebook e autoriza permissões**
4. **Facebook redireciona para `/api/auth/instagram/callback?code=xxx`**
5. **Backend troca o código por token de curta duração**
6. **Backend troca token de curta duração por token de longa duração (60 dias)**
7. **Dados da conta Instagram são salvos no banco**
8. **Usuário é redirecionado para `/settings?success=instagram_connected`**

## Estrutura de Arquivos

```
src/
├── app/api/auth/
│   ├── [...nextauth]/route.ts       # NextAuth handler
│   └── instagram/
│       ├── route.ts                 # Inicia OAuth do Instagram
│       └── callback/route.ts        # Callback do OAuth
├── components/auth/
│   ├── FacebookLoginButton.tsx      # Botão de login com Facebook
│   └── InstagramConnectButton.tsx   # Botão para conectar Instagram
├── lib/
│   ├── auth.ts                      # Configuração do NextAuth
│   └── facebook-tokens.ts           # Utilitários de tokens
└── types/
    └── next-auth.d.ts               # Type extensions
```

## Schema do Banco de Dados

O modelo `InstagramAccount` armazena:

```prisma
model InstagramAccount {
  id                String   @id @default(cuid())
  userId            String
  username          String?
  instagramId       String   @unique
  accessToken       String
  expiresAt         DateTime?
  profilePictureUrl String?
  followersCount    Int      @default(0)
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

## Token de Longa Duração (60 dias)

O Instagram fornece tokens com validade de 60 dias. Para manter a conexão ativa:

1. **Verificar expiração**: Use `getTokenExpiration()` antes de fazer requests
2. **Renovar token**: Use `refreshInstagramLongLivedToken()` antes da expiração
3. **Armazenar no banco**: O token renovado é salvo automaticamente no callback

### Exemplo de Job de Renovação

```ts
import { prisma } from '@/lib/prisma'
import { refreshInstagramLongLivedToken } from '@/lib/facebook-tokens'

async function refreshExpiringTokens() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const expiringAccounts = await prisma.instagramAccount.findMany({
    where: {
      expiresAt: {
        lte: tomorrow,
      },
    },
  })

  for (const account of expiringAccounts) {
    try {
      const result = await refreshInstagramLongLivedToken(account.accessToken)
      await prisma.instagramAccount.update({
        where: { id: account.id },
        data: {
          accessToken: result.access_token,
          expiresAt: new Date(Date.now() + result.expires_in * 1000),
        },
      })
      console.log(`Refreshed token for ${account.username}`)
    } catch (error) {
      console.error(`Failed to refresh token for ${account.username}:`, error)
    }
  }
}
```

## Testando Localmente

1. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

2. **Acesse a página de login**:
   ```
   http://localhost:3000/login
   ```

3. **Ou vá direto para as configurações**:
   ```
   http://localhost:3000/settings
   ```

## Debug de Erros

Se algo der errado:

1. **Verifique os logs do console** - erros são logados detalhadamente
2. **Acesse o Facebook Token Debugger**: [https://developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
3. **Verifique as permissões do app** no Meta Developers Dashboard
4. **Confirme que o redirect URI está configurado corretamente**

## Links Úteis

- [Meta for Developers](https://developers.facebook.com/)
- [Facebook Login Docs](https://developers.facebook.com/docs/facebook-login/)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Token Debugger](https://developers.facebook.com/tools/debug/)
- [Access Token Tool](https://developers.facebook.com/tools/accesstoken/)
