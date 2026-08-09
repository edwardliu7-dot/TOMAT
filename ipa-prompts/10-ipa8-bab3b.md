# Prompt 10 — IPA Kelas 8 BAB 3 Part B: Pernapasan & Ekskresi — TP 5–7

## Prasyarat
Prompt 09 selesai (TP 1–4). Prompt ini mengerjakan TP 5–7.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
// addReward({ coins: 15, exp: 10 }) hanya saat benar
```

---

## Game 1 — `ipa8b3t5`: Nephron Urine Factory

**File:** `src/minigames/Ipa8B3T5Game.jsx`  
**Tema:** kuning (`#ca8a04`), background `#0f0a00 → #1e1400`

**Proses pembentukan urin (wajib sebagai komentar di kode):**
```
1. Filtrasi   → di Glomerulus/Kapsul Bowman → urin primer
2. Reabsorpsi → di Tubulus Kontortus Proksimal (TKP) → urin sekunder
3. Augmentasi → di Tubulus Kontortus Distal (TKD) → urin sejati
```

```js
const SOAL = [
  { teks: 'Proses pembentukan urin yang pertama terjadi di...', benar: 'Glomerulus — filtrasi darah menghasilkan urin primer', salah: ['Tubulus kontortus proksimal', 'Tubulus kontortus distal', 'Pelvis ginjal'] },
  { teks: 'Urin primer mengandung zat yang SAMA dengan plasma darah KECUALI...', benar: 'Protein dan sel darah (tidak dapat melewati filter glomerulus)', salah: ['Glukosa dan asam amino', 'Air dan garam mineral', 'Urea dan kreatinin'] },
  { teks: 'Proses reabsorpsi (penyerapan kembali) zat berguna terjadi di...', benar: 'Tubulus kontortus proksimal (TKP)', salah: ['Glomerulus', 'Kapsul Bowman', 'Pelvis ginjal'] },
  { teks: 'Zat yang direabsorpsi kembali ke darah pada proses reabsorpsi adalah...', benar: 'Glukosa, asam amino, air, dan ion mineral', salah: ['Urea dan kreatinin', 'Semua zat dalam urin primer', 'Hanya air saja'] },
  { teks: 'Proses augmentasi (penambahan zat sisa) terjadi di...', benar: 'Tubulus kontortus distal (TKD)', salah: ['Glomerulus', 'Tubulus kontortus proksimal', 'Kapsul Bowman'] },
  { teks: 'Hasil akhir dari ketiga proses filtrasi, reabsorpsi, dan augmentasi adalah...', benar: 'Urin sejati yang dialirkan ke pelvis ginjal lalu ureter', salah: ['Urin primer', 'Plasma darah bersih', 'Empedu'] },
  { teks: 'Zat sisa utama yang dikeluarkan melalui urin adalah...', benar: 'Urea (hasil pemecahan protein)', salah: ['CO₂', 'Empedu', 'Glukosa'] },
  { teks: 'Seseorang minum banyak air, urinnya akan...', benar: 'Lebih banyak dan lebih encer (warna pucat)', salah: ['Lebih sedikit dan pekat', 'Tetap sama', 'Berwarna lebih gelap'] },
  { teks: 'Hormon ADH (antidiuretik) berfungsi untuk...', benar: 'Meningkatkan reabsorpsi air di tubulus sehingga urin lebih sedikit dan pekat', salah: ['Meningkatkan filtrasi di glomerulus', 'Mengurangi produksi urin primer', 'Mempercepat augmentasi'] },
  { teks: 'Kehadiran glukosa dalam urin (glukosuria) menandakan...', benar: 'Kemungkinan diabetes melitus (gula darah terlalu tinggi)', salah: ['Kondisi normal setelah makan', 'Ginjal terlalu aktif', 'Kekurangan protein'] },
]
```

---

## Game 2 — `ipa8b3t6`: Medical Case Analyzer

**File:** `src/minigames/Ipa8B3T6Game.jsx`  
**Tema:** merah medis (`#dc2626`), background `#1a0000 → #2d0808`

