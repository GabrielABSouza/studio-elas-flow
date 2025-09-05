CLAUDE.md — Guia do Agente para o Front-end (Vite + React + TS + Tailwind)

Objetivo: orientar o agente a implementar e refatorar o front-end seguindo boas práticas, sem alterar componentes da UI sem solicitação explícita, mantendo o código limpo, consistente e seguro.

1) Princípios operacionais (regras invioláveis)

NUNCA CRIE UM NOVO SERVIDOR A NÃO SER QUE EXPLICITAMENTE SOLICITADO

Não alterar a UI sem pedido explícito
Não mudar layout, hierarquia visual, textos, ícones, espaçamentos ou cores.
Se uma mudança visual for necessária para corrigir bug, escalar com comentário TODO explicando o motivo e propondo alternativa mínima.

Não introduzir dependências novas sem instrução explícita.

Escopo mínimo e atômico
Commits/PRs pequenos, 1 assunto por vez.

Compatibilidade e reversibilidade
Preserve contratos; quando necessário, crie props opcionais.

Padronização antes de criatividade
Siga os padrões deste documento.

Segurança e privacidade
Nada de segredos no repositório. Use import.meta.env.

Acessibilidade primeiro
ARIA, foco visível, navegação por teclado.

2) Arquitetura de pastas (sugerida)
src/
  app/                  # provedores de alto nível, tema, query, roteamento
  routes/               # rotas (React Router)
  components/
    ui/                 # shadcn/ui — NÃO editar sem pedido
    common/             # wrappers compartilhados
  features/
    <feature>/
      pages/            # telas
      components/       # componentes da feature
      api.ts            # chamadas HTTP
      hooks.ts          # React Query hooks da feature
      schemas.ts        # zod schemas/tipos
  lib/                  # api client, formatters, utils
  styles/               # css base/tokens
  assets/               # imagens/ícones


Alias: @ → ./src.

3) Stack e convenções

Vite + React + TS

Tailwind (tokens via CSS vars, darkMode:"class")

shadcn/ui + Radix

React Router v6 (lazy + Suspense)

React Query v5

react-hook-form + zod

sonner para toasts

next-themes para tema

4) Tailwind — diretrizes

Use tokens (bg-card, text-muted-foreground, border) — sem hex fixo.

Evite CSS global (salvo base/reset).

Ordem de classes: layout → box → tipografia → cor → estados → dark.

Sem !important.

Responsivo com sm/md/lg.

5) Padrões de componentes React

Funcionais + TS; sem side-effects em render.

memo/useMemo/useCallback com parcimônia.

Acessibilidade via Radix/shadcn.

Não quebre contratos existentes.

6) Dados e React Query

Keys estáveis por recurso.

Trate loading/error/empty/success.

Prefira setQueryData a invalidar tudo.

Stale time por recurso (padrão 30–60s).

Mutations otimistas só com instrução explícita.

7) Formulários (RHF + zod)

Schema em schemas.ts da feature.

zodResolver, aria-invalid, mensagens associadas.

Botões desabilitados durante submit.

8) Roteamento

Novas telas em routes/ ou features/<feature>/pages.

React.lazy + <Suspense fallback={<SkeletonPage/>}>.

Não mude hierarquia de rotas sem pedido.

9) Erros, toasts e carregamento

Skeletons/placeholder consistentes.

Toasts curtos; sem stack traces.

Fallback amigável com retry.

10) Theming e dark mode

next-themes, attribute="class".

Use tokens; teste light/dark/system.

11) Acessibilidade (A11y)

Foco visível e ordem de tabulação.

aria-label/aria-labelledby corretos.

Componentes Radix/shadcn sempre que houver.

12) Cliente HTTP (fio de conexão)

Centralize em features/<feature>/api.ts e lib/api.ts.

Sem lógica de domínio no client.

Base URL via VITE_API_URL.

13) Testes (se habilitados)

Testing Library + Vitest.

Unit para hooks/utils; integração para telas críticas.

14) Padrões de código e qualidade

Lint sem desativar regras sem justificativa.

Prettier padrão.

Evite any.

Sem logs em PR final.

15) Segurança

Não expor segredos.

Validar/sanitizar dados (zod).

Evitar dangerouslySetInnerHTML.

