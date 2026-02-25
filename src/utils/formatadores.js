/**
 * Funções de formatação partilhadas (data e moeda PT).
 */

const OPCOES_DATA = { day: '2-digit', month: '2-digit', year: 'numeric' }
const OPCOES_DATA_HORA = { ...OPCOES_DATA, hour: '2-digit', minute: '2-digit' }
const OPCOES_MOEDA = { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }

export function formatarData(str) {
  if (!str) return '—'
  const d = new Date(str)
  return d.toLocaleDateString('pt-PT', OPCOES_DATA)
}

export function formatarDataHora(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('pt-PT', OPCOES_DATA_HORA)
}

export function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-PT', OPCOES_MOEDA)
}
