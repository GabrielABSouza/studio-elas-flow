# CLAUDE.md — Guia do Agente para o Front‑end (Vite + React + TS + Tailwind)

> **Objetivo**: orientar o agente (ex.: Claude Code) a implementar e refatorar o front‑end seguindo boas práticas, **sem alterar componentes da UI sem solicitação explícita**, mantendo o código limpo, consistente e seguro.

---

## 1) Princípios operacionais (regras invioláveis)

1. **Não alterar a UI sem pedido explícito**

   * Não mudar layout, hierarquia visual, textos, ícones, espaçamentos ou cores.
   * Se uma mudança visual for **necessária** para corrigir bug, **escalar** com comentário TODO explicando o motivo e propondo alternativa mínima.
2. **Não introduzir dependências novas** sem instrução explícita.
3. **Escopo mínimo e atômico**

   * Cada mudança deve ter objetivo claro e pequeno (1 PR/commit por assunto).
4. **Compatibilidade e reversibilidade**

   * Preserve APIs de componentes existentes; quando necessário, introduza **props opcionais** em vez de quebrar contratos.
5. **Padronização antes de criatividade**

   * Use os padrões definidos neste documento; evite soluções ad‑hoc.
6. **Segurança e privacidade**

   * Nunca comitar segredos/tokens. Use `import.meta.env` e `.env*`.
7. **Acessibilidade** primeiro

   * Respeite ARIA roles, foco, contraste e navegação por teclado.

---

## 2) Arquitetura de pastas (sugerida)

```
src/
  app/                  # provedores de alto nível, tema, query, roteamento
  routes/               # rotas (React Router), 1 arquivo/página ou pasta por feature
  components/
    ui/                 # componentes shadcn/ui gerados — NÃO editar sem pedido
    common/             # wrappers e componentes compartilhados da aplicação
  features/             # fatias de domínio (ex.: customers, appointments, services)
    <feature>/
      pages/            # telas
      components/       # componentes específicos da feature
      api.ts            # chamadas HTTP (sem lógica de domínio pesada)
      hooks.ts          # hooks React Query p/ esta feature
      schemas.ts        # zod schemas/tipos desta feature
  lib/                  # utilitários (api client, cn, formatters, constants)
  styles/               # index.css, tokens, resets
  assets/               # imagens, ícones estáticos
```

**Alias**: `@ → ./src` em todos os imports internos.

---

## 3) Stack e convenções

* **Build**: Vite + React + TypeScript.
* **Estilos**: Tailwind CSS (`darkMode: "class"`), tokens via CSS vars.
* **UI kit**: shadcn/ui + Radix primitives. **Não editar arquivos de `components/ui`**; crie wrappers em `components/common`.
* **Roteamento**: React Router v6; use lazy + Suspense para code‑split.
* **Dados**: TanStack React Query v5 (cache, invalidação, estados de loading/erro).
* **Formulários**: react‑hook‑form + zod.
* **Tema**: next‑themes (atributo `class`).
* **Toasts**: sonner (mensagens curtas e não bloqueantes).

---

## 4) Tailwind — diretrizes

1. **Tokens primeiro**: priorize classes utilitárias e variáveis de tema (ex.: `bg-background`, `text-foreground`).
2. **Sem CSS global** (exceto reset/base); estilos específicos devem ficar como classes utilitárias ou em wrappers.
3. **Classes legíveis**: mantenha ordem aproximada: layout → box → tipografia → cor → estados (hover/focus) → dark.
4. **Evitar `!important`**; prefira composição de classes.
5. **Responsivo**: use prefixos (`sm: md: lg:`) em vez de media queries manuais.

**Exemplo**

```tsx
<button className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm
                 bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">
  Salvar
</button>
```

---

## 5) Padrões de componentes React

* **Funcionais + TS**; tipar props com interfaces.
* **Pureza**: componentes puros; derive dados via props/hooks; evitar estado global implícito.
* **Memorização criteriosa**: `React.memo`, `useCallback`, `useMemo` apenas quando houver ganho comprovado.
* **Acessibilidade**: usar Radix/shadcn para controle de foco, ARIA e teclado.
* **Sem side‑effects em render**: operações async em effects, com abort/cancel.
* **Sem alteração estrutural de componentes existentes** (markup/props) sem pedido explícito; para novas necessidades, adicionar **props opcionais não disruptivas**.

---

## 6) Dados e React Query

* **Query keys estáveis** por recurso: `['customers']`, `['customers', id]`.
* **Estados obrigatórios**: loading, error, empty, success.
* **Invalidate com parcimônia**: prefira `setQueryData` quando possível.
* **Stale time**: definir por recurso; padrão conservador (ex.: 30–60s) quando não especificado.
* **Mutations**: usar otimista somente com instrução explícita; caso contrário, confirmar pelo servidor.
* **Erros**: normalizar mensagem e exibir via toast + fallback UI (nunca silencioso).

**Exemplo**

```ts
const q = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });
if (q.isLoading) return <SkeletonList/>;  
if (q.isError) return <ErrorState message={toMessage(q.error)}/>;
```

---

## 7) Formulários (react‑hook‑form + zod)

* **Schema zod** no arquivo da feature ou em `schemas.ts`.
* **Resolver**: `zodResolver(schema)`.
* **A11y**: `aria-invalid`, `aria-describedby` e mensagens de erro associadas.
* **Submit**: estados de `isSubmitting` e botão desabilitado.

**Exemplo**