16) Performance

Code-split por rota.

Evitar re-renders (keys/props estáveis).

Virtualização só quando solicitado.

17) Fluxo de trabalho do agente

Ler tarefa e definir escopo mínimo.

Listar arquivos afetados.

Planificar mudança (objetivo/impacto/rollback).

Executar seguindo este guia.

Auto-revisão com checklist.

PR com diff claro e mensagem descritiva.

18) Checklist antes do commit

 UI não alterada sem pedido explícito.

 Sem novas dependências.

 Imports com @/.

 Loading/erro tratados.

 A11y ok.

 Tipos corretos.

 Vars via import.meta.env.

 Lint/Build ok.

19) Mensagens de commit (exemplos)
feat(reports): add revenue by method drawer
fix(calendar): align popover style with agenda
refactor(pos): extract EditIconButton to common
chore(ci): run lint on changed packages

20) Quando pedir confirmação ao humano

Qualquer mudança de UX/visual.

Remover componentes/props/rotas.

Novas dependências/build.

Comportamentos com impactos em dados persistidos.

21) Exemplos de tarefas típicas

(iguais aos teus)

22) Observações finais

Este documento precede preferências do agente. Em ambiguidade, não alterar UI e solicitar esclarecimento com proposta mínima.

SEÇÕES DE PRODUTO (GUARD-RAILS)
23) Agenda — Dia/Semana/Mês (NÃO alterar sem pedido)

Dia

Linhas = profissionais; colunas = horários.

Remover rótulo “Profissional” do cabeçalho.

Header sticky com border-b; células com border-t border-l.

AppointmentPill obrigatório nas células com agendamento:

rounded-xl border bg-card hover:bg-accent/60 hover:shadow-sm

Borda por status: to_confirm (amber/50), confirmed (primary/40), completed (green/50).

Dot de status dentro do card (nunca ao lado do nome do profissional).

Clique abre POS.

Slot vazio: botão “+” (card dashed) visível em hover/foco (desktop) e sempre no touch.

Sem empty-state gráfico.

Semana/Mês

Exibir % de ocupação por profissional no período (barras/badges).

Mesma estética do calendário/Popover da Agenda.

Ações globais: botão “Novo agendamento” isolado no topo; controles (data/visão) abaixo do título/CTA.

Status incluídos no produto: to_confirm (A confirmar), confirmed (Confirmado), completed (Executado). canceled excluído por padrão.

24) POS — Finalizar atendimento

Valores padrão (procedimentos, preços, % comissão) vêm do cadastro e ficam somente-leitura.

Edição apenas via ícones de lápis (toggles):

“Editar itens” (nome/preço/qty; por padrão só qty).

“Editar valor final” (exclusivo com desconto).

“Editar % comissão”.

Layout 2 colunas, modal largo (~920–1040px).

Comissão sempre calculada sobre o total após desconto.

Formas de pagamento: PIX, débito, crédito (1x/2x), dinheiro, voucher.

Ao finalizar: status → completed e prompt para atualizar cadastro do cliente.

25) “Novo Agendamento” (dialog único para CTA e “+” do slot)

Cliente: combobox com busca de cadastrados ou nome livre (novo).

Telefone sempre visível (pré-preenche se existente).

Profissional: default do slot (editável).

Data/Hora: mesmo CalendarPopover da Agenda + select de horários (30min).

Procedimentos: linhas com select de procedimento (catálogo), select de profissional responsável (default = do agendamento), qty, adicionar/remover.

Respeitar habilitações (procedimento × profissional).

26) Relatórios — Dashboard + Drawers + Hub de Favoritos

Hub de Favoritos no topo (cards menores).

Favoritar via estrela no card e no Drawer (usar atualização otimista e mesma fonte de dados).

Estrela não abre Drawer (usar stopPropagation).

Dashboard de cards clicáveis (resumo do período):

revenue.total (faturamento)

revenue.byMethod (modalidade)

revenue.byPro.top3

commission.total (realizado — só completed)

commission.byPro.top3

commission.forecastNextWeek (projeção da próxima semana: inclui to_confirm, confirmed, completed; exclui canceled)

Drawers: gráfico + tabela + filtros locais + Exportar CSV/XLS/PDF + Fixar + “Ver relatório completo”.

