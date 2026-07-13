import { pool } from './db.js'

// Single source of truth for the leveling curve. Level 1 starts at maxExp 100 and each
// level requires 1.5x the previous level's exp — mirrors the curve used client-side
// before persistence existed, but recomputed from `level` alone so it never drifts
// (we never store maxExp itself, only level + exp-within-level).
export function maxExpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Applies an exp delta to (level, exp), rolling over into level-ups. Pure function so it's
// easy to unit-reason about and reuse between the gain endpoint and any future backfill.
export function applyExp(level, exp, delta) {
  let lvl = level
  let e = exp + delta
  while (e >= maxExpForLevel(lvl)) {
    e -= maxExpForLevel(lvl)
    lvl += 1
  }
  return { level: lvl, exp: Math.max(0, e) }
}

// Checks all badge criteria for a student against current data and inserts any newly
// earned ones. Called after every event that could unlock a badge (coin/exp gain, nilai
// submission, survival streak update) — cheap enough to run on each event at this scale.
// Returns the list of badge rows newly earned (for a client-side celebration toast).
export async function checkAndAwardBadges(studentId) {
  const { rows: studentRows } = await pool.query(
    `select id, kelas, level, exp, total_coins_earned, best_survival_streak from students where id = $1`,
    [studentId]
  )
  const student = studentRows[0]
  if (!student) return []

  const { rows: alreadyRows } = await pool.query(
    `select badge_id from student_badges where student_id = $1`,
    [studentId]
  )
  const already = new Set(alreadyRows.map(r => r.badge_id))
  const toAward = []

  const has100 = async () => {
    const { rows } = await pool.query(`select 1 from nilai where student_id = $1 and score = 100 limit 1`, [studentId])
    return rows.length > 0
  }
  const nilaiCount = async () => {
    const { rows } = await pool.query(`select count(*)::int as c from nilai where student_id = $1`, [studentId])
    return rows[0].c
  }
  const hasAllTypes = async () => {
    const { rows } = await pool.query(
      `select distinct t.type from nilai n join tugas t on t.id = n.tugas_id where n.student_id = $1`,
      [studentId]
    )
    const types = new Set(rows.map(r => r.type))
    return types.has('harian') && types.has('formatif') && types.has('sumatif')
  }
  const isClassRankOne = async () => {
    if (!student.kelas) return false
    const { rows } = await pool.query(
      `select id from students where kelas = $1 order by level desc, exp desc, id asc limit 1`,
      [student.kelas]
    )
    return rows[0]?.id === studentId
  }

  const checks = [
    ['pemula_tangguh', async () => student.level >= 5],
    ['jawara_tangguh', async () => student.level >= 10],
    ['legenda_tomat', async () => student.level >= 20],
    ['pakar_survival', async () => student.best_survival_streak >= 15],
    ['raja_survival', async () => student.best_survival_streak >= 30],
    ['nilai_sempurna', has100],
    ['rajin_berlatih', async () => (await nilaiCount()) >= 10],
    ['kolektor_emas', async () => student.total_coins_earned >= 2000],
    ['juara_kelas', isClassRankOne],
    ['penjelajah_lengkap', hasAllTypes],
  ]

  for (const [badgeId, check] of checks) {
    if (already.has(badgeId)) continue
    if (await check()) toAward.push(badgeId)
  }

  if (toAward.length === 0) return []

  const { rows: inserted } = await pool.query(
    `insert into student_badges (student_id, badge_id)
     select $1, unnest($2::text[])
     on conflict do nothing
     returning badge_id`,
    [studentId, toAward]
  )
  if (inserted.length === 0) return []

  const { rows: badgeRows } = await pool.query(
    `select * from badges where id = any($1)`,
    [inserted.map(r => r.badge_id)]
  )
  return badgeRows
}
