import Dashboard from '../components/dashboard/Dashboard'
import GraficoFaturas from '../components/dashboard/GraficoFaturas'
import GraficoVendasMes from '../components/dashboard/GraficoVendasMes'
import UltimasFaturas from '../components/dashboard/UltimasFaturas'

function DashboardPage({ totalVendas, totalPorPagar, totalPago, numFaturas, numClientes, numFaturasPorPagar, faturas, onMudarSecao }) {
  return (
    <>
      <Dashboard
        totalVendas={totalVendas}
        totalPorPagar={totalPorPagar}
        totalPago={totalPago}
        numFaturas={numFaturas}
        numClientes={numClientes}
        numFaturasPorPagar={numFaturasPorPagar}
        onIrParaContasAReceber={onMudarSecao ? () => onMudarSecao('contas-a-receber') : undefined}
      />
      <div className="dashboard__graficos">
        <GraficoFaturas faturas={faturas || []} />
        <GraficoVendasMes faturas={faturas || []} />
      </div>
      <UltimasFaturas faturas={faturas || []} max={5} />
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
