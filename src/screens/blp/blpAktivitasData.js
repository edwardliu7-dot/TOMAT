/**
 * blpAktivitasData.js
 * Data aktivitas BLP Harian — ID kanonik sesuai repo GitHub (d1–d8, r1–r4, rs1–rs4, rf1–rf3, rp1–rp4).
 */

// ─── Perlengkapan sekolah (untuk rp1 modal) ───────────────────────────────────
export const PERLENGKAPAN_SEKOLAH_ITEMS = [
  { id: 'buku_paket',  label: 'Buku Paket' },
  { id: 'alat_tulis',  label: 'Alat Tulis' },
  { id: 'buku_tulis',  label: 'Buku Tulis' },
  { id: 'seragam',     label: 'Seragam' },
  { id: 'botol_minum', label: 'Botol Minum' },
]

// ─── Kategori 5R dengan ID kanonik ───────────────────────────────────────────
export const BLP_CATEGORIES = [
  {
    id: 'devout',
    name: 'DEVOUT (KESADARAN DIRI)',
    label: 'Devout',
    accentColor: '#22c55e',
    activities: [
      { id: 'd1', name: 'Shalat 5 Waktu Berjamaah',      target: 'Setiap hari', sholat: true  },
      { id: 'd2', name: "Berdzikir ba'da Sholat",         target: 'Setiap hari', sholat: true  },
      { id: 'd3', name: 'Bersholawat Nabi Muhammad',      target: 'Setiap hari', sholat: false },
      { id: 'd4', name: 'Sholat Dhuha',                   target: 'Setiap hari', sholat: true  },
      { id: 'd5', name: "Membaca Al Qur'an",              target: 'Setiap hari', sholat: false },
      { id: 'd6', name: 'Sholat sunnah Rawatib',          target: 'Setiap hari', sholat: true  },
      { id: 'd7', name: 'Infaq Sodakoh',                  target: 'Setiap hari', sholat: false },
      { id: 'd8', name: "Mendo'akan Orang Tua",           target: 'Setiap hari', sholat: false },
    ],
  },
  {
    id: 'resilience',
    name: 'RESILIENCE (KETEGUHAN)',
    label: 'Resilience',
    accentColor: '#f59e0b',
    activities: [
      { id: 'r1', name: 'Datang Ke Sekolah Tepat Waktu', target: 'Setiap hari', sholat: false, note: 'Tidak berlaku di akhir pekan (bukan hari sekolah)' },
      { id: 'r2', name: 'Bertanggung Jawab',              target: 'Setiap hari', sholat: false },
      { id: 'r3', name: 'Sholat Tahajud',                 target: 'Setiap hari', sholat: true  },
      { id: 'r4', name: 'Olahraga / Berjalan 200-300 m', target: 'Setiap hari', sholat: false },
    ],
  },
  {
    id: 'resourcefulness',
    name: 'RESOURCEFULLNESS (MENCARI SUMBER PENGETAHUAN)',
    label: 'Resourcefulness',
    accentColor: '#3b82f6',
    activities: [
      { id: 'rs1', name: 'Belajar setiap hari min. 30 menit', target: 'Setiap hari', sholat: false },
      { id: 'rs2', name: "Hafal Ayat Al Qur'an dan artinya",  target: 'Setiap hari', sholat: false },
      { id: 'rs3', name: 'Memanfaatkan Internet (Positif)',   target: 'Setiap hari', sholat: false },
      { id: 'rs4', name: 'Hafal Hadits Shohih dan artinya',   target: 'Satu Pekan',  sholat: false },
    ],
  },
  {
    id: 'reflectiveness',
    name: 'REFLECTIVENESS (REFLEKSI/MUHASABAH)',
    label: 'Reflectiveness',
    accentColor: '#8b5cf6',
    activities: [
      { id: 'rf1', name: 'Sholat Taubat 2 Rakaat',      target: 'Setiap hari', sholat: true  },
      { id: 'rf2', name: 'Istighfar min 100x',           target: 'Setiap hari', sholat: false },
      { id: 'rf3', name: 'Evaluasi Diri Sebelum Tidur', target: 'Setiap hari', sholat: false },
    ],
  },
  {
    id: 'reciprocity',
    name: 'RECIPROCITY (Kemandirian)',
    label: 'Reciprocity',
    accentColor: '#f43f5e',
    activities: [
      { id: 'rp1', name: 'Menyiapkan Perlengkapan sekolah sendiri', target: 'Setiap hari', sholat: false },
      { id: 'rp2', name: 'Membantu Kesulitan Orang Lain',           target: 'Setiap hari', sholat: false },
      { id: 'rp3', name: 'Bekerjasama',                             target: 'Setiap hari', sholat: false },
      { id: 'rp4', name: 'Peka terhadap situasi',                   target: 'Setiap hari', sholat: false },
    ],
  },
]

