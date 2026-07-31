# Prompt 06 — IPA Kelas 8 BAB I: Microscope Explorer & Cell Builder

## Konteks Proyek

Aplikasi **TOMAT** — gamifikasi belajar SMP. Stack: React (Vite) + Express + PostgreSQL.  
Infrastruktur IPA sudah ada (Prompt 01). Route key game ini: `ipa8sel`.  
File yang dibuat: `src/minigames/Ipa8SelGame.jsx`.

### Konvensi Wajib Game TOMAT

```jsx
import { usePlayer } from '../contexts/PlayerContext';
import { useSurvival } from '../hooks/useSurvival';
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared';

export default function Ipa8SelGame({ onBack }) {
  const { addReward } = usePlayer();
  const { onCorrect, onWrong } = useSurvival();

  function handleAnswer(isCorrect) {
    if (isCorrect) {
      addReward({ coins: 15, exp: 10 });
      onCorrect();
    } else {
      onWrong();
    }
  }
}
```

---

## Materi BAB I: Pengenalan Sel

**Target kurikulum:**
- Sejarah penemuan sel (Robert Hooke, Schleiden, Schwann, dll.)
- Jenis mikroskop: cahaya vs elektron
- Bagian-bagian sel hewan dan sel tumbuhan
- Perbedaan sel hewan dan sel tumbuhan
- Organel sel dan fungsinya
- Sel punca: totipoten, pluripoten, multipoten, unipoten

---

## Mekanisme Game: Microscope Explorer & Cell Builder

Game quiz 3 mode bergantian, 10 soal per sesi.

### Mode A — "Sel Hewan vs Sel Tumbuhan"

Tampilkan organel/ciri, siswa memilih ditemukan pada sel hewan, sel tumbuhan, atau keduanya.

**Data soal (10 soal):**

```js
const SEL_SOAL = [
  { ciri: 'Dinding sel (cell wall) dari selulosa 🌿', jawaban: 'Sel Tumbuhan', salah: ['Sel Hewan', 'Keduanya', 'Sel Punca'] },
  { ciri: 'Sentriol (untuk pembelahan sel) 🔵', jawaban: 'Sel Hewan', salah: ['Sel Tumbuhan', 'Keduanya', 'Sel Fungi'] },
  { ciri: 'Kloroplas (tempat fotosintesis) 🌱', jawaban: 'Sel Tumbuhan', salah: ['Sel Hewan', 'Keduanya', 'Sel Bakteri'] },
  { ciri: 'Nukleus (inti sel) ⭕', jawaban: 'Keduanya', salah: ['Sel Hewan saja', 'Sel Tumbuhan saja', 'Tidak ada di keduanya'] },
  { ciri: 'Vakuola besar (tempat penyimpanan cairan) 💧', jawaban: 'Sel Tumbuhan', salah: ['Sel Hewan', 'Keduanya', 'Sel Bakteri'] },
  { ciri: 'Mitokondria (penghasil energi / ATP) ⚡', jawaban: 'Keduanya', salah: ['Sel Hewan saja', 'Sel Tumbuhan saja', 'Hanya sel prokariota'] },
  { ciri: 'Membran sel (membran plasma) 🔴', jawaban: 'Keduanya', salah: ['Sel Hewan saja', 'Sel Tumbuhan saja', 'Tidak ada'] },
  { ciri: 'Ribosom (sintesis protein) 🟡', jawaban: 'Keduanya', salah: ['Sel Hewan saja', 'Sel Tumbuhan saja', 'Hanya di sitoplasma'] },
  { ciri: 'Lisosom (mencerna zat asing) 🗑️', jawaban: 'Sel Hewan', salah: ['Sel Tumbuhan', 'Keduanya', 'Tidak ada di keduanya'] },
  { ciri: 'Plastida (kloroplas, kromoplas, leukoplas) 🎨', jawaban: 'Sel Tumbuhan', salah: ['Sel Hewan', 'Keduanya', 'Sel Fungi'] },
];
```

### Mode B — "Fungsi Organel Sel"

Tampilkan nama organel, siswa memilih fungsinya yang benar.

**Data soal (8 soal):**

