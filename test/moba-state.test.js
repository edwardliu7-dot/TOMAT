import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_MOBA_CONFIG,
  DIFFICULTIES,
  ERROR_CODES,
  MOBA_ARENA_SIZE,
  MOBA_ARENA_TILES,
  MOBA_TILE_SIZE,
  PHASES,
  PET_TYPES,
  TEAM_SIZES,
} from '../server/moba/config.js'
import {
  createMatchState,
  createPlayerState,
  publicNode,
  sanitizeMatchState,
} from '../server/moba/state.js'
import { createMobaMatchManager } from '../server/moba/match-manager.js'
import {
  canUseWrongAnswerImmunity,
  consumeWrongAnswerImmunity,
  getDepositMultiplier,
  getInitialImmunity,
  getMovementSpeed,
  getScrollCapacity,
} from '../server/moba/pet-effects.js'

class FakeClock {
  constructor(start = 0) {
    this.time = start
    this.nextId = 1
    this.timers = new Map()
  }

  now = () => this.time

  setTimeout = (callback, delay) => {
    const id = this.nextId++
    this.timers.set(id, { at: this.time + delay, callback })
    return id
  }

  clearTimeout = id => {
    this.timers.delete(id)
  }

  advance = async ms => {
    const target = this.time + ms
    while (true) {
      const due = [...this.timers.entries()]
        .filter(([, timer]) => timer.at <= target)
        .sort(([, left], [, right]) => left.at - right.at)
      if (due.length === 0) break
      const [id, timer] = due[0]
      this.timers.delete(id)
      this.time = timer.at
      timer.callback()
      await Promise.resolve()
    }
    this.time = target
  }
}

test('creates the default 1v1 match state with isolated team structures', () => {
  const match = createMatchState({ id: 'match-test', now: 1234 })

  assert.equal(match.id, 'match-test')
  assert.equal(match.mode, 'tomat-moba')
  assert.equal(match.teamSize, 1)
  assert.equal(match.phase, PHASES.LOBBY)
  assert.equal(MOBA_ARENA_SIZE, 20000)
  assert.equal(MOBA_TILE_SIZE, 16)
  assert.equal(MOBA_ARENA_TILES, 1250)
  assert.deepEqual(match.config.arena, {
    minX: 0,
    maxX: 20000,
    minY: 0,
    maxY: 20000,
    tileSize: 16,
    columns: 1250,
    rows: 1250,
    nodeSafeRadius: 44,
    playerSafeRadius: 56,
    baseSafeRadius: 100,
    maxSpawnAttempts: 100,
  })
  assert.equal(match.createdAt, 1234)
  assert.equal(match.startedAt, null)
  assert.equal(match.endsAt, null)
  assert.deepEqual(match.config, DEFAULT_MOBA_CONFIG)
  assert.deepEqual(match.teams.teamA.tower, {
    points: 0,
    maxPoints: 100,
    destroyed: false,
  })
  assert.deepEqual(match.teams.teamB.base, {
    points: 0,
    maxPoints: 100,
    hp: 100,
  })
  assert.notEqual(match.teams.teamA.playerIds, match.teams.teamB.playerIds)
  assert.ok(match.players instanceof Map)
  assert.ok(match.activeNodes instanceof Map)
  assert.ok(match.questions instanceof Map)
})

test('accepts only the supported team sizes', () => {
  for (const teamSize of TEAM_SIZES) {
    assert.equal(createMatchState({ teamSize }).teamSize, teamSize)
  }

  assert.throws(() => createMatchState({ teamSize: 0 }), /teamSize/)
  assert.throws(() => createMatchState({ teamSize: 4 }), /teamSize/)
  assert.throws(() => createMatchState({ teamSize: '2' }), /teamSize/)
})

test('creates a player with a pet loadout and safe defaults', () => {
  const player = createPlayerState({
    id: 'player-test',
    teamId: 'teamB',
    userId: 'student-1',
    displayName: 'Siswa 1',
    petType: PET_TYPES.NANANAGA,
    petSkinId: 'pet_nananaga_es',
    now: 5000,
  })

  assert.deepEqual(player.position, { x: 19680, y: 10000, lane: 'middle' })
  assert.equal(player.lastInputAt, 5000)
  assert.equal(player.questionSession, null)
  assert.deepEqual(player.scrolls, [])
  assert.equal(player.maxScrolls, 1)
  assert.equal(player.score, 0)
  assert.equal(player.immunityAvailable, false)
  assert.ok(player.recentActionIds instanceof Map)
  assert.throws(() => createPlayerState({ petType: 'avatar-baru' }), /pet type/)
})

test('sanitizes nodes and omits server-only question answers', () => {
  const match = createMatchState({ id: 'match-secret' })
  const player = createPlayerState({
    id: 'player-secret',
    userId: 'student-secret',
    displayName: 'Student',
  })
  player.questionSession = {
    id: 'question-session',
    questionId: 'question-secret',
    answer: '42',
  }
  match.players.set(player.id, player)
  match.teams.teamA.playerIds.push(player.id)
  match.questions.set('question-secret', {
    id: 'question-secret',
    prompt: 'Berapa 6 x 7?',
    options: ['40', '42'],
    answer: '42',
    correctAnswer: '42',
  })
  match.activeNodes.set('node-1', {
    id: 'node-1',
    difficulty: DIFFICULTIES.HARD,
    points: 50,
    position: { x: 250, y: 310, lane: 'middle' },
    status: 'claimed',
    claimedBy: player.id,
    spawnedAt: 100,
    expiresAt: 10_000,
    answer: '42',
  })

  const snapshot = sanitizeMatchState(match)
  const serialized = JSON.stringify(snapshot)

  assert.equal(snapshot.config.arena.tileSize, 16)
  assert.equal(snapshot.config.arena.columns, 1250)
  assert.equal(snapshot.config.arena.rows, 1250)
  assert.equal(snapshot.questions, undefined)
  assert.equal(snapshot.timers, undefined)
  assert.equal(snapshot.players[0].questionSession, undefined)
  assert.equal(snapshot.activeNodes[0].answer, undefined)
  assert.equal(serialized.includes('correctAnswer'), false)
  assert.equal(serialized.includes('"answer"'), false)
  assert.deepEqual(snapshot.activeNodes[0], publicNode(match.activeNodes.get('node-1')))
})

