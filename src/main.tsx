import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Setup mock service worker for development
if (import.meta.env.DEV) {
  import('./mocks/browser').then(({ setupMocks }) => setupMocks());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)