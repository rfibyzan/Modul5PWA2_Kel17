import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { ToastContainer } from './components/ui'
import ErrorBoundary from './components/common/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Register PWA service worker immediately for full offline caching (0 B transferred from SW)
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
        <ToastContainer position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)