test('snapshot is detached from the live state', () => {
  const match = createMatchState({ teamSize: 3 })
  const player = createPlayerState({ id: 'player-copy' })
  match.players.set(player.id, player)
  match.teams.teamA.playerIds.push(player.id)
  match.activeNodes.set('node-copy', {
    id: 'node-copy',
    difficulty: DIFFICULTIES.EASY,
    points: 10,
    position: { x: 200, y: 300, lane: 'middle' },
    status: 'available',
    claimedBy: null,
    spawnedAt: 1,
    expiresAt: 2,
  })

  const snapshot = sanitizeMatchState(match)
  snapshot.players[0].position.x = 999
  snapshot.players[0].scrolls.push({ id: 'scroll-copy', points: 10 })
  snapshot.activeNodes[0].position.x = 777
  snapshot.teams.teamA.playerIds.push('another-player')

  assert.equal(match.players.get(player.id).position.x, 320)
  assert.deepEqual(match.players.get(player.id).scrolls, [])
  assert.equal(match.activeNodes.get('node-copy').position.x, 200)
  assert.deepEqual(match.teams.teamA.playerIds, [player.id])
})

test('exports the state enums and structured error codes used by later handlers', () => {
  assert.equal(PHASES.RUNNING_OUTER_TOWER, 'running_outer_tower')
  assert.equal(DIFFICULTIES.HARD, 'hard')
  assert.equal(ERROR_CODES.NODE_NOT_AVAILABLE, 'NODE_NOT_AVAILABLE')
  assert.equal(ERROR_CODES.MATCH_FINISHED, 'MATCH_FINISHED')
})

function joinAndReady(manager, matchId, teamSize) {
  for (const teamId of ['teamA', 'teamB']) {
    for (let index = 0; index < teamSize; index++) {
      const joined = manager.joinMatch({
        matchId,
        playerId: `${matchId}-${teamId}-${index}`,
        userId: `${matchId}-user-${teamId}-${index}`,
        displayName: `Pemain ${teamId} ${index}`,
        teamId,
      })
      assert.equal(joined.ok, true)
      const ready = manager.setReady({
        matchId,
        playerId: joined.player.id,
      })
      assert.equal(ready.ok, true)
    }
  }
}

test('rejects duplicate match ids and keeps the registry isolated', () => {
  const manager = createMobaMatchManager({ idFactory: () => 'generated-match' })
  assert.equal(manager.createMatch({ matchId: 'individual-room' }).ok, true)
  const duplicate = manager.createMatch({ matchId: 'individual-room' })
  assert.equal(duplicate.ok, false)
  assert.equal(duplicate.error.code, ERROR_CODES.MATCH_ALREADY_EXISTS)
  assert.equal(manager.listMatches().length, 1)
})

test('runs the complete 1v1 lifecycle with absolute timestamps and cleanup', async () => {
  const clock = new FakeClock(10_000)
  const events = []
  const manager = createMobaMatchManager({
    now: clock.now,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    onEvent: (event, payload) => events.push({ event, payload }),
  })
  assert.equal(manager.createMatch({
    matchId: 'moba-1v1',
    teamSize: 1,
    config: { countdownMs: 100, durationMs: 500, cleanupGraceMs: 50 },
  }).ok, true)

  joinAndReady(manager, 'moba-1v1', 1)
  let match = manager.getMatch('moba-1v1')
  assert.equal(match.phase, PHASES.COUNTDOWN)
  assert.equal(match.countdownStartedAt, 10_000)
  assert.equal(match.countdownEndsAt, 10_100)
  assert.equal(match.startedAt, null)
  assert.equal(manager.listMatches()[0].countdownEndsAt, 10_100)

  await clock.advance(100)
  match = manager.getMatch('moba-1v1')
  assert.equal(match.phase, PHASES.RUNNING_OUTER_TOWER)
  assert.equal(match.startedAt, 10_100)
  assert.equal(match.endsAt, 10_600)
  assert.equal(match.endsAt - match.startedAt, 500)

  await clock.advance(499)
  assert.equal(manager.getMatch('moba-1v1').phase, PHASES.RUNNING_OUTER_TOWER)
  await clock.advance(1)
  match = manager.getMatch('moba-1v1')
  assert.equal(match.phase, PHASES.FINISHED)
  assert.equal(match.finishedAt, 10_600)
  assert.equal(match.finishReason, 'time_expired')
  assert.equal(match.timers.finish, null)
  assert.equal(events.some(entry => entry.event === 'match_started'), true)
  assert.equal(events.some(entry => entry.event === 'match_finished'), true)

  await clock.advance(50)
  assert.equal(manager.getMatch('moba-1v1'), null)
  assert.equal(events.some(entry => entry.event === 'match_cleaned'), true)
})

test('supports full and balanced 2v2 and 3v3 lobbies', () => {
  for (const teamSize of [2, 3]) {
    const manager = createMobaMatchManager()
    const matchId = `moba-${teamSize}v${teamSize}`
    assert.equal(manager.createMatch({ matchId, teamSize }).ok, true)

    const first = manager.joinMatch({
      matchId,
      playerId: `${matchId}-a-0`,
      userId: `${matchId}-u-a-0`,
      teamId: 'teamA',
    })
    assert.equal(first.ok, true)
    const unbalanced = manager.joinMatch({
      matchId,
      playerId: `${matchId}-a-overflow`,
      userId: `${matchId}-u-a-overflow`,
      teamId: 'teamA',
    })
    assert.equal(unbalanced.ok, false)
    assert.equal(unbalanced.error.code, ERROR_CODES.TEAMS_UNBALANCED)

    assert.equal(manager.joinMatch({
      matchId,
      playerId: `${matchId}-b-0`,
      userId: `${matchId}-u-b-0`,
      teamId: 'teamB',
    }).ok, true)
    for (let index = 1; index < teamSize; index++) {
      assert.equal(manager.joinMatch({
        matchId,
        playerId: `${matchId}-a-${index}`,
        userId: `${matchId}-u-a-${index}`,
        teamId: 'teamA',
      }).ok, true)
      assert.equal(manager.joinMatch({
        matchId,
        playerId: `${matchId}-b-${index}`,
        userId: `${matchId}-u-b-${index}`,
        teamId: 'teamB',
      }).ok, true)
    }
    assert.equal(manager.getMatch(matchId).teams.teamA.playerIds.length, teamSize)
    assert.equal(manager.getMatch(matchId).teams.teamB.playerIds.length, teamSize)
  }
})

