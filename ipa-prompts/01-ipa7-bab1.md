# Prompt 01 — IPA Kelas 7 BAB 1: Besaran dan Pengukuran (3 Game)

## Prasyarat
Prompt 00 sudah dikerjakan: infrastruktur baru sudah ada, semua key IPA terdaftar di catalog dan App.jsx dengan IpaGamePlaceholder.

## Konvensi Wajib Game TOMAT

```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'

export default function NamaGame({ onBack }) {
  const { addReward } = usePlayer()
  const { onCorrect, onWrong } = useSurvival()
  // addReward({ coins: 15, exp: 10 }) hanya saat jawaban BENAR
}
```

Pola umum: quiz 10 soal, 4 pilihan (grid 2×2), auto-next 1.3 detik, layar selesai (skor + koin + tombol Main Lagi & Kembali). Soal & pilihan diacak tiap sesi.

---

## Game 1 — `ipa7b1t1`: Unit Converter Dash

**File:** `src/minigames/Ipa7B1T1Game.jsx`  
**TP:** Mengonversikan satuan panjang, massa, dan waktu  
**Tema warna:** hijau (`#22c55e`), background `#0a1a0a → #0d2d0d`

### Data Soal (12 soal, ambil 10 per sesi)

```js
const SOAL = [
  // Panjang
  { teks: '5 km = ___ m',         benar: '5.000 m',      salah: ['500 m', '50.000 m', '0,5 m'] },
  { teks: '300 cm = ___ m',       benar: '3 m',           salah: ['30 m', '0,3 m', '3.000 m'] },
  { teks: '2,5 m = ___ cm',       benar: '250 cm',        salah: ['25 cm', '2.500 cm', '0,25 cm'] },
  { teks: '1 km = ___ cm',        benar: '100.000 cm',    salah: ['1.000 cm', '10.000 cm', '1.000.000 cm'] },
  // Massa
  { teks: '3 kg = ___ g',         benar: '3.000 g',       salah: ['300 g', '30.000 g', '0,3 g'] },
  { teks: '750 g = ___ kg',       benar: '0,75 kg',       salah: ['7,5 kg', '75 kg', '0,075 kg'] },
  { teks: '2 ton = ___ kg',       benar: '2.000 kg',      salah: ['200 kg', '20.000 kg', '0,2 kg'] },
  { teks: '500 mg = ___ g',       benar: '0,5 g',         salah: ['5 g', '50 g', '0,05 g'] },
  // Waktu
  { teks: '2 jam = ___ menit',    benar: '120 menit',     salah: ['60 menit', '200 menit', '20 menit'] },
  { teks: '3 menit = ___ detik',  benar: '180 detik',     salah: ['30 detik', '300 detik', '18 detik'] },
  { teks: '1 hari = ___ jam',     benar: '24 jam',        salah: ['12 jam', '48 jam', '60 jam'] },
  { teks: '90 menit = ___ jam',   benar: '1,5 jam',       salah: ['9 jam', '0,9 jam', '0,15 jam'] },
]
```

---

## Game 2 — `ipa7b1t2`: Baku vs Non-Baku Sort

**File:** `src/minigames/Ipa7B1T2Game.jsx`  
**TP:** Membedakan satuan baku dan tak baku  
**Tema warna:** kuning (`#eab308`), background `#1a1500 → #2d2200`

### Data Soal (10 soal)

```js
const SOAL = [
  { teks: 'Manakah yang termasuk satuan BAKU panjang?', benar: 'Meter (m)', salah: ['Jengkal', 'Depa', 'Langkah'] },
  { teks: 'Mengukur panjang meja dengan jengkal tangan termasuk satuan...', benar: 'Tak baku', salah: ['Baku', 'Internasional', 'SI'] },
  { teks: 'Satuan baku massa dalam Sistem Internasional (SI) adalah...', benar: 'Kilogram (kg)', salah: ['Pon', 'Kati', 'Pikul'] },
  { teks: 'Kelemahan utama satuan tak baku adalah...', benar: 'Hasilnya berbeda-beda antar orang', salah: ['Sulit diingat', 'Terlalu mahal', 'Tidak ada di pasaran'] },
  { teks: 'Satuan waktu yang BUKAN satuan baku adalah...', benar: 'Kedipan mata', salah: ['Detik', 'Menit', 'Jam'] },
  { teks: 'Alat ukur standar yang digunakan sebagai satuan baku panjang adalah...', benar: 'Mistar/penggaris (cm/mm)', salah: ['Jari tangan', 'Tongkat kayu', 'Tali rafia'] },
  { teks: 'Mengapa ilmuwan menggunakan satuan baku?', benar: 'Agar pengukuran konsisten di seluruh dunia', salah: ['Karena lebih murah', 'Karena lebih mudah', 'Karena sudah tradisi'] },
  { teks: '"Depa" adalah satuan tak baku untuk mengukur...', benar: 'Panjang', salah: ['Massa', 'Waktu', 'Suhu'] },
  { teks: 'Satuan baku untuk suhu dalam SI adalah...', benar: 'Kelvin (K)', salah: ['Celsius', 'Fahrenheit', 'Reamur'] },
  { teks: 'Ciri satuan baku yang benar adalah...', benar: 'Nilainya tetap dan diakui secara internasional', salah: ['Mudah diucapkan', 'Sering dipakai sehari-hari', 'Hanya digunakan di Indonesia'] },
]
```

