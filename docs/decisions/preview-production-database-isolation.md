# Isolamento de banco entre preview e produção

## Contexto

Antes desta mudança, o pipeline de CD (`.github/workflows/cd.yml`) fazia:

1. Roda os testes unitários
2. Builda e faz deploy de preview na Vercel
3. Executa os testes E2E (Playwright) contra a URL de preview
4. Promove esse mesmo deploy para produção (`vercel promote`)

Só existia **um** projeto Supabase. As variáveis `VITE_SUPABASE_*` eram
iguais em Preview e Production na Vercel, então os testes E2E liam e
escreviam direto no banco de produção — qualquer execução do pipeline
podia poluir dados reais, e um teste mal escrito podia até apagar pedidos
de clientes.

## O que foi feito

1. Criado um segundo projeto Supabase (`velo-preview`), com as mesmas
   migrations (`supabase/migrations`) e a mesma Edge Function
   (`credit-analysis`) do projeto de produção, RLS incluída.
2. Corrigidas as variáveis `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`
   no ambiente **Preview** da Vercel, que até então apontavam (por engano)
   para o projeto de produção.

## O problema central: `VITE_*` é build-time, `vercel promote` não rebuilda

Investigando o pipeline (conforme sugerido no desafio), duas descobertas
mudam a solução possível:

- **`vercel pull --environment=preview` + `vercel build`** resolve as
  variáveis `VITE_SUPABASE_*` do ambiente Preview da Vercel e o Vite as
  embute como string literal no bundle JS final — `import.meta.env.VITE_X`
  deixa de existir em runtime, vira um valor fixo dentro do arquivo
  `.js` já minificado.
- **`vercel promote <url>`** não gera um novo build. Ele apenas re-aponta
  o alias de domínio de produção para um deployment que já existe — o
  mesmo artefato testado pelo E2E contra o preview.

Ou seja: se o pipeline builda uma vez (com as variáveis de preview) e só
promove esse artefato pra produção sem rebuildar, a aplicação em
produção continuaria servindo o bundle com o Supabase de **preview**
embutido — o oposto do que o desafio pede.

## Alternativas consideradas

**A. Rebuild dedicado para produção após o E2E passar**
Trocar o job `promote` por um novo `vercel pull --environment=production`
+ `vercel build` + `vercel deploy --prebuilt --prod`, gerando um artefato
novo com as variáveis de produção.

- ✅ Simples, resolve o problema sem tocar em código do app.
- ❌ Quebra a garantia de "o mesmo artefato testado é o que sobe pra
  produção" — o bundle de produção nunca passou pelo E2E, só o código-fonte
  é o mesmo. Um novo build pode, em teoria, introduzir diferenças (versões
  de dependências resolvidas de novo, etc.) que o E2E nunca viu.

**B. Resolver o Supabase em runtime, por hostname (escolhida)**
Manter um único build por push. Embutir as duas configurações (produção e
preview) como constantes no bundle — seguro, pois são chave/URL públicas
(`publishable key`), a segurança real vem das policies de RLS — e
escolher entre elas em `src/integrations/supabase/client.ts` comparando
`window.location.hostname` contra uma lista de hostnames de produção
conhecidos.

- ✅ Preserva "build once, promote o mesmo artefato": o `vercel promote`
  do workflow não precisou de nenhuma mudança.
- ✅ O artefato testado pelo E2E é, literalmente, o mesmo que serve
  produção depois do promote.
- ❌ Se o domínio de produção mudar, é preciso atualizar a lista
  `PRODUCTION_HOSTNAMES` em `client.ts` manualmente.

Optei pela **opção B**: numa aplicação client-side, "não misturar o
artefato testado com o artefato publicado" pesa mais do que a
manutenção extra de uma lista de hostnames — que, na prática, muda raras
vezes (só quando se troca de domínio).

`yarn dev` local não foi afetado: continua lendo `VITE_SUPABASE_URL`/
`VITE_SUPABASE_PUBLISHABLE_KEY` do `.env` normalmente, só o bundle
publicado (Vercel) usa a resolução por hostname.

## Bugs pré-existentes encontrados durante a validação

Validar o pipeline ponta a ponta (rodar de verdade e conferir o
`promote`) expôs três bugs no `cd.yml` que já existiam antes desta
mudança e faziam o `promote` nunca promover nada de fato, mesmo
reportando sucesso:

1. **Upload pro Test Dino derrubava o job de E2E inteiro** quando
   `TESTDINO_TOKEN` estava vazio, o que bloqueava o `promote` mesmo com
   os testes passando. Corrigido migrando de um step de upload pós-hoc
   (`tdpw upload`) pro reporter `@testdino/playwright`, que reporta em
   tempo real e nunca falha a suíte.
2. **CLI da Vercel sem versão fixa** (`yarn global add vercel`) baixava
   sempre a última versão disponível, que mudou o formato de saída do
   `vercel deploy` e quebrou a captura da URL de deploy usada pelo
   `promote`. Corrigido usando a CLI já pinada como devDependency
   (`npx --no-install vercel`).
3. **`VERCEL_SCOPE` cadastrado como GitHub Secret**: seu valor (o slug
   da organização) aparece como subdomínio em toda URL de deployment.
   O GitHub Actions mascara qualquer output que contenha um secret
   registrado — inclusive em base64 — então `deployment-url` era
   descartado silenciosamente e o `promote` rodava sem argumento
   nenhum. Resolvido removendo `VERCEL_SCOPE`: `VERCEL_ORG_ID` +
   `VERCEL_PROJECT_ID` já identificam o projeto sozinhos.

## Validação

- RLS policies comparadas via `pg_policies` entre os dois projetos:
  idênticas.
- Pipeline rodado de ponta a ponta múltiplas vezes após os fixes acima:
  `unit-tests` → `build-and-deploy` → `e2e-tests` → `promote`, todos
  verdes.
- Bundle servido em produção (`velo-ivalice.vercel.app`) inspecionado
  diretamente: contém as duas configurações de Supabase e resolve para
  a de produção nesse hostname.
- Pedidos criados pelos testes de checkout (que fazem uma compra de
  verdade) foram conferidos nos dois bancos: nascem e são limpos no
  projeto de preview, nunca aparecem no de produção.
