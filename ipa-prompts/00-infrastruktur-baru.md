# Prompt 00 — Infrastruktur IPA Baru (50 Game Keys)

## Konteks

Aplikasi TOMAT. Konsep IPA berubah: dari 1 game per BAB menjadi **1 game per Tujuan Pembelajaran (TP)**.
Total game baru: **50 game** (menggantikan 10 game lama).

File yang diubah:
- `src/gamesCatalog.js`
- `src/App.jsx`
- `src/screens/Ipa7ZoneScreen.jsx`
- `src/screens/Ipa8ZoneScreen.jsx`
- `src/screens/Ipa9ZoneScreen.jsx`

---

## 1. `src/gamesCatalog.js` — Ganti Semua Entri IPA

Hapus 10 entri IPA lama. Tambahkan 50 entri baru dengan skema key `ipaXbYtZ`
(X=grade, Y=bab, Z=nomor TP):

```js
// ─── IPA Kelas 7 ─────────────────────────────────────────────────────────────
// BAB 1: Besaran dan Pengukuran
{ key: 'ipa7b1t1', name: 'Unit Converter Dash',         emoji: '📏', bab: 'I',   tp: 1, grade: 7, subject: 'ipa' },
{ key: 'ipa7b1t2', name: 'Baku vs Non-Baku Sort',       emoji: '⚖️', bab: 'I',   tp: 2, grade: 7, subject: 'ipa' },
{ key: 'ipa7b1t3', name: 'Lab Measurement Simulator',   emoji: '🔬', bab: 'I',   tp: 3, grade: 7, subject: 'ipa' },

// BAB 2: Zat dan Perubahannya
{ key: 'ipa7b2t1', name: 'Matter Inspector',            emoji: '🧪', bab: 'II',  tp: 1, grade: 7, subject: 'ipa' },
{ key: 'ipa7b2t2', name: 'Phase Change Master',         emoji: '❄️', bab: 'II',  tp: 2, grade: 7, subject: 'ipa' },
{ key: 'ipa7b2t3', name: 'Cohesion vs Adhesion Lab',   emoji: '💧', bab: 'II',  tp: 3, grade: 7, subject: 'ipa' },
{ key: 'ipa7b2t4', name: 'Capillary Tube Challenge',   emoji: '🌿', bab: 'II',  tp: 4, grade: 7, subject: 'ipa' },

// BAB 3: Suhu, Pemuaian, dan Kalor
{ key: 'ipa7b3t1', name: 'Thermometer Reader',          emoji: '🌡️', bab: 'III', tp: 1, grade: 7, subject: 'ipa' },
{ key: 'ipa7b3t2', name: 'Temperature Converter Wheel', emoji: '🔄', bab: 'III', tp: 2, grade: 7, subject: 'ipa' },
{ key: 'ipa7b3t3', name: 'Thermal Expansion Builder',  emoji: '🔩', bab: 'III', tp: 3, grade: 7, subject: 'ipa' },

// BAB 4: Gaya dan Gerak
{ key: 'ipa7b4t1', name: 'Force Application Quest',    emoji: '💪', bab: 'IV',  tp: 1, grade: 7, subject: 'ipa' },
{ key: 'ipa7b4t2', name: 'Resultant Tug of War',       emoji: '⚖️', bab: 'IV',  tp: 2, grade: 7, subject: 'ipa' },
{ key: 'ipa7b4t3', name: 'Motion Classifier',          emoji: '🏃', bab: 'IV',  tp: 3, grade: 7, subject: 'ipa' },
{ key: 'ipa7b4t4', name: 'Speed vs Velocity Pilot',    emoji: '✈️', bab: 'IV',  tp: 4, grade: 7, subject: 'ipa' },
{ key: 'ipa7b4t5', name: "Newton's Law Arena",          emoji: '⚡', bab: 'IV',  tp: 5, grade: 7, subject: 'ipa' },

// ─── IPA Kelas 8 ─────────────────────────────────────────────────────────────
// BAB 1: Pengenalan Sel
{ key: 'ipa8b1t1', name: 'History Timeline Puzzle',     emoji: '🕰️', bab: 'I',   tp: 1, grade: 8, subject: 'ipa' },
{ key: 'ipa8b1t2', name: 'Microscope Selector',         emoji: '🔭', bab: 'I',   tp: 2, grade: 8, subject: 'ipa' },
{ key: 'ipa8b1t3', name: 'Cell Organelle Sorter',       emoji: '🧫', bab: 'I',   tp: 3, grade: 8, subject: 'ipa' },
{ key: 'ipa8b1t4', name: 'Specialized Cell Match',      emoji: '🔬', bab: 'I',   tp: 4, grade: 8, subject: 'ipa' },
{ key: 'ipa8b1t5', name: 'Stem Cell Regenerator',       emoji: '🌱', bab: 'I',   tp: 5, grade: 8, subject: 'ipa' },

// BAB 2: Sistem Pencernaan dan Peredaran Darah
{ key: 'ipa8b2t1', name: 'Nutritional Plate Balance',   emoji: '🥗', bab: 'II',  tp: 1, grade: 8, subject: 'ipa' },
{ key: 'ipa8b2t2', name: 'Virtual Food Reagent Test',   emoji: '🧪', bab: 'II',  tp: 2, grade: 8, subject: 'ipa' },
{ key: 'ipa8b2t3', name: 'Digestive Track Runner',      emoji: '🫁', bab: 'II',  tp: 3, grade: 8, subject: 'ipa' },
{ key: 'ipa8b2t4', name: 'Digestive Hospital Clinic',   emoji: '🏥', bab: 'II',  tp: 4, grade: 8, subject: 'ipa' },
{ key: 'ipa8b2t5', name: 'Circulatory System Navigator',emoji: '❤️', bab: 'II',  tp: 5, grade: 8, subject: 'ipa' },
{ key: 'ipa8b2t6', name: 'Blood Component Defender',    emoji: '🩸', bab: 'II',  tp: 6, grade: 8, subject: 'ipa' },
{ key: 'ipa8b2t7', name: 'Blood Transfusion Match',     emoji: '💉', bab: 'II',  tp: 7, grade: 8, subject: 'ipa' },
{ key: 'ipa8b2t8', name: 'Cardiovascular Healthy Life', emoji: '🫀', bab: 'II',  tp: 8, grade: 8, subject: 'ipa' },

// BAB 3: Sistem Pernapasan dan Ekskresi
{ key: 'ipa8b3t1', name: 'Organ Anatomy Builder',       emoji: '🫀', bab: 'III', tp: 1, grade: 8, subject: 'ipa' },
{ key: 'ipa8b3t2', name: 'Organ Function Cards',        emoji: '🃏', bab: 'III', tp: 2, grade: 8, subject: 'ipa' },
{ key: 'ipa8b3t3', name: 'Breathing Mechanism Pump',    emoji: '🫁', bab: 'III', tp: 3, grade: 8, subject: 'ipa' },
{ key: 'ipa8b3t4', name: 'Alveoli Gas Exchange',        emoji: '💨', bab: 'III', tp: 4, grade: 8, subject: 'ipa' },
{ key: 'ipa8b3t5', name: 'Nephron Urine Factory',       emoji: '🧫', bab: 'III', tp: 5, grade: 8, subject: 'ipa' },
{ key: 'ipa8b3t6', name: 'Medical Case Analyzer',       emoji: '🩺', bab: 'III', tp: 6, grade: 8, subject: 'ipa' },
{ key: 'ipa8b3t7', name: 'Healthy Habit Choice',        emoji: '🏃', bab: 'III', tp: 7, grade: 8, subject: 'ipa' },

// ─── IPA Kelas 9 ─────────────────────────────────────────────────────────────
// BAB 1: Sistem Koordinasi dan Homeostasis
{ key: 'ipa9b1t1', name: 'Body Command Center',          emoji: '🧠', bab: 'I',   tp: 1, grade: 9, subject: 'ipa' },
{ key: 'ipa9b1t2', name: 'Neuron Network Relay',         emoji: '⚡', bab: 'I',   tp: 2, grade: 9, subject: 'ipa' },
{ key: 'ipa9b1t3', name: 'Hormone Gland Factory',        emoji: '🏭', bab: 'I',   tp: 3, grade: 9, subject: 'ipa' },
{ key: 'ipa9b1t4', name: 'Homeostasis Stabilizer',       emoji: '⚖️', bab: 'I',   tp: 4, grade: 9, subject: 'ipa' },
{ key: 'ipa9b1t5', name: 'Daily Stress Survival',        emoji: '🧘', bab: 'I',   tp: 5, grade: 9, subject: 'ipa' },

// BAB 2: Zat Adiktif dan Psikotropika
{ key: 'ipa9b2t1', name: 'Addictive Substance Quiz',     emoji: '⚠️', bab: 'II',  tp: 1, grade: 9, subject: 'ipa' },
{ key: 'ipa9b2t2', name: 'Substance Categorizer',        emoji: '🗂️', bab: 'II',  tp: 2, grade: 9, subject: 'ipa' },
{ key: 'ipa9b2t3', name: 'Impact Simulator',             emoji: '💔', bab: 'II',  tp: 3, grade: 9, subject: 'ipa' },
{ key: 'ipa9b2t4', name: 'Substance Flashcards',         emoji: '🃏', bab: 'II',  tp: 4, grade: 9, subject: 'ipa' },
{ key: 'ipa9b2t5', name: 'Consequence Analyzer',         emoji: '📊', bab: 'II',  tp: 5, grade: 9, subject: 'ipa' },
{ key: 'ipa9b2t6', name: 'Say No Challenge',             emoji: '🛡️', bab: 'II',  tp: 6, grade: 9, subject: 'ipa' },

// BAB 3: Sistem Reproduksi
{ key: 'ipa9b3t1', name: 'Reproductive Anatomy Puzzle',  emoji: '🧬', bab: 'III', tp: 1, grade: 9, subject: 'ipa' },
{ key: 'ipa9b3t2', name: 'Human Life Stages Timeline',   emoji: '👶', bab: 'III', tp: 2, grade: 9, subject: 'ipa' },
{ key: 'ipa9b3t3', name: 'Reproductive Health Guardian', emoji: '🏥', bab: 'III', tp: 3, grade: 9, subject: 'ipa' },
{ key: 'ipa9b3t4', name: 'Flora & Fauna Breeder',        emoji: '🌱', bab: 'III', tp: 4, grade: 9, subject: 'ipa' },
```

