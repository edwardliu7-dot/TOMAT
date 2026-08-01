/**
 * blpAktivitasData.js
 * Daftar aktivitas BLP Harian yang harus diisi siswa setiap hari.
 * Aktivitas bertanda sholat=true dikecualikan otomatis saat siswa dalam periode haid.
 */

export const AKTIVITAS_LIST = [
  { id: 'subuh',    label: 'Sholat Subuh Berjamaah',   emoji: '🌅', sholat: true,  poin: 10 },
  { id: 'dhuha',    label: 'Sholat Dhuha',              emoji: '☀️', sholat: true,  poin: 10 },
  { id: 'dzuhur',   label: 'Sholat Dzuhur Berjamaah',   emoji: '🕛', sholat: true,  poin: 10 },
  { id: 'ashar',    label: 'Sholat Ashar Berjamaah',    emoji: '🕓', sholat: true,  poin: 10 },
  { id: 'maghrib',  label: 'Sholat Maghrib Berjamaah',  emoji: '🌆', sholat: true,  poin: 10 },
  { id: 'isya',     label: 'Sholat Isya Berjamaah',     emoji: '🌙', sholat: true,  poin: 10 },
  { id: 'tahajud',  label: 'Sholat Tahajud',            emoji: '🌟', sholat: true,  poin: 10 },
  { id: 'rawatib',  label: 'Sholat Sunnah Rawatib',     emoji: '🙏', sholat: true,  poin: 5  },
  { id: 'quran',    label: 'Baca Al-Quran (Min. 1 Hal)',emoji: '📖', sholat: false, poin: 10 },
  { id: 'dzikir_p', label: 'Dzikir Pagi',               emoji: '🌤️', sholat: false, poin: 5  },
  { id: 'dzikir_s', label: 'Dzikir Sore',               emoji: '🌇', sholat: false, poin: 5  },
  { id: 'hafalan',  label: 'Hafalan Al-Quran',          emoji: '🧠', sholat: false, poin: 10 },
  { id: 'infaq',    label: 'Infaq / Sedekah',           emoji: '💝', sholat: false, poin: 5  },
]

export const TOTAL_POIN_MAX = AKTIVITAS_LIST.reduce((s, a) => s + a.poin, 0)

export function hitungSkor(completedIds, sedangHaid = false) {
  let total = 0
  let max = 0
  for (const a of AKTIVITAS_LIST) {
    if (sedangHaid && a.sholat) continue
    max += a.poin
    if (completedIds.includes(a.id)) total += a.poin
  }
  return max > 0 ? Math.round((total / max) * 100) : 0
}

export function isSedangHaid(haidPeriods = []) {
  const today = new Date().toISOString().slice(0, 10)
  return haidPeriods.some(h => h.startDate <= today && (h.endDate === null || h.endDate >= today))
}

/** Kembalikan key periode BLP: "KELAS__YYYY-MM" */
export function blpPeriodKey(kelas, year, month) {
  return `${kelas}__${year}-${String(month).padStart(2, '0')}`
}

/** Apakah tanggal (YYYY-MM-DD) masuk dalam periode BLP aktif? */
export function isInBlpPeriod(dateStr, blpPeriods, kelas) {
  const d = new Date(dateStr + 'T00:00:00')
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const key = blpPeriodKey(kelas, year, month)
  const period = blpPeriods[key]
  if (!period) return false
  return day >= period.startDay && day <= period.endDay
}

export const SURAH_LIST = [
  { no: 1,  nama: 'Al-Fatihah',    ayat: 7   },
  { no: 2,  nama: 'Al-Baqarah',    ayat: 286 },
  { no: 3,  nama: 'Ali Imran',     ayat: 200 },
  { no: 4,  nama: 'An-Nisa',       ayat: 176 },
  { no: 5,  nama: 'Al-Maidah',     ayat: 120 },
  { no: 6,  nama: 'Al-An\'am',     ayat: 165 },
  { no: 7,  nama: 'Al-A\'raf',     ayat: 206 },
  { no: 8,  nama: 'Al-Anfal',      ayat: 75  },
  { no: 9,  nama: 'At-Taubah',     ayat: 129 },
  { no: 10, nama: 'Yunus',         ayat: 109 },
  { no: 11, nama: 'Hud',           ayat: 123 },
  { no: 12, nama: 'Yusuf',         ayat: 111 },
  { no: 13, nama: 'Ar-Ra\'d',      ayat: 43  },
  { no: 14, nama: 'Ibrahim',       ayat: 52  },
  { no: 15, nama: 'Al-Hijr',       ayat: 99  },
  { no: 16, nama: 'An-Nahl',       ayat: 128 },
  { no: 17, nama: 'Al-Isra',       ayat: 111 },
  { no: 18, nama: 'Al-Kahfi',      ayat: 110 },
  { no: 19, nama: 'Maryam',        ayat: 98  },
  { no: 20, nama: 'Ta Ha',         ayat: 135 },
  { no: 36, nama: 'Ya Sin',        ayat: 83  },
  { no: 55, nama: 'Ar-Rahman',     ayat: 78  },
  { no: 56, nama: 'Al-Waqi\'ah',   ayat: 96  },
  { no: 67, nama: 'Al-Mulk',       ayat: 30  },
  { no: 78, nama: 'An-Naba',       ayat: 40  },
  { no: 112, nama: 'Al-Ikhlas',    ayat: 4   },
  { no: 113, nama: 'Al-Falaq',     ayat: 5   },
  { no: 114, nama: 'An-Nas',       ayat: 6   },
]
