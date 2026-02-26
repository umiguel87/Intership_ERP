import { useState } from 'react'
import { ESTADOS_FATURA } from '../../constants/roles'

const ESTADO_RASCUNHO = 'Rascunho'

function FormNovaFatura({ clientes = [], onAdicionar, onNotificar }) {
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [cliente, setCliente] = useState('')
  const [selectedClienteId, setSelectedClienteId] = useState('')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [estado, setEstado] = useState(ESTADO_RASCUNHO)
  const [erros, setErros] = useState({})

  const validar = () => {
    const v = Number(valor)
    return cliente.trim() !== '' && !Number.isNaN(v) && v > 0
  }

  const validarComErros = () => {
    const e = {}
    if (!cliente.trim()) e.cliente = 'Cliente é obrigatório.'
    const v = Number(valor)
    if (Number.isNaN(v) || v <= 0) e.valor = 'Valor tem de ser maior que 0.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const handleSelectCliente = (e) => {
    const id = e.target.value
    setSelectedClienteId(id)
    if (!id) {
      setCliente('')
      return
    }
    const c = clientes.find((x) => x.id === id)
    if (c) setCliente(c.nome)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validarComErros() || !onAdicionar) return
    const novaFatura = {
      id: crypto.randomUUID(),
      data,
      cliente: cliente.trim(),
      valor: Number(valor),
      descricao: (descricao || '').trim(),
      estado: estado || ESTADO_RASCUNHO,
    }
    onAdicionar(novaFatura)
    setErros({})
    setData(new Date().toISOString().slice(0, 10))
    setCliente('')
    setSelectedClienteId('')
    setValor('')
    setDescricao('')
    setEstado(ESTADO_RASCUNHO)
    onNotificar?.('Fatura adicionada.')
  }

  return (
    <section className="form-fatura">
      <h2 className="form-fatura__titulo">Nova fatura</h2>
      <form className="form-fatura__form" onSubmit={handleSubmit}>
        <div className="form-fatura__campo">
          <label htmlFor="numero">Número</label>
          <input
            id="numero"
            type="text"
            value="—"
            readOnly
            className="form-fatura__input--readonly"
            aria-label="Número atribuído ao emitir a fatura"
          />
          <span className="form-fatura__hint">Atribuído ao passar a fatura a Emitida</span>
        </div>
        <div className="form-fatura__campo">
          <label htmlFor="data">Data</label>
          <input
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </div>
        {(clientes.filter((c) => c.ativo !== false).length > 0) ? (
          <div className="form-fatura__campo form-fatura__campo--cliente">
            <label htmlFor="escolher-cliente">Cliente</label>
            <select
              id="escolher-cliente"
              value={selectedClienteId}
              onChange={handleSelectCliente}
              required
              aria-label="Selecionar cliente"
            >
              <option value="">Selecionar cliente</option>
              {clientes.filter((c) => c.ativo !== false).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} {c.email ? `(${c.email})` : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="form-fatura__campo form-fatura__campo--cliente">
            <label htmlFor="cliente">Cliente</label>
            <input
              id="cliente"
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nome do cliente"
              required
            />
            {erros.cliente && <span className="form-fatura__erro">{erros.cliente}</span>}
          </div>
        )}
        <div className="form-fatura__campo">
          <label htmlFor="valor">Valor (€)</label>
          <input
            id="valor"
            type="number"
            step="0.01"
            min="0"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            required
          />
          {erros.valor && <span className="form-fatura__erro">{erros.valor}</span>}
        </div>
        <div className="form-fatura__campo">
          <label htmlFor="descricao">Descrição (opcional)</label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Serviços de consultoria, licença anual..."
            rows={3}
            className="form-fatura__textarea"
          />
        </div>
        <div className="form-fatura__campo">
          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            {ESTADOS_FATURA.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>
        <div className="form-fatura__acoes">
          <button type="submit" className="form-fatura__submit" disabled={!validar()}>
            Adicionar fatura
          </button>
        </div>
      </form>
    </section>
  )
}

export default FormNovaFatura
