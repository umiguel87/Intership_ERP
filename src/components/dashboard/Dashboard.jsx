import TotalVendas from './TotalVendas'
import { formatarMoeda } from '../../utils/formatadores'

function Dashboard({ totalVendas, totalPorPagar = 0, totalPago = 0, numFaturas, numClientes = 0, numFaturasPorPagar = 0, numFaturasEmAtraso = 0, totalEmAtraso = 0, onIrParaContasAReceber }) {
  const temPorPagar = numFaturasPorPagar > 0
  const temEmAtraso = numFaturasEmAtraso > 0

  return (
    <div className="dashboard">
      <TotalVendas total={totalVendas} />
      {onIrParaContasAReceber && (temEmAtraso || temPorPagar) && (
        <div className="dashboard__alertas">
          {temEmAtraso && (
            <div className="dashboard__alerta dashboard__alerta--atraso">
              <span className="dashboard__alerta-texto">
                <strong>{numFaturasEmAtraso}</strong> fatura(s) em atraso · Total: <strong>{formatarMoeda(totalEmAtraso)}</strong>
              </span>
              <button
                type="button"
                className="dashboard__alerta-btn"
                onClick={onIrParaContasAReceber}
              >
                Ver Contas a Receber
              </button>
            </div>
          )}
          {temPorPagar && (
            <div className="dashboard__alerta">
              <span className="dashboard__alerta-texto">
                <strong>{numFaturasPorPagar}</strong> fatura(s) por pagar · Total: <strong>{formatarMoeda(totalPorPagar)}</strong>
              </span>
              <button
                type="button"
                className="dashboard__alerta-btn"
                onClick={onIrParaContasAReceber}
              >
                Ver Contas a Receber
              </button>
            </div>
          )}
        </div>
      )}
      <div className="dashboard__cards">
        <div className="dashboard__card dashboard__card--por-pagar">
          <span className="dashboard__card-label">Total por pagar</span>
          <span className="dashboard__card-valor">{formatarMoeda(totalPorPagar)}</span>
        </div>
        <div className="dashboard__card dashboard__card--pago">
          <span className="dashboard__card-label">Total pago</span>
          <span className="dashboard__card-valor">{formatarMoeda(totalPago)}</span>
        </div>
        <div className="dashboard__card dashboard__card--faturas">
          <span className="dashboard__card-label">Nº de faturas</span>
          <span className="dashboard__card-valor">{numFaturas}</span>
        </div>
        <div className="dashboard__card dashboard__card--clientes">
          <span className="dashboard__card-label">Nº de clientes</span>
          <span className="dashboard__card-valor">{numClientes}</span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
