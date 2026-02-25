import Dashboard from '../components/dashboard/Dashboard'
import GraficoFaturas from '../components/dashboard/GraficoFaturas'
import GraficoVendasMes from '../components/dashboard/GraficoVendasMes'
import CalendarioFaturas from '../components/dashboard/CalendarioFaturas'

function DashboardPage({ totalVendas, totalPorPagar, totalPago, numFaturas, numClientes, numFaturasPorPagar, numFaturasEmAtraso = 0, totalEmAtraso = 0, faturas, onMudarSecao, onAbrirFatura }) {
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
        <GraficoFaturas faturas={faturas || []} />
        <GraficoVendasMes faturas={faturas || []} />
      </div>
      <CalendarioFaturas faturas={faturas || []} onMudarSecao={onMudarSecao} onAbrirFatura={onAbrirFatura} />
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
