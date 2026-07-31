# Prompt 06 — IPA Kelas 8 BAB 1: Pengenalan Sel (5 Game)

## Prasyarat
Prompt 00 selesai. Key `ipa8b1t1`–`ipa8b1t5` terdaftar di App.jsx sebagai IpaGamePlaceholder.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
// addReward({ coins: 15, exp: 10 }) hanya saat benar
```

Tema warna kelas 8: **biru** (`#3b82f6`). Tiap game boleh variasi shade.

---

## Game 1 — `ipa8b1t1`: History Timeline Puzzle

**File:** `src/minigames/Ipa8B1T1Game.jsx`  
**TP:** Sejarah penemuan mikroskop  
**Tema:** biru tua (`#1d4ed8`), background `#020d1a → #041830`

```js
const SOAL = [
  { teks: 'Ilmuwan yang pertama kali menyebut ruangan kecil pada gabus sebagai "sel" adalah...', benar: 'Robert Hooke (1665)', salah: ['Antonie van Leeuwenhoek', 'Matthias Schleiden', 'Theodor Schwann'] },
  { teks: 'Antonie van Leeuwenhoek dikenal sebagai "Bapak Mikrobiologi" karena...', benar: 'Pertama kali mengamati mikroorganisme hidup dengan mikroskop buatannya', salah: ['Menemukan DNA sel', 'Membuat teori sel modern', 'Menciptakan vaksin pertama'] },
  { teks: 'Teori bahwa semua tumbuhan tersusun atas sel dikemukakan oleh...', benar: 'Matthias Schleiden (1838)', salah: ['Robert Hooke', 'Rudolf Virchow', 'Charles Darwin'] },
  { teks: 'Teori bahwa semua hewan tersusun atas sel dikemukakan oleh...', benar: 'Theodor Schwann (1839)', salah: ['Matthias Schleiden', 'Robert Hooke', 'Louis Pasteur'] },
  { teks: 'Prinsip "semua sel berasal dari sel sebelumnya" dikemukakan oleh...', benar: 'Rudolf Virchow (1855)', salah: ['Robert Hooke', 'Antonie van Leeuwenhoek', 'Gregor Mendel'] },
  { teks: 'Urutan penemuan yang benar: Robert Hooke mengamati sel gabus → ...', benar: 'Van Leeuwenhoek amati bakteri → Schleiden (tumbuhan) → Schwann (hewan) → Virchow', salah: ['Virchow dulu, baru Hooke', 'Schwann dulu, baru Schleiden', 'Mendel dulu, baru Hooke'] },
  { teks: 'Mikroskop optik pertama yang digunakan Robert Hooke menggunakan...', benar: 'Cahaya tampak dan lensa kaca', salah: ['Sinar elektron', 'Gelombang radio', 'Sinar ultraviolet'] },
  { teks: 'Spesiemen (bahan pengamatan) yang digunakan Robert Hooke untuk menemukan sel adalah...', benar: 'Gabus (kulit kayu ek)', salah: ['Daun tumbuhan', 'Bakteri', 'Sel darah merah'] },
  { teks: 'Teori sel modern terdiri dari 3 prinsip. Yang BUKAN prinsip teori sel adalah...', benar: 'Sel dapat diciptakan dari bahan anorganik', salah: ['Semua makhluk hidup tersusun atas sel', 'Sel adalah unit dasar kehidupan', 'Semua sel berasal dari sel yang sudah ada'] },
  { teks: 'Ilmuwan yang mengembangkan mikroskop dengan perbesaran hingga 270× pada abad ke-17 adalah...', benar: 'Antonie van Leeuwenhoek', salah: ['Robert Hooke', 'Isaac Newton', 'Galileo Galilei'] },
]
```

---

## Game 2 — `ipa8b1t2`: Microscope Selector

**File:** `src/minigames/Ipa8B1T2Game.jsx`  
**TP:** Jenis-jenis mikroskop  
**Tema:** biru cerah (`#3b82f6`), background `#030d1a → #051828`

