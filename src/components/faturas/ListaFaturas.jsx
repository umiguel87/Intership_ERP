import { useState, useMemo, useEffect } from 'react'
import ConfirmModal from '../ui/ConfirmModal'
import ModalEditarFatura from './ModalEditarFatura'
import ModalAlterarEstadoFatura from './ModalAlterarEstadoFatura'
import FaturaPrintView from './FaturaPrintView'
import { toCsv, downloadCsv } from '../../utils/csvExport'
import { getProximoNumeroFatura } from '../../utils/numeroFatura'
import { formatarData, formatarMoeda } from '../../utils/formatadores'
import { ESTADOS_FATURA } from '../../constants/roles'

const OPCOES_ESTADO = ['', ...ESTADOS_FATURA]
const OPCOES_ORDENAR = [
  { value: 'data-desc', label: 'Data (mais recente)' },
  { value: 'data-asc', label: 'Data (mais antiga)' },
  { value: 'numero-asc', label: 'Número (A–Z)' },
  { value: 'numero-desc', label: 'Número (Z–A)' },
  { value: 'valor-desc', label: 'Valor (maior)' },
  { value: 'valor-asc', label: 'Valor (menor)' },
  { value: 'cliente-asc', label: 'Cliente (A–Z)' },
  { value: 'cliente-desc', label: 'Cliente (Z–A)' },
  { value: 'estado-asc', label: 'Estado (A–Z)' },
  { value: 'estado-desc', label: 'Estado (Z–A)' },
]

