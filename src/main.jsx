import { applyNativePatch } from './nativePatch'
applyNativePatch() // harus dipanggil sebelum semua import lain agar __TOMAT_API__ tersedia

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MobaArenaEditor from './moba-editor/MobaArenaEditor.jsx'
import { AuthProvider } from './AuthContext'
import AssetPreloader from './components/AssetPreloader'

if ('serviceWorker' in navigator) {
  // Listener untuk pesan dari SW (notifikasi → buka halaman)
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'tomat-open-route' && event.data.route === '/komunikasi') {
      window.dispatchEvent(new CustomEvent('tomat:open-komunikasi'))
    }
  })

  // Register SW untuk caching aset — download sekali, pakai selamanya
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW tidak tersedia di lingkungan ini, lanjut tanpa caching
    })
  })
}

const isInternalMobaEditor = window.location.pathname === '/hidden-moba-editor'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isInternalMobaEditor ? (
      <MobaArenaEditor />
    ) : (
      <AssetPreloader>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AssetPreloader>
    )}
  </React.StrictMode>
)
