import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Rectangle } from 'recharts'
import { ESTADOS_FATURA } from '../../constants/roles'

/** Cursor do tooltip em dark mode: retângulo discreto em vez do cinzento claro */
function CursorDark (props) {
  const { x, y, width, height } = props
  if (x == null || y == null || width == null || height == null) return null
  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(51, 65, 85, 0.4)"
      stroke="#475569"
      strokeWidth={1}
    />
  )
}

const CORES = {
  'Rascunho': '#94a3b8',
  'Emitida': '#0ea5e9',
  'Por pagar': '#ea580c',
  'Paga': '#2563eb',
  'Anulada': '#64748b',
}
const COR_DEFAULT = '#94a3b8'

const TICK_LIGHT = { fontSize: 12 }
const TICK_DARK = { fontSize: 12, fill: '#cbd5e1' }

function GraficoFaturas({ faturas = [], darkMode = false }) {
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
      <section className={`grafico-faturas ${darkMode ? 'grafico-faturas--dark' : ''}`}>
        <h3 className="grafico-faturas__titulo">Faturas por estado</h3>
        <p className="grafico-faturas__vazio">Sem dados para mostrar.</p>
      </section>
    )
  }

  return (
    <section className={`grafico-faturas ${darkMode ? 'grafico-faturas--dark' : ''}`} aria-label="Gráfico de faturas por estado">
      <h3 className="grafico-faturas__titulo">Faturas por estado</h3>
      <div className="grafico-faturas__wrapper grafico-faturas__wrapper--barras">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
            <XAxis
              type="number"
              allowDecimals={false}
              tick={darkMode ? TICK_DARK : TICK_LIGHT}
              stroke={darkMode ? '#94a3b8' : '#64748b'}
            />
            <YAxis
              type="category"
              dataKey="estado"
              width={72}
              tick={darkMode ? TICK_DARK : TICK_LIGHT}
              stroke={darkMode ? '#94a3b8' : '#64748b'}
            />
            <Tooltip
              formatter={(value) => [`${value} fatura(s)`, 'Quantidade']}
              labelFormatter={(label) => label}
              contentStyle={{
                borderRadius: 8,
                border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                background: darkMode ? '#1e293b' : '#fff',
                color: darkMode ? '#e2e8f0' : '#0f172a',
              }}
              itemStyle={{ color: darkMode ? '#cbd5e1' : undefined }}
              labelStyle={{ color: darkMode ? '#f1f5f9' : undefined }}
              cursor={darkMode ? <CursorDark /> : true}
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
