import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DEFAULT_REWARD_COINS,
  createMobaResultStore,
} from '../server/moba/results.js'
import {
  canStudentUseMoba,
  getMobaAllowlist,
  isMobaEnabled,
} from '../server/moba/access.js'

function createFakePool({ existing = false } = {}) {
  const queries = []
  let hasResult = existing
  const client = {
    async query(text, values = []) {
      queries.push({ text, values })
      if (/^INSERT INTO moba_match_results/i.test(text.trim())) {
        if (hasResult) return { rows: [] }
        hasResult = true
        return { rows: [{ match_id: values[0] }] }
      }
      if (/^UPDATE students/i.test(text.trim())) {
        return { rows: [{ id: 'student-a' }] }
      }
      return { rows: [] }
    },
    release() {},
  }
  return {
    queries,
    async connect() {
      return client
    },
  }
}

const finishedPayload = {
  matchId: 'moba-result-1',
  result: { winner: 'teamA' },
  snapshot: {
    id: 'moba-result-1',
    teamSize: 1,
    teams: {
      teamA: { score: 25 },
      teamB: { score: 10 },
    },
    players: [
      { userId: 'student-a', teamId: 'teamA' },
      { userId: 'student-b', teamId: 'teamB' },
    ],
  },
}

test('settles a finished match once and rewards only the winning team', async () => {
  const pool = createFakePool()
  const store = createMobaResultStore({ pool })

  const first = await store.settleMatch(finishedPayload)
  const second = await store.settleMatch(finishedPayload)

  assert.equal(DEFAULT_REWARD_COINS, 15)
  assert.deepEqual(first, {
    matchId: 'moba-result-1',
    alreadySettled: false,
    rewardedPlayerIds: ['student-a'],
  })
  assert.deepEqual(second, {
    matchId: 'moba-result-1',
    alreadySettled: true,
    rewardedPlayerIds: [],
  })
  const rewardQuery = pool.queries.find(query => /^UPDATE students/i.test(query.text))
  assert.equal(rewardQuery.values[0], 25)
  assert.equal(pool.queries.filter(query => /^UPDATE students/i.test(query.text)).length, 1)
})

test('does not reward a draw and exposes the rollout gates', async () => {
  const pool = createFakePool()
  const store = createMobaResultStore({ pool })
  const draw = await store.settleMatch({
    ...finishedPayload,
    matchId: 'moba-draw',
    result: { winner: 'draw' },
  })
  assert.deepEqual(draw.rewardedPlayerIds, [])
  assert.equal(pool.queries.filter(query => /^UPDATE students/i.test(query.text)).length, 0)

  assert.equal(isMobaEnabled({ MOBA_ENABLED: 'false' }), false)
  assert.deepEqual(getMobaAllowlist({
    MOBA_ALLOWED_STUDENT_IDS: ' student-a,student-b ',
  }), ['student-a', 'student-b'])
  assert.equal(canStudentUseMoba('student-a', {
    MOBA_ENABLED: 'true',
    MOBA_ALLOWED_STUDENT_IDS: 'student-a',
  }), true)
  assert.equal(canStudentUseMoba('student-c', {
    MOBA_ENABLED: 'true',
    MOBA_ALLOWED_STUDENT_IDS: 'student-a',
  }), false)
  assert.equal(canStudentUseMoba('student-a', {
    MOBA_ENABLED: 'false',
  }), false)
})