# Todo List de Desenvolvimento - SAMA

## Visão
Este documento contém o todo-list detalhado de **baixo nível** para controle do desenvolvimento de cada fase/funcionalidade. Focado em **pontos a serem desenvolvidos**, não em implementação técnica.

---

## Fase 1: Calibração e Diagnóstico

### 1.1 Configuração de Ambiente
- [ ] 1.1.1 Criar arquivo `.env.example` com todas as variáveis necessárias
- [ ] 1.1.2 Documentar cada variável de ambiente (nome, tipo, descrição, como obter)
- [ ] 1.1.3 Criar script de validação `check-meta-env.py`
- [ ] 1.1.4 Validar presença de todas as variáveis obrigatórias
- [ ] 1.1.5 Validar formato das variáveis (URLs, IDs, tokens)

### 1.2 Validação de Tokens
- [ ] 1.2.1 Implementar verificação de validade do token de acesso
- [ ] 1.2.2 Implementar verificação de escopos/permissions do token
  - [ ] 1.2.2.1 Verificar `ads_management`
  - [ ] 1.2.2.2 Verificar `ads_read`
  - [ ] 1.2.2.3 Verificar `business_management`
- [ ] 1.2.3 Implementar teste de conexão com token
- [ ] 1.2.4 Implementar mecanismo de refresh de token (se aplicável)
- [ ] 1.2.5 Documentar processo de obtenção/renovação de token

### 1.3 Validação de Act Account
- [ ] 1.3.1 Implementar verificação de acesso ao Act Account ID
- [ ] 1.3.2 Testar leitura de informações da conta de anúncios
- [ ] 1.3.3 Validar permissões de criação/edição de campanhas
- [ ] 1.3.4 Testar listagem de campanhas existentes
- [ ] 1.3.5 Documentar limitações e quotas da conta

### 1.4 Sistema de Logging
- [ ] 1.4.1 Configurar estrutura de logs centralizada
- [ ] 1.4.2 Implementar log de requisições à Meta API
  - [ ] 1.4.2.1 Log de URL e método HTTP
  - [ ] 1.4.2.2 Log de headers (sem dados sensíveis)
  - [ ] 1.4.2.3 Log de payload (sanitizado)
  - [ ] 1.4.2.4 Log de response status e body
- [ ] 1.4.3 Implementar log de erros detalhados
  - [ ] 1.4.3.1 Stack trace em ambiente de dev
  - [ ] 1.4.3.2 Mensagem sanitizada em produção
  - [ ] 1.4.3.3 Correlation ID para rastreamento
- [ ] 1.4.4 Configurar rotação de logs
- [ ] 1.4.5 Criar arquivo `logs/meta-requests.log`

### 1.5 Correção de Erros Conhecidos
- [ ] 1.5.1 Investigar erro "Unsupported post request"
- [ ] 1.5.2 Identificar causa raiz (endpoint, método, payload, versão da API)
- [ ] 1.5.3 Implementar correção
- [ ] 1.5.4 Adicionar teste que previne regressão
- [ ] 1.5.5 Documentar lições aprendidas

### 1.6 Testes da Fase 1
- [ ] 1.6.1 Criar teste unitário de validação de ambiente
- [ ] 1.6.2 Criar teste de integração com Meta API (sandbox)
- [ ] 1.6.3 Criar teste de logging
- [ ] 1.6.4 Executar todos os testes manualmente
- [ ] 1.6.5 Documentar resultados de testes

---

## Fase 2: Insight (Cérebro Analítico)

### 2.1 Infraestrutura de Dados
- [ ] 2.1.1 Modelar schema de armazenamento de insights
  - [ ] 2.1.1.1 Tabela de Campaign insights
  - [ ] 2.1.1.2 Tabela de AdSet insights
  - [ ] 2.1.1.3 Tabela de Ad insights
  - [ ] 2.1.1.4 Tabela de métricas históricas
