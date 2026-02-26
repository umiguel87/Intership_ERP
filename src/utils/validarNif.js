/**
 * Validação de NIF português (apenas 9 dígitos; sem verificação do dígito de controlo).
 * Opcional: se o campo estiver vazio, considera válido.
 */

export function validarNifPT(valor) {
  const s = (valor || '').toString().replace(/\s/g, '')
  if (s === '') return { valido: true, mensagem: null }
  if (!/^\d{9}$/.test(s)) return { valido: false, mensagem: 'NIF deve ter exatamente 9 dígitos.' }
  return { valido: true, mensagem: null }
}
