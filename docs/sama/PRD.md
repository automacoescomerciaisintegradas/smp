# PRD: Sistema de Automação Meta Ads (SAMA)

## 1. Visão Geral
O **SAMA** é um sistema de automação "Done-For-You" projetado para gerenciar, analisar e escalar campanhas de Meta Ads com intervenção humana mínima. O objetivo é transformar criativos brutos em campanhas de alta performance e fornecer insights profundos baseados em dados históricos.

## 2. Objetivos de Negócio
- **Eficiência Operacional**: Reduzir o tempo de criação de campanhas de horas para segundos.
- **Otimização de ROI**: Usar o "Cérebro Analítico" para identificar ganhadores (Wins) e perdedores (Losses) e ajustar o orçamento automaticamente.
- **Escalabilidade**: Permitir o deploy massivo de anúncios em múltiplos formatos e públicos.

## 3. Público-Alvo
- Gestores de tráfego de alta escala.
- Agências D2C e Infoprodutores que utilizam a Cleudocode Command Center.

## 4. Requisitos Funcionais

### Fase 1: Calibração e Diagnóstico
- **Validação de Ambiente**: Script para testar tokens, permissões de Act Account e endpoints da Graph API.
- **Logging Robusto**: Sistema de logs centralizado para debugar falhas de requisição à Meta.

### Fase 2: Insight (Cérebro Analítico)
- **Consulta de Insights**: Recuperação de dados de performance desde 2026.
- **Classificação de Performance**: Algoritmos que categorizam anúncios baseados em métricas-chave (CTR, CPA, ROAS).
- **Relatórios Premium**: Visualizações cinematográficas usando Chart.js integradas ao Command Center.

### Fase 3: Creator (Braço Executor)
- **Deploy de Ativos**: Módulo para upload e organização de imagens/vídeos.
- **Asset Customization**: Adaptação automática de criativos para diferentes posicionamentos (Feed, Stories, Reels).
- **Deploy Automático**: Comando `/meta-ads-deploy` para criar hierarquia completa (Campaign -> AdSet -> Ads).

### Fase 4: UX & Refinamento
- **Feedback Visual**: Mensagens de progresso e status "Cinematográficas".
- **Sistema de Aprovação**: Workflow de "Aprovar/Rejeitar" antes do deploy real.
- **Documentação**: Manual completo da Skill.

## 5. Requisitos Não-Funcionais
- **Segurança**: Armazenamento seguro de Tokens de Acesso.
- **Performance**: Requisições assíncronas para evitar gargalos na API da Meta.
- **Design System**: Interface 100% aderente ao **ACI Design System**.

## 6. Riscos e Dependências
- **Dependência**: Meta Graph API (estabilidade e limites de taxa).
- **Risco**: Mudanças súbitas na política da API da Meta.
- **Dependência**: Pasta `anuncios/` com nomenclatura padronizada.
