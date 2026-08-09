/**
 * TOMAT BGM — singleton Audio manager for background music.
 * Volume and enabled state are persisted to localStorage.
 *
 * Usage:
 *   import { startBgm, stopBgm, setBgmVolume, getBgmVolume,
 *            isBgmEnabled, setBgmEnabled } from './bgm'
 */

const BGM_VOL_KEY = 'tomat_bgm_volume'
const BGM_ON_KEY  = 'tomat_bgm_enabled'

let _audio   = null
let _volume  = (() => {
  try { const v = localStorage.getItem(BGM_VOL_KEY); return v !== null ? parseFloat(v) : 0.3 }
  catch { return 0.3 }
})()
let _enabled = (() => {
  try { return localStorage.getItem(BGM_ON_KEY) !== 'false' }
  catch { return true }
})()

// ── Volume ────────────────────────────────────────────────────────────────────
export function getBgmVolume() { return _volume }
export function setBgmVolume(vol) {
  _volume = Math.max(0, Math.min(1, Number(vol)))
  try { localStorage.setItem(BGM_VOL_KEY, String(_volume)) } catch {}
  if (_audio) _audio.volume = _enabled ? _volume : 0
}

// ── Enabled ───────────────────────────────────────────────────────────────────
export function isBgmEnabled() { return _enabled }
export function setBgmEnabled(val) {
  _enabled = Boolean(val)
  try { localStorage.setItem(BGM_ON_KEY, _enabled ? 'true' : 'false') } catch {}
  if (_audio) _audio.volume = _enabled ? _volume : 0
}
export function toggleBgm() { setBgmEnabled(!_enabled); return _enabled }

// ── Lifecycle ─────────────────────────────────────────────────────────────────
export function startBgm(src) {
  if (_audio) return  // already running
  const audio = new Audio(src)
  audio.loop   = true
  audio.volume = _enabled ? _volume : 0
  _audio = audio

  // Try immediately; if blocked by browser autoplay policy, retry on first gesture
  const tryPlay = () => audio.play().catch(() => {})
  tryPlay()

  const onGesture = () => { tryPlay(); removeListeners() }
  const removeListeners = () => {
    document.removeEventListener('click',      onGesture)
    document.removeEventListener('touchstart', onGesture)
    document.removeEventListener('keydown',    onGesture)
  }
  document.addEventListener('click',      onGesture, { once: true })
  document.addEventListener('touchstart', onGesture, { once: true })
  document.addEventListener('keydown',    onGesture, { once: true })
}

export function stopBgm() {
  if (!_audio) return
  _audio.pause()
  _audio.src = ''
  _audio = null
}
