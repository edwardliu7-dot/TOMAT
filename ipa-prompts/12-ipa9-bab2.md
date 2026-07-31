# Prompt 12 — IPA Kelas 9 BAB 2: Zat Adiktif & Psikotropika (6 Game)

## Prasyarat
Prompt 00 selesai. Key ipa9b2t1–ipa9b2t6 terdaftar di App.jsx sebagai IpaGamePlaceholder.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
// addReward({ coins: 15, exp: 10 }) hanya saat benar
```

Tema: variasi **merah-oranye** (warning/bahaya).

---

## Game 1 — `ipa9b2t1`: Addictive Substance Quiz

**File:** `src/minigames/Ipa9B2T1Game.jsx`  
**Tema:** oranye (`#ea580c`), background `#1a0800 → #2d1200`

```js
const SOAL = [
  { teks: 'Zat adiktif adalah zat yang...', benar: 'Menyebabkan ketergantungan (kecanduan) jika dikonsumsi', salah: ['Menyebabkan alergi', 'Hanya berbahaya jika diminum', 'Membuat tubuh lebih sehat'] },
  { teks: 'Kafein dalam kopi termasuk zat adiktif karena...', benar: 'Dapat menyebabkan ketergantungan ringan dan gejala putus zat', salah: ['Kafein adalah racun berbahaya', 'Kafein termasuk narkotika', 'Kafein menyebabkan halusinasi'] },
  { teks: 'Nikotin pada rokok termasuk zat adiktif golongan...', benar: 'Zat adiktif bukan narkotika', salah: ['Narkotika Golongan I', 'Psikotropika', 'Halusinogen'] },
  { teks: 'Dependensi fisik pada zat adiktif ditandai dengan...', benar: 'Tubuh membutuhkan zat tersebut agar berfungsi normal, dan mengalami gejala putus zat jika dihentikan', salah: ['Perasaan senang sementara', 'Toleransi menurun terhadap zat', 'Tidak ada perubahan perilaku'] },
  { teks: 'Toleransi pada penggunaan zat adiktif artinya...', benar: 'Butuh dosis yang semakin besar untuk mendapat efek yang sama', salah: ['Tubuh semakin tahan terhadap efek buruk zat', 'Zat tidak lagi berbahaya', 'Pengguna menjadi lebih sehat'] },
  { teks: 'Perbedaan zat adiktif dan zat tidak adiktif adalah...', benar: 'Zat adiktif menyebabkan kecanduan dan perubahan kimia otak; zat biasa tidak', salah: ['Zat adiktif selalu ilegal', 'Zat tidak adiktif tidak pernah berbahaya', 'Semua zat kimia adalah adiktif'] },
  { teks: 'Alkohol adalah zat adiktif yang bekerja sebagai...', benar: 'Depresan (memperlambat fungsi sistem saraf pusat)', salah: ['Stimulan (mempercepat fungsi saraf)', 'Halusinogen', 'Analgesik (pereda nyeri)'] },
  { teks: 'Gejala putus zat (withdrawal) yang paling berbahaya terjadi saat menghentikan...', benar: 'Penggunaan alkohol atau benzodiazepine secara tiba-tiba (bisa fatal)', salah: ['Konsumsi kafein', 'Penggunaan aspirin', 'Minum teh'] },
  { teks: 'Penggunaan zat adiktif dalam jangka panjang mengubah otak dengan cara...', benar: 'Mengubah jalur dopamin — otak jadi kurang responsif terhadap kesenangan alami', salah: ['Otak menjadi lebih besar', 'Meningkatkan kemampuan belajar', 'Tidak ada perubahan permanen'] },
  { teks: 'Yang BUKAN termasuk zat adiktif adalah...', benar: 'Vitamin C (asam askorbat)', salah: ['Nikotin', 'Alkohol', 'Kafein'] },
]
```

---

## Game 2 — `ipa9b2t2`: Substance Categorizer

**File:** `src/minigames/Ipa9B2T2Game.jsx`  
**Tema:** merah (`#dc2626`), background `#1a0000 → #2d0808`

