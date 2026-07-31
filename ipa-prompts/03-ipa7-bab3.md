# Prompt 03 — IPA Kelas 7 BAB 3: Suhu, Pemuaian, dan Kalor (3 Game)

## Prasyarat
Prompt 00 selesai. Key `ipa7b3t1`–`ipa7b3t3` terdaftar di App.jsx sebagai IpaGamePlaceholder.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
// addReward({ coins: 15, exp: 10 }) hanya saat benar
```

---

## Game 1 — `ipa7b3t1`: Thermometer Reader

**File:** `src/minigames/Ipa7B3T1Game.jsx`  
**TP:** Menggunakan termometer untuk mengukur suhu  
**Tema:** merah-oranye (`#f97316`), background `#1a0800 → #2d1000`

```js
const SOAL = [
  { teks: 'Termometer bekerja berdasarkan prinsip...', benar: 'Pemuaian zat cair (raksa/alkohol) saat suhu naik', salah: ['Perubahan warna zat', 'Perubahan massa zat', 'Gaya gravitasi'] },
  { teks: 'Jenis termometer yang paling umum digunakan untuk mengukur suhu tubuh manusia adalah...', benar: 'Termometer klinis (air raksa/digital)', salah: ['Termometer ruangan', 'Termometer bimetal', 'Termometer gas'] },
  { teks: 'Mengapa air raksa dipilih sebagai pengisi termometer?', benar: 'Pemuaiannya merata, tidak menempel kaca, dan terlihat jelas', salah: ['Air raksa murah dan mudah didapat', 'Air raksa tidak berbahaya', 'Air raksa tidak bisa membeku'] },
  { teks: 'Termometer bimetal bekerja dengan memanfaatkan...', benar: 'Perbedaan pemuaian dua logam yang direkatkan', salah: ['Perubahan warna logam', 'Perubahan massa logam', 'Aliran listrik'] },
  { teks: 'Suhu normal tubuh manusia adalah sekitar...', benar: '36–37°C', salah: ['30–32°C', '38–40°C', '20–25°C'] },
  { teks: 'Termometer digital menggunakan sensor...', benar: 'Termistor atau thermocouple (sensor listrik)', salah: ['Air raksa cair', 'Gas nitrogen', 'Alkohol berwarna'] },
  { teks: 'Saat membaca termometer, mata harus diposisikan...', benar: 'Sejajar/tegak lurus dengan skala (menghindari parallax)', salah: ['Di atas skala', 'Di bawah skala', 'Posisi tidak berpengaruh'] },
  { teks: 'Termometer maksimum-minimum digunakan untuk mengukur...', benar: 'Suhu tertinggi dan terendah dalam periode waktu tertentu', salah: ['Suhu rata-rata', 'Suhu saat ini saja', 'Suhu benda padat'] },
  { teks: 'Alkohol digunakan dalam termometer untuk mengukur suhu...', benar: 'Sangat rendah (di bawah -39°C, titik beku raksa)', salah: ['Sangat tinggi di atas 200°C', 'Suhu tubuh manusia', 'Suhu dalam oven'] },
  { teks: 'Bagian termometer yang langsung menyentuh benda/zat yang diukur suhunya adalah...', benar: 'Reservoir/bulb (bagian bawah berisi zat cair)', salah: ['Skala angka', 'Bagian atas kapiler', 'Sumbat karet'] },
  { teks: 'Titik tetap bawah (0°C) pada termometer Celsius ditetapkan berdasarkan...', benar: 'Suhu es murni yang meleleh (campuran es dan air)', salah: ['Suhu air mendidih', 'Suhu ruangan normal', 'Suhu tubuh manusia'] },
  { teks: 'Termometer yang cocok untuk mengukur suhu dalam tungku peleburan baja adalah...', benar: 'Termometer termoelektrik (thermocouple)', salah: ['Termometer air raksa', 'Termometer alkohol', 'Termometer klinis'] },
]
```

---

## Game 2 — `ipa7b3t2`: Temperature Converter Wheel

**File:** `src/minigames/Ipa7B3T2Game.jsx`  
**TP:** Mengonversikan skala termometer Celsius ke skala lain  
**Tema:** kuning emas (`#eab308`), background `#1a1200 → #2d1f00`

**Rumus konversi (wajib ada sebagai komentar di kode):**
```
°C → °R : C × 4/5
°C → °F : (C × 9/5) + 32
°C → K  : C + 273
°R → °C : R × 5/4
°F → °C : (F - 32) × 5/9
```

