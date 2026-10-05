import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { startProfileSync } from './state/profileSync'
import { startWalkSync } from './state/walks'
import { startWordSync } from './state/words'
import './styles/tokens.css'
import './styles/global.css'

startProfileSync()
startWordSync()
startWalkSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
