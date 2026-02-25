import FormNovaFatura from '../components/faturas/FormNovaFatura'
import ListaFaturas from '../components/faturas/ListaFaturas'

function FaturasPage({ faturas, clientes, initialPesquisa, onInitialPesquisaAplicada, faturaDetalheFromSearch, onFaturaDetalheFromSearchClear, onAdicionar, onRemover, onEditarFatura, onNotificar, permissoes = {} }) {
  return (
    <>
      {permissoes.canCriarFatura && (
        <FormNovaFatura
          faturas={faturas}
          clientes={clientes}
          onAdicionar={onAdicionar}
          onNotificar={onNotificar}
        />
      )}
      <ListaFaturas
        faturas={faturas}
        clientes={clientes}
        initialPesquisa={initialPesquisa}
        onInitialPesquisaAplicada={onInitialPesquisaAplicada}
        faturaDetalheFromSearch={faturaDetalheFromSearch}
        onFaturaDetalheFromSearchClear={onFaturaDetalheFromSearchClear}
        onRemover={onRemover}
        onEditarFatura={onEditarFatura}
        onAdicionar={onAdicionar}
        onNotificar={onNotificar}
        permissoes={permissoes}
      />
    </>
  )
}

export default FaturasPage
