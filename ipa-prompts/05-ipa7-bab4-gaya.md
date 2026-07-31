# Prompt 05 — IPA Kelas 7 BAB IV: Physics Arena: Motion & Force

## Konteks Proyek

Aplikasi **TOMAT** — gamifikasi belajar SMP. Stack: React (Vite) + Express + PostgreSQL.  
Infrastruktur IPA sudah ada (Prompt 01). Route key game ini: `ipa7gaya`.  
File yang dibuat: `src/minigames/Ipa7GayaGame.jsx`.

### Konvensi Wajib Game TOMAT

```jsx
import { usePlayer } from '../contexts/PlayerContext';
import { useSurvival } from '../hooks/useSurvival';
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared';

export default function Ipa7GayaGame({ onBack }) {
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

## Materi BAB IV: Gaya dan Gerak

**Target kurikulum:**
- Macam-macam gaya: gravitasi, gesek, pegas, magnet, listrik, normal
- Resultan gaya segaris (searah dan berlawanan)
- Gerak lurus beraturan (GLB) vs gerak lurus berubah beraturan (GLBB)
- Jarak vs perpindahan, kelajuan vs kecepatan
- Hukum Newton I (inersia), II (F=ma), III (aksi-reaksi)

**Rumus penting (wajib ada sebagai komentar di kode):**
```
Resultan gaya searah   : R = F1 + F2
Resultan gaya berlawanan: R = F1 − F2  (arah gaya besar)
Kelajuan   : v = s / t  (skalar)
Kecepatan  : v = perpindahan / t  (vektor)
Hukum II   : F = m × a
```

---

## Mekanisme Game: Physics Arena — Motion & Force

Game quiz 3 mode, 10 soal per sesi.

### Mode A — "Resultan Gaya"

Tampilkan soal resultan gaya (dua gaya segaris), siswa memilih nilai dan arah resultannya.

**Data soal (8 soal):**

```js
const RESULTAN_SOAL = [
  { soal: 'Dua gaya searah: F1 = 30 N ke kanan, F2 = 20 N ke kanan. Resultan gaya = ?', jawaban: '50 N ke kanan', salah: ['10 N ke kanan', '50 N ke kiri', '600 N'] },
  { soal: 'Dua gaya berlawanan: F1 = 40 N ke kanan, F2 = 15 N ke kiri. Resultan = ?', jawaban: '25 N ke kanan', salah: ['55 N ke kanan', '25 N ke kiri', '40 N'] },
  { soal: 'F1 = 50 N ke atas, F2 = 50 N ke bawah. Resultan gaya = ?', jawaban: '0 N (benda diam)', salah: ['100 N ke atas', '100 N ke bawah', '50 N'] },
  { soal: 'Benda didorong 3 orang ke kanan: 20 N, 25 N, 15 N. Resultan = ?', jawaban: '60 N ke kanan', salah: ['20 N', '45 N', '60 N ke kiri'] },
  { soal: 'F1 = 70 N ke kiri, F2 = 30 N ke kanan. Resultan = ?', jawaban: '40 N ke kiri', salah: ['40 N ke kanan', '100 N ke kiri', '70 N'] },
  { soal: 'Benda bermassa 5 kg mendapat gaya 20 N. Percepatannya = ? (F = ma)', jawaban: '4 m/s²', salah: ['25 m/s²', '100 m/s²', '2 m/s²'] },
  { soal: 'Benda bermassa 10 kg mendapat percepatan 3 m/s². Gaya yang bekerja = ?', jawaban: '30 N', salah: ['13 N', '3 N', '300 N'] },
  { soal: 'Dua gaya berlawanan: F1 = 100 N, F2 = 60 N. Resultan dan arahnya mengikuti gaya...', jawaban: 'F1 (100 N), resultan = 40 N arah F1', salah: ['F2, resultan = 40 N', 'Tidak ada resultan', 'Resultan = 160 N'] },
];
```

### Mode B — "Hukum Newton"

Tampilkan situasi/fenomena, siswa memilih Hukum Newton yang paling sesuai.

**Data soal (8 soal):**

```js
const NEWTON_SOAL = [
  { situasi: 'Penumpang terdorong ke depan saat bus tiba-tiba direm. 🚌', jawaban: 'Hukum Newton I (Inersia)', salah: ['Hukum Newton II', 'Hukum Newton III', 'Hukum Gravitasi'] },
  { situasi: 'Roket meluncur ke atas karena gas menyembur ke bawah dengan kuat. 🚀', jawaban: 'Hukum Newton III (Aksi-Reaksi)', salah: ['Hukum Newton I', 'Hukum Newton II', 'Hukum Gravitasi'] },
  { situasi: 'Truk bermuatan berat membutuhkan gaya lebih besar dari motor untuk mencapai percepatan yang sama. 🚛', jawaban: 'Hukum Newton II (F = ma)', salah: ['Hukum Newton I', 'Hukum Newton III', 'Hukum Gesek'] },
  { situasi: 'Bola yang menggelinding di lantai licin akan terus bergerak dan tidak berhenti. 🎱', jawaban: 'Hukum Newton I (Inersia)', salah: ['Hukum Newton II', 'Hukum Newton III', 'Hukum Gesek'] },
  { situasi: 'Saat berenang, tangan mendorong air ke belakang sehingga badan maju ke depan. 🏊', jawaban: 'Hukum Newton III (Aksi-Reaksi)', salah: ['Hukum Newton I', 'Hukum Newton II', 'Gaya Apung'] },
  { situasi: 'Makin besar gaya yang diberikan pada benda, makin besar percepatannya (massa tetap). 💪', jawaban: 'Hukum Newton II (F = ma)', salah: ['Hukum Newton I', 'Hukum Newton III', 'Hukum Gravitasi'] },
  { situasi: 'Buku diam di atas meja karena gaya gravitasi dan gaya normal saling menyeimbangkan. 📚', jawaban: 'Hukum Newton I (Inersia/kesetimbangan)', salah: ['Hukum Newton II', 'Hukum Newton III', 'Gaya Gesek'] },
  { situasi: 'Pistol bergerak mundur (recoil) saat peluru ditembakkan ke depan. 🔫', jawaban: 'Hukum Newton III (Aksi-Reaksi)', salah: ['Hukum Newton I', 'Hukum Newton II', 'Hukum Inersia'] },
];
```

### Mode C — "Jarak, Perpindahan, Kelajuan vs Kecepatan"

Tampilkan soal hitungan sederhana atau pilihan konseptual.

**Data soal (6 soal):**

```js
const GERAK_SOAL = [
  { soal: 'Andi berlari mengelilingi lapangan 400 m lalu kembali ke titik start. Perpindahannya = ?', jawaban: '0 m (kembali ke titik awal)', salah: ['400 m', '800 m', '200 m'] },
  { soal: 'Mobil menempuh jarak 150 km dalam 3 jam. Kelajuannya = ?', jawaban: '50 km/jam', salah: ['450 km/jam', '0,5 km/jam', '153 km/jam'] },
  { soal: 'Perbedaan kelajuan dan kecepatan adalah...', jawaban: 'Kelajuan skalar (tanpa arah), kecepatan vektor (ada arah)', salah: ['Tidak ada perbedaan', 'Kecepatan selalu lebih besar', 'Kelajuan punya arah, kecepatan tidak'] },
  { soal: 'Benda bergerak lurus dengan kecepatan tetap 10 m/s. Jenis geraknya adalah...', jawaban: 'GLB (Gerak Lurus Beraturan)', salah: ['GLBB dipercepat', 'GLBB diperlambat', 'Gerak melingkar'] },
  { soal: 'Motor dari keadaan diam lalu bergerak makin cepat di jalan lurus. Jenis geraknya adalah...', jawaban: 'GLBB dipercepat', salah: ['GLB', 'GLBB diperlambat', 'Gerak parabola'] },
  { soal: 'Sepeda mengerem dan melambat hingga berhenti. Jenis geraknya adalah...', jawaban: 'GLBB diperlambat', salah: ['GLB', 'GLBB dipercepat', 'Gerak harmonik'] },
];
```

---

## UI Game

```
[TopBar: "Physics Arena ⚡" | tombol back]
[PlayerHeader]
[Card berisi:]
  [Label mode: "Resultan Gaya" / "Hukum Newton" / "Konsep Gerak"]
  [Progress: soal ke-X dari 10]
  [Emoji + teks soal — bold dan terbaca]
  [4 tombol pilihan — grid 2×2]
[FeedbackBanner]
```

- Tombol jawaban: background putih border abu
- Saat benar: hijau; saat salah: merah + jawaban benar tetap hijau
- Auto-next setelah 1.3 detik
- Layar akhir: skor X/10, total koin, tombol "Main Lagi" dan "Kembali"

---

## File yang Harus Dibuat/Diubah

1. **Buat** `src/minigames/Ipa7GayaGame.jsx`
2. **Ubah** `src/App.jsx` — ganti placeholder `ipa7gaya` dengan:
   ```js
   ipa7gaya: lazy(() => import('./minigames/Ipa7GayaGame')),
   ```

## Checklist

- [ ] Tiga mode berjalan tanpa error
- [ ] Perhitungan resultan gaya dan F=ma menghasilkan angka yang benar
- [ ] `addReward` hanya dipanggil saat jawaban benar
- [ ] Pilihan jawaban diacak posisinya setiap soal
- [ ] FeedbackBanner tampil dengan benar
- [ ] Tidak ada crash saat 10 soal selesai
