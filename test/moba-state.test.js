import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_MOBA_CONFIG,
  DIFFICULTIES,
  ERROR_CODES,
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

test('creates the default 1v1 match state with isolated team structures', () => {
  const match = createMatchState({ id: 'match-test', now: 1234 })

  assert.equal(match.id, 'match-test')
  assert.equal(match.mode, 'tomat-moba')
  assert.equal(match.teamSize, 1)
  assert.equal(match.phase, PHASES.LOBBY)
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

  assert.deepEqual(player.position, { x: 880, y: 300, lane: 'middle' })
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

  assert.equal(match.players.get(player.id).position.x, 120)
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