```js
const SOAL = [
  { teks: 'Mikroskop yang menggunakan cahaya tampak dan lensa kaca untuk memperbesar gambar disebut...', benar: 'Mikroskop cahaya (optik)', salah: ['Mikroskop elektron SEM', 'Mikroskop elektron TEM', 'Mikroskop stereo 3D'] },
  { teks: 'Perbedaan mikroskop monokuler dan binokuler adalah...', benar: 'Monokuler: 1 lensa okuler; Binokuler: 2 lensa okuler', salah: ['Monokuler lebih mahal', 'Binokuler hanya untuk bakteri', 'Keduanya sama persis'] },
  { teks: 'Untuk mengamati struktur internal (penampang dalam) suatu sel secara detail, digunakan...', benar: 'Mikroskop elektron transmisi (TEM)', salah: ['Mikroskop cahaya', 'Mikroskop SEM', 'Lup/kaca pembesar'] },
  { teks: 'Untuk mengamati permukaan luar sel atau organisme kecil secara tiga dimensi, digunakan...', benar: 'Mikroskop elektron pemindai (SEM)', salah: ['Mikroskop TEM', 'Mikroskop cahaya biasa', 'Kamera makro'] },
  { teks: 'Perbesaran total mikroskop cahaya = lensa objektif × lensa okuler. Jika objektif 40× dan okuler 10×, perbesaran total = ?', benar: '400×', salah: ['50×', '4×', '4000×'] },
  { teks: 'Keunggulan mikroskop elektron dibanding mikroskop cahaya adalah...', benar: 'Resolusi jauh lebih tinggi, bisa melihat organel sangat kecil', salah: ['Lebih murah dan mudah digunakan', 'Bisa digunakan untuk benda hidup', 'Tidak memerlukan persiapan spesimen'] },
  { teks: 'Lensa yang berada dekat dengan mata pengamat pada mikroskop cahaya disebut...', benar: 'Lensa okuler', salah: ['Lensa objektif', 'Kondensor', 'Diafragma'] },
  { teks: 'Lensa yang berada dekat dengan objek/preparat yang diamati disebut...', benar: 'Lensa objektif', salah: ['Lensa okuler', 'Reflektor', 'Revolver'] },
  { teks: 'Fungsi diafragma pada mikroskop adalah...', benar: 'Mengatur jumlah cahaya yang masuk ke lensa', salah: ['Memperbesar gambar', 'Menggerakkan preparat', 'Menjaga preparat tetap bersih'] },
  { teks: 'Mikroskop elektron TIDAK bisa digunakan untuk mengamati...', benar: 'Organisme/sel hidup (karena spesimen harus dikeringkan/divakum)', salah: ['Virus', 'Organel sel', 'Bakteri yang telah diawetkan'] },
]
```

---

## Game 3 — `ipa8b1t3`: Cell Organelle Sorter

**File:** `src/minigames/Ipa8B1T3Game.jsx`  
**TP:** Membedakan sel hewan dan sel tumbuhan  
**Tema:** hijau-biru (`#0ea5e9`), background `#020c14 → #031824`

```js
const SOAL = [
  { teks: 'Organel yang HANYA ada pada sel tumbuhan (tidak ada di sel hewan) adalah...', benar: 'Dinding sel, kloroplas, dan vakuola besar', salah: ['Mitokondria dan ribosom', 'Nukleus dan membran sel', 'Lisosom dan sentriol'] },
  { teks: 'Organel yang HANYA ada pada sel hewan (tidak ada di sel tumbuhan) adalah...', benar: 'Sentriol dan lisosom', salah: ['Kloroplas dan vakuola', 'Dinding sel', 'Plastida'] },
  { teks: 'Kloroplas pada sel tumbuhan berfungsi untuk...', benar: 'Fotosintesis (mengubah cahaya menjadi energi/glukosa)', salah: ['Respirasi sel', 'Memompa air', 'Menyimpan protein'] },
  { teks: 'Dinding sel pada tumbuhan tersusun dari bahan...', benar: 'Selulosa (polisakarida)', salah: ['Protein', 'Lipid', 'Kitin (seperti jamur)'] },
  { teks: 'Vakuola pada sel tumbuhan berperan untuk...', benar: 'Menyimpan cadangan makanan, air, dan zat sisa', salah: ['Fotosintesis', 'Respirasi', 'Pembelahan sel'] },
  { teks: 'Mitokondria terdapat pada...', benar: 'Sel hewan DAN sel tumbuhan (keduanya)', salah: ['Hanya sel hewan', 'Hanya sel tumbuhan', 'Hanya sel bakteri'] },
  { teks: 'Membran sel (membran plasma) berfungsi sebagai...', benar: 'Pelindung dan pengatur keluar-masuk zat (semipermeabel)', salah: ['Tempat fotosintesis', 'Tempat produksi energi', 'Tempat sintesis protein'] },
  { teks: 'Nukleus (inti sel) berfungsi sebagai...', benar: 'Pusat kontrol sel — mengatur aktivitas dan menyimpan DNA', salah: ['Tempat fotosintesis', 'Penghasil energi', 'Penampung zat sisa'] },
  { teks: 'Ribosom adalah organel yang berfungsi untuk...', benar: 'Sintesis protein', salah: ['Menghasilkan energi (ATP)', 'Fotosintesis', 'Membuang zat sisa'] },
  { teks: 'Sel yang memiliki dinding sel, kloroplas, dan vakuola besar kemungkinan adalah sel...', benar: 'Tumbuhan', salah: ['Hewan', 'Bakteri', 'Jamur'] },
  { teks: 'Sentriol pada sel hewan berperan dalam...', benar: 'Pembelahan sel (membentuk gelendong pembelahan)', salah: ['Fotosintesis', 'Respirasi', 'Pencernaan intraseluler'] },
  { teks: 'Lisosom pada sel hewan berfungsi untuk...', benar: 'Pencernaan intraseluler (menghancurkan zat asing dan organel rusak)', salah: ['Fotosintesis', 'Sintesis protein', 'Menyimpan air'] },
]
```

