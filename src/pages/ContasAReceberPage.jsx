import { useMemo, useState } from 'react'
import ModalAlterarEstadoFatura from '../components/faturas/ModalAlterarEstadoFatura'
import { formatarData, formatarMoeda, isFaturaEmAtraso } from '../utils/formatadores'
import { toCsv, downloadCsv } from '../utils/csvExport'

const PAGE_SIZE = 20
const FILTRO_TODAS = 'todas'
const FILTRO_ATRASO = 'atraso'
const FILTRO_VENCER = 'vencer'

const ORDENACAO_OPCOES = [
  { value: 'data-asc', label: 'Data (mais antiga)' },
  { value: 'data-desc', label: 'Data (mais recente)' },
  { value: 'valor-desc', label: 'Valor (maior)' },
  { value: 'valor-asc', label: 'Valor (menor)' },
  { value: 'cliente-asc', label: 'Cliente (A–Z)' },
  { value: 'cliente-desc', label: 'Cliente (Z–A)' },
]

const COLUNAS_CSV_EXPORT = [
  { key: 'numero', label: 'Nº' },
  { key: 'data', label: 'Data' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'valor', label: 'Valor' },
]

function ContasAReceberPage({ faturas = [], onEditarFatura, onNotificar, permissoes = {}, onAbrirFatura }) {
  const [faturaAAlterarEstado, setFaturaAAlterarEstado] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [filtro, setFiltro] = useState(FILTRO_TODAS)
  const [pesquisa, setPesquisa] = useState('')
  const [ordenacao, setOrdenacao] = useState('data-asc')

  /** Faturas a receber: Emitida (ainda no prazo) e Por pagar (em cobrança/em atraso). */
  const porPagar = useMemo(
    () =>
      faturas
        .filter((f) => {
          const e = (f.estado || '').trim()
          return e === 'Emitida' || e === 'Por pagar'
        })
        .sort((a, b) => new Date(a.data || 0).getTime() - new Date(b.data || 0).getTime()),
    [faturas]
  )

  const emAtraso = useMemo(() => porPagar.filter(isFaturaEmAtraso), [porPagar])
  const aVencer = useMemo(() => porPagar.filter((f) => !isFaturaEmAtraso(f)), [porPagar])
  const total = useMemo(() => porPagar.reduce((sum, f) => sum + (f.valor ?? 0), 0), [porPagar])
  const totalEmAtraso = useMemo(() => emAtraso.reduce((sum, f) => sum + (f.valor ?? 0), 0), [emAtraso])
  const totalAVencer = useMemo(() => aVencer.reduce((sum, f) => sum + (f.valor ?? 0), 0), [aVencer])

  const listaFiltrada = useMemo(() => {
    let base =
      filtro === FILTRO_ATRASO ? emAtraso : filtro === FILTRO_VENCER ? aVencer : porPagar
    const q = (pesquisa || '').trim().toLowerCase()
    if (q) {
      base = base.filter(
        (f) =>
          (f.numero != null && String(f.numero).toLowerCase().includes(q)) ||
          (f.cliente != null && String(f.cliente).toLowerCase().includes(q))
      )
    }
    const [campo, dir] = ordenacao.split('-')
    return [...base].sort((a, b) => {
      if (campo === 'data') {
        const ta = new Date(a.data || 0).getTime()
        const tb = new Date(b.data || 0).getTime()
        return dir === 'asc' ? ta - tb : tb - ta
      }
      if (campo === 'valor') {
        const va = a.valor ?? 0
        const vb = b.valor ?? 0
        return dir === 'asc' ? va - vb : vb - va
      }
      if (campo === 'cliente') {
        const ca = (a.cliente || '').toLowerCase()
        const cb = (b.cliente || '').toLowerCase()
        const cmp = ca.localeCompare(cb)
        return dir === 'asc' ? cmp : -cmp
      }
      return 0
    })
  }, [porPagar, emAtraso, aVencer, filtro, pesquisa, ordenacao])

  const porPagarVisiveis = useMemo(
    () => listaFiltrada.slice(0, visibleCount),
    [listaFiltrada, visibleCount]
  )
  const temMais = visibleCount < listaFiltrada.length
  const canAlterarEstado = permissoes.canMarcarFaturaPaga || permissoes.canMarcarFaturaAnulada

  const handleExportarCsv = () => {
    const dados = listaFiltrada.map((f) => ({
      numero: f.numero,
      data: formatarData(f.data),
      cliente: f.cliente,
      valor: formatarMoeda(f.valor),
    }))
    const csv = toCsv(dados, COLUNAS_CSV_EXPORT)
    downloadCsv(csv, 'contas-a-receber.csv')
    onNotificar?.('Exportação concluída.')
  }

  const handleFiltroFromCard = (novoFiltro) => {
    setFiltro(novoFiltro)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className="contas-a-receber">
      <h2 className="contas-a-receber__titulo">Contas a receber</h2>

      <div className="contas-a-receber__cards">
        <button
          type="button"
          className={`contas-a-receber__card ${filtro === FILTRO_TODAS ? 'contas-a-receber__card--ativo' : ''}`}
          onClick={() => handleFiltroFromCard(FILTRO_TODAS)}
          aria-pressed={filtro === FILTRO_TODAS}
        >
          <span className="contas-a-receber__card-label">Total por cobrar</span>
          <span className="contas-a-receber__card-valor">{formatarMoeda(total)}</span>
          <span className="contas-a-receber__card-count">{porPagar.length} fatura{porPagar.length !== 1 ? 's' : ''}</span>
        </button>
        <button
          type="button"
          className={`contas-a-receber__card contas-a-receber__card--atraso ${filtro === FILTRO_ATRASO ? 'contas-a-receber__card--ativo' : ''}`}
          onClick={() => handleFiltroFromCard(FILTRO_ATRASO)}
          aria-pressed={filtro === FILTRO_ATRASO}
          disabled={emAtraso.length === 0}
        >
          <span className="contas-a-receber__card-label">Em atraso</span>
          <span className="contas-a-receber__card-valor">{formatarMoeda(totalEmAtraso)}</span>
          <span className="contas-a-receber__card-count">{emAtraso.length} fatura{emAtraso.length !== 1 ? 's' : ''}</span>
        </button>
        <button
          type="button"
          className={`contas-a-receber__card contas-a-receber__card--vencer ${filtro === FILTRO_VENCER ? 'contas-a-receber__card--ativo' : ''}`}
          onClick={() => handleFiltroFromCard(FILTRO_VENCER)}
          aria-pressed={filtro === FILTRO_VENCER}
          disabled={aVencer.length === 0}
        >
          <span className="contas-a-receber__card-label">A vencer</span>
          <span className="contas-a-receber__card-valor">{formatarMoeda(totalAVencer)}</span>
          <span className="contas-a-receber__card-count">{aVencer.length} fatura{aVencer.length !== 1 ? 's' : ''}</span>
        </button>
      </div>

      {porPagar.length === 0 ? (
        <p className="lista-faturas__vazia lista-faturas__vazia--destaque">Não há faturas por pagar.</p>
      ) : (
        <>
          <div className="contas-a-receber__toolbar">
            <div className="contas-a-receber__filtros-tabs">
              <button
                type="button"
                className={`contas-a-receber__tab ${filtro === FILTRO_TODAS ? 'contas-a-receber__tab--ativo' : ''}`}
                onClick={() => { setFiltro(FILTRO_TODAS); setVisibleCount(PAGE_SIZE); }}
              >
                Todas
              </button>
              <button
                type="button"
                className={`contas-a-receber__tab ${filtro === FILTRO_ATRASO ? 'contas-a-receber__tab--ativo' : ''}`}
                onClick={() => { setFiltro(FILTRO_ATRASO); setVisibleCount(PAGE_SIZE); }}
                disabled={emAtraso.length === 0}
              >
                Em atraso ({emAtraso.length})
              </button>
              <button
                type="button"
                className={`contas-a-receber__tab ${filtro === FILTRO_VENCER ? 'contas-a-receber__tab--ativo' : ''}`}
                onClick={() => { setFiltro(FILTRO_VENCER); setVisibleCount(PAGE_SIZE); }}
                disabled={aVencer.length === 0}
              >
                A vencer ({aVencer.length})
              </button>
            </div>
            <div className="contas-a-receber__toolbar-direita">
              <label className="contas-a-receber__pesquisa-wrap">
                <span className="contas-a-receber__pesquisa-label">Pesquisar</span>
                <input
                  type="search"
                  className="contas-a-receber__pesquisa"
                  placeholder="Nº ou cliente..."
                  value={pesquisa}
                  onChange={(e) => { setPesquisa(e.target.value); setVisibleCount(PAGE_SIZE); }}
                  aria-label="Pesquisar por número ou cliente"
                />
              </label>
              <label className="contas-a-receber__ordenar-wrap">
                <span className="contas-a-receber__ordenar-label">Ordenar</span>
                <select
                  className="contas-a-receber__ordenar"
                  value={ordenacao}
                  onChange={(e) => { setOrdenacao(e.target.value); setVisibleCount(PAGE_SIZE); }}
                  aria-label="Ordenar lista"
                >
                  {ORDENACAO_OPCOES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="contas-a-receber__btn contas-a-receber__btn--export"
                onClick={handleExportarCsv}
                aria-label="Exportar para CSV"
              >
                Exportar CSV
              </button>
            </div>
          </div>

          <div className="contas-a-receber__tabela-card lista-faturas">
            <div className="lista-faturas__wrapper">
              <table className="lista-faturas__tabela">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th className="lista-faturas__valor">Valor</th>
                    {(canAlterarEstado || onAbrirFatura) && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {listaFiltrada.length === 0 ? (
                    <tr>
                      <td colSpan={canAlterarEstado || onAbrirFatura ? 5 : 4} className="lista-faturas__vazia-celula">
                        Nenhuma fatura corresponde aos filtros.
                      </td>
                    </tr>
                  ) : (
                    porPagarVisiveis.map((f) => {
                      const atraso = isFaturaEmAtraso(f)
                      return (
                        <tr
                          key={f.id}
                          className={`${atraso ? 'lista-faturas__linha--atraso' : ''} ${onAbrirFatura ? 'contas-a-receber__linha-clicavel' : ''}`}
                          onClick={onAbrirFatura ? () => onAbrirFatura(f) : undefined}
                          role={onAbrirFatura ? 'button' : undefined}
                          tabIndex={onAbrirFatura ? 0 : undefined}
                          onKeyDown={onAbrirFatura ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAbrirFatura(f); } } : undefined}
                        >
                          <td>{f.numero}</td>
                          <td>
                            {formatarData(f.data)}
                            {atraso && <span className="lista-faturas__badge lista-faturas__badge--atraso">Em atraso</span>}
                          </td>
                          <td>{f.cliente}</td>
                          <td className="lista-faturas__valor">{formatarMoeda(f.valor)}</td>
                          {(canAlterarEstado || onAbrirFatura) && (
                            <td className="lista-faturas__td-acoes" onClick={(e) => e.stopPropagation()}>
                              <div className="lista-faturas__acoes-celula">
                                {onAbrirFatura && (
                                  <button
                                    type="button"
                                    className="lista-faturas__btn lista-faturas__btn--editar"
                                    onClick={() => onAbrirFatura(f)}
                                    aria-label={`Ver fatura ${f.numero}`}
                                  >
                                    Ver
                                  </button>
                                )}
                                {canAlterarEstado && (
                                  <button
                                    type="button"
                                    className="lista-faturas__btn lista-faturas__btn--estado"
                                    onClick={() => setFaturaAAlterarEstado(f)}
                                    aria-label={`Alterar estado da fatura ${f.numero}`}
                                  >
                                    Alterar estado
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            {temMais && (
              <div className="lista-faturas__carregar-mais">
                <button
                  type="button"
                  className="lista-faturas__btn lista-faturas__btn--carregar"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  aria-label="Carregar mais faturas"
                >
                  Carregar mais ({listaFiltrada.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <ModalAlterarEstadoFatura
        fatura={faturaAAlterarEstado}
        estadosPermitidos={permissoes.getEstadosPermitidosParaAlterar?.() ?? []}
        onGuardar={(dados) => {
          onEditarFatura?.(dados.id, { estado: dados.estado, justificacao: dados.justificacao ?? '' })
          onNotificar?.('Estado da fatura atualizado.')
          setFaturaAAlterarEstado(null)
        }}
        onFechar={() => setFaturaAAlterarEstado(null)}
      />
    </div>
  )
}

export default ContasAReceberPage