---

## Game 3 — `ipa7b1t3`: Lab Measurement Simulator

**File:** `src/minigames/Ipa7B1T3Game.jsx`  
**TP:** Menggunakan alat ukur yang sesuai  
**Tema warna:** biru muda (`#38bdf8`), background `#030d1a → #051a2d`

### Data Soal (12 soal, ambil 10 per sesi)

```js
const SOAL = [
  { teks: 'Alat ukur yang paling tepat untuk mengukur diameter dalam sebuah pipa kecil adalah...', benar: 'Jangka sorong', salah: ['Mistar', 'Meteran', 'Mikrometer sekrup'] },
  { teks: 'Mikrometer sekrup digunakan untuk mengukur...', benar: 'Ketebalan benda yang sangat kecil (0,01 mm)', salah: ['Panjang jalan raya', 'Volume air', 'Massa batu'] },
  { teks: 'Bagian jangka sorong yang digeser saat mengukur disebut...', benar: 'Rahang geser (nonius)', salah: ['Skala utama', 'Baut pengunci', 'Penunjuk nol'] },
  { teks: 'Neraca Ohaus digunakan untuk mengukur...', benar: 'Massa benda', salah: ['Berat benda', 'Volume cairan', 'Panjang benda'] },
  { teks: 'Untuk mengukur volume cairan secara tepat di laboratorium, alat yang digunakan adalah...', benar: 'Gelas ukur', salah: ['Gelas biasa', 'Mangkuk', 'Sendok makan'] },
  { teks: 'Ketelitian jangka sorong adalah...', benar: '0,1 mm (0,01 cm)', salah: ['1 mm', '0,01 mm', '1 cm'] },
  { teks: 'Saat membaca skala pada gelas ukur, mata harus sejajar dengan...', benar: 'Meniskus bawah permukaan cairan', salah: ['Bagian atas gelas', 'Dasar gelas', 'Angka terdekat'] },
  { teks: 'Alat ukur yang tepat untuk mengukur tinggi badan siswa adalah...', benar: 'Meteran pita (cm)', salah: ['Jangka sorong', 'Mikrometer', 'Mistar 30 cm'] },
  { teks: 'Sebuah koin memiliki ketebalan sangat tipis. Alat ukur terbaik adalah...', benar: 'Mikrometer sekrup', salah: ['Mistar', 'Jangka sorong', 'Penggaris'] },
  { teks: 'Pada neraca Ohaus, massa benda ditentukan saat...', benar: 'Lengan neraca seimbang (jarum di nol)', salah: ['Beban paling berat digunakan', 'Neraca bergetar', 'Jarum menunjuk angka terbesar'] },
  { teks: 'Volume benda padat yang tidak beraturan dapat diukur dengan cara...', benar: 'Mencelupkan benda ke gelas ukur berisi air (mengukur kenaikan volumenya)', salah: ['Mengalikan panjang × lebar × tinggi', 'Menimbang massanya', 'Menggunakan jangka sorong'] },
  { teks: 'Satuan yang dihasilkan dari pembacaan jangka sorong adalah...', benar: 'Milimeter (mm) atau sentimeter (cm)', salah: ['Meter (m)', 'Kilometer (km)', 'Mikrometer (µm)'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa7B1T1Game.jsx`
2. **Buat** `src/minigames/Ipa7B1T2Game.jsx`
3. **Buat** `src/minigames/Ipa7B1T3Game.jsx`
4. **Ubah** `src/App.jsx` — ganti 3 placeholder:
   ```js
   ipa7b1t1: { ..., Component: React.lazy(() => import('./minigames/Ipa7B1T1Game')) },
   ipa7b1t2: { ..., Component: React.lazy(() => import('./minigames/Ipa7B1T2Game')) },
   ipa7b1t3: { ..., Component: React.lazy(() => import('./minigames/Ipa7B1T3Game')) },
   ```

## Checklist
- [ ] 3 game berjalan tanpa error
- [ ] Soal dan pilihan jawaban diacak setiap sesi
- [ ] `addReward` hanya dipanggil saat benar
- [ ] FeedbackBanner tampil dengan jawaban benar jika salah
- [ ] Layar selesai: skor X/10 + koin + Main Lagi & Kembali
