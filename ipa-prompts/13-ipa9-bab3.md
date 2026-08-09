# Prompt 13 — IPA Kelas 9 BAB 3: Sistem Reproduksi (4 Game)

## Prasyarat
Prompt 00 selesai. Key ipa9b3t1–ipa9b3t4 terdaftar di App.jsx sebagai IpaGamePlaceholder.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
// addReward({ coins: 15, exp: 10 }) hanya saat benar
```

Tema: variasi **hijau-biru** (kehidupan/reproduksi).

---

## Game 1 — `ipa9b3t1`: Reproductive Anatomy Puzzle

**File:** `src/minigames/Ipa9B3T1Game.jsx`  
**Tema:** biru-teal (`#0891b2`), background `#021018 → #041c28`

```js
const SOAL = [
  { teks: 'Organ reproduksi pria yang menghasilkan sel sperma adalah...', benar: 'Testis', salah: ['Vas deferens', 'Epididimis', 'Prostat'] },
  { teks: 'Epididimis pada pria berfungsi sebagai...', benar: 'Tempat pematangan dan penyimpanan sperma', salah: ['Tempat produksi sperma', 'Saluran mengeluarkan sperma saat ejakulasi', 'Menghasilkan hormon testosteron'] },
  { teks: 'Organ reproduksi wanita yang menghasilkan sel telur (ovum) adalah...', benar: 'Ovarium', salah: ['Tuba falopi', 'Uterus (rahim)', 'Vagina'] },
  { teks: 'Tuba falopi (saluran telur) berfungsi sebagai...', benar: 'Jalur sel telur dari ovarium ke uterus, dan tempat fertilisasi', salah: ['Tempat berkembangnya embrio', 'Tempat produksi hormon estrogen', 'Tempat pematangan sel telur'] },
  { teks: 'Fertilisasi (pembuahan sel telur oleh sperma) umumnya terjadi di...', benar: 'Tuba falopi (sepertiga atas)', salah: ['Uterus', 'Ovarium', 'Vagina'] },
  { teks: 'Uterus (rahim) berfungsi sebagai...', benar: 'Tempat berkembangnya janin selama kehamilan', salah: ['Tempat fertilisasi', 'Tempat produksi sel telur', 'Tempat pematangan ovum'] },
  { teks: 'Kelenjar prostat pada pria berfungsi menghasilkan...', benar: 'Cairan yang memberi nutrisi dan melindungi sperma dalam semen', salah: ['Sperma', 'Hormon testosteron', 'Urin'] },
  { teks: 'Hormon yang dihasilkan testis dan berperan pada ciri kelamin sekunder pria adalah...', benar: 'Testosteron', salah: ['Estrogen', 'Progesteron', 'FSH'] },
  { teks: 'Estrogen dan progesteron adalah hormon yang dihasilkan oleh...', benar: 'Ovarium (pada wanita)', salah: ['Testis', 'Kelenjar adrenal saja', 'Hipofisis saja'] },
  { teks: 'Siklus menstruasi pada wanita rata-rata terjadi setiap...', benar: '28 hari (bervariasi 21–35 hari)', salah: ['14 hari', '60 hari', '7 hari'] },
]
```

---

## Game 2 — `ipa9b3t2`: Human Life Stages Timeline

**File:** `src/minigames/Ipa9B3T2Game.jsx`  
**Tema:** hijau (`#16a34a`), background `#021008 → #041a10`

