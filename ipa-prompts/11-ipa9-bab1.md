# Prompt 11 — IPA Kelas 9 BAB 1: Sistem Koordinasi & Homeostasis (5 Game)

## Prasyarat
Prompt 00 selesai. Key ipa9b1t1–ipa9b1t5 terdaftar di App.jsx sebagai IpaGamePlaceholder.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
// addReward({ coins: 15, exp: 10 }) hanya saat benar
```

Tema: variasi **biru-ungu** (sistem saraf & otak).

---

## Game 1 — `ipa9b1t1`: Body Command Center

**File:** `src/minigames/Ipa9B1T1Game.jsx`  
**Tema:** biru gelap (`#1e40af`), background `#020614 → #040c24`

```js
const SOAL = [
  { teks: 'Sistem koordinasi pada manusia terdiri dari...', benar: 'Sistem saraf dan sistem hormon (endokrin)', salah: ['Sistem pencernaan dan peredaran darah', 'Sistem pernapasan dan ekskresi', 'Sistem otot dan tulang'] },
  { teks: 'Perbedaan utama sistem saraf dan sistem hormon adalah...', benar: 'Saraf: sinyal listrik, cepat, jangka pendek. Hormon: sinyal kimia, lambat, jangka panjang', salah: ['Saraf lebih lambat dari hormon', 'Keduanya menggunakan sinyal kimia', 'Hormon bekerja melalui saraf'] },
  { teks: 'Rangsangan (stimulus) dari lingkungan diterima oleh...', benar: 'Reseptor/alat indera (mata, telinga, kulit, dll)', salah: ['Efektor (otot/kelenjar)', 'Otak langsung', 'Sumsum tulang belakang'] },
  { teks: 'Organ yang memproses impuls saraf dan memberikan respons adalah...', benar: 'Sistem saraf pusat (otak dan sumsum tulang belakang)', salah: ['Jantung', 'Paru-paru', 'Ginjal'] },
  { teks: 'Efektor adalah bagian yang...', benar: 'Menghasilkan respons setelah menerima perintah dari saraf (otot/kelenjar)', salah: ['Menerima rangsangan dari lingkungan', 'Mengirim impuls ke otak', 'Menyimpan memori'] },
  { teks: 'Sistem hormon mengirimkan pesan melalui...', benar: 'Aliran darah (hormon diedarkan ke seluruh tubuh)', salah: ['Jaringan saraf', 'Cairan limfa saja', 'Getaran mekanik'] },
  { teks: 'Gerak refleks berbeda dari gerak sadar karena...', benar: 'Gerak refleks tidak melalui otak, langsung dari sumsum tulang belakang', salah: ['Gerak refleks lebih lambat', 'Gerak refleks hanya terjadi di kaki', 'Gerak refleks butuh kesadaran penuh'] },
  { teks: 'Contoh gerak refleks adalah...', benar: 'Menarik tangan saat terkena benda panas', salah: ['Menulis menggunakan tangan kanan', 'Berjalan menuju kulkas', 'Memilih saluran TV'] },
  { teks: 'Jalur impuls gerak sadar adalah...', benar: 'Reseptor → Saraf sensorik → Otak → Saraf motorik → Efektor', salah: ['Reseptor → Sumsum → Efektor (tanpa otak)', 'Efektor → Otak → Reseptor', 'Hormon → Otak → Saraf'] },
  { teks: 'Jalur impuls gerak refleks adalah...', benar: 'Reseptor → Saraf sensorik → Sumsum tulang belakang → Saraf motorik → Efektor', salah: ['Reseptor → Otak → Efektor', 'Hormon → Efektor langsung', 'Reseptor → Kelenjar → Otak'] },
]
```

---

## Game 2 — `ipa9b1t2`: Neuron Network Relay

**File:** `src/minigames/Ipa9B1T2Game.jsx`  
**Tema:** biru elektrik (`#3b82f6`), background `#020d1a → #041828`

