# Prompt 07 — IPA Kelas 8 BAB 2 Part A: Pencernaan & Peredaran Darah — TP 1–4

## Prasyarat
Prompt 00 selesai. Key ipa8b2t1–ipa8b2t8 terdaftar. Prompt ini mengerjakan TP 1–4.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
// addReward({ coins: 15, exp: 10 }) hanya saat benar
```

Tema: variasi **merah-oranye** (sistem pencernaan & darah).

---

## Game 1 — `ipa8b2t1`: Nutritional Plate Balance

**File:** `src/minigames/Ipa8B2T1Game.jsx`  
**Tema:** hijau segar (`#22c55e`), background `#021008 → #041a10`

```js
const SOAL = [
  { teks: 'Zat makanan yang menjadi sumber energi utama tubuh adalah...', benar: 'Karbohidrat', salah: ['Protein', 'Vitamin', 'Mineral'] },
  { teks: 'Protein berfungsi utama untuk...', benar: 'Pertumbuhan dan perbaikan jaringan tubuh', salah: ['Sumber energi utama', 'Mengatur kadar air', 'Melarutkan vitamin'] },
  { teks: 'Vitamin yang larut dalam lemak adalah...', benar: 'Vitamin A, D, E, dan K', salah: ['Vitamin B dan C', 'Vitamin B12 saja', 'Semua vitamin larut dalam lemak'] },
  { teks: 'Mineral kalsium (Ca) penting untuk...', benar: 'Pembentukan tulang dan gigi, serta kontraksi otot', salah: ['Menghasilkan energi', 'Membentuk hemoglobin', 'Melarutkan lemak'] },
  { teks: 'Fungsi lemak dalam tubuh adalah...', benar: 'Cadangan energi, melindungi organ, dan melarutkan vitamin A, D, E, K', salah: ['Sumber energi utama sehari-hari', 'Membentuk antibodi', 'Mengatur suhu tubuh saja'] },
  { teks: 'Kekurangan vitamin C dapat menyebabkan penyakit...', benar: 'Skorbut (gusi berdarah, kulit mudah memar)', salah: ['Rakitis', 'Beri-beri', 'Anemia'] },
  { teks: 'Mineral zat besi (Fe) diperlukan untuk...', benar: 'Pembentukan hemoglobin (protein pengangkut oksigen dalam darah)', salah: ['Pertumbuhan tulang', 'Produksi energi langsung', 'Melarutkan vitamin'] },
  { teks: 'Air berperan dalam tubuh sebagai...', benar: 'Pelarut zat, pengatur suhu, media transportasi, dan pelumas sendi', salah: ['Sumber energi utama', 'Pembentuk tulang', 'Penghasil vitamin'] },
  { teks: 'Karbohidrat sederhana (gula) lebih cepat memberikan energi dibanding karbohidrat kompleks (nasi) karena...', benar: 'Karbohidrat sederhana lebih cepat dipecah dan diserap', salah: ['Karbohidrat sederhana lebih berat', 'Gula mengandung lebih banyak kalori', 'Tidak ada perbedaan kecepatan'] },
  { teks: 'Kekurangan protein pada anak-anak dapat menyebabkan...', benar: 'Kwashiorkor (perut buncit, pertumbuhan terhambat)', salah: ['Diabetes', 'Anemia berat', 'Buta warna'] },
]
```

---

## Game 2 — `ipa8b2t2`: Virtual Food Reagent Test

**File:** `src/minigames/Ipa8B2T2Game.jsx`  
**Tema:** ungu (`#7c3aed`), background `#080010 → #100820`

