import { useEffect, useRef } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function Modal({ aberto, onFechar, children, ariaLabelledBy }) {
  const contentRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onFechar?.()
    }
    if (aberto) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      const el = contentRef.current
      if (el) {
        const focusable = el.querySelectorAll(FOCUSABLE)
        const first = focusable[0]
        if (first && typeof first.focus === 'function') {
          requestAnimationFrame(() => first.focus())
        }
      }
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  useEffect(() => {
    if (!aberto || !contentRef.current) return
    const el = contentRef.current
    const handleTab = (e) => {
      if (e.key !== 'Tab') return
      const focusable = [...el.querySelectorAll(FOCUSABLE)]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    el.addEventListener('keydown', handleTab)
    return () => el.removeEventListener('keydown', handleTab)
  }, [aberto])

  if (!aberto) return null

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onFechar?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy || undefined}
    >
      <div ref={contentRef} className="modal-content">
        {children}
      </div>
    </div>
  )
}

export default Modal
