# Plano de Implementação: Migração localStorage → MongoDB

**Projeto:** Pilates Studio Manager  
**Data:** 2026-06-08  
**Autor:** Plano técnico sênior  
**Stack:** Next.js 16 (App Router) + React 19 + MongoDB 8 + Mongoose + TanStack Query v5

---

## 1. Diagnóstico do Estado Atual

### Problema central
Toda a persistência de dados está em `localStorage` via hook `useLocalStorage`, com dados iniciais
definidos em constantes em `src/constants/index.js`. O MongoDB está provisionado no Docker mas
sem nenhum schema, model, seed ou API Route implementado.

### Mapeamento de dados

| Chave localStorage       | Collection MongoDB | Dados iniciais (constante)   |
|--------------------------|--------------------|------------------------------|
| `pilates_alunos`         | `alunos`           | `ALUNOS_INIT` (4 docs)       |
| `pilates_agendamentos`   | `agendamentos`     | `AGENDAMENTOS_INIT` (6 docs) |
| `pilates_instrutores`    | `instrutores`      | `INSTRUTORES_INIT` (4 docs)  |
| `pilates_modalidades`    | `modalidades`      | `MODALIDADES_INIT` (4 docs)  |
| *(implícito na app)*     | `configuracoes`    | `HORARIO_ESTUDIO_INIT`       |
| *(implícito na app)*     | `planos`           | `PLANOS` (9 docs)            |

### Constantes que **permanecem** como código (UI config, nunca mudam em runtime)
`DIAS_SEMANA`, `PERIODICIDADES`, `FORMAS_PAGAMENTO`, `ICONES_FORMA`,
`DIAS_VENCIMENTO`, `TIPOS_AULA_PADRAO`, `PRESET_CORES`, `DURACOES_AULA`

---

## 2. Decisões de Arquitetura

### 2.1 Backend: API Routes no App Router
Não há servidor Express separado. As rotas de API ficam em `app/api/` aproveitando
o runtime do Next.js. Mongoose conecta via singleton cacheado no módulo global do Node.

### 2.2 Client-side state: TanStack Query v5 (React Query)
Substitui o `useLocalStorage` + Context pesado. Vantagens:
- Cache automático com invalidação granular por query key
- Loading/error states sem boilerplate
- Otimistic updates nativos para UX sem latência percebida
- `staleTime` configurável por entidade

O `AppContext` fica **apenas** para estado de UI (toast, sheet modal) — sem mais dados de negócio.

### 2.3 Migrations vs Seeders
MongoDB é schema-less, então não há DDL como SQL. Usaremos:
- **`migrate-mongo`**: rastreia migrações aplicadas em uma collection `changelog`.
  Cada migração é uma função `up/down` que opera no banco (criar índices, renomear campos,
  backfills de dados, etc.).
- **Scripts de seed**: dados iniciais de desenvolvimento/demo, executados separadamente.
  Nunca rodam em produção sem flag explícito.

### 2.4 IDs: timestamp Number → ObjectId
Os IDs atuais são `Date.now()` (Number). No MongoDB usaremos `ObjectId` nativos.
O frontend referenciará IDs como strings hexadecimais.

### 2.5 Embedded vs Referenced
| Relação                              | Estratégia   | Motivo                                         |
|--------------------------------------|--------------|------------------------------------------------|
| `aluno.mensalidades[]`               | Embedded     | Sempre lidas junto ao aluno, no máximo ~60/ano |
| `aluno.frequencias[]`                | Embedded     | Lidas junto ao aluno, ~200-300/ano             |
| `aluno.formasPagamento[]`            | Embedded     | Array simples de strings                       |
| `aluno.horariosPorDia{}`             | Embedded     | Objeto pequeno, lido junto ao aluno            |
| `agendamento.alunoId`                | Reference    | Agendamentos crescem independentemente         |
| `instrutor.modalidades[]`            | Reference    | Muitos-para-muitos com modalidades             |

---

## 3. Estrutura de Arquivos Alvo

