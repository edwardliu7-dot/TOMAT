# Prompt 08 — IPA Kelas 8 BAB 2 Part B: Peredaran Darah — TP 5–8

## Prasyarat
Prompt 07 selesai (TP 1–4). Prompt ini mengerjakan TP 5–8.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
// addReward({ coins: 15, exp: 10 }) hanya saat benar
```

---

## Game 1 — `ipa8b2t5`: Circulatory System Navigator

**File:** `src/minigames/Ipa8B2T5Game.jsx`  
**Tema:** merah (`#ef4444`), background `#1a0000 → #2d0808`

```js
const SOAL = [
  { teks: 'Peredaran darah besar (sistemik) mengalirkan darah dari...', benar: 'Jantung → seluruh tubuh → kembali ke jantung', salah: ['Jantung → paru-paru → kembali ke jantung', 'Paru-paru → otak → kembali ke jantung', 'Ginjal → hati → kembali ke jantung'] },
  { teks: 'Peredaran darah kecil (pulmonal) mengalirkan darah dari...', benar: 'Jantung → paru-paru → kembali ke jantung', salah: ['Jantung → seluruh tubuh → kembali ke jantung', 'Paru-paru → ginjal → jantung', 'Otak → jantung → paru-paru'] },
  { teks: 'Pembuluh darah yang membawa darah KELUAR dari jantung disebut...', benar: 'Arteri (pembuluh nadi)', salah: ['Vena (pembuluh balik)', 'Kapiler', 'Vena cava'] },
  { teks: 'Pembuluh darah yang membawa darah KEMBALI ke jantung disebut...', benar: 'Vena (pembuluh balik)', salah: ['Arteri', 'Kapiler', 'Aorta'] },
  { teks: 'Bilik kiri (ventrikel kiri) jantung memompa darah ke...', benar: 'Seluruh tubuh melalui aorta (peredaran besar)', salah: ['Paru-paru', 'Bilik kanan', 'Ginjal saja'] },
  { teks: 'Bilik kanan (ventrikel kanan) jantung memompa darah ke...', benar: 'Paru-paru melalui arteri pulmonalis (peredaran kecil)', salah: ['Seluruh tubuh', 'Otak', 'Serambi kiri'] },
  { teks: 'Darah yang kaya oksigen (O₂) berwarna...', benar: 'Merah terang', salah: ['Merah tua', 'Biru', 'Hitam'] },
  { teks: 'Kapiler darah berfungsi sebagai...', benar: 'Tempat pertukaran O₂, CO₂, nutrisi, dan zat sisa antar darah dan jaringan', salah: ['Memompa darah', 'Menyimpan darah ekstra', 'Menghasilkan sel darah'] },
  { teks: 'Arteri yang membawa darah KAYA CO₂ (darah kotor) dari jantung ke paru-paru disebut...', benar: 'Arteri pulmonalis', salah: ['Aorta', 'Vena kava', 'Vena pulmonalis'] },
  { teks: 'Vena yang membawa darah KAYA O₂ dari paru-paru ke jantung disebut...', benar: 'Vena pulmonalis', salah: ['Arteri pulmonalis', 'Aorta', 'Vena kava'] },
]
```

---

## Game 2 — `ipa8b2t6`: Blood Component Defender

**File:** `src/minigames/Ipa8B2T6Game.jsx`  
**Tema:** merah gelap (`#b91c1c`), background `#150000 → #250808`

