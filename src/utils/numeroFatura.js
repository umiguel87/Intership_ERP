/**
 * Gera o próximo número de fatura no formato FT-AAAA-NNN
 * (ex.: FT-2026-001, FT-2026-002)
 */
export function getProximoNumeroFatura(faturas = []) {
  const ano = new Date().getFullYear()
  const prefixo = `FT-${ano}-`
  const numeros = faturas
    .filter((f) => f.numero && f.numero.startsWith(prefixo))
    .map((f) => {
      const m = f.numero.match(/FT-\d{4}-(\d+)/)
      return m ? parseInt(m[1], 10) : 0
    })
  const max = numeros.length > 0 ? Math.max(...numeros) : 0
  return `${prefixo}${String(max + 1).padStart(3, '0')}`
}