```
c:\Projetos\Pilates\
│
├── app/
│   └── api/                                    ← NOVO: API Routes
│       ├── alunos/
│       │   ├── route.js                        GET (lista) + POST (criar)
│       │   └── [id]/
│       │       ├── route.js                    GET + PUT + DELETE
│       │       ├── mensalidades/
│       │       │   └── [mes]/
│       │       │       └── route.js            PATCH (marcar pago/desmarcar)
│       │       └── frequencias/
│       │           └── route.js                POST (registrar presença/falta)
│       ├── agendamentos/
│       │   ├── route.js                        GET (filtros: data, alunoId) + POST
│       │   └── [id]/
│       │       └── route.js                    GET + PUT + DELETE
│       ├── instrutores/
│       │   ├── route.js                        GET + POST
│       │   └── [id]/
│       │       └── route.js                    GET + PUT + DELETE
│       ├── modalidades/
│       │   ├── route.js                        GET + POST
│       │   └── [id]/
│       │       └── route.js                    GET + PUT + DELETE
│       ├── planos/
│       │   └── route.js                        GET (readonly no frontend)
│       └── configuracoes/
│           └── route.js                        GET + PUT (singleton)
│
├── src/
│   ├── lib/                                    ← NOVO: camada de infraestrutura
│   │   ├── mongodb.js                          singleton de conexão Mongoose
│   │   └── models/
│   │       ├── Aluno.js                        Mongoose Schema + Model
│   │       ├── Agendamento.js
│   │       ├── Instrutor.js
│   │       ├── Modalidade.js
│   │       ├── Plano.js
│   │       └── Configuracao.js
│   │
│   ├── hooks/                                  ← MODIFICAR: substituir useLocalStorage
│   │   ├── useAlunos.js                        React Query hooks por entidade
│   │   ├── useAgendamentos.js
│   │   ├── useInstrutores.js
│   │   ├── useModalidades.js
│   │   ├── usePlanos.js
│   │   └── useToast.js                         (sem mudança)
│   │
│   ├── context/
│   │   └── AppContext.jsx                      ← SIMPLIFICAR: só UI state (toast, sheet)
│   │
│   └── constants/
│       └── index.js                            ← LIMPAR: remover _INIT, manter UI constants
│
├── migrations/                                 ← NOVO: migrate-mongo
│   ├── .migrate-mongo-config.js
│   ├── 20260608-001-create-indexes.js
│   ├── 20260608-002-seed-planos.js             (planos são dados de config, não demo)
│   └── 20260608-003-seed-configuracoes.js      (horário do estúdio)
│
├── scripts/
│   └── seed/                                   ← NOVO: seeders de desenvolvimento
│       ├── index.js                            entry point + orquestrador
│       ├── alunos.js
│       ├── agendamentos.js
│       ├── instrutores.js
│       └── modalidades.js
│
└── package.json                                ← adicionar deps + scripts npm
```

---

## 4. Fases de Implementação

---

### FASE 1 — Infraestrutura (Dia 1–2)

**Objetivo:** Base técnica funcionando antes de qualquer feature.

#### 1.1 Instalar dependências
```bash
npm install mongoose @tanstack/react-query migrate-mongo
npm install --save-dev @tanstack/react-query-devtools
```

#### 1.2 Singleton de conexão MongoDB (`src/lib/mongodb.js`)
Padrão recomendado pela Vercel/Next.js para evitar múltiplas conexões em dev
(hot-reload cria novos módulos):
```js
// Usa global._mongooseConn para cache entre hot-reloads
let cached = global._mongooseConn;
if (!cached) cached = global._mongooseConn = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise)
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then(m => m);
  cached.conn = await cached.promise;
  return cached.conn;
}
```

#### 1.3 Provider React Query (`app/layout.jsx`)
Envolver a aplicação com `QueryClientProvider`. Configuração global:
- `staleTime: 30_000` (30s) — dados não re-fetched desnecessariamente
- `gcTime: 300_000` (5min) — cache mantido em memória
- `retry: 1` — uma retry em erros de rede

#### 1.4 Configurar `migrate-mongo`
```js
// .migrate-mongo-config.js
module.exports = {
  mongodb: { url: process.env.MONGODB_URI, databaseName: "pilates" },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
};
```

#### 1.5 Scripts npm adicionais
```json
"scripts": {
  "migrate:up": "migrate-mongo up",
  "migrate:down": "migrate-mongo down",
  "migrate:status": "migrate-mongo status",
  "seed": "node scripts/seed/index.js",
  "seed:reset": "node scripts/seed/index.js --reset"
}
```

**Entregável:** `npm run migrate:status` retorna lista de migrações pending.

---

### FASE 2 — Models Mongoose (Dia 2–3)

**Objetivo:** Schemas tipados e validados, refletindo exatamente a estrutura atual do localStorage.