```js
const SOAL = [
  { teks: 'Reagen Lugol (larutan iodin) digunakan untuk menguji adanya...', benar: 'Amilum (pati/karbohidrat kompleks)', salah: ['Protein', 'Glukosa', 'Lemak'] },
  { teks: 'Hasil positif uji Lugol pada bahan makanan ditandai dengan perubahan warna menjadi...', benar: 'Biru kehitaman/ungu tua', salah: ['Merah bata', 'Kuning', 'Hijau'] },
  { teks: 'Reagen Biuret digunakan untuk menguji adanya...', benar: 'Protein', salah: ['Amilum', 'Glukosa', 'Lemak'] },
  { teks: 'Hasil positif uji Biuret ditandai dengan perubahan warna menjadi...', benar: 'Ungu/violet', salah: ['Biru kehitaman', 'Merah bata', 'Oranye'] },
  { teks: 'Reagen Benedict digunakan untuk menguji adanya...', benar: 'Glukosa (gula pereduksi)', salah: ['Protein', 'Amilum', 'Lemak'] },
  { teks: 'Hasil positif uji Benedict setelah dipanaskan ditandai dengan perubahan warna menjadi...', benar: 'Merah bata (oranye-merah)', salah: ['Ungu', 'Biru kehitaman', 'Hijau'] },
  { teks: 'Untuk menguji kandungan lemak pada bahan makanan, cara yang dilakukan adalah...', benar: 'Mengoles bahan pada kertas, jika transparan/berminyak = mengandung lemak', salah: ['Meneteskan Lugol', 'Memanaskan dengan Benedict', 'Menambahkan Biuret'] },
  { teks: 'Beras mengandung amilum. Saat ditetesi Lugol, warnanya berubah menjadi...', benar: 'Biru kehitaman (positif amilum)', salah: ['Merah', 'Tidak berubah', 'Kuning'] },
  { teks: 'Putih telur mengandung protein. Saat ditambah Biuret, warnanya berubah menjadi...', benar: 'Ungu (positif protein)', salah: ['Biru kehitaman', 'Merah bata', 'Tidak berubah'] },
  { teks: 'Mengapa uji Benedict perlu dipanaskan?', benar: 'Reaksi kimia antara Benedict dan glukosa memerlukan panas untuk berlangsung', salah: ['Agar warnanya lebih jelas dilihat', 'Agar reagen tidak berbahaya', 'Untuk menghancurkan lemak'] },
]
```

---

## Game 3 — `ipa8b2t3`: Digestive Track Runner

**File:** `src/minigames/Ipa8B2T3Game.jsx`  
**Tema:** oranye (`#f97316`), background `#1a0800 → #2d1200`

```js
const SOAL = [
  { teks: 'Urutan organ saluran pencernaan yang benar adalah...', benar: 'Mulut → Kerongkongan → Lambung → Usus halus → Usus besar → Rektum → Anus', salah: ['Mulut → Lambung → Kerongkongan → Usus halus → Anus', 'Mulut → Usus halus → Lambung → Usus besar → Anus', 'Mulut → Usus besar → Usus halus → Lambung → Anus'] },
  { teks: 'Enzim ptialin (amilase) dalam air liur berfungsi untuk...', benar: 'Mengubah amilum (pati) menjadi maltosa', salah: ['Memecah protein', 'Mencerna lemak', 'Membunuh kuman'] },
  { teks: 'Gerak meremas-remas makanan di kerongkongan menuju lambung disebut...', benar: 'Gerak peristaltik', salah: ['Gerak segmentasi', 'Gerak pengunyahan', 'Gerak refleks'] },
  { teks: 'Lambung menghasilkan asam klorida (HCl) yang berfungsi untuk...', benar: 'Membunuh kuman dan mengaktifkan enzim pepsin', salah: ['Mencerna karbohidrat', 'Menyerap sari makanan', 'Menghasilkan empedu'] },
  { teks: 'Penyerapan sari makanan terjadi di...', benar: 'Usus halus (terutama di vili-vili usus)', salah: ['Lambung', 'Usus besar', 'Kerongkongan'] },
  { teks: 'Fungsi utama usus besar adalah...', benar: 'Menyerap air dan membentuk feses', salah: ['Menyerap protein', 'Mencerna lemak', 'Menghasilkan enzim pencernaan'] },
  { teks: 'Cairan empedu dihasilkan oleh hati dan disimpan di...', benar: 'Kantong empedu', salah: ['Pankreas', 'Lambung', 'Usus halus'] },
  { teks: 'Fungsi empedu dalam pencernaan adalah...', benar: 'Mengemulsikan (memecah) lemak menjadi partikel kecil', salah: ['Mencerna protein', 'Mengubah pati menjadi gula', 'Membunuh bakteri jahat'] },
  { teks: 'Pankreas menghasilkan enzim yang mencerna...', benar: 'Karbohidrat, protein, dan lemak (tiga sekaligus)', salah: ['Hanya protein', 'Hanya lemak', 'Hanya karbohidrat'] },
  { teks: 'Vili (jonjot usus) berfungsi untuk...', benar: 'Memperluas permukaan penyerapan di usus halus', salah: ['Menghasilkan enzim', 'Menghancurkan makanan secara mekanik', 'Mengalirkan empedu'] },
]
```