test('requires every player to be ready and never affects individual-game state', () => {
  const manager = createMobaMatchManager()
  assert.equal(manager.createMatch({ matchId: 'moba-ready', teamSize: 1 }).ok, true)
  const first = manager.joinMatch({
    matchId: 'moba-ready',
    playerId: 'student-a',
    userId: 'user-a',
    teamId: 'teamA',
  })
  const second = manager.joinMatch({
    matchId: 'moba-ready',
    playerId: 'student-b',
    userId: 'user-b',
    teamId: 'teamB',
  })
  assert.equal(manager.startMatch('moba-ready').error.code, ERROR_CODES.PLAYER_NOT_READY)
  assert.equal(manager.setReady({ matchId: 'moba-ready', playerId: first.player.id }).ok, true)
  assert.equal(manager.getMatch('moba-ready').phase, PHASES.LOBBY)
  assert.equal(manager.setReady({ matchId: 'moba-ready', playerId: second.player.id }).ok, true)
  assert.equal(manager.getMatch('moba-ready').phase, PHASES.COUNTDOWN)

  assert.equal(manager.getMatch('individual-game-room'), null)
  assert.equal(manager.listMatches().some(snapshot => snapshot.id === 'individual-game-room'), false)
  manager.clearAll()
})

function startRunningMatch(manager, matchId, clock, config = {}, loadout = {}) {
  assert.equal(manager.createMatch({
    matchId,
    teamSize: 1,
    config: { countdownMs: 10, durationMs: 10_000, ...config },
  }).ok, true)
  for (const teamId of ['teamA', 'teamB']) {
    const joined = manager.joinMatch({
      matchId,
      playerId: `${matchId}-${teamId}`,
      userId: `${matchId}-user-${teamId}`,
      teamId,
      position: { x: 500, y: 300, lane: 'middle' },
      petType: teamId === 'teamA' ? loadout.petType : undefined,
      petSkinId: teamId === 'teamA' ? loadout.petSkinId : undefined,
    })
    assert.equal(joined.ok, true)
    assert.equal(manager.setReady({
      matchId,
      playerId: joined.player.id,
    }).ok, true)
  }
  return clock.advance(10)
}

test('spawns bounded nodes and emits a safe node_spawned event', async () => {
  const clock = new FakeClock(1_000)
  const events = []
  const manager = createMobaMatchManager({
    now: clock.now,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    idFactory: prefix => `${prefix}-safe`,
    random: () => 0.5,
    onEvent: (event, payload) => events.push({ event, payload }),
  })

  await startRunningMatch(manager, 'moba-spawn', clock, {
    nodeTtlMs: 100,
    maxActiveNodes: 1,
  })
  const spawned = manager.spawnNode('moba-spawn', {
    difficulty: DIFFICULTIES.MEDIUM,
    position: { x: 500, y: 200, lane: 'top' },
  })
  assert.equal(spawned.ok, true)
  assert.equal(spawned.node.expiresAt, 1_110)
  assert.equal(manager.getMatch('moba-spawn').activeNodes.size, 1)
  assert.equal(events.at(-1).event, 'node_spawned')
  assert.equal(events.at(-1).payload.node.answer, undefined)
  assert.equal(events.at(-1).payload.node.correctAnswer, undefined)

  const maxed = manager.spawnNode('moba-spawn', {
    position: { x: 500, y: 400, lane: 'bottom' },
  })
  assert.equal(maxed.ok, false)
  assert.equal(maxed.error.code, ERROR_CODES.NODE_NOT_AVAILABLE)
  await clock.advance(99)
  assert.equal(manager.getMatch('moba-spawn').activeNodes.size, 1)
  await clock.advance(1)
  assert.equal(manager.getMatch('moba-spawn').activeNodes.size, 0)
  assert.equal(events.some(event => event.event === 'node_expired'), true)
  manager.clearAll()
})

test('claims a node atomically and rejects a second claim', async () => {
  const clock = new FakeClock(2_000)
  const events = []
  const manager = createMobaMatchManager({
    now: clock.now,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    idFactory: prefix => `${prefix}-claim`,
    onEvent: (event, payload) => events.push({ event, payload }),
  })
  await startRunningMatch(manager, 'moba-claim', clock)
  const spawned = manager.spawnNode('moba-claim', {
    difficulty: DIFFICULTIES.HARD,
    position: { x: 570, y: 300, lane: 'middle' },
  })
  assert.equal(spawned.ok, true)

  const first = manager.claimNode({
    matchId: 'moba-claim',
    playerId: 'moba-claim-teamA',
    nodeId: spawned.nodeId,
    actionId: 'action-first',
  })
  const second = manager.claimNode({
    matchId: 'moba-claim',
    playerId: 'moba-claim-teamB',
    nodeId: spawned.nodeId,
    actionId: 'action-second',
  })
  assert.equal(first.ok, true)
  assert.equal(second.ok, false)
  assert.equal(second.error.code, ERROR_CODES.NODE_NOT_AVAILABLE)
  assert.equal(manager.getMatch('moba-claim').activeNodes.get(spawned.nodeId).claimedBy,
    'moba-claim-teamA')
  assert.equal(manager.getMatch('moba-claim').players.get('moba-claim-teamA').claimedNodeId,
    spawned.nodeId)
  assert.equal(events.filter(event => event.event === 'node_claimed').length, 1)
  assert.equal(JSON.stringify(first).includes('correctAnswer'), false)
  manager.clearAll()
})