#### 2.1 `Modalidade` (sem dependências)
```js
const modalidadeSchema = new Schema({
  nome:       { type: String, required: true, trim: true },
  descricao:  { type: String, default: "" },
  duracao:    { type: Number, required: true, enum: [30, 45, 60, 75, 90] },
  cor:        { type: String, required: true, match: /^#[0-9a-f]{6}$/i },
  capacidade: { type: Number, required: true, min: 1 },
}, { timestamps: true });
```

#### 2.2 `Instrutor` (referencia Modalidade)
```js
const instrutorSchema = new Schema({
  nome:        { type: String, required: true, trim: true },
  email:       { type: String, lowercase: true, trim: true },
  telefone:    { type: String },
  status:      { type: String, enum: ["ativo", "inativo"], default: "ativo" },
  foto:        { type: String, default: null },     // Base64 ou URL
  modalidades: [{ type: Schema.Types.ObjectId, ref: "Modalidade" }],
}, { timestamps: true });
```

#### 2.3 `Plano` (tabela de preços)
```js
const planoSchema = new Schema({
  id:            { type: String, required: true, unique: true }, // "3x_mensal"
  label:         { type: String, required: true },
  frequencia:    { type: Number, required: true },               // aulas/semana
  periodicidade: { type: String, required: true },
  meses:         { type: Number, required: true },
  valor:         { type: Number, required: true },
  ativo:         { type: Boolean, default: true },
}, { timestamps: true });
```

#### 2.4 `Aluno` (com subdocumentos)
```js
const mensalidadeSchema = new Schema({
  mes:       { type: String, required: true },   // "YYYY-MM"
  vencimento:{ type: String, required: true },   // "YYYY-MM-DD"
  valor:     { type: Number, required: true },
  pago:      { type: Boolean, default: false },
  dataPag:   { type: String, default: null },
  formaPag:  { type: String, default: null },
}, { _id: false });

const frequenciaSchema = new Schema({
  data:     { type: String, required: true },    // "YYYY-MM-DD"
  presente: { type: Boolean, required: true },
}, { _id: false });

const alunoSchema = new Schema({
  nome:            { type: String, required: true, trim: true },
  telefone:        { type: String },
  email:           { type: String, lowercase: true, trim: true },
  cpf:             { type: String },
  planoId:         { type: String },
  periodicidade:   { type: String },
  frequencia:      { type: String },             // "1","2","3","livre"
  valorPlano:      { type: Number },
  diaVencimento:   { type: String },
  dataInicio:      { type: String },
  dataTermino:     { type: String },
  diasSemana:      [{ type: Number }],
  horario:         { type: String },
  ativo:           { type: Boolean, default: true },
  mensalidades:    [mensalidadeSchema],
  frequencias:     [frequenciaSchema],
  formasPagamento: [{ type: String }],
  horariosPorDia:  { type: Map, of: String },
}, { timestamps: true });

// Índices de consulta frequente
alunoSchema.index({ ativo: 1, nome: 1 });
alunoSchema.index({ "mensalidades.mes": 1, "mensalidades.pago": 1 });
```

#### 2.5 `Agendamento` (referencia Aluno)
```js
const agendamentoSchema = new Schema({
  alunoId:    { type: Schema.Types.ObjectId, ref: "Aluno", required: true },
  alunoNome:  { type: String, required: true },  // desnormalizado para queries de agenda
  data:       { type: String, required: true, index: true }, // "YYYY-MM-DD"
  horaInicio: { type: String, required: true },
  horaFim:    { type: String, required: true },
  instrutor:  { type: String },
  tipo:       { type: String },
  status:     { type: String, enum: ["confirmado","pendente","cancelado"], default: "confirmado" },
  obs:        { type: String, default: "" },
}, { timestamps: true });

agendamentoSchema.index({ data: 1, horaInicio: 1 });
agendamentoSchema.index({ alunoId: 1, data: 1 });
```

#### 2.6 `Configuracao` (singleton — horário do estúdio)
```js
const horarioDiaSchema = new Schema({
  diaSemana: { type: Number, required: true }, // 0-6
  abertura:  { type: String },                 // "07:00"
  fechamento:{ type: String },                 // "21:00"
  fechado:   { type: Boolean, default: false },
}, { _id: false });

const configuracaoSchema = new Schema({
  _id:     { type: String, default: "estudio" }, // sempre o mesmo doc
  horario: [horarioDiaSchema],
}, { timestamps: true });
```

**Entregável:** `mongoose.model()` exportado de cada arquivo, sem erros de importação.

---

