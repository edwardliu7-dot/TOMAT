/**
 * Socket.io client singleton — shared across LobbyScreen & DuelKatakScreen
 * Import getSocket() / connectSocket() wherever you need the live socket.
 */
import { io } from 'socket.io-client'

// Di web: SERVER = '' → io() pakai relative URL (normal)
// Di APK:  SERVER = URL produksi yang di-set oleh nativePatch.js
const SERVER = window.__TOMAT_API__ || ''

let _socket = null

export function getSocket() {
  if (!_socket) {
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