```js
const SOAL = [
  { teks: 'Narkotika Golongan I adalah narkotika yang...', benar: 'Sangat berbahaya, tidak digunakan dalam pengobatan, dilarang keras (heroin, kokain)', salah: ['Digunakan untuk operasi medis', 'Dijual bebas di apotek', 'Hanya menyebabkan ketergantungan ringan'] },
  { teks: 'Morfin dan petidin termasuk narkotika Golongan...', benar: 'II (digunakan dalam pengobatan tertentu dengan pengawasan ketat)', salah: ['I', 'III', 'Bukan narkotika'] },
  { teks: 'Psikotropika adalah zat yang mempengaruhi...', benar: 'Sistem saraf pusat sehingga mengubah pikiran, perasaan, atau perilaku', salah: ['Sistem pencernaan saja', 'Hanya otot-otot tubuh', 'Tekanan darah saja'] },
  { teks: 'Ganja (cannabis) diklasifikasikan sebagai narkotika Golongan...', benar: 'I (di Indonesia)', salah: ['II', 'III', 'Bukan narkotika'] },
  { teks: 'Kokain bekerja sebagai...', benar: 'Stimulan kuat yang meningkatkan kadar dopamin di otak', salah: ['Depresan', 'Halusinogen', 'Sedatif'] },
  { teks: 'Amfetamin (sabu-sabu) termasuk golongan...', benar: 'Psikotropika / stimulan', salah: ['Narkotika Golongan I', 'Zat adiktif bukan narkotika', 'Obat bebas'] },
  { teks: 'Heroin (putaw) adalah turunan dari...', benar: 'Morfin (berasal dari tanaman opium/poppy)', salah: ['Ganja', 'Kokain', 'Kafein'] },
  { teks: 'Contoh zat adiktif bukan narkotika yang legal adalah...', benar: 'Kafein (kopi, teh) dan nikotin (rokok)', salah: ['Heroin dan kokain', 'Ganja dan morfin', 'LSD dan ecstasy'] },
  { teks: 'LSD (Lysergic acid diethylamide) bekerja sebagai...', benar: 'Halusinogen (menyebabkan halusinasi visual dan suara)', salah: ['Stimulan', 'Depresan', 'Analgesik'] },
  { teks: 'Ekstasi (MDMA) termasuk golongan psikotropika yang bekerja sebagai...', benar: 'Stimulan sekaligus menyebabkan euforia dan halusinasi ringan', salah: ['Depresan murni', 'Analgesik (pereda nyeri) saja', 'Obat tidur'] },
]
```

---

## Game 3 — `ipa9b2t3`: Impact Simulator

**File:** `src/minigames/Ipa9B2T3Game.jsx`  
**Tema:** merah gelap (`#991b1b`), background `#150000 → #250808`