### FASE 3 — Migrations e Seeders (Dia 3–4)

#### 3.1 Migration: Índices e dados de configuração obrigatórios

**`migrations/20260608-001-create-indexes.js`**
```js
// up: cria índices nas 4 collections principais
// down: dropa os índices
```

**`migrations/20260608-002-seed-planos.js`**
```js
// up: insere os 9 planos do PLANOS constant (dados de negócio, não demo)
// down: remove planos com origem "seed_migration"
```

**`migrations/20260608-003-seed-configuracoes.js`**
```js
// up: insere horário padrão do estúdio (HORARIO_ESTUDIO_INIT)
// down: remove o documento singleton de configurações
```

> **Regra:** Migrations de dados (`up`) devem ser idempotentes — usar `updateOne({ ... }, { $setOnInsert: ... }, { upsert: true })`.

#### 3.2 Seeders de desenvolvimento

**`scripts/seed/index.js`** — orquestrador
```js
// 1. Conecta ao MongoDB
// 2. Se --reset: apaga collections de seed (NÃO toca em planos/configuracoes)
// 3. Roda seeders na ordem: modalidades → instrutores → alunos → agendamentos
// 4. Exibe resumo: X docs inseridos por collection
// 5. Desconecta
```

**Seeders individuais** (`modalidades.js`, `instrutores.js`, `alunos.js`, `agendamentos.js`):
- Recebem os dados dos antigos `*_INIT` constants
- Usam `insertMany` com os dados adaptados (removendo campos de ID numérico)
- Retornam os IDs criados para encadeamento (ex: agendamentos precisa dos `_id` dos alunos)

**Entregável:** `npm run seed` popula o banco; `npm run seed:reset` repopula do zero.

---

### FASE 4 — API Routes (Backend) (Dia 4–6)

Cada rota segue o padrão:
1. `connectDB()` no início de cada handler
2. `try/catch` com respostas padronizadas `{ data, error, message }`
3. Validação mínima com Mongoose (erros de validação → 422)
4. Não expõe stack trace em produção

#### 4.1 Alunos

| Método | Rota                                    | Ação                                     |
|--------|-----------------------------------------|------------------------------------------|
| GET    | `/api/alunos`                           | Lista com filtros: `?ativo=true&q=nome`  |
| POST   | `/api/alunos`                           | Cria aluno + gera mensalidades futuras   |
| GET    | `/api/alunos/[id]`                      | Detalhe completo                         |
| PUT    | `/api/alunos/[id]`                      | Atualiza dados cadastrais                |
| DELETE | `/api/alunos/[id]`                      | Soft delete (`ativo: false`)             |
| PATCH  | `/api/alunos/[id]/mensalidades/[mes]`   | Marca/desmarca mensalidade como paga     |
| POST   | `/api/alunos/[id]/frequencias`          | Registra presença/falta do dia           |

**Lógica de negócio em POST /api/alunos:**
A geração automática de mensalidades (hoje feita em `salvarAluno()` no Context) migra para
um helper server-side `generateMensalidades(aluno)` — sem duplicação no frontend.

#### 4.2 Agendamentos

| Método | Rota                    | Ação                                          |
|--------|-------------------------|-----------------------------------------------|
| GET    | `/api/agendamentos`     | Filtros: `?data=2026-06-08&alunoId=xxx`       |
| POST   | `/api/agendamentos`     | Cria agendamento (valida conflito de horário) |
| GET    | `/api/agendamentos/[id]`| Detalhe                                       |
| PUT    | `/api/agendamentos/[id]`| Atualiza status/dados                         |
| DELETE | `/api/agendamentos/[id]`| Remove                                        |

#### 4.3 Instrutores, Modalidades

CRUD padrão: GET (lista), POST (criar), GET/PUT/DELETE por ID.

#### 4.4 Planos

Apenas GET (listagem). Modificações de planos via migration, não pela UI.

#### 4.5 Configurações

GET retorna o documento singleton. PUT faz `findByIdAndUpdate("estudio", ...)`.

**Entregável:** Todos os endpoints respondendo corretamente via `curl` / Postman.

---

### FASE 5 — Frontend: Substituir localStorage por React Query (Dia 6–9)

Esta é a fase mais extensa. O objetivo é substituir o `useLocalStorage` entidade por entidade,
sem quebrar a UI.

#### 5.1 Hooks React Query por entidade

