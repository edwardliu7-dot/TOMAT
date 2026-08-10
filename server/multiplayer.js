/**
 * TOMAT Multiplayer — Duel, Co-op Boss Raid & Tournament
 * Socket.io server module (attached to the existing Express http server)
 */
import { Server } from 'socket.io'
import { pool } from './db.js'
import { applyExp } from './gamify.js'
import { onCorrectAnswer, onDuelWin, onCorrectAnswerWithResult, onDuelWinWithResult } from './gameplay-events.js'
import { getBossRaid, raidToClient, bossRaids } from './boss-state.js'
import { tournaments, tournamentToClient, getTournamentIo } from './tournament-state.js'
import { startTournamentMatch, handleTournamentAnswer, autoSelectJuruJawab, checkAndStartKelompokMatch, getTeamIdForUser, TOURNAMENT_MAX_ROUNDS, emitToUser, resendTournamentQuestion } from './tournament-engine.js'
import { genTournamentQ } from './tournament-questions.js'
import { notifyUser } from './notifications.js'
import { isStudentPetDead } from './pet-state.js'
import { getPetBonus } from './pet-bonuses.js'
import { createMobaSocketAdapter } from './moba/socket-handlers.js'

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
  player.nextRoundTimer = null
  player.myRound++
  player.answered = false
  player.lastAnswer = null
  const q = genTournamentQ(room.gameKey || 'katak')
  player.currentQ = q
  player.questionStartedAt = Date.now()
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

function resendDuelQuestion(io, room, player, socket) {
  if (!room || room.status !== 'in-progress' || !player?.currentQ || player.answered) return false
  const { answer, ...qForClient } = player.currentQ
  socket.emit('duel:question', {
    question: qForClient,
    round: player.myRound,
    maxRounds: MAX_ROUNDS,
    scores: room.players.map(safePlayer),
    gameKey: room.gameKey || 'katak',
    isRecovery: true,
  })
  return true
}