test('rejects claims that are too far away, disconnected, stunned, or expired', async () => {
  const clock = new FakeClock(3_000)
  const manager = createMobaMatchManager({
    now: clock.now,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    idFactory: prefix => `${prefix}-validation`,
  })
  await startRunningMatch(manager, 'moba-validation', clock, {
    durationMs: 100_000,
    nodeTtlMs: 100,
  })
  const match = manager.getMatch('moba-validation')
  const spawned = manager.spawnNode('moba-validation', {
    position: { x: 700, y: 300, lane: 'middle' },
  })

  let rejected = manager.claimNode({
    matchId: 'moba-validation',
    playerId: 'moba-validation-teamA',
    nodeId: spawned.nodeId,
  })
  assert.equal(rejected.error.code, ERROR_CODES.PLAYER_TOO_FAR)

  match.players.get('moba-validation-teamA').position = { x: 700, y: 300, lane: 'middle' }
  match.players.get('moba-validation-teamA').connected = false
  rejected = manager.claimNode({
    matchId: 'moba-validation',
    playerId: 'moba-validation-teamA',
    nodeId: spawned.nodeId,
  })
  assert.equal(rejected.error.code, ERROR_CODES.PLAYER_DISCONNECTED)

  match.players.get('moba-validation-teamA').connected = true
  match.players.get('moba-validation-teamA').stunUntil = clock.now() + 100
  rejected = manager.claimNode({
    matchId: 'moba-validation',
    playerId: 'moba-validation-teamA',
    nodeId: spawned.nodeId,
  })
  assert.equal(rejected.error.code, ERROR_CODES.PLAYER_STUNNED)

  match.players.get('moba-validation-teamA').stunUntil = 0
  await clock.advance(match.config.nodeTtlMs)
  rejected = manager.claimNode({
    matchId: 'moba-validation',
    playerId: 'moba-validation-teamA',
    nodeId: spawned.nodeId,
  })
  assert.equal(rejected.error.code, ERROR_CODES.NODE_NOT_AVAILABLE)
  manager.clearAll()
})

test('automatically spawns nodes on the running interval and stops after finish', async () => {
  const clock = new FakeClock(4_000)
  const events = []
  const randomValues = [
    0.1, 0.5, 0.25,
    0.1, 0.65, 0.75,
    0.1, 0.35, 0.75,
  ]
  let randomIndex = 0
  const manager = createMobaMatchManager({
    now: clock.now,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    random: () => randomValues[randomIndex++ % randomValues.length],
    onEvent: (event, payload) => events.push({ event, payload }),
  })
  await startRunningMatch(manager, 'moba-interval', clock, {
    nodeSpawnIntervalMs: 100,
    nodeTtlMs: 10_000,
    maxActiveNodes: 3,
  })
  await clock.advance(100)
  assert.equal(events.filter(event => event.event === 'node_spawned').length, 1)
  await clock.advance(100)
  assert.equal(events.filter(event => event.event === 'node_spawned').length, 2)
  assert.equal(manager.finishMatch('moba-interval').ok, true)
  const eventCountAtFinish = events.filter(event => event.event === 'node_spawned').length
  await clock.advance(500)
  assert.equal(events.filter(event => event.event === 'node_spawned').length, eventCountAtFinish)
  manager.clearAll()
})

function createQuestionManager(clock, questionGenerator) {
  let idSequence = 0
  return createMobaMatchManager({
    now: clock.now,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    idFactory: prefix => `${prefix}-question-${++idSequence}`,
    questionGenerator,
  })
}

async function prepareQuestionMatch(manager, clock, {
  matchId = 'moba-question',
  petType,
  petSkinId,
  config = {},
} = {}) {
  await startRunningMatch(manager, matchId, clock, {
    durationMs: 100_000,
    nodeTtlMs: 20_000,
    questionTimeMs: 100,
    ...config,
  }, { petType, petSkinId })
  const player = manager.getMatch(matchId).players.get(`${matchId}-teamA`)
  return manager
}

test('opens a private question and a correct answer creates exactly one scroll', async () => {
  const clock = new FakeClock(5_000)
  const manager = createQuestionManager(clock, ({ difficulty }) => ({
    id: 'generated-question',
    prompt: 'Berapakah 6 × 7?',
    options: ['40', '42', '48'],
    answer: '42',
    difficulty,
  }))
  manager.clearAll = manager.clearAll.bind(manager)
  // Events are asserted through the returned answer and public question below;
  // this keeps the test independent from any transport adapter.
  await prepareQuestionMatch(manager, clock, { matchId: 'moba-correct' })
  const spawned = manager.spawnNode('moba-correct', {
    difficulty: DIFFICULTIES.MEDIUM,
    position: { x: 570, y: 300, lane: 'middle' },
  })
  const claimed = manager.claimNode({
    matchId: 'moba-correct',
    playerId: 'moba-correct-teamA',
    nodeId: spawned.nodeId,
    actionId: 'claim-question',
  })
  assert.equal(claimed.ok, true)
  assert.equal(claimed.question.prompt, 'Berapakah 6 × 7?')
  assert.deepEqual(claimed.question.options, ['40', '42', '48'])
  assert.equal(claimed.question.answer, undefined)
  assert.equal(claimed.question.correctAnswer, undefined)
  assert.equal(claimed.questionSessionId, 'question-session-question-2')

  const answered = manager.answerQuestion({
    matchId: 'moba-correct',
    playerId: 'moba-correct-teamA',
    actionId: 'answer-correct',
    questionSessionId: claimed.questionSessionId,
    answer: '42',
  })
  assert.equal(answered.ok, true)
  assert.equal(answered.correct, true)
  assert.equal(answered.scroll.points, 25)
  const player = manager.getMatch('moba-correct').players.get('moba-correct-teamA')
  assert.equal(player.scrolls.length, 1)
  assert.equal(player.answeredCorrect, 1)
  assert.equal(player.questionSession, null)
  assert.equal(manager.getMatch('moba-correct').questions.size, 0)
  assert.equal(manager.getMatch('moba-correct').activeNodes.size, 0)

  const duplicate = manager.answerQuestion({
    matchId: 'moba-correct',
    playerId: 'moba-correct-teamA',
    actionId: 'answer-correct',
    questionSessionId: claimed.questionSessionId,
    answer: '42',
  })
  assert.equal(duplicate.ok, true)
  assert.equal(duplicate.duplicate, true)
  assert.equal(player.scrolls.length, 1)
  manager.clearAll()
})