**`src/hooks/useAlunos.js`**
```js
// useAlunos(filters) → { data, isLoading, error }
// useAluno(id) → aluno individual
// useCreateAluno() → mutation
// useUpdateAluno() → mutation  
// useDeleteAluno() → mutation
// useMarcarPago(alunoId) → mutation
// useRegistrarFreq(alunoId) → mutation
```

Mesma estrutura para `useAgendamentos`, `useInstrutores`, `useModalidades`.

#### 5.2 Query Keys centralizadas (`src/lib/queryKeys.js`)
```js
export const queryKeys = {
  alunos:        (filters) => ["alunos", filters],
  aluno:         (id)      => ["alunos", id],
  agendamentos:  (filters) => ["agendamentos", filters],
  instrutores:   ()        => ["instrutores"],
  modalidades:   ()        => ["modalidades"],
  planos:        ()        => ["planos"],
  configuracoes: ()        => ["configuracoes"],
};
```

#### 5.3 Optimistic Updates (UX sem latência)

Para `marcarPago` e `registrarFreq` (ações frequentes e rápidas):
```js
onMutate: async (variables) => {
  await queryClient.cancelQueries({ queryKey: queryKeys.aluno(alunoId) });
  const snapshot = queryClient.getQueryData(queryKeys.aluno(alunoId));
  queryClient.setQueryData(queryKeys.aluno(alunoId), (old) => /* atualiza localmente */);
  return { snapshot };
},
onError: (err, variables, context) => {
  queryClient.setQueryData(queryKeys.aluno(alunoId), context.snapshot); // rollback
},
onSettled: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.aluno(alunoId) });
},
```

#### 5.4 Migração por view

| View                   | Impacto   | O que muda                                               |
|------------------------|-----------|----------------------------------------------------------|
| `Home.jsx`             | Médio     | Stats vindos de `/api/alunos` + `/api/agendamentos`      |
| `Alunos.jsx`           | Baixo     | `useAlunos()` substitui `alunos` do context             |
| `AgendaDiaria.jsx`     | Alto      | `useAgendamentos(data)` + mutações                       |
| `CadastroAluno.jsx`    | Médio     | `useCreateAluno()` / `useUpdateAluno()` mutation         |
| `DetalheAluno.jsx`     | Alto      | `useAluno(id)` + `useMarcarPago()` + `useRegistrarFreq()`|
| `Financas.jsx`         | Médio     | `useAlunos()` com projeção de mensalidades               |
| `Frequencia.jsx`       | Médio     | `useAgendamentos(data)` + `useRegistrarFreq()`           |
| `Configuracoes.jsx`    | Alto      | CRUD completo para instrutores + modalidades + config    |

#### 5.5 Simplificar AppContext
Após migração completa, o `AppContext` conterá **apenas**:
```js
// Estado de UI puro — sem dados de negócio
const [toast, showToast] = useToast();
const [sheet, setSheet] = useState(null);

// Helpers para abrir sheet de pagamento
const openPago = (alunoId, mes) => setSheet({ type: "pago", alunoId, mes });
```

#### 5.6 Remover hook useLocalStorage
Após todas as views migradas, deletar `src/hooks/useLocalStorage.js`.

#### 5.7 Limpar constantes
Em `src/constants/index.js`, remover:
- `ALUNOS_INIT`, `AGENDAMENTOS_INIT`, `INSTRUTORES_INIT`, `MODALIDADES_INIT`
- `HORARIO_ESTUDIO_INIT`, `PLANOS` (agora no banco)

Manter: `DIAS_SEMANA`, `PERIODICIDADES`, `FORMAS_PAGAMENTO`, `ICONES_FORMA`,
`DIAS_VENCIMENTO`, `TIPOS_AULA_PADRAO`, `PRESET_CORES`, `DURACOES_AULA`

**Entregável:** App funcionando sem nenhuma referência a `localStorage` ou `useLocalStorage`.

---

### FASE 6 — Server Components (Opcional / Performance) (Dia 9–10)

Páginas de listagem que não precisam de interatividade no carregamento inicial
podem ser convertidas para Server Components, eliminando o round-trip de API:

```
app/alunos/page.jsx         → async Server Component (fetch inicial server-side)
app/configuracoes/page.jsx  → async Server Component
app/financas/page.jsx       → async Server Component (mês atual)
```

Páginas com muita interatividade permanecem Client Components com React Query.

> Esta fase é **incremental** — não bloqueia o lançamento. Implementar se houver tempo.

---

### FASE 7 — Hardening e Cleanup (Dia 10–11)

