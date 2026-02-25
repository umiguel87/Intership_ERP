import { useState } from 'react'
import { getUsers, setUsers, setSession } from '../storage'
import { ROLES } from '../constants/roles'
import {
  verifyPassword,
  hashPassword,
  generateSalt,
  validatePasswordStrength,
  createSession,
  recordFailedLogin,
  clearFailedLoginAttempts,
  getLoginLockoutStatus,
  sanitizeString,
} from '../utils/security'
import '../App.css'

function AuthPage({ onLogin }) {
  const [modo, setModo] = useState('login') // 'login' | 'registo'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
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

    const emailTrim = sanitizeString(email, 255).toLowerCase()
    if (!emailTrim) {
      setErro('Email é obrigatório.')
      return
    }

    setLoading(true)
    try {
      const users = getUsers()
      const user = users.find((u) => u.email && u.email.toLowerCase() === emailTrim)
      if (!user) {
        recordFailedLogin()
        setErro('Email não encontrado.')
        return
      }
      if (user.ativo === false) {
        setErro('Conta desativada. Contacte o administrador.')
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
          setErro(`Muitas tentativas falhadas. Tente novamente dentro de ${mins} minuto(s).`)
        } else {
          setErro('Palavra-passe incorreta.')
        }
        return
      }

      clearFailedLoginAttempts()
      setSession(createSession(user.email))
      const role = user.role && ROLES.includes(user.role) ? user.role : 'comercial'
      onLogin({ id: user.id, nome: user.nome, email: user.email, role })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRegisto = async (e) => {
    e.preventDefault()
    setErro('')

    const nomeTrim = sanitizeString(nome, 100)
    const emailTrim = sanitizeString(email, 255).toLowerCase()

    if (!nomeTrim) {
      setErro('Nome é obrigatório.')
      return
    }
    if (!emailTrim) {
      setErro('Email é obrigatório.')
      return
    }

    const pwdCheck = validatePasswordStrength(password)
    if (!pwdCheck.valid) {
      setErro(pwdCheck.message || 'Palavra-passe inválida.')
      return
    }

    const users = getUsers()
    if (users.some((u) => u.email && u.email.toLowerCase() === emailTrim)) {
      setErro('Já existe uma conta com este email.')
      return
    }

    setLoading(true)
    try {
      const salt = generateSalt()
      const passwordHash = await hashPassword(password, salt)
      const role = users.length === 0 ? 'admin' : 'comercial'
      const novoUser = {
        id: crypto.randomUUID(),
        nome: nomeTrim,
        email: emailTrim,
        passwordHash,
        salt,
        role,
      }
      setUsers([...users, novoUser])
      setSession(createSession(novoUser.email))
      onLogin({ id: novoUser.id, nome: novoUser.nome, email: novoUser.email, role })
    } catch (err) {
      setErro('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleModo = () => {
    setModo((m) => (m === 'login' ? 'registo' : 'login'))
    setErro('')
    setNome('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand">
          <span className="auth__logo">ERP</span>
          <span className="auth__nome">Faturação</span>
        </div>

        <h1 className="auth__titulo">
          {modo === 'login' ? 'Entrar' : 'Criar conta'}
        </h1>

        {erro && (
          <p className="auth__erro" role="alert">
            {erro}
          </p>
        )}

        {modo === 'login' ? (
          <form className="auth__form" onSubmit={handleSubmitLogin}>
            <div className="auth__campo">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.pt"
                required
                autoComplete="email"
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
        ) : (
          <form className="auth__form" onSubmit={handleSubmitRegisto}>
            <div className="auth__campo">
              <label htmlFor="auth-nome">Nome</label>
              <input
                id="auth-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="O seu nome"
                required
                autoComplete="name"
              />
            </div>
            <div className="auth__campo">
              <label htmlFor="auth-email-reg">Email</label>
              <input
                id="auth-email-reg"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.pt"
                required
                autoComplete="email"
              />
            </div>
            <div className="auth__campo">
              <label htmlFor="auth-password-reg">Palavra-passe</label>
              <input
                id="auth-password-reg"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mín. 8 caracteres, letra e número"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="auth__submit" disabled={loading}>
              {loading ? 'A guardar...' : 'Registar'}
            </button>
          </form>
        )}

        <p className="auth__toggle">
          {modo === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}
          {' '}
          <button
            type="button"
            className="auth__link"
            onClick={handleToggleModo}
          >
            {modo === 'login' ? 'Criar conta' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthPage
