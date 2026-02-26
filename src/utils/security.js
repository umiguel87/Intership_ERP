/**
 * Utilitários de segurança para o ERP (frontend).
 * Passwords são hasheadas com PBKDF2 antes de guardar; sessão tem expiração.
 */

const PBKDF2_ITERATIONS = 120000
const SALT_BYTES = 16
const HASH_BYTES = 32

/**
 * Converte ArrayBuffer para string hexadecimal.
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Converte string hexadecimal para Uint8Array.
 */
function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

/**
 * Gera um salt aleatório (hex).
 */
export function generateSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  return bufferToHex(bytes)
}

/**
 * Deriva hash da password com PBKDF2 (SHA-256).
 * @param {string} password - Password em texto
 * @param {string} saltHex - Salt em hexadecimal
 * @returns {Promise<string>} Hash em hexadecimal
 */
export async function hashPassword(password, saltHex) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const salt = hexToBuffer(saltHex)
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_BYTES * 8
  )
  return bufferToHex(bits)
}

/**
 * Verifica se a password corresponde ao hash guardado.
 * @param {string} password - Password em texto
 * @param {string} saltHex - Salt do utilizador
 * @param {string} hashHex - Hash guardado
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, saltHex, hashHex) {
  const computed = await hashPassword(password, saltHex)
  return computed === hashHex
}

/** Requisitos mínimos da password */
const MIN_LENGTH = 8
const MAX_LENGTH = 128

/**
 * Valida força da password (comprimento, letra, número).
 * @param {string} password
 * @returns {{ valid: boolean, message?: string }}
 */
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Palavra-passe é obrigatória.' }
  }
  if (password.length < MIN_LENGTH) {
    return { valid: false, message: `Palavra-passe deve ter pelo menos ${MIN_LENGTH} caracteres.` }
  }
  if (password.length > MAX_LENGTH) {
    return { valid: false, message: `Palavra-passe não pode exceder ${MAX_LENGTH} caracteres.` }
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Palavra-passe deve conter pelo menos uma letra.' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Palavra-passe deve conter pelo menos um número.' }
  }
  return { valid: true }
}

/** Duração da sessão em milissegundos (ex: 8 horas) */
export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000

/** Logout automático após esta inatividade (ex: 30 min) */
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000

/** Duração do bloqueio após falhas de login (15 min) */
export const LOGIN_LOCKOUT_MS = 15 * 60 * 1000

/** Número de tentativas falhadas antes de bloquear */
export const MAX_LOGIN_ATTEMPTS = 5

const RATE_LIMIT_KEY = 'erp_login_failures'

/**
 * Regista uma tentativa de login falhada e devolve se a conta está bloqueada.
 * @returns {{ locked: boolean, remainingAttempts?: number, lockoutUntil?: number }}
 */
export function recordFailedLogin() {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY)
    const data = raw ? JSON.parse(raw) : { count: 0, firstAttempt: Date.now() }
    data.count += 1
    data.lastAttempt = Date.now()

    if (data.count >= MAX_LOGIN_ATTEMPTS) {
      data.lockoutUntil = Date.now() + LOGIN_LOCKOUT_MS
      sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data))
      return { locked: true, lockoutUntil: data.lockoutUntil }
    }

    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data))
    return { locked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS - data.count }
  } catch {
    return { locked: false }
  }
}

/**
 * Limpa o contador de falhas (chamar após login com sucesso).
 */
export function clearFailedLoginAttempts() {
  try {
    sessionStorage.removeItem(RATE_LIMIT_KEY)
  } catch (_) {}
}

/**
 * Verifica se o login está bloqueado por rate limit.
 * @returns {{ locked: boolean, lockoutUntil?: number, message?: string }}
 */
export function getLoginLockoutStatus() {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY)
    if (!raw) return { locked: false }
    const data = JSON.parse(raw)
    const lockoutUntil = data.lockoutUntil
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const mins = Math.ceil((lockoutUntil - Date.now()) / 60000)
      return {
        locked: true,
        lockoutUntil,
        message: `Muitas tentativas falhadas. Tente novamente dentro de ${mins} minuto(s).`,
      }
    }
    if (lockoutUntil && Date.now() >= lockoutUntil) {
      sessionStorage.removeItem(RATE_LIMIT_KEY)
    }
    return { locked: false }
  } catch {
    return { locked: false }
  }
}

/**
 * Cria objeto de sessão com expiração (identificado por código do funcionário).
 * @param {string} codigo - Código do funcionário
 * @returns {{ codigo: string, expiresAt: number }}
 */
export function createSession(codigo) {
  return {
    codigo: codigo && String(codigo).trim(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  }
}

/**
 * Verifica se a sessão ainda é válida (não expirou).
 * @param {{ codigo?: string, email?: string, expiresAt?: number } | null} session
 * @returns {boolean}
 */
export function isSessionValid(session) {
  const id = session?.codigo ?? session?.email
  if (!session || !id) return false
  if (session.expiresAt != null && Date.now() > session.expiresAt) return false
  return true
}

/**
 * Sanitiza string para evitar XSS (trim e limita comprimento).
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeString(value, maxLength = 500) {
  if (value == null) return ''
  const s = String(value).trim()
  return s.length > maxLength ? s.slice(0, maxLength) : s
}
