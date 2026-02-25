import Modal from '../ui/Modal'
import { formatarData, formatarMoeda } from '../../utils/formatadores'

function DetalheCliente({ cliente, faturas = [], onFechar }) {
  if (!cliente) return null

  const faturasDoCliente = faturas.filter((f) => (f.cliente || '').trim() === (cliente.nome || '').trim())

  return (
    <Modal aberto={!!cliente} onFechar={onFechar}>
      <div className="detalhe-cliente">
        <h2 className="detalhe-cliente__titulo">Cliente</h2>

        <div className="detalhe-cliente__info">
          <dl className="detalhe-cliente__dl">
            <dt>Nome</dt>
            <dd>{cliente.nome || '—'}</dd>
            <dt>Email</dt>
            <dd>{cliente.email || '—'}</dd>
            <dt>NIF</dt>
            <dd>{cliente.nif || '—'}</dd>
          </dl>
        </div>

        <div className="detalhe-cliente__faturas">
          <h3 className="detalhe-cliente__subtitulo">
            Faturas associadas ({faturasDoCliente.length})
          </h3>
          {faturasDoCliente.length === 0 ? (
            <p className="detalhe-cliente__vazio">Nenhuma fatura associada a este cliente.</p>
          ) : (
            <div className="detalhe-cliente__tabela-wrapper">
              <table className="lista-faturas__tabela detalhe-cliente__tabela">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Data</th>
                    <th className="lista-faturas__valor">Valor</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {faturasDoCliente.map((f) => (
                    <tr key={f.id}>
                      <td>{f.numero}</td>
                      <td>{formatarData(f.data)}</td>
                      <td className="lista-faturas__valor">{formatarMoeda(f.valor)}</td>
                      <td>{f.estado || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="detalhe-cliente__acoes">
          <button type="button" className="modal-editar__btn modal-editar__btn--pri" onClick={onFechar}>
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DetalheCliente
