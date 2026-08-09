# Prompt 09 — IPA Kelas 8 BAB 3 Part A: Pernapasan & Ekskresi — TP 1–4

## Prasyarat
Prompt 00 selesai. Key ipa8b3t1–ipa8b3t7 terdaftar. Prompt ini mengerjakan TP 1–4.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
// addReward({ coins: 15, exp: 10 }) hanya saat benar
```

Tema: variasi **biru-ungu** (sistem pernapasan).

---

## Game 1 — `ipa8b3t1`: Organ Anatomy Builder

**File:** `src/minigames/Ipa8B3T1Game.jsx`  
**Tema:** biru (`#2563eb`), background `#020d1a → #041828`

```js
const SOAL = [
  { teks: 'Organ pertama yang dilalui udara saat bernapas adalah...', benar: 'Hidung (rongga hidung)', salah: ['Mulut', 'Tenggorokan', 'Paru-paru'] },
  { teks: 'Fungsi rambut hidung dan lendir di rongga hidung adalah...', benar: 'Menyaring debu dan kotoran dari udara yang masuk', salah: ['Menghangatkan udara saja', 'Melembapkan udara saja', 'Mengatur volume udara'] },
  { teks: 'Percabangan saluran yang menuju ke paru-paru kiri dan kanan disebut...', benar: 'Bronkus', salah: ['Trakea', 'Laring', 'Alveolus'] },
  { teks: 'Organ pernapasan terkecil tempat pertukaran gas terjadi disebut...', benar: 'Alveolus (alveoli)', salah: ['Bronkiolus', 'Bronkus', 'Trakea'] },
  { teks: 'Organ ekskresi yang menghasilkan urin adalah...', benar: 'Ginjal', salah: ['Hati', 'Paru-paru', 'Kulit'] },
  { teks: 'Organ ekskresi yang mengeluarkan keringat adalah...', benar: 'Kulit', salah: ['Ginjal', 'Hati', 'Paru-paru'] },
  { teks: 'Hati (hepar) termasuk organ ekskresi karena...', benar: 'Menghasilkan empedu dan menguraikan zat sisa metabolisme', salah: ['Memompa darah', 'Menghasilkan hormon insulin', 'Menyerap sari makanan'] },
  { teks: 'Paru-paru termasuk organ ekskresi karena mengeluarkan...', benar: 'CO₂ (karbon dioksida) dan uap air', salah: ['Urin', 'Keringat', 'Empedu'] },
  { teks: 'Selaput tipis yang membungkus paru-paru disebut...', benar: 'Pleura', salah: ['Diafragma', 'Perikardium', 'Peritoneum'] },
  { teks: 'Urutan saluran pernapasan dari luar ke dalam yang benar adalah...', benar: 'Hidung → Faring → Laring → Trakea → Bronkus → Bronkiolus → Alveolus', salah: ['Hidung → Trakea → Laring → Bronkus → Alveolus', 'Mulut → Bronkus → Trakea → Alveolus', 'Hidung → Bronkus → Trakea → Laring → Alveolus'] },
]
```

---

## Game 2 — `ipa8b3t2`: Organ Function Cards

**File:** `src/minigames/Ipa8B3T2Game.jsx`  
**Tema:** ungu (`#7c3aed`), background `#080010 → #100820`