export const ALL_ACTIVITY_IDS = BLP_CATEGORIES.flatMap(cat => cat.activities.map(a => a.id))

// ─── Key constants untuk aktivitas khusus ────────────────────────────────────
export const QURAN_ACTIVITY_ID        = 'd5'
export const BELAJAR_ACTIVITY_ID      = 'rs1'
export const EVALUASI_ACTIVITY_ID     = 'rf3'
export const PERLENGKAPAN_ACTIVITY_ID = 'rp1'
export const RECIPROCITY_ACTIVITY_IDS = ['rp2', 'rp3', 'rp4']

// ─── Helper functions ─────────────────────────────────────────────────────────

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

// ─── Backward-compat shims (dipakai layar lama sebelum di-rewrite di step 5-7) ──

/** Flat list aktivitas — dipakai BlpIsiAktivitasScreen, BlpHomeScreen, dll. lama. */
export const AKTIVITAS_LIST = BLP_CATEGORIES.flatMap(cat =>
  cat.activities.map(a => ({
    id: a.id,
    label: a.name,
    sholat: a.sholat ?? false,
    poin: 10,
  }))
)

export const TOTAL_POIN_MAX = AKTIVITAS_LIST.length * 10

/** Hitung skor 0–100 sederhana (tanpa school-day logic). */
export function hitungSkor(completedIds = [], sedangHaid = false) {
  let done = 0
  let total = 0
  for (const a of AKTIVITAS_LIST) {
    if (sedangHaid && a.sholat) continue
    total++
    if (completedIds.includes(a.id)) done++
  }
  return total > 0 ? Math.round((done / total) * 100) : 0
}

/** Alias hitungSkor — dipakai BlpSiswaDashboardScreen lama. */
export const hitungSkorV2 = hitungSkor

/** Selalu true setelah migrasi — semua record sudah pakai ID kanonik. */
export function isV2Record(_completedIds = []) {
  return true
}