test('wrong answer closes the session, gives stun, and blocks unauthorized player', async () => {
  const clock = new FakeClock(6_000)
  const manager = createQuestionManager(clock, () => ({
    prompt: '2 + 2 = ...',
    options: ['3', '4'],
    answer: '4',
  }))
  await prepareQuestionMatch(manager, clock, { matchId: 'moba-wrong' })
  const spawned = manager.spawnNode('moba-wrong', {
    position: { x: 570, y: 300, lane: 'middle' },
  })
  const claimed = manager.claimNode({
    matchId: 'moba-wrong',
    playerId: 'moba-wrong-teamA',
    nodeId: spawned.nodeId,
    actionId: 'claim-wrong',
  })
  assert.equal(claimed.ok, true)

  const unauthorized = manager.answerQuestion({
    matchId: 'moba-wrong',
    playerId: 'moba-wrong-teamB',
    actionId: 'answer-unauthorized',
    questionSessionId: claimed.questionSessionId,
    answer: '4',
  })
  assert.equal(unauthorized.ok, false)
  assert.equal(unauthorized.error.code, ERROR_CODES.QUESTION_NOT_ACTIVE)

  const answered = manager.answerQuestion({
    matchId: 'moba-wrong',
    playerId: 'moba-wrong-teamA',
    actionId: 'answer-wrong',
    questionSessionId: claimed.questionSessionId,
    answer: '3',
  })
  assert.equal(answered.ok, true)
  assert.equal(answered.correct, false)
  assert.equal(answered.immune, false)
  const player = manager.getMatch('moba-wrong').players.get('moba-wrong-teamA')
  assert.equal(player.scrolls.length, 0)
  assert.equal(player.answeredWrong, 1)
  assert.equal(player.stunUntil, 6_010 + 3_000)
  assert.equal(player.questionSession, null)
  manager.clearAll()
})

test('question timeout closes the session and cannot be submitted again', async () => {
  const clock = new FakeClock(7_000)
  const manager = createQuestionManager(clock, () => ({
    prompt: '5 × 5 = ...',
    options: ['20', '25'],
    answer: '25',
  }))
  await prepareQuestionMatch(manager, clock, {
    matchId: 'moba-timeout',
    config: { questionTimeMs: 100 },
  })
  const spawned = manager.spawnNode('moba-timeout', {
    position: { x: 570, y: 300, lane: 'middle' },
  })
  const claimed = manager.claimNode({
    matchId: 'moba-timeout',
    playerId: 'moba-timeout-teamA',
    nodeId: spawned.nodeId,
    actionId: 'claim-timeout',
  })
  assert.equal(claimed.ok, true)
  await clock.advance(99)
  assert.ok(manager.getMatch('moba-timeout').players.get('moba-timeout-teamA').questionSession)
  await clock.advance(1)
  const player = manager.getMatch('moba-timeout').players.get('moba-timeout-teamA')
  assert.equal(player.questionSession, null)
  assert.equal(player.answeredWrong, 1)
  assert.equal(player.stunUntil, 10_110)

  const lateAnswer = manager.answerQuestion({
    matchId: 'moba-timeout',
    playerId: 'moba-timeout-teamA',
    actionId: 'answer-late',
    questionSessionId: claimed.questionSessionId,
    answer: '25',
  })
  assert.equal(lateAnswer.ok, false)
  assert.equal(lateAnswer.error.code, ERROR_CODES.QUESTION_EXPIRED)
  manager.clearAll()
})

test('rejects double submit with a different action and enforces scroll capacity', async () => {
  const clock = new FakeClock(8_000)
  const manager = createQuestionManager(clock, () => ({
    prompt: '1 + 1 = ...',
    options: ['2', '3'],
    answer: '2',
  }))
  await prepareQuestionMatch(manager, clock, {
    matchId: 'moba-capacity',
    config: { questionTimeMs: 100 },
  })
  const firstNode = manager.spawnNode('moba-capacity', {
    position: { x: 570, y: 300, lane: 'middle' },
  })
  const firstClaim = manager.claimNode({
    matchId: 'moba-capacity',
    playerId: 'moba-capacity-teamA',
    nodeId: firstNode.nodeId,
  })
  const firstAnswer = manager.answerQuestion({
    matchId: 'moba-capacity',
    playerId: 'moba-capacity-teamA',
    actionId: 'answer-capacity-first',
    questionSessionId: firstClaim.questionSessionId,
    answer: '2',
  })
  assert.equal(firstAnswer.ok, true)

  const secondNode = manager.spawnNode('moba-capacity', {
    position: { x: 570, y: 300, lane: 'middle' },
  })
  const secondClaim = manager.claimNode({
    matchId: 'moba-capacity',
    playerId: 'moba-capacity-teamA',
    nodeId: secondNode.nodeId,
  })
  assert.equal(secondClaim.ok, false)
  assert.equal(secondClaim.error.code, ERROR_CODES.SCROLL_CAPACITY_REACHED)
  manager.clearAll()
})

