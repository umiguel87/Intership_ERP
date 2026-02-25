import { useMemo, useState } from 'react'
import ModalAlterarEstadoFatura from '../components/faturas/ModalAlterarEstadoFatura'
import { formatarData, formatarMoeda, isFaturaEmAtraso } from '../utils/formatadores'

const PAGE_SIZE = 20

function ContasAReceberPage({ faturas = [], onEditarFatura, onNotificar, permissoes = {} }) {
  const [faturaAAlterarEstado, setFaturaAAlterarEstado] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const porPagar = useMemo(
    () =>
      faturas
        .filter((f) => (f.estado || '').trim() === 'Por pagar')
        .sort((a, b) => new Date(a.data || 0).getTime() - new Date(b.data || 0).getTime()),
    [faturas]
  )

  const emAtraso = useMemo(() => porPagar.filter(isFaturaEmAtraso), [porPagar])
  const total = useMemo(() => porPagar.reduce((sum, f) => sum + (f.valor ?? 0), 0), [porPagar])
  const totalEmAtraso = useMemo(() => emAtraso.reduce((sum, f) => sum + (f.valor ?? 0), 0), [emAtraso])
  const porPagarVisiveis = useMemo(() => porPagar.slice(0, visibleCount), [porPagar, visibleCount])
  const temMais = visibleCount < porPagar.length
  const canAlterarEstado = permissoes.canMarcarFaturaPaga || permissoes.canMarcarFaturaAnulada

  return (
    <div className="contas-a-receber">
      <section className="contas-a-receber__resumo">
        <h2 className="contas-a-receber__titulo">Contas a receber</h2>
        <p className="contas-a-receber__total">
          Total por cobrar: <strong>{formatarMoeda(total)}</strong> ({porPagar.length} fatura{porPagar.length !== 1 ? 's' : ''})
        </p>
        {emAtraso.length > 0 && (
          <p className="contas-a-receber__atraso">
            <strong>{emAtraso.length}</strong> fatura{emAtraso.length !== 1 ? 's' : ''} em atraso · Total: <strong>{formatarMoeda(totalEmAtraso)}</strong>
          </p>
        )}
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
              {porPagarVisiveis.map((f) => {
                const atraso = isFaturaEmAtraso(f)
                return (
                <tr key={f.id} className={atraso ? 'lista-faturas__linha--atraso' : undefined}>
                  <td>{f.numero}</td>
                  <td>{formatarData(f.data)}{atraso && <span className="lista-faturas__badge lista-faturas__badge--atraso">Em atraso</span>}</td>
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
                )
              })}
            </tbody>
          </table>
          {temMais && (
            <div className="lista-faturas__carregar-mais">
              <button
                type="button"
                className="lista-faturas__btn lista-faturas__btn--carregar"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                aria-label="Carregar mais faturas"
              >
                Carregar mais ({porPagar.length - visibleCount} restantes)
              </button>
            </div>
          )}
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