```js
const SOAL = [
  { teks: 'Dampak jangka pendek merokok yang langsung terasa adalah...', benar: 'Detak jantung meningkat, napas lebih pendek, mulut pahit', salah: ['Paru-paru langsung rusak dalam 1 jam', 'Tidak ada efek langsung', 'Langsung menyebabkan kanker'] },
  { teks: 'Dampak jangka panjang merokok pada sistem pernapasan adalah...', benar: 'Kanker paru-paru, bronkitis kronis, emfisema', salah: ['Meningkatkan kapasitas paru-paru', 'Tidak ada dampak jangka panjang', 'Membuat napas lebih lega'] },
  { teks: 'Penggunaan narkotika jangka panjang dapat menyebabkan...', benar: 'Kerusakan otak permanen, gagal organ, dan kematian', salah: ['Peningkatan kecerdasan', 'Tubuh lebih kuat dan sehat', 'Hanya ketergantungan ringan'] },
  { teks: 'Konsumsi alkohol berlebih dalam jangka panjang merusak...', benar: 'Hati (sirosis), otak, dan jantung', salah: ['Hanya sistem pencernaan', 'Paru-paru saja', 'Tidak ada organ yang rusak jika dosis rendah'] },
  { teks: 'Dampak sosial penggunaan narkoba meliputi...', benar: 'Kriminalitas meningkat, keretakan keluarga, kehilangan pekerjaan', salah: ['Meningkatkan produktivitas kerja', 'Memperkuat hubungan sosial', 'Tidak ada dampak sosial'] },
  { teks: 'Overdosis narkotika dapat menyebabkan kematian karena...', benar: 'Depresi pernapasan — otak tidak mengirim sinyal bernapas', salah: ['Tekanan darah terlalu rendah saja', 'Kekurangan vitamin', 'Tidak bisa menyebabkan kematian'] },
  { teks: 'Penggunaan jarum suntik narkoba secara bergantian dapat menularkan...', benar: 'HIV/AIDS, hepatitis B, dan hepatitis C', salah: ['Hanya influenza', 'Diabetes', 'Tidak menularkan penyakit apapun'] },
  { teks: 'Dampak psikologis jangka panjang penggunaan narkoba adalah...', benar: 'Depresi berat, paranoia, halusinasi, dan gangguan kepribadian', salah: ['Merasa lebih bahagia secara permanen', 'Meningkatkan kepercayaan diri', 'Tidak ada dampak psikologis'] },
  { teks: 'Kecanduan narkoba memengaruhi otak dengan merusak...', benar: 'Sistem reward dopamin — otak tidak bisa merasa senang tanpa narkoba', salah: ['Hanya memori jangka pendek', 'Penglihatan saja', 'Tidak ada kerusakan otak'] },
  { teks: 'Dampak ekonomi dari kecanduan narkoba adalah...', benar: 'Uang habis untuk membeli narkoba, kehilangan pekerjaan, memperburuk kemiskinan', salah: ['Meningkatkan kemampuan bekerja', 'Tidak ada dampak ekonomi', 'Membuat lebih rajin bekerja'] },
]
```

---

## Game 4 — `ipa9b2t4`: Substance Flashcards

**File:** `src/minigames/Ipa9B2T4Game.jsx`  
**Tema:** ungu-merah (`#7f1d1d`), background `#100008 → #1c0010`

```js
const SOAL = [
  { teks: 'Zat aktif utama dalam rokok yang menyebabkan kecanduan adalah...', benar: 'Nikotin', salah: ['Tar', 'Karbon monoksida', 'Aseton'] },
  { teks: 'Tar dalam rokok berbahaya karena...', benar: 'Mengendap di paru-paru dan bersifat karsinogen (pemicu kanker)', salah: ['Menyebabkan kecanduan', 'Membuat rokok terasa lebih enak', 'Tidak berbahaya dalam jumlah kecil'] },
  { teks: 'Karbon monoksida (CO) dalam asap rokok berbahaya karena...', benar: 'Mengikat hemoglobin lebih kuat dari O₂ sehingga tubuh kekurangan oksigen', salah: ['Menyebabkan kecanduan nikotin', 'Membuat warna darah menjadi biru', 'Tidak berbahaya dalam jumlah kecil'] },
  { teks: 'Morfin berasal dari tanaman...', benar: 'Papaver somniferum (tanaman opium)', salah: ['Cannabis sativa (ganja)', 'Erythroxylum coca (koka)', 'Psilocybe (jamur ajaib)'] },
  { teks: 'Psilocybin ditemukan pada...', benar: 'Jamur tertentu (magic mushrooms) dan bekerja sebagai halusinogen', salah: ['Tanaman koka', 'Tanaman opium', 'Tanaman ganja'] },
  { teks: 'Efek kerja stimulan pada sistem saraf adalah...', benar: 'Mempercepat aktivitas saraf — meningkatkan kewaspadaan dan energi', salah: ['Memperlambat fungsi saraf', 'Menyebabkan halusinasi', 'Menghilangkan rasa nyeri'] },
  { teks: 'Efek kerja depresan pada sistem saraf adalah...', benar: 'Memperlambat aktivitas saraf — menyebabkan kantuk dan relaksasi', salah: ['Meningkatkan kewaspadaan', 'Menyebabkan halusinasi kuat', 'Memblokir rasa sakit'] },
  { teks: 'Efek kerja halusinogen adalah...', benar: 'Mengubah persepsi kenyataan — menyebabkan halusinasi visual/suara', salah: ['Mempercepat saraf', 'Memperlambat saraf', 'Menghilangkan rasa sakit'] },
  { teks: 'Fentanil adalah opioid sintetis yang...', benar: '50–100× lebih kuat dari morfin, sangat berbahaya, penyebab overdosis utama', salah: ['Lebih lemah dari morfin', 'Digunakan bebas di apotek', 'Tidak menyebabkan kecanduan'] },
  { teks: 'Ketamin termasuk golongan psikotropika yang bekerja sebagai...', benar: 'Disosiatif — menyebabkan perasaan terpisah dari tubuh dan kenyataan', salah: ['Stimulan murni', 'Depresan ringan', 'Analgesik opioid'] },
]
```

