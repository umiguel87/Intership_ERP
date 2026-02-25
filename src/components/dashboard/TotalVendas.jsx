function TotalVendas({ total = 0 }) {
  const formatado = total.toLocaleString('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <section className="total-vendas" aria-label="Total de vendas">
      <h2 className="total-vendas__titulo">Total de vendas</h2>
      <p className="total-vendas__valor">{formatado}</p>
    </section>
  )
}

export default TotalVendas
