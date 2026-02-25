import { useMemo, useState } from 'react'
import ModalAlterarEstadoFatura from '../components/faturas/ModalAlterarEstadoFatura'
import { formatarData, formatarMoeda } from '../utils/formatadores'

function ContasAReceberPage({ faturas = [], onEditarFatura, onNotificar, permissoes = {} }) {
  const [faturaAAlterarEstado, setFaturaAAlterarEstado] = useState(null)

  const porPagar = useMemo(
    () =>
      faturas
        .filter((f) => (f.estado || '').trim() === 'Por pagar')
        .sort((a, b) => new Date(b.data || 0).getTime() - new Date(a.data || 0).getTime()),
    [faturas]
  )

  const total = useMemo(() => porPagar.reduce((sum, f) => sum + (f.valor ?? 0), 0), [porPagar])
  const canAlterarEstado = permissoes.canMarcarFaturaPaga || permissoes.canMarcarFaturaAnulada

  return (
    <div className="contas-a-receber">
      <section className="contas-a-receber__resumo">
        <h2 className="contas-a-receber__titulo">Contas a receber</h2>
        <p className="contas-a-receber__total">
          Total por cobrar: <strong>{formatarMoeda(total)}</strong> ({porPagar.length} fatura{porPagar.length !== 1 ? 's' : ''})
        </p>
      </section>

      {porPagar.length === 0 ? (
        <p className="lista-faturas__vazia">Não há faturas por pagar.</p>
      ) : (
        <div className="lista-faturas__wrapper">
          <table className="lista-faturas__tabela">
            <thead>
              <tr>
                <th>Nº</th>
                <th>Data</th>
                <th>Cliente</th>
                <th className="lista-faturas__valor">Valor</th>
                {canAlterarEstado && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {porPagar.map((f) => (
                <tr key={f.id}>
                  <td>{f.numero}</td>
                  <td>{formatarData(f.data)}</td>
                  <td>{f.cliente}</td>
                  <td className="lista-faturas__valor">{formatarMoeda(f.valor)}</td>
                  {canAlterarEstado && (
                    <td>
                      <button
                        type="button"
                        className="lista-faturas__btn lista-faturas__btn--estado"
                        onClick={() => setFaturaAAlterarEstado(f)}
                        aria-label={`Alterar estado da fatura ${f.numero}`}
                      >
                        Alterar estado
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModalAlterarEstadoFatura
        fatura={faturaAAlterarEstado}
        estadosPermitidos={permissoes.getEstadosPermitidosParaAlterar?.() ?? []}
        onGuardar={(dados) => {
          onEditarFatura?.(dados.id, { estado: dados.estado, justificacao: dados.justificacao ?? '' })
          onNotificar?.('Estado da fatura atualizado.')
          setFaturaAAlterarEstado(null)
        }}
        onFechar={() => setFaturaAAlterarEstado(null)}
      />
    </div>
  )
}

export default ContasAReceberPage
