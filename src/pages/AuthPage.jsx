import { useState } from 'react'
import { getUsers, setSession } from '../storage'
import { ROLES } from '../constants/roles'
import {
  verifyPassword,
  createSession,
  recordFailedLogin,
  clearFailedLoginAttempts,
  getLoginLockoutStatus,
  sanitizeString,
} from '../utils/security'
import '../App.css'

function AuthPage({ onLogin }) {
  const [codigo, setCodigo] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmitLogin = async (e) => {
    e.preventDefault()
    setErro('')

    const lockout = getLoginLockoutStatus()
    if (lockout.locked) {
      setErro(lockout.message || 'Acesso temporariamente bloqueado.')
      return
    }

    const codigoTrim = sanitizeString(codigo, 50).toUpperCase()
    if (!codigoTrim) {
      setErro('Código do funcionário é obrigatório.')
      return
    }

    setLoading(true)
    try {
      const users = getUsers()
      const user = users.find((u) => u.codigo && String(u.codigo).trim().toUpperCase() === codigoTrim)
      if (!user) {
        recordFailedLogin()
        setErro('Não existe nenhuma conta com este código. Contacte o administrador.')
        return
      }
      if (user.ativo === false) {
        setErro('A sua conta foi desativada. Contacte o administrador para reativar.')
        return
      }

      let passwordOk = false
      if (user.passwordHash && user.salt) {
        passwordOk = await verifyPassword(password, user.salt, user.passwordHash)
      } else if (user.password != null) {
        passwordOk = user.password === password
      }

      if (!passwordOk) {
        const result = recordFailedLogin()
        if (result.locked && result.lockoutUntil) {
          const mins = Math.ceil((result.lockoutUntil - Date.now()) / 60000)
          setErro(`Demasiadas tentativas falhadas. Aguarde ${mins} minuto(s) antes de tentar novamente.`)
        } else {
          setErro('A palavra-passe está incorreta. Tente novamente.')
        }
        return
      }

      clearFailedLoginAttempts()
      setSession(createSession(user.codigo))
      const role = user.role && ROLES.includes(user.role) ? user.role : 'comercial'
      onLogin({ id: user.id, nome: user.nome, email: user.email, codigo: user.codigo, role })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand">
          <span className="auth__logo">ERP</span>
          <span className="auth__nome">Faturação</span>
        </div>

        <h1 className="auth__titulo">Entrar</h1>

        {erro && (
          <p className="auth__erro" role="alert">
            {erro}
          </p>
        )}

        <form className="auth__form" onSubmit={handleSubmitLogin}>
          <div className="auth__campo">
            <label htmlFor="auth-codigo">Código do funcionário</label>
            <input
              id="auth-codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: 001 ou F001"
              required
              autoComplete="username"
            />
          </div>
          <div className="auth__campo">
            <label htmlFor="auth-password">Palavra-passe</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="auth__submit" disabled={loading}>
            {loading ? 'A verificar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthPage
