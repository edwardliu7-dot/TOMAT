#!/usr/bin/env node
/**
 * Script untuk mengatur server URL di capacitor.config.json
 * setelah app di-deploy.
 *
 * Usage:
 *   node scripts/set-server-url.js https://your-app.replit.app
 *   pnpm cap:set-url https://your-app.replit.app
 *
 * Jalankan ini, lalu pnpm cap:sync untuk sync ke Android project.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const url = process.argv[2]

if (!url) {
  console.error('❌  Harap masukkan URL deployed app.')
  console.error('   Contoh: node scripts/set-server-url.js https://tomat.replit.app')
  process.exit(1)
}

if (!url.startsWith('http')) {
  console.error('❌  URL harus diawali https:// atau http://')
  process.exit(1)
}

const configPath = resolve('capacitor.config.json')
const config = JSON.parse(readFileSync(configPath, 'utf8'))

config.server = config.server || {}
config.server.url = url

writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
console.log(`✅  Server URL berhasil diset: ${url}`)
console.log('   Jalankan: pnpm cap:sync  — untuk sync ke Android project.')