```js
const SOAL = [
  { teks: 'Zigot terbentuk ketika...', benar: 'Sel sperma berhasil membuahi sel telur (fertilisasi)', salah: ['Embrio mulai berkembang', 'Janin pertama kali bergerak', 'Bayi lahir'] },
  { teks: 'Urutan perkembangan yang benar setelah fertilisasi adalah...', benar: 'Zigot → Morula → Blastula → Gastrula → Embrio → Janin', salah: ['Zigot → Janin → Embrio', 'Zigot → Blastula → Zigot lagi', 'Morula → Zigot → Janin'] },
  { teks: 'Embrio berkembang menjadi janin (fetus) mulai pada usia kehamilan...', benar: 'Sekitar 8–10 minggu (organ utama sudah terbentuk)', salah: ['1 minggu', '6 bulan', 'Saat lahir'] },
  { teks: 'Masa pubertas pada remaja ditandai dengan...', benar: 'Perkembangan ciri kelamin sekunder (perubahan fisik dan hormonal)', salah: ['Pertumbuhan gigi pertama', 'Kemampuan berpikir abstrak saja', 'Pertumbuhan tinggi badan saja'] },
  { teks: 'Ciri pubertas pada remaja WANITA yang pertama kali muncul adalah...', benar: 'Pembesaran payudara', salah: ['Menstruasi pertama', 'Tumbuh rambut ketiak', 'Suara berubah'] },
  { teks: 'Ciri pubertas pada remaja PRIA yang paling awal adalah...', benar: 'Pembesaran testis dan skrotum', salah: ['Pertumbuhan kumis', 'Suara berubah (pecah)', 'Ejakulasi pertama'] },
  { teks: 'Menopause pada wanita adalah kondisi di mana...', benar: 'Siklus menstruasi berhenti secara permanen (ovarium berhenti melepas sel telur)', salah: ['Wanita tidak bisa hamil sementara', 'Produksi estrogen meningkat drastis', 'Terjadi kehamilan spontan'] },
  { teks: 'Masa lansia ditandai dengan penurunan fungsi tubuh karena...', benar: 'Proses penuaan — sel-sel tubuh tidak lagi membelah secepat sebelumnya', salah: ['Kekurangan makan', 'Terlalu banyak berolahraga', 'Perubahan lingkungan'] },
  { teks: 'Plasenta berfungsi sebagai...', benar: 'Organ pertukaran nutrisi, O₂, dan zat sisa antara ibu dan janin', salah: ['Tempat berkembangnya sel telur', 'Pelindung fisik janin dari benturan', 'Tempat produksi sel sperma janin'] },
  { teks: 'ASI (air susu ibu) penting bagi bayi karena mengandung...', benar: 'Nutrisi lengkap, antibodi (imunoglobulin), dan faktor pertumbuhan', salah: ['Hanya air dan gula saja', 'Nutrisi yang persis sama dengan susu formula', 'Tidak ada keunggulan dibanding susu formula'] },
]
```

---

## Game 3 — `ipa9b3t3`: Reproductive Health Guardian

**File:** `src/minigames/Ipa9B3T3Game.jsx`  
**Tema:** biru medis (`#1d4ed8`), background `#020c1a → #041830`

```js
const SOAL = [
  { teks: 'HIV (Human Immunodeficiency Virus) menyerang sistem...', benar: 'Imun (kekebalan tubuh) — merusak sel T CD4+', salah: ['Pernapasan', 'Pencernaan', 'Saraf pusat langsung'] },
  { teks: 'Cara penularan HIV yang utama adalah...', benar: 'Kontak cairan tubuh (darah, ASI, cairan seksual) dengan orang yang terinfeksi', salah: ['Berjabat tangan', 'Berbicara atau bersin', 'Melalui nyamuk atau serangga'] },
  { teks: 'Penyakit menular seksual yang disebabkan bakteri Treponema pallidum adalah...', benar: 'Sifilis', salah: ['Gonore', 'Herpes', 'HIV/AIDS'] },
  { teks: 'Gonore (kencing nanah) disebabkan oleh bakteri...', benar: 'Neisseria gonorrhoeae', salah: ['Treponema pallidum', 'Chlamydia trachomatis', 'Staphylococcus aureus'] },
  { teks: 'Cara TERBAIK mencegah penularan penyakit menular seksual adalah...', benar: 'Setia pada satu pasangan, tidak berganti-ganti pasangan', salah: ['Minum antibiotik setiap hari', 'Menggunakan obat herbal', 'Rajin berolahraga'] },
  { teks: 'Keputihan yang NORMAL pada wanita memiliki ciri...', benar: 'Warna bening/putih, tidak berbau menyengat, tidak gatal, jumlah wajar', salah: ['Berwarna kuning/hijau berbau tajam', 'Menyebabkan rasa terbakar', 'Selalu menandakan infeksi'] },
  { teks: 'Vaksin HPV diberikan untuk mencegah...', benar: 'Kanker serviks (leher rahim) yang disebabkan Human Papillomavirus', salah: ['HIV/AIDS', 'Gonore', 'Herpes genital'] },
  { teks: 'Pap smear adalah pemeriksaan untuk mendeteksi dini...', benar: 'Sel kanker atau prakanker pada serviks (leher rahim)', salah: ['HIV', 'Sifilis', 'Kehamilan'] },
  { teks: 'Menjaga kebersihan organ reproduksi yang BENAR adalah...', benar: 'Membersihkan dari depan ke belakang (wanita), menjaga kekeringan, ganti pakaian dalam teratur', salah: ['Menggunakan sabun antiseptik kuat setiap hari', 'Membersihkan bagian dalam vagina dengan cairan pembersih', 'Jarang mengganti pakaian dalam'] },
  { teks: 'AIDS (Acquired Immunodeficiency Syndrome) adalah tahap lanjut HIV di mana...', benar: 'Sistem imun sudah sangat rusak sehingga tubuh rentan terhadap infeksi oportunistik', salah: ['HIV baru masuk ke tubuh', 'Penyakit belum berbahaya', 'Tubuh bisa sembuh sendiri'] },
]
```

