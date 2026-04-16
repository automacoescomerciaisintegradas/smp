# Rules: Testing

## Escopo
Estas regras se aplicam **somente** aos arquivos de teste (localizados em `tests/` ou similar).

## Regras Gerais

### 1. Cobertura de Testes
- **TODA** funcionalidade deve ser testada
- Código novo sem testes NÃO deve ser mergeado
- Busque cobertura mínima de 80% para lógica de negócio crítica

### 2. Estrutura de Arquivos
- Testes unitários: `*.spec.ts`
- Testes de integração: `*.int.spec.ts`
- Testes e2e: `*.e2e.spec.ts`
- Mantenha estrutura de testes espelhando a estrutura do `src/`

### 3. Naming Convention
- Nome do arquivo: mesmo nome do arquivo original + sufixo apropriado
- Exemplo: `CampaignService.ts` → `CampaignService.spec.ts`, `CampaignService.int.spec.ts`
- Nome do teste: descreva o cenário sendo testado
- Use formato: `should [expected behavior] when [condition]`

---

## Testes Unitários (`*.spec.ts`)

### 1. Propósito
- Testar uma unidade de código isolada
- Validar lógica de negócio, transformações de dados, cálculos
- Descobrir bugs em cenários controlados
- Documentar comportamento esperado de funções/métodos

### 2. Mocks
- **DEVE** fazer mock de dependências externas:
  - Banco de dados (Prisma, repositórios)
  - Chamadas HTTP (APIs externas)
  - File system
  - Serviços de terceiros
- **PODE** usar estruturas reais para:
  - Objetos de domínio (DTOs, entities)
  - Utilitários puros (funções de formatação, cálculo)
  - Constantes e configurações

### 3. Segmentação de Cenários
- **CADA TESTE** deve validar UM cenário por vez
- NÃO crie testes lineares que testam múltiplas coisas em sequência
- Segmentar para:
  - Descobrir bugs específicos
  - Validar comportamentos isolados
  - Definir documentação de como as coisas funcionam
  - Descobrir edge cases

### 4. Exemplo de Estrutura
```typescript
describe('CampaignService', () => {
  let service: CampaignService;
  let mockRepository: jest.Mocked<CampaignRepository>;
  let mockMetaClient: jest.Mocked<MetaAdsClient>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    } as any;
    
    mockMetaClient = {
      createCampaign: jest.fn(),
    } as any;
    
    service = new CampaignService(mockRepository, mockMetaClient);
  });

  describe('createCampaign', () => {
    it('should create campaign successfully when data is valid', async () => {
      // Arrange
      const dto = { name: 'Test Campaign', budget: 100 };
      mockRepository.create.mockResolvedValue({ id: 1, ...dto });
      
      // Act
      const result = await service.createCampaign(dto);
      
      // Assert
      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining(dto));
    });

    it('should throw BusinessRuleError when budget is below minimum', async () => {
      // Arrange
      const dto = { name: 'Test Campaign', budget: 5 };
      
      // Act & Assert
      await expect(service.createCampaign(dto))
        .rejects.toThrow(BusinessRuleError);
    });

    it('should rollback database when Meta API fails', async () => {
      // Arrange
      const dto = { name: 'Test Campaign', budget: 100 };
      mockRepository.create.mockResolvedValue({ id: 1, ...dto });
      mockMetaClient.createCampaign.mockRejectedValue(new Error('API Error'));
      
      // Act & Assert
      await expect(service.createCampaign(dto))
        .rejects.toThrow(ExternalApiError);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
```

---

## Testes de Integração (`*.int.spec.ts`)

### 1. Propósito
- Testar integração com dependências externas reais
- Validar que componentes funcionam juntos corretamente
- Testar queries, migrations, schemas de banco
- Validar contratos de API externa

### 2. Sufixo Obrigatório
- **TODOS** os testes de integração DEVEM ter sufixo `*.int.spec.ts`
- Exemplo: `CampaignService.int.spec.ts`, `CampaignRepository.int.spec.ts`

### 3. Banco de Dados
- Use banco de dados de teste isolado (Docker container recomendado)
- Configure seed data antes de cada teste
- Limpe dados após cada teste (truncate ou drop)
- Use transações com rollback automático quando possível

### 4. APIs Externas
- **PODE** usar mock server (WireMock, nock, MSW) para simular API externa
- **OU** use sandbox da API real quando disponível
- Nunca teste contra produção

