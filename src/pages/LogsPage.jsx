import { useState, useEffect, useMemo } from 'react'
import { getLogs, clearLogs } from '../storage'
import ConfirmModal from '../components/ui/ConfirmModal'
import { labelRole } from '../constants/roles'
import { formatarDataHora } from '../utils/formatadores'

const ACOES_LOG = ['', 'criar', 'editar', 'remover']
const PAGE_SIZE = 20

function LogsPage() {
  const [logs, setLogs] = useState([])
  const [confirmarLimpar, setConfirmarLimpar] = useState(false)
  const [filtroUser, setFiltroUser] = useState('')
  const [filtroDataDe, setFiltroDataDe] = useState('')
  const [filtroDataAte, setFiltroDataAte] = useState('')
  const [filtroAction, setFiltroAction] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const recarregar = () => setLogs(getLogs())

  useEffect(() => {
    recarregar()
  }, [])

  const logsFiltrados = useMemo(() => {
    let list = [...logs]
    if (filtroUser.trim()) {
      const p = filtroUser.trim().toLowerCase()
      list = list.filter((l) => (l.userEmail || '').toLowerCase().includes(p))
    }
    if (filtroDataDe) {
      list = list.filter((l) => (l.timestamp || '').slice(0, 10) >= filtroDataDe)
    }
    if (filtroDataAte) {
      list = list.filter((l) => (l.timestamp || '').slice(0, 10) <= filtroDataAte)
    }
    if (filtroAction) {
      list = list.filter((l) => (l.action || '') === filtroAction)
    }
    return list
  }, [logs, filtroUser, filtroDataDe, filtroDataAte, filtroAction])

  const logsVisiveis = useMemo(
    () => logsFiltrados.slice(0, visibleCount),
    [logsFiltrados, visibleCount]
  )
  const temMais = visibleCount < logsFiltrados.length

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filtroUser, filtroDataDe, filtroDataAte, filtroAction])

  const utilizadoresUnicos = useMemo(() => {
    const set = new Set(logs.map((l) => l.userEmail).filter(Boolean))
    return [...set].sort()
  }, [logs])

  const handleLimparLogs = () => {
    clearLogs()
    setConfirmarLimpar(false)
    recarregar()
  }

  const labelAction = (action) => {
    const map = { criar: 'Criar', editar: 'Editar', remover: 'Remover' }
    return map[action] || action
  }

  const labelEntity = (entity) => {
    const map = { fatura: 'Fatura', cliente: 'Cliente' }
    return map[entity] || entity
  }

  return (
    <div className="logs-page">
      <div className="logs-page__cabecalho">
        <div>
          <h2 className="logs-page__titulo">Histórico de ações</h2>
          <p className="logs-page__descricao">Últimas ações realizadas na aplicação (apenas visível para administradores).</p>
        </div>
        {logs.length > 0 && (
          <button
            type="button"
            className="logs-page__limpar"
            onClick={() => setConfirmarLimpar(true)}
          >
            Limpar logs
          </button>
        )}
      </div>

      {logs.length > 0 && (
        <div className="lista-faturas__toolbar" style={{ marginBottom: '1rem' }}>
          <div className="lista-faturas__campo-pesquisa">
            <label htmlFor="logs-user" className="lista-faturas__label-pesquisa">Utilizador</label>
            <input
              id="logs-user"
              type="text"
              className="lista-faturas__pesquisa"
              placeholder="Filtrar por email..."
              value={filtroUser}
              onChange={(e) => setFiltroUser(e.target.value)}
              list="logs-user-list"
            />
            <datalist id="logs-user-list">
              {utilizadoresUnicos.map((email) => (
                <option key={email} value={email} />
              ))}
            </datalist>
          </div>
          <div className="lista-faturas__campo-data">
            <label htmlFor="logs-data-de" className="lista-faturas__label-pesquisa">Data de</label>
            <input id="logs-data-de" type="date" className="lista-faturas__input-data" value={filtroDataDe} onChange={(e) => setFiltroDataDe(e.target.value)} />
          </div>
          <div className="lista-faturas__campo-data">
            <label htmlFor="logs-data-ate" className="lista-faturas__label-pesquisa">Data até</label>
            <input id="logs-data-ate" type="date" className="lista-faturas__input-data" value={filtroDataAte} onChange={(e) => setFiltroDataAte(e.target.value)} />
          </div>
          <div className="lista-faturas__campo-filtro">
            <label htmlFor="logs-action" className="lista-faturas__label-pesquisa">Ação</label>
            <select id="logs-action" className="lista-faturas__select" value={filtroAction} onChange={(e) => setFiltroAction(e.target.value)}>
              <option value="">Todas</option>
              {ACOES_LOG.filter(Boolean).map((a) => (
                <option key={a} value={a}>{labelAction(a)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {logsFiltrados.length === 0 ? (
        <p className="lista-faturas__vazia">{logs.length === 0 ? 'Ainda não há registos.' : 'Nenhum log encontrado com os filtros aplicados.'}</p>
      ) : (
        <div className="lista-faturas__wrapper">
          <table className="lista-faturas__tabela">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Utilizador</th>
                <th>Role</th>
                <th>Ação</th>
                <th>Entidade</th>
                <th>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {logsVisiveis.map((l) => (
                <tr key={l.id}>
                  <td>{formatarDataHora(l.timestamp)}</td>
                  <td>{l.userEmail ?? '—'}</td>
                  <td>{labelRole(l.role)}</td>
                  <td>{labelAction(l.action)}</td>
                  <td>{labelEntity(l.entity)}</td>
                  <td>{l.detalhe ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {temMais && (
            <div className="lista-faturas__carregar-mais">
              <button
                type="button"
                className="lista-faturas__btn lista-faturas__btn--carregar"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                aria-label="Carregar mais registos"
              >
                Carregar mais ({logsFiltrados.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        aberto={confirmarLimpar}
        titulo="Limpar logs"
        mensagem="Tem a certeza que deseja apagar todo o histórico de logs?"
        confirmarLabel="Limpar"
        cancelarLabel="Cancelar"
        perigo
        onConfirmar={handleLimparLogs}
        onCancelar={() => setConfirmarLimpar(false)}
      />
    </div>
  )
}

export default LogsPage