function ListaFaturas({ faturas = [], clientes = [], initialPesquisa, onInitialPesquisaAplicada, faturaDetalheFromSearch, onFaturaDetalheFromSearchClear, onRemover, onEditarFatura, onAdicionar, onNotificar, permissoes = {} }) {
  const canCriarFatura = permissoes.canCriarFatura

  const [pesquisa, setPesquisa] = useState('')

  useEffect(() => {
    if (initialPesquisa != null && initialPesquisa !== '') {
      setPesquisa(initialPesquisa)
      onInitialPesquisaAplicada?.()
    }
  }, [initialPesquisa, onInitialPesquisaAplicada])

  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [dataDe, setDataDe] = useState('')
  const [dataAte, setDataAte] = useState('')
  const [ordenar, setOrdenar] = useState('data-desc')
  const [confirmRemoverId, setConfirmRemoverId] = useState(null)
  const [faturaAEditar, setFaturaAEditar] = useState(null)
  const [faturaAImprimir, setFaturaAImprimir] = useState(null)
  const [faturaAAlterarEstado, setFaturaAAlterarEstado] = useState(null)

  useEffect(() => {
    if (faturaDetalheFromSearch) {
      setFaturaAImprimir(faturaDetalheFromSearch)
      onFaturaDetalheFromSearchClear?.()
    }
  }, [faturaDetalheFromSearch, onFaturaDetalheFromSearchClear])

  const faturasFiltradasEOrdenadas = useMemo(() => {
    let list = [...faturas]
    const p = pesquisa.trim().toLowerCase()
    if (p) {
      list = list.filter(
        (f) =>
          (f.numero || '').toLowerCase().includes(p) ||
          (f.cliente || '').toLowerCase().includes(p)
      )
    }
    if (filtroEstado) {
      list = list.filter((f) => (f.estado || '') === filtroEstado)
    }
    if (filtroCliente) {
      list = list.filter((f) => (f.cliente || '') === filtroCliente)
    }
    if (dataDe) {
      list = list.filter((f) => (f.data || '') >= dataDe)
    }
    if (dataAte) {
      list = list.filter((f) => (f.data || '') <= dataAte)
    }
    const [campo, sentido] = ordenar.split('-')
    const asc = sentido === 'asc'
    list.sort((a, b) => {
      let va = a[campo]
      let vb = b[campo]
      if (campo === 'data') {
        va = new Date(va).getTime()
        vb = new Date(vb).getTime()
      }
      if (campo === 'valor') {
        va = Number(va)
        vb = Number(vb)
      }
      if (campo === 'numero' || campo === 'cliente' || campo === 'estado') {
        va = (va || '').toString().toLowerCase()
        vb = (vb || '').toString().toLowerCase()
        return asc ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      if (va === vb) return 0
      return asc ? (va < vb ? -1 : 1) : va > vb ? -1 : 1
    })
    return list
  }, [faturas, pesquisa, filtroEstado, filtroCliente, dataDe, dataAte, ordenar])

  const mostrarTabela = faturasFiltradasEOrdenadas.length > 0
  const semDados = faturas.length === 0
  const semResultados = faturas.length > 0 && faturasFiltradasEOrdenadas.length === 0

  const colunasFaturas = [
    { key: 'numero', label: 'Número' },
    { key: 'data', label: 'Data' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'valor', label: 'Valor' },
    { key: 'estado', label: 'Estado' },
  ]

  const handleExportarCsv = () => {
    const lista = faturasFiltradasEOrdenadas.length > 0 ? faturasFiltradasEOrdenadas : faturas
    const csv = toCsv(lista, colunasFaturas)
    const nome = `faturas_${new Date().toISOString().slice(0, 10)}.csv`
    downloadCsv(csv, nome)
    onNotificar?.('Ficheiro CSV descarregado.')
  }

  const handleDuplicar = (f) => {
    if (!canCriarFatura || !onAdicionar) return
    const novaFatura = {
      id: crypto.randomUUID(),
      numero: getProximoNumeroFatura(faturas),
      data: new Date().toISOString().slice(0, 10),
      cliente: f.cliente || '',
      valor: f.valor ?? 0,
      estado: 'Por pagar',
    }
    onAdicionar(novaFatura)
    onNotificar?.('Fatura duplicada.')
  }

  return (
    <section className="lista-faturas">
      <h2 className="lista-faturas__titulo">Faturas</h2>

      <div className="lista-faturas__toolbar">
        <div className="lista-faturas__campo-pesquisa">
          <label htmlFor="pesquisa-faturas" className="lista-faturas__label-pesquisa">
            Pesquisar
          </label>
          <input
            id="pesquisa-faturas"
            type="search"
            className="lista-faturas__pesquisa"
            placeholder="Número ou cliente..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            aria-label="Pesquisar por número ou nome do cliente"
          />
        </div>
        <div className="lista-faturas__campo-filtro">
          <label htmlFor="filtro-cliente-faturas" className="lista-faturas__label-pesquisa">
            Cliente
          </label>
          <select
            id="filtro-cliente-faturas"
            className="lista-faturas__select"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            aria-label="Filtrar por cliente"
          >
            <option value="">Todos</option>
            {[...clientes]
              .map((c) => c.nome)
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b))
              .map((nome) => (
                <option key={nome} value={nome}>{nome}</option>
              ))}
          </select>
        </div>
        <div className="lista-faturas__campo-filtro">
          <label htmlFor="filtro-estado-faturas" className="lista-faturas__label-pesquisa">
            Estado
          </label>
          <select
            id="filtro-estado-faturas"
            className="lista-faturas__select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos</option>
            {OPCOES_ESTADO.filter(Boolean).map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>
        <div className="lista-faturas__campo-data">
          <label htmlFor="filtro-data-de" className="lista-faturas__label-pesquisa">
            Data de
          </label>
          <input
            id="filtro-data-de"
            type="date"
            className="lista-faturas__input-data"
            value={dataDe}
            onChange={(e) => setDataDe(e.target.value)}
            aria-label="Filtrar a partir da data"
          />
        </div>
        <div className="lista-faturas__campo-data">
          <label htmlFor="filtro-data-ate" className="lista-faturas__label-pesquisa">
            Data até
          </label>
          <input
            id="filtro-data-ate"
            type="date"
            className="lista-faturas__input-data"
            value={dataAte}
            onChange={(e) => setDataAte(e.target.value)}
            aria-label="Filtrar até à data"
          />
        </div>
        <div className="lista-faturas__campo-ordem">
          <label htmlFor="ordenar-faturas" className="lista-faturas__label-pesquisa">
            Ordenar
          </label>
          <select
            id="ordenar-faturas"
            className="lista-faturas__select"
            value={ordenar}
            onChange={(e) => setOrdenar(e.target.value)}
            aria-label="Ordenar tabela"
          >
            {OPCOES_ORDENAR.map((op) => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>
        <div className="lista-faturas__campo-export">
          <button
            type="button"
            className="lista-faturas__btn lista-faturas__btn--export"
            onClick={handleExportarCsv}
            aria-label="Exportar lista em CSV"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {semDados && (
        <p className="lista-faturas__vazia lista-faturas__vazia--destaque">Ainda não há faturas.</p>
      )}

      {semResultados && (
        <p className="lista-faturas__vazia">Nenhuma fatura encontrada.</p>
      )}

      {mostrarTabela && (
        <div className="lista-faturas__wrapper">
          <table className="lista-faturas__tabela">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Data</th>
                <th>Cliente</th>
                <th className="lista-faturas__valor">Valor</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {faturasFiltradasEOrdenadas.map((f) => {
                const estado = (f.estado || '').trim()
                const isPaga = estado === 'Paga'
                const isAnulada = estado === 'Anulada'
                const canEditar = typeof permissoes.canEditarFatura === 'function' ? permissoes.canEditarFatura(f) : permissoes.canEditarFatura
                const canRemover = typeof permissoes.canRemoverFatura === 'function' ? permissoes.canRemoverFatura(f) : permissoes.canRemoverFatura
                const canAlterarEstado = typeof permissoes.canAlterarEstadoFatura === 'function' ? permissoes.canAlterarEstadoFatura(f) : permissoes.canAlterarEstadoFatura
                return (
                  <tr key={f.id} className={isPaga ? 'lista-faturas__linha--paga' : isAnulada ? 'lista-faturas__linha--anulada' : ''}>
                    <td>{f.numero}</td>
                    <td>{formatarData(f.data)}</td>
                    <td>{f.cliente}</td>
                    <td className="lista-faturas__valor">{formatarMoeda(f.valor)}</td>
                    <td>{f.estado || '—'}</td>
                    <td>
                      <div className="lista-faturas__acoes-celula">
                        {isAnulada ? (
                          <>
                            <button
                              type="button"
                              className="lista-faturas__btn lista-faturas__btn--imprimir"
                              onClick={() => setFaturaAImprimir(f)}
                              aria-label={`Descarregar PDF da fatura ${f.numero}`}
                            >
                              Descarregar PDF
                            </button>
                            {canCriarFatura && (
                              <button
                                type="button"
                                className="lista-faturas__btn lista-faturas__btn--duplicar"
                                onClick={() => handleDuplicar(f)}
                                aria-label={`Duplicar fatura ${f.numero}`}
                              >
                                Duplicar
                              </button>
                            )}
                          </>
                        ) : isPaga ? (
                          <>
                            {canAlterarEstado && (
                              <button
                                type="button"
                                className="lista-faturas__btn lista-faturas__btn--reativar"
                                onClick={() => {
                                  onEditarFatura?.(f.id, { estado: 'Por pagar', justificacao: '' })
                                  onNotificar?.('Fatura reativada.')
                                }}
                                aria-label={`Reativar fatura ${f.numero}`}
                              >
                                Reativar
                              </button>
                            )}
                            <button
                              type="button"
                              className="lista-faturas__btn lista-faturas__btn--imprimir"
                              onClick={() => setFaturaAImprimir(f)}
                              aria-label={`Descarregar PDF da fatura ${f.numero}`}
                            >
                              Descarregar PDF
                            </button>
                            {canCriarFatura && (
                              <button
                                type="button"
                                className="lista-faturas__btn lista-faturas__btn--duplicar"
                                onClick={() => handleDuplicar(f)}
                                aria-label={`Duplicar fatura ${f.numero}`}
                              >
                                Duplicar
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {canEditar && (
                              <button
                                type="button"
                                className="lista-faturas__btn lista-faturas__btn--editar"
                                onClick={() => setFaturaAEditar(f)}
                                aria-label={`Editar fatura ${f.numero}`}
                              >
                                Editar
                              </button>
                            )}
                            <button
                              type="button"
                              className="lista-faturas__btn lista-faturas__btn--imprimir"
                              onClick={() => setFaturaAImprimir(f)}
                              aria-label={`Descarregar PDF da fatura ${f.numero}`}
                            >
                              Descarregar PDF
                            </button>
                            {canCriarFatura && (
                              <button
                                type="button"
                                className="lista-faturas__btn lista-faturas__btn--duplicar"
                                onClick={() => handleDuplicar(f)}
                                aria-label={`Duplicar fatura ${f.numero}`}
                              >
                                Duplicar
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
                          </>
                        )}
                        {!isAnulada && canRemover && (
                          <button
                            type="button"
                            className="lista-faturas__remover"
                            onClick={() => setConfirmRemoverId(f.id)}
                            aria-label={`Remover fatura ${f.numero}`}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        aberto={!!confirmRemoverId}
        titulo="Remover fatura"
        mensagem="Tem a certeza que deseja remover esta fatura?"
        confirmarLabel="Remover"
        cancelarLabel="Cancelar"
        perigo
        onConfirmar={() => {
          onRemover?.(confirmRemoverId)
          onNotificar?.('Fatura removida.')
          setConfirmRemoverId(null)
        }}
        onCancelar={() => setConfirmRemoverId(null)}
      />

      <ModalEditarFatura
        fatura={faturaAEditar}
        clientes={clientes}
        estadosPermitidos={permissoes.getEstadosPermitidosParaAlterar?.() ?? []}
        confirmarEditarAnulada={permissoes.isAdmin}
        onGuardar={(dados) => {
          onEditarFatura?.(dados.id, dados)
          onNotificar?.('Fatura guardada.')
          setFaturaAEditar(null)
        }}
        onFechar={() => setFaturaAEditar(null)}
      />

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

      <FaturaPrintView fatura={faturaAImprimir} onFechar={() => setFaturaAImprimir(null)} />
    </section>
  )
}

export default ListaFaturas