---

## Game 4 — `ipa8b1t4`: Specialized Cell Match

**File:** `src/minigames/Ipa8B1T4Game.jsx`  
**TP:** Spesialisasi sel tumbuhan dan hewan  
**Tema:** ungu (`#8b5cf6`), background `#080010 → #100820`

```js
const SOAL = [
  { teks: 'Sel akar rambut pada tumbuhan memiliki bentuk memanjang. Fungsinya adalah...', benar: 'Memperluas area penyerapan air dan mineral dari tanah', salah: ['Fotosintesis', 'Menyimpan cadangan makanan', 'Mengangkut hasil fotosintesis'] },
  { teks: 'Stomata (mulut daun) tersusun dari sel...', benar: 'Sel penjaga (sel penutup) berbentuk kacang', salah: ['Sel parenkim', 'Sel epidermis biasa', 'Sel xilem'] },
  { teks: 'Sel darah merah (eritrosit) tidak memiliki nukleus. Tujuannya adalah...', benar: 'Memberi lebih banyak ruang untuk hemoglobin pengangkut oksigen', salah: ['Agar sel lebih ringan', 'Agar sel tidak membelah', 'Untuk mempercepat pembekuan darah'] },
  { teks: 'Sel saraf (neuron) memiliki akson yang sangat panjang. Fungsi akson adalah...', benar: 'Menghantarkan impuls listrik ke sel saraf lain atau organ efektor', salah: ['Menyimpan nutrisi', 'Menerima rangsang dari lingkungan', 'Menghasilkan energi untuk gerakan'] },
  { teks: 'Sel otot memiliki banyak mitokondria karena...', benar: 'Membutuhkan banyak energi (ATP) untuk kontraksi', salah: ['Sel otot melakukan fotosintesis', 'Sel otot menyimpan lemak dalam mitokondria', 'Mitokondria membuat sel otot fleksibel'] },
  { teks: 'Sel xilem pada tumbuhan berbentuk seperti tabung panjang dan mati. Fungsinya adalah...', benar: 'Mengangkut air dan mineral dari akar ke daun', salah: ['Mengangkut hasil fotosintesis', 'Menyerap cahaya matahari', 'Menghasilkan serbuk sari'] },
  { teks: 'Sel floem (sel tapis) berfungsi untuk...', benar: 'Mengangkut hasil fotosintesis (glukosa) ke seluruh bagian tumbuhan', salah: ['Mengangkut air dari akar', 'Menyerap mineral tanah', 'Melindungi batang dari kerusakan'] },
  { teks: 'Sel sperma memiliki ekor (flagela) yang panjang. Fungsinya adalah...', benar: 'Bergerak menuju sel telur untuk fertilisasi', salah: ['Menyimpan DNA lebih banyak', 'Melindungi sel dari lingkungan', 'Menghasilkan energi ekstra'] },
  { teks: 'Sel ovum (sel telur) berukuran besar dibanding sel lain. Tujuannya adalah...', benar: 'Menyimpan cadangan makanan (kuning telur) untuk embrio awal', salah: ['Agar lebih mudah bergerak', 'Agar nukleus lebih besar', 'Karena sel telur berenang lebih jauh'] },
  { teks: 'Trombosit (keping darah) tidak memiliki nukleus dan berukuran kecil. Fungsinya adalah...', benar: 'Pembekuan darah saat terjadi luka', salah: ['Mengangkut oksigen', 'Membunuh bakteri', 'Menghasilkan antibodi'] },
]
```