```js
const SOAL = [
  { teks: 'Komponen darah yang berfungsi mengangkut oksigen ke seluruh tubuh adalah...', benar: 'Eritrosit (sel darah merah)', salah: ['Leukosit', 'Trombosit', 'Plasma darah'] },
  { teks: 'Protein pada eritrosit yang mengikat oksigen disebut...', benar: 'Hemoglobin', salah: ['Albumin', 'Fibrinogen', 'Immunoglobulin'] },
  { teks: 'Leukosit (sel darah putih) berfungsi untuk...', benar: 'Melindungi tubuh dari infeksi (sistem imun)', salah: ['Mengangkut oksigen', 'Pembekuan darah', 'Mengangkut nutrisi'] },
  { teks: 'Trombosit (keping darah) berperan dalam...', benar: 'Pembekuan darah saat ada luka', salah: ['Mengangkut oksigen', 'Melawan bakteri', 'Mengangkut CO₂'] },
  { teks: 'Bagian darah yang cair dan berwarna kekuningan disebut...', benar: 'Plasma darah', salah: ['Serum', 'Eritrosit', 'Hemoglobin'] },
  { teks: 'Plasma darah mengandung...', benar: 'Air, protein (albumin, globulin, fibrinogen), glukosa, hormon, mineral', salah: ['Hanya air saja', 'Sel darah merah saja', 'Oksigen saja'] },
  { teks: 'Orang yang kekurangan eritrosit/hemoglobin akan mengalami...', benar: 'Anemia (kurang darah — mudah lelah, pucat)', salah: ['Leukemia', 'Hipertensi', 'Diabetes'] },
  { teks: 'Sel darah yang paling banyak jumlahnya dalam darah manusia adalah...', benar: 'Eritrosit (sekitar 5 juta per mm³)', salah: ['Leukosit', 'Trombosit', 'Monosit'] },
  { teks: 'Tempat produksi sel-sel darah pada orang dewasa adalah...', benar: 'Sumsum tulang merah', salah: ['Hati', 'Limpa', 'Paru-paru'] },
  { teks: 'Fibrinogen dalam plasma darah berfungsi untuk...', benar: 'Membentuk fibrin yang menutup luka (proses pembekuan darah)', salah: ['Mengangkut oksigen', 'Melawan infeksi', 'Mengatur suhu darah'] },
]
```

---

## Game 3 — `ipa8b2t7`: Blood Transfusion Match

**File:** `src/minigames/Ipa8B2T7Game.jsx`  
**Tema:** merah-ungu (`#9f1239`), background `#120008 → #200010`

```js
const SOAL = [
  { teks: 'Golongan darah yang disebut "donor universal" (bisa mendonor ke semua golongan) adalah...', benar: 'Golongan darah O', salah: ['Golongan darah A', 'Golongan darah B', 'Golongan darah AB'] },
  { teks: 'Golongan darah yang disebut "resipien universal" (bisa menerima dari semua golongan) adalah...', benar: 'Golongan darah AB', salah: ['Golongan darah O', 'Golongan darah A', 'Golongan darah B'] },
  { teks: 'Golongan darah A memiliki...', benar: 'Antigen A di eritrosit, antibodi anti-B di plasma', salah: ['Antigen B, antibodi anti-A', 'Antigen A dan B, tanpa antibodi', 'Tidak ada antigen, ada anti-A dan anti-B'] },
  { teks: 'Golongan darah B memiliki...', benar: 'Antigen B di eritrosit, antibodi anti-A di plasma', salah: ['Antigen A, antibodi anti-B', 'Antigen A dan B, tanpa antibodi', 'Tidak ada antigen'] },
  { teks: 'Seseorang bergolongan darah O ingin menerima transfusi. Golongan darah donor yang aman adalah...', benar: 'Hanya golongan darah O', salah: ['A, B, AB, dan O semuanya', 'A dan O saja', 'AB saja'] },
  { teks: 'Faktor Rhesus (Rh) positif artinya...', benar: 'Darah memiliki antigen Rh di permukaan eritrosit', salah: ['Darah memiliki antibodi Rh', 'Darah berwarna lebih merah', 'Golongan darah lebih langka'] },
  { teks: 'Bahaya transfusi darah yang tidak sesuai golongan adalah...', benar: 'Aglutinasi (penggumpalan darah) yang bisa berakibat fatal', salah: ['Darah menjadi encer', 'Tekanan darah naik drastis', 'Warna kulit berubah'] },
  { teks: 'Ibu Rh− mengandung janin Rh+. Bahaya yang mungkin terjadi pada kehamilan berikutnya adalah...', benar: 'Eritroblastosis fetalis — antibodi ibu menyerang darah janin', salah: ['Bayi lahir prematur', 'Ibu mengalami anemia berat', 'Tidak ada bahaya sama sekali'] },
  { teks: 'Sistem penggolongan darah ABO ditemukan oleh...', benar: 'Karl Landsteiner (1901)', salah: ['Louis Pasteur', 'Robert Koch', 'Alexander Fleming'] },
  { teks: 'Golongan darah AB dapat menerima transfusi dari golongan darah...', benar: 'A, B, AB, dan O (semua golongan)', salah: ['Hanya AB saja', 'A dan B saja', 'Hanya O saja'] },
]
```