---

## Game 5 — `ipa9b2t5`: Consequence Analyzer

**File:** `src/minigames/Ipa9B2T5Game.jsx`  
**Tema:** oranye-merah (`#c2410c`), background `#180500 → #280c00`

```js
const SOAL = [
  { teks: 'Dampak negatif zat adiktif pada kesehatan FISIK meliputi...', benar: 'Kerusakan organ (hati, paru, jantung, otak), penyakit menular, dan kematian', salah: ['Peningkatan stamina', 'Tubuh lebih berenergi', 'Tidak ada dampak fisik nyata'] },
  { teks: 'Dampak negatif zat adiktif pada MENTAL/PSIKIS meliputi...', benar: 'Depresi, psikosis, gangguan kepribadian, paranoia', salah: ['Merasa lebih percaya diri permanen', 'Meningkatkan kreativitas', 'Tidak ada dampak mental'] },
  { teks: 'Dampak sosial penggunaan narkoba pada keluarga adalah...', benar: 'Keretakan hubungan, beban biaya pengobatan, dan trauma anggota keluarga', salah: ['Keluarga menjadi lebih solid', 'Tidak ada dampak pada keluarga', 'Meningkatkan perekonomian keluarga'] },
  { teks: 'Dampak narkoba terhadap prestasi belajar remaja adalah...', benar: 'Konsentrasi menurun, absensi meningkat, nilai jelek, putus sekolah', salah: ['Meningkatkan fokus belajar', 'Tidak berpengaruh', 'Membuat lebih pintar'] },
  { teks: 'Dampak penyalahgunaan narkoba terhadap keamanan masyarakat adalah...', benar: 'Meningkatkan kejahatan (pencurian, kekerasan) karena butuh uang untuk beli narkoba', salah: ['Masyarakat menjadi lebih damai', 'Kriminalitas menurun', 'Tidak ada kaitan dengan kejahatan'] },
  { teks: 'HIV/AIDS sering dikaitkan dengan narkoba karena...', benar: 'Pemakai narkoba sering berbagi jarum suntik yang menularkan virus HIV', salah: ['Narkoba langsung menyebabkan HIV', 'Hanya melalui kontak kulit', 'Tidak ada kaitan dengan HIV'] },
  { teks: 'Dampak narkoba pada produktivitas nasional adalah...', benar: 'Sumber daya manusia berkualitas hilang, biaya kesehatan dan rehabilitasi meningkat', salah: ['Meningkatkan pertumbuhan ekonomi', 'Tidak ada dampak nasional', 'Mengurangi pengangguran'] },
  { teks: 'Sindrom neonatal (bayi lahir kecanduan) terjadi ketika...', benar: 'Ibu hamil menggunakan narkoba sehingga janin terpapar dan mengalami ketergantungan sejak lahir', salah: ['Ayah pengguna narkoba', 'Bayi minum susu formula', 'Tidak pernah terjadi'] },
  { teks: 'Dampak paling berbahaya dari penggunaan narkoba dalam jangka sangat panjang adalah...', benar: 'Kematian akibat overdosis, penyakit organ, atau komplikasi infeksi', salah: ['Ketergantungan ringan yang bisa sembuh sendiri', 'Hanya masalah sosial', 'Tidak ada dampak fatal'] },
  { teks: 'Mengapa remaja lebih rentan terhadap dampak narkoba dibanding orang dewasa?', benar: 'Otak remaja masih berkembang, lebih mudah rusak oleh zat adiktif secara permanen', salah: ['Remaja lebih kuat secara fisik', 'Remaja lebih mudah berhenti', 'Tidak ada perbedaan'] },
]
```

---

## Game 6 — `ipa9b2t6`: Say No Challenge

