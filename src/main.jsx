import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { seedUsersIfEmpty, ensureUsersHaveCodigo, migrateToGlobalStorage, migratePasswordsToHashIfNeeded } from './storage'
import './index.css'
import App from './App.jsx'

seedUsersIfEmpty()
ensureUsersHaveCodigo()
migrateToGlobalStorage()

// Migrar passwords em texto para hash antes de mostrar a app
migratePasswordsToHashIfNeeded().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
