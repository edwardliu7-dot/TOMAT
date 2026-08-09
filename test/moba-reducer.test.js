import assert from 'node:assert/strict'
import test from 'node:test'
import { mobaReducer } from '../src/features/moba/mobaReducer.js'
import { initialMobaState, MOBA_ACTIONS, MOBA_CONNECTION } from '../src/features/moba/mobaTypes.js'

const snapshot = {
  id: 'match-reducer',
  phase: 'running_outer_tower',
  eventSeq: 4,
  players: [{
    id: 'moba-player:student-1',
    userId: 'student-1',
    teamId: 'teamA',
    displayName: 'Siswa 1',
    connected: true,
    position: { x: 120, y: 300, lane: 'middle' },
    scrolls: [],
  }],
  activeNodes: [{
    id: 'node-1',
    status: 'available',
    difficulty: 'easy',
    points: 10,
  }],
}

test('snapshot hydrates indexed players/nodes and resolves self by user id', () => {
  const state = mobaReducer(
    { ...initialMobaState, selfId: 'student-1' },
    {
      type: MOBA_ACTIONS.SNAPSHOT,
      payload: { matchId: snapshot.id, serverNow: 1000, snapshot },
    },
  )

  assert.equal(state.connection, MOBA_CONNECTION.CONNECTED)
  assert.equal(state.matchId, 'match-reducer')
  assert.equal(state.players['moba-player:student-1'].userId, 'student-1')
  assert.equal(state.nodes['node-1'].status, 'available')
  assert.equal(state.self.id, 'moba-player:student-1')
  assert.equal(state.serverNow, 1000)
})

test('private question is accepted for internal player id but hidden from opponents', () => {
  const hydrated = mobaReducer(
    { ...initialMobaState, selfId: 'student-1' },
    { type: MOBA_ACTIONS.SNAPSHOT, payload: { snapshot } },
  )
  const own = mobaReducer(hydrated, {
    type: MOBA_ACTIONS.SERVER_EVENT,
    event: 'question_opened',
    payload: {
      playerId: 'moba-player:student-1',
      questionSessionId: 'question-session-1',
      question: { id: 'question-1', prompt: '2 + 2 = ?', options: ['3', '4'] },
    },
  })
  assert.equal(own.activeQuestion.question.id, 'question-1')

  const opponent = mobaReducer(hydrated, {
    type: MOBA_ACTIONS.SERVER_EVENT,
    event: 'question_opened',
    payload: {
      playerId: 'moba-player:student-2',
      question: { id: 'secret-question', prompt: 'private' },
    },
  })
  assert.equal(opponent.activeQuestion, null)
})

test('server snapshot wins over stale event state and question close clears modal', () => {
  const hydrated = mobaReducer(
    { ...initialMobaState, selfId: 'student-1' },
    { type: MOBA_ACTIONS.SNAPSHOT, payload: { snapshot } },
  )
  const opened = mobaReducer(hydrated, {
    type: MOBA_ACTIONS.SERVER_EVENT,
    event: 'question_opened',
    payload: {
      playerId: 'moba-player:student-1',
      question: { id: 'question-1', prompt: '2 + 2 = ?', options: ['4'] },
    },
  })
  const nextSnapshot = {
    ...snapshot,
    eventSeq: 5,
    players: [{ ...snapshot.players[0], score: 10 }],
    activeNodes: [],
  }
  const closed = mobaReducer(opened, {
    type: MOBA_ACTIONS.SERVER_EVENT,
    event: 'question_closed',
    payload: { snapshot: nextSnapshot, correct: true },
  })

  assert.equal(closed.activeQuestion, null)
  assert.equal(closed.players['moba-player:student-1'].score, 10)
  assert.equal(closed.nodes['node-1'], undefined)
  assert.equal(closed.eventFeed.at(-1).event, 'question_closed')
})

test('movement and question outcomes expose the correct Pet visual state', () => {
  const hydrated = mobaReducer(
    { ...initialMobaState, selfId: 'student-1' },
    { type: MOBA_ACTIONS.SNAPSHOT, payload: { snapshot } },
  )
  const walking = mobaReducer(hydrated, {
    type: MOBA_ACTIONS.SERVER_EVENT,
    event: 'player_updated',
    payload: {
      actionId: 'move-1',
      player: {
        ...snapshot.players[0],
        position: { x: 140, y: 300, lane: 'middle' },
      },
    },
  })
  assert.equal(walking.petStates['moba-player:student-1'].state, 'walk')

  const happy = mobaReducer(walking, {
    type: MOBA_ACTIONS.SERVER_EVENT,
    event: 'question_closed',
    payload: { playerId: 'moba-player:student-1', correct: true },
  })
  assert.equal(happy.petStates['moba-player:student-1'].state, 'happy')

  const sad = mobaReducer(happy, {
    type: MOBA_ACTIONS.SERVER_EVENT,
    event: 'question_closed',
    payload: { playerId: 'moba-player:student-1', correct: false },
  })
  assert.equal(sad.petStates['moba-player:student-1'].state, 'hungry')
})