```js
const SOAL = [
  { teks: 'Fungsi utama trakea (batang tenggorokan) adalah...', benar: 'Saluran udara dari laring ke bronkus, dilapisi silia untuk menyaring kotoran', salah: ['Tempat pertukaran gas', 'Menghasilkan suara', 'Menyerap oksigen'] },
  { teks: 'Laring berfungsi sebagai...', benar: 'Kotak suara (voice box) dan katup penutup saluran napas saat menelan', salah: ['Tempat pertukaran gas', 'Saluran utama udara', 'Organ penyaring darah'] },
  { teks: 'Fungsi utama ginjal dalam ekskresi adalah...', benar: 'Menyaring darah dan menghasilkan urin untuk mengeluarkan zat sisa', salah: ['Menghasilkan empedu', 'Mengatur detak jantung', 'Menyerap sari makanan'] },
  { teks: 'Hati mengeluarkan empedu yang berfungsi untuk...', benar: 'Mencerna lemak dan mengandung zat sisa bilirubin (hasil pemecahan sel darah tua)', salah: ['Membunuh bakteri', 'Mengatur kadar gula darah', 'Mengangkut oksigen'] },
  { teks: 'Kulit mengeluarkan keringat yang mengandung...', benar: 'Air, garam (NaCl), dan sedikit urea', salah: ['Hanya air saja', 'CO₂ dan uap air', 'Empedu dan bilirubin'] },
  { teks: 'Silia pada saluran pernapasan berfungsi untuk...', benar: 'Menggerakkan lendir dan partikel debu ke arah luar (faring)', salah: ['Memperluas area pertukaran gas', 'Menghasilkan lendir', 'Mengatur masuk-keluarnya udara'] },
  { teks: 'Epiglotis berfungsi menutup saluran pernapasan saat...', benar: 'Menelan makanan agar tidak masuk ke trakea', salah: ['Saat tidur', 'Saat bernapas dalam', 'Saat berlari kencang'] },
  { teks: 'Diafragma berperan dalam pernapasan sebagai...', benar: 'Otot pernapasan utama yang berkontraksi dan relaksasi untuk mengubah volume rongga dada', salah: ['Tempat pertukaran gas', 'Pelindung paru-paru', 'Saluran udara ke paru-paru'] },
  { teks: 'Nefron adalah unit fungsional terkecil dari...', benar: 'Ginjal', salah: ['Hati', 'Paru-paru', 'Kulit'] },
  { teks: 'Ureter berfungsi mengalirkan urin dari...', benar: 'Ginjal ke kandung kemih', salah: ['Kandung kemih ke luar tubuh', 'Darah ke ginjal', 'Ginjal ke hati'] },
]
```

---

## Game 3 — `ipa8b3t3`: Breathing Mechanism Pump

**File:** `src/minigames/Ipa8B3T3Game.jsx`  
**Tema:** biru muda (`#38bdf8`), background `#030d1a → #052040`

```js
const SOAL = [
  { teks: 'Saat inspirasi (menghirup), diafragma...', benar: 'Berkontraksi (mendatar ke bawah) sehingga rongga dada membesar', salah: ['Relaksasi (melengkung ke atas)', 'Tidak bergerak', 'Bergerak ke samping'] },
  { teks: 'Saat ekspirasi (menghembuskan), diafragma...', benar: 'Relaksasi (melengkung ke atas) sehingga rongga dada mengecil', salah: ['Berkontraksi dan mendatar', 'Bergerak ke bawah', 'Tidak bergerak sama sekali'] },
  { teks: 'Pernapasan dada melibatkan otot...', benar: 'Otot antartulang rusuk (interkostal)', salah: ['Hanya diafragma', 'Otot perut', 'Otot leher'] },
  { teks: 'Saat inspirasi pernapasan dada, tulang rusuk bergerak...', benar: 'Ke atas dan ke luar (rongga dada membesar, tekanan berkurang)', salah: ['Ke bawah dan ke dalam', 'Tidak bergerak', 'Ke kiri dan ke kanan'] },
  { teks: 'Udara masuk ke paru-paru saat inspirasi karena...', benar: 'Tekanan di dalam paru-paru lebih rendah dari tekanan atmosfer luar', salah: ['Diafragma mendorong udara masuk', 'Tekanan luar lebih rendah', 'Paru-paru memompa aktif'] },
  { teks: 'Volume tidal adalah...', benar: 'Volume udara yang keluar-masuk saat bernapas normal (±500 mL)', salah: ['Volume maksimal paru-paru', 'Volume sisa udara di paru-paru', 'Volume cadangan inspirasi'] },
  { teks: 'Kapasitas vital paru-paru adalah...', benar: 'Volume udara maksimal yang bisa dihirup dan dihembuskan', salah: ['Volume darah di paru-paru', 'Ukuran fisik paru-paru', 'Jumlah alveolus'] },
  { teks: 'Bernapas lebih cepat saat olahraga terjadi karena...', benar: 'Kadar CO₂ dalam darah meningkat, merangsang pusat pernapasan di otak', salah: ['Paru-paru menjadi lebih besar', 'Oksigen di udara berkurang', 'Jantung memerlukan lebih sedikit darah'] },
  { teks: 'Pernapasan perut (diafragma) lebih efisien dari pernapasan dada karena...', benar: 'Melibatkan volume paru-paru yang lebih besar', salah: ['Lebih cepat', 'Tidak memerlukan energi', 'Paru-paru lebih dekat ke diafragma'] },
  { teks: 'Saat ekspirasi kuat (membuang napas sekuat-kuatnya), otot yang aktif adalah...', benar: 'Otot perut dan otot interkostal internal', salah: ['Diafragma saja', 'Otot pundak', 'Tidak ada otot yang aktif'] },
]
```

