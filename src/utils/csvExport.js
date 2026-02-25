/**
 * Exportação para CSV.
 * Gera ficheiro com BOM UTF-8 para abrir corretamente no Excel com caracteres PT.
 */

/**
 * Escapa um valor para CSV (quotes se contiver vírgula, quebra de linha ou aspas).
 */
function escapeCsvValue(value) {
  if (value == null) return ''
  const str = String(value).trim()
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Converte um array de objetos em string CSV.
 * @param {Array<object>} dados - Lista de objetos
 * @param {Array<{ key: string, label: string }>} colunas - Definição das colunas (key + label para cabeçalho)
 * @returns {string} CSV com cabeçalho
 */
export function toCsv(dados, colunas) {
  const header = colunas.map((c) => escapeCsvValue(c.label)).join(',')
  const rows = dados.map((item) =>
    colunas.map((c) => escapeCsvValue(item[c.key])).join(',')
  )
  return [header, ...rows].join('\r\n')
}

/**
 * Faz download de um ficheiro CSV no browser.
 * @param {string} conteudo - Conteúdo CSV
 * @param {string} nomeFicheiro - Nome do ficheiro (ex: faturas.csv)
 */
export function downloadCsv(conteudo, nomeFicheiro) {
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + conteudo], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeFicheiro || 'exportacao.csv'
  a.click()
  URL.revokeObjectURL(url)
}
