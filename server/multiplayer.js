/**
 * TOMAT Multiplayer — Duel, Co-op Boss Raid & Tournament
 * Socket.io server module (attached to the existing Express http server)
 */
import { Server } from 'socket.io'
import { getBossRaid, raidToClient, bossRaids } from './boss-state.js'
import { tournaments, tournamentToClient, getTournamentIo } from './tournament-state.js'
import { startTournamentMatch, handleTournamentAnswer } from './tournament-engine.js'
import { notifyUser } from './notifications.js'

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

// Track online users: userId → Set<socketId>
const userSockets = new Map()

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

    // Allow siswa and guru — individual handlers validate roles themselves
    if (!user || !['siswa', 'guru'].includes(user.role)) {
      socket.disconnect(true)
      return
    }

    // Register socket for direct messaging
    if (!userSockets.has(user.id)) userSockets.set(user.id, new Set())
    userSockets.get(user.id).add(socket.id)

    // Siswa join kelas room untuk menerima notifikasi turnamen
    if (user.role === 'siswa' && user.kelas) {
      socket.join(`kelas:${user.kelas}`)
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

    // ── INVITE (kirim undangan duel langsung ke user lain) ───────────────────
    socket.on('duel:invite', ({ targetUserId, targetRole, avatar } = {}) => {
      if (user.role !== 'siswa' || targetRole !== 'siswa') {
        socket.emit('duel:error', { message: 'Undangan duel hanya antar siswa.' })
        return
      }
      if (!targetUserId || targetUserId === user.id) {
        socket.emit('duel:error', { message: 'Target undangan tidak valid.' })
        return
      }

      leaveAllRooms(socket, io)
      const code = genCode()
      const player = makePlayer(avatar)
      const room = {
        code,
        players: [player],
        status: 'waiting',
        currentQ: null,
        round: 0,
        createdAt: Date.now(),
        inviteTargetId: targetUserId,
        cancelTimeout: null,
      }
      rooms.set(code, room)
      socket.join(code)
      socket.emit('duel:created', { code, player: safePlayer(player) })

      const invitePayload = {
        code,
        from: { userId: user.id, name: player.name },
      }

      const targetSocks = userSockets.get(targetUserId)
      if (targetSocks && targetSocks.size > 0) {
        for (const sid of targetSocks) {
          io.to(sid).emit('duel:incoming-invite', invitePayload)
        }
      } else {
        notifyUser({
          userId: targetUserId,
          role: targetRole,
          type: 'duel_invite',
          title: `⚔️ Tantangan Duel dari ${player.name}!`,
          body: `${player.name} mengajakmu duel Matematika. Buka TOMAT sekarang!`,
          url: '/',
          metadata: { code, fromUserId: user.id, fromName: player.name },
        }).catch(() => {})
      }

      room.cancelTimeout = setTimeout(() => {
        const r = rooms.get(code)
        if (r && r.status === 'waiting' && r.players.length < 2) {
          rooms.delete(code)
          socket.emit('duel:invite-expired', { code })
        }
      }, 60_000)
    })

    socket.on('duel:invite-decline', ({ code } = {}) => {
      const room = rooms.get(code)
      if (!room) return
      const host = room.players[0]
      if (host) {
        const hostSocks = userSockets.get(host.userId)
        if (hostSocks) {
          for (const sid of hostSocks) {
            io.to(sid).emit('duel:invite-declined', { byUserId: user.id })
          }
        }
      }
    })

    // ════════════════════════════════════════════════════════════════════════
    // BOSS RAID — Co-op event: every student in the class chips away at a
    //             shared boss HP pool. Server-authoritative question flow
    //             mirrors the duel: answer never reaches client before submit.
    // ════════════════════════════════════════════════════════════════════════
    const BOSS_COOLDOWN_MS = 60_000   // 60s cooldown between attacks
    const BOSS_Q_TTL_MS    = 30_000   // question expires after 30s
    const BOSS_DAMAGE      = 100      // HP removed per correct answer

    socket.on('boss:join', ({ kelas } = {}) => {
      if (!kelas) return
      if (user.kelas !== kelas) {
        socket.emit('boss:error', { message: 'Kamu tidak terdaftar di kelas ini.' })
        return
      }
      const raid = getBossRaid(kelas)
      if (!raid) {
        socket.emit('boss:error', { message: 'Tidak ada Boss Raid aktif untuk kelasmu.' })
        return
      }
      socket.join(`boss:${kelas}`)
      socket.emit('boss:state', raidToClient(raid))
    })

    socket.on('boss:attack', ({ kelas } = {}) => {
      if (!kelas || user.kelas !== kelas) return
      const raid = getBossRaid(kelas)
      if (!raid || raid.status !== 'active') {
        socket.emit('boss:error', { message: 'Boss Raid tidak aktif.' })
        return
      }
      const now = Date.now()
      const participant = raid.participants.get(user.id)
      if (participant?.lastAttackAt && now - participant.lastAttackAt < BOSS_COOLDOWN_MS) {
        const remainSec = Math.ceil((BOSS_COOLDOWN_MS - (now - participant.lastAttackAt)) / 1000)
        socket.emit('boss:error', { message: `Tunggu ${remainSec} detik lagi!`, cooldownSec: remainSec })
        return
      }
      const q = genKatakQ()
      socket._bossQ = { ...q, kelas, issuedAt: now }
      const { answer, ...qForClient } = q
      socket.emit('boss:question', { question: qForClient })
    })

    socket.on('boss:answer', ({ kelas, value } = {}) => {
      if (!kelas || user.kelas !== kelas) return
      const raid = getBossRaid(kelas)
      if (!raid || raid.status !== 'active') return

      const pending = socket._bossQ
      if (!pending || pending.kelas !== kelas || Date.now() - pending.issuedAt > BOSS_Q_TTL_MS) {
        socket.emit('boss:attack-result', { correct: false, damage: 0, message: 'Waktu habis! Coba serang lagi.' })
        return
      }
      socket._bossQ = null

      const correct = (value === pending.answer)
      const damage  = correct ? BOSS_DAMAGE : 0

      // Upsert participant record
      if (!raid.participants.has(user.id)) {
        raid.participants.set(user.id, {
          userId: user.id,
          name:   user.nama || user.username || 'Siswa',
          avatar: null,
          hits:   0,
          damage: 0,
          lastAttackAt: 0,
        })
      }
      const p = raid.participants.get(user.id)
      p.lastAttackAt = Date.now()
      if (correct) {
        p.hits++
        p.damage += damage
        raid.hp = Math.max(0, raid.hp - damage)
      }

      // Send private result to the attacker
      socket.emit('boss:attack-result', {
        correct,
        damage,
        newHp: raid.hp,
        correctAnswer: pending.answer,
        yourValue: value,
      })

      const sortedParticipants = Array.from(raid.participants.values())
        .sort((a, b) => b.damage - a.damage)

      if (raid.hp <= 0) {
        raid.status = 'defeated'
        io.to(`boss:${kelas}`).emit('boss:defeated', {
          participants: sortedParticipants,
        })
        // Keep entry for 5 min so late-joiners see the victory screen
        setTimeout(() => bossRaids.delete(kelas), 5 * 60_000)
      } else {
        io.to(`boss:${kelas}`).emit('boss:update', {
          hp:           raid.hp,
          maxHp:        raid.maxHp,
          attacker:     { name: p.name, damage, correct },
          participants: sortedParticipants.slice(0, 20),
        })
      }
    })

    // ── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const set = userSockets.get(user.id)
      if (set) {
        set.delete(socket.id)
        if (set.size === 0) userSockets.delete(user.id)
      }
      leaveAllRooms(socket, io)
    })

    // ════════════════════════════════════════════════════════════════════════
    // TOURNAMENT — spectator (guru) + player (siswa) events
    // ════════════════════════════════════════════════════════════════════════

    // Guru: join tournament room untuk melihat bracket live
    socket.on('tournament:spectate', ({ tournamentId } = {}) => {
      if (user.role !== 'guru') return
      const t = tournaments.get(tournamentId)
      if (!t) return
      socket.join(`tournament:${tournamentId}`)
      socket.emit('tournament:state', tournamentToClient(t))
    })

    // Guru: spectate satu match tertentu (real-time slider)
    socket.on('tournament:spectate-match', ({ matchId } = {}) => {
      if (user.role !== 'guru') return
      socket.join(`match-spectate:${matchId}`)
    })

    // Siswa: siap bergabung ke match (dipanggil saat buka TournamentMatchScreen)
    socket.on('tournament:player-ready', ({ tournamentId, matchId } = {}) => {
      if (user.role !== 'siswa') return
      const t = tournaments.get(tournamentId)
      if (!t) return

      const round = t.rounds[t.currentRound - 1]
      const match = round?.matches.find(m => m.id === matchId)
      if (!match || match.status === 'finished' || match.status === 'walkover') return

      const isP1 = match.player1?.userId === user.id
      const isP2 = match.player2?.userId === user.id
      if (!isP1 && !isP2) return

      // Update socketId
      if (isP1) match.player1.socketId = socket.id
      if (isP2) match.player2.socketId = socket.id

      // Join duel room
      socket.join(match.roomCode)

      // Broadcast bracket ke guru
      io.to(`tournament:${tournamentId}`).emit('tournament:state', tournamentToClient(t))

      // Cek apakah kedua player sudah join → mulai match
      const p1Ready = !match.player1 || match.player1.socketId
      const p2Ready = !match.player2 || match.player2.socketId
      if (p1Ready && p2Ready && match.status === 'waiting-join') {
        if (match.walkoverTimer) { clearTimeout(match.walkoverTimer); match.walkoverTimer = null }
        startTournamentMatch(io, t, match)
      }
    })

    // Siswa: submit jawaban turnamen
    socket.on('tournament:answer', ({ tournamentId, matchId, value } = {}) => {
      if (user.role !== 'siswa') return
      const t = tournaments.get(tournamentId)
      if (!t) return
      const round = t.rounds[t.currentRound - 1]
      const match = round?.matches.find(m => m.id === matchId)
      if (!match) return
      handleTournamentAnswer(io, t, match, user.id, value, socket)
    })

    // Siswa: kirim posisi slider ke guru spectator
    socket.on('tournament:slider-move', ({ matchId, value } = {}) => {
      if (user.role !== 'siswa') return
      socket.to(`match-spectate:${matchId}`).emit('tournament:opponent-slider', {
        userId: user.id, value, matchId,
      })
    })
  })

  return io
}