---

## Game 4 — `ipa8b3t4`: Alveoli Gas Exchange

**File:** `src/minigames/Ipa8B3T4Game.jsx`  
**Tema:** hijau-biru (`#0d9488`), background `#021210 → #041e1a`

```js
const SOAL = [
  { teks: 'Pertukaran gas di alveolus terjadi melalui proses...', benar: 'Difusi (dari konsentrasi tinggi ke rendah)', salah: ['Osmosis', 'Transport aktif', 'Filtrasi'] },
  { teks: 'Di alveolus, O₂ dari udara berpindah ke...', benar: 'Kapiler darah (karena tekanan O₂ di udara > darah)', salah: ['Jaringan otot langsung', 'Bronkiolus', 'Pleura'] },
  { teks: 'Di alveolus, CO₂ dari darah berpindah ke...', benar: 'Rongga alveolus (karena tekanan CO₂ di darah > udara alveolus)', salah: ['Sel darah merah', 'Bronkus', 'Kapiler limfa'] },
  { teks: 'Mengapa dinding alveolus sangat tipis (1 lapis sel)?', benar: 'Agar difusi gas berlangsung cepat dan mudah', salah: ['Agar paru-paru lebih ringan', 'Agar alveolus mudah mengembang', 'Agar lebih tahan terhadap infeksi'] },
  { teks: 'Jumlah alveolus di paru-paru manusia sekitar...', benar: '300–700 juta (sangat banyak untuk memperluas permukaan pertukaran)', salah: ['100–200', '1.000–2.000', '1–5 juta'] },
  { teks: 'Pertukaran gas di tingkat jaringan (sel) disebut...', benar: 'Pernapasan internal (seluler)', salah: ['Pernapasan eksternal', 'Ventilasi', 'Difusi alveolar'] },
  { teks: 'Surfaktan pada alveolus berfungsi untuk...', benar: 'Mencegah alveolus kolaps (mengempis) dengan mengurangi tegangan permukaan', salah: ['Membunuh bakteri', 'Mengangkut oksigen', 'Menghasilkan lendir'] },
  { teks: 'Oksigen diangkut dalam darah terutama dalam bentuk...', benar: 'Terikat hemoglobin (oksihemoglobin) dalam eritrosit', salah: ['Larut bebas dalam plasma', 'CO₂', 'Glukosa'] },
  { teks: 'CO₂ diangkut dalam darah terutama dalam bentuk...', benar: 'Ion bikarbonat (HCO₃⁻) dalam plasma darah', salah: ['Terikat hemoglobin saja', 'Gas bebas larut', 'Asam karbonat murni'] },
  { teks: 'Tekanan parsial O₂ di alveolus lebih tinggi dari darah kapiler paru. Akibatnya...', benar: 'O₂ berdifusi dari alveolus ke dalam darah (kapiler)', salah: ['O₂ keluar dari darah ke alveolus', 'CO₂ masuk ke darah', 'Tidak terjadi pertukaran gas'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa8B3T1Game.jsx` – `Ipa8B3T4Game.jsx` (4 file)
2. **Ubah** `src/App.jsx` — ganti 4 placeholder ipa8b3t1–ipa8b3t4 dengan lazy import.

## Checklist
- [ ] 4 game berjalan tanpa error
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
