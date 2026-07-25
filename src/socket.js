/**
 * Socket.io client singleton — shared across LobbyScreen & DuelKatakScreen
 * Import getSocket() / connectSocket() wherever you need the live socket.
 */
import { io } from 'socket.io-client'

let _socket = null

export function getSocket() {
  if (!_socket) {
    _socket = io({
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
