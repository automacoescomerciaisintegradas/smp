# Planejamento de Ação Global - SAMA

## Visão Geral
Este documento organiza o desenvolvimento do SAMA em fases, identificando dependências e oportunidades de trabalho paralelo. Baseado no PRD e high-level-plan.

---

## 📊 Mapa de Dependências entre Fases

```
Fase 1: Calibração e Diagnóstico [CRÍTICA - BLOQUEANTE]
    ↓
Fase 2: Insight (Cérebro Analítico) [DEPENDENTE DA FASE 1]
    ↓
Fase 3: Creator (Braço Executor) [DEPENDENTE DAS FASES 1 E 2]
    ↓
Fase 4: UX & Refinamento [PARCIALMENTE INDEPENDENTE]
```

---

## 🚀 Fase 1: Calibração e Diagnóstico
**Status:** EM INÍCIO  
**Tipo:** CRÍTICA - BLOQUEANTE  
**Duração Estimada:** 1 semana

### Objetivo
Garantir conexão 100% estável e autorizada com Meta Graph API.

### Entregáveis
- ✅ Script de validação de ambiente (`scripts/check-meta-env.py`)
- ✅ Sistema de logging centralizado (`logs/meta-requests.log`)
- ✅ Correção do erro "Unsupported post request"
- ✅ Token de acesso com validade de longo prazo
- ✅ Act Account ID configurada e acessível

### Dependências
- **Nenhuma** - Esta é a fase inicial e bloqueante

### Impacto
- **BLOQUEIA** todas as fases subsequentes
- Sem esta fase completa, não há como prosseguir

### Critérios de Saída
- [ ] Execução do `check-meta-env.py` sem erros
- [ ] Token válido e com permissões: `ads_management`, `ads_read`, `business_management`
- [ ] Act Account acessível via Graph API
- [ ] Sistema de logs funcional

---

## 🧠 Fase 2: Insight (Cérebro Analítico)
**Status:** NÃO INICIADA  
**Tipo:** DEPENDENTE (requer Fase 1)  
**Duração Estimada:** 1-2 semanas

### Objetivo
Motor de análise de dados históricos operacional.

### Entregáveis
- `InsightService.ts` - Consulta e classificação de dados
- `PerformanceChart.tsx` - Visualização no dashboard
- Algoritmo de Ranker (Score de Criativos)
- Relatórios premium com Chart.js

### Dependências
- **BLOQUEADO POR:** Fase 1 (conexão Meta API estável)
- **BLOQUEIA:** Fase 3 (parcialmente)

### Trabalho Paralelo Possível
- ✅ Design UI do dashboard (depende do Design System)
- ✅ Definição de algoritmo de scoring (lógica de negócio)
- ✅ Estrutura de componentes de visualização
- ❌ Integração real com Meta API (requer Fase 1)

### Sub-fases
1. **2.1: Infraestrutura de Dados**
   - Modelagem de schema para armazenar insights
   - Service de consulta à Meta API
   - Cache e otimização de queries

2. **2.2: Motor de Análise**
   - Algoritmo de classificação (Wins/Losses)
   - Cálculo de métricas (CTR, CPA, ROAS)
   - Sistema de scoring de criativos

3. **2.3: Visualização**
   - Componente PerformanceChart
   - Dashboard de métricas
   - Relatórios cinematográficos

### Critérios de Saída
- [ ] Consulta de dados históricos desde 2026 funcional
- [ ] Classificação automática de performance (Wins/Losses)
- [ ] Dashboard visualizando métricas principais
- [ ] Algoritmo de score calibrado com dados reais

---

## 🎨 Fase 3: Creator (Braço Executor)
**Status:** NÃO INICIADA  
**Tipo:** DEPENDENTE (requer Fases 1 e 2)  
**Duração Estimada:** 2-3 semanas

### Objetivo
Automação total de criação de anúncios.

### Entregáveis
- `AssetService.ts` - Upload e organização de criativos
- `DeployService.ts` - Criação de hierarquia Campaign → AdSet → Ads
- Asset Customization (Feed, Stories, Reels)
- Hook de Terminal `/meta-ads-deploy`

### Dependências
- **BLOQUEADO POR:** Fase 1 (conexão Meta API)
- **DEPENDÊNCIA PARCIAL:** Fase 2 (dados de performance para decisões de deploy)
- **BLOQUEIA:** Fase 4 (workflow de aprovação)

### Trabalho Paralelo Possível
- ✅ Estrutura de AssetService (upload, organização)
- ✅ Lógica de customização de criativos
- ✅ Interface de comando de terminal
- ❌ Deploy real à Meta API (requer Fase 1)
- ❌ Integração com dados de insight (requer Fase 2)

### Sub-fases
1. **3.1: Gestão de Ativos**
   - Upload de imagens/vídeos
   - Organização e tagging
   - Versionamento de criativos

2. **3.2: Customização Automática**
   - Adaptação para posicionamentos
   - Resize e otimização de imagens
   - Validação de requisitos de cada formato

3. **3.3: Deploy Automático**
   - Criação de Campaign
   - Criação de AdSet (públicos, orçamento, schedule)
   - Criação de Ads (criativos, copies)
   - Hierarquia completa