---

## 2. `src/App.jsx` — Update GAME_ROUTES

Hapus semua entri IPA lama (ipa7pengukuran, ipa7zat, ipa7suhu, ipa7gaya, ipa8sel, ipa8pencernaan, ipa8pernapasan, ipa9koordinasi, ipa9adiktif, ipa9reproduksi).

Tambahkan 50 entri baru, **semua menggunakan `IpaGamePlaceholder`** untuk sementara:

```js
// IPA Kelas 7
ipa7b1t1: { name: 'Unit Converter Dash',          emoji: '📏', Component: IpaGamePlaceholder },
ipa7b1t2: { name: 'Baku vs Non-Baku Sort',        emoji: '⚖️', Component: IpaGamePlaceholder },
ipa7b1t3: { name: 'Lab Measurement Simulator',    emoji: '🔬', Component: IpaGamePlaceholder },
ipa7b2t1: { name: 'Matter Inspector',             emoji: '🧪', Component: IpaGamePlaceholder },
// ... (seluruh 50 key, semua IpaGamePlaceholder)
```

---

## 3. Zone Screens — Tampilan Baru Per BAB dan TP

### `src/screens/Ipa7ZoneScreen.jsx`

Ubah struktur: group game per BAB, setiap BAB berisi card game sesuai TP-nya.

