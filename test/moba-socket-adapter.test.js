import assert from 'node:assert/strict'
import test from 'node:test'
import { createMobaSocketAdapter } from '../server/moba/socket-handlers.js'

class FakeSocket {
  constructor(userId) {
    this.id = `socket-${userId}`
    this.data = { userId, role: 'siswa', displayName: userId }
    this.handlers = new Map()
    this.sent = []
    this.rooms = new Set()
  }

  on(event, handler) {
    this.handlers.set(event, handler)
  }

  emit(event, payload, ack) {
    this.sent.push({ event, payload })
    if (typeof ack === 'function') this.lastAck = ack
  }

  join(room) {
    this.rooms.add(room)
  }

  leave(room) {
    this.rooms.delete(room)
  }

  async trigger(event, payload, ack) {
    return this.handlers.get(event)?.(payload, ack)
  }
}

function createFakeIo() {
  const broadcasts = []
  return {
    broadcasts,
    sockets: { sockets: new Map() },
    to(room) {
      const broadcast = {
        emit(event, payload) {
          broadcasts.push({ room, event, payload })
        },
      }
      broadcast.except = socketId => ({
        emit(event, payload) {
          broadcasts.push({ room, event, payload, except: socketId })
        },
      })
      return broadcast
    },
  }
}

function ackResult() {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return {
    promise,
    ack: value => resolve(value),
  }
}

async function waitForPhase(manager, matchId, phase, timeoutMs = 100) {
  const startedAt = Date.now()
  while (manager.getMatch(matchId)?.phase !== phase) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(`Timed out waiting for phase ${phase}`)
    }
    await new Promise(resolve => setTimeout(resolve, 1))
  }
}

test('adapter gives two sockets the same snapshot and reconnect preserves state', async () => {
  const io = createFakeIo()
  const adapter = createMobaSocketAdapter({
    io,
    reconnectGraceMs: 5,
  })
  const first = new FakeSocket('student-1')
  io.sockets.sockets.set(first.id, first)
  adapter.attach(first)

  const created = ackResult()
  await first.trigger('moba:create', {
    teamSize: 1,
    config: {
      countdownMs: 1,
      durationMs: 100_000,
      nodeSpawnIntervalMs: 100_000,
      movementMinIntervalMs: 0,
    },
  }, created.ack)
  const createdResult = await created.promise
  assert.equal(createdResult.ok, true)
  const matchId = createdResult.matchId

  const second = new FakeSocket('student-2')
  io.sockets.sockets.set(second.id, second)
  adapter.attach(second)
  const joined = ackResult()
  await second.trigger('moba:join', { matchId }, joined.ack)
  assert.equal((await joined.promise).ok, true)

  const firstReady = ackResult()
  await first.trigger('moba:ready', {}, firstReady.ack)
  assert.equal((await firstReady.promise).ok, true)
  const secondReady = ackResult()
  await second.trigger('moba:ready', {}, secondReady.ack)
  assert.equal((await secondReady.promise).ok, true)
  await waitForPhase(adapter.manager, matchId, 'running_outer_tower')

  const firstSnapshot = first.sent.find(item => item.event === 'moba:state_snapshot')
  const secondSnapshot = second.sent.find(item => item.event === 'moba:state_snapshot')
  assert.equal(firstSnapshot.payload.snapshot.id, matchId)
  assert.equal(secondSnapshot.payload.snapshot.id, firstSnapshot.payload.snapshot.id)
  assert.equal(first.sent.some(item => item.event === 'moba:question_opened'), false)
  assert.equal(second.sent.some(item => item.event === 'moba:question_opened'), false)
  assert.deepEqual(
    adapter.manager.listMatches()[0].players.map(player => player.userId).sort(),
    ['student-1', 'student-2'],
  )
  const actionPayload = { actionId: 'move-once', direction: { x: 1, y: 0 } }
  const moved = ackResult()
  await first.trigger('moba:move', actionPayload, moved.ack)
  const movedResult = await moved.promise
  assert.equal(movedResult.ok, true, JSON.stringify(movedResult))
  const retried = ackResult()
  await first.trigger('moba:move', actionPayload, retried.ack)
  assert.equal((await retried.promise).duplicate, true)

  await first.trigger('disconnect')
  const reconnecting = new FakeSocket('student-1')
  io.sockets.sockets.set(reconnecting.id, reconnecting)
  adapter.attach(reconnecting)
  const rejoined = ackResult()
  await reconnecting.trigger('moba:join', { matchId }, rejoined.ack)
  const reconnectResult = await rejoined.promise
  assert.equal(reconnectResult.ok, true)
  assert.equal(reconnectResult.snapshot.players.find(player =>
    player.userId === 'student-1').connected, true)
  assert.ok(reconnecting.sent.some(item => item.event === 'moba:state_snapshot'))
  adapter.manager.clearAll()
})

