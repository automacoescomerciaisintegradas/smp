# Checklist Detalhado: Fase 1 (Calibração de Conexão)

## Objetivos
Garantir que o ambiente de desenvolvimento está pronto para conversar com a Meta Graph API sem erros de permissão ou endpoints incorretos.

## Checklist de Tarefas

### 🛠️ Infraestrutura e Ambiente
- [ ] Criar arquivo `.env` (se não existir) com as chaves:
    - `META_ACCESS_TOKEN`
    - `META_AD_ACCOUNT_ID`
    - `META_APP_ID`
    - `META_APP_SECRET`
- [ ] Validar se as bibliotecas `requests` e `python-dotenv` estão instaladas.

### 🔍 Scripts de Diagnóstico
- [ ] **Implementar `scripts/check-meta-env.py`**:
    - Testar GET `/me` para verificar o usuário do token.
    - Testar GET `act_{AD_ACCOUNT_ID}` para verificar acesso à conta.
    - Listar permissões vinculadas ao token (`/debug_token`).
- [ ] **Logger de Requisições**:
    - Criar wrapper para o `requests` que salve Inputs e Outputs em `logs/meta_api.log`.

### 🐛 Debugging
- [ ] Investigar o erro "Unsupported post request":
    - Causa provável 1: Endpoint POST sendo usado em um recurso que só aceita GET.
    - Causa provável 2: Falta de permissão `ads_management`.
    - Causa provável 3: Formatando o ID da conta sem o prefixo `act_`.

## Próximos Passos (Ação Imediata)
1. Rodar script de verificação.
2. Analisar o log de erro retornado pela Meta Ads Graph API.