- [ ] 2.1.2 Criar migrations do Prisma para schema
- [ ] 2.1.3 Criar repositories para cada entidade
- [ ] 2.1.4 Implementar seeders de dados de teste
- [ ] 2.1.5 Otimizar queries com índices apropriados

### 2.2 InsightService - Consulta
- [ ] 2.2.1 Implementar método de consulta de insights da Meta API
  - [ ] 2.2.1.1 Definir campos a consultar (impressions, clicks, spend, etc.)
  - [ ] 2.2.1.2 Definir período de consulta (desde 2026)
  - [ ] 2.2.1.3 Implementar paginação para grandes volumes de dados
  - [ ] 2.2.1.4 Implementar retry logic para falhas de rede
- [ ] 2.2.2 Implementar armazenamento de dados consultados
  - [ ] 2.2.2.1 Upsert de métricas no banco
  - [ ] 2.2.2.2 Controle de última sincronização
  - [ ] 2.2.2.3 Log de sincronização
- [ ] 2.2.3 Implementar sistema de cache
  - [ ] 2.2.3.1 Definir TTL para dados de insights
  - [ ] 2.2.3.2 Implementar invalidação de cache
  - [ ] 2.2.3.3 Cache por campanha, adset, ad

### 2.3 Motor de Análise
- [ ] 2.3.1 Definir algoritmo de classificação de performance
  - [ ] 2.3.1.1 Definir critérios para "Win" (ex: ROAS > 3, CPA < target)
  - [ ] 2.3.1.2 Definir critérios para "Loss" (ex: ROAS < 1, CPA > 2x target)
  - [ ] 2.3.1.3 Definir critérios para "Neutral"
- [ ] 2.3.2 Implementar cálculo de métricas derivadas
  - [ ] 2.3.2.1 CTR (Click-Through Rate)
  - [ ] 2.3.2.2 CPA (Cost Per Acquisition)
  - [ ] 2.3.2.3 ROAS (Return On Ad Spend)
  - [ ] 2.3.2.4 CPM (Cost Per Mille)
  - [ ] 2.3.2.5 CPC (Cost Per Click)
- [ ] 2.3.3 Implementar sistema de scoring de criativos
  - [ ] 2.3.3.1 Definir pesos para cada métrica
  - [ ] 2.3.3.2 Calcular score normalizado (0-100)
  - [ ] 2.3.3.3 Rankear criativos por score
- [ ] 2.3.4 Implementar identificação de padrões
  - [ ] 2.3.4.1 Padrões de criativos vencedores (cores, formato, copy)
  - [ ] 2.3.4.2 Padrões de públicos vencedores
  - [ ] 2.3.4.3 Padrões temporais (melhores horários/dias)

### 2.4 PerformanceChart Component
- [ ] 2.4.1 Configurar Chart.js no projeto
- [ ] 2.4.2 Criar componente PerformanceChart reutilizável
  - [ ] 2.4.2.1 Props para dados, título, tipo de gráfico
  - [ ] 2.4.2.2 Suporte a line, bar, pie charts
  - [ ] 2.4.2.3 Tooltips informativos
  - [ ] 2.4.2.4 Responsividade
- [ ] 2.4.3 Implementar gráficos de métricas ao longo do tempo
- [ ] 2.4.4 Implementar gráfico de comparação Wins vs Losses
- [ ] 2.4.5 Implementar gráfico de distribuição de scores
- [ ] 2.4.6 Estilizar seguindo Design System ACI

### 2.5 Dashboard de Métricas
- [ ] 2.5.1 Criar página de dashboard principal
- [ ] 2.5.2 Implementar cards de KPIs principais
  - [ ] 2.5.2.1 Total investido
  - [ ] 2.5.2.2 Total de conversões
  - [ ] 2.5.2.3 ROAS médio
  - [ ] 2.5.2.4 CPA médio
- [ ] 2.5.3 Implementar seção de Top Performers
  - [ ] 2.5.3.1 Lista de criativos winners
  - [ ] 2.5.3.2 Lista de criativos losers
  - [ ] 2.5.3.3 Detalhes de cada criativo (score, métricas)
