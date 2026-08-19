# Velô Sprint - Configurador de Veículo Elétrico

Aplicação web em React para configuração e compra do veículo elétrico **Velô Sprint**.

## Sobre o Projeto

Uma SPA (Single Page Application) que permite:
- Personalizar cores, rodas e opcionais do veículo
- Calcular preços em tempo real
- Realizar pedidos com análise de crédito
- Consultar status de pedidos

**Especificações do Velô Sprint:** 450 km de autonomia | 0-100 km/h em 3.2s | 500 cv

---

## Stack Tecnológica

| Categoria | Tecnologias |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Estado** | Zustand (global), React Hook Form (formulários) |
| **Validação** | Zod |
| **Data Fetching** | TanStack Query |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |

---

## Instalação

```bash
# Instalar dependências
yarn install

# Rodar em desenvolvimento
yarn dev
```

Acesse: `http://localhost:5173`

---

## Configuração do Supabase

O projeto usa **dois** projetos Supabase separados:

| Ambiente | Projeto | Usado por |
|----------|---------|-----------|
| Produção | `velo` | Deploy de Production na Vercel |
| Preview | `velo-preview` | Deploys de Preview na Vercel + testes E2E do CI |

Isso existe pra que os testes E2E (que rodam a cada push em `main`, antes do `promote` pra produção) nunca leiam nem escrevam dados no banco de produção.

### 1. Criar os Projetos

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um projeto `New Project` para produção e outro para preview
3. Aguarde a criação de cada um (~2 minutos)

### 2. Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto com as credenciais dos dois projetos (encontradas em **Project Settings → API** e **Project Settings → Database** de cada um):

```env
# Produção
VITE_SUPABASE_PROJECT_ID="seu_project_id_producao"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_chave_anon_publica_producao"
VITE_SUPABASE_URL="https://seu_project_id_producao.supabase.co"
DATABASE_URL=postgresql://postgres.seu_project_id_producao:senha@host.pooler.supabase.com:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_producao

# Preview
VITE_SUPABASE_PROJECT_ID_PREVIEW="seu_project_id_preview"
VITE_SUPABASE_PUBLISHABLE_KEY_PREVIEW="sua_chave_anon_publica_preview"
VITE_SUPABASE_URL_PREVIEW="https://seu_project_id_preview.supabase.co"
DATABASE_URL_PREVIEW=postgresql://postgres.seu_project_id_preview:senha@host.pooler.supabase.com:5432/postgres
SUPABASE_SERVICE_ROLE_KEY_PREVIEW=sua_service_role_key_preview
```

`yarn dev` local sempre usa as variáveis de produção (`VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`) — as variantes `_PREVIEW` servem só pra rodar `supabase link`/`db push`/`functions deploy` contra o projeto de preview e pra configurar os GitHub Secrets do CI.

> **Deploy na Vercel:** o app compilado (`src/integrations/supabase/client.ts`) não lê essas variáveis em produção — ele decide qual projeto usar em runtime, comparando o hostname que está servindo a página contra `PRODUCTION_HOSTNAMES`. Isso existe porque o pipeline de CD builda uma vez contra o preview e promove o mesmo artefato pra produção (`vercel promote`, sem rebuild); se o domínio de produção mudar, atualize a lista `PRODUCTION_HOSTNAMES` em `client.ts`.

### 3. Deploy (banco + functions)

Rode os comandos abaixo uma vez pra cada projeto (troque o `--project-ref` e as flags `-PREVIEW`/produção conforme o caso):

```bash
# Instalar CLI
yarn add supabase -D
yarn supabase login

# Produção
yarn supabase link --project-ref seu_project_id_producao
yarn supabase db push
yarn supabase functions deploy credit-analysis

# Preview
yarn supabase link --project-ref seu_project_id_preview
yarn supabase db push
yarn supabase functions deploy credit-analysis
```

Pronto! Banco e functions estarão configurados nos dois ambientes.

---

## Estrutura Principal

```
src/
├── pages/           # Páginas da aplicação
├── components/      # Componentes React
│   ├── configurator/   # Configurador do carro
│   ├── landing/        # Landing page
│   └── ui/             # Componentes shadcn/ui
├── store/           # Estado global (Zustand)
├── hooks/           # Hooks customizados
└── integrations/    # Cliente Supabase
```

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/configure` | Configurador do veículo |
| `/order` | Checkout/Pedido |
| `/success` | Confirmação do pedido |
| `/lookup` | Consulta de pedidos |

---

## Modelo de Preços

- **Preço base:** R$ 40.000
- **Rodas Sport:** +R$ 2.000
- **Precision Park:** +R$ 5.500
- **Flux Capacitor:** +R$ 5.000
- **Financiamento:** 12x com juros de 2% a.m.

---

## Banco de Dados

**Tabela `orders`** — campos principais:
- `order_number` — Formato: VLO-XXXXXX
- `color`, `wheel_type`, `optionals` — Configuração
- `customer_name`, `customer_email`, `customer_cpf` — Cliente
- `payment_method`, `total_price` — Pagamento
- `status` — pending, approved, rejected, analysis

---

## Análise de Crédito

| Score | Resultado |
|-------|-----------|
| > 700 | Aprovado |
| 501-700 | Em análise |
| ≤ 500 | Reprovado |

*Se entrada ≥ 50% do total, aprova mesmo com score < 700*

---

## Fluxo Principal

```
Landing → Configurador → Checkout → Análise de Crédito → Confirmação
```

---

## Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run lint     # Verificar código
```