```js
const SOAL = [
  { teks: 'Unit fungsional terkecil sistem saraf adalah...', benar: 'Neuron (sel saraf)', salah: ['Sinaps', 'Akson', 'Dendrit'] },
  { teks: 'Bagian neuron yang menerima rangsang/impuls dari neuron lain adalah...', benar: 'Dendrit', salah: ['Akson', 'Badan sel', 'Selubung mielin'] },
  { teks: 'Akson (neurit) berfungsi untuk...', benar: 'Menghantarkan impuls KELUAR dari badan sel ke neuron/efektor berikutnya', salah: ['Menerima impuls dari luar', 'Menyimpan energi sel', 'Menghasilkan hormon'] },
  { teks: 'Selubung mielin berfungsi untuk...', benar: 'Mempercepat hantaran impuls listrik dan melindungi akson', salah: ['Menghasilkan neurotransmiter', 'Menerima rangsang', 'Menyimpan memori'] },
  { teks: 'Saraf sensorik (aferen) berfungsi membawa impuls dari...', benar: 'Reseptor (alat indera) ke sistem saraf pusat', salah: ['Otak ke otot', 'Sumsum tulang belakang ke kelenjar', 'Saraf pusat ke efektor'] },
  { teks: 'Saraf motorik (eferen) berfungsi membawa impuls dari...', benar: 'Sistem saraf pusat ke efektor (otot/kelenjar)', salah: ['Reseptor ke otak', 'Indera ke sumsum tulang belakang', 'Otak ke reseptor'] },
  { teks: 'Sinapsis adalah...', benar: 'Celah antara dua neuron tempat impuls dihantarkan oleh neurotransmiter', salah: ['Bagian badan sel yang terbesar', 'Selubung pelindung akson', 'Kumpulan sel saraf di otak'] },
  { teks: 'Otak besar (serebrum) berfungsi untuk...', benar: 'Berpikir, memori, kesadaran, dan gerakan sadar', salah: ['Mengatur keseimbangan tubuh', 'Mengatur pernapasan otomatis', 'Menghubungkan otak dan sumsum tulang belakang'] },
  { teks: 'Otak kecil (serebelum) berfungsi untuk...', benar: 'Mengatur keseimbangan dan koordinasi gerakan', salah: ['Berpikir dan memori', 'Mengatur detak jantung', 'Pusat kesadaran'] },
  { teks: 'Sumsum tulang belakang berfungsi sebagai...', benar: 'Pusat gerak refleks dan jalur impuls antara otak dan tubuh', salah: ['Tempat produksi darah', 'Pusat memori', 'Mengatur hormoon'] },
]
```

---

## Game 3 — `ipa9b1t3`: Hormone Gland Factory

**File:** `src/minigames/Ipa9B1T3Game.jsx`  
**Tema:** ungu (`#7c3aed`), background `#080010 → #100820`

```js
const SOAL = [
  { teks: 'Kelenjar yang disebut "master gland" karena mengontrol kelenjar lain adalah...', benar: 'Kelenjar hipofisis (pituitari)', salah: ['Kelenjar tiroid', 'Kelenjar adrenal', 'Pankreas'] },
  { teks: 'Hormon insulin dihasilkan oleh...', benar: 'Pankreas (sel beta pulau Langerhans)', salah: ['Kelenjar tiroid', 'Kelenjar adrenal', 'Hipofisis'] },
  { teks: 'Fungsi hormon insulin adalah...', benar: 'Menurunkan kadar glukosa darah (mendorong sel menyerap glukosa)', salah: ['Menaikkan kadar glukosa darah', 'Mengatur suhu tubuh', 'Meningkatkan detak jantung'] },
  { teks: 'Hormon adrenalin (epinefrin) dihasilkan oleh kelenjar...', benar: 'Adrenal (anak ginjal)', salah: ['Hipofisis', 'Tiroid', 'Pankreas'] },
  { teks: 'Efek hormon adrenalin saat situasi darurat (fight or flight) adalah...', benar: 'Detak jantung meningkat, pupil melebar, energi meningkat', salah: ['Detak jantung melambat, tubuh rileks', 'Produksi urin meningkat', 'Tidur dan istirahat'] },
  { teks: 'Hormon tiroksin dihasilkan oleh kelenjar tiroid dan berfungsi untuk...', benar: 'Mengatur metabolisme dan pertumbuhan tubuh', salah: ['Mengatur kadar gula darah', 'Memicu respons stres', 'Mengatur kadar kalsium darah'] },
  { teks: 'Kekurangan hormon tiroksin pada anak-anak dapat menyebabkan...', benar: 'Kretinisme (pertumbuhan fisik dan mental terhambat)', salah: ['Diabetes', 'Anemia', 'Hipertensi'] },
  { teks: 'Hormon glukagon (dari pankreas) berfungsi...', benar: 'Menaikkan kadar glukosa darah (mengubah glikogen menjadi glukosa)', salah: ['Menurunkan kadar glukosa', 'Mengatur pertumbuhan tulang', 'Memicu kontraksi otot'] },
  { teks: 'Hormon yang mengatur pertumbuhan dan perkembangan fisik pada masa pubertas adalah...', benar: 'Testosteron (pria) dan estrogen (wanita)', salah: ['Insulin dan glukagon', 'Adrenalin', 'Tiroksin saja'] },
  { teks: 'Perbedaan kelenjar endokrin dan kelenjar eksokrin adalah...', benar: 'Endokrin: hormon langsung ke darah. Eksokrin: sekret melalui saluran (kelenjar keringat, ludah)', salah: ['Endokrin ada di luar tubuh, eksokrin di dalam', 'Keduanya melepaskan hormon ke darah', 'Eksokrin menghasilkan hormon, endokrin tidak'] },
]
```

