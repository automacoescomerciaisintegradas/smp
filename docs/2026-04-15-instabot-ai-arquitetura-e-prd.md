# InstaBot AI: Arquitetura, Gap Analysis e PRD

Data: 2026-04-15

## 1. Contexto do produto

O produto de referência informado pelo usuário aponta para um posicionamento muito específico:

- automação inteligente de comentários no Instagram;
- respostas contextuais com IA;
- base de conhecimento como insumo da resposta;
- onboarding orientado à configuração Meta.

Hoje o repositório já contém muitos blocos relevantes, mas eles estão distribuídos entre quatro narrativas de produto:

- `InstaBot AI`
- `Social Flow`
- `SAMA`
- `Creao`

Isso indica que a base já tem bastante código, porém ainda não está convergindo para uma proposta de produto única.

## 2. Leitura executiva

### O que já existe na base

- shell da aplicação em `Next.js 16.2.2` com `App Router`, `React 19`, `Tailwind 4` e `Framer Motion`;
- autenticação com `NextAuth`, `Google` e `Facebook`;
- persistência com `Prisma` e `SQLite`;
- módulo de publicação Instagram;
- endpoints para validação de token, envio de DM e leitura parcial de conversas sociais;
- console de WhatsApp com conversas, templates, PIX e webhook;
- base inicial para vetores/knowledge search com `Gemini` + `Cloudflare D1`;
- serviços de Meta Ads (`SAMA`);
- telas de classes, fidelidade, checkout e campanhas.

### O que ainda não existe de forma consistente para o InstaBot AI

- automação fim a fim de comentários do Instagram;
- ingestão operacional de base de conhecimento para respostas;
- webhook e fila de processamento para comentários;
- regras de automação, fallback humano e trilha de auditoria;
- onboarding transacional com persistência de estado e validação real;
- centralização de branding, parâmetros e configuração por ambiente;
- baseline estável de TypeScript.

## 3. Arquitetura atual da aplicação

### 3.1 Frontend

Estrutura principal:

- `src/app/*`: rotas do App Router;
- `src/components/*`: componentes por domínio;
- `src/components/layout/*`: shell, sidebar e footer;
- `src/app/onboarding/page.tsx`: landing interna de configuração Meta;
- `src/app/automation/instagram/page.tsx`: painel operacional Instagram;
- `src/app/whatsapp/page.tsx`: inbox WhatsApp;
- `src/app/publisher/page.tsx` e `src/app/automation/publisher/page.tsx`: publicação e fila de conteúdo.

Padrão observado:

- boa separação por domínio visual;
- uso intenso de client components;
- pouca padronização de estado/queries;
- onboarding ainda muito estático e sem fluxo guiado real.

### 3.2 Backend e integração

Camadas observadas:

- `src/app/api/*`: route handlers;
- `src/lib/*`: utilitários, auth, tokens, vetores, config;
- `src/services/meta/*`: serviços de Meta Ads;
- `src/repositories/*`: contratos de repositório;
- `src/types/*`: contratos tipados.

Integrações encontradas:

- Meta Graph API para Instagram/Facebook/WhatsApp;
- Google Gemini para embeddings;
- OpenAI SDK;
- Cloudflare D1 para store vetorial;
- NextAuth/Prisma Adapter.

### 3.3 Dados

No `prisma/schema.prisma` já existem modelos para:

- autenticação: `User`, `Account`, `Session`;
- Instagram: `InstagramAccount`, `Post`, `PostMedia`;
- chat interno: `Conversation`, `Message`;
- campanhas: `Campaign`;
- WhatsApp: `WhatsAppContact`, `WhatsAppConversation`, `WhatsAppMessage`, `WhatsAppWelcomeSequence`;
- educação/comercial: `Class`, `Block`, `Enrollment`, `Payment`;
- fidelidade: modelos de loyalty.

Leitura prática:

- a base de dados já suporta um produto multi-módulo;
- o produto alvo do InstaBot AI ainda usa só uma fração desse modelo;
- há risco de complexidade excessiva antes de fechar o fluxo principal.

