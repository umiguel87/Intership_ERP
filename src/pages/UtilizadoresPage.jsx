import { useState, useEffect } from 'react'
import { getUsers, setUsers } from '../storage'
import { ROLES, labelRole, canCriarUtilizador, canAtivarDesativarUtilizador } from '../constants/roles'
import { sanitizeString, hashPassword, generateSalt, validatePasswordStrength } from '../utils/security'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'

function UtilizadoresPage({ user: currentUser, onNotificar, onUserUpdated, onCurrentUserDesativado, permissoes = {} }) {
  const canCriar = permissoes.canCriarUtilizador !== false && canCriarUtilizador(currentUser?.role)
  const canAtivarDesativar = permissoes.canAtivarDesativarUtilizador !== false && canAtivarDesativarUtilizador(currentUser?.role)
  const [users, setUsersState] = useState([])
  const [editarUser, setEditarUser] = useState(null)
  const [mostrarCriar, setMostrarCriar] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', role: 'comercial', novaPassword: '', confirmPassword: '' })
  const [formCriar, setFormCriar] = useState({ nome: '', email: '', role: 'comercial', password: '', confirmPassword: '' })
  const [erros, setErros] = useState({})
  const [errosCriar, setErrosCriar] = useState({})
  const [confirmDesativar, setConfirmDesativar] = useState(null)

  const recarregar = () => setUsersState(getUsers())

  useEffect(() => {
    recarregar()
  }, [])

  const handleAbrirEditar = (u) => {
    setEditarUser(u)
    setForm({
      nome: (u?.nome || '').trim(),
      email: (u?.email || '').trim(),
      role: ROLES.includes(u?.role) ? u.role : 'comercial',
      novaPassword: '',
      confirmPassword: '',
    })
    setErros({})
  }

  const handleFecharEditar = () => {
    setEditarUser(null)
    setErros({})
  }

  const validar = () => {
    const e = {}
    const nomeTrim = sanitizeString(form.nome, 100)
    const emailTrim = sanitizeString(form.email, 255).toLowerCase()
    if (!nomeTrim) e.nome = 'Nome é obrigatório.'
    if (!emailTrim) e.email = 'Email é obrigatório.'
    const lista = getUsers().filter((x) => x.id !== editarUser?.id)
    if (lista.some((x) => x.email && x.email.toLowerCase() === emailTrim)) {
      e.email = 'Já existe um utilizador com este email.'
    }
    if (form.novaPassword || form.confirmPassword) {
      const pwdCheck = validatePasswordStrength(form.novaPassword)
      if (!pwdCheck.valid) e.novaPassword = pwdCheck.message
      else if (form.novaPassword !== form.confirmPassword) {
        e.confirmPassword = 'As palavras-passe não coincidem.'
      }
    }
    setErros(e)
    return Object.keys(e).length === 0
  }

  const handleGuardar = async () => {
    if (!editarUser || !validar()) return
    const nomeTrim = sanitizeString(form.nome, 100)
    const emailTrim = sanitizeString(form.email, 255).toLowerCase()
    const lista = getUsers()
    const updated = lista.map((u) => {
      if (u.id !== editarUser.id) return u
      const next = { ...u, nome: nomeTrim, email: emailTrim, role: form.role, ativo: u.ativo !== false }
      return next
    })

    if (form.novaPassword && form.novaPassword === form.confirmPassword) {
      const salt = generateSalt()
      const passwordHash = await hashPassword(form.novaPassword, salt)
      const idx = updated.findIndex((u) => u.id === editarUser.id)
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], passwordHash, salt }
        delete updated[idx].password
      }
    }

    setUsers(updated)
    setUsersState(updated)
    handleFecharEditar()
    onNotificar?.('Utilizador guardado.')

    if (currentUser?.id === editarUser.id && (nomeTrim !== currentUser.nome || emailTrim !== currentUser.email)) {
      onUserUpdated?.({ ...currentUser, nome: nomeTrim, email: emailTrim, role: form.role })
    }
  }

  const validarCriar = () => {
    const e = {}
    const nomeTrim = sanitizeString(formCriar.nome, 100)
    const emailTrim = sanitizeString(formCriar.email, 255).toLowerCase()
    if (!nomeTrim) e.nome = 'Nome é obrigatório.'
    if (!emailTrim) e.email = 'Email é obrigatório.'
    if (getUsers().some((x) => x.email && x.email.toLowerCase() === emailTrim)) {
      e.email = 'Já existe um utilizador com este email.'
    }
    const pwdCheck = validatePasswordStrength(formCriar.password)
    if (!pwdCheck.valid) e.password = pwdCheck.message
    else if (formCriar.password !== formCriar.confirmPassword) {
      e.confirmPassword = 'As palavras-passe não coincidem.'
    }
    setErrosCriar(e)
    return Object.keys(e).length === 0
  }

  const handleCriar = async () => {
    if (!validarCriar() || !canCriar) return
    const nomeTrim = sanitizeString(formCriar.nome, 100)
    const emailTrim = sanitizeString(formCriar.email, 255).toLowerCase()
    const salt = generateSalt()
    const passwordHash = await hashPassword(formCriar.password, salt)
    const novo = {
      id: crypto.randomUUID(),
      nome: nomeTrim,
      email: emailTrim,
      role: ROLES.includes(formCriar.role) ? formCriar.role : 'comercial',
      passwordHash,
      salt,
      ativo: true,
    }
    const lista = getUsers()
    setUsers([...lista, novo])
    setUsersState([...lista, novo])
    setMostrarCriar(false)
    setFormCriar({ nome: '', email: '', role: 'comercial', password: '', confirmPassword: '' })
    setErrosCriar({})
    onNotificar?.('Utilizador criado.')
  }

  const handleAtivarDesativar = (u) => {
    const novoAtivo = u.ativo !== false ? false : true
    const lista = getUsers()
    const updated = lista.map((x) => (x.id === u.id ? { ...x, ativo: novoAtivo } : x))
    setUsers(updated)
    setUsersState(updated)
    setConfirmDesativar(null)
    onNotificar?.(u.ativo !== false ? 'Utilizador desativado.' : 'Utilizador ativado.')
    if (currentUser?.id === u.id && novoAtivo === false) {
      onCurrentUserDesativado?.()
    }
  }

  return (
    <div className="utilizadores-page">
      <div className="utilizadores-page__cabecalho">
        <h2 className="utilizadores-page__titulo">Utilizadores</h2>
        <p className="utilizadores-page__descricao">
          Gerir contas e perfis (apenas visível para administradores).
        </p>
        {canCriar && (
          <button
            type="button"
            className="lista-faturas__btn lista-faturas__btn--export"
            onClick={() => { setMostrarCriar(true); setFormCriar({ nome: '', email: '', role: 'comercial', password: '', confirmPassword: '' }); setErrosCriar({}) }}
          >
            Criar utilizador
          </button>
        )}
      </div>

      <div className="lista-faturas utilizadores-page__lista">
        <div className="lista-faturas__wrapper">
          <table className="lista-faturas__tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                {canAtivarDesativar && <th>Estado</th>}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.ativo === false ? 'lista-faturas__linha--anulada' : ''}>
                  <td>{u.nome || '—'}</td>
                  <td>{u.email || '—'}</td>
                  <td>{labelRole(u.role)}</td>
                  {canAtivarDesativar && (
                    <td>{u.ativo === false ? 'Inativo' : 'Ativo'}</td>
                  )}
                  <td>
                    <div className="lista-faturas__acoes-celula">
                      <button
                        type="button"
                        className="lista-faturas__btn lista-faturas__btn--editar"
                        onClick={() => handleAbrirEditar(u)}
                        aria-label={`Editar ${u.nome}`}
                      >
                        Editar
                      </button>
                      {canAtivarDesativar && (
                        u.ativo !== false ? (
                          currentUser?.id !== u.id && (
                            <button
                              type="button"
                              className="lista-faturas__btn lista-faturas__btn--estado"
                              onClick={() => setConfirmDesativar(u)}
                              aria-label={`Desativar ${u.nome}`}
                            >
                              Desativar
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            className="lista-faturas__btn lista-faturas__btn--reativar"
                            onClick={() => handleAtivarDesativar(u)}
                            aria-label={`Ativar ${u.nome}`}
                          >
                            Ativar
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <p className="lista-faturas__vazia">Nenhum utilizador encontrado.</p>
        )}
      </div>

      <Modal aberto={mostrarCriar} onFechar={() => setMostrarCriar(false)}>
        <div className="modal-editar">
          <h3 className="modal-editar__titulo">Criar utilizador</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleCriar() }} className="modal-editar__form">
            <div className="modal-editar__campo">
              <label htmlFor="criar-nome">Nome</label>
              <input id="criar-nome" type="text" value={formCriar.nome} onChange={(e) => setFormCriar((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome completo" />
              {errosCriar.nome && <span className="form-fatura__erro">{errosCriar.nome}</span>}
            </div>
            <div className="modal-editar__campo">
              <label htmlFor="criar-email">Email</label>
              <input id="criar-email" type="email" value={formCriar.email} onChange={(e) => setFormCriar((f) => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.pt" />
              {errosCriar.email && <span className="form-fatura__erro">{errosCriar.email}</span>}
            </div>
            <div className="modal-editar__campo">
              <label htmlFor="criar-role">Perfil</label>
              <select id="criar-role" value={formCriar.role} onChange={(e) => setFormCriar((f) => ({ ...f, role: e.target.value }))}>
                {ROLES.map((r) => (<option key={r} value={r}>{labelRole(r)}</option>))}
              </select>
            </div>
            <div className="modal-editar__campo">
              <label htmlFor="criar-pwd">Palavra-passe</label>
              <input id="criar-pwd" type="password" value={formCriar.password} onChange={(e) => setFormCriar((f) => ({ ...f, password: e.target.value }))} placeholder="Mín. 8 car., letra e número" autoComplete="new-password" />
              {errosCriar.password && <span className="form-fatura__erro">{errosCriar.password}</span>}
            </div>
            <div className="modal-editar__campo">
              <label htmlFor="criar-pwd2">Confirmar palavra-passe</label>
              <input id="criar-pwd2" type="password" value={formCriar.confirmPassword} onChange={(e) => setFormCriar((f) => ({ ...f, confirmPassword: e.target.value }))} autoComplete="new-password" />
              {errosCriar.confirmPassword && <span className="form-fatura__erro">{errosCriar.confirmPassword}</span>}
            </div>
            <div className="modal-editar__botoes">
              <button type="button" className="modal-editar__btn modal-editar__btn--sec" onClick={() => setMostrarCriar(false)}>Cancelar</button>
              <button type="submit" className="modal-editar__btn modal-editar__btn--pri">Criar</button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal aberto={!!editarUser} onFechar={handleFecharEditar}>
        <div className="modal-editar">
          <h3 className="modal-editar__titulo">Editar utilizador</h3>
          <form
            className="modal-editar__form"
            onSubmit={(e) => { e.preventDefault(); handleGuardar() }}
          >
            <div className="modal-editar__campo">
              <label htmlFor="util-nome">Nome</label>
              <input
                id="util-nome"
                type="text"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Nome completo"
              />
              {erros.nome && <span className="form-fatura__erro">{erros.nome}</span>}
            </div>
            <div className="modal-editar__campo">
              <label htmlFor="util-email">Email</label>
              <input
                id="util-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="email@exemplo.pt"
              />
              {erros.email && <span className="form-fatura__erro">{erros.email}</span>}
            </div>
            <div className="modal-editar__campo">
              <label htmlFor="util-role">Perfil</label>
              <select
                id="util-role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{labelRole(r)}</option>
                ))}
              </select>
            </div>
            <div className="modal-editar__subtitulo">Alterar palavra-passe (opcional)</div>
            <div className="modal-editar__campo">
              <label htmlFor="util-pwd">Nova palavra-passe</label>
              <input
                id="util-pwd"
                type="password"
                value={form.novaPassword}
                onChange={(e) => setForm((f) => ({ ...f, novaPassword: e.target.value }))}
                placeholder="Deixar em branco para não alterar"
                autoComplete="new-password"
              />
              {erros.novaPassword && <span className="form-fatura__erro">{erros.novaPassword}</span>}
            </div>
            <div className="modal-editar__campo">
              <label htmlFor="util-pwd2">Confirmar palavra-passe</label>
              <input
                id="util-pwd2"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Repetir nova palavra-passe"
                autoComplete="new-password"
              />
              {erros.confirmPassword && <span className="form-fatura__erro">{erros.confirmPassword}</span>}
            </div>
            <div className="modal-editar__botoes">
              <button type="button" className="modal-editar__btn modal-editar__btn--sec" onClick={handleFecharEditar}>
                Cancelar
              </button>
              <button type="submit" className="modal-editar__btn modal-editar__btn--pri">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmModal
        aberto={!!confirmDesativar}
        titulo="Desativar utilizador"
        mensagem={`Tem a certeza que deseja desativar ${confirmDesativar?.nome ?? 'este utilizador'}? O utilizador não poderá iniciar sessão.`}
        confirmarLabel="Desativar"
        cancelarLabel="Cancelar"
        perigo
        onConfirmar={() => confirmDesativar && handleAtivarDesativar(confirmDesativar)}
        onCancelar={() => setConfirmDesativar(null)}
      />
    </div>
  )
}

export default UtilizadoresPage
