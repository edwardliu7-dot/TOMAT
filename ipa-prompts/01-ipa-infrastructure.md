# Prompt 01 — IPA Infrastructure (Subject Toggle + Zone Screens + Catalog + Routes)

## Konteks Proyek

Ini adalah aplikasi **TOMAT** — aplikasi gamifikasi belajar untuk siswa SMP (kelas 7, 8, 9).  
Stack: **React (Vite) + Express + PostgreSQL (Neon)**.  
File entry frontend: `src/App.jsx`, `src/main.jsx`.  
Routing menggunakan custom history stack (bukan react-router), fungsi `navigate()` dan `goBack()` di `App.jsx`.

Struktur file penting:
- `src/gamesCatalog.js` — metadata semua game (key, name, emoji, bab, grade, **subject**)
- `src/screens/HomeScreen.jsx` — halaman utama siswa (ada `ZONES` → grade 7/8/9)
- `src/screens/Grade7ZoneScreen.jsx`, `Grade8ZoneScreen.jsx`, `Grade9ZoneScreen.jsx` — layar per grade Matematika
- `src/App.jsx` — berisi `GAME_ROUTES`, `STATIC_ROUTES`, `SCREEN_TITLES`
- `server/index.js` — Express entry, pakai modular router

## Tujuan Task Ini

Tambahkan **mata pelajaran IPA** ke aplikasi TOMAT sebagai subjek paralel dengan Matematika.  
Task ini hanya menyiapkan **infrastruktur** — navigasi, zone screens, catalog entries, dan routes.  
Game IPA yang sebenarnya akan ditambahkan di prompt-prompt berikutnya.

---

## Yang Harus Dibuat / Dimodifikasi

### 1. `src/gamesCatalog.js` — Tambah field `subject` dan entry IPA

Tambahkan field `subject` ke semua entri yang sudah ada (default `'matematika'`).  
Lalu tambahkan 10 entri IPA baru di bawah semua entri Matematika:

```js
// IPA — Kelas 7
{ key: 'ipa7pengukuran',   name: 'Precision Measurement Lab',       emoji: '📏', bab: 'I',   grade: 7, subject: 'ipa' },
{ key: 'ipa7zat',          name: 'Fluid & Molecular Quest',          emoji: '💧', bab: 'II',  grade: 7, subject: 'ipa' },
{ key: 'ipa7suhu',         name: 'Thermal Control Center',           emoji: '🌡️', bab: 'III', grade: 7, subject: 'ipa' },
{ key: 'ipa7gaya',         name: 'Physics Arena: Motion & Force',    emoji: '⚡', bab: 'IV',  grade: 7, subject: 'ipa' },

// IPA — Kelas 8
{ key: 'ipa8sel',          name: 'Microscope Explorer & Cell Builder',emoji: '🔬', bab: 'I',   grade: 8, subject: 'ipa' },
{ key: 'ipa8pencernaan',   name: 'Nutrient Test & Blood Transfusion', emoji: '🩸', bab: 'II',  grade: 8, subject: 'ipa' },
{ key: 'ipa8pernapasan',   name: 'Respiration & Kidney Factory',      emoji: '🫁', bab: 'III', grade: 8, subject: 'ipa' },

// IPA — Kelas 9
{ key: 'ipa9koordinasi',   name: 'Homeostasis Balancer',              emoji: '🧠', bab: 'I',   grade: 9, subject: 'ipa' },
{ key: 'ipa9adiktif',      name: 'Body Defender: Say No to Drugs',    emoji: '🛡️', bab: 'II',  grade: 9, subject: 'ipa' },
{ key: 'ipa9reproduksi',   name: 'Life Cycle & Propagation Match',    emoji: '🌱', bab: 'III', grade: 9, subject: 'ipa' },
```

Pastikan semua entri Matematika yang sudah ada juga mendapat `subject: 'matematika'`.

---

### 2. `src/screens/HomeScreen.jsx` — Subject Toggle

Di halaman Home, tambahkan **toggle mata pelajaran** sebelum daftar ZONES.  
Gunakan `useState` untuk `activeSubject` (`'matematika'` | `'ipa'`).

UI toggle: dua tombol pill horizontal — **"Matematika 📐"** dan **"IPA 🔬"**.  
Style aktif: background kuning keemasan (sesuai tema TOMAT). Style tidak aktif: abu-abu transparan.

Ketika `activeSubject === 'matematika'`, tampilkan ZONES yang sudah ada (navigasi ke `grade7`, `grade8`, `grade9`).  
Ketika `activeSubject === 'ipa'`, tampilkan ZONES yang navigasi ke `ipa7`, `ipa8`, `ipa9`.