test('answer and deposit retries are idempotent and never duplicate rewards', async () => {
  const clock = new FakeClock(8_500)
  const manager = createQuestionManager(clock, () => ({
    prompt: '3 + 3 = ...',
    options: ['6', '7'],
    answer: '6',
  }))
  await prepareQuestionMatch(manager, clock, {
    matchId: 'moba-idempotent',
    config: { questionTimeMs: 100 },
  })
  const match = manager.getMatch('moba-idempotent')
  const player = match.players.get('moba-idempotent-teamA')
  const node = manager.spawnNode('moba-idempotent', {
    position: { x: 570, y: 300, lane: 'middle' },
  })
  const claim = manager.claimNode({
    matchId: 'moba-idempotent',
    playerId: player.id,
    nodeId: node.nodeId,
    actionId: 'claim-idempotent',
  })
  const answerPayload = {
    matchId: 'moba-idempotent',
    playerId: player.id,
    questionSessionId: claim.questionSessionId,
    answer: '6',
  }
  const answer = manager.answerQuestion({
    ...answerPayload,
    actionId: 'answer-idempotent',
  })
  const answerRetry = manager.answerQuestion({
    ...answerPayload,
    actionId: 'answer-idempotent',
  })
  assert.equal(answer.ok, true)
  assert.equal(answerRetry.duplicate, true)
  assert.equal(player.scrolls.length, 1)

  player.position = { x: 19680, y: 10000, lane: 'middle' }
  const depositPayload = {
    matchId: 'moba-idempotent',
    playerId: player.id,
    targetId: 'teamB',
    scrollId: player.scrolls[0].id,
  }
  const deposit = manager.depositScroll({
    ...depositPayload,
    actionId: 'deposit-idempotent',
  })
  const depositRetry = manager.depositScroll({
    ...depositPayload,
    actionId: 'deposit-idempotent',
  })
  assert.equal(deposit.ok, true)
  assert.equal(depositRetry.duplicate, true)
  assert.equal(match.teams.teamA.score, deposit.awardedPoints)
  assert.equal(player.deposits, 1)
  assert.equal(match.depositHistory.length, 1)
  assert.deepEqual(match.depositHistory[0], {
    id: match.depositHistory[0].id,
    playerId: player.id,
    displayName: player.displayName,
    teamId: 'teamA',
    awardedPoints: deposit.awardedPoints,
    depositedAt: clock.now(),
    zoneId: deposit.zoneId,
  })
  const snapshot = manager.listMatches()[0]
  assert.deepEqual(snapshot.depositHistory, match.depositHistory)
  assert.equal(JSON.stringify(snapshot).includes('correctAnswer'), false)
  manager.clearAll()
})

test('completing a box removes its target and unlocks 1.5x library deposits', async () => {
  const clock = new FakeClock(9_500)
  const manager = createQuestionManager(clock, () => ({
    prompt: '1 + 1 = ...',
    options: ['2', '3'],
    answer: '2',
  }))
  await prepareQuestionMatch(manager, clock, {
    matchId: 'moba-box-library',
    petType: PET_TYPES.KELINSAY,
    config: {
      boxCapacity: 100,
      libraryDepositMultiplier: 1.5,
    },
  })
  const match = manager.getMatch('moba-box-library')
  const player = match.players.get('moba-box-library-teamA')
  const boxPosition = { x: 4_000, y: 12_000, lane: 'top' }
  player.position = boxPosition

  player.scrolls.push({ id: 'scroll-60', points: 60, difficulty: DIFFICULTIES.HARD })
  const first = manager.depositScroll({
    matchId: match.id,
    playerId: player.id,
    actionId: 'deposit-box-60',
    scrollId: 'scroll-60',
  })
  assert.equal(first.ok, true)
  assert.equal(first.zoneId, 'az-1')
  assert.equal(first.boxFill, 60)
  assert.equal(first.boxCompleted, false)
  assert.equal(first.isLibrary, false)
  assert.equal(first.depositMultiplier, 1)

  player.scrolls.push({ id: 'scroll-40', points: 40, difficulty: DIFFICULTIES.MEDIUM })
  const second = manager.depositScroll({
    matchId: match.id,
    playerId: player.id,
    actionId: 'deposit-box-40',
    scrollId: 'scroll-40',
  })
  assert.equal(second.ok, true)
  assert.equal(second.zoneId, 'az-1')
  assert.equal(second.boxFill, 100)
  assert.equal(second.boxCompleted, true)
  assert.equal(second.boxBonusPoints, 50)
  assert.equal(match.teams.teamA.base.points, 50)
  assert.equal(match.depositBoxes.get('az-1').completed, true)

  const publicBox = second.snapshot.depositBoxes.find(box => box.id === 'az-1')
  assert.deepEqual(publicBox, {
    id: 'az-1',
    fill: 100,
    completedBoxes: 1,
    completed: true,
  })

  player.position = { x: 4_000, y: 76_000, lane: 'base' }
  player.scrolls.push({ id: 'scroll-library', points: 20, difficulty: DIFFICULTIES.EASY })
  const library = manager.depositScroll({
    matchId: match.id,
    playerId: player.id,
    actionId: 'deposit-library',
    scrollId: 'scroll-library',
  })
  assert.equal(library.ok, true)
  assert.equal(library.zoneId, 'al-base')
  assert.equal(library.isLibrary, true)
  assert.equal(library.depositMultiplier, 1.5)
  assert.equal(library.awardedPoints, 30)
  assert.equal(library.boxBonusPoints, 0)
  assert.equal(match.teams.teamA.score, 130)
  assert.equal(match.teams.teamA.base.points, 80)
  assert.equal(match.depositBoxes.get('az-1').fill, 100)
  manager.clearAll()
})

