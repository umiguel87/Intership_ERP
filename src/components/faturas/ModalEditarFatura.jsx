import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import ConfirmModal from '../ui/ConfirmModal'
import { ESTADOS_FATURA } from '../../constants/roles'

const ESTADO_POR_PAGAR = 'Por pagar'

function ModalEditarFatura({ fatura, clientes = [], estadosPermitidos = [], confirmarEditarAnulada = false, onGuardar, onFechar }) {
  const opcoesEstado = estadosPermitidos.length > 0 ? ESTADOS_FATURA.filter((e) => estadosPermitidos.includes(e)) : ESTADOS_FATURA
  const [data, setData] = useState('')
  const [cliente, setCliente] = useState('')
  const [valor, setValor] = useState('')
  const [estado, setEstado] = useState(ESTADO_POR_PAGAR)
  const [justificacao, setJustificacao] = useState('')
  const [erros, setErros] = useState({})
  const [mostrarConfirmarSair, setMostrarConfirmarSair] = useState(false)
  const [mostrarConfirmarEditarAnulada, setMostrarConfirmarEditarAnulada] = useState(false)

  useEffect(() => {
    if (fatura) {
      setData(fatura.data ? fatura.data.slice(0, 10) : '')
      setCliente(fatura.cliente || '')
      setValor(fatura.valor ?? '')
      const permitidos = estadosPermitidos.length > 0 ? ESTADOS_FATURA.filter((e) => estadosPermitidos.includes(e)) : ESTADOS_FATURA
      const estadoInicial = fatura.estado && permitidos.includes(fatura.estado) ? fatura.estado : (permitidos[0] || ESTADO_POR_PAGAR)
      setEstado(estadoInicial)
      setJustificacao(fatura.justificacao || '')
      setErros({})
    }
  }, [fatura, estadosPermitidos])

  if (!fatura) return null

  const dataInicial = fatura.data ? fatura.data.slice(0, 10) : ''
  const isDirty = data !== dataInicial || cliente !== (fatura.cliente || '') || String(valor) !== String(fatura.valor ?? '') || estado !== (fatura.estado || ESTADO_POR_PAGAR) || (estado === 'Anulada' && justificacao !== (fatura.justificacao || ''))

  const handlePedirFechar = () => {
    if (isDirty) setMostrarConfirmarSair(true)
    else onFechar()
  }

  const validar = () => {
    const e = {}
    if (!cliente.trim()) e.cliente = 'Cliente é obrigatório.'
    const v = Number(valor)
    if (Number.isNaN(v) || v <= 0) e.valor = 'Valor tem de ser maior que 0.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const submeterGuardar = () => {
    onGuardar({
      ...fatura,
      data,
      cliente: cliente.trim(),
      valor: Number(valor),
      estado: estado || 'Por pagar',
      justificacao: estado === 'Anulada' ? (justificacao || '').trim() : '',
    })
    setMostrarConfirmarEditarAnulada(false)
    onFechar()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validar()) return
    if (confirmarEditarAnulada && (fatura.estado || '').trim() === 'Anulada') {
      setMostrarConfirmarEditarAnulada(true)
      return
    }
    submeterGuardar()
  }

  return (
    <>
      <Modal aberto={!!fatura} onFechar={handlePedirFechar} ariaLabelledBy="modal-editar-fatura-titulo">
        <div className="modal-editar" id="modal-editar-fatura" role="document" aria-labelledby="modal-editar-fatura-titulo">
          <h2 id="modal-editar-fatura-titulo" className="modal-editar__titulo">Editar fatura</h2>
        <form className="modal-editar__form" onSubmit={handleSubmit}>
          <div className="form-fatura__campo">
            <label>Número</label>
            <input type="text" value={fatura.numero} readOnly className="form-fatura__input--readonly" />
          </div>
          <div className="form-fatura__campo">
            <label htmlFor="edit-fatura-data">Data</label>
            <input
              id="edit-fatura-data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>
          {clientes.length > 0 ? (
            <div className="form-fatura__campo">
              <label htmlFor="edit-fatura-cliente">Cliente</label>
              <select
                id="edit-fatura-cliente"
                value={clientes.find((c) => c.nome === cliente)?.id || ''}
                onChange={(e) => {
                  const c = clientes.find((x) => x.id === e.target.value)
                  setCliente(c ? c.nome : '')
                }}
                required
              >
                <option value="">— Selecionar —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-fatura__campo">
              <label htmlFor="edit-fatura-cliente-nome">Cliente</label>
              <input
                id="edit-fatura-cliente-nome"
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                required
              />
              {erros.cliente && <span className="form-fatura__erro">{erros.cliente}</span>}
            </div>
          )}
          <div className="form-fatura__campo">
            <label htmlFor="edit-fatura-valor">Valor (€)</label>
            <input
              id="edit-fatura-valor"
              type="number"
              step="0.01"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
            {erros.valor && <span className="form-fatura__erro">{erros.valor}</span>}
          </div>
          <div className="form-fatura__campo">
            <label htmlFor="edit-fatura-estado">Estado</label>
            <select id="edit-fatura-estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
              {opcoesEstado.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>
          {estado === 'Anulada' && (
            <div className="form-fatura__campo">
              <label htmlFor="edit-fatura-justificacao">Justificação da anulação</label>
              <textarea
                id="edit-fatura-justificacao"
                className="form-fatura__textarea"
                value={justificacao}
                onChange={(e) => setJustificacao(e.target.value)}
                placeholder="Motivo da anulação (opcional na edição)"
                rows={3}
              />
            </div>
          )}
          <div className="modal-editar__botoes">
            <button type="button" className="modal-editar__btn modal-editar__btn--sec" onClick={handlePedirFechar}>
              Cancelar
            </button>
            <button type="submit" className="modal-editar__btn modal-editar__btn--pri">
              Guardar
            </button>
          </div>
        </form>
        </div>
      </Modal>
      <ConfirmModal
        aberto={mostrarConfirmarSair}
        titulo="Sair sem guardar?"
        mensagem="Tem alterações por guardar. Deseja sair?"
        confirmarLabel="Sair"
        cancelarLabel="Continuar a editar"
        onConfirmar={() => { setMostrarConfirmarSair(false); onFechar() }}
        onCancelar={() => setMostrarConfirmarSair(false)}
      />
      <ConfirmModal
        aberto={mostrarConfirmarEditarAnulada}
        titulo="Editar fatura anulada"
        mensagem="Esta fatura está anulada. Tem a certeza que deseja editar?"
        confirmarLabel="Sim, editar"
        cancelarLabel="Cancelar"
        onConfirmar={submeterGuardar}
        onCancelar={() => setMostrarConfirmarEditarAnulada(false)}
      />
    </>
  )
}

export default ModalEditarFatura
