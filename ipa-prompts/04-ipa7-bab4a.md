# Prompt 04 — IPA Kelas 7 BAB 4 Part A: Gaya dan Gerak — TP 1, 2, 3

## Prasyarat
Prompt 00 selesai. Key `ipa7b4t1`–`ipa7b4t5` terdaftar. Prompt ini mengerjakan TP 1–3.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
// addReward({ coins: 15, exp: 10 }) hanya saat benar
```

---

## Game 1 — `ipa7b4t1`: Force Application Quest

**File:** `src/minigames/Ipa7B4T1Game.jsx`  
**TP:** Mengaplikasikan macam-macam gaya dalam kehidupan sehari-hari  
**Tema:** merah (`#ef4444`), background `#1a0000 → #2d0808`

```js
const SOAL = [
  { teks: 'Gaya yang bekerja pada benda yang jatuh ke tanah adalah...', benar: 'Gaya gravitasi', salah: ['Gaya gesek', 'Gaya magnet', 'Gaya otot'] },
  { teks: 'Seorang siswa mendorong meja. Gaya yang diberikan siswa disebut...', benar: 'Gaya otot', salah: ['Gaya gesek', 'Gaya gravitasi', 'Gaya pegas'] },
  { teks: 'Kasur pegas bisa kembali ke bentuk semula setelah ditekan karena adanya...', benar: 'Gaya pegas', salah: ['Gaya otot', 'Gaya gesek', 'Gaya normal'] },
  { teks: 'Sepatu yang bisa menempel di papan magnet terbuat dari bahan yang dipengaruhi...', benar: 'Gaya magnet', salah: ['Gaya gravitasi', 'Gaya otot', 'Gaya listrik'] },
  { teks: 'Rambut yang berdiri saat didekatkan ke layar TV lama (CRT) terjadi karena...', benar: 'Gaya listrik statis', salah: ['Gaya magnet', 'Gaya angin', 'Gaya gravitasi'] },
  { teks: 'Saat bola menggelinding di lantai, lama-lama bola berhenti karena adanya...', benar: 'Gaya gesek (antara bola dan lantai)', salah: ['Gaya gravitasi membalik', 'Gaya magnet bumi', 'Gaya otot berkurang'] },
  { teks: 'Menabur pasir di jalan yang bersalju bertujuan untuk...', benar: 'Memperbesar gaya gesek agar tidak tergelincir', salah: ['Memperkecil gaya gesek', 'Menghilangkan es', 'Menghangatkan jalan'] },
  { teks: 'Gaya yang selalu berlawanan arah dengan gerak benda disebut...', benar: 'Gaya gesek', salah: ['Gaya gravitasi', 'Gaya normal', 'Gaya pegas'] },
  { teks: 'Buku diam di atas meja. Gaya yang diberikan meja ke buku secara tegak lurus disebut...', benar: 'Gaya normal', salah: ['Gaya gravitasi', 'Gaya gesek', 'Gaya otot'] },
  { teks: 'Contoh gaya yang bekerja TANPA SENTUHAN adalah...', benar: 'Gaya gravitasi dan gaya magnet', salah: ['Gaya otot dan gaya gesek', 'Gaya gesek dan gaya normal', 'Gaya pegas dan gaya otot'] },
  { teks: 'Tangan yang menarik karet gelang memanfaatkan...', benar: 'Gaya otot dan gaya pegas (elastisitas karet)', salah: ['Gaya gesek saja', 'Gaya gravitasi', 'Gaya magnet'] },
  { teks: 'Gaya yang menyebabkan bulan tetap mengorbit bumi adalah...', benar: 'Gaya gravitasi bumi', salah: ['Gaya magnet bumi', 'Gaya dorong matahari', 'Gaya angin luar angkasa'] },
]
```

---

## Game 2 — `ipa7b4t2`: Resultant Tug of War

**File:** `src/minigames/Ipa7B4T2Game.jsx`  
**TP:** Mengukur gaya segaris searah dan berlawanan  
**Tema:** oranye (`#f97316`), background `#1a0800 → #2d1200`

**Rumus (komentar di kode):**
```
Searah    : R = F1 + F2 (arah sama)
Berlawanan: R = F1 − F2 (arah ikut gaya terbesar)
Seimbang  : R = 0 jika F1 = F2 berlawanan
```