---

## Game 4 — `ipa9b1t4`: Homeostasis Stabilizer

**File:** `src/minigames/Ipa9B1T4Game.jsx`  
**Tema:** hijau-teal (`#0d9488`), background `#021210 → #041e1a`

```js
const SOAL = [
  { teks: 'Homeostasis adalah kemampuan tubuh untuk...', benar: 'Mempertahankan kondisi internal yang stabil meskipun ada perubahan eksternal', salah: ['Bergerak secara otomatis', 'Menyesuaikan diri dengan perubahan cuaca', 'Menghasilkan energi dari makanan'] },
  { teks: 'Saat suhu tubuh naik (kepanasan), tubuh merespons dengan...', benar: 'Berkeringat dan melebarkan pembuluh darah kulit untuk melepas panas', salah: ['Menggigil dan menyempitkan pembuluh darah', 'Meningkatkan metabolisme', 'Menghentikan produksi urin'] },
  { teks: 'Saat suhu tubuh turun (kedinginan), tubuh merespons dengan...', benar: 'Menggigil dan menyempitkan pembuluh darah kulit untuk menyimpan panas', salah: ['Berkeringat banyak', 'Melebarkan pembuluh darah', 'Memperlambat detak jantung'] },
  { teks: 'Kadar gula darah normal pada manusia sekitar...', benar: '70–110 mg/dL saat puasa', salah: ['200–300 mg/dL', '30–50 mg/dL', '500 mg/dL'] },
  { teks: 'Saat kadar gula darah naik setelah makan, tubuh merespons dengan...', benar: 'Pankreas melepas insulin untuk menurunkan kadar gula darah', salah: ['Pankreas melepas glukagon', 'Kelenjar adrenal aktif', 'Ginjal mengeluarkan lebih banyak gula'] },
  { teks: 'Saat kadar gula darah turun, tubuh merespons dengan...', benar: 'Pankreas melepas glukagon untuk menaikkan kadar gula darah', salah: ['Pankreas melepas insulin', 'Kelenjar tiroid aktif', 'Hati menyimpan lebih banyak glikogen'] },
  { teks: 'Hormon ADH (antidiuretik) dilepas saat...', benar: 'Kadar air darah rendah (dehidrasi) untuk mengurangi pengeluaran urin', salah: ['Kadar air darah tinggi', 'Suhu tubuh naik', 'Kadar gula darah turun'] },
  { teks: 'Umpan balik negatif (negative feedback) dalam homeostasis artinya...', benar: 'Respons tubuh berlawanan dengan perubahan untuk mengembalikan ke kondisi normal', salah: ['Respons tubuh memperparah perubahan', 'Tubuh tidak merespons perubahan', 'Sinyal terus meningkat tanpa batas'] },
  { teks: 'Suhu inti tubuh manusia yang normal adalah...', benar: 'Sekitar 37°C', salah: ['35°C', '39°C', '42°C'] },
  { teks: 'Diabetes melitus tipe 1 terjadi karena...', benar: 'Pankreas tidak menghasilkan insulin (kerusakan sel beta)', salah: ['Tubuh resisten terhadap insulin', 'Terlalu banyak insulin diproduksi', 'Kekurangan glukagon'] },
]
```

