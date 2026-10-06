import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { startProfileSync } from './state/profileSync'
import { startFresh } from './state/reset'
import { startWalkSync } from './state/walks'
import { startWordSync } from './state/words'
import './styles/tokens.css'
import './styles/global.css'

// Testing shortcut: open the app with ?reset to start as a brand-new user on this device.
if (new URLSearchParams(location.search).has('reset')) {
  void startFresh().then(() => location.replace('/welcome'))
}

startProfileSync()
startWordSync()
startWalkSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
