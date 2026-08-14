/**
 * Durable MOBA result settlement.
 *
 * Realtime match state remains in-memory. This service only runs after a
 * match_finished event and uses match_id as the idempotency key, so reconnects
 * or repeated finish calls cannot grant the same reward twice.
 */

const DEFAULT_REWARD_COINS = 15

function winnerPlayerIds(snapshot, winner) {
  if (!snapshot || !['teamA', 'teamB'].includes(winner)) return []
  return (snapshot.players || [])
    .filter(player => player.teamId === winner && player.userId)
    .map(player => String(player.userId))
}

export function createMobaResultStore({
  pool,
  rewardCoins = DEFAULT_REWARD_COINS,
} = {}) {
  if (!pool || typeof pool.connect !== 'function') {
    throw new TypeError('pool with connect() is required')
  }

  const safeRewardCoins = Math.max(0, Math.floor(Number(rewardCoins) || 0))

  async function settleMatch(payload = {}) {
    const snapshot = payload.snapshot
    const matchId = snapshot?.id || payload.matchId
    if (!matchId || !snapshot) {
      throw new TypeError('match_finished payload requires matchId and snapshot')
    }

    const winner = payload.result?.winner ||
      (snapshot.teams?.teamA?.score === snapshot.teams?.teamB?.score
        ? 'draw'
        : snapshot.teams?.teamA?.score > snapshot.teams?.teamB?.score
          ? 'teamA'
          : 'teamB')
    const winners = winnerPlayerIds(snapshot, winner)
    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      const inserted = await client.query(
        `INSERT INTO moba_match_results
          (match_id, team_size, winner, team_a_score, team_b_score,
           snapshot, reward_coins)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
         ON CONFLICT (match_id) DO NOTHING
         RETURNING match_id`,
        [
          matchId,
          snapshot.teamSize,
          winner,
          snapshot.teams?.teamA?.score || 0,
          snapshot.teams?.teamB?.score || 0,
          JSON.stringify(snapshot),
          safeRewardCoins,
        ],
      )

      if (inserted.rows.length === 0) {
        await client.query('COMMIT')
        return { matchId, alreadySettled: true, rewardedPlayerIds: [] }
      }

      // Award 1 coin per point scored by the winner team (min 1, max 500).
      // Falls back to the fixed DEFAULT_REWARD_COINS for draws or zero-score wins.
      const winnerScore = ['teamA', 'teamB'].includes(winner)
        ? (snapshot.teams?.[winner]?.score ?? 0)
        : 0
      const coinsToAward = winnerScore > 0
        ? Math.max(1, Math.min(winnerScore, 500))
        : safeRewardCoins

      let rewardedPlayerIds = []
      if (coinsToAward > 0 && winners.length > 0) {
        const rewarded = await client.query(
          `UPDATE students
           SET coins = COALESCE(coins, 0) + $1,
               total_coins_earned = COALESCE(total_coins_earned, 0) + $1
           WHERE id = ANY($2::text[])
           RETURNING id`,
          [coinsToAward, winners],
        )
        rewardedPlayerIds = rewarded.rows.map(row => String(row.id))
      }

      await client.query(
        `UPDATE moba_match_results
         SET rewarded_player_ids = $2::text[],
             reward_coins = $3,
             reward_issued_at = CASE
               WHEN cardinality($2::text[]) > 0 THEN now()
               ELSE NULL
             END
         WHERE match_id = $1`,
        [matchId, rewardedPlayerIds, coinsToAward],
      )
      await client.query('COMMIT')
      return { matchId, alreadySettled: false, rewardedPlayerIds }
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {})
      throw error
    } finally {
      client.release()
    }
  }

  return { settleMatch, rewardCoins: safeRewardCoins }
}

export async function listMobaMatchResults(pool, {
  limit = 50,
  offset = 0,
} = {}) {
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 50))
  const safeOffset = Math.max(0, Number.parseInt(offset, 10) || 0)
  const { rows } = await pool.query(
    `SELECT match_id, team_size, winner, team_a_score, team_b_score,
            finished_at, reward_coins, rewarded_player_ids, reward_issued_at
     FROM moba_match_results
     ORDER BY finished_at DESC
     LIMIT $1 OFFSET $2`,
    [safeLimit, safeOffset],
  )
  return rows
}

function normalizeHistoryLimit(limit, fallback) {
  return Math.min(50, Math.max(1, Number.parseInt(limit, 10) || fallback))
}

function normalizeHistoryOffset(offset) {
  return Math.max(0, Number.parseInt(offset, 10) || 0)
}