test('Monyang gets two scroll capacity and Nananaga immunity applies only to hard questions', async () => {
  const clock = new FakeClock(9_000)
  const manager = createQuestionManager(clock, () => ({
    prompt: 'Soal sulit',
    options: ['1', '2'],
    answer: '2',
  }))
  await prepareQuestionMatch(manager, clock, {
    matchId: 'moba-pets',
    petType: 'nananaga',
    petSkinId: 'pet_nananaga_es',
    config: { questionTimeMs: 100 },
  })
  const player = manager.getMatch('moba-pets').players.get('moba-pets-teamA')
  assert.equal(player.immunityRemaining, 3)
  const hardNode = manager.spawnNode('moba-pets', {
    difficulty: DIFFICULTIES.HARD,
    position: { x: 570, y: 300, lane: 'middle' },
  })
  const claim = manager.claimNode({
    matchId: 'moba-pets',
    playerId: 'moba-pets-teamA',
    nodeId: hardNode.nodeId,
  })
  const wrong = manager.answerQuestion({
    matchId: 'moba-pets',
    playerId: 'moba-pets-teamA',
    actionId: 'answer-shield',
    questionSessionId: claim.questionSessionId,
    answer: '1',
  })
  assert.equal(wrong.ok, true)
  assert.equal(wrong.immune, true)
  assert.equal(wrong.scroll, null)
  assert.equal(player.stunUntil, 0)
  assert.equal(player.immunityRemaining, 2)

  const monyangClock = new FakeClock(10_000)
  const monyangManager = createQuestionManager(monyangClock, () => ({
    prompt: 'Soal',
    options: ['1', '2'],
    answer: '2',
  }))
  await prepareQuestionMatch(monyangManager, monyangClock, {
    matchId: 'moba-monyang',
    petType: 'monyang',
    petSkinId: 'pet_monyong',
    config: { questionTimeMs: 100 },
  })
  const monyangPlayer = monyangManager.getMatch('moba-monyang')
    .players.get('moba-monyang-teamA')
  assert.equal(monyangPlayer.maxScrolls, 2)
  for (const suffix of ['one', 'two']) {
    const node = monyangManager.spawnNode('moba-monyang', {
      difficulty: DIFFICULTIES.EASY,
      position: suffix === 'one'
        ? { x: 570, y: 300, lane: 'middle' }
        : { x: 570, y: 300, lane: 'middle' },
    })
    const claim = monyangManager.claimNode({
      matchId: 'moba-monyang',
      playerId: 'moba-monyang-teamA',
      nodeId: node.nodeId,
      actionId: `claim-monyang-${suffix}`,
    })
    assert.equal(claim.ok, true)
    const answer = monyangManager.answerQuestion({
      matchId: 'moba-monyang',
      playerId: 'moba-monyang-teamA',
      actionId: `answer-monyang-${suffix}`,
      questionSessionId: claim.questionSessionId,
      answer: '2',
    })
    assert.equal(answer.ok, true)
  }
  assert.equal(monyangPlayer.scrolls.length, 2)
  const thirdNode = monyangManager.spawnNode('moba-monyang', {
    position: { x: 570, y: 200, lane: 'top' },
  })
  const thirdClaim = monyangManager.claimNode({
    matchId: 'moba-monyang',
    playerId: 'moba-monyang-teamA',
    nodeId: thirdNode.nodeId,
    actionId: 'claim-monyang-three',
  })
  assert.equal(thirdClaim.ok, false)
  assert.equal(thirdClaim.error.code, ERROR_CODES.SCROLL_CAPACITY_REACHED)
  monyangManager.clearAll()
  manager.clearAll()
})

test('Pet effects keep each Hari 8 buff isolated and server-derived', () => {
  const config = {
    movementSpeed: 100,
    kelinsayEmptyScrollSpeedMultiplier: 1.15,
    baseScrollCapacity: 1,
    monyangScrollCapacity: 2,
    tomiDepositMultiplier: 1.2,
  }

  const kelinsay = {
    petType: PET_TYPES.KELINSAY,
    petSkinId: 'pet_kelinsay',
    scrolls: [],
  }
  assert.ok(Math.abs(getMovementSpeed({ player: kelinsay, config }) - 115) < 0.000001)
  kelinsay.scrolls.push({ id: 'scroll-1', points: 10 })
  assert.equal(getMovementSpeed({ player: kelinsay, config }), 100)

  const tomi = {
    petType: PET_TYPES.TOMI,
    petSkinId: 'golden',
    scrolls: [],
  }
  assert.equal(getDepositMultiplier({ player: tomi, config }), 1.2)
  assert.equal(getDepositMultiplier({
    player: { ...tomi, petType: PET_TYPES.KELINSAY },
    config,
  }), 1)

  const monyang = {
    petType: PET_TYPES.MONYANG,
    petSkinId: 'pet_monyong',
    scrolls: [],
  }
  assert.equal(getScrollCapacity({ player: monyang, config }), 2)
  assert.equal(getScrollCapacity({
    player: { ...monyang, petType: PET_TYPES.TOMI },
    config,
  }), 1)

  const nananaga = {
    petType: PET_TYPES.NANANAGA,
    petSkinId: 'pet_nananaga_es',
    immunityRemaining: 3,
  }
  assert.equal(getInitialImmunity({ player: nananaga }), 3)
  assert.equal(canUseWrongAnswerImmunity({
    player: nananaga,
    difficulty: DIFFICULTIES.HARD,
  }), true)
  assert.equal(canUseWrongAnswerImmunity({
    player: nananaga,
    difficulty: DIFFICULTIES.EASY,
  }), false)
  assert.equal(consumeWrongAnswerImmunity(nananaga), true)
  assert.equal(nananaga.immunityRemaining, 2)
  assert.equal(nananaga.immunityAvailable, true)

  assert.equal(getInitialImmunity({
    player: { petType: PET_TYPES.TOMI, petSkinId: 'golden' },
  }), 0)
  assert.equal(getMovementSpeed({
    player: { petType: PET_TYPES.TOMI, scrolls: [] },
    config,
  }), 100)
})

