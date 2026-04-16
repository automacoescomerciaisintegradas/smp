# Rules: Controllers

## Escopo
Estas regras se aplicam **somente** aos arquivos de controllers (localizados em `src/controllers/` ou similar).

## Regras

### 1. Responsabilidade Única
- Controllers devem ser **finos** e **enxutos**
- Responsabilidade exclusiva: receber requisições, validar inputs básicos, delegar para services e retornar respostas HTTP
- **NUNCA** contenha lógica de negócio no controller
- **NUNCA** acesse banco de dados ou serviços externos diretamente

### 2. Estrutura Padronizada
- Um controller por recurso/entidade (ex: `CampaignController`, `AdSetController`)
- Nome dos métodos seguindo padrão REST: `create`, `findOne`, `findAll`, `update`, `delete`
- Cada método deve:
  1. Extrair dados da requisição (body, params, query)
  2. Validar schema de entrada (usando Zod, Yup, etc.)
  3. Chamar o service apropriado
  4. Retornar resposta HTTP com status code correto

### 3. Status Codes HTTP
- `200 OK`: GET/PATCH/PUT bem-sucedidos
- `201 Created`: POST que criou recurso
- `204 No Content`: DELETE bem-sucedido
- `400 Bad Request`: Dados inválidos
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno inesperado

### 4. Tratamento de Erros
- Use try/catch em todos os métodos
- Capture erros conhecidos (ex: `NotFoundError`, `ValidationError`) e retorne status apropriado
- Log erros inesperados e retorne `500` genérico ao cliente
- **NUNCA** exponha stack traces ou detalhes internos ao cliente

### 5. Validação de Input
- Sempre valide dados de entrada antes de passar ao service
- Use bibliotecas de schema validation (Zod recomendado)
- Retorne `400` com mensagem clara de erro de validação

### 6. Injeção de Dependência
- Receba services via constructor injection ou factory function
- **NUNCA** instancie services diretamente dentro do controller
- Facilita mocking em testes

### 7. Documentação
- Comente cada método com JSDoc descrevendo:
  - Descrição do endpoint
  - Parâmetros esperados
  - Respostas possíveis (status codes)
  - Exemplo de request/response (opcional mas recomendado)

### 8. Exemplo de Estrutura
```typescript
class CampaignController {
  constructor(private campaignService: CampaignService) {}

  async create(req: Request, res: Response) {
    try {
      const schema = z.object({
        name: z.string().min(1),
        budget: z.number().positive(),
      });
      
      const data = schema.parse(req.body);
      const campaign = await this.campaignService.create(data);
      
      return res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      // Log error
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

---
© Automações Comerciais Integradas! 2026 ⚙️