## 4. Gap analysis: o que é importante e ainda não está na app

### 4.1 Gap de produto

O maior gap não é visual. É de fluxo principal.

Para a promessa do InstaBot AI, faltam estes módulos centrais:

1. **Ingestão de comentários em tempo real**
   Hoje não encontrei webhook de Instagram para comentários. Há leitura de conversas e DMs, mas não o loop de captura de novos comentários para automação.

2. **Motor de resposta com conhecimento**
   Existe base vetorial e busca semântica, mas não há acoplamento claro entre:
   - comentário recebido;
   - busca na base;
   - geração da resposta;
   - envio da resposta;
   - logging do resultado.

3. **Configuração de regras de automação**
   Faltam regras como:
   - responder só em posts selecionados;
   - palavra-chave obrigatória;
   - bloquear SPAM;
   - cooldown por usuário;
   - modo aprovação manual;
   - templates por categoria.

4. **Observabilidade operacional**
   Não há um centro operacional claro para:
   - comentários processados;
   - falhas;
   - respostas geradas;
   - itens que exigem ação humana;
   - métricas de volume e SLA.

5. **Onboarding orientado à ativação**
   A tela de onboarding existe, mas ainda não opera como wizard. Falta:
   - estado persistido;
   - checklist de progresso;
   - validação real de token;
   - validação de permissões;
   - validação de conta business;
   - validação de webhook;
   - configuração da base de conhecimento;
   - teste assistido.

### 4.2 Gap de plataforma

1. **Branding fragmentado**
   O mesmo produto aparece como `Social Flow`, `InstaBot AI`, `SAMA` e `Creao`. Isso precisa virar uma única camada de configuração.

2. **Configuração hardcoded**
   Há URLs, IDs e caminhos absolutos embutidos no código. Isso impede portabilidade e dificulta produção.

3. **Validação de ambiente inconsistente**
   Existe `src/lib/sama-env.ts`, mas o contrato de ambiente não cobre de forma centralizada todos os módulos ativos.

4. **TypeScript ainda instável**
   A base ainda tem erros de tipo em campanhas, checkout, posts, WhatsApp, vetores, scripts e Meta Ads.

5. **Segurança operacional**
   O onboarding aceita token manual, mas ainda faltam:
   - política explícita de armazenamento seguro;
   - trilha de auditoria;
   - rotação;
   - mascaramento e escopo por tenant.

## 5. Parâmetros necessários para a plataforma

### 5.1 Parâmetros core

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`

### 5.2 Meta / Instagram / Facebook

- `META_ACCESS_TOKEN`
- `META_AD_ACCOUNT_ID`
- `META_API_VERSION`
- `META_APP_ID`
- `META_APP_SECRET`
- `META_OAUTH_REDIRECT_URI`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_PAGE_ACCESS_TOKEN`
- `FACEBOOK_PAGE_ID`
- `INSTAGRAM_ACCESS_TOKEN`
- `INSTAGRAM_ACCOUNT_ID`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- `INSTAGRAM_REDIRECT_URI`
- `INSTAGRAM_SESSION_COOKIE`

### 5.3 WhatsApp

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_API_VERSION`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

### 5.4 IA e conhecimento

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_TOKEN`
- `CLOUDFLARE_DATABASE_ID`
- `BRAIN_BASE_DIR`

### 5.5 Segurança auxiliar

- `COOKIE_ENCRYPTION_KEY`
- `COOKIE_ENCRYPTION_SALT`
- `LOG_LEVEL`

## 6. Dependências

### Ajuste aplicado agora

Foi adicionada dependência direta:

- `zod`

Motivo:

- o código já importava `zod` diretamente;
- a dependência não estava declarada no `package.json`;
- isso deixava a base dependente de resolução transitiva.

### Dependências recomendadas para a próxima fase

Estas bibliotecas são recomendadas, mas só devem ser adicionadas quando o módulo correspondente for iniciado:

- `react-hook-form`
- `@hookform/resolvers`
- `@tanstack/react-query`
- `bullmq`
- `ioredis`

Uso recomendado:

