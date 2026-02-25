# ERP Faturação

Aplicação de faturação e gestão de clientes desenvolvida em React + Vite, com controlo de acesso por perfis (admin, comercial, financeiro).

## Funcionalidades

- **Dashboard** — Visão geral: total de vendas, por pagar, pago, número de faturas e clientes; gráfico de vendas por mês (com comparação ao ano anterior quando existem dados); gráfico de faturas por estado; últimas faturas; alertas quando há faturas por pagar (com link para Contas a Receber).
- **Faturas** — Criar, editar, remover e duplicar faturas; alterar estado (por pagar / paga / anulada); filtro por estado, por cliente e por intervalo de datas; ordenação por data, número, valor, cliente ou estado; impressão em PDF; exportar lista em CSV.
- **Clientes** — Lista, detalhe, criar, editar e remover clientes; validação de NIF (formato PT, opcional); ordenação por nome, email ou NIF; exportar lista em CSV.
- **Contas a Receber** — Lista de faturas por pagar; alterar estado para paga (com justificação).
- **Utilizadores** — (Só Admin) Listar e editar utilizadores (nome, email, perfil); alterar palavra-passe.
- **Definições** — (Só Admin) Exportar backup (JSON com faturas, clientes e utilizadores) e importar backup para restauro.
- **Logs** — Histórico de ações (apenas perfil admin).
- **Autenticação** — Login e registo; sessão com expiração e logout por inatividade.

## Perfis e permissões

| Perfil      | Faturas (criar/editar/remover) | Alterar estado | Clientes (criar/editar/remover) | Utilizadores / Definições / Logs |
|------------|---------------------------------|----------------|---------------------------------|----------------------------------|
| Admin      | Sim                             | Sim            | Sim                             | Sim                              |
| Comercial  | Sim                             | Sim            | Sim                             | Não                              |
| Financeiro | Não                             | Sim            | Não                             | Não                              |

## Segurança

- **Passwords** — Armazenadas em hash (PBKDF2 + SHA-256, 120k iterações) com salt por utilizador; migração automática de contas antigas em texto.
- **Regras de password** — Mínimo 8 caracteres, pelo menos uma letra e um número.
- **Sessão** — Expiração (8 h); renovação em atividade; logout automático após 30 min de inatividade.
- **Rate limit** — Bloqueio de 15 minutos após 5 tentativas de login falhadas.
- **Inputs** — Sanitização (trim e limite de comprimento) em nome e email.
- **UX** — Confirmação ao sair dos modais de edição (fatura/cliente) quando há alterações por guardar.
- **Acessibilidade** — Modais com foco inicial e armadilha de Tab; aria-labelledby nos diálogos; mensagens de erro com role="alert" e aria-describedby onde aplicável.

## Requisitos

- Node.js 18+
- npm ou yarn

## Instalação

```bash
# Clonar ou abrir o projeto
cd ERP_Intership

# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) no browser.

## Scripts

| Comando        | Descrição                    |
|----------------|------------------------------|
| `npm run dev`  | Servidor de desenvolvimento  |
| `npm run build`| Build de produção            |
| `npm run preview` | Pré-visualizar build     |
| `npm run lint` | Executar ESLint             |

## Contas de teste

Na primeira execução são criadas 3 contas (se não existir nenhum utilizador):

| Email               | Password  | Perfil    |
|---------------------|-----------|-----------|
| admin@teste.pt     | Admin123  | Admin     |
| comercial@teste.pt | Admin123  | Comercial |
| financeiro@teste.pt| Admin123  | Financeiro|

Se já tiveste dados anteriores, as passwords antigas (ex.: `1234`) continuam válidas e são migradas para hash automaticamente.

## Estrutura do projeto

```
src/
├── components/     # Componentes reutilizáveis (dashboard, faturas, clientes, layout)
├── constants/     # Roles e permissões
├── pages/         # Páginas (Auth, Dashboard, Faturas, Clientes, etc.)
├── storage/       # Acesso a localStorage (utilizadores, sessão, faturas, clientes, logs)
├── utils/         # Segurança, formatação (data/moeda), export CSV, número de fatura
├── App.jsx
└── main.jsx
```

## Nota para produção

Os dados e a autenticação estão atualmente em **localStorage** (frontend apenas). Para um ambiente de produção é essencial:

- **Backend** — API (ex.: Node/Express, .NET) para regras de negócio e validação no servidor.
- **Base de dados** — Persistência segura de faturas, clientes e utilizadores (ex.: PostgreSQL, MongoDB).
- **Autenticação** — Tokens (ex.: **JWT**) com refresh e expiração; não armazenar sessão só no cliente.
- **HTTPS** — Tráfego cifrado e cookies seguros.
- **Políticas de segurança** — CORS, rate limiting, sanitização de inputs e auditoria no servidor.
# Intership_ERP
