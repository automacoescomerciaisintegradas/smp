# Sistema de Marketing, Pagamentos e Fidelização

## 📋 Visão Geral

Sistema completo para gestão de turmas, inscrições, pagamentos e programas de fidelização, permitindo que empresas gerenciem e automatizem programas de fidelização de clientes com recompensas e incentivos para divulgação em redes sociais.

## 🚀 Funcionalidades Implementadas

### 1. **Gestão de Turmas e Blocos** (`/dashboard/classes`)
- ✅ Criação de turmas com datas de início e término
- ✅ Configuração de preços por turma
- ✅ Criação de blocos dentro de cada turma com preços individuais
- ✅ Limite de vagas por turma/bloco
- ✅ Status de turmas (Rascunho, Ativa, Concluída, Cancelada)
- ✅ Visualização de inscrições por turma

### 2. **Sistema de Inscrições** (`/api/enrollments`)
- ✅ Inscrição adaptada por turma e bloco
- ✅ Valores adaptáveis conforme a turma/bloco selecionado
- ✅ Aplicação de códigos promocionais (desconto percentual ou fixo)
- ✅ Tracking de status (Pendente, Confirmada, Cancelada, Reembolsada)
- ✅ Coleta de dados do aluno (nome, email, telefone)

### 3. **Checkout de Pagamentos** (`/checkout`)
- ✅ Fluxo de checkout completo em 3 etapas:
  1. Formulário de inscrição
  2. Seleção e processamento de pagamento
  3. Confirmação de sucesso
- ✅ Múltiplas formas de pagamento:
  - **PIX** (pagamento instantâneo)
  - **Cartão de Crédito** (até 12x)
  - **Boleto Bancário** (vencimento em 3 dias)
- ✅ Integração preparada para MercadoPago e Stripe
- ✅ Componente `PaymentButton` reutilizável

### 4. **Programa de Fidelidade** (`/dashboard/loyalty`)
- ✅ Sistema de pontos completo:
  - **100 pontos** por inscrição realizada
  - **50 pontos** por postagem em redes sociais
  - **200 pontos** por indicação que se inscrever
  - **Pontos bônus** por participação em eventos
- ✅ Catálogo de recompensas:
  - Descontos
  - Produtos
  - Experiências
  - Cashback
- ✅ Resgate de recompensas com pontos
- ✅ Controle de estoque de recompensas
- ✅ Histórico de pontos e resgates

### 5. **Sistema de Indicações e Redes Sociais**
- ✅ Tracking de indicações (referrals)
- ✅ Registro de compartilhamentos em redes sociais:
  - Instagram
  - Facebook
  - Twitter
  - TikTok
  - WhatsApp
- ✅ Verificação e aprovação de comprovantes
- ✅ Award automático de pontos por ações aprovadas

### 6. **Códigos Promocionais**
- ✅ Criação de promoções por turma
- ✅ Tipos de desconto: Percentual ou Fixo
- ✅ Limite de usos
- ✅ Período de validade
- ✅ Tracking de uso e descontos aplicados

## 📊 Banco de Dados (Schema)

### Models Criados:

1. **Class** - Turmas principais
   - Nome, descrição, datas, preço, vagas máximas
   - Relação com blocos, inscrições e promoções

2. **Block** - Blocos dentro de cada turma
   - Nome, descrição, datas, preço específico
   - Vinculado a uma turma

3. **Enrollment** - Inscrições de alunos
   - Dados do aluno, status, pagamento
   - Pontos de fidelidade e indicações

4. **Payment** - Registro de pagamentos
   - Valor, gateway, método, status
   - Códigos PIX, boletos, cartão

5. **LoyaltyProgram** - Programas de fidelidade
   - Regras, configurações da empresa

6. **LoyaltyPoint** - Histórico de pontos
   - Tipo, motivo, expiração

7. **Reward** - Recompensas disponíveis
   - Custo em pontos, tipo, valor, estoque

8. **RewardRedemption** - Resgates de recompensas
   - Status, pontos gastos

9. **Referral** - Indicações de alunos
   - Status de conversão

10. **SocialShare** - Compartilhamentos em redes sociais
    - Plataforma, URL, comprovação

11. **Promotion** - Códigos promocionais
    - Desconto, validade, limite de usos

12. **PromotionUse** - Uso de promoções
    - Desconto aplicado, usuário, inscrição

## 🎯 Como Usar

### Para Empresas:

1. **Criar uma Turma:**
   ```
   Dashboard → Classes → Nova Turma
   - Preencha nome, preço, datas
   - Adicione blocos se necessário
   - Defina limite de vagas
   ```