```js
const SOAL = [
  { teks: '100°C = ___ °R',  benar: '80°R',  salah: ['100°R', '125°R', '40°R'] },
  { teks: '0°C = ___ °R',   benar: '0°R',   salah: ['32°R', '273°R', '4°R'] },
  { teks: '25°C = ___ °R',  benar: '20°R',  salah: ['25°R', '31,25°R', '10°R'] },
  { teks: '100°C = ___ °F', benar: '212°F', salah: ['100°F', '180°F', '373°F'] },
  { teks: '0°C = ___ °F',   benar: '32°F',  salah: ['0°F', '273°F', '100°F'] },
  { teks: '37°C = ___ °F',  benar: '98,6°F',salah: ['37°F', '100°F', '66,6°F'] },
  { teks: '0°C = ___ K',    benar: '273 K', salah: ['0 K', '100 K', '373 K'] },
  { teks: '100°C = ___ K',  benar: '373 K', salah: ['100 K', '273 K', '473 K'] },
  { teks: '27°C = ___ K',   benar: '300 K', salah: ['27 K', '327 K', '273 K'] },
  { teks: '212°F = ___ °C', benar: '100°C', salah: ['212°C', '180°C', '32°C'] },
  { teks: '32°F = ___ °C',  benar: '0°C',   salah: ['32°C', '-32°C', '16°C'] },
  { teks: '40°R = ___ °C',  benar: '50°C',  salah: ['40°C', '32°C', '100°C'] },
]
```

---

## Game 3 — `ipa7b3t3`: Thermal Expansion Builder

**File:** `src/minigames/Ipa7B3T3Game.jsx`  
**TP:** Menyelidiki pemuaian pada zat padat, cair, dan gas  
**Tema:** merah bata (`#dc2626`), background `#1a0000 → #2d0808`

```js
const SOAL = [
  { teks: 'Urutan zat dari pemuaian TERKECIL ke TERBESAR saat dipanaskan adalah...', benar: 'Padat → Cair → Gas', salah: ['Gas → Cair → Padat', 'Cair → Padat → Gas', 'Semuanya sama'] },
  { teks: 'Sambungan rel kereta api diberi celah kecil agar...', benar: 'Rel punya ruang untuk memuai saat panas dan tidak bengkok', salah: ['Air hujan bisa meresap', 'Rel lebih mudah dipasang', 'Mengurangi gesekan roda'] },
  { teks: 'Kawat listrik tampak lebih kendur di siang hari karena...', benar: 'Kawat memuai saat suhu tinggi sehingga panjangnya bertambah', salah: ['Kawat meleleh di siang hari', 'Gravitasi lebih kuat di siang hari', 'Angin menyebabkan kawat kendur'] },
  { teks: 'Botol kaca berisi air penuh lalu dipanaskan bisa pecah karena...', benar: 'Air memuai lebih besar dari kaca, tekanan meningkat', salah: ['Kaca memuai lebih cepat', 'Udara masuk ke botol', 'Suhu terlalu rendah'] },
  { teks: 'Ban mobil bisa kempes di cuaca sangat dingin karena...', benar: 'Udara dalam ban menyusut saat dingin, tekanan berkurang', salah: ['Karet ban mengembang saat dingin', 'Udara keluar melewati karet', 'Gravitasi menarik ban ke bawah'] },
  { teks: 'Termometer memanfaatkan prinsip pemuaian...', benar: 'Zat cair (raksa atau alkohol)', salah: ['Zat padat (logam)', 'Gas nitrogen', 'Pemuaian ruang hampa'] },
  { teks: 'Pemuaian panjang (linear) terjadi pada benda...', benar: 'Padat dengan satu dimensi dominan (kawat/rel)', salah: ['Zat cair', 'Gas dalam balon', 'Udara panas'] },
  { teks: 'Balon udara panas bisa terbang karena...', benar: 'Udara panas di dalam balon memuai dan menjadi lebih ringan dari udara di luar', salah: ['Balon dibuat dari bahan ringan', 'Gas di dalam balon bertambah banyak', 'Api di bawah mendorong balon ke atas'] },
  { teks: 'Keping bimetal melengkung saat dipanaskan karena...', benar: 'Dua logam memiliki koefisien muai yang berbeda', salah: ['Logam meleleh', 'Tekanan udara berubah', 'Salah satu logam lebih berat'] },
  { teks: 'Aplikasi keping bimetal dalam kehidupan sehari-hari adalah...', benar: 'Termostat (pengatur suhu otomatis)', salah: ['Termometer air raksa', 'Rel kereta api', 'Gelas ukur laboratorium'] },
  { teks: 'Pemasangan kaca jendela sengaja dibuat sedikit lebih kecil dari bingkainya agar...', benar: 'Ada ruang untuk pemuaian kaca saat panas', salah: ['Kaca mudah dibuka', 'Mengurangi biaya', 'Agar cahaya bisa masuk'] },
  { teks: 'Pemuaian volume (kubik) terutama terjadi pada...', benar: 'Zat padat tiga dimensi, zat cair, dan gas', salah: ['Hanya gas', 'Hanya zat cair', 'Hanya benda panjang'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa7B3T1Game.jsx`
2. **Buat** `src/minigames/Ipa7B3T2Game.jsx`
3. **Buat** `src/minigames/Ipa7B3T3Game.jsx`
4. **Ubah** `src/App.jsx` — ganti 3 placeholder ipa7b3t1–ipa7b3t3 dengan lazy import.

## Checklist
- [ ] 3 game berjalan tanpa error
- [ ] Rumus konversi ada sebagai komentar di kode Ipa7B3T2Game
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