**File:** `src/minigames/Ipa9B2T6Game.jsx`  
**Tema:** hijau-teal (perlindungan diri), background `#021008 → #041a10`

```js
const SOAL = [
  { teks: 'Cara paling efektif menolak tawaran narkoba dari teman adalah...', benar: 'Tegas berkata tidak, pergi dari situasi tersebut, tidak perlu menjelaskan panjang lebar', salah: ['Mencoba dulu sedikit agar tidak dianggap pengecut', 'Diam saja dan tidak berreaksi', 'Menerima agar tidak kehilangan teman'] },
  { teks: 'Lingkungan yang PALING berpengaruh dalam mencegah penggunaan narkoba remaja adalah...', benar: 'Keluarga yang hangat dan komunikatif, serta teman sebaya yang positif', salah: ['Uang yang banyak', 'Tinggal di kota besar', 'Sekolah swasta yang mahal'] },
  { teks: 'Kegiatan positif yang efektif mengalihkan dari narkoba adalah...', benar: 'Olahraga, seni, organisasi, dan kegiatan keagamaan', salah: ['Bermain game online terus-menerus', 'Tidur sepanjang hari', 'Mengurung diri di kamar'] },
  { teks: 'Seseorang yang melihat temannya menggunakan narkoba sebaiknya...', benar: 'Melaporkan kepada orang tua, guru, atau pihak berwenang dengan penuh kasih, bukan menghakimi', salah: ['Diam saja dan tidak ikut campur', 'Ikut mencoba agar diajak bergaul', 'Langsung memutus pertemanan tanpa memberi bantuan'] },
  { teks: 'Pengetahuan tentang bahaya narkoba sebaiknya diajarkan sejak...', benar: 'Dini (usia anak-anak hingga remaja) sebelum ada kesempatan terpapar', salah: ['Hanya setelah dewasa', 'Setelah seseorang mencoba narkoba', 'Tidak perlu diajarkan karena sudah otomatis tahu'] },
  { teks: 'Kepercayaan diri yang tinggi dapat melindungi dari narkoba karena...', benar: 'Seseorang yang percaya diri tidak membutuhkan persetujuan orang lain untuk merasa baik', salah: ['Orang percaya diri lebih suka tantangan berbahaya', 'Percaya diri membuat kebal terhadap tekanan teman', 'Tidak ada kaitan antara percaya diri dan narkoba'] },
  { teks: 'Lembaga yang bertugas melakukan rehabilitasi pengguna narkoba di Indonesia adalah...', benar: 'BNN (Badan Narkotika Nasional) dan rumah sakit/klinik rehabilitasi', salah: ['Komnas HAM', 'KPK (Komisi Pemberantasan Korupsi)', 'BPOM saja'] },
  { teks: 'Mengapa "coba-coba" sekali saja sudah berbahaya?', benar: 'Beberapa zat (heroin, shabu) dapat menyebabkan ketergantungan bahkan setelah penggunaan pertama', salah: ['Sekali tidak ada efek sama sekali', 'Ketergantungan butuh ratusan kali penggunaan', 'Hanya berbahaya jika sering digunakan'] },
  { teks: 'Tekanan teman sebaya (peer pressure) untuk mencoba narkoba paling efektif dilawan dengan...', benar: 'Memilih teman yang tepat dan memiliki nilai/prinsip yang kuat sejak awal', salah: ['Menghindari semua teman', 'Selalu membawa orang tua ke mana-mana', 'Tidak pernah bergaul sama sekali'] },
  { teks: 'Manfaat utama program anti-narkoba di sekolah adalah...', benar: 'Memberikan pengetahuan, keterampilan menolak, dan menciptakan lingkungan sekolah bebas narkoba', salah: ['Membuat siswa takut terhadap semua obat', 'Hanya formalitas tanpa manfaat nyata', 'Membuat siswa lebih penasaran'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa9B2T1Game.jsx` – `Ipa9B2T6Game.jsx` (6 file)
2. **Ubah** `src/App.jsx` — ganti 6 placeholder ipa9b2t1–ipa9b2t6 dengan lazy import.

## Checklist
- [ ] 6 game berjalan tanpa error
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