---

## Game 5 — `ipa9b1t5`: Daily Stress Survival

**File:** `src/minigames/Ipa9B1T5Game.jsx`  
**Tema:** biru-hijau (`#0891b2`), background `#021018 → #041c28`

```js
const SOAL = [
  { teks: 'Saat seseorang ketakutan tiba-tiba, respon "fight or flight" dipicu oleh hormon...', benar: 'Adrenalin (dari kelenjar adrenal)', salah: ['Insulin', 'Tiroksin', 'Melatonin'] },
  { teks: 'Stres jangka panjang dapat menyebabkan gangguan homeostasis seperti...', benar: 'Tekanan darah tinggi, gangguan imun, dan sulit tidur', salah: ['Meningkatkan sistem imun', 'Menurunkan tekanan darah', 'Meningkatkan produksi insulin'] },
  { teks: 'Saat berolahraga berat, tubuh mempertahankan homeostasis dengan cara...', benar: 'Meningkatkan pernapasan dan detak jantung, berkeringat untuk menjaga suhu', salah: ['Menghentikan produksi keringat', 'Menurunkan detak jantung', 'Menyimpan lebih banyak glukosa'] },
  { teks: 'Melatonin adalah hormon yang berfungsi untuk...', benar: 'Mengatur siklus tidur-bangun (ritme sirkadian)', salah: ['Mengatur kadar gula darah', 'Meningkatkan respons stres', 'Mengatur pertumbuhan tulang'] },
  { teks: 'Cara efektif mengelola stres untuk menjaga homeostasis adalah...', benar: 'Olahraga teratur, tidur cukup, meditasi, dan dukungan sosial', salah: ['Mengonsumsi kafein berlebih', 'Menghindari semua aktivitas fisik', 'Tidur sesedikit mungkin'] },
  { teks: 'Saat cuaca sangat dingin, tubuh meningkatkan metabolisme untuk menghasilkan panas. Ini contoh...', benar: 'Homeostasis suhu tubuh (termoregulasi)', salah: ['Homeostasis kadar gula', 'Homeostasis cairan tubuh', 'Respons imun'] },
  { teks: 'Hipotalamus di otak berperan sebagai "termostat tubuh" karena...', benar: 'Mendeteksi perubahan suhu darah dan memicu respons untuk menjaga suhu normal', salah: ['Menghasilkan hormon tiroksin langsung', 'Memompa darah ke seluruh tubuh', 'Menyimpan cadangan glikogen'] },
  { teks: 'Setelah makan besar, perasaan mengantuk terjadi karena...', benar: 'Aliran darah meningkat ke saluran pencernaan, dan kadar gula naik memicu pelepasan insulin dan rasa kantuk', salah: ['Otak kekurangan oksigen', 'Tubuh menghentikan metabolisme', 'Suhu tubuh turun drastis'] },
  { teks: 'Saat dehidrasi, tubuh merespons dengan...', benar: 'Merasa haus, ADH dilepas untuk mengurangi urin, dan tekanan osmotik darah meningkat', salah: ['Meningkatkan produksi urin', 'Menurunkan tekanan darah segera', 'Menghentikan produksi keringat saja'] },
  { teks: 'Tidur yang cukup penting untuk homeostasis karena saat tidur...', benar: 'Terjadi perbaikan sel, pengaturan hormon, dan konsolidasi memori', salah: ['Semua organ berhenti bekerja', 'Otak tidak aktif sama sekali', 'Tubuh tidak memerlukan energi'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa9B1T1Game.jsx` – `Ipa9B1T5Game.jsx` (5 file)
2. **Ubah** `src/App.jsx` — ganti 5 placeholder ipa9b1t1–ipa9b1t5 dengan lazy import.

## Checklist
- [ ] 5 game berjalan tanpa error
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