```js
const SOAL = [
  { teks: 'F1 = 30 N ke kanan, F2 = 20 N ke kanan. Resultan = ?', benar: '50 N ke kanan', salah: ['10 N ke kanan', '50 N ke kiri', '600 N'] },
  { teks: 'F1 = 40 N ke kanan, F2 = 15 N ke kiri. Resultan = ?', benar: '25 N ke kanan', salah: ['55 N ke kanan', '25 N ke kiri', '40 N'] },
  { teks: 'F1 = 50 N ke atas, F2 = 50 N ke bawah. Resultan = ?', benar: '0 N (setimbang)', salah: ['100 N ke atas', '100 N ke bawah', '50 N'] },
  { teks: 'Tiga orang mendorong ke kanan: 20 N, 25 N, 15 N. Resultan = ?', benar: '60 N ke kanan', salah: ['20 N', '45 N', '60 N ke kiri'] },
  { teks: 'F1 = 70 N ke kiri, F2 = 30 N ke kanan. Resultan = ?', benar: '40 N ke kiri', salah: ['40 N ke kanan', '100 N ke kiri', '70 N'] },
  { teks: 'Dua gaya berlawanan F1 = 100 N, F2 = 60 N. Arah resultan mengikuti...', benar: 'F1 (100 N), resultan = 40 N arah F1', salah: ['F2, resultan = 40 N', 'Tidak ada resultan', 'Resultan = 160 N'] },
  { teks: 'Benda diam saat gaya-gaya yang bekerja berjumlah...', benar: '0 N (resultan nol)', salah: ['100 N', '50 N', 'Tidak ada gaya'] },
  { teks: 'F1 = 80 N, F2 = 30 N, keduanya ke kanan. Resultan = ?', benar: '110 N ke kanan', salah: ['50 N ke kanan', '110 N ke kiri', '80 N'] },
  { teks: 'Dalam tarik tambang, tim A menarik 500 N ke kiri, tim B 500 N ke kanan. Hasilnya...', benar: 'Resultan = 0 N, tali tidak bergerak', salah: ['Resultan = 1000 N ke kiri', 'Tali bergerak ke kanan', 'Resultan = 500 N'] },
  { teks: 'F1 = 25 N ke timur, F2 = 10 N ke barat. Resultan = ?', benar: '15 N ke timur', salah: ['35 N ke timur', '15 N ke barat', '25 N'] },
  { teks: 'Benda yang bergerak ke kanan artinya resultan gaya pada benda tersebut...', benar: 'Mengarah ke kanan (resultan positif ke kanan)', salah: ['Mengarah ke kiri', 'Resultan nol', 'Tidak ada gaya'] },
  { teks: 'Dua gaya 45 N dan 45 N berlawanan arah. Resultannya adalah...', benar: '0 N', salah: ['90 N', '45 N', '22,5 N'] },
]
```

---

## Game 3 — `ipa7b4t3`: Motion Classifier

**File:** `src/minigames/Ipa7B4T3Game.jsx`  
**TP:** Membandingkan macam-macam gerak menurut jenis, sifat, dan lintasan  
**Tema:** hijau-biru (`#0ea5e9`), background `#021018 → #041a28`

```js
const SOAL = [
  { teks: 'Gerak mobil di jalan raya yang lurus dengan kecepatan tetap disebut...', benar: 'GLB (Gerak Lurus Beraturan)', salah: ['GLBB dipercepat', 'GLBB diperlambat', 'Gerak melingkar'] },
  { teks: 'Motor dari diam lalu bergerak makin cepat di jalan lurus disebut...', benar: 'GLBB dipercepat', salah: ['GLB', 'GLBB diperlambat', 'Gerak parabola'] },
  { teks: 'Sepeda mengerem dan melambat hingga berhenti disebut...', benar: 'GLBB diperlambat', salah: ['GLB', 'GLBB dipercepat', 'Gerak harmonik'] },
  { teks: 'Bumi berputar mengelilingi matahari merupakan contoh gerak...', benar: 'Melingkar', salah: ['Lurus', 'Parabola', 'Harmonik'] },
  { teks: 'Bola yang dilempar mendatar (tidak vertikal) membentuk lintasan...', benar: 'Parabola', salah: ['Lurus', 'Melingkar', 'Zigzag'] },
  { teks: 'Pada GLB, percepatan benda bernilai...', benar: 'Nol (0 m/s²)', salah: ['Positif', 'Negatif', 'Berubah-ubah'] },
  { teks: 'Jarum jam yang berputar merupakan contoh gerak...', benar: 'Melingkar beraturan', salah: ['GLB', 'GLBB', 'Gerak parabola'] },
  { teks: 'Ciri utama GLBB adalah...', benar: 'Kecepatan berubah secara teratur (percepatan tetap)', salah: ['Kecepatan tetap', 'Lintasan selalu melengkung', 'Tidak ada percepatan'] },
  { teks: 'Gerak relatif adalah gerak yang diamati dari...', benar: 'Sudut pandang (titik acuan) yang berbeda', salah: ['Tempat yang sangat jauh', 'Kamera satelit saja', 'Benda yang diam saja'] },
  { teks: 'Saat kamu naik bus dan bus bergerak, pohon di luar terlihat bergerak. Ini contoh gerak...', benar: 'Relatif (pohon relatif bergerak terhadap bus)', salah: ['Pohon benar-benar bergerak', 'GLB pohon', 'GLBB pohon'] },
  { teks: 'Bola yang dilempar vertikal ke atas, lalu jatuh kembali memiliki lintasan berbentuk...', benar: 'Lurus vertikal (naik-turun)', salah: ['Parabola', 'Melingkar', 'Zigzag'] },
  { teks: 'Grafik v-t (kecepatan vs waktu) untuk GLB berbentuk...', benar: 'Garis horizontal (kecepatan konstan)', salah: ['Garis miring ke atas', 'Garis miring ke bawah', 'Kurva melengkung'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa7B4T1Game.jsx`
2. **Buat** `src/minigames/Ipa7B4T2Game.jsx`
3. **Buat** `src/minigames/Ipa7B4T3Game.jsx`
4. **Ubah** `src/App.jsx` — ganti placeholder ipa7b4t1, ipa7b4t2, ipa7b4t3 dengan lazy import.

## Checklist
- [ ] 3 game berjalan tanpa error
- [ ] Rumus resultan ada sebagai komentar di Ipa7B4T2Game
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
