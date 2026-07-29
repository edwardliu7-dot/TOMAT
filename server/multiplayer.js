/**
 * TOMAT Multiplayer — Duel, Co-op Boss Raid & Tournament
 * Socket.io server module (attached to the existing Express http server)
 */
import { Server } from 'socket.io'
import { pool } from './db.js'
import { applyExp } from './gamify.js'
import { getBossRaid, raidToClient, bossRaids } from './boss-state.js'
import { tournaments, tournamentToClient, getTournamentIo } from './tournament-state.js'
import { startTournamentMatch, handleTournamentAnswer } from './tournament-engine.js'
import { genTournamentQ } from './tournament-questions.js'
import { notifyUser } from './notifications.js'
import { isStudentPetDead } from './pet-state.js'

// ─── Question generation (server-authoritative) ───────────────────────────────
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

// Legacy katak-only generator kept for boss-raid (which is always katak)
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
const NEXT_Q_DELAY_MS = 1200     // pause after answering before next question (async, per-player)
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

// Send one question to a single player (async flow — each player progresses independently)
function startPlayerRound(io, room, player) {
  player.myRound++
  player.answered = false
  player.lastAnswer = null
  const q = genTournamentQ(room.gameKey || 'katak')
  player.currentQ = q
  const { answer, ...qForClient } = q
  const playerSocket = io.sockets.sockets.get(player.socketId)
  playerSocket?.emit('duel:question', {
    question: qForClient,
    round: player.myRound,
    maxRounds: MAX_ROUNDS,
    scores: room.players.map(safePlayer),
    gameKey: room.gameKey || 'katak',
  })
}

