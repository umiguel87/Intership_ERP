import Modal from './Modal'

function ConfirmModal({ aberto, titulo, mensagem, confirmarLabel = 'Confirmar', cancelarLabel = 'Cancelar', perigo = false, onConfirmar, onCancelar }) {
  return (
    <Modal aberto={aberto} onFechar={onCancelar} ariaLabelledBy={titulo ? 'confirm-modal-titulo' : undefined}>
      <div className="confirm-modal">
        {titulo && <h2 id="confirm-modal-titulo" className="confirm-modal__titulo">{titulo}</h2>}
        {mensagem && <p className="confirm-modal__mensagem">{mensagem}</p>}
        <div className="confirm-modal__botoes">
          <button type="button" className="confirm-modal__btn confirm-modal__btn--cancelar" onClick={onCancelar}>
            {cancelarLabel}
          </button>
          <button
            type="button"
            className={`confirm-modal__btn confirm-modal__btn--confirmar ${perigo ? 'confirm-modal__btn--perigo' : ''}`}
            onClick={onConfirmar}
          >
            {confirmarLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal
