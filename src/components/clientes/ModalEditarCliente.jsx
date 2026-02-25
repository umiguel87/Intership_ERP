import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import ConfirmModal from '../ui/ConfirmModal'
import { validarNifPT } from '../../utils/validarNif'

function ModalEditarCliente({ cliente, onGuardar, onFechar }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [nif, setNif] = useState('')
  const [erros, setErros] = useState({})
  const [mostrarConfirmarSair, setMostrarConfirmarSair] = useState(false)

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome || '')
      setEmail(cliente.email || '')
      setNif(cliente.nif || '')
      setErros({})
    }
  }, [cliente])

  if (!cliente) return null

  const isDirty = nome !== (cliente.nome || '') || email !== (cliente.email || '') || nif !== (cliente.nif || '')

  const handlePedirFechar = () => {
    if (isDirty) setMostrarConfirmarSair(true)
    else onFechar()
  }

  const validar = () => {
    const e = {}
    if (!nome.trim()) e.nome = 'Nome é obrigatório.'
    if (!email.trim()) e.email = 'Email é obrigatório.'
    if (nif.trim()) {
      const res = validarNifPT(nif)
      if (!res.valido) e.nif = res.mensagem
    }
    setErros(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validar()) return
    onGuardar({
      ...cliente,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      nif: nif.trim() || undefined,
    })
    onFechar()
  }

  return (
    <>
      <Modal aberto={!!cliente} onFechar={handlePedirFechar} ariaLabelledBy="modal-editar-cliente-titulo">
        <div className="modal-editar" id="modal-editar-cliente" role="document" aria-labelledby="modal-editar-cliente-titulo">
          <h2 id="modal-editar-cliente-titulo" className="modal-editar__titulo">Editar cliente</h2>
        <form className="modal-editar__form" onSubmit={handleSubmit}>
          <div className="form-fatura__campo">
            <label htmlFor="edit-cliente-nome">Nome</label>
            <input
              id="edit-cliente-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            {erros.nome && <span className="form-fatura__erro">{erros.nome}</span>}
          </div>
          <div className="form-fatura__campo">
            <label htmlFor="edit-cliente-email">Email</label>
            <input
              id="edit-cliente-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {erros.email && <span className="form-fatura__erro">{erros.email}</span>}
          </div>
          <div className="form-fatura__campo">
            <label htmlFor="edit-cliente-nif">NIF (opcional)</label>
            <input
              id="edit-cliente-nif"
              type="text"
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              aria-invalid={!!erros.nif}
              aria-describedby={erros.nif ? 'edit-cliente-nif-erro' : undefined}
            />
            {erros.nif && <span id="edit-cliente-nif-erro" className="form-fatura__erro" role="alert">{erros.nif}</span>}
          </div>
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
    </>
  )
}

export default ModalEditarCliente