#### 7.1 Error handling consistente
Middleware ou helper `withDB(handler)` que centraliza `connectDB()`, `try/catch`
e formatação de resposta de erro:
```js
export function withDB(handler) {
  return async (req, ctx) => {
    try {
      await connectDB();
      return await handler(req, ctx);
    } catch (e) {
      if (e.name === "ValidationError") return Response.json({ error: e.message }, { status: 422 });
      console.error(e);
      return Response.json({ error: "Internal error" }, { status: 500 });
    }
  };
}
```

#### 7.2 Variáveis de ambiente
Garantir que `MONGODB_URI` está no `.env.example` e documentado.

#### 7.3 Atualizar Docker
Verificar que o `Dockerfile` e `docker-compose.yml` não precisam de ajustes
para as novas dependências (`mongoose`, `@tanstack/react-query`).

#### 7.4 Testes de smoke
- `npm run seed:reset` → banco populado
- `npm run migrate:status` → todas migrations aplicadas
- Todas as rotas CRUD funcionando (Postman collection ou `curl` scripts)
- UI sem erros de console relacionados a dados

---

## 5. Dependências a Instalar

```bash
# Runtime
npm install mongoose @tanstack/react-query

# Dev
npm install --save-dev @tanstack/react-query-devtools migrate-mongo
```

**Nenhuma outra dependência é necessária.** Não usar bibliotecas de validação
externas (Zod, Joi) — a validação do Mongoose é suficiente para este escopo.

---

## 6. Não é necessário (justificativas)

| Item                    | Motivo para não incluir                                                    |
|-------------------------|----------------------------------------------------------------------------|
| Autenticação/JWT        | Fora do escopo atual — a app é single-tenant (um estúdio)                 |
| Redux/Zustand           | React Query gerencia server state; useState basta para UI state            |
| ORM alternativo (Prisma)| Prisma não tem suporte maduro a MongoDB embedded documents                 |
| GraphQL                 | Overhead desnecessário para este domínio                                   |
| Testes automatizados    | Não há setup de testes no projeto — não introduzir a meio da migração      |
| Paginação de API        | Volume de dados pequeno (studio = dezenas de alunos, não milhares)         |

---

## 7. Estimativa de Esforço

| Fase                          | Estimativa | Risco   |
|-------------------------------|------------|---------|
| 1. Infraestrutura             | 1–2 dias   | Baixo   |
| 2. Models Mongoose            | 1 dia      | Baixo   |
| 3. Migrations + Seeders       | 1 dia      | Baixo   |
| 4. API Routes (backend)       | 2–3 dias   | Médio   |
| 5. Frontend (React Query)     | 3–4 dias   | Alto    |
| 6. Server Components          | 1 dia      | Baixo   |
| 7. Hardening + Cleanup        | 1 dia      | Baixo   |
| **Total**                     | **10–13 dias úteis** |  |

---

## 8. Ordem de Execução Recomendada (Sem Quebrar a App)

A migração pode ser feita **incrementalmente**, mantendo a app funcional durante todo o processo:

```
Fase 1 → Fase 2 → Fase 3
                        ↓
          Fase 4: uma rota de API por vez
                        ↓
          Fase 5: uma view por vez (começa por Alunos — mais simples)
                  Alunos → Configurações → Agenda → Detalhe → Financas → Frequencia → Home
                        ↓
               Fase 6 + Fase 7 (paralelo)
```

Durante a Fase 5, a estratégia é: **por view, substituir o hook de context pelo hook React Query**,
testar a view isoladamente, e só então avançar para a próxima. O localStorage coexiste com
o banco temporariamente — não há big bang.

---

## 9. Riscos e Mitigações

| Risco                                          | Mitigação                                                      |
|------------------------------------------------|----------------------------------------------------------------|
| IDs numéricos (timestamp) vs ObjectId          | Converter tudo de uma vez na Fase 5 — nunca misturar          |
| `alunoNome` desnormalizado em agendamentos     | Atualizar em PUT `/api/alunos/[id]` com `updateMany` no campo |
| Base64 de fotos em instrutores (campo grande)  | Mover para campo separado; futuramente, upload para storage    |
| Singleton de conexão Mongoose em dev           | Implementar o padrão com `global._mongooseConn` desde o início|
| Seeds rodando em produção acidentalmente       | Flag `NODE_ENV !== "production"` no início do script de seed  |

---

*Este plano reflete o estado do projeto em 2026-06-08. Revisitar estimativas após a Fase 4.*