- [ ] 2.5.4 Implementar filtros
  - [ ] 2.5.4.1 Filtro por período
  - [ ] 2.5.4.2 Filtro por campanha
  - [ ] 2.5.4.3 Filtro por status (Win/Loss/Neutral)
- [ ] 2.5.5 Implementar refresh automático de dados
- [ ] 2.5.6 Implementar loading states e error states

### 2.6 Relatórios Premium
- [ ] 2.6.1 Definir template de relatório cinematográfico
- [ ] 2.6.2 Implementar geração de relatório em PDF/HTML
- [ ] 2.6.3 Incluir visualizações de dados no relatório
- [ ] 2.6.4 Incluir insights e recomendações automáticas
- [ ] 2.6.5 Implementar agendamento de relatórios (opcional)
- [ ] 2.6.6 Estilizar seguindo Design System ACI

### 2.7 Testes da Fase 2
- [ ] 2.7.1 Testes unitários do InsightService
  - [ ] 2.7.1.1 Teste de consulta com dados mockados
  - [ ] 2.7.1.2 Teste de classificação Wins/Losses
  - [ ] 2.7.1.3 Teste de cálculo de métricas
  - [ ] 2.7.1.4 Teste de scoring
- [ ] 2.7.2 Testes de integração com banco de dados
  - [ ] 2.7.2.1 Teste de persistência de insights
  - [ ] 2.7.2.2 Teste de queries e agregações
- [ ] 2.7.3 Testes de integração com Meta API (sandbox)
  - [ ] 2.7.3.1 Teste de consulta de insights reais
- [ ] 2.7.4 Testes de componentes UI
  - [ ] 2.7.4.1 Teste de renderização de gráficos
  - [ ] 2.7.4.2 Teste de interatividade

---

## Fase 3: Creator (Braço Executor)

### 3.1 AssetService - Upload
- [ ] 3.1.1 Implementar upload de imagens
  - [ ] 3.1.1.1 Validação de formato (JPG, PNG)
  - [ ] 3.1.1.2 Validação de tamanho máximo
  - [ ] 3.1.1.3 Armazenamento local/cloud
  - [ ] 3.1.1.4 Geração de thumbnails
- [ ] 3.1.2 Implementar upload de vídeos
  - [ ] 3.1.2.1 Validação de formato (MP4, MOV)
  - [ ] 3.1.2.2 Validação de tamanho máximo
  - [ ] 3.1.2.3 Armazenamento local/cloud
  - [ ] 3.1.2.4 Geração de previews
- [ ] 3.1.3 Implementar organização de assets
  - [ ] 3.1.3.1 Sistema de tags/categorias
  - [ ] 3.1.3.2 Versionamento de assets
  - [ ] 3.1.3.3 Metadados de cada asset (dimensões, duração, etc.)
- [ ] 3.1.4 Implementar busca e filtragem de assets
- [ ] 3.1.5 Implementar deletação de assets

### 3.2 Asset Customization
- [ ] 3.2.1 Implementar adaptação para Feed
  - [ ] 3.2.1.1 Ratio 1:1 ou 4:5
  - [ ] 3.2.1.2 Resolução mínima
  - [ ] 3.2.1.3 Crop inteligente se necessário
- [ ] 3.2.2 Implementar adaptação para Stories
  - [ ] 3.2.2.1 Ratio 9:16
  - [ ] 3.2.2.2 Resolução recomendada
  - [ ] 3.2.2.3 Ajuste de composição
- [ ] 3.2.3 Implementar adaptação para Reels
  - [ ] 3.2.3.1 Ratio 9:16
  - [ ] 3.2.3.2 Duração máxima
  - [ ] 3.2.3.3 Formato de vídeo otimizado
- [ ] 3.2.4 Implementar validação de requisitos da Meta
  - [ ] 3.2.4.1 Validação de dimensões
  - [ ] 3.2.4.2 Validação de tamanho de arquivo
  - [ ] 3.2.4.3 Validação de duração (vídeos)