4. **3.4: Interface de Comando**
   - Hook `/meta-ads-deploy`
   - Validação pré-deploy
   - Feedback de progresso

### Critérios de Saída
- [ ] Upload e customização de criativos funcional
- [ ] Deploy automático de hierarquia completa
- [ ] Comando de terminal operacional
- [ ] Testes em modo Sandbox/Draft passando

---

## ✨ Fase 4: UX & Refinamento
**Status:** NÃO INICIADA  
**Tipo:** PARCIALMENTE INDEPENDENTE  
**Duração Estimada:** 3+ semanas

### Objetivo
Interface cinematográfica e workflow de aprovação.

### Entregáveis
- UI de confirmação de Deploy
- Feedback visual de progresso
- Sistema de Aprovar/Rejeitar
- Documentação completa (README.md)
- Manual da Skill

### Dependências
- **DEPENDÊNCIA PARCIAL:** Fase 3 (para workflow de aprovação de deploy)
- **INDEPENDENTE:** Trabalho de UI/UX pode começar antes
- **INDEPENDENTE:** Documentação pode ser escrita incrementalmente

### Trabalho Paralelo Possível (pode começar DURANTE Fase 3)
- ✅ Design de interfaces (segue Design System)
- ✅ Componentes de feedback visual
- ✅ Fluxo de aprovação UI
- ✅ Documentação inicial
- ❌ Integração com deploy real (requer Fase 3)

### Sub-fases
1. **4.1: UI de Feedback**
   - Mensagens de progresso
   - Status cinematográficos
   - Animações e transições

2. **4.2: Workflow de Aprovação**
   - Tela de revisão pré-deploy
   - Sistema Aprovar/Rejeitar
   - Logs de aprovação

3. **4.3: Documentação**
   - README.md completo
   - Manual da Skill
   - Guia de contribuição
   - Examples e tutoriais

### Critérios de Saída
- [ ] Interface 100% aderente ao Design System
- [ ] Workflow de aprovação funcional
- [ ] Documentação completa e revisada
- [ ] Testes de usabilidade passando

---

## 🔄 Oportunidades de Paralelismo

### Pode começar IMEDIATAMENTE (sem esperar Fase 1):
- ✅ Configuração de projeto TypeScript/Next.js
- ✅ Setup de testes (unit, integração, e2e)
- ✅ Design System e componentes UI
- ✅ Modelagem de banco de dados (Prisma schema)
- ✅ CI/CD pipeline

### Pode começar DURANTE Fase 1:
- ✅ Estrutura de services (interfaces, DTOs)
- ✅ Componentes de UI estáticos
- ✅ Testes unitários com mocks
- ⚠️ Integrações reais (aguardar fim da Fase 1)

### Deve esperar Fase 1 COMPLETA:
- ❌ Chamadas reais à Meta API
- ❌ Testes de integração com API externa
- ❌ Validação de tokens em produção

### Pode começar DURANTE Fase 2:
- ✅ AssetService estrutura
- ✅ Customização de criativos (lógica)
- ✅ Interface de aprovação
- ⚠️ Deploy real (aguardar Fase 3)

---

## 📋 Roadmap Sugerido de Desenvolvimento

### Semana 1: Fundação
- [ ] Completar Fase 1 (Calibração)
- [ ] Setup de infraestrutura de testes
- [ ] Modelagem de banco de dados
- [ ] Estrutura base do projeto

### Semana 2: Insights
- [ ] Iniciar Fase 2 (InsightService)
- [ ] Componentes de dashboard (UI estática)
- [ ] Testes unitários da infraestrutura

### Semana 3: Analytics
- [ ] Completar Fase 2 (Dashboard funcional)
- [ ] Iniciar Fase 3 (AssetService)
- [ ] Testes de integração com DB

### Semana 4: Creator
- [ ] Continuar Fase 3 (DeployService)
- [ ] Interface de comando de terminal
- [ ] Testes e2e de fluxos básicos

### Semana 5: Deploy
- [ ] Completar Fase 3 (Deploy completo)
- [ ] Iniciar Fase 4 (UI de feedback)
- [ ] Integração de todos os módulos

### Semana 6+: Refinamento
- [ ] Completar Fase 4 (UX cinematográfica)
- [ ] Workflow de aprovação
- [ ] Documentação final
- [ ] Testes completos e bug fixing

---

## ⚠️ Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Mudanças na Meta API | Alto | Abstrair cliente da API; manter mocks atualizados |
| Rate limiting | Médio | Implementar retry e queue de requisições |
| Tokens expirando | Alto | Sistema de refresh automático de tokens |
| Dados de teste insuficientes | Médio | Criar seeders robustos desde Fase 1 |
| Complexidade de customização de criativos | Médio | Usar bibliotecas de imagem (Sharp, Canvas) |

---

## 🎯 Marcos Críticos (Milestones)

1. **M1 - Conexão Estável:** Fase 1 completa
2. **M2 - Dashboard Vivo:** Fase 2 completa com dados reais
3. **M3 - Primeiro Deploy:** Fase 3 completa com anúncio criado
4. **M4 - Produto Polido:** Fase 4 completa, pronto para produção

---

© Automações Comerciais Integradas! 2026 ⚙️  
contato@automacoescomerciais.com.br
