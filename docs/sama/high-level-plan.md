# Plano de Alto Nível: SAMA

## 1. Roadmap de Execução

### Fase 1: Diagnóstico e Calibração (Semana 1) - **STATUS: EM INÍCIO**
- **Meta**: Conexão 100% estável e autorizada.
- **Entregáveis**:
    - `scripts/check-meta-env.py`
    - `logs/meta-requests.log`
    - Correção do erro "Unsupported post request".

### Fase 2: Brain (Insight) (Semana 1-2)
- **Meta**: Motor de análise de dados históricos operacional.
- **Entregáveis**:
    - `src/services/meta/InsightService.ts`
    - `src/components/dashboard/PerformanceChart.tsx`
    - Algoritmo de Ranker (Score de Criativos).

### Fase 3: Execution (Creator) (Semana 2-3)
- **Meta**: Automação total de criação de anúncios.
- **Entregáveis**:
    - `src/services/meta/AssetService.ts`
    - `src/services/meta/DeployService.ts`
    - Hook de Terminal `/meta-ads-deploy`.

### Fase 4: UX Premium (Semana 3+)
- **Meta**: Interface de usuário cinematográfica e aprovação por terminal.
- **Entregáveis**:
    - UI de confirmação de Deploy.
    - Documentação da Skill (README.md).

## 2. Dependências e Ordem de Trabalho
1. **Infra**: Configuração de Variáveis de Ambiente (.env).
2. **API**: Validação de Escopo de Token (ads_management, ads_read, business_management).
3. **Backend**: Integração do InsightService com o Dashboard.
4. **Deploy**: Testes em modo Sandbox/Draft antes do Live.

## 3. Critérios de Saída (Fase 1)
- [ ] Execução do `check-meta-env.py` sem erros.
- [ ] Token de acesso com validade de longo prazo verificado.
- [ ] Act Account ID configurada e acessível via Graph API.
