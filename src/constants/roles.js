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

/** Comercial não cria; Admin e Financeiro criam rascunhos */
export function canCriarFatura(role) {
  return role === ADMIN || role === FINANCEIRO
}

/** Pode remover fatura: apenas rascunhos; Comercial não pode remover */
export function canRemoverFatura(role, estadoFatura) {
  const e = (estadoFatura || '').trim()
  if (e !== 'Rascunho') return false
  return role === ADMIN || role === FINANCEIRO
}

/** Pode editar dados da fatura: Admin exceto Paga/Anulada; Comercial e Financeiro apenas Rascunho (não alterar valores após emissão) */
export function canEditarFatura(role, estadoFatura) {
  const e = (estadoFatura || '').trim()
  if (e === 'Paga' || e === 'Anulada') return false
  if (role === ADMIN) return true
  if (role === COMERCIAL || role === FINANCEIRO) return e === 'Rascunho'
  return false
}

/** Pode marcar fatura como Paga: Admin e Comercial (Financeiro não altera estados) */
export function canMarcarFaturaPaga(role) {
  return role === ADMIN || role === COMERCIAL
}

/** Pode marcar fatura como Anulada: Admin e Comercial */
export function canMarcarFaturaAnulada(role) {
  return role === ADMIN || role === COMERCIAL
}

/** Pode alterar estado: não se estiver Paga ou Anulada. Admin sempre; Comercial em Rascunho/Emitida/Por pagar (emite e marca Paga); Financeiro nunca */
export function canAlterarEstadoFatura(role, estadoFatura) {
  const e = (estadoFatura || '').trim()
  if (e === 'Anulada' || e === 'Paga') return false
  if (role === ADMIN) return true
  if (role === COMERCIAL) return ['Rascunho', 'Emitida', 'Por pagar'].includes(e)
  return false
}

/** Estados para os quais este perfil pode alterar (no modal de estado) */
export function getEstadosPermitidosParaAlterar(role) {
  if (role === ADMIN) return [...ESTADOS_FATURA]
  if (role === COMERCIAL) return ['Emitida', 'Por pagar', 'Paga', 'Anulada']
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

/** Contas a Receber: Admin e Comercial (Financeiro não tem acesso) */
export function canVerContasAReceber(role) {
  return role === ADMIN || role === COMERCIAL
}

export function canVerLogs(role) {
  return role === ADMIN
}

/** Definições (aparência, backup, restauro) visível para Admin, Comercial e Financeiro */
export function canVerDefinicoes(role) {
  return role === ADMIN || role === COMERCIAL || role === FINANCEIRO
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