---

## Game 4 — `ipa8b2t8`: Cardiovascular Healthy Life

**File:** `src/minigames/Ipa8B2T8Game.jsx`  
**Tema:** pink-merah (`#f43f5e`), background `#15000a → #250010`

```js
const SOAL = [
  { teks: 'Penyakit akibat pengerasan dan penyempitan pembuluh darah karena plak kolesterol disebut...', benar: 'Aterosklerosis', salah: ['Hipertensi', 'Anemia', 'Leukemia'] },
  { teks: 'Tekanan darah normal orang dewasa adalah...', benar: '120/80 mmHg (sistolik/diastolik)', salah: ['80/120 mmHg', '160/100 mmHg', '90/60 mmHg (normal)'] },
  { teks: 'Hipertensi (tekanan darah tinggi) dapat menyebabkan...', benar: 'Stroke, serangan jantung, dan kerusakan ginjal', salah: ['Anemia', 'Diabetes tipe 1', 'Gangguan pencernaan'] },
  { teks: 'Kebiasaan yang MENINGKATKAN risiko penyakit jantung adalah...', benar: 'Merokok, konsumsi lemak jenuh berlebih, kurang gerak', salah: ['Olahraga rutin', 'Konsumsi buah dan sayuran', 'Tidur cukup'] },
  { teks: 'Anemia terjadi karena...', benar: 'Kekurangan sel darah merah atau hemoglobin', salah: ['Terlalu banyak sel darah putih', 'Tekanan darah terlalu tinggi', 'Kelebihan trombosit'] },
  { teks: 'Leukemia adalah penyakit kanker yang menyerang...', benar: 'Sel darah putih (produksi leukosit tidak terkendali)', salah: ['Sel darah merah', 'Trombosit', 'Plasma darah'] },
  { teks: 'Cara menjaga kesehatan sistem peredaran darah yang paling efektif adalah...', benar: 'Olahraga rutin, diet seimbang, tidak merokok, kelola stres', salah: ['Minum suplemen saja tanpa olahraga', 'Tidur lebih dari 12 jam', 'Menghindari semua makanan berlemak'] },
  { teks: 'Varises adalah pelebaran pembuluh...', benar: 'Vena (pembuluh balik), biasanya di kaki', salah: ['Arteri', 'Kapiler', 'Aorta'] },
  { teks: 'Hemofilia adalah kelainan darah di mana...', benar: 'Darah sulit membeku karena kekurangan faktor pembekuan', salah: ['Darah terlalu kental', 'Sel darah merah berbentuk tidak normal', 'Terlalu banyak sel darah putih'] },
  { teks: 'Olahraga aerobik (lari, renang, bersepeda) bermanfaat bagi jantung karena...', benar: 'Memperkuat otot jantung dan melancarkan sirkulasi darah', salah: ['Menambah jumlah trombosit', 'Membuat darah lebih encer', 'Meningkatkan tekanan darah'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa8B2T5Game.jsx` – `Ipa8B2T8Game.jsx` (4 file)
2. **Ubah** `src/App.jsx` — ganti 4 placeholder ipa8b2t5–ipa8b2t8 dengan lazy import.

## Checklist
- [ ] 4 game berjalan tanpa error
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