2. **Configurar Programa de Fidelidade:**
   ```
   Dashboard → Loyalty
   - Defina regras de pontuação
   - Adicione recompensas disponíveis
   - Configure estoque de recompensas
   ```

3. **Criar Código Promocional:**
   ```
   API: POST /api/classes (no campo promotions)
   - Defina código, desconto, validade
   - Limite de usos
   ```

### Para Alunos:

1. **Inscrever-se em uma Turma:**
   ```
   Acessar: /checkout?classId={id}&blockId={id}
   - Preencher dados pessoais
   - Aplicar código promocional (opcional)
   - Escolher forma de pagamento
   - Completar pagamento
   ```

2. **Acompanhar Pontos de Fidelidade:**
   ```
   Dashboard → Loyalty
   - Ver saldo de pontos
   - Resgatar recompensas
   - Ver histórico de pontos
   ```

## 🔗 API Routes

### `/api/classes`
- `GET` - Listar todas as turmas
- `POST` - Criar nova turma
- `PUT` - Atualizar turma
- `DELETE` - Deletar turma

### `/api/enrollments`
- `GET` - Listar inscrições (filtros: classId, blockId, status)
- `POST` - Criar nova inscrição

### `/api/payments`
- `GET` - Listar pagamentos (filtro: enrollmentId)
- `POST` - Criar novo pagamento

### `/api/loyalty`
- `GET` - Obter dados de fidelidade do usuário
- `POST` - Resgatar recompensa
- `PUT` - Adicionar pontos a usuário

## 🎨 Componentes React

### `PaymentButton`
- Botão de pagamento completo com modal
- Suporte a PIX, Cartão e Boleto
- Callback onSuccess

### `LoyaltyCard`
- Card visual de pontos de fidelidade
- Gradiente roxo moderno
- Métricas de pontos e recompensas

### `RewardCard`
- Card de recompensa individual
- Botão de resgate integrado
- Verificação de pontos e estoque

## 📱 Páginas do Dashboard

1. **`/dashboard/classes`** - Gestão de turmas e blocos
2. **`/dashboard/loyalty`** - Programa de fidelidade
3. **`/checkout`** - Fluxo de checkout completo

## 💡 Próximos Passos (Melhorias Futuras)

1. **Integração Real com Gateways de Pagamento:**
   - Instalar SDK do MercadoPago: `npm install @mercadopago/sdk-react`
   - Instalar Stripe: `npm install @stripe/stripe-js`
   - Implementar webhooks para confirmação de pagamentos

2. **Automação de Redes Sociais:**
   - Integração com APIs do Instagram/Facebook
   - Verificação automática de posts
   - Tracking de hashtags

3. **Notificações:**
   - Emails transacionais (confirmação, lembretes)
   - Push notifications
   - WhatsApp automation

4. **Relatórios:**
   - Dashboard analytics
   - Métricas de conversão
   - ROI do programa de fidelidade

5. **Autenticação:**
   - Proteção de rotas por tipo de usuário
   - Permissões para empresas vs alunos

## 🔧 Configuração

```bash
# Instalar dependências
npm install

# Aplicar migrations do Prisma
npx prisma db push

# Gerar Prisma Client
npx prisma generate

# Rodar em desenvolvimento
npm run dev
```

## 📦 Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── classes/
│   │   │   └── route.ts
│   │   ├── enrollments/
│   │   │   └── route.ts
│   │   ├── payments/
│   │   │   └── route.ts
│   │   └── loyalty/
│   │       └── route.ts
│   ├── dashboard/
│   │   ├── classes/
│   │   │   └── page.tsx
│   │   └── loyalty/
│   │       └── page.tsx
│   └── checkout/
│       └── page.tsx
├── components/
│   └── loyalty/
│       ├── PaymentButton.tsx
│       ├── LoyaltyCard.tsx
│       └── RewardCard.tsx
└── lib/
    └── prisma.ts

prisma/
└── schema.prisma
```

## 🎁 Funcionalidades de Marketing e Fidelização

### Sistema de Recompensas
- **Inscrições**: Ganhe pontos ao se inscrever em turmas
- **Indicações**: Ganhe pontos ao indicar amigos
- **Redes Sociais**: Ganhe pontos ao promover a marca
- **Bônus**: Pontos extras por participação em eventos

### Tipos de Recompensa
1. **Descontos** - Desconto em próximas turmas
2. **Produtos** - Produtos físicos ou digitais
3. **Experiências** - Acesso VIP, mentorias exclusivas
4. **Cashback** - Dinheiro de volta

### Automação de Indicações
- Link de indicação único por aluno
- Tracking automático de conversões
- Award automático de pontos
- Notificações de status

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com o suporte técnico.
