import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'

function ModalAlterarEstadoFatura({ fatura, estadosPermitidos = [], onGuardar, onFechar }) {
  const [novoEstado, setNovoEstado] = useState('Paga')
  const [justificacao, setJustificacao] = useState('')
  const [erro, setErro] = useState('')

  const opcoes = estadosPermitidos.length > 0 ? estadosPermitidos : ['Paga', 'Anulada']

  useEffect(() => {
    if (fatura) {
      const inicial = opcoes.includes(fatura.estado) ? fatura.estado : opcoes[0]
      setNovoEstado(inicial)
      setJustificacao(fatura.justificacao || '')
      setErro('')
    }
  }, [fatura, opcoes])

  if (!fatura) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (novoEstado === 'Anulada' && !justificacao.trim()) {
      setErro('A justificação é obrigatória ao anular a fatura.')
      return
    }
    setErro('')
    onGuardar({
      ...fatura,
      estado: novoEstado,
      ...(novoEstado === 'Anulada' ? { justificacao: justificacao.trim() } : { justificacao: '' }),
    })
    onFechar()
  }

  return (
    <Modal aberto={!!fatura} onFechar={onFechar} ariaLabelledBy="modal-alterar-estado-titulo">
      <div className="modal-editar" role="document" aria-labelledby="modal-alterar-estado-titulo">
        <h2 id="modal-alterar-estado-titulo" className="modal-editar__titulo">Alterar estado da fatura</h2>
        <p className="modal-editar__subtitulo">Fatura {fatura.numero || '—'}</p>
        <form className="modal-editar__form" onSubmit={handleSubmit}>
          <div className="form-fatura__campo">
            <label>Novo estado</label>
            <div className="modal-alterar-estado__opcoes">
              {opcoes.map((op) => (
                <label key={op} className="modal-alterar-estado__radio">
                  <input
                    type="radio"
                    name="novoEstado"
                    value={op}
                    checked={novoEstado === op}
                    onChange={() => setNovoEstado(op)}
                  />
                  <span>{op}</span>
                </label>
              ))}
            </div>
          </div>
          {novoEstado === 'Anulada' && (
            <div className="form-fatura__campo">
              <label htmlFor="alterar-estado-justificacao">Justificação (obrigatória)</label>
              <textarea
                id="alterar-estado-justificacao"
                className="form-fatura__textarea"
                value={justificacao}
                onChange={(e) => setJustificacao(e.target.value)}
                placeholder="Indique o motivo da anulação..."
                rows={3}
                required={novoEstado === 'Anulada'}
              />
              {erro && <span className="form-fatura__erro">{erro}</span>}
            </div>
          )}
          <div className="modal-editar__botoes">
            <button type="button" className="modal-editar__btn modal-editar__btn--sec" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="modal-editar__btn modal-editar__btn--pri">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default ModalAlterarEstadoFatura
