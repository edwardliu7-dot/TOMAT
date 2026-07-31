import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'
import { applyExp, checkAndAwardBadges } from './gamify.js'
import { getPetBonus } from './pet-bonuses.js'
import { incrementMissionProgress } from './event-missions.js'

const router = express.Router()
router.use(requireAuth, requireRole('siswa'))

// Cap on the RAW (pre-bonus) coin amount sent by the client — anti-cheat ceiling.
// The server applies the pet-skin multiplier AFTER this check, so the stored value
// may legitimately exceed this number.
const MAX_GAMEPLAY_COIN_REWARD = 15

function playerFields(row) {
  return {
    coins: row.coins,
    level: row.level,
    exp: row.exp,
    maxExp: Math.floor(100 * Math.pow(1.5, row.level - 1)),
    bestSurvivalStreak: row.best_survival_streak,
    equippedBingkai: row.equipped_bingkai,
    equippedSpanduk: row.equipped_spanduk,
    equippedTema: row.equipped_tema,
    equippedStiker: row.equipped_stiker,
  }
}

// POST /api/siswa/player/gain { coins?, exp? } — persist a reward earned during gameplay
// (correct answer, task completion, etc). Uses SELECT ... FOR UPDATE so rapid-fire gains
// from the same student (one per correct answer) never lose an update to a race.
router.post('/gain', async (req, res) => {
  const client = await pool.connect()
  try {
    const coinsGain = Math.max(0, parseInt(req.body?.coins, 10) || 0)
    const expGain = Math.max(0, parseInt(req.body?.exp, 10) || 0)
    if (coinsGain === 0 && expGain === 0) {
      return res.status(400).json({ error: 'Tidak ada koin atau EXP untuk disimpan.' })
    }
    if (coinsGain > MAX_GAMEPLAY_COIN_REWARD) {
      return res.status(400).json({ error: `Hadiah koin maksimal ${MAX_GAMEPLAY_COIN_REWARD} per jawaban.` })
    }
    await client.query('begin')
    const { rows } = await client.query(
      `select coins, level, exp, total_coins_earned, best_survival_streak,
              equipped_bingkai, equipped_spanduk, equipped_tema, equipped_stiker,
              equipped_pet_skin
       from students where id = $1 for update`,
      [req.session.user.id]
    )
    const student = rows[0]
    if (!student) {
      await client.query('rollback')
      return res.status(404).json({ error: 'Siswa tidak ditemukan.' })
    }

    // Apply pet-skin bonuses (server-authoritative; cap check already done above)
    const petBonus = getPetBonus(student.equipped_pet_skin || 'golden')
    const boostedCoins = Math.round(coinsGain * petBonus.coinMult)
    const boostedExp   = Math.round(expGain   * petBonus.expMult)

    const { level, exp } = applyExp(student.level, student.exp, boostedExp)
    const { rows: updatedRows } = await client.query(
      `update students set
        coins = coins + $2,
        total_coins_earned = total_coins_earned + $2,
        level = $3,
        exp = $4
       where id = $1
       returning coins, level, exp, total_coins_earned, best_survival_streak,
                 equipped_bingkai, equipped_spanduk, equipped_tema, equipped_stiker`,
      [req.session.user.id, boostedCoins, level, exp]
    )
    await client.query('commit')
    const newBadges = await checkAndAwardBadges(req.session.user.id)
    // Fire-and-forget: count each /gain call (1 correct answer) toward misi lomba 17-an
    if (coinsGain > 0) {
      incrementMissionProgress(req.session.user.id, 'kemerdekaan_1', 1).catch(() => {})
    }
    res.json({ player: playerFields(updatedRows[0]), newBadges, gainedCoins: boostedCoins, gainedExp: boostedExp })
  } catch (err) {
    await client.query('rollback').catch(() => {})
    console.error('player/gain error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  } finally {
    client.release()
  }
})

// POST /api/siswa/player/survival { streak } — report the streak reached at the end of a
// Survival run. Only ever raises best_survival_streak, never lowers it.
router.post('/survival', async (req, res) => {
  try {
    const streak = Math.max(0, parseInt(req.body?.streak, 10) || 0)
    const { rows } = await pool.query(
      `update students set best_survival_streak = greatest(best_survival_streak, $2)
       where id = $1
       returning coins, level, exp, total_coins_earned, best_survival_streak,
                 equipped_bingkai, equipped_spanduk, equipped_tema, equipped_stiker`,
      [req.session.user.id, streak]
    )
    const student = rows[0]
    if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan.' })
    const newBadges = await checkAndAwardBadges(req.session.user.id)
    res.json({ player: playerFields(student), newBadges })
  } catch (err) {
    console.error('player/survival error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