---

## Game 5 — `ipa8b1t5`: Stem Cell Regenerator

**File:** `src/minigames/Ipa8B1T5Game.jsx`  
**TP:** Peran sel punca (stem cell)  
**Tema:** hijau emerald (`#10b981`), background `#021008 → #041c10`

```js
const SOAL = [
  { teks: 'Sel punca (stem cell) adalah sel yang memiliki kemampuan...', benar: 'Berkembang menjadi berbagai jenis sel dan memperbanyak diri', salah: ['Hanya membelah diri saja', 'Hanya membentuk sel otot', 'Tidak bisa membelah diri'] },
  { teks: 'Sel punca totipoten adalah sel yang mampu membentuk...', benar: 'Seluruh jenis sel tubuh, termasuk plasenta (organisme lengkap)', salah: ['Hanya beberapa jenis jaringan', 'Hanya sel darah', 'Hanya sel otot dan tulang'] },
  { teks: 'Sel punca pluripoten mampu membentuk...', benar: 'Hampir semua jenis sel tubuh (kecuali plasenta)', salah: ['Hanya satu jenis sel', 'Seluruh organisme lengkap', 'Hanya sel kulit'] },
  { teks: 'Sel punca yang paling awal dalam perkembangan embrio disebut...', benar: 'Totipoten (dari zigot hingga morula)', salah: ['Pluripoten', 'Multipoten', 'Unipoten'] },
  { teks: 'Contoh aplikasi sel punca dalam bidang medis adalah...', benar: 'Terapi transplantasi sumsum tulang untuk leukemia', salah: ['Membuat vaksin virus', 'Menciptakan antibiotik baru', 'Operasi plastik biasa'] },
  { teks: 'Sumber sel punca yang PALING KONTROVERSIAL secara etika adalah...', benar: 'Sel punca embrionik (diambil dari embrio manusia)', salah: ['Sel punca dari sumsum tulang dewasa', 'Sel punca dari darah tali pusat', 'Sel punca dari adiposa (lemak)'] },
  { teks: 'Sel punca multipoten dapat berkembang menjadi...', benar: 'Beberapa jenis sel dalam satu kelompok jaringan (misal: sel darah saja)', salah: ['Semua jenis sel tubuh', 'Hanya satu jenis sel', 'Seluruh organisme'] },
  { teks: 'Sel punca hematopoietik berfungsi menghasilkan...', benar: 'Semua jenis sel darah (eritrosit, leukosit, trombosit)', salah: ['Semua jenis sel otot', 'Sel-sel kulit', 'Sel-sel tulang rawan'] },
  { teks: 'Mengapa sel punca penting untuk penelitian penyakit?', benar: 'Dapat digunakan sebagai model penelitian dan berpotensi memperbaiki jaringan rusak', salah: ['Sel punca bisa membunuh virus langsung', 'Sel punca tidak bisa mati', 'Sel punca menghasilkan antibiotik alami'] },
  { teks: 'Bank darah tali pusat menyimpan sel punca karena...', benar: 'Darah tali pusat kaya sel punca hematopoietik yang bisa digunakan sebagai terapi masa depan', salah: ['Darah tali pusat bisa diminum sebagai obat', 'Tali pusat mengandung DNA unik', 'Agar darah tidak terbuang sia-sia'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa8B1T1Game.jsx` – `Ipa8B1T5Game.jsx` (5 file)
2. **Ubah** `src/App.jsx` — ganti 5 placeholder ipa8b1t1–ipa8b1t5 dengan lazy import.

## Checklist
- [ ] 5 game berjalan tanpa error
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] `addReward` hanya saat benar
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
