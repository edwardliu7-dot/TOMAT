/**
 * server/blp/quran.js
 * GET /api/blp/quran/surah/:no — proxy teks Al-Qur'an dari equran.id (cache in-memory per surah)
 */

import express from 'express'

const router = express.Router()

// Cache per-surah (teks Quran tidak pernah berubah, tidak perlu TTL)
const quranSurahCache = new Map()

// GET /api/blp/quran/surah/:no
// Ambil teks Arabic + terjemahan Indonesia untuk satu surah.
// Diproxy dari equran.id (public API, tidak butuh key).
router.get('/quran/surah/:no', async (req, res) => {
  try {
    const no = Number(req.params.no)
    if (!Number.isInteger(no) || no < 1 || no > 114) {
      return res.status(400).json({ error: 'Nomor surah tidak valid (1–114)' })
    }

    if (quranSurahCache.has(no)) {
      return res.json(quranSurahCache.get(no))
    }

    const upstream = await fetch(`https://equran.id/api/v2/surat/${no}`)
    if (!upstream.ok) {
      return res.status(502).json({ error: 'Gagal mengambil teks Al-Qur\'an dari sumber' })
    }

    const body = await upstream.json()
    const ayatList = body?.data?.ayat || []
    const result = {
      arabic: ayatList.map(a => a.teksArab || ''),
      translations: ayatList.map(a => a.teksIndonesia || ''),
    }

    quranSurahCache.set(no, result)
    res.json(result)
  } catch (err) {
    console.error('[blp/quran] error', err)
    res.status(502).json({ error: 'Gagal mengambil teks Al-Qur\'an' })
  }
})

export default router