### 5. Coexistência com Testes Unitários
- **É PERMITIDO** ter teste unitário E de integração do mesmo artefato
- Teste unitário: valida lógica isolada com mocks
- Teste de integração: valida integração real com DB/APIs

### 6. Exemplo de Estrutura
```typescript
describe('CampaignService [Integration]', () => {
  let service: CampaignService;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    service = new CampaignService(
      new CampaignRepository(prisma),
      new MetaAdsClient()
    );
  });

  beforeEach(async () => {
    // Seed data
    await prisma.campaign.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should persist campaign in database when created', async () => {
    // Arrange
    const dto = { name: 'Integration Test Campaign', budget: 100 };
    
    // Act
    const campaign = await service.createCampaign(dto);
    
    // Assert - verifica no banco real
    const saved = await prisma.campaign.findUnique({
      where: { id: campaign.id }
    });
    expect(saved).toBeDefined();
    expect(saved?.name).toBe(dto.name);
  });
});
```

---

## Testes e2e (`*.e2e.spec.ts`)

### 1. Propósito
- Testar o sistema de ponta a ponta
- Validar fluxos completos do usuário
- Testar APIs HTTP reais com toda a stack

### 2. Preparação de Dados
- **DEVE** preparar dados do banco antes de cada teste
- Use seeds ou factories para criar estado inicial conhecido
- Documente claramente qual estado é necessário

### 3. Chamadas HTTP
- Use supertest ou similar para fazer chamadas HTTP reais
- Teste todos os cenários: sucesso, erro, validação
- Valide status codes, headers e body da resposta

### 4. Validações Obrigatórias
- **Status Code**: Verifique se está correto (200, 201, 400, 404, etc.)
- **Response Body**: Valide estrutura e dados retornados
- **Error Messages**: Verifique mensagens de erro quando aplicável
- **Side Effects**: Valide que efeitos colaterais ocorreram (ex: dado persistido, email enviado)

### 5. Isolamento
- Cada teste e2e deve ser independente
- NÃO dependa de estado deixado por outro teste
- Limpe estado entre testes (reset DB ou use transações)

### 6. Exemplo de Estrutura
```typescript
describe('Campaign API [e2e]', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = module.createNestApplication();
    await app.init();
    prisma = module.get(PrismaClient);
  });

  beforeEach(async () => {
    // Prepare database state
    await prisma.campaign.deleteMany();
    await prisma.campaign.create({
      data: { id: 1, name: 'Existing Campaign', budget: 100 }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /campaigns', () => {
    it('should create campaign and return 201 with created data', async () => {
      // Arrange
      const payload = { name: 'New Campaign', budget: 200 };
      
      // Act
      const response = await request(app.getHttpServer())
        .post('/campaigns')
        .send(payload)
        .expect(201);
      
      // Assert
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        name: payload.name,
        budget: payload.budget
      });
      
      // Verify side effect
      const saved = await prisma.campaign.findUnique({
        where: { name: payload.name }
      });
      expect(saved).toBeDefined();
    });

    it('should return 400 when budget is invalid', async () => {
      // Arrange
      const payload = { name: 'Bad Campaign', budget: -50 };
      
      // Act
      const response = await request(app.getHttpServer())
        .post('/campaigns')
        .send(payload)
        .expect(400);
      
      // Assert
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 when campaign with same name already exists', async () => {
      // Arrange
      const payload = { name: 'Existing Campaign', budget: 100 };
      
      // Act
      const response = await request(app.getHttpServer())
        .post('/campaigns')
        .send(payload)
        .expect(409);
      
      // Assert
      expect(response.body.error).toContain('already exists');
    });
  });
});
```

---

## Princípios Gerais de Teste

### 1. Arrange-Act-Assert (AAA)
- **Arrange**: Prepare dados, mocks, estado
- **Act**: Execute a ação sendo testada
- **Assert**: Verifique resultados esperados

### 2. Testes como Documentação
- Testes devem documentar comportamento esperado
- Nome do teste deve ser legível e descritivo
- Comentários explicando cenários complexos

### 3. Edge Cases
- Teste limites: valores nulos, vazios, máximos, mínimos
- Teste cenários de erro: falha de rede, timeout, dados inválidos
- Teste estados incomuns mas possíveis

### 4. Manutenibilidade
- Use factories/builders para criar dados de teste complexos
- Extraia lógica repetitiva em helpers
- Mantenha testes independentes entre si

---
© Automações Comerciais Integradas! 2026 ⚙️
