import { useState } from 'react'
import { validarNifPT } from '../../utils/validarNif'

function FormNovoCliente({ onAdicionar, onNotificar }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [nif, setNif] = useState('')
  const [erros, setErros] = useState({})

  const validar = () => nome.trim() !== '' && email.trim() !== ''

  const validarComErros = () => {
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
    if (!validarComErros() || !onAdicionar) return
    onAdicionar({
      id: crypto.randomUUID(),
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      nif: nif.trim() || undefined,
    })
    setErros({})
    setNome('')
    setEmail('')
    setNif('')
    onNotificar?.('Cliente adicionado.')
  }

  return (
    <section className="form-fatura form-cliente">
      <h2 className="form-fatura__titulo">Novo cliente</h2>
      <form className="form-fatura__form" onSubmit={handleSubmit}>
        <div className="form-fatura__campo">
          <label htmlFor="cliente-nome">Nome</label>
          <input
            id="cliente-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do cliente"
            required
          />
          {erros.nome && <span className="form-fatura__erro">{erros.nome}</span>}
        </div>
        <div className="form-fatura__campo">
          <label htmlFor="cliente-email">Email</label>
          <input
            id="cliente-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.pt"
            required
          />
          {erros.email && <span className="form-fatura__erro">{erros.email}</span>}
        </div>
        <div className="form-fatura__campo">
          <label htmlFor="cliente-nif">NIF (opcional)</label>
          <input
            id="cliente-nif"
            type="text"
            value={nif}
            onChange={(e) => setNif(e.target.value)}
            placeholder="123456789"
            aria-invalid={!!erros.nif}
            aria-describedby={erros.nif ? 'cliente-nif-erro' : undefined}
          />
          {erros.nif && <span id="cliente-nif-erro" className="form-fatura__erro" role="alert">{erros.nif}</span>}
        </div>
        <div className="form-fatura__acoes">
          <button type="submit" className="form-fatura__submit" disabled={!validar()}>
            Adicionar cliente
          </button>
        </div>
      </form>
    </section>
  )
}

export default FormNovoCliente