Regra de status

KPIs realizados: apenas completed.

Projeções: to_confirm + confirmed + completed (peso de to_confirm configurável no back; default 1.0 se não informado).

canceled fica sempre fora.

27) Exportações

CSV/XLS: dataset da tabela renderizada com filtros aplicados + linha de totais.

PDF: layout print-friendly do relatório completo (filtros + gráfico + tabela).

Períodos grandes: exportação assíncrona (não bloquear UI).

28) Configurações — Procedimentos

Procedure: nome, categoria, duração, cor, ativo.

Preço & Comissão: preço base, % comissão default, vigência (de/até).

Habilitar por profissional (overrides: preço, % comissão, duração, buffers).

Matriz Profissionais×Procedimentos para manutenção rápida (habilitar/ajustes em lote).

Desativar esconde de Agenda/POS (não apaga histórico).

29) Configurações — Campanhas & Combos

Combo (produto pacote):

Itens [ { procedureId, qty } ]

Preço: desconto % ou valor final (exclusivos).

Profissionais habilitados (por pessoa ou função).

Validade (início/fim, dias/horários) + limites (global e por cliente) + stacking flag.

Status: rascunho, publicado, pausado, expirado.

POS: aplicar desconto e comissão sobre valor após desconto (ratear desconto proporcional aos itens).

Campanhas de desconto: escopos por categoria/procedimento/dia/modalidade; mesmas regras de validade/stacking.

Redenção

Tipo A: venda + consumo imediato.

Tipo B (pacote de sessões): gerar créditos, controlar saldo/validade; sugerir consumo na Agenda/POS.

30) RBAC — Papéis e permissões mínimas

Admin: tudo.

Gestor: relatórios; criar/editar procedimentos, combos/campanhas; publicar/pausar.

Recepção: Agenda, criar agendamento, POS; não pode editar preço/% comissão (salvo permissão).

Profissional: ver própria agenda, marcar execução, ver comissões; sem editar preços.

Aplicação no front:

Gates de UI (mostrar/ocultar/disable).

Rotas protegidas.

Nunca depender só do front; o back deve checar.

31) Auditoria

Log obrigatório para alterações de preço, % comissão, publicação/pausa de campanhas/combos.

Registrar { who, when, field, from, to, reason? }.

Em POS, ao sobrescrever preço/comissão, exigir motivo (short).

32) Regras de cálculo (fonte única)

Comissão = valor_após_desconto * (commissionPct/100).

Desconto de valor final (combo) deve ser rateado proporcionalmente aos itens para comissão.

Moeda: BRL (R$), 2 casas; arredondar no fim do item.

Timezone: America/Sao_Paulo.

Datas em ISO no wire; formatação só na borda de UI.

33) Calendário/Date Picker — padrão único

Usar o mesmo CalendarPopover em Agenda, Novo Agendamento e Relatórios (estilo idêntico).

Botões “Hoje”/“Limpar”; dias com hover:bg-accent, seleção bg-primary.

34) Favoritos — fonte única e comportamento

Estado/Query única (['report-favorites', userId]).

Toggle com atualização otimista; refletir imediatamente na faixa “Meus favoritos”.

Ícone de estrela não abre o Drawer (stopPropagation).

Reordenar via drag; persistir order_index.

35) QA/aceitação específicos (marcar antes do merge)

Agenda Dia com AppointmentPill correto; sem dots em nome do profissional; “+” nos slots.

POS com toggles de lápis, comissão pós-desconto, finalize → prompt de atualização de cadastro.

Novo Agendamento: combobox de cliente, telefone, selects de profissional/procedimento, mesmo calendário da Agenda.

Relatórios: cards abrem Drawers; Projeção de comissão – próxima semana inclui to_confirm/confirmed/completed e exclui canceled.

Favoritar sobe para “Meus favoritos” imediatamente; um X de fechar no Drawer.

Configurações: CRUD de procedimentos, matriz de habilitação, combos/campanhas com validade e profissionais; RBAC aplicado (botões/rotas).

Exportações geram CSV/XLS/PDF com filtros aplicados e linha de total.

Importante: em qualquer dúvida não visual, aplique as regras acima. Em qualquer dúvida visual, não altere e peça confirmação com proposta mínima.