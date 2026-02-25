import { useState, useMemo, useEffect } from 'react'
import ConfirmModal from '../ui/ConfirmModal'
import ModalEditarCliente from './ModalEditarCliente'
import DetalheCliente from './DetalheCliente'
import { toCsv, downloadCsv } from '../../utils/csvExport'

const PAGE_SIZE = 20

const OPCOES_ORDENAR = [
  { value: 'nome-asc', label: 'Nome (A–Z)' },
  { value: 'nome-desc', label: 'Nome (Z–A)' },
  { value: 'email-asc', label: 'Email (A–Z)' },
  { value: 'email-desc', label: 'Email (Z–A)' },
  { value: 'nif-asc', label: 'NIF (A–Z)' },
  { value: 'nif-desc', label: 'NIF (Z–A)' },
]

function ListaClientes({ clientes = [], faturas = [], initialPesquisa, onInitialPesquisaAplicada, clienteDetalheFromSearch, onClienteDetalheFromSearchClear, onRemover, onEditarCliente, onNotificar, permissoes = {} }) {
  const canEditar = permissoes.canEditarCliente
  const canRemover = permissoes.canRemoverCliente
  const [pesquisa, setPesquisa] = useState('')
  const [ordenar, setOrdenar] = useState('nome-asc')
  const [confirmRemoverId, setConfirmRemoverId] = useState(null)
  const [clienteAEditar, setClienteAEditar] = useState(null)
  const [clienteADetalhe, setClienteADetalhe] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [pesquisa, ordenar])

  useEffect(() => {
    if (initialPesquisa != null && initialPesquisa !== '') {
      setPesquisa(initialPesquisa)
      onInitialPesquisaAplicada?.()
    }
  }, [initialPesquisa, onInitialPesquisaAplicada])

  useEffect(() => {
    if (clienteDetalheFromSearch) {
      setClienteADetalhe(clienteDetalheFromSearch)
      onClienteDetalheFromSearchClear?.()
    }
  }, [clienteDetalheFromSearch, onClienteDetalheFromSearchClear])

  const clientesFiltradosEOrdenados = useMemo(() => {
    let list = [...clientes]
    const p = pesquisa.trim().toLowerCase()
    if (p) {
      list = list.filter(
        (c) =>
          (c.nome || '').toLowerCase().includes(p) ||
          (c.email || '').toLowerCase().includes(p)
      )
    }
    const [campo, sentido] = ordenar.split('-')
    const asc = sentido === 'asc'
    list.sort((a, b) => {
      const va = (a[campo] || '').toString().toLowerCase()
      const vb = (b[campo] || '').toString().toLowerCase()
      return asc ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    return list
  }, [clientes, pesquisa, ordenar])

  const clientesVisiveis = useMemo(
    () => clientesFiltradosEOrdenados.slice(0, visibleCount),
    [clientesFiltradosEOrdenados, visibleCount]
  )
  const temMais = visibleCount < clientesFiltradosEOrdenados.length
  const mostrarTabela = clientesFiltradosEOrdenados.length > 0
  const semDados = clientes.length === 0
  const semResultados = clientes.length > 0 && clientesFiltradosEOrdenados.length === 0

  const colunasClientes = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'nif', label: 'NIF' },
  ]

  const handleExportarCsv = () => {
    const lista = clientesFiltradosEOrdenados.length > 0 ? clientesFiltradosEOrdenados : clientes
    const csv = toCsv(lista, colunasClientes)
    const nome = `clientes_${new Date().toISOString().slice(0, 10)}.csv`
    downloadCsv(csv, nome)
    onNotificar?.('Ficheiro CSV descarregado.')
  }

  return (
    <section className="lista-faturas lista-clientes">
      <h2 className="lista-faturas__titulo">Clientes</h2>

      <div className="lista-faturas__toolbar">
        <div className="lista-faturas__campo-pesquisa">
          <label htmlFor="pesquisa-clientes" className="lista-faturas__label-pesquisa">
            Pesquisar
          </label>
          <input
            id="pesquisa-clientes"
            type="search"
            className="lista-faturas__pesquisa"
            placeholder="Nome ou email..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            aria-label="Pesquisar por nome ou email"
          />
        </div>
        <div className="lista-faturas__campo-ordem">
          <label htmlFor="ordenar-clientes" className="lista-faturas__label-pesquisa">
            Ordenar
          </label>
          <select
            id="ordenar-clientes"
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
        <p className="lista-faturas__vazia lista-faturas__vazia--destaque">Ainda não há clientes.</p>
      )}

      {semResultados && (
        <p className="lista-faturas__vazia">Nenhum cliente encontrado.</p>
      )}

      {mostrarTabela && (
        <div className="lista-faturas__wrapper">
          <table className="lista-faturas__tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>NIF</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesVisiveis.map((c) => {
                const canRemoverEste = typeof permissoes.canRemoverEsteCliente === 'function' ? permissoes.canRemoverEsteCliente(c) : permissoes.canRemoverCliente
                return (
                  <tr
                    key={c.id}
                    className="lista-clientes__linha"
                    onClick={() => setClienteADetalhe(c)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setClienteADetalhe(c)
                      }
                    }}
                    aria-label={`Ver detalhes do cliente ${c.nome}`}
                  >
                    <td>{c.nome}</td>
                    <td>{c.email}</td>
                    <td>{c.nif || '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="lista-faturas__acoes-celula">
                        {canEditar && (
                          <button
                            type="button"
                            className="lista-faturas__btn lista-faturas__btn--editar"
                            onClick={() => setClienteAEditar(c)}
                            aria-label={`Editar cliente ${c.nome}`}
                          >
                            Editar
                          </button>
                        )}
                        {canRemoverEste && (
                          <button
                            type="button"
                            className="lista-faturas__remover"
                            onClick={() => setConfirmRemoverId(c.id)}
                            aria-label={`Remover cliente ${c.nome}`}
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
          {temMais && (
            <div className="lista-faturas__carregar-mais">
              <button
                type="button"
                className="lista-faturas__btn lista-faturas__btn--carregar"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                aria-label="Carregar mais clientes"
              >
                Carregar mais ({clientesFiltradosEOrdenados.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        aberto={!!confirmRemoverId}
        titulo="Remover cliente"
        mensagem="Tem a certeza que deseja remover este cliente?"
        confirmarLabel="Remover"
        cancelarLabel="Cancelar"
        perigo
        onConfirmar={() => {
          onRemover?.(confirmRemoverId)
          onNotificar?.('Cliente removido.')
          setConfirmRemoverId(null)
        }}
        onCancelar={() => setConfirmRemoverId(null)}
      />

      <ModalEditarCliente
        cliente={clienteAEditar}
        onGuardar={(dados) => {
          onEditarCliente?.(dados.id, dados)
          onNotificar?.('Cliente guardado.')
          setClienteAEditar(null)
        }}
        onFechar={() => setClienteAEditar(null)}
      />

      <DetalheCliente
        cliente={clienteADetalhe}
        faturas={faturas}
        onFechar={() => setClienteADetalhe(null)}
      />
    </section>
  )
}

export default ListaClientes