- forms/validação do onboarding;
- queries assíncronas e polling operacional;
- fila de comentários, retries e idempotência.

## 7. Ajustes técnicos aplicados nesta rodada

### Ajustes feitos

- removida a dependência de `next/font/google` do layout, trocando por stacks locais;
- rota `brain-images` ajustada para usar `BRAIN_BASE_DIR` com fallback local, eliminando acoplamento a diretório pessoal;
- `zod` declarado como dependência direta;
- pacote inicial de estabilização TypeScript:
  - imports sem extensão `.ts`;
  - compatibilidade com `zod` v4 em `sama-env`;
  - correção de imports incorretos em `checkout` e `footer`.

### Situação atual de build

- o código já volta a compilar na fase principal do `next build`;
- no sandbox, a etapa final ainda encerra com `spawn EPERM`;
- rodando `npx tsc --noEmit`, ainda restam erros de tipagem em múltiplos módulos.

## 8. Arquitetura alvo recomendada

### Camadas propostas

1. **App Shell**
   Layout, sessão, branding, navegação e configuração do tenant.

2. **Onboarding Engine**
   Wizard persistido com etapas, progresso, testes e conclusão.

3. **Meta Connection Layer**
   OAuth, tokens, escopos, webhook, health checks e renovação.

4. **Knowledge Layer**
   ingestão de arquivos, vetorização, versionamento e busca semântica.

5. **Automation Engine**
   regras, filtros, classificação de comentário, geração da resposta, fallback humano.

6. **Inbox & Audit**
   timeline de comentários e mensagens, status, retries, logs e ações manuais.

7. **Analytics**
   métricas por post, volume, taxa de resposta, falhas, CTR para CTA e conversão.

## 9. Roadmap de implementação módulo por módulo

### Módulo 0: Estabilização da plataforma

Objetivo:

- deixar build, tipos, parâmetros e branding sob controle.

Entregáveis:

- corrigir erros TypeScript restantes;
- unificar naming de produto;
- criar schema central de ambiente;
- padronizar config por domínio;
- remover hardcodes de IDs/URLs.

### Módulo 1: Onboarding real

Objetivo:

- transformar `/onboarding` em wizard operacional.

Entregáveis:

- etapas persistidas;
- validação de token e permissões;
- conexão com conta Instagram Business;
- configuração de webhook;
- teste assistido;
- resumo final com status.

### Módulo 2: Base de conhecimento

Objetivo:

- permitir que a IA responda usando conteúdo confiável do cliente.

Entregáveis:

- upload de documentos;
- parsing e chunking;
- vetorização;
- busca semântica;
- score de confiança;
- reindexação.

### Módulo 3: Automação de comentários

Objetivo:

- entregar o núcleo do InstaBot AI.

Entregáveis:

- webhook Instagram;
- fila de processamento;
- classificação de comentário;
- geração de resposta;
- publicação da resposta;
- prevenção de duplicidade;
- regras por post/campanha.

### Módulo 4: Operação e supervisão

Objetivo:

- permitir operar com segurança.

Entregáveis:

- inbox de comentários;
- aprovação manual;
- retry de falhas;
- logs por evento;
- painel de saúde da integração.

### Módulo 5: Analytics e otimização

Objetivo:

- fechar o loop de aprendizado.

Entregáveis:

- métricas por post;
- tempo médio de resposta;
- taxa de resolução;
- principais intents;
- respostas com melhor performance.

## 10. Ordem prática recomendada

Sequência recomendada para execução:

1. estabilização técnica;
2. onboarding real;
3. base de conhecimento;
4. webhook + automação de comentários;
5. operação/auditoria;
6. analytics.

## 11. Observações finais

O repositório já tem densidade suficiente para virar um produto forte, mas hoje ele ainda se comporta mais como um hub de experimentos e módulos paralelos do que como um SaaS único.

Se o objetivo é aproximar a app do `InstaBot AI`, a decisão correta é parar de abrir novas frentes e consolidar primeiro:

- identidade de produto;
- integração Meta;
- onboarding;
- motor de comentários com base de conhecimento.
