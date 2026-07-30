import express from 'express'
import { pool } from './db.js'
import { requireAuth, requireRole } from './auth.js'

const router = express.Router()
router.use(requireAuth, requireRole('siswa'))

const EQUIP_COLUMN = {
  bingkai:   'equipped_bingkai',
  spanduk:   'equipped_spanduk',
  tema:      'equipped_tema',
  stiker:    'equipped_stiker',
  pet_skin:  'equipped_pet_skin',
}

// GET /api/siswa/toko — catalog grouped by kategori, plus this student's coin balance,
// owned items, and currently equipped item per category.
router.get('/', async (req, res) => {
  try {
    const [itemsRes, ownedRes, studentRes] = await Promise.all([
      pool.query('select * from shop_items order by kategori, sort_order'),
      pool.query('select item_id from student_inventory where student_id = $1', [req.session.user.id]),
      pool.query(
        `select coins, equipped_bingkai, equipped_spanduk, equipped_tema, equipped_stiker, equipped_pet_skin
         from students where id = $1`,
        [req.session.user.id]
      ),
    ])
    const student = studentRes.rows[0]
    if (!student) return res.status(404).json({ error: 'Siswa tidak ditemukan.' })
    const { getActiveEvents } = await import('./seasonal-events.js')
    const activeEvents = getActiveEvents()
    res.json({
      items: itemsRes.rows,
      ownedItemIds: ownedRes.rows.map(r => r.item_id),
      coins: student.coins,
      equipped: {
        bingkai:   student.equipped_bingkai,
        spanduk:   student.equipped_spanduk,
        tema:      student.equipped_tema,
        stiker:    student.equipped_stiker,
        pet_skin:  student.equipped_pet_skin,
      },
      activeEvents: activeEvents.map(ev => ev.slug),
    })
  } catch (err) {
    console.error('toko list error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/siswa/toko/beli { itemId } — buy an item. Server re-checks price and balance
// (never trusts a client-supplied price) and deducts coins atomically.
router.post('/beli', async (req, res) => {
  const client = await pool.connect()
  try {
    const { itemId } = req.body || {}
    if (!itemId) return res.status(400).json({ error: 'Item tidak valid.' })

    await client.query('begin')
    const { rows: itemRows } = await client.query('select * from shop_items where id = $1', [itemId])
    const item = itemRows[0]
    if (!item) {
      await client.query('rollback')
      return res.status(404).json({ error: 'Item tidak ditemukan.' })
    }
    const { rows: ownedRows } = await client.query(
      'select 1 from student_inventory where student_id = $1 and item_id = $2',
      [req.session.user.id, itemId]
    )
    if (ownedRows.length > 0) {
      await client.query('rollback')
      return res.status(409).json({ error: 'Item ini sudah kamu miliki.' })
    }
    const prerequisitePetId = item.visual?.prerequisitePetId
    if (item.kategori === 'pet_skin' && prerequisitePetId) {
      const { rows: prerequisiteRows } = await client.query(
        'select 1 from student_inventory where student_id = $1 and item_id = $2',
        [req.session.user.id, prerequisitePetId]
      )
      if (prerequisiteRows.length === 0) {
        await client.query('rollback')
        return res.status(403).json({ error: 'Kamu harus memiliki pet dasarnya terlebih dahulu.' })
      }
    }
    if (item.visual?.eventSlug) {
      const { SEASONAL_EVENTS, isEventActive } = await import('./seasonal-events.js')
      const ev = SEASONAL_EVENTS.find(e => e.slug === item.visual.eventSlug)
      if (!ev || !isEventActive(ev)) {
        await client.query('rollback')
        return res.status(403).json({ error: 'Event ini sudah berakhir. Item tidak dapat dibeli.' })
      }
    }
    const { rows: studentRows } = await client.query(
      'select coins from students where id = $1 for update',
      [req.session.user.id]
    )
    const student = studentRows[0]
    if (!student || student.coins < item.harga) {
      await client.query('rollback')
      return res.status(402).json({ error: 'Koin tidak cukup untuk membeli item ini.' })
    }
    await client.query('update students set coins = coins - $2 where id = $1', [req.session.user.id, item.harga])
    await client.query(
      'insert into student_inventory (student_id, item_id) values ($1, $2)',
      [req.session.user.id, itemId]
    )
    await client.query('commit')
    res.json({ ok: true })
  } catch (err) {
    await client.query('rollback').catch(() => {})
    console.error('toko beli error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  } finally {
    client.release()
  }
})

// POST /api/siswa/toko/stiker-layout { layout: [{uid,catalogId,emoji,x,y,size},...] }
// Saves the student's free-placed sticker layout on the banner canvas.
// Server verifies every catalogId used is actually owned by this student.
router.post('/stiker-layout', async (req, res) => {
  try {
    const { layout } = req.body || {}
    if (!Array.isArray(layout)) return res.status(400).json({ error: 'Layout tidak valid.' })

    // Collect unique catalogIds in the layout
    const usedIds = [...new Set(layout.map(s => s.catalogId).filter(Boolean))]

    if (usedIds.length > 0) {
      const { rows: ownedRows } = await pool.query(
        `select item_id from student_inventory
         where student_id = $1 and item_id = any($2::text[])`,
        [req.session.user.id, usedIds]
      )
      const ownedSet = new Set(ownedRows.map(r => r.item_id))
      const notOwned = usedIds.filter(id => !ownedSet.has(id))
      if (notOwned.length > 0) {
        return res.status(403).json({ error: `Stiker belum dimiliki: ${notOwned.join(', ')}` })
      }
    }

    // Sanitise layout — only persist safe fields
    const safe = layout.map(s => ({
      uid: String(s.uid).slice(0, 36),
      catalogId: String(s.catalogId).slice(0, 64),
      emoji: String(s.emoji).slice(0, 8),
      x: Math.max(0, Math.min(100, Number(s.x) || 0)),
      y: Math.max(0, Math.min(100, Number(s.y) || 0)),
      size: Math.max(16, Math.min(72, Number(s.size) || 28)),
    }))

    await pool.query(
      'update students set stiker_layout = $2 where id = $1',
      [req.session.user.id, JSON.stringify(safe)]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('stiker-layout error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

// POST /api/siswa/toko/pakai { itemId } — equip an owned item (or unequip if itemId is null
// for that item's category, passed as { kategori } instead).
router.post('/pakai', async (req, res) => {
  try {
    const { itemId, kategori } = req.body || {}
    let targetKategori = kategori
    let targetItemId = itemId ?? null

    if (targetItemId) {
      // 'golden' is Tomi's built-in base skin — always owned, no shop_items row needed
      if (targetItemId === 'golden') {
        targetKategori = 'pet_skin'
      } else {
        const { rows: itemRows } = await pool.query('select * from shop_items where id = $1', [targetItemId])
        const item = itemRows[0]
        if (!item) return res.status(404).json({ error: 'Item tidak ditemukan.' })
        const { rows: ownedRows } = await pool.query(
          'select 1 from student_inventory where student_id = $1 and item_id = $2',
          [req.session.user.id, targetItemId]
        )
        if (ownedRows.length === 0) return res.status(403).json({ error: 'Kamu belum memiliki item ini.' })
        const prerequisitePetId = item.visual?.prerequisitePetId
        if (item.kategori === 'pet_skin' && prerequisitePetId) {
          const { rows: prerequisiteRows } = await pool.query(
            'select 1 from student_inventory where student_id = $1 and item_id = $2',
            [req.session.user.id, prerequisitePetId]
          )
          if (prerequisiteRows.length === 0) {
            return res.status(403).json({ error: 'Kamu harus memiliki pet dasarnya terlebih dahulu.' })
          }
        }
        targetKategori = item.kategori
      }
    }

    const column = EQUIP_COLUMN[targetKategori]
    if (!column) return res.status(400).json({ error: 'Kategori tidak valid.' })

    await pool.query(`update students set ${column} = $2 where id = $1`, [req.session.user.id, targetItemId])
    res.json({ ok: true })
  } catch (err) {
    console.error('toko pakai error', err)
    res.status(500).json({ error: 'Terjadi kesalahan server.' })
  }
})

export default router
