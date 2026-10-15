import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Imported here, not via @import in index.css, so token value edits hot-reload in the dev server
import './styles/tokens.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
