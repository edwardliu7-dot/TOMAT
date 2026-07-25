/**
 * TOMAT Multiplayer — Duel & Co-op Boss Raid
 * Socket.io server module (attached to the existing Express http server)
 */
import { Server } from 'socket.io'

// ─── Question generation (server-authoritative, mirrors SubmarineGame.jsx) ───
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function genKatakQ() {
  const jump = rand(2, 7)
  const bound = 15 - jump
  const start = rand(-bound, bound)
  const isForward = Math.random() < 0.5
  const answer = isForward ? start + jump : start - jump
  return { start, jump, isForward, answer }
}

// ─── Room management ─────────────────────────────────────────────────────────
const rooms = new Map()           // code → Room
const MAX_ROUNDS  = 7             // 7 questions per duel
const NEXT_Q_DELAY_MS = 2500      // pause after both answer before next question
const ROOM_TTL_MS = 30 * 60_000  // auto-delete after 30 min

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function genCode() {
  let code
  do {
    code = Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
  } while (rooms.has(code))
  return code
}

function safePlayer(p) {
  return { userId: p.userId, name: p.name, avatar: p.avatar, score: p.score }
}

function startRound(io, room) {
  room.currentQ = genKatakQ()
  room.round++
  room.players.forEach(p => { p.answered = false; p.lastAnswer = null })

  // Never send the answer to the client!
  const { answer, ...qForClient } = room.currentQ
  io.to(room.code).emit('duel:question', {
    question: qForClient,
    round: room.round,
    maxRounds: MAX_ROUNDS,
    scores: room.players.map(safePlayer),
  })
}

function finishGame(io, room) {
  if (room.status === 'finished') return
  room.status = 'finished'
  const [p0, p1] = room.players
  let winner = null
  if (p0 && p1) {
    if (p0.score > p1.score) winner = safePlayer(p0)
    else if (p1.score > p0.score) winner = safePlayer(p1)
    // winner === null → draw
  }
  io.to(room.code).emit('duel:game-over', {
    winner,
    scores: room.players.map(safePlayer),
  })
}

function leaveAllRooms(socket, io) {
  for (const [code, room] of rooms) {
    const idx = room.players.findIndex(p => p.socketId === socket.id)
    if (idx === -1) continue

    const leaving = room.players[idx]
    room.players.splice(idx, 1)
    socket.leave(code)

    if (room.players.length === 0) {
      rooms.delete(code)
    } else if (room.status === 'in-progress') {
      room.status = 'finished'
      io.to(code).emit('duel:player-left', { name: leaving.name })
    } else {
      io.to(code).emit('duel:player-left', { name: leaving.name })
    }
  }
}

// Clean up stale rooms periodically
setInterval(() => {
  const cutoff = Date.now() - ROOM_TTL_MS
  for (const [code, room] of rooms) {
    if (room.createdAt < cutoff) rooms.delete(code)
  }
}, 5 * 60_000)

