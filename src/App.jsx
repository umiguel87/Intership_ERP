import { useState, useEffect, useRef, useMemo } from 'react'
import { getSession, setSession, getFaturas, setFaturas, getUsers, getClientes, setClientes, addLog, extendSessionIfNeeded } from './storage'
import { isSessionValid, INACTIVITY_TIMEOUT_MS } from './utils/security'
import { getProximoNumeroFatura } from './utils/numeroFatura'
import {
  ROLES,
  isAdmin,
  canCriarFatura,
  canRemoverFatura,
  canEditarFatura,
  canAlterarEstadoFatura,
  canMarcarFaturaPaga,
  canMarcarFaturaAnulada,
  getEstadosPermitidosParaAlterar,
  canCriarCliente,
  canEditarCliente,
  canRemoverCliente,
  canVerLogs,
  canVerDefinicoes,
  canVerContasAReceber,
} from './constants/roles'

const SECOES = {
  dashboard: { titulo: 'Dashboard', subtitulo: 'Visão geral do módulo de faturação' },
  faturas: { titulo: 'Faturas', subtitulo: 'Lista e nova fatura' },
  clientes: { titulo: 'Clientes', subtitulo: 'Gestão de clientes' },
  'contas-a-receber': { titulo: 'Contas a Receber', subtitulo: 'Faturas por pagar' },
  utilizadores: { titulo: 'Utilizadores', subtitulo: 'Gerir contas e perfis' },
  definicoes: { titulo: 'Definições', subtitulo: 'Backup e restauro' },
  logs: { titulo: 'Logs', subtitulo: 'Histórico de ações' },
}
import Sidebar from './components/layout/Sidebar'
import PesquisaGlobal from './components/layout/PesquisaGlobal'
import Toast from './components/ui/Toast'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import FaturasPage from './pages/FaturasPage'
import ClientesPage from './pages/ClientesPage'
import ContasAReceberPage from './pages/ContasAReceberPage'
import LogsPage from './pages/LogsPage'
import UtilizadoresPage from './pages/UtilizadoresPage'
import DefinicoesPage from './pages/DefinicoesPage'
import './App.css'

const STORAGE_DARK = 'erp-dark-mode'
const STORAGE_SIDEBAR_MIN = 'erp-sidebar-minimizado'

