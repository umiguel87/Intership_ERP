import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ESTADOS_FATURA } from '../../constants/roles'

const CORES = {
  'Rascunho': '#94a3b8',
  'Emitida': '#0ea5e9',
  'Por pagar': '#ea580c',
  'Paga': '#2563eb',
  'Anulada': '#64748b',
}
const COR_DEFAULT = '#94a3b8'

function GraficoFaturas({ faturas = [] }) {
  const dados = useMemo(() => {
    const porEstado = {}
    faturas.forEach((f) => {
      const e = (f.estado || '').trim() || 'Por pagar'
      porEstado[e] = (porEstado[e] || 0) + 1
    })
    const ordenados = [...ESTADOS_FATURA]
    Object.keys(porEstado).forEach((e) => {
      if (!ordenados.includes(e)) ordenados.push(e)
    })
    return ordenados
      .filter((nome) => porEstado[nome] > 0)
      .map((nome) => ({
        estado: nome,
        quantidade: porEstado[nome],
        fill: CORES[nome] || COR_DEFAULT,
      }))
  }, [faturas])

  if (dados.length === 0) {
    return (
      <section className="grafico-faturas">
        <h3 className="grafico-faturas__titulo">Faturas por estado</h3>
        <p className="grafico-faturas__vazio">Sem dados para mostrar.</p>
      </section>
    )
  }

  return (
    <section className="grafico-faturas" aria-label="Gráfico de faturas por estado">
      <h3 className="grafico-faturas__titulo">Faturas por estado</h3>
      <div className="grafico-faturas__wrapper grafico-faturas__wrapper--barras">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="estado" width={72} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`${value} fatura(s)`, 'Quantidade']}
              labelFormatter={(label) => label}
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="quantidade" name="Quantidade" radius={[0, 4, 4, 0]} barSize={28}>
              {dados.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default GraficoFaturas
