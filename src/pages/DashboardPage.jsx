import { useMemo } from 'react'
import Dashboard from '../components/dashboard/Dashboard'
import GraficoFaturas from '../components/dashboard/GraficoFaturas'
import GraficoVendasMes from '../components/dashboard/GraficoVendasMes'
import CalendarioFaturas from '../components/dashboard/CalendarioFaturas'

/** Faturas que contam para gráficos e calendário (exclui Rascunho e Anulada). */
function apenasEmitidas(faturas) {
  const list = Array.isArray(faturas) ? faturas : []
  return list.filter((f) => {
    const e = (f.estado || '').trim()
    return e !== 'Rascunho' && e !== 'Anulada'
  })
}

function DashboardPage({ totalVendas, totalPorPagar, totalPago, numFaturas, numClientes, numFaturasPorPagar, numFaturasEmAtraso = 0, totalEmAtraso = 0, faturas, onMudarSecao, onAbrirFatura, darkMode = false }) {
  const faturasParaGraficos = useMemo(() => apenasEmitidas(faturas), [faturas])

  return (
    <>
      <Dashboard
        totalVendas={totalVendas}
        totalPorPagar={totalPorPagar}
        totalPago={totalPago}
        numFaturas={numFaturas}
        numClientes={numClientes}
        numFaturasPorPagar={numFaturasPorPagar}
        numFaturasEmAtraso={numFaturasEmAtraso}
        totalEmAtraso={totalEmAtraso}
        onIrParaContasAReceber={onMudarSecao ? () => onMudarSecao('contas-a-receber') : undefined}
      />
      <div className="dashboard__graficos">
        <GraficoFaturas faturas={faturasParaGraficos} darkMode={darkMode} />
        <GraficoVendasMes faturas={faturasParaGraficos} darkMode={darkMode} />
      </div>
      <CalendarioFaturas faturas={faturasParaGraficos} onMudarSecao={onMudarSecao} onAbrirFatura={onAbrirFatura} />
      {numFaturas === 0 && (
        <div className="dashboard-empty" role="status">
          <strong>Sem dados ainda</strong>
          Ainda não existem faturas. Use a secção &quot;Faturas&quot; para adicionar a primeira.
        </div>
      )}
    </>
  )
}

export default DashboardPage
