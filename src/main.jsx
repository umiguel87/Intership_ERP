import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { seedUsersIfEmpty, migrateToGlobalStorage, migratePasswordsToHashIfNeeded } from './storage'
import './index.css'
import App from './App.jsx'

seedUsersIfEmpty()
migrateToGlobalStorage()

// Migrar passwords em texto para hash antes de mostrar a app
migratePasswordsToHashIfNeeded().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