// ─── Daftar 114 Surah ─────────────────────────────────────────────────────────
export const SURAH_LIST = [
  { no:  1, nameArab: 'الفاتحة',     nameLatin: 'Al-Fatihah',    translatedName: 'Pembukaan',              ayatCount:   7, revelationPlace: 'makkah'  },
  { no:  2, nameArab: 'البقرة',      nameLatin: 'Al-Baqarah',    translatedName: 'Sapi Betina',            ayatCount: 286, revelationPlace: 'madinah' },
  { no:  3, nameArab: 'آل عمران',    nameLatin: 'Ali Imran',     translatedName: 'Keluarga Imran',         ayatCount: 200, revelationPlace: 'madinah' },
  { no:  4, nameArab: 'النساء',      nameLatin: 'An-Nisa',       translatedName: 'Wanita',                 ayatCount: 176, revelationPlace: 'madinah' },
  { no:  5, nameArab: 'المائدة',     nameLatin: 'Al-Ma\'idah',   translatedName: 'Hidangan',               ayatCount: 120, revelationPlace: 'madinah' },
  { no:  6, nameArab: 'الأنعام',     nameLatin: 'Al-An\'am',     translatedName: 'Binatang Ternak',        ayatCount: 165, revelationPlace: 'makkah'  },
  { no:  7, nameArab: 'الأعراف',     nameLatin: 'Al-A\'raf',     translatedName: 'Tempat Tertinggi',       ayatCount: 206, revelationPlace: 'makkah'  },
  { no:  8, nameArab: 'الأنفال',     nameLatin: 'Al-Anfal',      translatedName: 'Rampasan Perang',        ayatCount:  75, revelationPlace: 'madinah' },
  { no:  9, nameArab: 'التوبة',      nameLatin: 'At-Taubah',     translatedName: 'Pengampunan',            ayatCount: 129, revelationPlace: 'madinah' },
  { no: 10, nameArab: 'يونس',        nameLatin: 'Yunus',         translatedName: 'Nabi Yunus',             ayatCount: 109, revelationPlace: 'makkah'  },
  { no: 11, nameArab: 'هود',         nameLatin: 'Hud',           translatedName: 'Nabi Hud',               ayatCount: 123, revelationPlace: 'makkah'  },
  { no: 12, nameArab: 'يوسف',        nameLatin: 'Yusuf',         translatedName: 'Nabi Yusuf',             ayatCount: 111, revelationPlace: 'makkah'  },
  { no: 13, nameArab: 'الرعد',       nameLatin: 'Ar-Ra\'d',      translatedName: 'Guruh',                  ayatCount:  43, revelationPlace: 'madinah' },
  { no: 14, nameArab: 'إبراهيم',     nameLatin: 'Ibrahim',       translatedName: 'Nabi Ibrahim',           ayatCount:  52, revelationPlace: 'makkah'  },
  { no: 15, nameArab: 'الحجر',       nameLatin: 'Al-Hijr',       translatedName: 'Negeri Hijr',            ayatCount:  99, revelationPlace: 'makkah'  },
  { no: 16, nameArab: 'النحل',       nameLatin: 'An-Nahl',       translatedName: 'Lebah',                  ayatCount: 128, revelationPlace: 'makkah'  },
  { no: 17, nameArab: 'الإسراء',     nameLatin: 'Al-Isra',       translatedName: 'Perjalanan Malam',       ayatCount: 111, revelationPlace: 'makkah'  },
  { no: 18, nameArab: 'الكهف',       nameLatin: 'Al-Kahf',       translatedName: 'Gua',                    ayatCount: 110, revelationPlace: 'makkah'  },
  { no: 19, nameArab: 'مريم',        nameLatin: 'Maryam',        translatedName: 'Maryam',                 ayatCount:  98, revelationPlace: 'makkah'  },
  { no: 20, nameArab: 'طه',          nameLatin: 'Ta Ha',         translatedName: 'Ta Ha',                  ayatCount: 135, revelationPlace: 'makkah'  },
  { no: 21, nameArab: 'الأنبياء',    nameLatin: 'Al-Anbiya',     translatedName: 'Para Nabi',              ayatCount: 112, revelationPlace: 'makkah'  },
  { no: 22, nameArab: 'الحج',        nameLatin: 'Al-Hajj',       translatedName: 'Haji',                   ayatCount:  78, revelationPlace: 'madinah' },
  { no: 23, nameArab: 'المؤمنون',    nameLatin: 'Al-Mu\'minun',  translatedName: 'Orang-orang Mukmin',     ayatCount: 118, revelationPlace: 'makkah'  },
  { no: 24, nameArab: 'النور',       nameLatin: 'An-Nur',        translatedName: 'Cahaya',                 ayatCount:  64, revelationPlace: 'madinah' },
  { no: 25, nameArab: 'الفرقان',     nameLatin: 'Al-Furqan',     translatedName: 'Pembeda',                ayatCount:  77, revelationPlace: 'makkah'  },
  { no: 26, nameArab: 'الشعراء',     nameLatin: 'Asy-Syu\'ara',  translatedName: 'Para Penyair',           ayatCount: 227, revelationPlace: 'makkah'  },
  { no: 27, nameArab: 'النمل',       nameLatin: 'An-Naml',       translatedName: 'Semut',                  ayatCount:  93, revelationPlace: 'makkah'  },
  { no: 28, nameArab: 'القصص',       nameLatin: 'Al-Qasas',      translatedName: 'Kisah-kisah',            ayatCount:  88, revelationPlace: 'makkah'  },
  { no: 29, nameArab: 'العنكبوت',    nameLatin: 'Al-Ankabut',    translatedName: 'Laba-laba',              ayatCount:  69, revelationPlace: 'makkah'  },
  { no: 30, nameArab: 'الروم',       nameLatin: 'Ar-Rum',        translatedName: 'Bangsa Romawi',          ayatCount:  60, revelationPlace: 'makkah'  },
  { no: 31, nameArab: 'لقمان',       nameLatin: 'Luqman',        translatedName: 'Luqman',                 ayatCount:  34, revelationPlace: 'makkah'  },
  { no: 32, nameArab: 'السجدة',      nameLatin: 'As-Sajdah',     translatedName: 'Sujud',                  ayatCount:  30, revelationPlace: 'makkah'  },
  { no: 33, nameArab: 'الأحزاب',     nameLatin: 'Al-Ahzab',      translatedName: 'Golongan yang Bersekutu',ayatCount:  73, revelationPlace: 'madinah' },
  { no: 34, nameArab: 'سبأ',         nameLatin: 'Saba',          translatedName: 'Kaum Saba',              ayatCount:  54, revelationPlace: 'makkah'  },
  { no: 35, nameArab: 'فاطر',        nameLatin: 'Fatir',         translatedName: 'Pencipta',               ayatCount:  45, revelationPlace: 'makkah'  },
  { no: 36, nameArab: 'يس',          nameLatin: 'Ya Sin',        translatedName: 'Ya Sin',                 ayatCount:  83, revelationPlace: 'makkah'  },
  { no: 37, nameArab: 'الصافات',     nameLatin: 'As-Saffat',     translatedName: 'Yang Berbaris-baris',    ayatCount: 182, revelationPlace: 'makkah'  },
  { no: 38, nameArab: 'ص',           nameLatin: 'Sad',           translatedName: 'Sad',                    ayatCount:  88, revelationPlace: 'makkah'  },
  { no: 39, nameArab: 'الزمر',       nameLatin: 'Az-Zumar',      translatedName: 'Rombongan-rombongan',    ayatCount:  75, revelationPlace: 'makkah'  },
  { no: 40, nameArab: 'غافر',        nameLatin: 'Ghafir',        translatedName: 'Yang Maha Pengampun',    ayatCount:  85, revelationPlace: 'makkah'  },
  { no: 41, nameArab: 'فصلت',        nameLatin: 'Fussilat',      translatedName: 'Yang Dijelaskan',        ayatCount:  54, revelationPlace: 'makkah'  },
  { no: 42, nameArab: 'الشورى',      nameLatin: 'Asy-Syura',     translatedName: 'Musyawarah',             ayatCount:  53, revelationPlace: 'makkah'  },
  { no: 43, nameArab: 'الزخرف',      nameLatin: 'Az-Zukhruf',    translatedName: 'Perhiasan',              ayatCount:  89, revelationPlace: 'makkah'  },
  { no: 44, nameArab: 'الدخان',      nameLatin: 'Ad-Dukhan',     translatedName: 'Kabut',                  ayatCount:  59, revelationPlace: 'makkah'  },
  { no: 45, nameArab: 'الجاثية',     nameLatin: 'Al-Jasiyah',    translatedName: 'Yang Berlutut',          ayatCount:  37, revelationPlace: 'makkah'  },
  { no: 46, nameArab: 'الأحقاف',     nameLatin: 'Al-Ahqaf',      translatedName: 'Bukit-bukit Pasir',      ayatCount:  35, revelationPlace: 'makkah'  },
  { no: 47, nameArab: 'محمد',        nameLatin: 'Muhammad',      translatedName: 'Nabi Muhammad',          ayatCount:  38, revelationPlace: 'madinah' },
  { no: 48, nameArab: 'الفتح',       nameLatin: 'Al-Fath',       translatedName: 'Kemenangan',             ayatCount:  29, revelationPlace: 'madinah' },
  { no: 49, nameArab: 'الحجرات',     nameLatin: 'Al-Hujurat',    translatedName: 'Kamar-kamar',            ayatCount:  18, revelationPlace: 'madinah' },
  { no: 50, nameArab: 'ق',           nameLatin: 'Qaf',           translatedName: 'Qaf',                    ayatCount:  45, revelationPlace: 'makkah'  },
  { no: 51, nameArab: 'الذاريات',    nameLatin: 'Az-Zariyat',    translatedName: 'Angin yang Menerbangkan',ayatCount:  60, revelationPlace: 'makkah'  },
  { no: 52, nameArab: 'الطور',       nameLatin: 'At-Tur',        translatedName: 'Bukit',                  ayatCount:  49, revelationPlace: 'makkah'  },
  { no: 53, nameArab: 'النجم',       nameLatin: 'An-Najm',       translatedName: 'Bintang',                ayatCount:  62, revelationPlace: 'makkah'  },
  { no: 54, nameArab: 'القمر',       nameLatin: 'Al-Qamar',      translatedName: 'Bulan',                  ayatCount:  55, revelationPlace: 'makkah'  },
  { no: 55, nameArab: 'الرحمن',      nameLatin: 'Ar-Rahman',     translatedName: 'Yang Maha Pemurah',      ayatCount:  78, revelationPlace: 'madinah' },
  { no: 56, nameArab: 'الواقعة',     nameLatin: 'Al-Waqi\'ah',   translatedName: 'Hari Kiamat',            ayatCount:  96, revelationPlace: 'makkah'  },
  { no: 57, nameArab: 'الحديد',      nameLatin: 'Al-Hadid',      translatedName: 'Besi',                   ayatCount:  29, revelationPlace: 'madinah' },
  { no: 58, nameArab: 'المجادلة',    nameLatin: 'Al-Mujadilah',  translatedName: 'Wanita yang Mengajukan Gugatan', ayatCount: 22, revelationPlace: 'madinah' },
  { no: 59, nameArab: 'الحشر',       nameLatin: 'Al-Hasyr',      translatedName: 'Pengusiran',             ayatCount:  24, revelationPlace: 'madinah' },
  { no: 60, nameArab: 'الممتحنة',    nameLatin: 'Al-Mumtahanah', translatedName: 'Wanita yang Diuji',      ayatCount:  13, revelationPlace: 'madinah' },
  { no: 61, nameArab: 'الصف',        nameLatin: 'As-Saf',        translatedName: 'Barisan',                ayatCount:  14, revelationPlace: 'madinah' },
  { no: 62, nameArab: 'الجمعة',      nameLatin: 'Al-Jumu\'ah',   translatedName: 'Hari Jumat',             ayatCount:  11, revelationPlace: 'madinah' },
  { no: 63, nameArab: 'المنافقون',   nameLatin: 'Al-Munafiqun',  translatedName: 'Orang-orang Munafik',    ayatCount:  11, revelationPlace: 'madinah' },
  { no: 64, nameArab: 'التغابن',     nameLatin: 'At-Tagabun',    translatedName: 'Pengungkapan Kesalahan', ayatCount:  18, revelationPlace: 'madinah' },
  { no: 65, nameArab: 'الطلاق',      nameLatin: 'At-Talaq',      translatedName: 'Talak',                  ayatCount:  12, revelationPlace: 'madinah' },
  { no: 66, nameArab: 'التحريم',     nameLatin: 'At-Tahrim',     translatedName: 'Pengharaman',            ayatCount:  12, revelationPlace: 'madinah' },
  { no: 67, nameArab: 'الملك',       nameLatin: 'Al-Mulk',       translatedName: 'Kerajaan',               ayatCount:  30, revelationPlace: 'makkah'  },
  { no: 68, nameArab: 'القلم',       nameLatin: 'Al-Qalam',      translatedName: 'Pena',                   ayatCount:  52, revelationPlace: 'makkah'  },
  { no: 69, nameArab: 'الحاقة',      nameLatin: 'Al-Haqqah',     translatedName: 'Hari Kiamat',            ayatCount:  52, revelationPlace: 'makkah'  },
  { no: 70, nameArab: 'المعارج',     nameLatin: 'Al-Ma\'arij',   translatedName: 'Tempat Naik',            ayatCount:  44, revelationPlace: 'makkah'  },
  { no: 71, nameArab: 'نوح',         nameLatin: 'Nuh',           translatedName: 'Nabi Nuh',               ayatCount:  28, revelationPlace: 'makkah'  },
  { no: 72, nameArab: 'الجن',        nameLatin: 'Al-Jinn',       translatedName: 'Jin',                    ayatCount:  28, revelationPlace: 'makkah'  },
  { no: 73, nameArab: 'المزمل',      nameLatin: 'Al-Muzzammil',  translatedName: 'Orang Berselimut',       ayatCount:  20, revelationPlace: 'makkah'  },
  { no: 74, nameArab: 'المدثر',      nameLatin: 'Al-Muddassir',  translatedName: 'Orang Berkemul',         ayatCount:  56, revelationPlace: 'makkah'  },
  { no: 75, nameArab: 'القيامة',     nameLatin: 'Al-Qiyamah',    translatedName: 'Hari Kiamat',            ayatCount:  40, revelationPlace: 'makkah'  },
  { no: 76, nameArab: 'الإنسان',     nameLatin: 'Al-Insan',      translatedName: 'Manusia',                ayatCount:  31, revelationPlace: 'madinah' },
  { no: 77, nameArab: 'المرسلات',    nameLatin: 'Al-Mursalat',   translatedName: 'Malaikat yang Diutus',   ayatCount:  50, revelationPlace: 'makkah'  },
  { no: 78, nameArab: 'النبأ',       nameLatin: 'An-Naba',       translatedName: 'Berita Besar',           ayatCount:  40, revelationPlace: 'makkah'  },
  { no: 79, nameArab: 'النازعات',    nameLatin: 'An-Nazi\'at',   translatedName: 'Malaikat yang Mencabut', ayatCount:  46, revelationPlace: 'makkah'  },
  { no: 80, nameArab: 'عبس',         nameLatin: 'Abasa',         translatedName: 'Bermuka Masam',          ayatCount:  42, revelationPlace: 'makkah'  },
  { no: 81, nameArab: 'التكوير',     nameLatin: 'At-Takwir',     translatedName: 'Penggulungan',           ayatCount:  29, revelationPlace: 'makkah'  },
  { no: 82, nameArab: 'الانفطار',    nameLatin: 'Al-Infitar',    translatedName: 'Terbelah',               ayatCount:  19, revelationPlace: 'makkah'  },
  { no: 83, nameArab: 'المطففين',    nameLatin: 'Al-Mutaffifin', translatedName: 'Orang-orang yang Curang',ayatCount:  36, revelationPlace: 'makkah'  },
  { no: 84, nameArab: 'الانشقاق',    nameLatin: 'Al-Insyiqaq',   translatedName: 'Terbelah',               ayatCount:  25, revelationPlace: 'makkah'  },
  { no: 85, nameArab: 'البروج',      nameLatin: 'Al-Buruj',      translatedName: 'Gugusan Bintang',        ayatCount:  22, revelationPlace: 'makkah'  },
  { no: 86, nameArab: 'الطارق',      nameLatin: 'At-Tariq',      translatedName: 'Yang Datang di Malam Hari', ayatCount: 17, revelationPlace: 'makkah' },
  { no: 87, nameArab: 'الأعلى',      nameLatin: 'Al-A\'la',      translatedName: 'Yang Paling Tinggi',     ayatCount:  19, revelationPlace: 'makkah'  },
  { no: 88, nameArab: 'الغاشية',     nameLatin: 'Al-Gasyiyah',   translatedName: 'Hari Pembalasan',        ayatCount:  26, revelationPlace: 'makkah'  },
  { no: 89, nameArab: 'الفجر',       nameLatin: 'Al-Fajr',       translatedName: 'Fajar',                  ayatCount:  30, revelationPlace: 'makkah'  },
  { no: 90, nameArab: 'البلد',       nameLatin: 'Al-Balad',      translatedName: 'Negeri',                 ayatCount:  20, revelationPlace: 'makkah'  },
  { no: 91, nameArab: 'الشمس',       nameLatin: 'Asy-Syams',     translatedName: 'Matahari',               ayatCount:  15, revelationPlace: 'makkah'  },
  { no: 92, nameArab: 'الليل',       nameLatin: 'Al-Lail',       translatedName: 'Malam',                  ayatCount:  21, revelationPlace: 'makkah'  },
  { no: 93, nameArab: 'الضحى',       nameLatin: 'Ad-Duha',       translatedName: 'Waktu Dhuha',            ayatCount:  11, revelationPlace: 'makkah'  },
  { no: 94, nameArab: 'الشرح',       nameLatin: 'Al-Insyirah',   translatedName: 'Kelapangan',             ayatCount:   8, revelationPlace: 'makkah'  },
  { no: 95, nameArab: 'التين',       nameLatin: 'At-Tin',        translatedName: 'Buah Tin',               ayatCount:   8, revelationPlace: 'makkah'  },
  { no: 96, nameArab: 'العلق',       nameLatin: 'Al-Alaq',       translatedName: 'Segumpal Darah',         ayatCount:  19, revelationPlace: 'makkah'  },
  { no: 97, nameArab: 'القدر',       nameLatin: 'Al-Qadr',       translatedName: 'Kemuliaan',              ayatCount:   5, revelationPlace: 'makkah'  },
  { no: 98, nameArab: 'البينة',      nameLatin: 'Al-Bayyinah',   translatedName: 'Bukti Nyata',            ayatCount:   8, revelationPlace: 'madinah' },
  { no: 99, nameArab: 'الزلزلة',     nameLatin: 'Az-Zalzalah',   translatedName: 'Kegoncangan',            ayatCount:   8, revelationPlace: 'madinah' },
  { no: 100, nameArab: 'العاديات',   nameLatin: 'Al-Adiyat',     translatedName: 'Kuda Perang yang Berlari',ayatCount: 11, revelationPlace: 'makkah'  },
  { no: 101, nameArab: 'القارعة',    nameLatin: 'Al-Qari\'ah',   translatedName: 'Hari Kiamat',            ayatCount:  11, revelationPlace: 'makkah'  },
  { no: 102, nameArab: 'التكاثر',    nameLatin: 'At-Takasur',    translatedName: 'Bermegah-megahan',       ayatCount:   8, revelationPlace: 'makkah'  },
  { no: 103, nameArab: 'العصر',      nameLatin: 'Al-Asr',        translatedName: 'Masa',                   ayatCount:   3, revelationPlace: 'makkah'  },
  { no: 104, nameArab: 'الهمزة',     nameLatin: 'Al-Humazah',    translatedName: 'Pengumpat',              ayatCount:   9, revelationPlace: 'makkah'  },
  { no: 105, nameArab: 'الفيل',      nameLatin: 'Al-Fil',        translatedName: 'Gajah',                  ayatCount:   5, revelationPlace: 'makkah'  },
  { no: 106, nameArab: 'قريش',       nameLatin: 'Quraisy',       translatedName: 'Suku Quraisy',           ayatCount:   4, revelationPlace: 'makkah'  },
  { no: 107, nameArab: 'الماعون',    nameLatin: 'Al-Ma\'un',     translatedName: 'Barang-barang yang Berguna', ayatCount: 7, revelationPlace: 'makkah' },
  { no: 108, nameArab: 'الكوثر',     nameLatin: 'Al-Kausar',     translatedName: 'Nikmat yang Berlimpah',  ayatCount:   3, revelationPlace: 'makkah'  },
  { no: 109, nameArab: 'الكافرون',   nameLatin: 'Al-Kafirun',    translatedName: 'Orang-orang Kafir',      ayatCount:   6, revelationPlace: 'makkah'  },
  { no: 110, nameArab: 'النصر',      nameLatin: 'An-Nasr',       translatedName: 'Pertolongan',            ayatCount:   3, revelationPlace: 'madinah' },
  { no: 111, nameArab: 'المسد',      nameLatin: 'Al-Masad',      translatedName: 'Gejolak Api',            ayatCount:   5, revelationPlace: 'makkah'  },
  { no: 112, nameArab: 'الإخلاص',    nameLatin: 'Al-Ikhlas',     translatedName: 'Ikhlas',                 ayatCount:   4, revelationPlace: 'makkah'  },
  { no: 113, nameArab: 'الفلق',      nameLatin: 'Al-Falaq',      translatedName: 'Waktu Subuh',            ayatCount:   5, revelationPlace: 'makkah'  },
  { no: 114, nameArab: 'الناس',      nameLatin: 'An-Nas',        translatedName: 'Manusia',                ayatCount:   6, revelationPlace: 'makkah'  },
]

export function getSurah(no) {
  return SURAH_LIST.find(s => s.no === no) || null
}
