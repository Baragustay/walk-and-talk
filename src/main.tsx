import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { startProfileSync } from './state/profileSync'
import './styles/tokens.css'
import './styles/global.css'

startProfileSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