- [ ] 3.2.5 Implementar geração automática de variações
  - [ ] 3.2.5.1 Crop automático
  - [ ] 3.2.5.2 Resize com preservação de qualidade
  - [ ] 3.2.5.3 Otimização de tamanho de arquivo

### 3.3 DeployService - Campaign
- [ ] 3.3.1 Implementar criação de Campaign na Meta API
  - [ ] 3.3.1.1 Definir objective da campanha
  - [ ] 3.3.1.2 Definir nome da campanha
  - [ ] 3.3.1.3 Definir buying type
  - [ ] 3.3.1.4 Configuração de orçamento em nível de campanha (se aplicável)
- [ ] 3.3.2 Implementar validação de criação
- [ ] 3.3.3 Implementar armazenamento de ID da campaign criada
- [ ] 3.3.4 Implementar tratamento de erros de criação
- [ ] 3.3.5 Implementar criação em modo Draft/Sandbox para testes

### 3.4 DeployService - AdSet
- [ ] 3.4.1 Implementar criação de AdSet
  - [ ] 3.4.1.1 Vinculação à Campaign
  - [ ] 3.4.1.2 Definição de público (custom, lookalike, interest)
  - [ ] 3.4.1.3 Definição de posicionamentos (placements)
  - [ ] 3.4.1.4 Definição de orçamento e schedule
  - [ ] 3.4.1.5 Otimização e bidding strategy
- [ ] 3.4.2 Implementar validação de criação
- [ ] 3.4.3 Implementar armazenamento de ID do adset criado
- [ ] 3.4.4 Implementar tratamento de erros de criação
- [ ] 3.4.5 Implementar criação de múltiplos adsets por campanha

### 3.5 DeployService - Ads
- [ ] 3.5.1 Implementar criação de Ad
  - [ ] 3.5.1.1 Vinculação ao AdSet
  - [ ] 3.5.1.2 Upload de criativo (imagem/vídeo)
  - [ ] 3.5.1.3 Definição de copy (primary text, headline, description)
  - [ ] 3.5.1.4 Definição de CTA (call-to-action)
  - [ ] 3.5.1.5 Definição de URL de destino
- [ ] 3.5.2 Implementar validação de criação
- [ ] 3.5.3 Implementar armazenamento de ID do ad criado
- [ ] 3.5.4 Implementar tratamento de erros de criação
- [ ] 3.5.5 Implementar criação de múltiplos ads por adset (A/B testing)

### 3.6 Hierarquia Completa
- [ ] 3.6.1 Implementar orquestração Campaign → AdSet → Ads
- [ ] 3.6.2 Implementar transação/rollback em caso de falha
- [ ] 3.6.3 Implementar log de progresso do deploy
- [ ] 3.6.4 Implementar validação pré-deploy
  - [ ] 3.6.4.1 Validação de todos os dados necessários
  - [ ] 3.6.4.2 Validação de assets
  - [ ] 3.6.4.3 Validação de permissões
- [ ] 3.6.5 Implementar resumo pós-deploy
  - [ ] 3.6.5.1 IDs criados
  - [ ] 3.6.5.2 Links para visualização
  - [ ] 3.6.5.3 Status de cada componente

### 3.7 Interface de Comando
- [ ] 3.7.1 Implementar hook de terminal `/meta-ads-deploy`
- [ ] 3.7.2 Implementar parsing de argumentos do comando
- [ ] 3.7.3 Implementar validação de argumentos
- [ ] 3.7.4 Implementar feedback de progresso no terminal
  - [ ] 3.7.4.1 Spinners/progress bars
  - [ ] 3.7.4.2 Mensagens de status
  - [ ] 3.7.4.3 Indicadores de sucesso/erro
- [ ] 3.7.5 Implementar resumo final no terminal
- [ ] 3.7.6 Implementar opção de dry-run (simulação sem criar)

### 3.8 Testes da Fase 3
- [ ] 3.8.1 Testes unitários do AssetService
  - [ ] 3.8.1.1 Teste de upload com mocks
  - [ ] 3.8.1.2 Teste de customização de assets
  - [ ] 3.8.1.3 Teste de validação de assets
