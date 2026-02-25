import { formatarData, formatarMoeda } from '../../utils/formatadores'

function UltimasFaturas({ faturas = [], max = 5 }) {
  const ultimas = [...faturas]
    .sort((a, b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime())
    .slice(0, max)

  if (ultimas.length === 0) {
    return (
      <section className="ultimas-faturas">
        <h3 className="ultimas-faturas__titulo">Últimas faturas</h3>
        <p className="ultimas-faturas__vazio">Ainda não há faturas.</p>
      </section>
    )
  }

  return (
    <section className="ultimas-faturas" aria-label="Últimas faturas emitidas">
      <h3 className="ultimas-faturas__titulo">Últimas faturas</h3>
      <div className="ultimas-faturas__wrapper">
        <table className="ultimas-faturas__tabela">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ultimas.map((f) => (
              <tr key={f.id}>
                <td>{f.numero}</td>
                <td>{formatarData(f.data)}</td>
                <td>{f.cliente || '—'}</td>
                <td className="ultimas-faturas__valor">{formatarMoeda(f.valor)}</td>
                <td>{f.estado || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default UltimasFaturas
