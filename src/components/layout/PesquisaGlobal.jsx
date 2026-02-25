import { useState, useMemo, useRef, useEffect } from 'react'

const MAX_RESULTADOS_PREVIEW = 3

function PesquisaGlobal({ faturas = [], clientes = [], onIrParaFaturas, onIrParaClientes, onSelecionarFatura, onSelecionarCliente }) {
  const [termo, setTermo] = useState('')
  const [focado, setFocado] = useState(false)
  const containerRef = useRef(null)

  const q = termo.trim().toLowerCase()

  const { faturasMatch, clientesMatch } = useMemo(() => {
    if (!q) {
      return { faturasMatch: [], clientesMatch: [] }
    }
    const faturasMatch = faturas.filter(
      (f) =>
        (f.numero || '').toLowerCase().includes(q) ||
        (f.cliente || '').toLowerCase().includes(q)
    )
    const clientesMatch = clientes.filter(
      (c) =>
        (c.nome || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    )
    return { faturasMatch, clientesMatch }
  }, [faturas, clientes, q])

  const temResultados = faturasMatch.length > 0 || clientesMatch.length > 0
  const mostrarDropdown = focado

  useEffect(() => {
    const handleClickFora = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocado(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => document.removeEventListener('mousedown', handleClickFora)
  }, [])

  const fecharDropdown = () => {
    setTermo('')
    setFocado(false)
  }

  const handleIrFaturas = () => {
    onIrParaFaturas?.(termo.trim())
    fecharDropdown()
  }

  const handleIrClientes = () => {
    onIrParaClientes?.(termo.trim())
    fecharDropdown()
  }

  const handleClicarFatura = (f) => {
    onSelecionarFatura?.(f)
    fecharDropdown()
  }

  const handleClicarCliente = (c) => {
    onSelecionarCliente?.(c)
    fecharDropdown()
  }

  return (
    <div className="pesquisa-global" ref={containerRef}>
      <label htmlFor="pesquisa-global-input" className="pesquisa-global__label">
        Pesquisar
      </label>
      <div className="pesquisa-global__input-wrap">
        <span className="pesquisa-global__icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          id="pesquisa-global-input"
          type="search"
          className="pesquisa-global__input"
          placeholder="Faturas e clientes..."
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onFocus={() => setFocado(true)}
          aria-label="Pesquisa global em faturas e clientes"
          aria-expanded={mostrarDropdown}
          aria-autocomplete="list"
        />
      </div>

      {mostrarDropdown && (
        <div className="pesquisa-global__dropdown" role="listbox">
          {q.length === 0 ? (
            <p className="pesquisa-global__dropdown-vazio">Escreva para pesquisar em faturas e clientes.</p>
          ) : !temResultados ? (
            <p className="pesquisa-global__dropdown-vazio">Nenhum resultado encontrado.</p>
          ) : (
            <>
              {faturasMatch.length > 0 && (
                <div className="pesquisa-global__grupo">
                  <button
                    type="button"
                    className="pesquisa-global__grupo-titulo"
                    onClick={handleIrFaturas}
                    role="option"
                  >
                    Faturas ({faturasMatch.length})
                  </button>
                  <ul className="pesquisa-global__lista">
                    {faturasMatch.slice(0, MAX_RESULTADOS_PREVIEW).map((f) => (
                      <li key={f.id} className="pesquisa-global__item">
                        <button
                          type="button"
                          className="pesquisa-global__item-btn"
                          onClick={() => handleClicarFatura(f)}
                          aria-label={`Ver fatura ${f.numero}`}
                        >
                          <span className="pesquisa-global__item-num">{f.numero}</span>
                          <span className="pesquisa-global__item-texto">{f.cliente || '—'}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="pesquisa-global__ver-tudo"
                    onClick={handleIrFaturas}
                  >
                    Ver todas as faturas →
                  </button>
                </div>
              )}
              {clientesMatch.length > 0 && (
                <div className="pesquisa-global__grupo">
                  <button
                    type="button"
                    className="pesquisa-global__grupo-titulo"
                    onClick={handleIrClientes}
                    role="option"
                  >
                    Clientes ({clientesMatch.length})
                  </button>
                  <ul className="pesquisa-global__lista">
                    {clientesMatch.slice(0, MAX_RESULTADOS_PREVIEW).map((c) => (
                      <li key={c.id} className="pesquisa-global__item">
                        <button
                          type="button"
                          className="pesquisa-global__item-btn"
                          onClick={() => handleClicarCliente(c)}
                          aria-label={`Ver detalhes do cliente ${c.nome}`}
                        >
                          <span className="pesquisa-global__item-texto">{c.nome || '—'}</span>
                          <span className="pesquisa-global__item-sub">{c.email || ''}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="pesquisa-global__ver-tudo"
                    onClick={handleIrClientes}
                  >
                    Ver todos os clientes →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default PesquisaGlobal
