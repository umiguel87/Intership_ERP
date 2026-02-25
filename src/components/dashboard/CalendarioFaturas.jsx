import { useState, useMemo } from 'react'
import { formatarData, formatarMoeda } from '../../utils/formatadores'

const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function CalendarioFaturas({ faturas = [], onMudarSecao, onAbrirFatura }) {
  const [mesAtual, setMesAtual] = useState(() => {
    const d = new Date()
    return { ano: d.getFullYear(), mes: d.getMonth() }
  })
  const [diaSelecionado, setDiaSelecionado] = useState(null)

  const faturasPorDia = useMemo(() => {
    const map = {}
    const porPagarPorDia = {}
    faturas.forEach((f) => {
      const key = (f.data || '').slice(0, 10)
      if (!key) return
      map[key] = (map[key] || 0) + 1
      if ((f.estado || '').trim() === 'Por pagar') {
        porPagarPorDia[key] = (porPagarPorDia[key] || 0) + 1
      }
    })
    return { total: map, porPagar: porPagarPorDia }
  }, [faturas])

  const { diasDoMes, primeiroDiaSemana, totalDias } = useMemo(() => {
    const ano = mesAtual.ano
    const mes = mesAtual.mes
    const primeiro = new Date(ano, mes, 1)
    const ultimo = new Date(ano, mes + 1, 0)
    const totalDias = ultimo.getDate()
    const primeiroDiaSemana = primeiro.getDay()
    const diasDoMes = Array.from({ length: totalDias }, (_, i) => i + 1)
    return { diasDoMes, primeiroDiaSemana, totalDias }
  }, [mesAtual.ano, mesAtual.mes])

  const semanas = useMemo(() => {
    const celulas = []
    for (let i = 0; i < primeiroDiaSemana; i++) {
      celulas.push({ vazio: true })
    }
    diasDoMes.forEach((dia) => {
      const key = `${mesAtual.ano}-${String(mesAtual.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      const total = faturasPorDia.total[key] || 0
      const porPagar = faturasPorDia.porPagar[key] || 0
      const hoje =
        key === new Date().toISOString().slice(0, 10)
      celulas.push({
        dia,
        key,
        total,
        porPagar,
        hoje,
      })
    })
    const result = []
    for (let i = 0; i < celulas.length; i += 7) {
      result.push(celulas.slice(i, i + 7))
    }
    if (result.length && result[result.length - 1].length < 7) {
      const ultima = result[result.length - 1]
      while (ultima.length < 7) ultima.push({ vazio: true })
    }
    return result
  }, [diasDoMes, primeiroDiaSemana, mesAtual, faturasPorDia])

  const faturasDoDiaSelecionado = useMemo(() => {
    if (!diaSelecionado) return []
    return faturas.filter((f) => (f.data || '').slice(0, 10) === diaSelecionado)
  }, [faturas, diaSelecionado])

  const avancarMes = () => {
    setMesAtual((prev) => {
      if (prev.mes === 11) return { ano: prev.ano + 1, mes: 0 }
      return { ...prev, mes: prev.mes + 1 }
    })
  }

  const recuarMes = () => {
    setMesAtual((prev) => {
      if (prev.mes === 0) return { ano: prev.ano - 1, mes: 11 }
      return { ...prev, mes: prev.mes - 1 }
    })
  }

  const irParaHoje = () => {
    const d = new Date()
    setMesAtual({ ano: d.getFullYear(), mes: d.getMonth() })
    setDiaSelecionado(d.toISOString().slice(0, 10))
  }

  return (
    <section className="calendario-faturas-wrapper" aria-label="Calendário de faturas">
      <div className="calendario-faturas">
        <div className="calendario-faturas__cabecalho">
        <h3 className="calendario-faturas__titulo">Calendário</h3>
        <div className="calendario-faturas__nav">
          <button
            type="button"
            className="calendario-faturas__btn"
            onClick={recuarMes}
            aria-label="Mês anterior"
          >
            ‹
          </button>
          <span className="calendario-faturas__mes">
            {MESES_PT[mesAtual.mes]} {mesAtual.ano}
          </span>
          <button
            type="button"
            className="calendario-faturas__btn"
            onClick={avancarMes}
            aria-label="Mês seguinte"
          >
            ›
          </button>
          <button
            type="button"
            className="calendario-faturas__btn calendario-faturas__btn--hoje"
            onClick={irParaHoje}
          >
            Hoje
          </button>
        </div>
      </div>

      <div className="calendario-faturas__legenda">
        <span className="calendario-faturas__legenda-item">
          <span className="calendario-faturas__ponto calendario-faturas__ponto--fatura" /> Faturas
        </span>
        <span className="calendario-faturas__legenda-item">
          <span className="calendario-faturas__ponto calendario-faturas__ponto--por-pagar" /> Por pagar
        </span>
        {onMudarSecao && (
          <button
            type="button"
            className="calendario-faturas__link"
            onClick={() => onMudarSecao('contas-a-receber')}
          >
            Ver contas a receber
          </button>
        )}
      </div>

      <div className="calendario-faturas__grid">
        <div className="calendario-faturas__dias-semana">
          {DIAS_SEMANA.map((d) => (
            <span key={d} className="calendario-faturas__dia-nome">
              {d}
            </span>
          ))}
        </div>
        {semanas.map((linha, i) => (
          <div key={i} className="calendario-faturas__semana">
            {linha.map((celula, j) =>
              celula.vazio ? (
                <div key={j} className="calendario-faturas__dia calendario-faturas__dia--vazio" />
              ) : (
                <button
                  key={celula.key}
                  type="button"
                  className={`calendario-faturas__dia ${celula.total ? 'calendario-faturas__dia--com-faturas' : ''} ${celula.hoje ? 'calendario-faturas__dia--hoje' : ''} ${celula.porPagar > 0 ? 'calendario-faturas__dia--por-pagar' : ''} ${diaSelecionado === celula.key ? 'calendario-faturas__dia--selecionado' : ''}`}
                  title={
                    celula.total
                      ? `${celula.total} fatura(s)${celula.porPagar ? `, ${celula.porPagar} por pagar` : ''} — Clique para ver`
                      : 'Clique para ver as faturas deste dia'
                  }
                  onClick={() => setDiaSelecionado(celula.key)}
                  aria-pressed={diaSelecionado === celula.key}
                  aria-label={`Dia ${celula.dia}, ${celula.total || 0} fatura(s)`}
                >
                  <span className="calendario-faturas__dia-num">{celula.dia}</span>
                  {celula.total > 0 && (
                    <span className="calendario-faturas__indicadores">
                      <span className="calendario-faturas__ponto calendario-faturas__ponto--fatura" />
                      {celula.porPagar > 0 && (
                        <span className="calendario-faturas__ponto calendario-faturas__ponto--por-pagar" />
                      )}
                    </span>
                  )}
                </button>
              )
            )}
          </div>
        ))}
      </div>
      </div>

      <div className="calendario-faturas__painel">
        <h4 className="calendario-faturas__painel-titulo">
          {diaSelecionado
            ? `Faturas — ${formatarData(diaSelecionado)}`
            : 'Faturas do dia'}
        </h4>
        {!diaSelecionado ? (
          <p className="calendario-faturas__painel-vazio">
            Clique num dia do calendário para ver as faturas.
          </p>
        ) : faturasDoDiaSelecionado.length === 0 ? (
          <p className="calendario-faturas__painel-vazio">
            Nenhuma fatura nesta data.
          </p>
        ) : (
          <ul className="calendario-faturas__lista">
            {faturasDoDiaSelecionado.map((f) => (
              <li key={f.id} className="calendario-faturas__item">
                <button
                  type="button"
                  className="calendario-faturas__item-btn"
                  onClick={() => onAbrirFatura?.(f)}
                  aria-label={`Abrir fatura ${f.numero}`}
                >
                  <span className="calendario-faturas__item-num">{f.numero}</span>
                  <span className="calendario-faturas__item-cliente">{f.cliente || '—'}</span>
                  <span className="calendario-faturas__item-valor">{formatarMoeda(f.valor)}</span>
                  <span className="calendario-faturas__item-estado">{f.estado || '—'}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default CalendarioFaturas
