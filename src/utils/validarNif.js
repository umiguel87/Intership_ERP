/**
 * Validação de NIF português (9 dígitos, dígito de controlo módulo 11).
 * Opcional: se o campo estiver vazio, considera válido.
 */

export function validarNifPT(valor) {
  const s = (valor || '').toString().replace(/\s/g, '')
  if (s === '') return { valido: true, mensagem: null }
  if (!/^\d{9}$/.test(s)) return { valido: false, mensagem: 'NIF deve ter exatamente 9 dígitos.' }
  const digitos = s.split('').map(Number)
  const pesos = [9, 8, 7, 6, 5, 4, 3, 2]
  let soma = 0
  for (let i = 0; i < 8; i++) soma += digitos[i] * pesos[i]
  let controlo = 11 - (soma % 11)
  if (controlo >= 10) controlo = 0
  if (digitos[8] !== controlo) return { valido: false, mensagem: 'NIF inválido (dígito de controlo incorreto).' }
  return { valido: true, mensagem: null }
}
