import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import crypto from 'crypto'

// Plugin: inject BUILD_VERSION ke sw.js setelah build selesai
function swVersionPlugin() {
  return {
    name: 'sw-version',
    closeBundle() {
      const swPath = resolve('dist/sw.js')
      try {
        const content = readFileSync(swPath, 'utf8')
        // Hash dari timestamp + random — unik setiap build
        const version = crypto.randomBytes(6).toString('hex')
        writeFileSync(swPath, content.replace('__BUILD_VERSION__', version))
        console.log(`[sw-version] BUILD_VERSION = ${version}`)
      } catch (e) {
        console.warn('[sw-version] sw.js tidak ditemukan di dist/', e.message)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), swVersionPlugin()],
  resolve: {
    alias: {
      // @capacitor/local-notifications is only available in the native APK build.
      // In browser/dev mode, resolve to a no-op stub so Vite doesn't error out.
      '@capacitor/local-notifications': resolve('./src/stubs/capacitor-local-notifications.js'),
      // @capacitor/browser: stub delegates to window.Capacitor.Plugins.Browser at runtime
      // (native bridge di APK) atau window.open di web. Dynamic-import trick lama tidak
      // di-bundle oleh Vite → import gagal di APK → catch → onBack() → layar berkedip.
      '@capacitor/browser': resolve('./src/stubs/capacitor-browser.js'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/react-easy-crop')) {
            return 'vendor-crop'
          }
          if (id.includes('/src/minigames/')) {
            return 'games'
          }
        },
      },
    },
  },
})
