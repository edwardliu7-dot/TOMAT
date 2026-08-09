# BLP Sync — Step 2: Update blpAktivitasData.js

Ganti seluruh isi `src/screens/blp/blpAktivitasData.js` dengan versi yang menggunakan ID aktivitas dari GitHub asli.

---

## Struktur Aktivitas GitHub (Canonical)

```javascript
// src/screens/blp/blpAktivitasData.js

export const PERLENGKAPAN_SEKOLAH_ITEMS = [
  { id: 'buku_paket',  label: 'Buku Paket' },
  { id: 'alat_tulis',  label: 'Alat Tulis' },
  { id: 'buku_tulis',  label: 'Buku Tulis' },
  { id: 'seragam',     label: 'Seragam' },
  { id: 'botol_minum', label: 'Botol Minum' },
]

export const BLP_CATEGORIES = [
  {
    id: 'devout',
    name: 'DEVOUT (KESADARAN DIRI)',
    label: 'Devout',
    activities: [
      { id: 'd1', name: 'Shalat 5 Waktu Berjamaah',       target: 'Setiap hari' },
      { id: 'd2', name: "Berdzikir ba'da Sholat",          target: 'Setiap hari' },
      { id: 'd3', name: 'Bersholawat Nabi Muhammad',       target: 'Setiap hari' },
      { id: 'd4', name: 'Sholat Dhuha',                    target: 'Setiap hari' },
      { id: 'd5', name: 'Membaca Al Qur\'an',              target: 'Setiap hari' },
      { id: 'd6', name: 'Sholat sunnah Rawatib',           target: 'Setiap hari' },
      { id: 'd7', name: 'Infaq Sodakoh',                   target: 'Setiap hari' },
      { id: 'd8', name: 'Mendo\'akan Orang Tua',           target: 'Setiap hari' },
    ],
  },
  {
    id: 'resilience',
    name: 'RESILIENCE (KETEGUHAN)',
    label: 'Resilience',
    activities: [
      { id: 'r1', name: 'Datang Ke Sekolah Tepat Waktu',  target: 'Setiap hari' },
      { id: 'r2', name: 'Bertanggung Jawab',               target: 'Setiap hari' },
      { id: 'r3', name: 'Sholat Tahajud',                  target: 'Setiap hari' },
      { id: 'r4', name: 'Olahraga / Berjalan 200-300 m',  target: 'Setiap hari' },
    ],
  },
  {
    id: 'resourcefulness',
    name: 'RESOURCEFULLNESS (MENCARI SUMBER PENGETAHUAN)',
    label: 'Resourcefulness',
    activities: [
      { id: 'rs1', name: 'Belajar setiap hari min. 30 menit',  target: 'Setiap hari' },
      { id: 'rs2', name: 'Hafal Ayat Al Qur\'an dan artinya',  target: 'Setiap hari' },
      { id: 'rs3', name: 'Memanfaatkan Internet (Positif)',    target: 'Setiap hari' },
      { id: 'rs4', name: 'Hafal Hadits Shohih dan artinya',    target: 'Satu Pekan' },
    ],
  },
  {
    id: 'reflectiveness',
    name: 'REFLECTIVENESS (REFLEKSI/MUHASABAH)',
    label: 'Reflectiveness',
    activities: [
      { id: 'rf1', name: 'Sholat Taubat 2 Rakaat',       target: 'Setiap hari' },
      { id: 'rf2', name: 'Istighfar min 100x',            target: 'Setiap hari' },
      { id: 'rf3', name: 'Evaluasi Diri Sebelum Tidur',  target: 'Setiap hari' },
    ],
  },
  {
    id: 'reciprocity',
    name: 'RECIPROCITY (Kemandirian)',
    label: 'Reciprocity',
    activities: [
      { id: 'rp1', name: 'Menyiapkan Perlengkapan sekolah sendiri', target: 'Setiap hari' },
      { id: 'rp2', name: 'Membantu Kesulitan Orang Lain',           target: 'Setiap hari' },
      { id: 'rp3', name: 'Bekerjasama',                             target: 'Setiap hari' },
      { id: 'rp4', name: 'Peka terhadap situasi',                   target: 'Setiap hari' },
    ],
  },
]

export const ALL_ACTIVITY_IDS = BLP_CATEGORIES.flatMap(cat => cat.activities.map(a => a.id))

// Key constants untuk aktivitas khusus (dipakai oleh dashboard + modals)
export const QURAN_ACTIVITY_ID       = 'd5'
export const BELAJAR_ACTIVITY_ID     = 'rs1'
export const EVALUASI_ACTIVITY_ID    = 'rf3'
export const PERLENGKAPAN_ACTIVITY_ID = 'rp1'
export const RECIPROCITY_ACTIVITY_IDS = ['rp2', 'rp3', 'rp4']

// Hapus fungsi lama hitungSkor / hitungSkorV2 — ganti dengan utils/blpScoring.js
// Pertahankan helper berikut untuk kompabilitas backward:
export function isSedangHaid(haidPeriods = []) {
  const today = new Date().toISOString().slice(0, 10)
  return haidPeriods.some(h => h.startDate <= today && (h.endDate === null || h.endDate >= today))
}

export function blpPeriodKey(kelas, year, month) {
  return `${kelas}__${year}-${String(month).padStart(2, '0')}`
}

export function isInBlpPeriod(dateStr, blpPeriods, kelas) {
  const d = new Date(dateStr + 'T00:00:00')
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const key = blpPeriodKey(kelas, year, month)
  const period = blpPeriods[key]
  if (!period) return true // default: semua hari aktif
  return day >= period.startDay && day <= period.endDay
}
```

## Daftar 114 Surah (untuk BlpQuranScreen)

Ganti `SURAH_LIST` lama (yang hanya berisi sebagian surah) dengan daftar lengkap 114 surah dari GitHub.  
File referensi: https://raw.githubusercontent.com/edwardliu7-dot/BLP/main/src/data/quran.ts

Struktur tiap item:
```javascript
{
  no: 1,
  nameArab: "الفاتحة",
  nameLatin: "Al-Fatihah",
  translatedName: "Pembukaan",
  ayatCount: 7,
  revelationPlace: "makkah"  // atau "madinah"
}
```

Ekspor sebagai `SURAH_LIST` dari `blpAktivitasData.js` (atau buat file terpisah `src/screens/blp/data/surahList.js`).
