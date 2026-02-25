import FormNovoCliente from '../components/clientes/FormNovoCliente'
import ListaClientes from '../components/clientes/ListaClientes'

function ClientesPage({ clientes, faturas = [], initialPesquisa, onInitialPesquisaAplicada, clienteDetalheFromSearch, onClienteDetalheFromSearchClear, onAdicionar, onRemover, onEditarCliente, onNotificar, permissoes = {} }) {
  return (
    <>
      {permissoes.canCriarCliente && (
        <FormNovoCliente onAdicionar={onAdicionar} onNotificar={onNotificar} />
      )}
      <ListaClientes
        clientes={clientes}
        faturas={faturas}
        initialPesquisa={initialPesquisa}
        onInitialPesquisaAplicada={onInitialPesquisaAplicada}
        clienteDetalheFromSearch={clienteDetalheFromSearch}
        onClienteDetalheFromSearchClear={onClienteDetalheFromSearchClear}
        onRemover={onRemover}
        onEditarCliente={onEditarCliente}
        onNotificar={onNotificar}
        permissoes={permissoes}
      />
    </>
  )
}

export default ClientesPage
