import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatarMoeda } from '../../utils/formatadores'

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function GraficoVendasMes({ faturas = [] }) {
  const { dados, temAnoAnterior } = useMemo(() => {
    const anoAtual = new Date().getFullYear()
    const anoAnterior = anoAtual - 1
    const porMes = {}
    MESES.forEach((_, i) => {
      porMes[i] = { mes: MESES[i], valor: 0, valorAnoAnterior: 0 }
    })
    faturas.forEach((f) => {
      const d = f.data ? new Date(f.data) : new Date()
      const ano = d.getFullYear()
      const mes = d.getMonth()
      const v = Number(f.valor) || 0
      if (!porMes[mes]) porMes[mes] = { mes: MESES[mes], valor: 0, valorAnoAnterior: 0 }
      if (ano === anoAtual) porMes[mes].valor += v
      else if (ano === anoAnterior) porMes[mes].valorAnoAnterior += v
    })
    const lista = Object.values(porMes)
    const temAnoAnterior = lista.some((d) => d.valorAnoAnterior > 0)
    return { dados: lista, temAnoAnterior }
  }, [faturas])

  if (faturas.length === 0) {
    return (
      <section className="grafico-faturas grafico-vendas-mes">
        <h3 className="grafico-faturas__titulo">Vendas por mês</h3>
        <p className="grafico-faturas__vazio">Sem dados para mostrar.</p>
      </section>
    )
  }

  return (
    <section className="grafico-faturas grafico-vendas-mes" aria-label="Gráfico de vendas por mês com comparação ao ano anterior">
      <h3 className="grafico-faturas__titulo">Vendas por mês</h3>
      <div className="grafico-faturas__wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={dados} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k €` : `${v} €`)}
              tick={{ fontSize: 11 }}
              stroke="#64748b"
            />
            <Tooltip
              formatter={(value) => [formatarMoeda(value), 'Total']}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            {temAnoAnterior && <Legend wrapperStyle={{ fontSize: 12 }} />}
            <Bar dataKey="valor" name={`${new Date().getFullYear()}`} fill="#2563eb" radius={[4, 4, 0, 0]} />
            {temAnoAnterior && <Bar dataKey="valorAnoAnterior" name={`${new Date().getFullYear() - 1}`} fill="#94a3b8" radius={[4, 4, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default GraficoVendasMes
