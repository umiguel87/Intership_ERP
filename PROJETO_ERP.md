# Especificação do Projeto — Simulador ERP (Faturas)

## Âmbito do projeto
**Foco na parte gráfica (frontend).** Sem backend nem base de dados: estado em memória no React, interface empresarial completa (total de vendas, lista, formulário, remover, total automático).

---

## Objetivo
Aplicação React que simula um módulo de faturação de um ERP: visualizar total de vendas, listar faturas, adicionar e remover faturas, com cálculo automático do total. Ambiente 100% empresarial.

---

## Funcionalidades

| # | Funcionalidade | Descrição |
|---|----------------|-----------|
| 1 | **Total de vendas** | Painel/indicador com o valor total de todas as faturas (soma dos valores). |
| 2 | **Lista de faturas** | Tabela ou lista com todas as faturas (número, data, cliente, valor, etc.). |
| 3 | **Formulário nova fatura** | Formulário para adicionar uma fatura (campos definidos no modelo de dados). |
| 4 | **Remover fatura** | Ação para eliminar uma fatura da lista (com confirmação opcional). |
| 5 | **Cálculo automático do total** | Sempre que se adiciona ou remove uma fatura, o total de vendas atualiza-se automaticamente. |

---

## Modelo de dados — Fatura

Cada fatura terá pelo menos:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | string/number | Sim (único) | Identificador interno (ex.: UUID ou sequencial). |
| `numero` | string | Sim | Número da fatura (ex.: "FT-2025-001"). |
| `data` | string (ISO ou date) | Sim | Data da fatura. |
| `cliente` | string | Sim | Nome do cliente. |
| `valor` | number | Sim | Valor total (em €). |
| `estado` | string | Opcional | Ex.: "Paga", "Por pagar", "Anulada". |

O **total de vendas** = soma do campo `valor` de todas as faturas (considerando apenas as que contam para vendas, se no futuro houver filtro por estado).

---

## Stack técnica

- **React 19** + **Vite** (já configurado).
- **Estado:** `useState` para a lista de faturas (e derivar o total por cálculo).
- **Persistência (opcional):** `localStorage` para não perder dados ao refrescar (podemos adicionar numa segunda fase).
- **Estilos:** CSS (global + módulos ou ficheiros por componente) — visual empresarial, limpo.
- **Roteamento:** uma única página por agora (tudo na mesma view: resumo + formulário + lista).

---

## Estrutura de pastas (sugerida)

