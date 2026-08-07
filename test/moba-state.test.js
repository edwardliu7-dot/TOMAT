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
import { createMobaMatchManager } from '../server/moba/match-manager.js'

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