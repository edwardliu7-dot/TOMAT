import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'

const router = express.Router()
router.use(requireAuth, requireRole('siswa'))

// ── Hardcoded food catalog (consumables — not stored in shop_items inventory) ──
export const PET_FOODS = {
  wortel_kecil:  { nama: 'Wortel Kecil',  emoji: '🥕', harga: 30,  hours: 2,  color: '#F5A623' },
  sayuran_segar: { nama: 'Sayuran Segar', emoji: '🥦', harga: 80,  hours: 6,  color: '#34D399' },
  buah_premium:  { nama: 'Buah Premium',  emoji: '🍓', harga: 200, hours: 16, color: '#F472B6' },
  pesta_mewah:   { nama: 'Pesta Mewah',   emoji: '🫐', harga: 500, hours: 72, color: '#A78BFA' },
}

// ── Derive live hunger state from pet_hunger_until timestamp ──
// hunger_until = when hunger reaches 0%
// dead = hunger has been 0% for more than 24 hours (matches design: ">24 jam → mati")
export function computeHunger(petHungerUntil) {
  if (!petHungerUntil) {
    // Never fed — treat as freshly acquired (full hunger)
    return { hunger: 100, isDead: false, isStarving: false }
  }
  const now = Date.now()
  const until = new Date(petHungerUntil).getTime()
  const deadAt = until + 24 * 3600 * 1000
  if (now >= deadAt) return { hunger: 0, isDead: true,  isStarving: true  }
  if (now >= until)  return { hunger: 0, isDead: false, isStarving: true  }
  const hunger = Math.min(100, Math.round((until - now) / (24 * 3600 * 1000) * 100))
  return { hunger, isDead: false, isStarving: false }
}

// GET /api/siswa/pet
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `select pet_hunger_until, equipped_pet_skin from students where id = $1`,
      [req.session.user.id]
    )
    const row = rows[0]
    if (!row) return res.status(404).json({ error: 'Siswa tidak ditemukan.' })
    const { hunger, isDead, isStarving } = computeHunger(row.pet_hunger_until)
    res.json({
      hunger,
      isDead,
      isStarving,
      skin: row.equipped_pet_skin || 'golden',
      petHungerUntil: row.pet_hunger_until,
      foods: PET_FOODS,
    })
  } catch (err) {
    console.error('pet get error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/siswa/pet/feed { foodId }
// Deducts coins atomically and extends pet_hunger_until
router.post('/feed', async (req, res) => {
  const { foodId } = req.body || {}
  const food = PET_FOODS[foodId]
  if (!food) return res.status(400).json({ error: 'Makanan tidak valid.' })

  const client = await pool.connect()
  try {
    await client.query('begin')
    const { rows } = await client.query(
      'select coins, pet_hunger_until from students where id = $1 for update',
      [req.session.user.id]
    )
    const student = rows[0]
    if (!student) {
      await client.query('rollback')
      return res.status(404).json({ error: 'Siswa tidak ditemukan.' })
    }
    if (student.coins < food.harga) {
      await client.query('rollback')
      return res.status(402).json({ error: `Koin tidak cukup. Butuh ${food.harga} 🪙` })
    }

    // Extend hunger: base = max(now, current_until) + food_hours
    const now = new Date()
    const currentUntil = student.pet_hunger_until ? new Date(student.pet_hunger_until) : now
    const base = currentUntil < now ? now : currentUntil
    const newUntil = new Date(base.getTime() + food.hours * 3600 * 1000)

    await client.query(
      'update students set coins = coins - $2, pet_hunger_until = $3 where id = $1',
      [req.session.user.id, food.harga, newUntil]
    )
    await client.query('commit')

    const { hunger, isDead, isStarving } = computeHunger(newUntil)
    res.json({
      ok: true, hunger, isDead, isStarving,
      newCoins: student.coins - food.harga,
      petHungerUntil: newUntil,
    })
  } catch (err) {
    await client.query('rollback').catch(() => {})
    console.error('pet feed error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  } finally {
    client.release()
  }
})

export default router