test('question result stays private while opponents receive only the snapshot', async () => {
  const io = createFakeIo()
  const adapter = createMobaSocketAdapter({ io })
  const first = new FakeSocket('student-1')
  io.sockets.sockets.set(first.id, first)
  adapter.attach(first)

  const created = ackResult()
  await first.trigger('moba:create', {
    teamSize: 1,
    config: {
      countdownMs: 1,
      durationMs: 100_000,
      nodeSpawnIntervalMs: 100_000,
      movementMinIntervalMs: 0,
      nodeInteractionRadius: 220,
    },
  }, created.ack)
  const matchId = (await created.promise).matchId

  const second = new FakeSocket('student-2')
  io.sockets.sockets.set(second.id, second)
  adapter.attach(second)
  const joined = ackResult()
  await second.trigger('moba:join', { matchId }, joined.ack)
  assert.equal((await joined.promise).ok, true)

  for (const socket of [first, second]) {
    const ready = ackResult()
    await socket.trigger('moba:ready', {}, ready.ack)
    assert.equal((await ready.promise).ok, true)
  }
  await waitForPhase(adapter.manager, matchId, 'running_outer_tower')

  const spawned = adapter.manager.spawnNode(matchId, {
    position: { x: 300, y: 300, lane: 'middle' },
  })
  assert.equal(spawned.ok, true)
  const claimed = ackResult()
  await first.trigger('moba:claim_node', {
    nodeId: spawned.nodeId,
    actionId: 'claim-private-question',
  }, claimed.ack)
  assert.equal((await claimed.promise).ok, true)

  const match = adapter.manager.getMatch(matchId)
  const player = [...match.players.values()].find(item => item.userId === 'student-1')
  const session = player.questionSession
  const answer = match.questions.get(session.questionId).answer
  const answered = ackResult()
  await first.trigger('moba:answer_question', {
    questionSessionId: session.id,
    answer,
    actionId: 'answer-private-question',
  }, answered.ack)
  assert.equal((await answered.promise).ok, true)

  const publicResult = io.broadcasts
    .filter(item => item.event === 'moba:question_closed')
    .at(-1).payload
  const publicEvent = io.broadcasts
    .filter(item => item.event === 'moba:question_closed')
    .at(-1)
  assert.equal(publicEvent.except, first.id)
  assert.equal(publicResult.correct, undefined)
  assert.equal(publicResult.scroll, undefined)
  assert.equal(JSON.stringify(publicResult).includes('correctAnswer'), false)
  assert.equal(JSON.stringify(publicResult).includes('"answer"'), false)
  const privateResult = first.sent
    .filter(item => item.event === 'moba:question_closed')
    .at(-1).payload
  assert.equal(privateResult.correct, true)
  assert.ok(privateResult.scroll)

  adapter.manager.clearAll()
})

test('failed create join does not leave an orphaned match', async () => {
  const io = createFakeIo()
  const adapter = createMobaSocketAdapter({
    io,
    getPlayerProfile: async () => ({ petType: 'tomi', petSkinId: 'golden', isDead: true }),
  })
  const socket = new FakeSocket('student-dead')
  io.sockets.sockets.set(socket.id, socket)
  adapter.attach(socket)

  const created = ackResult()
  await socket.trigger('moba:create', { teamSize: 1 }, created.ack)
  const result = await created.promise

  assert.equal(result.ok, false)
  assert.equal(adapter.manager.listMatches().length, 0)
})

test('matchmaking automatically pairs two students into one ready match', async () => {
  const io = createFakeIo()
  const adapter = createMobaSocketAdapter({
    io,
    manager: undefined,
  })
  const first = new FakeSocket('student-matchmake-1')
  const second = new FakeSocket('student-matchmake-2')
  io.sockets.sockets.set(first.id, first)
  io.sockets.sockets.set(second.id, second)
  adapter.attach(first)
  adapter.attach(second)

  const firstAck = ackResult()
  await first.trigger('moba:matchmaking_join', { teamSize: 1 }, firstAck.ack)
  assert.equal((await firstAck.promise).status, 'queued')
  assert.equal(adapter.manager.listMatches().length, 0)

  const secondAck = ackResult()
  await second.trigger('moba:matchmaking_join', { teamSize: 1 }, secondAck.ack)
  assert.equal((await secondAck.promise).status, 'queued')

  const firstFound = first.sent.find(item => item.event === 'moba:matchmaking_found')
  const secondFound = second.sent.find(item => item.event === 'moba:matchmaking_found')
  assert.ok(firstFound)
  assert.ok(secondFound)
  assert.equal(firstFound.payload.matchId, secondFound.payload.matchId)
  assert.equal(firstFound.payload.snapshot.players.length, 2)
  assert.equal(firstFound.payload.snapshot.phase, 'countdown')
  assert.equal(adapter.manager.listMatches()[0].phase, 'countdown')

  adapter.manager.clearAll()
})