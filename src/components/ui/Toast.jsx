import { useEffect } from 'react'

function Toast({ show, message, type = 'success', onClose }) {
  useEffect(() => {
    if (!show || !onClose) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [show, onClose])

  if (!show || !message) return null

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      <span className="toast__mensagem">{message}</span>
      {onClose && (
        <button
          type="button"
          className="toast__fechar"
          onClick={onClose}
          aria-label="Fechar"
        >
          <span className="toast__fechar-ico" aria-hidden>×</span>
        </button>
      )}
    </div>
  )
}

export default Toast
