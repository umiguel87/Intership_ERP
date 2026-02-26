# Organização dos estilos (CSS)

Os estilos estão organizados por **base** (variáveis, layout, componentes partilhados) e por **página** (um ficheiro por rota). A ordem de importação em `index.css` deve ser mantida (variáveis primeiro, dark mode e responsivo no fim).

## Base

| Ficheiro | Conteúdo |
|----------|----------|
| **01-variables.css** | Variáveis CSS (`:root`) — cores e tokens do tema (--lt-primary, etc.) |
| **02-layout.css** | Layout principal: `.app`, `.app__main`, sidebar (incl. minimizada), topbar |
| **03-components-pesquisa.css** | Barra de pesquisa global (topbar) |
| **08-components-ui.css** | Modal, ConfirmModal, Toast, Detalhe cliente, Fatura impressão |
| **13-dark-mode.css** | Overrides para `.app.app--dark` e `body.theme-dark` |
| **14-responsive.css** | Media queries (sidebar, padding, etc.) |

## Páginas (`pages/`)

Um ficheiro por rota da aplicação:

| Ficheiro | Página |
|----------|--------|
| **dashboard.css** | Dashboard: cards, alertas, total vendas, gráficos, calendário, empty state |
| **faturas.css** | Faturas: formulário nova fatura + lista de faturas (estilos partilhados com Contas a Receber / Logs) |
| **clientes.css** | Clientes: overrides da lista (reutiliza `.lista-faturas`) |
| **contas-a-receber.css** | Contas a Receber: cards, tabs, toolbar, tabela |
| **logs.css** | Logs: cabeçalho e botão limpar |
| **auth.css** | Login / Registo |
| **utilizadores.css** | Utilizadores |
| **definicoes.css** | Definições: backup, restauro, toggle modo escuro |

**Para alterar:** abrir o ficheiro da secção correspondente (ex. cores do tema → `01-variables.css`, estilos do dashboard → `pages/dashboard.css`, dark mode → `13-dark-mode.css`).