function publicHistoryPlayer(player, { includeUserId = false, visible = true } = {}) {
  if (!visible) {
    return {
      displayName: 'Lawan',
      score: Number(player?.score || 0),
      answeredCorrect: Number(player?.answeredCorrect || 0),
      answeredWrong: Number(player?.answeredWrong || 0),
      deposits: Number(player?.deposits || 0),
    }
  }

  return {
    ...(includeUserId && player?.userId ? { userId: String(player.userId) } : {}),
    displayName: String(player?.displayName || 'Pemain'),
    petType: player?.petType || null,
    petSkinId: player?.petSkinId || player?.petType || 'golden',
    score: Number(player?.score || 0),
    answeredCorrect: Number(player?.answeredCorrect || 0),
    answeredWrong: Number(player?.answeredWrong || 0),
    deposits: Number(player?.deposits || 0),
  }
}

async function normalizeHistoryRow(row, profileUserId, {
  includeReward = false,
  canViewOpponent = null,
} = {}) {
  const players = Array.isArray(row.snapshot?.players) ? row.snapshot.players : []
  const targetId = String(profileUserId)
  const myPlayer = players.find(player => String(player?.userId ?? '') === targetId)
  if (!myPlayer?.teamId) return null

  const myTeamId = myPlayer.teamId === 'teamB' ? 'teamB' : 'teamA'
  const opponentTeamId = myTeamId === 'teamA' ? 'teamB' : 'teamA'
  const mine = myTeamId === 'teamA' ? Number(row.team_a_score || 0) : Number(row.team_b_score || 0)
  const opponent = myTeamId === 'teamA' ? Number(row.team_b_score || 0) : Number(row.team_a_score || 0)
  const result = row.winner === 'draw'
    ? 'draw'
    : row.winner === myTeamId
      ? 'win'
      : 'loss'
  // reward_coins is stored once per match for the winning team. Never expose
  // that match-level amount as if it belonged to a losing student.
  const playerRewardCoins = includeReward && result === 'win'
    ? Number(row.reward_coins || 0)
    : 0

  const opponentPlayers = players.filter(player => player?.teamId === opponentTeamId)
  const opponents = await Promise.all(opponentPlayers.map(async player => {
    const visible = typeof canViewOpponent !== 'function'
      ? true
      : await canViewOpponent(String(player.userId))
    return publicHistoryPlayer(player, { visible })
  }))

  return {
    matchId: String(row.match_id),
    teamSize: Number(row.team_size),
    finishedAt: row.finished_at,
    result,
    myTeamId,
    winner: row.winner,
    scores: {
      mine,
      opponent,
      teamA: Number(row.team_a_score || 0),
      teamB: Number(row.team_b_score || 0),
    },
    myPlayer: publicHistoryPlayer(myPlayer, { includeUserId: true }),
    opponents,
    ...(includeReward ? { rewardCoins: playerRewardCoins } : {}),
  }
}

/**
 * Returns the durable match history for one student. Membership is checked
 * against the final snapshot rather than a mutable player/profile table.
 * Public callers can provide canViewOpponent to apply the same class-circle
 * privacy rules used by the public profile endpoint.
 */
export async function listMobaPlayerHistory(pool, {
  userId,
  limit = 20,
  offset = 0,
  includeReward = false,
  canViewOpponent = null,
} = {}) {
  if (userId === undefined || userId === null || userId === '') {
    throw new TypeError('userId is required')
  }

  const safeLimit = normalizeHistoryLimit(limit, includeReward ? 20 : 10)
  const safeOffset = normalizeHistoryOffset(offset)
  const { rows } = await pool.query(
    `SELECT match_id, team_size, winner, team_a_score, team_b_score,
            snapshot, finished_at, reward_coins
     FROM moba_match_results
     WHERE EXISTS (
       SELECT 1
       FROM jsonb_array_elements(snapshot->'players') AS player
       WHERE player->>'userId' = $1
     )
     ORDER BY finished_at DESC
     LIMIT $2 OFFSET $3`,
    [String(userId), safeLimit + 1, safeOffset],
  )

  const normalized = (await Promise.all(rows.map(row => normalizeHistoryRow(row, userId, {
    includeReward,
    canViewOpponent,
  })))).filter(Boolean)

  return {
    items: normalized.slice(0, safeLimit),
    pagination: {
      limit: safeLimit,
      offset: safeOffset,
      hasMore: normalized.length > safeLimit,
    },
  }
}

export { DEFAULT_REWARD_COINS }