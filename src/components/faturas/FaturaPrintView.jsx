import { useState } from 'react'
import { jsPDF } from 'jspdf'
import Modal from '../ui/Modal'
import { formatarData, formatarMoeda } from '../../utils/formatadores'

function FaturaPrintView({ fatura, onFechar }) {
  const [aDescarregar, setADescarregar] = useState(false)

  const handleDescarregarPDF = () => {
    if (!fatura || aDescarregar) return
    setADescarregar(true)
    try {
      const doc = new jsPDF()
      const margin = 20
      let y = 20

      doc.setFontSize(18)
      doc.text('Fatura', margin, y)
      y += 8
      doc.setFontSize(11)
      doc.setTextColor(100, 116, 139)
      doc.text(fatura.numero || '', margin, y)
      doc.setTextColor(0, 0, 0)
      y += 14

      const dados = [
        ['Data', formatarData(fatura.data)],
        ['Cliente', fatura.cliente || '—'],
        ['Valor', formatarMoeda(fatura.valor)],
        ['Estado', fatura.estado || '—'],
      ]
      doc.setFontSize(10)
      dados.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold')
        doc.text(label + ':', margin, y)
        doc.setFont(undefined, 'normal')
        doc.text(String(value), margin + 45, y)
        y += 8
      })
      if ((fatura.estado || '') === 'Anulada' && fatura.justificacao) {
        y += 4
        doc.setFont(undefined, 'bold')
        doc.text('Justificação:', margin, y)
        y += 6
        doc.setFont(undefined, 'normal')
        const linhas = doc.splitTextToSize(fatura.justificacao, 170)
        doc.text(linhas, margin, y)
      }

      const nomeFicheiro = `Fatura-${(fatura.numero || 'sem-numero').replace(/\s+/g, '-')}.pdf`
      doc.save(nomeFicheiro)
    } finally {
      setADescarregar(false)
    }
  }

  if (!fatura) return null

  return (
    <Modal aberto={!!fatura} onFechar={onFechar}>
      <div className="fatura-print-area">
        <div className="fatura-print">
          <div className="fatura-print__header">
            <h1 className="fatura-print__titulo">Fatura</h1>
            <p className="fatura-print__numero">{fatura.numero}</p>
          </div>
          <table className="fatura-print__tabela">
            <tbody>
              <tr>
                <th>Data</th>
                <td>{formatarData(fatura.data)}</td>
              </tr>
              <tr>
                <th>Cliente</th>
                <td>{fatura.cliente}</td>
              </tr>
              <tr>
                <th>Valor</th>
                <td>{formatarMoeda(fatura.valor)}</td>
              </tr>
              <tr>
                <th>Estado</th>
                <td>{fatura.estado || '—'}</td>
              </tr>
              {(fatura.estado || '') === 'Anulada' && fatura.justificacao && (
                <tr>
                  <th>Justificação</th>
                  <td>{fatura.justificacao}</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="fatura-print__acoes">
            <button type="button" className="modal-editar__btn modal-editar__btn--sec" onClick={onFechar}>
              Fechar
            </button>
            <button type="button" className="modal-editar__btn modal-editar__btn--pri" onClick={handleDescarregarPDF} disabled={aDescarregar}>
              {aDescarregar ? 'A descarregar…' : 'Descarregar PDF'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default FaturaPrintView