Label zone IPA:
- 🌿 **Kelas 7 IPA** — Pengukuran, Zat, Suhu & Gerak
- 🔬 **Kelas 8 IPA** — Sel, Pencernaan & Pernapasan  
- 🧠 **Kelas 9 IPA** — Koordinasi, Zat Adiktif & Reproduksi

Lock logic sama dengan Matematika: gunakan `getAccessibleGradesForUser(user)` yang sudah ada.

---

### 3. Buat `src/screens/Ipa7ZoneScreen.jsx`

Mirip struktur `Grade7ZoneScreen.jsx` tapi filter `subject === 'ipa'` dan `grade === 7` dari `GAMES_CATALOG`.

Tampilkan 4 game dalam 4 BAB:
- **BAB I** — Besaran dan Pengukuran → game `ipa7pengukuran` (placeholder: `"Segera Hadir 🚧"` jika file game belum ada, pakai `disabled` style)
- **BAB II** — Zat dan Perubahannya → game `ipa7zat`
- **BAB III** — Suhu, Pemuaian & Kalor → game `ipa7suhu`
- **BAB IV** — Gaya dan Gerak → game `ipa7gaya`

Setiap card game menampilkan: emoji, nama game, label BAB, dan tombol **"Mainkan"**.  
Jika file game component belum ada, tombol disabled dengan teks "Segera Hadir".

Warna tema IPA Kelas 7: gradien hijau (`#22c55e` → `#16a34a`).

---

### 4. Buat `src/screens/Ipa8ZoneScreen.jsx`

Sama dengan Ipa7ZoneScreen tapi filter `grade === 8`:
- **BAB I** — Pengenalan Sel → `ipa8sel`
- **BAB II** — Pencernaan & Peredaran Darah → `ipa8pencernaan`
- **BAB III** — Pernapasan & Ekskresi → `ipa8pernapasan`

Warna tema: gradien biru (`#3b82f6` → `#1d4ed8`).

---

### 5. Buat `src/screens/Ipa9ZoneScreen.jsx`

Filter `grade === 9`:
- **BAB I** — Sistem Koordinasi & Homeostasis → `ipa9koordinasi`
- **BAB II** — Zat Adiktif & Psikotropika → `ipa9adiktif`
- **BAB III** — Sistem Reproduksi → `ipa9reproduksi`

Warna tema: gradien ungu (`#a855f7` → `#7c3aed`).

---

### 6. `src/App.jsx` — Tambah Routes

Di `STATIC_ROUTES`, tambahkan:
```js
ipa7: lazy(() => import('./screens/Ipa7ZoneScreen')),
ipa8: lazy(() => import('./screens/Ipa8ZoneScreen')),
ipa9: lazy(() => import('./screens/Ipa9ZoneScreen')),
```

Di `SCREEN_TITLES`, tambahkan:
```js
ipa7: 'IPA Kelas 7',
ipa8: 'IPA Kelas 8',
ipa9: 'IPA Kelas 9',
```

Di `GAME_ROUTES`, tambahkan placeholder untuk semua 10 key IPA yang mengarah ke komponen `IpaGamePlaceholder` sementara (komponen inline sederhana yang tampilkan "Game ini belum tersedia").  
Ini mencegah crash jika game key sudah ada di catalog tapi file game belum dibuat.

---

### 7. Guru Dashboard — Tugas IPA (Opsional, jika ada waktu)

Di `server/routes/guru.js` (atau file tugas guru), pastikan endpoint `GET /api/guru/games-catalog` mengembalikan field `subject` dari `GAMES_CATALOG` agar guru bisa filter game Matematika vs IPA saat assign tugas.

Di frontend guru (layar assign tugas), tambahkan toggle filter **Matematika / IPA** sebelum daftar game.

---

## Konvensi yang Harus Diikuti

- Semua screen baru menggunakan `AppShell` dan `TopBar` dari `src/components/shared.jsx`
- Tidak ada `react-router-dom` — navigasi pakai `navigate('ipa7')` dari context/prop yang sudah ada
- Komponen baru: functional component dengan arrow function, export default
- CSS: inline style atau Tailwind classes yang sudah dipakai di file lain (cek file existing)
- Jangan ubah logika auth, session, atau coin/exp — hanya tambah navigasi dan UI

## Hasil yang Diharapkan

Setelah task ini selesai:
1. HomeScreen memiliki toggle Matematika / IPA
2. Ada 3 zone screen IPA yang bisa diakses
3. `gamesCatalog.js` punya 10 entri IPA
4. App.jsx punya routes untuk zone IPA dan placeholder game IPA
5. Tidak ada yang rusak di fitur Matematika yang sudah ada
