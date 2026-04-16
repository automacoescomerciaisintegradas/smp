# CLAUDE.md - Regras Globais do Projeto

## Natureza do Projeto
Este projeto é uma **API REST** construída com Next.js/TypeScript. Toda funcionalidade deve seguir as melhores práticas de desenvolvimento de APIs.

## Regras Globais

### 1. TypeScript Strict Mode
- **SEMPRE** trabalhe com `strict: true` no `tsconfig.json`
- **NUNCA** use `any` - use `unknown` quando o tipo é realmente desconhecido
- Defina tipos/interfaces para todos os dados
- Use generics quando apropriado para reutilização de código
- Habilite todas as strict flags: `strictNullChecks`, `strictFunctionTypes`, `noImplicitAny`, etc.

### 2. Boas Práticas REST
- **TODOS** os endpoints devem seguir princípios RESTful
- Use substantivos para recursos (ex: `/campaigns`, não `/createCampaign`)
- Use métodos HTTP corretamente:
  - `GET`: Consultar recursos
  - `POST`: Criar recursos
  - `PUT/PATCH`: Atualizar recursos
  - `DELETE`: Remover recursos
- Retorne status codes apropriados (veja `.claude/rules/controllers.md`)
- Use versionamento de API quando necessário (ex: `/api/v1/campaigns`)
- Mantenha respostas consistentes em formato e estrutura

### 3. Testes Obrigatórios
- **TODA** funcionalidade deve ter testes antes de ser considerada completa
- Use pirâmide de testes:
  - Muitos testes unitários (rápidos, isolados)
  - Testes de integração moderados (validam integrações)
  - Alguns testes e2e (validam fluxos completos)
- Testes devem ser:
  - **Independentes**: Não dependem de estado de outros testes
  - **Repetíveis**: Mesmo resultado em qualquer ambiente
  - **Legíveis**: Qualquer dev deve entender o que está sendo testado
- Siga regras detalhadas em `.claude/rules/testing.md`

### 4. Estrutura de Rules
Este projeto usa rules específicas por camada:
- **Controllers**: `.claude/rules/controllers.md`
- **Services**: `.claude/rules/services.md`
- **Testing**: `.claude/rules/testing.md`
- **Design System**: `.claude/rules/design-system.md`

Consulte a rule apropriada antes de escrever código em cada camada.

### 5. Qualidade de Código
- Siga princípios SOLID
- Use injeção de dependência para desacoplamento
- Prefira composição sobre herança
- Documente código complexo com comentários explicando o "porquê"
- Revise código antes de commitar

### 6. Segurança
- **NUNCA** commite secrets, tokens ou senhas
- Use variáveis de ambiente para configurações sensíveis
- Valide e sanitize todos os inputs do usuário
- Implemente rate limiting quando aplicável
- Log informações sensíveis com cuidado

---
© Automações Comerciais Integradas! 2026 ⚙️
contato@automacoescomerciais.com.br