function App() {
  const [user, setUser] = useState(null)
  const [secaoAtiva, setSecaoAtiva] = useState('dashboard')
  const [faturas, setFaturasState] = useState([])
  const [clientes, setClientesState] = useState([])
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [pendingFaturaSearch, setPendingFaturaSearch] = useState(null)
  const [pendingClienteSearch, setPendingClienteSearch] = useState(null)
  const [faturaDetalheFromSearch, setFaturaDetalheFromSearch] = useState(null)
  const [clienteDetalheFromSearch, setClienteDetalheFromSearch] = useState(null)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(STORAGE_DARK) === '1')
  const [sidebarMinimizado, setSidebarMinimizado] = useState(() => localStorage.getItem(STORAGE_SIDEBAR_MIN) === '1')
  const inicialLoadFeito = useRef(false)
  const inicialLoadClientesFeito = useRef(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_DARK, darkMode ? '1' : '0')
    document.body.classList.toggle('theme-dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem(STORAGE_SIDEBAR_MIN, sidebarMinimizado ? '1' : '0')
  }, [sidebarMinimizado])

  // Restaurar sessão ao carregar (só se válida e não expirada)
  useEffect(() => {
    const session = getSession()
    if (!isSessionValid(session)) {
      setSession(null)
      return
    }
    const users = getUsers()
    const byCodigo = (x) => x.codigo && String(x.codigo).trim().toUpperCase() === String(session.codigo || '').trim().toUpperCase()
    const byEmail = (x) => session.email && x.email && x.email.toLowerCase() === session.email.toLowerCase()
    const u = session?.codigo
      ? users.find(byCodigo)
      : session?.email
        ? users.find(byEmail)
        : null
    if (u && u.ativo !== false) {
      const role = u.role && ROLES.includes(u.role) ? u.role : 'comercial'
      setUser({ id: u.id, nome: u.nome, email: u.email, codigo: u.codigo, role })
      // Migrar sessão antiga (email) para codigo
      if (session.email && u.codigo) {
        setSession({ codigo: u.codigo, expiresAt: session.expiresAt })
      }
    } else {
      setSession(null)
    }
  }, [])

  // Logout por inatividade (30 min sem interação) e renovação da sessão em atividade
  useEffect(() => {
    if (!user) return
    let timeoutId = null
    const resetTimer = () => {
      extendSessionIfNeeded()
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setSession(null)
        setUser(null)
      }, INACTIVITY_TIMEOUT_MS)
    }
    resetTimer()
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((ev) => window.addEventListener(ev, resetTimer))
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach((ev) => window.removeEventListener(ev, resetTimer))
    }
  }, [user])

  // Carregar faturas (globais) quando o utilizador está logado
  useEffect(() => {
    if (user) {
      setFaturasState(getFaturas())
      inicialLoadFeito.current = false
    } else {
      setFaturasState([])
    }
  }, [user])

  // Carregar clientes (globais) quando o utilizador está logado
  useEffect(() => {
    if (user) {
      setClientesState(getClientes())
      inicialLoadClientesFeito.current = false
    } else {
      setClientesState([])
    }
  }, [user])

  // Guardar faturas no localStorage quando mudam (dados globais, todos veem o mesmo)
  useEffect(() => {
    if (!user) return
    if (!inicialLoadFeito.current) {
      inicialLoadFeito.current = true
      return
    }
    setFaturas(faturas)
  }, [user, faturas])

  // Guardar clientes no localStorage quando mudam
  useEffect(() => {
    if (!user) return
    if (!inicialLoadClientesFeito.current) {
      inicialLoadClientesFeito.current = true
      return
    }
    setClientes(clientes)
  }, [user, clientes])

  const handleLogin = (loggedUser) => {
    setUser(loggedUser)
    setSecaoAtiva('dashboard')
  }

  const handleLogout = () => {
    setSession(null)
    setUser(null)
  }

  const faturasList = useMemo(() => {
    const list = Array.isArray(faturas) ? faturas : []
    if (user?.role === 'financeiro') return list.filter((f) => f.createdBy === user?.id)
    return list
  }, [faturas, user?.role, user?.id])
  const totalVendas = useMemo(
    () =>
      faturasList
        .filter((f) => {
          const e = (f.estado || '').trim()
          return e !== 'Rascunho' && e !== 'Anulada'
        })
        .reduce((sum, f) => sum + (f.valor ?? 0), 0),
    [faturasList]
  )
  const totalPorPagar = useMemo(
    () => faturasList.filter((f) => (f.estado || '').trim() === 'Por pagar').reduce((sum, f) => sum + (f.valor ?? 0), 0),
    [faturasList]
  )
  const totalPago = useMemo(
    () => faturasList.filter((f) => (f.estado || '').trim() === 'Paga').reduce((sum, f) => sum + (f.valor ?? 0), 0),
    [faturasList]
  )
  const numFaturasPorPagar = useMemo(
    () => faturasList.filter((f) => (f.estado || '').trim() === 'Por pagar').length,
    [faturasList]
  )
  const hoje = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const faturasEmAtraso = useMemo(
    () =>
      faturasList.filter(
        (f) => (f.estado || '').trim() === 'Por pagar' && (f.data || '').slice(0, 10) < hoje
      ),
    [faturasList, hoje]
  )
  const numFaturasEmAtraso = faturasEmAtraso.length
  const totalEmAtraso = useMemo(
    () => faturasEmAtraso.reduce((sum, f) => sum + (f.valor ?? 0), 0),
    [faturasEmAtraso]
  )

  const log = (action, entity, entityId, detalhe) => {
    addLog({
      userNome: user?.nome,
      userCodigo: user?.codigo,
      userEmail: user?.email,
      role: user?.role,
      action,
      entity,
      entityId,
      detalhe,
    })
  }

  const adicionarFatura = (novaFatura) => {
    if (!canCriarFatura(user?.role)) {
      notificar('Sem permissão para criar faturas.', 'error')
      return
    }
    const comCriador = { ...novaFatura, createdBy: user?.id }
    setFaturasState((prev) => [...prev, comCriador])
    log('criar', 'fatura', novaFatura.id, novaFatura.numero ? `Fatura ${novaFatura.numero}` : 'Rascunho de fatura')
  }

  const removerFatura = (id) => {
    const f = faturas.find((x) => x.id === id)
    if (!canRemoverFatura(user?.role, f?.estado)) {
      notificar('Sem permissão para remover esta fatura.', 'error')
      return
    }
    setFaturasState((prev) => prev.filter((x) => x.id !== id))
    log('remover', 'fatura', id, f ? (f.numero ? `Fatura ${f.numero}` : 'Rascunho') : '')
  }

  const editarFatura = (id, dados) => {
    const f = faturas.find((x) => x.id === id)
    const soEstado = dados.estado != null && Object.keys(dados).every((k) => k === 'estado' || k === 'justificacao')
    if (soEstado) {
      const estadosPermitidos = getEstadosPermitidosParaAlterar(user?.role)
      if (!estadosPermitidos.includes(dados.estado) || !canAlterarEstadoFatura(user?.role, f?.estado)) {
        notificar('Sem permissão para alterar estado da fatura.', 'error')
        return
      }
      if (dados.estado === 'Emitida') {
        if (!(f?.numero || '').trim()) dados = { ...dados, numero: getProximoNumeroFatura(faturas) }
        dados = { ...dados, dataEmissao: new Date().toISOString(), emitidoPor: user?.id }
      }
      if (dados.estado === 'Paga') {
        dados = { ...dados, dataPagamento: new Date().toISOString(), pagoPor: user?.id }
      }
    } else {
      if (!canEditarFatura(user?.role, f?.estado)) {
        notificar('Sem permissão para editar esta fatura.', 'error')
        return
      }
    }
    setFaturasState((prev) => prev.map((x) => (x.id === id ? { ...x, ...dados } : x)))
    const detalheLog = soEstado ? `Estado: ${(f?.estado || '')} → ${dados.estado}${dados.numero ? ` (nº ${dados.numero})` : ''}` : 'Dados atualizados'
    log('editar', 'fatura', id, detalheLog)
  }

  const adicionarCliente = (novoCliente) => {
    if (!canCriarCliente(user?.role)) {
      notificar('Sem permissão para adicionar clientes.', 'error')
      return
    }
    setClientesState((prev) => [...prev, novoCliente])
    log('criar', 'cliente', novoCliente.id, novoCliente.nome)
  }

  const removerCliente = (id) => {
    if (!canRemoverCliente(user?.role)) {
      notificar('Sem permissão para remover clientes.', 'error')
      return
    }
    const c = clientes.find((x) => x.id === id)
    if (c) {
      const nomeCliente = (c.nome || '').trim()
      const temFaturas = nomeCliente && faturas.some((f) => (f.cliente || '').trim() === nomeCliente)
      if (temFaturas) {
        notificar('Não pode remover um cliente com faturas associadas. Use Desativar.', 'error')
        return
      }
    }
    setClientesState((prev) => prev.filter((x) => x.id !== id))
    log('remover', 'cliente', id, c?.nome ?? '')
  }

  const editarCliente = (id, dados) => {
    if (!canEditarCliente(user?.role)) {
      notificar('Sem permissão para editar clientes.', 'error')
      return
    }
    setClientesState((prev) => prev.map((c) => (c.id === id ? { ...c, ...dados } : c)))
    log('editar', 'cliente', id, dados.nome ?? '')
  }

  const notificar = (message, type = 'success') => {
    setToast({ show: true, message, type })
  }

  const permissoes = useMemo(
    () => ({
      canCriarFatura: canCriarFatura(user?.role),
      canEditarFatura: (fatura) => canEditarFatura(user?.role, fatura?.estado),
      canRemoverFatura: (fatura) => canRemoverFatura(user?.role, fatura?.estado),
      canAlterarEstadoFatura: (fatura) => canAlterarEstadoFatura(user?.role, fatura?.estado),
      canMarcarFaturaPaga: canMarcarFaturaPaga(user?.role),
      canMarcarFaturaAnulada: canMarcarFaturaAnulada(user?.role),
      getEstadosPermitidosParaAlterar: () => getEstadosPermitidosParaAlterar(user?.role),
      canCriarCliente: canCriarCliente(user?.role),
      canEditarCliente: canEditarCliente(user?.role),
      canRemoverCliente: canRemoverCliente(user?.role),
      canRemoverEsteCliente: (cliente) => {
        if (!canRemoverCliente(user?.role)) return false
        if (!cliente) return true
        const nomeCliente = (cliente.nome || '').trim()
        const temFaturas = nomeCliente && faturas.some((f) => (f.cliente || '').trim() === nomeCliente)
        return !temFaturas
      },
      canVerContasAReceber: canVerContasAReceber(user?.role),
      canVerLogs: canVerLogs(user?.role),
      canVerDefinicoes: canVerDefinicoes(user?.role),
      isAdmin: isAdmin(user?.role),
    }),
    [user?.role, faturas]
  )

  if (!user) {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <div className={`app ${darkMode ? 'app--dark' : ''} ${sidebarMinimizado ? 'app--sidebar-minimizado' : ''}`}>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((s) => ({ ...s, show: false }))}
      />
      <Sidebar
        secaoAtiva={secaoAtiva}
        onMudarSecao={setSecaoAtiva}
        user={user}
        onLogout={handleLogout}
        permissoes={permissoes}
        minimizado={sidebarMinimizado}
        onToggleMinimizado={() => setSidebarMinimizado((v) => !v)}
      />

      <main className="app__main">
        <header className="app__topbar">
          <div className="app__topbar-esq">
            <h1 className="app__titulo">{SECOES[secaoAtiva]?.titulo ?? ''}</h1>
            <p className="app__subtitulo">
              {SECOES[secaoAtiva]?.subtitulo ?? ''}
              {user?.nome && <span className="app__user"> · {user.nome}</span>}
            </p>
          </div>
          <PesquisaGlobal
            faturas={faturasList}
            clientes={clientes}
            onIrParaFaturas={(termo) => {
              setSecaoAtiva('faturas')
              setPendingFaturaSearch(termo || null)
              setFaturaDetalheFromSearch(null)
            }}
            onIrParaClientes={(termo) => {
              setSecaoAtiva('clientes')
              setPendingClienteSearch(termo || null)
              setClienteDetalheFromSearch(null)
            }}
            onSelecionarFatura={(fatura) => {
              setSecaoAtiva('faturas')
              setPendingFaturaSearch(null)
              setFaturaDetalheFromSearch(fatura)
            }}
            onSelecionarCliente={(cliente) => {
              setSecaoAtiva('clientes')
              setPendingClienteSearch(null)
              setClienteDetalheFromSearch(cliente)
            }}
          />
        </header>

        <div className="app__conteudo">
          {secaoAtiva === 'dashboard' && (
            <DashboardPage
              totalVendas={totalVendas}
              totalPorPagar={totalPorPagar}
              totalPago={totalPago}
              numFaturas={faturasList.length}
              numClientes={clientes.length}
              numFaturasPorPagar={numFaturasPorPagar}
              numFaturasEmAtraso={numFaturasEmAtraso}
              totalEmAtraso={totalEmAtraso}
              faturas={faturasList}
              onMudarSecao={setSecaoAtiva}
              onAbrirFatura={(fatura) => {
                setSecaoAtiva('faturas')
                setFaturaDetalheFromSearch(fatura)
              }}
              darkMode={darkMode}
            />
          )}

          {secaoAtiva === 'faturas' && (
            <FaturasPage
              faturas={faturasList}
              clientes={clientes}
              initialPesquisa={pendingFaturaSearch}
              onInitialPesquisaAplicada={() => setPendingFaturaSearch(null)}
              faturaDetalheFromSearch={faturaDetalheFromSearch}
              onFaturaDetalheFromSearchClear={() => setFaturaDetalheFromSearch(null)}
              onAdicionar={adicionarFatura}
              onRemover={removerFatura}
              onEditarFatura={editarFatura}
              onNotificar={notificar}
              permissoes={permissoes}
            />
          )}

          {secaoAtiva === 'clientes' && (
            <ClientesPage
              clientes={clientes}
              faturas={faturasList}
              initialPesquisa={pendingClienteSearch}
              onInitialPesquisaAplicada={() => setPendingClienteSearch(null)}
              clienteDetalheFromSearch={clienteDetalheFromSearch}
              onClienteDetalheFromSearchClear={() => setClienteDetalheFromSearch(null)}
              onAdicionar={adicionarCliente}
              onRemover={removerCliente}
              onEditarCliente={editarCliente}
              onNotificar={notificar}
              permissoes={permissoes}
            />
          )}

          {secaoAtiva === 'contas-a-receber' && (
            <ContasAReceberPage
              faturas={faturasList}
              onEditarFatura={editarFatura}
              onNotificar={notificar}
              permissoes={permissoes}
              onAbrirFatura={(fatura) => {
                setSecaoAtiva('faturas')
                setFaturaDetalheFromSearch(fatura)
              }}
            />
          )}

          {secaoAtiva === 'utilizadores' && permissoes.canVerLogs && (
            <UtilizadoresPage
              user={user}
              onNotificar={notificar}
              onUserUpdated={setUser}
              onCurrentUserDesativado={() => { setSession(null); setUser(null) }}
              permissoes={{ canCriarUtilizador: isAdmin(user?.role), canAtivarDesativarUtilizador: isAdmin(user?.role) }}
            />
          )}

          {secaoAtiva === 'definicoes' && permissoes.canVerDefinicoes && (
            <DefinicoesPage
              onNotificar={notificar}
              darkMode={darkMode}
              onDarkModeChange={setDarkMode}
              canBackupRestore={permissoes.isAdmin}
            />
          )}

          {secaoAtiva === 'logs' && permissoes.canVerLogs && (
            <LogsPage />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