```js
const SOAL = [
  { teks: 'Penyakit saluran pernapasan yang ditandai penyempitan bronkus dan sesak napas adalah...', benar: 'Asma', salah: ['Pneumonia', 'TBC', 'Sinusitis'] },
  { teks: 'Pneumonia adalah infeksi yang menyebabkan peradangan pada...', benar: 'Alveolus paru-paru (paru-paru berisi cairan)', salah: ['Bronkus', 'Trakea', 'Laring'] },
  { teks: 'TBC (Tuberkulosis) disebabkan oleh bakteri...', benar: 'Mycobacterium tuberculosis', salah: ['Streptococcus', 'Staphylococcus', 'E. coli'] },
  { teks: 'Cara pencegahan TBC yang paling efektif pada bayi adalah...', benar: 'Vaksin BCG', salah: ['Antibiotik rutin', 'Memakai masker saja', 'Minum vitamin C'] },
  { teks: 'Batu ginjal terbentuk dari...', benar: 'Penumpukan mineral (kalsium, oksalat) yang mengkristal di ginjal', salah: ['Bakteri yang menumpuk', 'Protein yang mengendap', 'Sel darah merah yang mati'] },
  { teks: 'Nefritis adalah penyakit ginjal berupa...', benar: 'Peradangan pada nefron akibat infeksi atau reaksi imun', salah: ['Penumpukan batu ginjal', 'Gagal ginjal total', 'Kanker ginjal'] },
  { teks: 'Penyakit gagal ginjal memerlukan terapi...', benar: 'Cuci darah (hemodialisis) atau transplantasi ginjal', salah: ['Operasi usus buntu', 'Transfusi darah rutin', 'Konsumsi vitamin D saja'] },
  { teks: 'Bronkitis adalah peradangan pada...', benar: 'Bronkus (saluran udara menuju paru-paru)', salah: ['Alveolus', 'Trakea', 'Laring'] },
  { teks: 'Faktor risiko utama penyakit paru-paru adalah...', benar: 'Merokok', salah: ['Terlalu banyak olahraga', 'Konsumsi protein berlebih', 'Tidur terlalu lama'] },
  { teks: 'Albuminuria (protein dalam urin) menandakan kerusakan pada...', benar: 'Membran glomerulus yang bocor sehingga protein ikut tersaring', salah: ['Kerusakan usus halus', 'Kelebihan protein dalam makanan', 'Hati yang tidak berfungsi'] },
]
```

---

## Game 3 — `ipa8b3t7`: Healthy Habit Choice

**File:** `src/minigames/Ipa8B3T7Game.jsx`  
**Tema:** hijau segar (`#16a34a`), background `#021008 → #041a10`

```js
const SOAL = [
  { teks: 'Kebiasaan yang paling merusak sistem pernapasan adalah...', benar: 'Merokok', salah: ['Olahraga berlebihan', 'Minum air putih banyak', 'Tidur cukup'] },
  { teks: 'Cara menjaga kesehatan paru-paru yang benar adalah...', benar: 'Tidak merokok, olahraga teratur, hindari polusi udara', salah: ['Menghirup uap menthol setiap hari', 'Minum banyak kopi', 'Menghindari semua aktivitas fisik'] },
  { teks: 'Minum air putih yang cukup (2 liter/hari) bermanfaat bagi ginjal karena...', benar: 'Melancarkan pembentukan urin dan mencegah batu ginjal', salah: ['Meningkatkan tekanan darah', 'Membuat ginjal bekerja lebih keras', 'Mengurangi produksi urin'] },
  { teks: 'Pola makan yang baik untuk kesehatan ginjal adalah...', benar: 'Kurangi garam berlebih, hindari makanan tinggi oksalat, cukup protein', salah: ['Makan daging sebanyak-banyaknya', 'Hindari semua buah dan sayuran', 'Konsumsi suplemen kalsium dosis tinggi tanpa saran dokter'] },
  { teks: 'Penggunaan masker saat berada di tempat berpolusi bermanfaat untuk...', benar: 'Menyaring partikel debu dan polutan sebelum masuk ke saluran napas', salah: ['Menghasilkan oksigen ekstra', 'Meningkatkan kapasitas paru-paru', 'Mengurangi produksi CO₂'] },
  { teks: 'Olahraga aerobik rutin bermanfaat bagi sistem pernapasan karena...', benar: 'Melatih kapasitas paru-paru dan efisiensi pertukaran gas', salah: ['Mengurangi jumlah alveolus', 'Membuat pernapasan lebih lambat saat istirahat', 'Meningkatkan produksi lendir'] },
  { teks: 'Kebiasaan buruk yang dapat merusak ginjal dalam jangka panjang adalah...', benar: 'Sering menahan kencing, konsumsi obat pereda nyeri berlebihan, minum sedikit air', salah: ['Olahraga lari pagi', 'Makan sayuran hijau', 'Tidur miring ke kanan'] },
  { teks: 'Efek langsung merokok pada sistem pernapasan adalah...', benar: 'Kerusakan silia, produksi lendir berlebih, penyempitan bronkus', salah: ['Meningkatkan kapasitas paru-paru', 'Memperkuat diafragma', 'Mengurangi produksi CO₂'] },
  { teks: 'Mengonsumsi makanan tinggi antioksidan (buah beri, sayuran hijau) bermanfaat karena...', benar: 'Melindungi sel-sel organ dari kerusakan akibat radikal bebas', salah: ['Langsung membunuh bakteri di paru-paru', 'Menggantikan fungsi ginjal', 'Meningkatkan produksi urin'] },
  { teks: 'Tidur yang cukup (7–9 jam) penting untuk sistem ekskresi karena...', benar: 'Tubuh melakukan perbaikan sel dan detoksifikasi saat tidur', salah: ['Ginjal berhenti bekerja saat tidur', 'Produksi urin meningkat saat tidur', 'Hati tidak aktif saat tidur'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa8B3T5Game.jsx` – `Ipa8B3T7Game.jsx` (3 file)
2. **Ubah** `src/App.jsx` — ganti 3 placeholder ipa8b3t5–ipa8b3t7 dengan lazy import.

## Checklist
- [ ] 3 game berjalan tanpa error
- [ ] Rumus proses urin ada sebagai komentar di Ipa8B3T5Game
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
