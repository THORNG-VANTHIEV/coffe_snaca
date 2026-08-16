import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import '@/styles/globals.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root is missing from index.html')

// Clears the pre-React boot spinner from index.html.
container.replaceChildren()

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
