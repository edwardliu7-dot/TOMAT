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

export { DEFAULT_REWARD_COINS }