test('server-authoritative movement ignores client coordinates and enforces speed, bounds, collision, and stun', async () => {
  const clock = new FakeClock(11_000)
  const events = []
  const manager = createMobaMatchManager({
    now: clock.now,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    onEvent: (event, payload) => events.push({ event, payload }),
  })
  await startRunningMatch(manager, 'moba-movement', clock, {
    movementSpeed: 100,
    movementMinIntervalMs: 40,
  })

  const match = manager.getMatch('moba-movement')
  const player = match.players.get('moba-movement-teamA')
  const opponent = match.players.get('moba-movement-teamB')
  opponent.position = { x: 650, y: 300, lane: 'middle' }

  await clock.advance(100)
  const moved = manager.movePlayer({
    matchId: 'moba-movement',
    playerId: player.id,
    actionId: 'move-1',
    direction: { x: 1, y: 0 },
    clientPosition: { x: 900, y: 300, lane: 'middle' },
  })
  assert.equal(moved.ok, true)
  assert.equal(moved.position.x, 511)
  assert.equal(player.position.x, 511)
  assert.equal(events.at(-1).event, 'player_updated')

  const duplicate = manager.movePlayer({
    matchId: 'moba-movement',
    playerId: player.id,
    actionId: 'move-1',
    direction: { x: 1, y: 0 },
    clientPosition: { x: 900, y: 300, lane: 'middle' },
  })
  assert.equal(duplicate.ok, true)
  assert.equal(duplicate.duplicate, true)
  assert.equal(player.position.x, 511)

  const tooSoon = manager.movePlayer({
    matchId: 'moba-movement',
    playerId: player.id,
    actionId: 'move-too-soon',
    direction: { x: 1, y: 0 },
  })
  assert.equal(tooSoon.error.code, ERROR_CODES.MOVE_RATE_LIMITED)

  player.position = { x: 19995, y: 10000, lane: 'middle' }
  await clock.advance(100)
  const outOfBounds = manager.movePlayer({
    matchId: 'moba-movement',
    playerId: player.id,
    actionId: 'move-out',
    direction: { x: 1, y: 0 },
  })
  assert.equal(outOfBounds.error.code, ERROR_CODES.MOVE_OUT_OF_BOUNDS)
  assert.equal(player.position.x, 19995)

  player.position = { x: 600, y: 300, lane: 'middle' }
  await clock.advance(100)
  const collision = manager.movePlayer({
    matchId: 'moba-movement',
    playerId: player.id,
    actionId: 'move-collision',
    direction: { x: 1, y: 0 },
  })
  assert.equal(collision.error.code, ERROR_CODES.MOVE_COLLISION)

  player.stunUntil = clock.now() + 1_000
  const stunned = manager.movePlayer({
    matchId: 'moba-movement',
    playerId: player.id,
    actionId: 'move-stunned',
    direction: { x: -1, y: 0 },
  })
  assert.equal(stunned.error.code, ERROR_CODES.PLAYER_STUNNED)
  manager.clearAll()
})

test('movement does not spend lobby/countdown idle time on the first input', async () => {
  const clock = new FakeClock(20_000)
  const manager = createMobaMatchManager({
    now: clock.now,
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
  })
  await startRunningMatch(manager, 'moba-first-input', clock, {
    movementSpeed: 100,
    movementMaxDeltaMs: 120,
    durationMs: 20_000,
  })

  const match = manager.getMatch('moba-first-input')
  const player = match.players.get('moba-first-input-teamA')
  const opponent = match.players.get('moba-first-input-teamB')
  opponent.position = { x: 800, y: 300, lane: 'middle' }
  // Simulate a student waiting several seconds after the match starts before
  // pressing a direction. The first accepted move must remain a small step.
  await clock.advance(5_000)
  const moved = manager.movePlayer({
    matchId: match.id,
    playerId: player.id,
    actionId: 'first-input-after-idle',
    direction: { x: 0, y: 1 },
  })

  assert.equal(moved.ok, true)
  assert.equal(moved.position.x, 500)
  assert.equal(moved.position.y, 312)
  manager.clearAll()
})

test('deposits score the attacking team, destroy tower once, then damage the enemy base', async () => {
  const clock = new FakeClock(12_000)
  const manager = createQuestionManager(clock, () => ({
    prompt: '1 + 1 = ...',
    options: ['2', '3'],
    answer: '2',
  }))
  await prepareQuestionMatch(manager, clock, {
    matchId: 'moba-scoring',
    config: {
      towerMaxPoints: 12,
      baseMaxHp: 12,
      cleanupGraceMs: -1,
    },
  })
  const match = manager.getMatch('moba-scoring')
  const player = match.players.get('moba-scoring-teamA')

  async function earnScroll(actionSuffix) {
    player.position = { x: 500, y: 300, lane: 'middle' }
    const spawned = manager.spawnNode('moba-scoring', {
      difficulty: DIFFICULTIES.EASY,
      position: { x: 570, y: 300, lane: 'middle' },
    })
    const claim = manager.claimNode({
      matchId: 'moba-scoring',
      playerId: player.id,
      nodeId: spawned.nodeId,
      actionId: `claim-${actionSuffix}`,
    })
    assert.equal(claim.ok, true)
    const answer = manager.answerQuestion({
      matchId: 'moba-scoring',
      playerId: player.id,
      actionId: `answer-${actionSuffix}`,
      questionSessionId: claim.questionSessionId,
      answer: '2',
    })
    assert.equal(answer.ok, true)
  }

  await earnScroll('tower')
  player.position = { x: 19680, y: 10000, lane: 'middle' }
  const first = manager.depositScroll({
    matchId: 'moba-scoring',
    playerId: player.id,
    actionId: 'deposit-tower',
    targetId: 'teamB',
    scrollId: player.scrolls[0].id,
  })
  assert.equal(first.ok, true)
  assert.equal(first.awardedPoints, 12)
  assert.equal(first.towerDestroyed, true)
  assert.equal(first.phase, PHASES.RUNNING_MAIN_BASE)
  assert.equal(match.teams.teamA.score, 12)
  assert.equal(match.teams.teamB.tower.destroyed, true)
  assert.equal(match.teams.teamB.tower.points, 12)
  assert.equal(match.teams.teamB.base.hp, 12)

  const repeated = manager.depositScroll({
    matchId: 'moba-scoring',
    playerId: player.id,
    actionId: 'deposit-repeat',
    targetId: 'teamB',
    scrollId: first.scrollId,
  })
  assert.equal(repeated.error.code, ERROR_CODES.SCROLL_NOT_OWNED)

  await earnScroll('base')
  player.position = { x: 19680, y: 10000, lane: 'middle' }
  const second = manager.depositScroll({
    matchId: 'moba-scoring',
    playerId: player.id,
    actionId: 'deposit-base',
    targetId: 'teamB',
    scrollId: player.scrolls[0].id,
  })
  assert.equal(second.ok, true)
  assert.equal(second.baseDestroyed, true)
  assert.equal(second.phase, PHASES.FINISHED)
  assert.equal(second.winner, 'teamA')
  assert.equal(match.teams.teamB.base.hp, 0)
  assert.equal(match.teams.teamA.score, 24)

  const afterFinish = manager.depositScroll({
    matchId: 'moba-scoring',
    playerId: player.id,
    actionId: 'deposit-after-finish',
    targetId: 'teamB',
    scrollId: 'missing',
  })
  assert.equal(afterFinish.error.code, ERROR_CODES.MATCH_FINISHED)
  manager.clearAll()
})