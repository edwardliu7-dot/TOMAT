/**
 * Socket.io client singleton — shared across LobbyScreen & DuelKatakScreen
 * Import getSocket() / connectSocket() wherever you need the live socket.
 */
import { io } from 'socket.io-client'

let _socket = null

export function getSocket() {
  if (!_socket) {
    // Dibaca lazy di sini — bukan di level module — agar applyNativePatch()
    // sudah sempat set window.__TOMAT_API__ sebelum io() pertama kali dipanggil.
    // (ES module hoist semua import sebelum kode main.jsx jalan, sehingga
    //  pembacaan di level module selalu dapat '' meskipun di APK.)
    const SERVER = window.__TOMAT_API__ || ''
    _socket = io(SERVER, {
      path: '/socket.io',
      autoConnect: false,
      withCredentials: true,
    })
  }
  return _socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket() {
  if (_socket?.connected) _socket.disconnect()
}

/**
 * Tear down the singleton entirely so the next connectSocket() call creates a
 * brand-new connection — and therefore a fresh session handshake with the
 * server.  Call this on logout (and optionally on login) to prevent a previous
 * user's session from leaking into a subsequent user's duel lobby.
 */
export function resetSocket() {
  if (_socket) {
    _socket.disconnect()
    _socket.removeAllListeners()
    _socket = null
  }
}
