/**
 * Roles e permissões (Admin, Comercial, Financeiro).
 * Estados da fatura: Rascunho, Emitida, Por pagar, Paga, Anulada.
 */

export const ROLES = ['admin', 'comercial', 'financeiro']

export const ESTADOS_FATURA = ['Rascunho', 'Emitida', 'Por pagar', 'Paga', 'Anulada']

const ADMIN = 'admin'
const COMERCIAL = 'comercial'
const FINANCEIRO = 'financeiro'

export function isAdmin(role) {
  return role === ADMIN
}

export function canCriarFatura(role) {
  return role === ADMIN || role === COMERCIAL
}

/** Pode remover fatura: Admin sempre; Comercial só em Rascunho ou Emitida */
export function canRemoverFatura(role, estadoFatura) {
  const e = (estadoFatura || '').trim()
  if (role === ADMIN) return true
  if (role === COMERCIAL) return e === 'Rascunho' || e === 'Emitida'
  return false
}

/** Pode editar dados da fatura (cliente, valor, data): Admin sempre; Comercial só se não for Anulada nem Paga */
export function canEditarFatura(role, estadoFatura) {
  const e = (estadoFatura || '').trim()
  if (role === ADMIN) return true
  if (role === COMERCIAL) return e !== 'Anulada' && e !== 'Paga'
  return false
}

/** Pode marcar fatura como Paga (apenas Admin e Financeiro) */
export function canMarcarFaturaPaga(role) {
  return role === ADMIN || role === FINANCEIRO
}

/** Pode marcar fatura como Anulada (apenas Admin e Financeiro) */
export function canMarcarFaturaAnulada(role) {
  return role === ADMIN || role === FINANCEIRO
}

/** Pode alterar estado da fatura (consoante estado atual): ninguém pode alterar uma Anulada */
export function canAlterarEstadoFatura(role, estadoFatura) {
  const e = (estadoFatura || '').trim()
  if (e === 'Anulada') return false
  if (role === ADMIN) return true
  if (role === COMERCIAL) return ['Rascunho', 'Emitida', 'Por pagar'].includes(e)
  if (role === FINANCEIRO) return e === 'Por pagar'
  return false
}

/** Estados para os quais este perfil pode alterar (no modal de estado) */
export function getEstadosPermitidosParaAlterar(role) {
  if (role === ADMIN) return [...ESTADOS_FATURA]
  if (role === COMERCIAL) return ['Rascunho', 'Emitida', 'Por pagar']
  if (role === FINANCEIRO) return ['Paga', 'Anulada']
  return []
}

export function canCriarCliente(role) {
  return role === ADMIN || role === COMERCIAL
}

export function canEditarCliente(role) {
  return role === ADMIN || role === COMERCIAL
}

export function canRemoverCliente(role) {
  return role === ADMIN || role === COMERCIAL
}

/** Contas a Receber visível apenas para Admin e Financeiro */
export function canVerContasAReceber(role) {
  return role === ADMIN || role === FINANCEIRO
}

export function canVerLogs(role) {
  return role === ADMIN
}

export function canCriarUtilizador(role) {
  return role === ADMIN
}

export function canAtivarDesativarUtilizador(role) {
  return role === ADMIN
}

export function labelRole(role) {
  const labels = { admin: 'Administrador', comercial: 'Comercial', financeiro: 'Financeiro' }
  return labels[role] || role
}
