# Configuração de Cookies do Instagram

Este guia explica como configurar os cookies do Instagram para usar as funcionalidades de lookup e envio de DMs.

## 📋 Pré-requisitos

- Conta no Instagram ativa
- Acesso aos cookies do navegador
- Variável `COOKIE_ENCRYPTION_KEY` configurada no `.env.local`

## 🔐 Passo 1: Configurar Criptografia

Antes de salvar cookies, configure a chave de criptografia no `.env.local`:

```bash
# Gere uma chave aleatória (mínimo 32 caracteres)
openssl rand -hex 32

# Ou use uma chave manual (exemplo)
COOKIE_ENCRYPTION_KEY=minha_chave_secreta_de_pelo_menos_32_caracteres_aqui_123456
```

## 🍪 Passo 2: Obter Cookies do Instagram

### Método 1: Chrome/Edge DevTools

1. Acesse [https://www.instagram.com](https://www.instagram.com) e faça login
2. Pressione `F12` para abrir o DevTools
3. Vá para a aba **Application** (Aplicativo)
4. No menu lateral esquerdo, expanda **Cookies** e clique em `https://www.instagram.com`
5. Localize e copie os seguintes cookies:
   - `csrftoken`
   - `sessionid`
   - `ds_user_id`
   - `ig_did`
   - `mid`
   - `datr`

6. Formate os cookies no padrão:
```
csrftoken=VALOR; sessionid=VALOR; ds_user_id=VALOR; ig_did=VALOR; mid=VALOR; datr=VALOR
```

### Método 2: Console JavaScript

1. Acesse [https://www.instagram.com](https://www.instagram.com) e faça login
2. Pressione `F12` e vá para a aba **Console**
3. Cole o seguinte código:

```javascript
const cookies = ['csrftoken', 'sessionid', 'ds_user_id', 'ig_did', 'mid', 'datr'];
const cookieString = cookies.map(name => `${name}=${document.cookie.match(new RegExp(name + '=([^;]+)'))?.[1] || ''}`).filter(v => v.includes('=')).join('; ');
console.log('📋 Cookies formatados:');
console.log(cookieString);
copy(cookieString); // Copia para a área de transferência
```

## 💾 Passo 3: Salvar Cookies na Aplicação

### Opção A: Via Interface (Recomendado)

1. Acesse `/automation/instagram-tools` na sua aplicação
2. Cole a string de cookies no campo **Session Cookie**
3. O sistema mostrará uma validação em tempo real:
   - ✅ Verde: Todos os cookies detectados
   - ⚠️ Amarelo: Cookies faltando
4. Clique em **Salvar Cookies**
5. Os cookies serão:
   - ✅ Validados automaticamente
   - 🔐 Criptografados com AES-256-GCM
   - 💾 Salvos no servidor (associados à sua conta)

### Opção B: Via Variável de Ambiente (Fallback)

Adicione ao `.env.local`:

```bash
INSTAGRAM_SESSION_COOKIE=csrftoken=xxx; sessionid=xxx; ds_user_id=xxx; ig_did=xxx; mid=xxx; datr=xxx
```

⚠️ **Nota:** Este método usa cookies globais para todos os usuários (menos seguro).

## ✅ Passo 4: Verificar Configuração

Após salvar, o sistema mostrará:

```
✓ Configurado
Cookies salvos e criptografados
[csrftoken ✓] [sessionid ✓] [ds_user_id ✓] [ig_did ✓] [mid ✓] [datr ✓]
```

## 🔄 Gerenciamento de Cookies

### Verificar Status

- Clique no botão **🔄 Recarregar status** para verificar os cookies salvos
- O sistema validará automaticamente se os cookies ainda são válidos

### Remover Cookies

- Clique em **🗑️ Remover** para deletar os cookies salvos
- Isso desconectará as funcionalidades de lookup e DM

## 🛡️ Segurança

### Como os Cookies São Protegidos

1. **Criptografia**: AES-256-GCM com chave única por instalação
2. **Isolamento**: Cada usuário tem seus próprios cookies
3. **Validação**: Verificação automática de integridade
4. **Server-side**: Cookies nunca expostos ao frontend após salvos

### Boas Práticas

- ✅ Use cookies de uma conta secundária (não sua conta principal)
- ✅ Renove os cookies a cada 30-60 dias (Instagram expira sessões)
- ✅ Nunca compartilhe sua string de cookies
- ✅ Ative a autenticação 2FA na conta do Instagram
- ❌ Não use cookies em máquinas compartilhadas sem criptografia

## ⚠️ Solução de Problemas

### Erro: "Cookies incompletos"

**Problema:** Um ou mais cookies obrigatórios estão faltando.

**Solução:**
1. Verifique se todos os 6 cookies foram copiados
2. Certifique-se de que está logado no Instagram antes de copiar
3. Tente obter os cookies novamente via DevTools

### Erro: "Session cookie não configurado"

**Problema:** Nenhum cookie foi encontrado.

**Solução:**
1. Verifique se salvou os cookies corretamente
2. Se usando `.env.local`, verifique se a variável `INSTAGRAM_SESSION_COOKIE` está definida
3. Reinicie o servidor após alterar `.env.local`

### Erro: "Instagram retornou 401"

**Problema:** Cookies expirados ou inválidos.

**Solução:**
1. Remova os cookies salvos (botão 🗑️ Remover)
2. Obtenha novos cookies do Instagram
3. Salve novamente

### Erro: "COOKIE_ENCRYPTION_KEY não configurado"

**Problema:** Chave de criptografia ausente ou muito curta.

**Solução:**
1. Gere uma nova chave: `openssl rand -hex 32`
2. Adicione ao `.env.local`:
   ```bash
   COOKIE_ENCRYPTION_KEY=sua_chave_de_64_caracteres_aqui
   ```
3. Reinicie o servidor

## 📚 Referências

- [Documentação da API Social Messaging](./social-messaging-api.md)
- [Priva Cookie Encryption](../src/lib/cookie-encryption.ts)
- [API de Cookies](../src/app/api/instagram/cookies/route.ts)

## 🚀 Próximos Passos

Após configurar os cookies, você pode:

1. **Buscar perfis**: Use o lookup para obter informações de usuários
2. **Enviar DMs**: Dispare mensagens automatizadas com delay anti-ban
3. **Adicionar IDs manualmente**: Para envio em massa
4. **Analisar resultados**: Verifique o status de cada envio

---

**Dica:** Para uso em produção, considere migrar o `cookieStore` (Map em memória) para um banco de dados ou Redis para persistência entre reinicializações.