```tsx
const form = useForm<Inputs>({ resolver: zodResolver(FormSchema) });
<form onSubmit={form.handleSubmit(onSubmit)}>
  <Input {...form.register('name')} aria-invalid={!!form.formState.errors.name} />
  {form.formState.errors.name && <p role="alert">{form.formState.errors.name.message}</p>}
</form>
```

---

## 8) Roteamento

* Criar novas páginas em `routes/` **ou** em `features/<feature>/pages` e exportar rota.
* Usar `React.lazy` + `<Suspense fallback={<SkeletonPage/>}>`.
* **Não alterar a ordem/hierarquia de rotas existentes** sem pedido explícito.

**Exemplo**

```tsx
const ClientesPage = React.lazy(() => import('@/features/customers/pages/clientes'));
<Route path="/clientes" element={<Suspense fallback={<SkeletonPage/>}><ClientesPage/></Suspense>} />
```

---

## 9) Erros, toasts e carregamento

* **Carregamento**: usar skeletons/placeholders consistentes.
* **Toasts**: `sonner` para confirmações rápidas; mensagens curtas, sem stack traces.
* **Fallback**: telas de erro amigáveis com ação para retry.

---

## 10) Theming e dark mode

* Controlado por `next-themes` com `attribute="class"`.
* Usar tokens `bg-background`, `text-foreground` etc.; **não** hardcode cores hex.
* Testar estados `light`, `dark` e `system` ao introduzir novos componentes.

---

## 11) Acessibilidade (A11y)

* Garantir foco visível e ordem de tabulação.
* Usar componentes Radix/shadcn quando houver equivalente.
* Fornecer `aria-label`/`aria-labelledby` conforme necessário.

---

## 12) Cliente HTTP (fio de conexão)

* Centralizar chamadas em arquivos `api.ts` por feature, usando um **client fino** (`lib/api.ts`).
* **Sem lógica de domínio** na camada HTTP; apenas requests, parsing/validação e erros.
* `VITE_API_URL` via `.env`; **não** embutir URLs.

**Exemplo**

```ts
// features/customers/api.ts
export async function fetchCustomers() {
  return api.get<Customer[]>('/customers');
}
```

---

## 13) Testes (quando habilitados)

* Preferir **Testing Library** + **Vitest**.
* Testes de unidade para hooks e utils; testes de integração para páginas críticas.
* Evitar snapshots frágeis de markup (preferir queries por papel/label).

---

## 14) Padrões de código e qualidade

* **Lint**: não desabilitar regras sem justificativa em comentário.
* **Prettier**: manter formatação padrão do projeto.
* **Tipos**: evitar `any`; usar `unknown` + narrows ou zod.
* **Logs**: `console.log` apenas em DEV e removidos antes do merge.

---

## 15) Segurança

* Nunca expor chaves ou segredos.
* Sanitizar e validar dados de entrada/saída (zod onde couber).
* Evitar `dangerouslySetInnerHTML`; se inevitável, documentar e higienizar.

---

## 16) Performance

* Code‑split por rota/feature; imagens otimizadas; evitar re‑renders (keys estáveis, props imutáveis).
* Tabelas/listas grandes: considerar virtualização **apenas sob instrução explícita**.
* Evitar cálculos pesados em render; use memoização quando necessário.

---

## 17) Fluxo de trabalho do agente

1. **Ler a tarefa** e identificar o **escopo mínimo**.
2. **Listar arquivos** que serão alterados.
3. **Planificar a mudança** (em comentário no topo do PR/commit): objetivo, impacto e rollback.
4. **Executar** seguindo este Cloud.md.
5. **Auto‑revisão** com checklist (abaixo).
6. **Gerar diff claro** e mensagem de commit descritiva.

---

## 18) Checklist antes do commit

* [ ] UI não foi alterada (ou há pedido explícito + justificativa).
* [ ] Sem novas dependências.
* [ ] Imports usam `@/` e caminhos relativos curtos.
* [ ] Estados de loading/erro contemplados.
* [ ] Acessibilidade básica verificada.
* [ ] Tipos corretos; sem `any` desnecessário.
* [ ] Variáveis de ambiente via `import.meta.env`.
* [ ] Lint/Build passam localmente.

---

## 19) Mensagens de commit (padrão sugerido)

```
feat(customers): add form validation with zod
fix(appointments): handle empty state when no slots
refactor(ui): extract ButtonWrapper to components/common
chore(lint): enable eslint rule for hooks exhaustive-deps
```

---

## 20) Quando pedir confirmação ao humano

* Alterações visuais/UX, inclusive spacing, tipografia, cores e ordem de elementos.
* Remoção de componentes, props ou rotas.
* Introdução de dependências, mudanças de build, ou reestruturação de pastas.
* Comportamentos de dados que impliquem perda/alteração de estado persistido.

---

## 21) Exemplos de tarefas típicas

**Criar nova página**

1. Criar `features/<feature>/pages/<Page>.tsx`.
2. Exportar rota em `routes` e usar `React.lazy` + `Suspense`.
3. Garantir skeleton e empty state.

**Adicionar chamada HTTP**

1. Implementar em `features/<feature>/api.ts` usando `lib/api`.
2. Criar hook em `features/<feature>/hooks.ts`.
3. Consumir na página; tratar loading/erro; exibir toast em sucesso/erro.

**Refinar formulário**

1. Definir schema zod.
2. `react-hook-form` com `zodResolver`.
3. Mensagens de erro acessíveis e botão desabilitado em submit.

---

## 22) Observações finais

* Este documento **precede** preferências do agente; em caso de conflito, **seguir o CLAUDE.md**.
* Em ambiguidade, **não alterar UI** e solicitar esclarecimento com proposta mínima de implementação.
