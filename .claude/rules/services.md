# Rules: Services

## Escopo
Estas regras se aplicam **somente** aos arquivos de services (localizados em `src/services/` ou similar).

## Regras

### 1. Responsabilidade Única
- Services contêm a **lógica de negócio** da aplicação
- Coordenam operações entre repositórios, APIs externas e outros services
- **NUNCA** manipule request/response HTTP no service
- **NUNCA** contenha lógica de apresentação ou formatação de resposta HTTP

### 2. Estrutura Padronizada
- Um service por domínio/entidade (ex: `CampaignService`, `InsightService`, `DeployService`)
- Methods públicos que representam casos de uso
- Methods privados para lógica interna e helpers
- Use interfaces para definir contratos de input/output

### 3. Acesso a Dados
- Acesse banco de dados **somente** através de repositories/prisma
- **NUNCA** use queries SQL diretas no service (use Prisma ou similar)
- Repositories devem ser injetados via constructor injection
- Transações devem ser gerenciadas no service quando necessário

### 4. APIs Externas
- Chame APIs externas (Meta Ads, etc.) através de clientes abstratos
- Implemente retry logic com exponential backoff para chamadas externas
- Log todas as chamadas externas para debugging
- Trate rate limits e erros de rede gracefulmente

### 5. Tratamento de Erros
- Use erros customizados para cenários de negócio:
  - `NotFoundError`: Recurso não encontrado
  - `ValidationError`: Dados inválidos
  - `BusinessRuleError`: Violação de regra de negócio
  - `ExternalApiError`: Falha em API externa
- Propague erros para o controller lidar com a resposta HTTP
- **NUNCA** retorne resposta HTTP diretamente

### 6. Transações
- Use transações quando múltiplas operações de DB precisam ser atômicas
- Defina limites claros de transação (evite transações longas)
- Considere isolate level apropriado para cada caso

### 7. Cache
- Implemente cache para dados frequentemente acessados e pouco alterados
- Defina TTL apropriado para cada tipo de dado
- Invalidação de cache deve ser explícita e estratégica
- Documente quando e por que o cache é usado

### 8. Validações de Negócio
- Valide regras de negócio complexas no service
- Verifique permissões e autorizações quando aplicável
- Valide estados e transições de estado (ex: campanha não pode ser pausada se já está pausada)

### 9. Injeção de Dependência
- Receba repositórios e outros services via constructor injection
- Facilita testabilidade e desacoplamento
- Use interfaces quando possível para maior flexibilidade

### 10. Exemplo de Estrutura
```typescript
class CampaignService {
  constructor(
    private campaignRepository: CampaignRepository,
    private metaAdsClient: MetaAdsClient,
    private logger: Logger
  ) {}

  async createCampaign(dto: CreateCampaignDto): Promise<Campaign> {
    // Validações de negócio
    await this.validateBudget(dto.budget);
    
    // Operação atômica
    const campaign = await this.campaignRepository.create({
      ...dto,
      status: 'DRAFT'
    });

    // Chamada externa com retry
    try {
      const metaCampaign = await this.metaAdsClient.createCampaign({
        name: campaign.name,
        objective: campaign.objective
      });
      
      await this.campaignRepository.updateMetaId(campaign.id, metaCampaign.id);
    } catch (error) {
      this.logger.error('Failed to create campaign on Meta Ads', error);
      // Rollback ou compensação
      await this.campaignRepository.delete(campaign.id);
      throw new ExternalApiError('Failed to sync with Meta Ads');
    }

    return campaign;
  }

  private async validateBudget(budget: number): Promise<void> {
    if (budget < 10) {
      throw new BusinessRuleError('Minimum budget is $10');
    }
  }
}
```

---
© Automações Comerciais Integradas! 2026 ⚙️
