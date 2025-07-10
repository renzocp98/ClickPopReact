import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ClickPopApp from './components/ClickPopApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClickPopApp title={ ' Terreno de juego'}/>
  </StrictMode>,
)
