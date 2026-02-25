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
          <div className="dashboard__alerta-wrapper">
            {temEmAtraso && (
              <div className="dashboard__alerta dashboard__alerta--atraso">
                <span className="dashboard__alerta-num">{numFaturasEmAtraso}</span>
                <span className="dashboard__alerta-label">Em atraso</span>
                <span className="dashboard__alerta-total">{formatarMoeda(totalEmAtraso)}</span>
              </div>
            )}
            {temPorPagar && (
              <div className="dashboard__alerta dashboard__alerta--por-pagar">
                <span className="dashboard__alerta-num">{numFaturasPorPagar}</span>
                <span className="dashboard__alerta-label">Por pagar</span>
                <span className="dashboard__alerta-total">{formatarMoeda(totalPorPagar)}</span>
              </div>
            )}
            <button
              type="button"
              className="dashboard__alerta-btn"
              onClick={onIrParaContasAReceber}
            >
              Ver Contas a Receber
            </button>
          </div>
        </div>
      )}
      <div className="dashboard__cards">
        <div className="dashboard__card dashboard__card--por-pagar">
          <span className="dashboard__card-label">Total por pagar</span>
          <span className="dashboard__card-valor">{formatarMoeda(totalPorPagar)}</span>
          {numFaturasPorPagar > 0 && (
            <span className="dashboard__card-extra">{numFaturasPorPagar} fatura{numFaturasPorPagar !== 1 ? 's' : ''}</span>
          )}
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