```
BAB I — Besaran dan Pengukuran
  [📏 Unit Converter Dash — TP 1]
  [⚖️ Baku vs Non-Baku Sort — TP 2]
  [🔬 Lab Measurement Simulator — TP 3]

BAB II — Zat dan Perubahannya
  [🧪 Matter Inspector — TP 1]
  [❄️ Phase Change Master — TP 2]
  [💧 Cohesion vs Adhesion Lab — TP 3]
  [🌿 Capillary Tube Challenge — TP 4]

BAB III — Suhu, Pemuaian, dan Kalor
  ...

BAB IV — Gaya dan Gerak
  ...
```

Struktur data di zone screen:
```js
const BABS = [
  {
    bab: 'I', judul: 'Besaran dan Pengukuran',
    games: ['ipa7b1t1', 'ipa7b1t2', 'ipa7b1t3'],
  },
  {
    bab: 'II', judul: 'Zat dan Perubahannya',
    games: ['ipa7b2t1', 'ipa7b2t2', 'ipa7b2t3', 'ipa7b2t4'],
  },
  {
    bab: 'III', judul: 'Suhu, Pemuaian, dan Kalor',
    games: ['ipa7b3t1', 'ipa7b3t2', 'ipa7b3t3'],
  },
  {
    bab: 'IV', judul: 'Gaya dan Gerak',
    games: ['ipa7b4t1', 'ipa7b4t2', 'ipa7b4t3', 'ipa7b4t4', 'ipa7b4t5'],
  },
]
```

Ambil metadata game (emoji, name) dari `GAMES_CATALOG` berdasarkan key.
Warna tema: hijau (`#22c55e`).

### `src/screens/Ipa8ZoneScreen.jsx`
BABs:
- I: ipa8b1t1–ipa8b1t5 (Pengenalan Sel)
- II: ipa8b2t1–ipa8b2t8 (Pencernaan & Peredaran Darah)
- III: ipa8b3t1–ipa8b3t7 (Pernapasan & Ekskresi)

Warna tema: biru (`#3b82f6`).

### `src/screens/Ipa9ZoneScreen.jsx`
BABs:
- I: ipa9b1t1–ipa9b1t5 (Koordinasi & Homeostasis)
- II: ipa9b2t1–ipa9b2t6 (Zat Adiktif)
- III: ipa9b3t1–ipa9b3t4 (Reproduksi)

Warna tema: ungu (`#a855f7`).

---

## Catatan

- Semua game baru menggunakan `IpaGamePlaceholder` — **belum ada game yang diimplementasikan** di prompt ini.
- Game akan diimplementasikan satu per satu di prompt 01–13.
- Jangan ubah logika auth, zona Matematika, atau fitur lain.
- Pastikan tidak ada crash setelah perubahan ini.
