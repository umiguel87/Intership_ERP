import { useRef } from 'react'
import { getFaturas, getClientes, getUsers, setFaturas, setClientes, setUsers } from '../storage'

function DefinicoesPage({ onNotificar, darkMode = false, onDarkModeChange }) {
  const inputFicheiroRef = useRef(null)

  const handleExportarBackup = () => {
    const backup = {
      exportadoEm: new Date().toISOString(),
      versao: 1,
      faturas: getFaturas(),
      clientes: getClientes(),
      users: getUsers(),
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `erp_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    onNotificar?.('Backup exportado.')
  }

  const handleSelecionarFicheiro = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        const faturas = Array.isArray(data.faturas) ? data.faturas : []
        const clientes = Array.isArray(data.clientes) ? data.clientes : []
        const users = Array.isArray(data.users) ? data.users : getUsers()
        if (faturas.length === 0 && clientes.length === 0 && users.length === 0) {
          onNotificar?.('Ficheiro sem dados válidos.', 'error')
          return
        }
        setFaturas(faturas)
        setClientes(clientes)
        setUsers(users)
        onNotificar?.('Backup restaurado. A página será atualizada.')
        e.target.value = ''
        setTimeout(() => window.location.reload(), 800)
      } catch (err) {
        onNotificar?.('Ficheiro inválido. Use um backup exportado por esta aplicação.', 'error')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="definicoes-page">
      <div className="definicoes-page__cabecalho">
        <h2 className="definicoes-page__titulo">Definições</h2>
        <p className="definicoes-page__descricao">
          Aparência, backup e restauro de dados (faturas, clientes e utilizadores).
        </p>
      </div>

      <section className="definicoes-page__seccao">
        <h3 className="definicoes-page__subtitulo">Aparência</h3>
        <p className="definicoes-page__texto">
          Ative o modo escuro para um tema mais confortável em ambientes com pouca luz.
        </p>
        <label className="definicoes-page__toggle-wrap">
          <span className="definicoes-page__toggle-label">Modo escuro</span>
          <input
            type="checkbox"
            className="definicoes-page__toggle-input"
            checked={darkMode}
            onChange={(e) => onDarkModeChange?.(e.target.checked)}
            aria-label="Ativar ou desativar modo escuro"
          />
          <span className="definicoes-page__toggle-slider" aria-hidden />
        </label>
      </section>

      <section className="definicoes-page__seccao">
        <h3 className="definicoes-page__subtitulo">Backup</h3>
        <p className="definicoes-page__texto">
          Exporte uma cópia de todos os dados para um ficheiro JSON. Guarde este ficheiro num local seguro.
        </p>
        <button
          type="button"
          className="definicoes-page__btn definicoes-page__btn--export"
          onClick={handleExportarBackup}
        >
          Exportar backup
        </button>
      </section>

      <section className="definicoes-page__seccao">
        <h3 className="definicoes-page__subtitulo">Restauro</h3>
        <p className="definicoes-page__texto">
          Restaure dados a partir de um ficheiro de backup. Os dados atuais serão substituídos. A página será recarregada.
        </p>
        <input
          ref={inputFicheiroRef}
          type="file"
          accept=".json,application/json"
          onChange={handleSelecionarFicheiro}
          className="definicoes-page__file-input"
          aria-label="Selecionar ficheiro de backup"
        />
        <button
          type="button"
          className="definicoes-page__btn definicoes-page__btn--import"
          onClick={() => inputFicheiroRef.current?.click()}
        >
          Importar backup
        </button>
      </section>
    </div>
  )
}

export default DefinicoesPage