```
src/
├── components/
│   ├── TotalVendas.jsx      # Bloco do total de vendas
│   ├── ListaFaturas.jsx     # Tabela de faturas + botão remover
│   ├── FormNovaFatura.jsx   # Formulário para adicionar fatura
│   └── (opcional) FaturaLinha.jsx  # Uma linha da tabela
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

O estado (array de faturas) pode ficar em `App.jsx` e ser passado como props aos componentes (prop drilling simples; se crescer, podemos usar Context).

---

## Design — Ambiente empresarial

- **Estética:** Limpa, neutra, profissional (evitar cores berrantes e animações excessivas).
- **Cores sugeridas:** Tons de cinza, azul escuro ou navy para cabeçalhos, branco/cinza claro para fundos, verde para totais/positivos se fizer sentido.
- **Tipografia:** Sans-serif legível (ex.: system-ui, Inter, ou similar).
- **Layout:** Total de vendas no topo; formulário e lista bem separados; tabela com cabeçalhos claros e alinhamento consistente.

---

## Fluxo de dados (resumo)

1. **App** guarda `faturas` (array de objetos Fatura) em `useState`.
2. **Total de vendas** = `faturas.reduce((sum, f) => sum + f.valor, 0)`.
3. **FormNovaFatura** recebe `onAdicionar(fatura)` e chama ao submeter o formulário (App adiciona ao estado).
4. **ListaFaturas** recebe `faturas` e `onRemover(id)`; cada linha tem botão "Remover" que chama `onRemover` (App remove do estado).
5. Qualquer alteração em `faturas` faz o React re-renderizar e o total atualiza-se automaticamente.

---

## Fases do projeto — O que fazer para ter um bom ERP (frontend)

Seguir por ordem. Cada fase entrega algo visível ou funcional antes de passar à seguinte.

---

### Fase 1 — Base e identidade visual
**Objetivo:** Estrutura do projeto limpa e aspeto empresarial desde o início.

| # | Tarefa | O que fazer |
|---|--------|-------------|
| 1.1 | Limpar template | Remover logos e contador do Vite em `App.jsx`; deixar só um título tipo "Módulo Faturação". |
| 1.2 | CSS global | Em `index.css`: cores neutras (ex.: fundo #f5f6f8), fonte sans-serif, reset básico. |
| 1.3 | Estrutura de pastas | Criar `src/components/` e ficheiros vazios ou placeholder: `TotalVendas.jsx`, `ListaFaturas.jsx`, `FormNovaFatura.jsx`. |
| 1.4 | Layout da página | Em `App.jsx`: definir zonas (cabeçalho, secção total, secção formulário, secção lista) com classes CSS. |

**Entregável:** Página com cabeçalho, blocos vazios no sítio certo e visual “empresarial”.

---

### Fase 2 — Estado e dados
**Objetivo:** O App tem a lista de faturas e sabe como calcular o total.

| # | Tarefa | O que fazer |
|---|--------|-------------|
| 2.1 | Estado no App | `useState` com array `faturas` (inicialmente vazio ou com 1–2 faturas de exemplo). |
| 2.2 | Formato de fatura | Cada item: `{ id, numero, data, cliente, valor, estado }`. Garantir que `id` é único (ex.: `crypto.randomUUID()` ou contador). |
| 2.3 | Cálculo do total | Variável derivada: `totalVendas = faturas.reduce((s, f) => s + f.valor, 0)`. |

**Entregável:** Estado centralizado no App; total calculado (ainda pode não estar visível na UI).

---

### Fase 3 — Total de vendas (painel)
**Objetivo:** O utilizador vê o total de vendas no topo.

| # | Tarefa | O que fazer |
|---|--------|-------------|
| 3.1 | Componente TotalVendas | Recebe `total` (number) por props; mostra valor formatado em € (ex.: `toLocaleString('pt-PT')`). |
| 3.2 | Estilo do painel | Bloco destacado (ex.: fundo escuro, texto claro), tamanho de fonte maior para o valor. |
| 3.3 | Ligar ao App | App passa `totalVendas` a `<TotalVendas total={totalVendas} />`. |

**Entregável:** Painel “Total de vendas” com o valor correto (e a atualizar quando as faturas mudarem).

---

### Fase 4 — Lista de faturas
**Objetivo:** Tabela com todas as faturas.

| # | Tarefa | O que fazer |
|---|--------|-------------|
| 4.1 | Componente ListaFaturas | Recebe `faturas` e `onRemover(id)`. Renderiza `<table>` com cabeçalhos: Nº, Data, Cliente, Valor, Estado, Ações. |
| 4.2 | Linhas da tabela | Por cada fatura: uma `<tr>` com os campos; última coluna com botão "Remover" que chama `onRemover(fatura.id)`. |
| 4.3 | Lista vazia | Se `faturas.length === 0`, mostrar mensagem tipo "Ainda não há faturas." |
| 4.4 | Estilo tabela | Bordes discretas, cabeçalho com fundo mais escuro, alinhamento (valores à direita). |

**Entregável:** Lista de faturas visível; botão Remover já ligado ao estado (remove da lista e o total atualiza).

---

### Fase 5 — Formulário nova fatura
**Objetivo:** Adicionar faturas pela interface.

| # | Tarefa | O que fazer |
|---|--------|-------------|
| 5.1 | Componente FormNovaFatura | Recebe `onAdicionar(fatura)`. Campos: número, data, cliente, valor, estado (select ou input). |
| 5.2 | Submit | `onSubmit`: prevenir default; criar objeto com `id` único; chamar `onAdicionar(novaFatura)`; limpar o formulário. |
| 5.3 | Validação básica | Não submeter se número, cliente ou valor estiverem vazios (ou valor ≤ 0). Mostrar aviso simples ou desativar botão. |
| 5.4 | Ligar ao App | App passa função que faz `setFaturas([...faturas, novaFatura])`. |

**Entregável:** Formulário funcional; nova fatura aparece na lista e o total atualiza.

---

### Fase 6 — Remover fatura e robustez
**Objetivo:** Remoção clara e sem surpresas.

| # | Tarefa | O que fazer |
|---|--------|-------------|
| 6.1 | Remover no App | Função `removerFatura(id)` que faz `setFaturas(faturas.filter(f => f.id !== id))`. Já passada à lista na Fase 4. |
| 6.2 | Confirmação (opcional) | Ao clicar "Remover", usar `confirm('Remover esta fatura?')` antes de chamar `onRemover(id)`. |
| 6.3 | Formatação consistente | Valores sempre com 2 casas decimais; datas num formato legível (ex.: dd/mm/aaaa). |

**Entregável:** Remover fatura com ou sem confirmação; dados sempre bem formatados.

---

### Fase 7 — Melhorias (opcional)
**Objetivo:** Deixar o ERP mais completo e profissional.

| # | Tarefa | O que fazer |
|---|--------|-------------|
| 7.1 | Persistência | Guardar `faturas` em `localStorage` ao alterar; carregar no arranque do App. |
| 7.2 | Acessibilidade | Labels nos inputs, `aria-label` no botão Remover, contraste de cores adequado. |
| 7.3 | Responsivo | Tabela com scroll horizontal em ecrãs pequenos; formulário em coluna no telemóvel. |
| 7.4 | Número automático | Gerar próximo número de fatura (ex.: FT-2026-001, FT-2026-002) ao adicionar. |

**Entregável:** App mais polida e utilizável em diferentes dispositivos.

---

## Resumo das fases

| Fase | Nome curto | Resultado |
|------|------------|-----------|
| 1 | Base e identidade | Estrutura + layout + visual empresarial |
| 2 | Estado e dados | Lista de faturas no App + cálculo do total |
| 3 | Total de vendas | Painel com total em € |
| 4 | Lista de faturas | Tabela + botão remover |
| 5 | Formulário | Adicionar fatura → lista e total atualizam |
| 6 | Remover e robustez | Confirmação + formatação |
| 7 | Melhorias | localStorage, acessibilidade, responsivo, numeração |

**Para um bom ERP (parte gráfica):** concluir pelo menos as Fases 1–6. A Fase 7 torna o projeto mais completo e demonstra atenção ao detalhe.

---

*Documento criado para alinhamento antes do desenvolvimento. Qualquer alteração ao modelo de dados ou funcionalidades pode ser feita aqui antes de codar.*