async function finishGame(io, room) {
  if (room._finishingGame) return
  room._finishingGame = true
  room.status = 'finished'
  const [p0, p1] = room.players
  let winner = null
  let winnerReason = 'accuracy'
  if (p0 && p1) {
    if (p0.score > p1.score) winner = safePlayer(p0)
    else if (p1.score > p0.score) winner = safePlayer(p1)
    else if ((p0.answerTimeMs || 0) < (p1.answerTimeMs || 0)) {
      winner = safePlayer(p0)
      winnerReason = 'speed'
    } else if ((p1.answerTimeMs || 0) < (p0.answerTimeMs || 0)) {
      winner = safePlayer(p1)
      winnerReason = 'speed'
    }
    // Exact same accuracy and response time → draw.
  } else if (p0) {
    // Only one player left (other disconnected from leaderboard) — remaining wins
    winner = safePlayer(p0)
  }

  // Award 15 coins + track kemerdekaan_2 for the winner (server-authoritative).
  // BUG FIX: previously only tracked kemerdekaan_2 but never actually awarded coins,
  // even though GameOverScreen displayed "+15 koin".
  let winnerNewCoins = null
  if (winner?.userId) {
    try {
      const { rows } = await pool.query(
        `update students
           set coins              = coins              + 15,
               total_coins_earned = total_coins_earned + 15
         where id = $1
         returning coins`,
        [winner.userId]
      )
      winnerNewCoins = rows[0]?.coins ?? null
    } catch (err) {
      console.error('[duel:win] coin award error:', err)
    }
    // onDuelWinWithResult returns Array<MissionDelta> already formatted —
    // no need to import EVENT_MISSIONS here (RULES.md §16).
    const duelWinDeltas = await onDuelWinWithResult(winner.userId)
    for (const delta of duelWinDeltas) {
      for (const [, s] of io.sockets.sockets) {
        if (String(s.data?.userId) === String(winner.userId)) s.emit('mission:progress', delta)
      }
    }
  }

  io.to(room.code).emit('duel:game-over', {
    winner,
    scores: room.players.map(safePlayer),
    winnerReason,
    responseTimes: room.players.map(p => ({ userId: p.userId, timeMs: p.answerTimeMs || 0 })),
    winnerNewCoins,   // new field: client uses this to sync coin display without double-counting
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

// ─── Shared MOBA adapter reference (for REST routes in index.js) ─────────────
let _mobaAdapter = null
export function getMobaAdapter() { return _mobaAdapter }

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
  const moba = createMobaSocketAdapter({ io, pool })
  _mobaAdapter = moba

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
    socket.data.username = user.username || null
    socket.data.role = user.role
    socket.data.displayName = user.name || user.username || 'Siswa'
    moba.attach(socket)

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
      answerTimeMs: 0,
      questionStartedAt: null,
      myRound:    0,       // soal ke-N yang sedang dikerjakan player ini
      finished:   false,   // apakah sudah selesai semua soal
      currentQ:   null,    // soal aktif player ini (server-authoritative)
      // BUG-01 fix: immunity token tracking
      lastAnswerCorrect:  null,  // bool: apakah jawaban terakhir benar?
      immunityTokensLeft: null,  // null = belum di-fetch dari DB; number = sisa token
      immunityInFlight: false,   // mencegah dua klaim token bersamaan
      nextRoundTimer: null,      // timer soal normal, dibatalkan jika immunity dipakai
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
      player.answerTimeMs = (player.answerTimeMs || 0) + Math.max(
        0, Date.now() - (player.questionStartedAt || Date.now())
      )
      const correct = (Number(value) === Number(player.currentQ.answer))
      if (correct) player.score++
      player.lastAnswerCorrect = correct  // BUG-01 fix: catat hasil untuk immunity check

      // onCorrectAnswerWithResult returns Array<MissionDelta> already formatted —
      // no need to import EVENT_MISSIONS here (RULES.md §16).
      if (correct) {
        const deltas = await onCorrectAnswerWithResult(user.id)
        for (const delta of deltas) socket.emit('mission:progress', delta)
      }

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
        player.nextRoundTimer = setTimeout(() => {
          player.nextRoundTimer = null
          // Immunity dapat mengganti soal normal selama jeda. Jangan menimpa
          // soal bonus atau memajukan round untuk kedua kalinya.
          if (room.status === 'in-progress' && player.answered) {
            startPlayerRound(io, room, player)
          }
        }, NEXT_Q_DELAY_MS)
      }
    })

    // ── NANANAGA IMMUNITY — kirim soal bonus tanpa menambah round ────────────
    // BUG-01 FIX: tambahkan validasi server-side sebelum memberikan soal bonus:
    //   1. Player harus sudah menjawab soal aktif
    //   2. Jawaban terakhir harus salah
    //   3. Sisa token immunity > 0 (di-fetch lazy dari DB berdasarkan skin equipped)
    socket.on('duel:use-immunity', async ({ code } = {}, ack) => {
      const reject = () => {
        if (typeof ack === 'function') ack({ ok: false })
      }
      if (!(await canPlayStudentMode(socket, 'duel:error'))) return reject()
      const room = rooms.get(code)
      if (!room || room.status !== 'in-progress') return reject()
      const player = room.players.find(p => p.userId === user.id)
      if (!player) return reject()

      // Validasi 1: player harus sudah menjawab soal saat ini
      if (!player.answered) return reject()

      // Validasi 2: jawaban terakhir harus salah
      if (player.lastAnswerCorrect !== false) return reject()

      // Validasi 3: serialisasi klaim sebelum query DB agar dua emit simultan
      // tidak sama-sama melihat token yang sama.
      if (player.immunityInFlight) return reject()
      player.immunityInFlight = true

      try {
        // Cek sisa token dari DB (lazy fetch sekali per sesi)
        if (player.immunityTokensLeft === null) {
          const { rows } = await pool.query(
            'SELECT equipped_pet_skin FROM students WHERE id = $1',
            [user.id]
          )
          const skinId = rows[0]?.equipped_pet_skin || 'golden'
          const bonus = getPetBonus(skinId)
          player.immunityTokensLeft = bonus.wrongImmunity || 0
        }

        if (player.immunityTokensLeft <= 0) return reject()

        // Konsumsi satu token & reset flag agar tidak bisa diklaim ulang soal yang sama
        player.immunityTokensLeft--
        player.lastAnswerCorrect = null
        if (player.nextRoundTimer) {
          clearTimeout(player.nextRoundTimer)
          player.nextRoundTimer = null
        }

        // Generate fresh bonus question (round counter NOT incremented)
        player.answered = false
        player.lastAnswer = null
        const q = genTournamentQ(room.gameKey || 'katak')
        player.currentQ = q
        const { answer, ...qForClient } = q
        const playerSocket = io.sockets.sockets.get(player.socketId)
        playerSocket?.emit('duel:question', {
          question:        qForClient,
          round:           player.myRound,  // same round — immunity bonus
          maxRounds:       MAX_ROUNDS,
          scores:          room.players.map(safePlayer),
          gameKey:         room.gameKey || 'katak',
          isImmunityBonus: true,
        })
        if (typeof ack === 'function') {
          ack({ ok: true, tokensLeft: player.immunityTokensLeft })
        }
      } catch (err) {
        console.error('[duel:use-immunity] DB check error:', err)
        reject()
      } finally {
        player.immunityInFlight = false
      }
    })

    // Re-attach a player to an in-progress duel after a WebSocket reconnect.
    // Socket IDs are connection-scoped, so keeping the old ID would make
    // subsequent questions/results disappear for the player.
    socket.on('duel:rejoin', async ({ code: rawCode } = {}) => {
      if (!(await canPlayStudentMode(socket, 'duel:error'))) return
      const code = rawCode?.toUpperCase?.()?.trim()
      const room = rooms.get(code)
      if (!room || !['waiting', 'in-progress'].includes(room.status)) return
      const player = room.players.find(p => String(p.userId) === String(user.id))
      if (!player) return

      // The normal lobby → arena transition keeps the same socket and the
      // player is already in this room. Do not call leaveAllRooms here or the
      // recovery attempt would remove the player before re-attaching it.
      if (player.socketId !== socket.id) leaveAllRooms(socket, io)
      player.socketId = socket.id
      socket.join(code)
      socket.emit('duel:rejoined', {
        code,
        players: room.players.map(safePlayer),
        myIndex: room.players.indexOf(player),
        status: room.status,
      })
      resendDuelQuestion(io, room, player, socket)
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

      // BUG-03 FIX: gunakan Number() agar jawaban numeric string tidak selalu salah
      const correct = (Number(value) === Number(pending.answer))
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

    // Siswa: masuk lobby turnamen (sebelum guru mulai)
    socket.on('tournament:join-lobby', ({ tournamentId } = {}) => {
      if (user.role !== 'siswa') return
      const t = tournaments.get(tournamentId)
      if (!t || !t.lobbyOpen) return
      const isParticipant = t.students?.some(s => String(s.userId) === String(user.id))
      if (!isParticipant) return
      if (!t.lobby) t.lobby = {}
      t.lobby[user.id] = { userId: user.id, name: user.name, joinedAt: Date.now() }
      // Join bracket room so they receive state updates
      socket.join(`tournament:${tournamentId}`)
      // Tell guru the lobby state
      io.to(`tournament:${tournamentId}`).emit('tournament:lobby-state', {
        tournamentId,
        lobby: Object.values(t.lobby),
        total: t.students?.length ?? 0,
      })
    })

    // Siswa: cek apakah ada turnamen aktif setelah refresh halaman.
    // Mencari turnamen mana pun yang masih berjalan dan siswa ini termasuk peserta.
    socket.on('tournament:check-active', () => {
      if (user.role !== 'siswa') return
      for (const [tournamentId, t] of tournaments) {
        if (t.status !== 'in-progress') continue
        const isParticipant = t.students?.some(s => String(s.userId) === String(user.id))
        if (!isParticipant) continue

        // Bergabung ke room bracket agar menerima update
        socket.join(`tournament:${tournamentId}`)

        // Cari match aktif (waiting-join atau in-progress) untuk siswa ini di ronde saat ini
        const round = t.rounds[t.currentRound - 1]
        let pendingMatch = null
        if (round) {
          pendingMatch = round.matches.find(m => {
            if (!['waiting-join', 'waiting-juru', 'in-progress'].includes(m.status)) return false
            if (t.mode !== 'kelompok') {
              return m.player1?.userId === user.id || m.player2?.userId === user.id
            }
            const teamId = getTeamIdForUser(t, user.id)
            return teamId && (m.player1?.teamId === teamId || m.player2?.teamId === teamId)
          })
        }

        if (pendingMatch) {
          if (t.mode === 'kelompok') {
            const myTeamId = getTeamIdForUser(t, user.id)
            const myTeam = t.teams?.find(team => team.id === myTeamId)
            const opponentTeamId = pendingMatch.player1?.teamId === myTeamId
              ? pendingMatch.player2?.teamId
              : pendingMatch.player1?.teamId
            const opponentTeam = t.teams?.find(team => team.id === opponentTeamId)
            const myRep = pendingMatch.player1?.teamId === myTeamId
              ? pendingMatch.player1
              : pendingMatch.player2
            socket.emit('tournament:active-state', {
              tournamentId,
              match: {
                matchId: pendingMatch.id,
                opponent: opponentTeam
                  ? { teamId: opponentTeam.id, teamName: opponentTeam.name, name: opponentTeam.name }
                  : null,
                gameKey: t.gameKey,
                round: t.currentRound,
                isKelompok: true,
                teamId: myTeam?.id || myTeamId,
                teamName: myTeam?.name || null,
                teamRepUserId: myRep?.userId || null,
                myTeamMembers: myTeam?.members?.map(member => ({
                  userId: member.userId,
                  name: member.name,
                })) || [],
              },
            })
          } else {
            const opponent = pendingMatch.player1?.userId === user.id
              ? pendingMatch.player2 : pendingMatch.player1
            socket.emit('tournament:active-state', {
              tournamentId,
              match: {
                matchId:    pendingMatch.id,
                opponent:   opponent ? { userId: opponent.userId, name: opponent.name } : null,
                gameKey:    t.gameKey,
                round:      t.currentRound,
                isKelompok: false,
              },
            })
          }
        } else {
          // Turnamen masih berjalan tapi tidak ada match pending untuk siswa ini
          // (mungkin sudah menang/kalah di ronde ini, menunggu ronde berikutnya)
          socket.emit('tournament:active-state', { tournamentId, match: null })
        }
        return // Satu siswa hanya bisa ada di satu turnamen aktif
      }
    })

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

      // BUG-04 FIX: validasi kepemilikan match SEBELUM socket.join agar
      // peserta dari match lain tidak bisa masuk room dan mempengaruhi state.
      if (t.mode === 'kelompok') {
        // Kelompok: semua anggota tim boleh join, bukan hanya representatif
        const teamId = getTeamIdForUser(t, user.id)
        if (!teamId) return

        // Pastikan tim ini memang peserta match ini
        const isMatchParticipant = match.player1?.teamId === teamId || match.player2?.teamId === teamId
        if (!isMatchParticipant) return

        // Baru join room setelah validasi
        socket.join(match.roomCode)
        match._teamMemberSockets = match._teamMemberSockets || {}
        match._teamMemberSockets[user.id] = socket.id

        // The question event may have been emitted just before this socket
        // connected (or while the app was resuming). Re-send the durable
        // server-side question instead of leaving the arena blank.
        resendTournamentQuestion(io, t, match, user.id, socket)

        io.to(`tournament:${tournamentId}`).emit('tournament:state', tournamentToClient(t))

        // Beritahu anggota lain di match room siapa yang sudah join
        io.to(match.roomCode).emit('tournament:team-member-joined', {
          userId:   user.id,
          name:     user.name,
          teamId,
          matchId:  match.id,
        })

        // Jika ini match pertama yang joining dan belum ada timer juru jawab → mulai timer
        if (match.status === 'waiting-join') {
          const anyJoined = Object.keys(match._teamMemberSockets).length === 1
          if (anyJoined && !match._teamJuruTimer) {
            // Mulai timer 30 detik untuk pemilihan juru jawab
            match._teamJuruTimer = setTimeout(() => {
              if (match.status === 'waiting-join' || match.status === 'waiting-juru') {
                autoSelectJuruJawab(io, t, match)
              }
            }, 30_000)
            match.status = 'waiting-juru'
            io.to(`tournament:${tournamentId}`).emit('tournament:state', tournamentToClient(t))
          }
        }
      } else {
        // Individual: hanya peserta match ini yang boleh join
        const isP1 = match.player1?.userId === user.id
        const isP2 = match.player2?.userId === user.id
        if (!isP1 && !isP2) return  // BUG-04 FIX: cek sebelum join

        // Baru join room setelah validasi
        socket.join(match.roomCode)

        if (isP1) match.player1.socketId = socket.id
        if (isP2) match.player2.socketId = socket.id

        // If the match is already live, this is a reconnect/re-entry. The
        // original question event is not durable, so recover it immediately.
        if (match.status === 'in-progress') {
          resendTournamentQuestion(io, t, match, user.id, socket)
          return
        }

        io.to(`tournament:${tournamentId}`).emit('tournament:state', tournamentToClient(t))

        const p1Ready = !match.player1 || match.player1.socketId
        const p2Ready = !match.player2 || match.player2.socketId
        if (p1Ready && p2Ready && match.status === 'waiting-join') {
          if (match.walkoverTimer) { clearTimeout(match.walkoverTimer); match.walkoverTimer = null }
          startTournamentMatch(io, t, match)
        }
      }
    })

    // Siswa (kelompok): klaim jadi juru jawab tim
    socket.on('tournament:claim-juru-jawab', ({ tournamentId, matchId } = {}) => {
      if (user.role !== 'siswa') return
      const t = tournaments.get(tournamentId)
      if (!t || t.mode !== 'kelompok') return
      const round = t.rounds[t.currentRound - 1]
      const match = round?.matches.find(m => m.id === matchId)
      if (!match || !['waiting-join','waiting-juru'].includes(match.status)) return

      // BUG-05 FIX: user harus sudah join match ini via tournament:player-ready
      if (!match._teamMemberSockets?.[user.id]) return

      const teamId = getTeamIdForUser(t, user.id)
      if (!teamId) return
      if (match.teamJuruJawab?.[teamId]) return // sudah ada juru jawab

      match.teamJuruJawab = match.teamJuruJawab || {}
      match.teamJuruJawab[teamId] = user.id

      const team = t.teams?.find(tm => tm.id === teamId)
      const memberName = team?.members.find(m => String(m.userId) === String(user.id))?.name || user.name

      io.to(match.roomCode).emit('tournament:juru-jawab-set', {
        teamId,
        userId:       user.id,
        name:         memberName,
        autoSelected: false,
      })

      // Cek apakah kedua tim sudah punya juru jawab
      checkAndStartKelompokMatch(io, t, match)
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
      await handleTournamentAnswer(io, t, match, user.id, value, socket)
    })

    // Siswa: Nananaga immunity — kirim soal bonus tanpa menambah round tournament
    // BUG-02 FIX: tambahkan validasi server-side sebelum memberikan soal bonus:
    //   1. Player harus sudah menjawab soal aktif (_playerCurrentQ[userId] === null)
    //   2. Jawaban terakhir harus salah (_playerLastAnswerCorrect[userId] === false)
    //   3. Sisa token immunity > 0 (lazy fetch dari DB berdasarkan skin equipped)
    socket.on('tournament:use-immunity', async ({ tournamentId, matchId } = {}, ack) => {
      const reject = () => {
        if (typeof ack === 'function') ack({ ok: false })
      }
      if (user.role !== 'siswa') return
      if (!(await canPlayStudentMode(socket, 'tournament:error'))) return reject()
      const t = tournaments.get(tournamentId)
      if (!t) return reject()
      const round = t.rounds[t.currentRound - 1]
      const match = round?.matches.find(m => m.id === matchId)
      if (!match || match.status !== 'in-progress') return reject()

      const userId = user.id
      const teamId = getTeamIdForUser(t, userId)
      if (t.mode === 'kelompok') {
        const isMatchTeam = Boolean(teamId && (
          match.player1?.teamId === teamId || match.player2?.teamId === teamId
        ))
        const isJuruJawab = String(match.teamJuruJawab?.[teamId]) === String(userId)
        if (!isMatchTeam || !isJuruJawab) return reject()

        match._kelompokAnswers = match._kelompokAnswers || {}
        match._kelompokQuestionsByTeam = match._kelompokQuestionsByTeam || {}
        match._kelompokLastAnswerCorrect = match._kelompokLastAnswerCorrect || {}
        match._kelompokImmunityLeft = match._kelompokImmunityLeft || {}
        match._kelompokImmunityInFlight = match._kelompokImmunityInFlight || {}

        // The original wrong answer has already been recorded. Only the
        // answering team may claim a bonus, and only after a wrong answer.
        if (match._kelompokAnswers[teamId] !== true) return reject()
        if (match._kelompokLastAnswerCorrect[teamId] !== false) return reject()
        if (match._kelompokImmunityInFlight[teamId]) return reject()
        match._kelompokImmunityInFlight[teamId] = true

        try {
          if (match._kelompokImmunityLeft[teamId] === undefined) {
            const { rows } = await pool.query(
              'SELECT equipped_pet_skin FROM students WHERE id = $1',
              [userId]
            )
            const skinId = rows[0]?.equipped_pet_skin || 'golden'
            const bonus = getPetBonus(skinId)
            match._kelompokImmunityLeft[teamId] = bonus.wrongImmunity || 0
          }
          if (match._kelompokImmunityLeft[teamId] <= 0) return reject()

          match._kelompokImmunityLeft[teamId]--
          match._kelompokLastAnswerCorrect[teamId] = null
          match._kelompokAnswers[teamId] = false

          const q = genTournamentQ(t.gameKey || 'katak')
          match._kelompokQuestionsByTeam[teamId] = q
          const { answer, ...qForClient } = q
          const team = t.teams?.find(tm => tm.id === teamId)
          for (const member of team?.members || []) {
            const memberSocketId = match._teamMemberSockets?.[member.userId]
            io.sockets.sockets.get(memberSocketId)?.emit('tournament:question', {
              question: qForClient,
              round: match._kelompokRound,
              maxRounds: TOURNAMENT_MAX_ROUNDS,
              scores: match.scores,
              isKelompok: true,
              teamJuruJawab: match.teamJuruJawab,
              isImmunityBonus: true,
            })
          }
          if (typeof ack === 'function') {
            ack({ ok: true, tokensLeft: match._kelompokImmunityLeft[teamId] })
          }
        } catch (err) {
          console.error('[tournament:use-immunity kelompok] DB check error:', err)
          reject()
        } finally {
          match._kelompokImmunityInFlight[teamId] = false
        }
        return
      }

      const isMatchParticipant =
        String(match.player1?.userId) === String(userId) ||
        String(match.player2?.userId) === String(userId)
      if (!isMatchParticipant) return reject()

      match._playerRounds        = match._playerRounds        || {}
      match._playerCurrentQ      = match._playerCurrentQ      || {}
      match._playerLastAnswerCorrect = match._playerLastAnswerCorrect || {}
      match._playerImmunityLeft  = match._playerImmunityLeft  || {}
      match._playerImmunityInFlight = match._playerImmunityInFlight || {}
      match._playerNextQuestionTimers = match._playerNextQuestionTimers || {}

      // Validasi 1: player harus sudah menjawab (currentQ = null artinya sudah)
      if (match._playerCurrentQ[userId] !== null && match._playerCurrentQ[userId] !== undefined) {
        return reject()
      }

      // Validasi 2: jawaban terakhir harus salah
      if (match._playerLastAnswerCorrect[userId] !== false) return reject()

      // Serialisasi klaim sebelum query DB agar dua emit simultan tidak
      // sama-sama memakai token yang sama.
      if (match._playerImmunityInFlight[userId]) return reject()
      match._playerImmunityInFlight[userId] = true

      try {
        // Validasi 3: cek sisa token dari DB (lazy fetch sekali per match per player)
        if (match._playerImmunityLeft[userId] === undefined) {
          const { rows } = await pool.query(
            'SELECT equipped_pet_skin FROM students WHERE id = $1',
            [userId]
          )
          const skinId = rows[0]?.equipped_pet_skin || 'golden'
          const bonus = getPetBonus(skinId)
          match._playerImmunityLeft[userId] = bonus.wrongImmunity || 0
        }

        if (match._playerImmunityLeft[userId] <= 0) return reject()

        // Konsumsi satu token & reset flag
        match._playerImmunityLeft[userId]--
        match._playerLastAnswerCorrect[userId] = null
        if (match._playerNextQuestionTimers[userId]) {
          clearTimeout(match._playerNextQuestionTimers[userId])
          match._playerNextQuestionTimers[userId] = null
        }

        const playerRound = match._playerRounds[userId] || 0

        // Generate bonus question without advancing round counter
        const q = genTournamentQ(t.gameKey || 'katak')
        match._playerCurrentQ[userId] = q
        match._playerQuestionStartedAt = match._playerQuestionStartedAt || {}
        match._playerQuestionStartedAt[userId] = Date.now()
        const { answer, ...qForClient } = q
        socket.emit('tournament:question', {
          question:        qForClient,
          round:           playerRound,  // same round — immunity bonus
          maxRounds:       TOURNAMENT_MAX_ROUNDS,
          scores:          match.scores,
          isImmunityBonus: true,
        })
        if (typeof ack === 'function') {
          ack({ ok: true, tokensLeft: match._playerImmunityLeft[userId] })
        }
      } catch (err) {
        console.error('[tournament:use-immunity] DB check error:', err)
        reject()
      } finally {
        match._playerImmunityInFlight[userId] = false
      }
    })

    // Siswa: kirim posisi slider ke guru spectator
    socket.on('tournament:slider-move', async ({ matchId, value } = {}) => {
      if (user.role !== 'siswa') return
      if (!(await canPlayStudentMode(socket, 'tournament:error'))) return
      socket.to(`match-spectate:${matchId}`).emit('tournament:opponent-slider', {
        userId: user.id, value, matchId,
      })
    })

    // Siswa (juru jawab kelompok): broadcast posisi slider ke anggota tim sendiri
    socket.on('tournament:team-slider', async ({ tournamentId, matchId, value } = {}) => {
      if (user.role !== 'siswa') return
      const t = tournaments.get(tournamentId)
      if (!t || t.mode !== 'kelompok') return
      const round = t.rounds[t.currentRound - 1]
      const match = round?.matches.find(m => m.id === matchId)
      if (!match) return
      // Broadcast ke seluruh match room kecuali pengirim
      socket.to(match.roomCode).emit('tournament:team-slider-update', {
        userId: user.id, value, matchId,
      })
      // Juga ke guru spectator
      socket.to(`match-spectate:${matchId}`).emit('tournament:opponent-slider', {
        userId: user.id, value, matchId,
      })
    })
  })

  return io
}