---

## Game 4 — `ipa9b3t4`: Flora & Fauna Breeder

**File:** `src/minigames/Ipa9B3T4Game.jsx`  
**Tema:** hijau alam (`#15803d`), background `#021008 → #031a0a`

```js
const SOAL = [
  { teks: 'Reproduksi vegetatif alami pada tumbuhan adalah...', benar: 'Berkembang biak tanpa melalui biji, dari bagian tubuh tumbuhan itu sendiri (stolon, rizoma, umbi)', salah: ['Berkembang biak melalui biji', 'Melalui penyerbukan', 'Melalui spora saja'] },
  { teks: 'Mencangkok adalah teknik perkembangbiakan vegetatif BUATAN yang bertujuan...', benar: 'Menghasilkan tanaman baru yang memiliki sifat sama dengan induk dan lebih cepat berbuah', salah: ['Menghasilkan bibit dari biji', 'Membuat tanaman lebih tahan penyakit', 'Menggabungkan dua jenis tanaman'] },
  { teks: 'Okulasi (tempel tunas) adalah teknik menggabungkan...', benar: 'Tunas dari satu tanaman ke batang tanaman lain yang berbeda jenis (masih satu famili)', salah: ['Akar dua tanaman berbeda', 'Daun dari dua tanaman', 'Biji dengan batang'] },
  { teks: 'Penyerbukan (polinasi) adalah peristiwa...', benar: 'Jatuhnya serbuk sari (polen) ke kepala putik', salah: ['Pembuahan sel telur oleh sperma', 'Tumbuhnya biji menjadi tanaman baru', 'Pembentukan buah dari ovarium'] },
  { teks: 'Hewan yang berkembang biak dengan cara ovipar adalah...', benar: 'Bertelur (ayam, bebek, penyu, ikan, burung)', salah: ['Melahirkan anak (paus, lumba-lumba)', 'Bertelur dan menyusui', 'Membelah diri'] },
  { teks: 'Hewan yang berkembang biak dengan cara vivipar adalah...', benar: 'Melahirkan anak (sapi, kucing, paus, manusia)', salah: ['Bertelur', 'Bertelur lalu mengerami', 'Fragmentasi/memotong diri'] },
  { teks: 'Hewan ovovivipar adalah hewan yang...', benar: 'Bertelur di dalam tubuh induk, lalu menetas dan lahir sebagai anak (hiu, beberapa ular)', salah: ['Hanya bertelur di air', 'Melahirkan dan menyusui', 'Membelah diri secara aseksual'] },
  { teks: 'Fragmentasi adalah cara perkembangbiakan vegetatif pada...', benar: 'Planaria (cacing pipih) — tubuh yang terpotong tumbuh menjadi individu baru', salah: ['Lumut kerak', 'Kucing', 'Tanaman pakis'] },
  { teks: 'Tunas pada hydra adalah contoh reproduksi...', benar: 'Aseksual (vegetatif) — bagian tubuh tumbuh menjadi individu baru', salah: ['Seksual melalui fertilisasi', 'Sporulasi', 'Fragmentasi'] },
  { teks: 'Keunggulan reproduksi seksual (generatif) dibanding aseksual adalah...', benar: 'Menghasilkan keturunan dengan variasi genetik yang lebih beragam (adaptasi lebih baik)', salah: ['Lebih cepat dan lebih banyak keturunan', 'Keturunan identik dengan induk', 'Tidak memerlukan pasangan'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa9B3T1Game.jsx` – `Ipa9B3T4Game.jsx` (4 file)
2. **Ubah** `src/App.jsx` — ganti 4 placeholder ipa9b3t1–ipa9b3t4 dengan lazy import.

## Checklist
- [ ] 4 game berjalan tanpa error
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