// ─── Socket.io ───────────────────────────────────────────────────────────────
export function setupMultiplayer(httpServer, sessionMiddleware) {
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: '*', credentials: true },
  })

  // Share Express session so socket.request.session works
  io.engine.use((req, res, next) => sessionMiddleware(req, res, next))

  io.on('connection', (socket) => {
    const session = socket.request?.session
    const user    = session?.user

    // Only logged-in students may play
    if (!user || user.role !== 'siswa') {
      socket.disconnect(true)
      return
    }

    const makePlayer = (avatar) => ({
      socketId: socket.id,
      userId:   user.id,
      name:     user.nama || user.username || 'Siswa',
      avatar:   avatar || null,
      score:    0,
      answered: false,
      lastAnswer: null,
    })

    // ── CREATE ROOM ──────────────────────────────────────────────────────────
    socket.on('duel:create', ({ avatar } = {}) => {
      leaveAllRooms(socket, io)
      const code = genCode()
      const player = makePlayer(avatar)
      rooms.set(code, {
        code,
        players:  [player],
        status:   'waiting',
        currentQ: null,
        round:    0,
        createdAt: Date.now(),
      })
      socket.join(code)
      socket.emit('duel:created', { code, player: safePlayer(player) })
    })

    // ── JOIN ROOM ────────────────────────────────────────────────────────────
    socket.on('duel:join', ({ code: rawCode, avatar } = {}) => {
      const code = rawCode?.toUpperCase?.()?.trim()
      if (!code) { socket.emit('duel:error', { message: 'Masukkan kode ruangan.' }); return }

      const room = rooms.get(code)
      if (!room)                    { socket.emit('duel:error', { message: 'Kode tidak ditemukan. Cek lagi ya!' }); return }
      if (room.status !== 'waiting'){ socket.emit('duel:error', { message: 'Pertandingan di ruangan ini sudah dimulai.' }); return }
      if (room.players.length >= 2) { socket.emit('duel:error', { message: 'Ruangan sudah penuh (2/2).' }); return }
      if (room.players[0].userId === user.id) { socket.emit('duel:error', { message: 'Tidak bisa duel dengan dirimu sendiri 😅' }); return }

      leaveAllRooms(socket, io)

      const player = makePlayer(avatar)
      room.players.push(player)
      socket.join(code)

      // Tell joiner: full room state + their index
      socket.emit('duel:joined', {
        code,
        players: room.players.map(safePlayer),
        myIndex: 1,
      })
      // Tell creator: opponent joined
      socket.to(code).emit('duel:opponent-joined', { player: safePlayer(player) })
    })

    // ── START GAME (host only) ───────────────────────────────────────────────
    socket.on('duel:start-game', ({ code } = {}) => {
      const room = rooms.get(code)
      if (!room)                                { socket.emit('duel:error', { message: 'Ruangan tidak ditemukan.' }); return }
      if (room.players[0].userId !== user.id)   { socket.emit('duel:error', { message: 'Hanya host yang bisa memulai.' }); return }
      if (room.players.length < 2)              { socket.emit('duel:error', { message: 'Masih menunggu lawan…' }); return }
      if (room.status !== 'waiting')            return

      room.status = 'in-progress'

      // Server-side countdown so both clients start at exactly the same moment
      let count = 3
      io.to(code).emit('duel:countdown', { count })
      const tick = setInterval(() => {
        count--
        if (count > 0) {
          io.to(code).emit('duel:countdown', { count })
        } else {
          clearInterval(tick)
          startRound(io, room)
        }
      }, 1000)
    })

    // ── SLIDER MOVE (real-time ghost position) ───────────────────────────────
    socket.on('duel:slider-move', ({ code, value } = {}) => {
      const room = rooms.get(code)
      if (!room || room.status !== 'in-progress') return
      const player = room.players.find(p => p.userId === user.id)
      if (!player || player.answered) return
      socket.to(code).emit('duel:opponent-slider', { value })
    })

    // ── ANSWER SUBMISSION ────────────────────────────────────────────────────
    socket.on('duel:answer', ({ code, value } = {}) => {
      const room = rooms.get(code)
      if (!room || room.status !== 'in-progress') return
      const player = room.players.find(p => p.userId === user.id)
      if (!player || player.answered) return

      player.answered   = true
      player.lastAnswer = value
      const correct = (value === room.currentQ.answer)
      if (correct) player.score++

      const opponent = room.players.find(p => p.userId !== user.id)

      socket.emit('duel:answer-result', {
        correct,
        yourScore:    player.score,
        opponentScore: opponent?.score ?? 0,
        correctAnswer: room.currentQ.answer,
        yourValue:    value,
      })

      socket.to(code).emit('duel:opponent-answered', {
        correct,
        opponentScore: player.score,
        opponentValue: value,
      })

      // Both answered — schedule next round or game-over
      if (room.players.every(p => p.answered)) {
        if (room.round >= MAX_ROUNDS) {
          setTimeout(() => finishGame(io, room), NEXT_Q_DELAY_MS)
        } else {
          setTimeout(() => startRound(io, room), NEXT_Q_DELAY_MS)
        }
      }
    })

    // ── LEAVE (explicit, e.g. pressing back mid-game) ────────────────────────
    socket.on('duel:leave', () => {
      leaveAllRooms(socket, io)
    })

    // ── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      leaveAllRooms(socket, io)
    })
  })

  return io
}