- [ ] 3.8.2 Testes unitários do DeployService
  - [ ] 3.8.2.1 Teste de criação de campaign com mocks
  - [ ] 3.8.2.2 Teste de criação de adset com mocks
  - [ ] 3.8.2.3 Teste de criação de ad com mocks
  - [ ] 3.8.2.4 Teste de rollback em falha
- [ ] 3.8.3 Testes de integração com Meta API (sandbox)
  - [ ] 3.8.3.1 Teste de criação real de hierarchy
- [ ] 3.8.4 Testes de comando de terminal
  - [ ] 3.8.4.1 Teste de parsing de argumentos
  - [ ] 3.8.4.2 Teste de feedback de progresso

---

## Fase 4: UX & Refinamento

### 4.1 Feedback Visual
- [ ] 4.1.1 Implementar componente de mensagem de progresso
  - [ ] 4.1.1.1 Estilo cinematográfico
  - [ ] 4.1.1.2 Animações suaves
  - [ ] 4.1.1.3 Cores do Design System ACI
- [ ] 4.1.2 Implementar componente de status
  - [ ] 4.1.2.1 Status: Pending
  - [ ] 4.1.2.2 Status: In Progress
  - [ ] 4.1.2.3 Status: Success
  - [ ] 4.1.2.4 Status: Error
  - [ ] 4.1.2.5 Status: Cancelled
- [ ] 4.1.3 Implementar notificações toast
  - [ ] 4.1.3.1 Toast de sucesso
  - [ ] 4.1.3.2 Toast de erro
  - [ ] 4.1.3.3 Toast de informação
  - [ ] 4.1.3.4 Auto-dismiss e manual dismiss
- [ ] 4.1.4 Implementar loading states em todas as interações
- [ ] 4.1.5 Implementar empty states informativos

### 4.2 Workflow de Aprovação
- [ ] 4.2.1 Criar tela de revisão pré-deploy
  - [ ] 4.2.1.1 Resumo da campaign a ser criada
  - [ ] 4.2.1.2 Resumo dos adsets
  - [ ] 4.2.1.3 Resumo dos ads
  - [ ] 4.2.1.4 Preview de criativos
- [ ] 4.2.2 Implementar sistema Aprovar/Rejeitar
  - [ ] 4.2.2.1 Botão de aprovação
  - [ ] 4.2.2.2 Botão de rejeição
  - [ ] 4.2.2.3 Campo de comentário (opcional)
  - [ ] 4.2.2.4 Confirmação de ação
- [ ] 4.2.3 Implementar log de aprovações/rejeições
  - [ ] 4.2.3.1 Quem aprovou/rejeitou
  - [ ] 4.2.3.2 Quando
  - [ ] 4.2.3.3 Comentários associados
- [ ] 4.2.4 Implementar notificação de resultado da aprovação
- [ ] 4.2.5 Implementar histórico de aprovações

### 4.3 UI de Confirmação de Deploy
- [ ] 4.3.1 Criar modal de confirmação antes do deploy
- [ ] 4.3.2 Exibir resumo do que será criado
- [ ] 4.3.3 Exibir estimativa de custo (se aplicável)
- [ ] 4.3.4 Exibir alertas e validações pendentes
- [ ] 4.3.5 Implementar confirmação explícita (checkbox "Entendo os efeitos")
- [ ] 4.3.6 Implementar opção de agendamento de deploy

### 4.4 Polimento de Interface
- [ ] 4.4.1 Revisar todos os componentes contra Design System ACI
- [ ] 4.4.2 Implementar transições e animações
- [ ] 4.4.3 Implementar responsividade completa
- [ ] 4.4.4 Implementar acessibilidade (ARIA labels, keyboard navigation)
- [ ] 4.4.5 Revisar tipografia e espaçamentos
- [ ] 4.4.6 Revisar paleta de cores e contrastes
- [ ] 4.4.7 Implementar dark mode (opcional)

