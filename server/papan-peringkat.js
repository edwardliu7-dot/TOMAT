import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'

const router = express.Router()
router.use(requireAuth, requireRole('siswa'))

// Shared leaderboard query builder — accepts a WHERE clause fragment and params
async function buildLeaderboard(whereClause, params, myId) {
  const { rows } = await pool.query(`
    with hafalan_lulus as (
      select student_id,
             count(*) filter (where jenis = 'perkalian') as perkalian_lulus,
             count(*) filter (where jenis = 'pembagian') as pembagian_lulus
      from (
        select student_id, jenis, angka, status,
               row_number() over (partition by student_id, jenis, angka order by dinilai_at desc) as rn
        from hafalan_setoran
      ) t
      where rn = 1 and status = 'lulus'
      group by student_id
    ),
    avg_nilai as (
      select n.student_id, avg(n.score) as avg_score
      from nilai n
      join tugas t on t.id = n.tugas_id
      group by n.student_id
    ),
    composite as (
      select
         s.id, s.name, s.level, s.exp, s.photo_url, s.equipped_bingkai, s.kelas,
        coalesce(hl.perkalian_lulus, 0)::int as perkalian_lulus,
        coalesce(hl.pembagian_lulus, 0)::int as pembagian_lulus,
        round((
          0.40 * coalesce(an.avg_score, 0) +
          0.20 * least(s.level::float / 20.0 * 100.0, 100.0) +
          0.10 * least(s.exp::float   / 5000.0 * 100.0, 100.0) +
          0.30 * ((coalesce(hl.perkalian_lulus,0) + coalesce(hl.pembagian_lulus,0))::float / 20.0 * 100.0)
        )::numeric, 1) as composite_score
      from students s
      left join avg_nilai an on an.student_id = s.id
      left join hafalan_lulus hl on hl.student_id = s.id
      where ${whereClause}
        and not s.is_test_account
    )
    select *, rank() over (order by composite_score desc, level desc, exp desc) as rank
    from composite
    order by composite_score desc, level desc, exp desc, name asc
  `, params)

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    level: r.level,
    exp: r.exp,
    kelas: r.kelas,
    equippedBingkai: r.equipped_bingkai,
    photoUrl: r.photo_url || null,
    rank: Number(r.rank),
    compositeScore: Number(r.composite_score),
    hafalanPerkalian: Number(r.perkalian_lulus),
    hafalanPembagian: Number(r.pembagian_lulus),
    isMe: r.id === myId,
  }))
}

// GET /api/siswa/papan-peringkat — composite-scored leaderboard for the caller's class.
router.get('/', async (req, res) => {
  try {
    const { rows: meRows } = await pool.query('select kelas from students where id = $1', [req.session.user.id])
    const kelas = meRows[0]?.kelas
    if (!kelas) return res.json({ kelas: null, leaderboard: [], me: null })

    const leaderboard = await buildLeaderboard('s.kelas = $1', [kelas], req.session.user.id)
    const me = leaderboard.find(r => r.isMe) || null
    res.json({ kelas, leaderboard, me })
  } catch (err) {
    console.error('papan-peringkat error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// GET /api/siswa/papan-peringkat/kelas/:gradeNum — leaderboard for a whole grade (7, 8, or 9)
// Students can view grade 8 and 9 rankings.
router.get('/kelas/:gradeNum', async (req, res) => {
  try {
    const grade = parseInt(req.params.gradeNum, 10)
    const prefixMap = { 7: 'VII', 8: 'VIII', 9: 'IX' }
    const prefix = prefixMap[grade]
    if (!prefix) return res.status(400).json({ error: 'Kelas tidak valid (7, 8, atau 9).' })

    // Use regex anchor so 'VII' never matches 'VIII...' (LIKE 'VII%' would)
    const leaderboard = await buildLeaderboard(`s.kelas ~ $1`, [`^${prefix}(\\s|$)`], req.session.user.id)
    const me = leaderboard.find(r => r.isMe) || null
    res.json({ grade, leaderboard, me })
  } catch (err) {
    console.error('papan-peringkat kelas error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