```js
const ORGANEL_SOAL = [
  { organel: 'Mitokondria ⚡', jawaban: 'Menghasilkan energi (ATP) melalui respirasi sel', salah: ['Sintesis protein', 'Menyimpan materi genetik', 'Tempat fotosintesis'] },
  { organel: 'Ribosom 🟡', jawaban: 'Sintesis (pembuatan) protein', salah: ['Menghasilkan energi', 'Mencerna zat asing', 'Mengatur keluar-masuk zat'] },
  { organel: 'Nukleus (Inti Sel) ⭕', jawaban: 'Pusat kendali sel, menyimpan DNA/informasi genetik', salah: ['Menghasilkan energi', 'Sintesis protein', 'Transportasi zat'] },
  { organel: 'Membran Sel 🔴', jawaban: 'Mengatur keluar-masuk zat dari dan ke dalam sel', salah: ['Menyimpan DNA', 'Menghasilkan energi', 'Tempat fotosintesis'] },
  { organel: 'Kloroplas 🌿', jawaban: 'Tempat berlangsungnya fotosintesis', salah: ['Menghasilkan energi dari gula', 'Mencerna zat asing', 'Sintesis protein'] },
  { organel: 'Vakuola 💧', jawaban: 'Menyimpan air, sari makanan, atau zat sisa', salah: ['Menghasilkan energi', 'Sintesis protein', 'Pusat kendali sel'] },
  { organel: 'Lisosom 🗑️', jawaban: 'Mencerna zat asing dan organel yang rusak', salah: ['Sintesis protein', 'Menghasilkan energi', 'Mengatur pembelahan sel'] },
  { organel: 'Badan Golgi 📦', jawaban: 'Mengemas dan mendistribusikan protein ke seluruh sel', salah: ['Menghasilkan energi', 'Menyimpan DNA', 'Tempat fotosintesis'] },
];
```

### Mode C — "Sejarah & Jenis Sel"

Pilihan ganda tentang sejarah penemuan dan jenis-jenis sel.

**Data soal (6 soal):**

```js
const SEJARAH_SOAL = [
  { soal: 'Ilmuwan yang pertama kali mengamati sel menggunakan mikroskop (sel gabus) adalah...', jawaban: 'Robert Hooke (1665)', salah: ['Antonie van Leeuwenhoek', 'Matthias Schleiden', 'Rudolf Virchow'] },
  { soal: 'Sel punca yang dapat berkembang menjadi SEMUA jenis sel tubuh disebut...', jawaban: 'Totipoten', salah: ['Pluripoten', 'Multipoten', 'Unipoten'] },
  { soal: 'Perbedaan utama sel prokariotik dan eukariotik adalah...', jawaban: 'Sel prokariotik tidak punya membran nukleus (inti)', salah: ['Sel prokariotik lebih besar', 'Sel eukariotik tidak punya DNA', 'Sel prokariotik punya kloroplas'] },
  { soal: 'Mikroskop yang menggunakan berkas elektron dan menghasilkan gambar 3D permukaan sel disebut...', jawaban: 'Mikroskop Elektron Scanning (SEM)', salah: ['Mikroskop Cahaya', 'Mikroskop Elektron Transmisi (TEM)', 'Mikroskop Fluoresen'] },
  { soal: 'Teori sel menyatakan bahwa semua makhluk hidup tersusun dari sel, dan sel baru berasal dari...', jawaban: 'Sel yang sudah ada sebelumnya (Omnis cellula e cellula)', salah: ['Generasi spontan', 'Zat kimia non-sel', 'Atom-atom yang bergabung'] },
  { soal: 'Contoh organisme yang hanya terdiri dari SATU sel (uniseluler) adalah...', jawaban: 'Amoeba dan Paramecium', salah: ['Cacing tanah', 'Jamur', 'Tumbuhan paku'] },
];
```

---

## UI Game

```
[TopBar: "Microscope Explorer 🔬" | tombol back]
[PlayerHeader]
[Card berisi:]
  [Label mode: "Sel Hewan vs Tumbuhan" / "Fungsi Organel" / "Sejarah Sel"]
  [Progress: soal ke-X dari 10]
  [Emoji besar + teks soal]
  [4 tombol pilihan — grid 2×2]
[FeedbackBanner]
```

- Tombol jawaban: background putih border abu
- Saat benar: hijau; saat salah: merah + jawaban benar tetap hijau
- Auto-next setelah 1.3 detik
- Layar akhir: skor X/10, total koin, tombol "Main Lagi" dan "Kembali"

---

## File yang Harus Dibuat/Diubah

1. **Buat** `src/minigames/Ipa8SelGame.jsx`
2. **Ubah** `src/App.jsx` — ganti placeholder `ipa8sel` dengan:
   ```js
   ipa8sel: lazy(() => import('./minigames/Ipa8SelGame')),
   ```

## Checklist

- [ ] Tiga mode berjalan tanpa error
- [ ] `addReward` hanya dipanggil saat jawaban benar
- [ ] Pilihan jawaban diacak posisinya setiap soal
- [ ] FeedbackBanner tampil dengan benar
- [ ] Tidak ada crash saat 10 soal selesai