### 4.5 Documentação
- [ ] 4.5.1 Escrever README.md completo
  - [ ] 4.5.1.1 Visão geral do projeto
  - [ ] 4.5.1.2 Como configurar ambiente
  - [ ] 4.5.1.3 Como rodar projeto
  - [ ] 4.5.1.4 Como rodar testes
  - [ ] 4.5.1.5 Estrutura de pastas
  - [ ] 4.5.1.6 Como contribuir
- [ ] 4.5.2 Escrever Manual da Skill
  - [ ] 4.5.2.1 O que a skill faz
  -  [ ] 4.5.2.2 Como usar cada comando
  - [ ] 4.5.2.3 Exemplos de uso
  - [ ] 4.5.2.4 Troubleshooting
  - [ ] 4.5.2.5 FAQ
- [ ] 4.5.3 Documentar APIs internas (se aplicável)
- [ ] 4.5.4 Documentar schema de banco de dados
- [ ] 4.5.5 Criar guia de deploy para produção
- [ ] 4.5.6 Criar guia de monitoramento e logs

### 4.6 Testes da Fase 4
- [ ] 4.6.1 Testes e2e de fluxos completos
  - [ ] 4.6.1.1 Fluxo de deploy completo
  - [ ] 4.6.1.2 Fluxo de aprovação
  - [ ] 4.6.1.3 Fluxo de consulta de insights
- [ ] 4.6.2 Testes de usabilidade
  - [ ] 4.6.2.2 Tempo para completar tarefas
  - [ ] 4.6.2.3 Taxa de erro
- [ ] 4.6.3 Testes de responsividade
  - [ ] 4.6.3.1 Mobile, tablet, desktop
- [ ] 4.6.4 Testes de acessibilidade
  - [ ] 4.6.4.1 WCAG compliance básico

---

## Resumo de Progresso

### Fase 1: Calibração e Diagnóstico
- **Progresso:** 0/35 itens completos
- **Status:** NÃO INICIADA

### Fase 2: Insight (Cérebro Analítico)
- **Progresso:** 0/67 itens completos
- **Status:** NÃO INICIADA

### Fase 3: Creator (Braço Executor)
- **Progresso:** 0/71 itens completos
- **Status:** NÃO INICIADA

### Fase 4: UX & Refinamento
- **Progresso:** 0/56 itens completos
- **Status:** NÃO INICIADA

### Total Geral
- **Progresso:** 0/229 itens completos
- **Completude:** 0%

---

## Priorização Sugerida

### Sprint 1 (Semana 1)
- Fase 1: Itens 1.1, 1.2, 1.3 (Configuração e validação de ambiente)

### Sprint 2 (Semana 2)
- Fase 1: Itens 1.4, 1.5, 1.6 (Logging e correção de erros)

### Sprint 3 (Semana 3)
- Fase 2: Itens 2.1, 2.2 (Infraestrutura de dados e consulta)

### Sprint 4 (Semana 4)
- Fase 2: Itens 2.3, 2.4 (Motor de análise e gráficos)

### Sprint 5 (Semana 5)
- Fase 2: Itens 2.5, 2.6, 2.7 (Dashboard, relatórios e testes)

### Sprint 6 (Semana 6)
- Fase 3: Itens 3.1, 3.2 (AssetService e customização)

### Sprint 7 (Semana 7)
- Fase 3: Itens 3.3, 3.4, 3.5 (Deploy de Campaign, AdSet, Ads)

### Sprint 8 (Semana 8)
- Fase 3: Itens 3.6, 3.7, 3.8 (Hierarquia, comando e testes)

### Sprint 9-10 (Semana 9-10)
- Fase 4: Itens 4.1, 4.2, 4.3 (Feedback visual e aprovação)

### Sprint 11-12 (Semana 11-12)
- Fase 4: Itens 4.4, 4.5, 4.6 (Polimento, documentação e testes)

---

© Automações Comerciais Integradas! 2026 ⚙️  
contato@automacoescomerciais.com.br