---

## Game 4 — `ipa8b2t4`: Digestive Hospital Clinic

**File:** `src/minigames/Ipa8B2T4Game.jsx`  
**Tema:** merah medis (`#dc2626`), background `#1a0000 → #2d0808`

```js
const SOAL = [
  { teks: 'Penyakit radang pada lapisan lambung yang menyebabkan nyeri ulu hati adalah...', benar: 'Gastritis (maag)', salah: ['Apendisitis', 'Diare', 'Konstipasi'] },
  { teks: 'Apendisitis adalah peradangan pada...', benar: 'Usus buntu (apendiks)', salah: ['Lambung', 'Usus besar', 'Hati'] },
  { teks: 'Diare terjadi karena...', benar: 'Usus besar menyerap terlalu sedikit air sehingga feses encer', salah: ['Usus besar menyerap terlalu banyak air', 'Lambung tidak menghasilkan asam', 'Pankreas tidak berfungsi'] },
  { teks: 'Konstipasi (sembelit) terjadi karena...', benar: 'Usus besar menyerap terlalu banyak air, feses keras dan sulit dikeluarkan', salah: ['Terlalu banyak minum air', 'Lambung bekerja terlalu cepat', 'Usus halus tersumbat'] },
  { teks: 'Cara mencegah konstipasi yang efektif adalah...', benar: 'Mengonsumsi makanan berserat tinggi dan minum air yang cukup', salah: ['Menghindari buah dan sayuran', 'Makan lebih sedikit', 'Banyak mengonsumsi daging'] },
  { teks: 'Tukak lambung (ulkus peptikum) disebabkan oleh...', benar: 'Luka pada dinding lambung, sering dipicu bakteri H. pylori dan stres', salah: ['Terlalu banyak makan sayuran', 'Kekurangan vitamin C', 'Alergi gluten'] },
  { teks: 'Penyakit kuning (jaundice) terjadi akibat gangguan pada...', benar: 'Hati (liver) yang tidak mampu memproses bilirubin dengan baik', salah: ['Lambung', 'Usus halus', 'Pankreas'] },
  { teks: 'Gejala utama apendisitis adalah...', benar: 'Nyeri perut kanan bawah yang hebat', salah: ['Muntah darah', 'Diare terus-menerus', 'Perut kembung di kiri atas'] },
  { teks: 'Pencegahan penyakit pencernaan yang paling umum dilakukan adalah...', benar: 'Mencuci tangan sebelum makan, makan makanan bersih dan bergizi', salah: ['Tidak pernah makan daging', 'Minum jamu setiap hari', 'Menghindari semua lemak'] },
  { teks: 'Penyakit celiac adalah kondisi di mana penderita tidak dapat mencerna...', benar: 'Gluten (protein dalam gandum, barley, rye)', salah: ['Laktosa (gula susu)', 'Fruktosa (gula buah)', 'Semua jenis protein'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa8B2T1Game.jsx` – `Ipa8B2T4Game.jsx` (4 file)
2. **Ubah** `src/App.jsx` — ganti 4 placeholder ipa8b2t1–ipa8b2t4 dengan lazy import.

## Checklist
- [ ] 4 game berjalan tanpa error
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