function finishGame(io, room) {
  if (room._finishingGame) return
  room._finishingGame = true
  room.status = 'finished'
  const [p0, p1] = room.players
  let winner = null
  if (p0 && p1) {
    if (p0.score > p1.score) winner = safePlayer(p0)
    else if (p1.score > p0.score) winner = safePlayer(p1)
    // winner === null → draw
  } else if (p0) {
    // Only one player left (other disconnected from leaderboard) — remaining wins
    winner = safePlayer(p0)
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
      if (leaving.finished) {
        // Player yang pergi sudah selesai semua soal → yang tersisa tetap bermain
        // Tandai agar saat yang tersisa selesai, finishGame langsung dipanggil
        room._opponentLeft = true
      } else {
        // Player yang pergi belum selesai → hentikan game untuk keduanya
        room.status = 'finished'
        io.to(code).emit('duel:player-left', { name: leaving.name })
      }
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

async function canPlayStudentMode(socket, eventName) {
  if (socket.data.role !== 'siswa') return true
  try {
    const dead = await isStudentPetDead(pool, socket.data.userId)
    if (dead) {
      socket.emit(eventName, {
        message: 'Tomi sedang mati. Hidupkan Tomi kembali sebelum bermain mode ini.',
      })
      return false
    }
    return true
  } catch (err) {
    console.error('pet access check error', err)
    socket.emit(eventName, { message: 'Status Tomi belum dapat diperiksa. Coba lagi.' })
    return false
  }
}

// ─── Socket.io ───────────────────────────────────────────────────────────────
export function setupMultiplayer(httpServer, sessionMiddleware) {
  const io = new Server(httpServer, {
    path: '/socket.io',
    // origin: '*' + credentials: true dilarang per CORS spec → browser/WebView
    // menolak response. Harus list origin eksplisit agar session cookie
    // dikirim saat WebSocket handshake dari Capacitor APK.
    cors: {
      origin: [
        'capacitor://localhost',
        'https://localhost',
        'http://localhost',
        /^https?:\/\/localhost(:\d+)?$/,
      ],
      credentials: true,
    },
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
    // Tournament notifications can be sent before a student opens a match,
    // so keep the authenticated user id on the socket for server-side lookup.
    socket.data.userId = user.id
    socket.data.role = user.role

    // Register socket for direct messaging
    if (!userSockets.has(user.id)) userSockets.set(user.id, new Set())
    userSockets.get(user.id).add(socket.id)

    // Siswa join kelas room untuk menerima notifikasi turnamen
    if (user.role === 'siswa' && user.kelas) {
      socket.join(`kelas:${user.kelas}`)
    }

    const makePlayer = (avatar) => ({
      socketId:   socket.id,
      userId:     user.id,
      name:       user.name || user.username || 'Siswa',
      avatar:     avatar || null,
      score:      0,
      answered:   false,
      lastAnswer: null,
      myRound:    0,       // soal ke-N yang sedang dikerjakan player ini
      finished:   false,   // apakah sudah selesai semua soal
      currentQ:   null,    // soal aktif player ini (server-authoritative)
    })

    // ── CREATE ROOM ──────────────────────────────────────────────────────────
    socket.on('duel:create', async ({ avatar, gameKey } = {}) => {
      if (!(await canPlayStudentMode(socket, 'duel:error'))) return
      leaveAllRooms(socket, io)
      const code = genCode()
      const player = makePlayer(avatar)
      rooms.set(code, {
        code,
        gameKey:  gameKey || 'katak',
        players:  [player],
        status:   'waiting',
        createdAt: Date.now(),
      })
      socket.join(code)
      socket.emit('duel:created', { code, player: safePlayer(player), gameKey: gameKey || 'katak' })
    })

    // ── JOIN ROOM ────────────────────────────────────────────────────────────
    socket.on('duel:join', async ({ code: rawCode, avatar } = {}) => {
      if (!(await canPlayStudentMode(socket, 'duel:error'))) return
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
    socket.on('duel:start-game', async ({ code } = {}) => {
      if (!(await canPlayStudentMode(socket, 'duel:error'))) return
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
          // Async flow: send each player their own first question independently
          room.players.forEach(p => startPlayerRound(io, room, p))
        }
      }, 1000)
    })

    // ── SLIDER MOVE (real-time ghost position) ───────────────────────────────
    socket.on('duel:slider-move', async ({ code, value } = {}) => {
      if (!(await canPlayStudentMode(socket, 'duel:error'))) return
      const room = rooms.get(code)
      if (!room || room.status !== 'in-progress') return
      const player = room.players.find(p => p.userId === user.id)
      if (!player || player.answered) return
      socket.to(code).emit('duel:opponent-slider', { value })
    })

    // ── ANSWER SUBMISSION ────────────────────────────────────────────────────
    socket.on('duel:answer', async ({ code, value } = {}) => {
      if (!(await canPlayStudentMode(socket, 'duel:error'))) return
      const room = rooms.get(code)
      if (!room || room.status !== 'in-progress') return
      const player = room.players.find(p => p.userId === user.id)
      if (!player || player.answered || !player.currentQ) return

      player.answered   = true
      player.lastAnswer = value
      const correct = (value === player.currentQ.answer)
      if (correct) player.score++

      const opponent = room.players.find(p => p.userId !== user.id)

      // Beritahu lawan: skor kita terbaru (realtime update saat lawan masih bermain / di leaderboard)
      socket.to(code).emit('duel:score-update', {
        opponentScore: player.score,
        opponentRound: player.myRound,
      })

      // Kirim hasil jawaban ke player ini
      socket.emit('duel:answer-result', {
        correct,
        yourScore:     player.score,
        correctAnswer: player.currentQ.answer,
        yourValue:     value,
      })

      if (player.myRound >= MAX_ROUNDS) {
        // Player ini sudah selesai semua soal
        player.finished = true

        if (room._opponentLeft) {
          // Lawan sudah pergi dari leaderboard → kita yang baru selesai → game over
          finishGame(io, room)
        } else if (!opponent || opponent.finished) {
          // Kedua pemain selesai → tentukan pemenang
          finishGame(io, room)
        } else {
          // Lawan masih bermain → masukkan player ini ke leaderboard, tunggu lawan selesai
          socket.emit('duel:self-finished', {
            yourScore:     player.score,
            opponentScore: opponent?.score ?? 0,
            scores:        room.players.map(safePlayer),
          })
        }
      } else {
        // Langsung kirim soal berikutnya ke player ini setelah jeda singkat
        setTimeout(() => {
          if (room.status === 'in-progress') startPlayerRound(io, room, player)
        }, NEXT_Q_DELAY_MS)
      }
    })

    // ── NANANAGA IMMUNITY — kirim soal bonus tanpa menambah round ────────────
    // Dipanggil client saat menerima duel:answer-result dengan correct:false
    // dan masih ada immunity token tersisa. Server mengirim soal baru ke player ini
    // tanpa mengubah myRound, sehingga player mendapat kesempatan menjawab lagi.
    socket.on('duel:use-immunity', async ({ code } = {}) => {
      if (!(await canPlayStudentMode(socket, 'duel:error'))) return
      const room = rooms.get(code)
      if (!room || room.status !== 'in-progress') return
      const player = room.players.find(p => p.userId === user.id)
      if (!player) return

      // Generate fresh bonus question (round counter NOT incremented)
      player.answered = false
      player.lastAnswer = null
      const q = genTournamentQ(room.gameKey || 'katak')
      player.currentQ = q
      const { answer, ...qForClient } = q
      const playerSocket = io.sockets.sockets.get(player.socketId)
      playerSocket?.emit('duel:question', {
        question:   qForClient,
        round:      player.myRound,      // same round — immunity bonus round
        maxRounds:  MAX_ROUNDS,
        scores:     room.players.map(safePlayer),
        gameKey:    room.gameKey || 'katak',
        isImmunityBonus: true,
      })
    })

    // ── LEAVE (explicit, e.g. pressing back mid-game) ────────────────────────
    socket.on('duel:leave', () => {
      leaveAllRooms(socket, io)
    })

    // ── INVITE (kirim undangan duel langsung ke user lain) ───────────────────
    socket.on('duel:invite', async ({ targetUserId, targetRole, avatar, gameKey: inviteGameKey } = {}) => {
      if (!(await canPlayStudentMode(socket, 'duel:error'))) return
      if (user.role !== 'siswa' || targetRole !== 'siswa') {
        socket.emit('duel:error', { message: 'Undangan duel hanya antar siswa.' })
        return
      }
      if (!targetUserId || targetUserId === user.id) {
        socket.emit('duel:error', { message: 'Target undangan tidak valid.' })
        return
      }

      const chosenGameKey = inviteGameKey || 'katak'

      leaveAllRooms(socket, io)
      const code = genCode()
      const player = makePlayer(avatar)
      const room = {
        code,
        gameKey: chosenGameKey,
        players: [player],
        status: 'waiting',
        createdAt: Date.now(),
        inviteTargetId: targetUserId,
        cancelTimeout: null,
      }
      rooms.set(code, room)
      socket.join(code)
      socket.emit('duel:created', { code, player: safePlayer(player), gameKey: chosenGameKey })

      const invitePayload = {
        code,
        gameKey: chosenGameKey,
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

    socket.on('boss:answer', async ({ kelas, value } = {}) => {
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
          name:   user.name || user.username || 'Siswa',
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

        // ── Distribute rewards to every participant ──────────────────────────
        const rewardType   = raid.rewardType
        const rewardAmount = raid.rewardAmount || 0
        let rewardedCount  = 0
        if (rewardType && rewardAmount > 0 && raid.participants.size > 0) {
          const participantIds = Array.from(raid.participants.keys())
          try {
            if (rewardType === 'koin' || rewardType === 'koin_exp') {
              await pool.query(
                `update students
                 set coins               = coins               + $1,
                     total_coins_earned  = total_coins_earned  + $1
                 where id = any($2::text[])`,
                [rewardAmount, participantIds]
              )
            }
            if (rewardType === 'exp' || rewardType === 'koin_exp') {
              // Apply exp with level-up individually (level curve is non-linear)
              const { rows: students } = await pool.query(
                `select id, level, exp from students where id = any($1::text[])`,
                [participantIds]
              )
              for (const s of students) {
                const updated = applyExp(s.level, s.exp, rewardAmount)
                await pool.query(
                  `update students set level = $1, exp = $2 where id = $3`,
                  [updated.level, updated.exp, s.id]
                )
              }
            }
            rewardedCount = participantIds.length
          } catch (err) {
            console.error('boss:reward distribution error', err)
          }
        }

        io.to(`boss:${kelas}`).emit('boss:defeated', {
          participants:  sortedParticipants,
          rewardType,
          rewardAmount,
          rewardedCount,
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

    // Guru/siswa: join tournament room untuk melihat bracket live.
    // Siswa hanya boleh melihat turnamen yang memang diikutinya.
    socket.on('tournament:spectate', ({ tournamentId } = {}) => {
      const t = tournaments.get(tournamentId)
      if (!t) return
      const isGuru = user.role === 'guru'
      const isParticipant = t.students?.some(student => String(student.userId) === String(user.id))
      if (!isGuru && !isParticipant) return
      if (!isGuru) {
        isStudentPetDead(pool, user.id).then(dead => {
          if (dead) return
          socket.join(`tournament:${tournamentId}`)
          socket.emit('tournament:state', tournamentToClient(t))
        }).catch(() => {})
        return
      }
      socket.join(`tournament:${tournamentId}`)
      socket.emit('tournament:state', tournamentToClient(t))
    })

    // Guru: spectate satu match tertentu (real-time slider)
    socket.on('tournament:spectate-match', ({ matchId } = {}) => {
      if (user.role !== 'guru') return
      socket.join(`match-spectate:${matchId}`)
    })

    // Siswa: siap bergabung ke match (dipanggil saat buka TournamentMatchScreen)
    socket.on('tournament:player-ready', async ({ tournamentId, matchId } = {}) => {
      if (user.role !== 'siswa') return
      if (!(await canPlayStudentMode(socket, 'tournament:error'))) return
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
    socket.on('tournament:answer', async ({ tournamentId, matchId, value } = {}) => {
      if (user.role !== 'siswa') return
      if (!(await canPlayStudentMode(socket, 'tournament:error'))) return
      const t = tournaments.get(tournamentId)
      if (!t) return
      const round = t.rounds[t.currentRound - 1]
      const match = round?.matches.find(m => m.id === matchId)
      if (!match) return
      handleTournamentAnswer(io, t, match, user.id, value, socket)
    })

    // Siswa: Nananaga immunity — kirim soal bonus tanpa menambah round tournament
    socket.on('tournament:use-immunity', async ({ tournamentId, matchId } = {}) => {
      if (user.role !== 'siswa') return
      if (!(await canPlayStudentMode(socket, 'tournament:error'))) return
      const t = tournaments.get(tournamentId)
      if (!t) return
      const round = t.rounds[t.currentRound - 1]
      const match = round?.matches.find(m => m.id === matchId)
      if (!match || match.status !== 'in-progress') return

      match._playerRounds = match._playerRounds || {}
      match._playerCurrentQ = match._playerCurrentQ || {}

      const userId = user.id
      const playerRound = match._playerRounds[userId] || 0

      // Generate bonus question without advancing round counter
      const q = genTournamentQ(t.gameKey || 'katak')
      match._playerCurrentQ[userId] = q
      const { answer, ...qForClient } = q
      socket.emit('tournament:question', {
        question:        qForClient,
        round:           playerRound,   // same round — immunity bonus
        maxRounds:       7,             // TOURNAMENT_MAX_ROUNDS
        scores:          match.scores,
        isImmunityBonus: true,
      })
    })

    // Siswa: kirim posisi slider ke guru spectator
    socket.on('tournament:slider-move', async ({ matchId, value } = {}) => {
      if (user.role !== 'siswa') return
      if (!(await canPlayStudentMode(socket, 'tournament:error'))) return
      socket.to(`match-spectate:${matchId}`).emit('tournament:opponent-slider', {
        userId: user.id, value, matchId,
      })
    })
  })

  return io
}
