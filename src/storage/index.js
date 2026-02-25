/**
 * Chaves e helpers para localStorage.
 * Faturas e clientes são globais (todos os utilizadores veem os mesmos dados).
 * Passwords são guardadas em hash (passwordHash + salt); sessão tem expiresAt.
 * Nota: em produção, autenticação e dados sensíveis devem estar num backend.
 */

import { hashPassword, generateSalt, SESSION_DURATION_MS } from '../utils/security'

const CHAVE_USERS = 'erp_users'
const CHAVE_SESSION = 'erp_session'
const CHAVE_LOGS = 'erp_logs'
const CHAVE_FATURAS = 'erp_faturas'
const CHAVE_CLIENTES = 'erp_clientes'
const CHAVE_PASSWORD_MIGRATION = 'erp_password_migration_done'
const MAX_LOGS = 500

function parseJsonArray(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key)
    const data = raw ? JSON.parse(raw) : defaultValue
    return Array.isArray(data) ? data : defaultValue
  } catch {
    return defaultValue
  }
}

function getChaveFaturasPorEmail(email) {
  return `erp_faturas_${email}`
}
function getChaveClientesPorEmail(email) {
  return `erp_clientes_${email}`
}

export function getClientes() {
  return parseJsonArray(CHAVE_CLIENTES)
}

export function setClientes(clientes) {
  localStorage.setItem(CHAVE_CLIENTES, JSON.stringify(clientes))
}

export function getUsers() {
  return parseJsonArray(CHAVE_USERS)
}

export function setUsers(users) {
  localStorage.setItem(CHAVE_USERS, JSON.stringify(users))
}

/**
 * Cria 3 contas de teste (admin, comercial, financeiro) se ainda não existir nenhum utilizador.
 * Passwords são hasheadas de forma assíncrona; use seedUsersIfEmptyAsync após esta chamada
 * ou na primeira carga da app para garantir hashes.
 */
export function seedUsersIfEmpty() {
  const users = getUsers()
  if (users.length > 0) return
  const senha = 'Admin123'
  setUsers([
    { id: 'seed-admin', nome: 'Admin', email: 'admin@teste.pt', password: senha, role: 'admin', ativo: true },
    { id: 'seed-comercial', nome: 'Comercial', email: 'comercial@teste.pt', password: senha, role: 'comercial', ativo: true },
    { id: 'seed-financeiro', nome: 'Financeiro', email: 'financeiro@teste.pt', password: senha, role: 'financeiro', ativo: true },
  ])
}

/**
 * Migra utilizadores que ainda têm "password" em texto para passwordHash + salt.
 * Só corre uma vez (marca em localStorage).
 */
export async function migratePasswordsToHashIfNeeded() {
  try {
    if (localStorage.getItem(CHAVE_PASSWORD_MIGRATION) === '1') return
    const users = getUsers()
    let changed = false
    const next = await Promise.all(
      users.map(async (u) => {
        if (u.password != null && !u.passwordHash) {
          const salt = generateSalt()
          const passwordHash = await hashPassword(u.password, salt)
          changed = true
          const { password: _, ...rest } = u
          return { ...rest, passwordHash, salt, ativo: rest.ativo !== false }
        }
        return u
      })
    )
    if (changed) setUsers(next)
    localStorage.setItem(CHAVE_PASSWORD_MIGRATION, '1')
  } catch (_) {
    // Se falhar (ex: Web Crypto não disponível), não bloqueia a app
  }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(CHAVE_SESSION)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(session) {
  if (session) {
    localStorage.setItem(CHAVE_SESSION, JSON.stringify(session))
  } else {
    localStorage.removeItem(CHAVE_SESSION)
  }
}

/** Estende a expiração da sessão atual (chamar em atividade do utilizador). */
export function extendSessionIfNeeded() {
  const session = getSession()
  if (!session?.email) return
  setSession({
    ...session,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  })
}

export function getFaturas() {
  return parseJsonArray(CHAVE_FATURAS)
}

export function setFaturas(faturas) {
  localStorage.setItem(CHAVE_FATURAS, JSON.stringify(faturas))
}

/** Junta faturas/clientes que estavam por email numa lista global e apaga as chaves antigas. */
export function migrateToGlobalStorage() {
  const users = getUsers()
  let faturas = getFaturas()
  let clientes = getClientes()
  const mergeById = (acc, item) => (acc.some((x) => x.id === item.id) ? acc : [...acc, item])

  for (const u of users) {
    const email = u?.email
    if (!email) continue
    try {
      const rawF = localStorage.getItem(getChaveFaturasPorEmail(email))
      const rawC = localStorage.getItem(getChaveClientesPorEmail(email))
      const fList = rawF ? JSON.parse(rawF) : []
      const cList = rawC ? JSON.parse(rawC) : []
      faturas = fList.reduce(mergeById, faturas)
      clientes = cList.reduce(mergeById, clientes)
    } catch (_) {}
  }

  setFaturas(faturas)
  setClientes(clientes)
  for (const u of users) {
    if (u?.email) {
      localStorage.removeItem(getChaveFaturasPorEmail(u.email))
      localStorage.removeItem(getChaveClientesPorEmail(u.email))
    }
  }
}

export function getLogs() {
  return parseJsonArray(CHAVE_LOGS)
}

export function addLog(entry) {
  const logs = getLogs()
  const newEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  }
  const next = [newEntry, ...logs].slice(0, MAX_LOGS)
  localStorage.setItem(CHAVE_LOGS, JSON.stringify(next))
}

export function clearLogs() {
  localStorage.removeItem(CHAVE_LOGS)
}
