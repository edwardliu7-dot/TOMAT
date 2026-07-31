import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'
import { computeHunger, skinToPetType, getHungerUntil } from './pet-state.js'
import { getPetBonus } from './pet-bonuses.js'

const router = express.Router()
router.use(requireAuth, requireRole('siswa'))

// ── Hardcoded food catalog (consumables — not stored in shop_items inventory) ──
export const PET_FOODS = {
  wortel_kecil:  { nama: 'Wortel Kecil',  emoji: '🥕', harga: 3,   hours: 2,  color: '#F5A623' },
  sayuran_segar: { nama: 'Sayuran Segar', emoji: '🥦', harga: 8,   hours: 6,  color: '#34D399' },
  buah_premium:  { nama: 'Buah Premium',  emoji: '🍓', harga: 20,  hours: 16, color: '#F472B6' },
  pesta_mewah:   { nama: 'Pesta Mewah',   emoji: '🫐', harga: 50,  hours: 72, color: '#A78BFA' },
}

// GET /api/siswa/pet
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `select pet_hunger_map, equipped_pet_skin from students where id = $1`,
      [req.session.user.id]
    )
    const row = rows[0]
    if (!row) return res.status(404).json({ error: 'Siswa tidak ditemukan.' })
    const skinId = row.equipped_pet_skin || 'golden'
    const hungerMap = row.pet_hunger_map || {}
    const hungerUntil = getHungerUntil(hungerMap, skinId)
    const { hunger, isDead, isStarving } = computeHunger(hungerUntil)
    res.json({
      hunger,
      isDead,
      isStarving,
      skin: skinId,
      petHungerUntil: hungerUntil,
      foods: PET_FOODS,
    })
  } catch (err) {
    console.error('pet get error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/siswa/pet/revive — adopt a new pet when the current one is dead (costs 300 coins)
const REVIVE_COST = 300
router.post('/revive', async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('begin')
    const { rows } = await client.query(
      'select coins, pet_hunger_map, equipped_pet_skin from students where id = $1 for update',
      [req.session.user.id]
    )
    const student = rows[0]
    if (!student) {
      await client.query('rollback')
      return res.status(404).json({ error: 'Siswa tidak ditemukan.' })
    }
    const skinId = student.equipped_pet_skin || 'golden'
    const hungerMap = student.pet_hunger_map || {}
    const { isDead } = computeHunger(getHungerUntil(hungerMap, skinId))
    if (!isDead) {
      await client.query('rollback')
      return res.status(400).json({ error: 'Pet masih hidup, tidak perlu adopsi baru!' })
    }
    if (student.coins < REVIVE_COST) {
      await client.query('rollback')
      return res.status(402).json({ error: `Koin tidak cukup. Butuh ${REVIVE_COST} 🪙 untuk adopsi pet baru.` })
    }
    // Give this pet type 24 hours of hunger from now (keyed by pet type, not skinId)
    const petType = skinToPetType(skinId)
    const newUntil = new Date(Date.now() + 24 * 3600 * 1000)
    await client.query(
      `update students
       set coins = coins - $2,
           pet_hunger_map = coalesce(pet_hunger_map, '{}') || jsonb_build_object($3::text, $4::text)
       where id = $1`,
      [req.session.user.id, REVIVE_COST, petType, newUntil.toISOString()]
    )
    await client.query('commit')
    const { hunger, isDead: newDead, isStarving } = computeHunger(newUntil)
    res.json({ ok: true, hunger, isDead: newDead, isStarving, newCoins: student.coins - REVIVE_COST, petHungerUntil: newUntil })
  } catch (err) {
    await client.query('rollback').catch(() => {})
    console.error('pet revive error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  } finally {
    client.release()
  }
})

// POST /api/siswa/pet/feed { foodId }
// Deducts coins atomically and extends hunger for the currently equipped pet skin
router.post('/feed', async (req, res) => {
  const { foodId } = req.body || {}
  const food = PET_FOODS[foodId]
  if (!food) return res.status(400).json({ error: 'Makanan tidak valid.' })

  const client = await pool.connect()
  try {
    await client.query('begin')
    const { rows } = await client.query(
      'select coins, pet_hunger_map, equipped_pet_skin from students where id = $1 for update',
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

    const skinId = student.equipped_pet_skin || 'golden'
    const hungerMap = student.pet_hunger_map || {}
    const { isDead } = computeHunger(getHungerUntil(hungerMap, skinId))
    if (isDead) {
      await client.query('rollback')
      return res.status(400).json({ error: 'Pet sudah mati, adopsi dulu pet baru!' })
    }

    // Extend hunger for this pet type: base = max(now, current_until) + food_hours
    // Nananaga skins apply a hungerMult so food lasts proportionally longer.
    const petType = skinToPetType(skinId)
    const petBonus = getPetBonus(skinId)
    const effectiveHours = food.hours * petBonus.hungerMult
    const now = new Date()
    const currentUntilStr = getHungerUntil(hungerMap, skinId)
    const currentUntil = currentUntilStr ? new Date(currentUntilStr) : now
    const base = currentUntil < now ? now : currentUntil
    const newUntil = new Date(base.getTime() + effectiveHours * 3600 * 1000)

    await client.query(
      `update students
       set coins = coins - $2,
           pet_hunger_map = coalesce(pet_hunger_map, '{}') || jsonb_build_object($3::text, $4::text)
       where id = $1`,
      [req.session.user.id, food.harga, petType, newUntil.toISOString()]
    )
    await client.query('commit')

    const { hunger, isDead: newDead, isStarving } = computeHunger(newUntil)
    res.json({
      ok: true, hunger, isDead: newDead, isStarving,
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
