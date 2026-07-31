# Prompt 02 — IPA Kelas 7 BAB I: Precision Measurement Lab

## Konteks Proyek

Aplikasi **TOMAT** — gamifikasi belajar SMP. Stack: React (Vite) + Express + PostgreSQL.  
Infrastruktur IPA **sudah selesai** di Prompt 01 (zone screens, routes, catalog entries).  
Game ini masuk route key `ipa7pengukuran`, file: `src/minigames/Ipa7PengukuranGame.jsx`.

### Konvensi Game TOMAT yang Wajib Diikuti

```jsx
// Struktur wajib setiap game
import { usePlayer } from '../contexts/PlayerContext';
import { useSurvival } from '../hooks/useSurvival';
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared';

export default function NamaGame({ onBack }) {
  const { addReward } = usePlayer();
  const { onCorrect, onWrong, streak } = useSurvival();
  // ...
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

- Jawaban benar: `addReward({ coins: 15, exp: 10 })` + `onCorrect()`
- Jawaban salah: `onWrong()`
- Selalu ada `TopBar` dengan tombol back (`onBack`)
- Selalu ada `PlayerHeader` di bawah TopBar

---

## Materi BAB I: Besaran dan Pengukuran

**Target kurikulum:**
- Besaran pokok vs besaran turunan
- Satuan baku vs tak baku
- Alat ukur yang tepat untuk objek tertentu (jangka sorong, neraca, mistar, gelas ukur, stopwatch)
- Konversi satuan: panjang (m↔cm↔mm↔km), massa (kg↔gram), waktu (jam↔menit↔detik), suhu (placeholder), volume (L↔mL)

---

## Mekanisme Game: Precision Measurement Lab

Game terdiri dari **2 mode** yang dimainkan bergantian secara acak:

### Mode A — "Pilih Alat Ukur yang Tepat"

Tampilkan sebuah **objek** (teks + emoji) dan pertanyaan:  
*"Alat ukur apa yang paling tepat untuk mengukur [objek] ini?"*

Pilihan: 4 tombol pilihan ganda (A/B/C/D).

**Data soal (minimal 10 soal, acak setiap sesi):**

| Objek | Jawaban Benar | Pilihan Salah |
|-------|--------------|---------------|
| Panjang meja 📏 | Mistar | Jangka sorong, Neraca, Gelas ukur |
| Diameter koin logam 🪙 | Jangka sorong | Mistar, Stopwatch, Gelas ukur |
| Massa apel 🍎 | Neraca | Mistar, Termometer, Stopwatch |
| Volume air dalam botol 💧 | Gelas ukur | Neraca, Mistar, Jangka sorong |
| Waktu lari 100 meter ⏱️ | Stopwatch | Termometer, Neraca, Gelas ukur |
| Suhu air panas 🌡️ | Termometer | Mistar, Stopwatch, Neraca |
| Ketebalan buku 📚 | Jangka sorong | Gelas ukur, Stopwatch, Thermometer |
| Massa emas perhiasan 💍 | Neraca | Mistar, Gelas ukur, Termometer |
| Volume batu kecil (metode celup) 🪨 | Gelas ukur | Neraca, Mistar, Stopwatch |
| Panjang lapangan basket 🏀 | Mistar (meteran) | Jangka sorong, Neraca, Termometer |

### Mode B — "Konversi Satuan"

Tampilkan soal konversi dengan angka, siswa memilih jawaban yang benar dari 4 pilihan.

**Data soal (minimal 12 soal):**

```js
const KONVERSI_SOAL = [
  { soal: '5 km = ___ m',        jawaban: 5000,   salah: [500, 50000, 0.005] },
  { soal: '250 cm = ___ m',      jawaban: 2.5,    salah: [25, 0.25, 2500] },
  { soal: '3000 mm = ___ m',     jawaban: 3,      salah: [30, 300, 0.3] },
  { soal: '2 kg = ___ gram',     jawaban: 2000,   salah: [200, 20000, 0.002] },
  { soal: '750 gram = ___ kg',   jawaban: 0.75,   salah: [75, 7.5, 7500] },
  { soal: '1 jam = ___ menit',   jawaban: 60,     salah: [24, 100, 360] },
  { soal: '180 menit = ___ jam', jawaban: 3,      salah: [1.8, 18, 0.3] },
  { soal: '2 jam = ___ detik',   jawaban: 7200,   salah: [720, 120, 3600] },
  { soal: '1 L = ___ mL',        jawaban: 1000,   salah: [100, 10000, 0.1] },
  { soal: '500 mL = ___ L',      jawaban: 0.5,    salah: [5, 50, 5000] },
  { soal: '4500 m = ___ km',     jawaban: 4.5,    salah: [45, 450, 0.45] },
  { soal: '1500 gram = ___ kg',  jawaban: 1.5,    salah: [15, 150, 0.15] },
];
```

Acak urutan 4 pilihan setiap soal agar jawaban tidak selalu di posisi sama.

---

## UI Game

### Layout keseluruhan:
```
[TopBar: "Precision Measurement Lab 📏" | tombol back]
[PlayerHeader]
[Card berisi:]
  [Label mode: "Mode: Pilih Alat Ukur" atau "Mode: Konversi Satuan"]
  [Progress: soal ke-X dari 10]
  [Teks soal — font besar, terbaca]
  [4 tombol pilihan jawaban — grid 2×2]
[FeedbackBanner — muncul setelah jawaban]
```

### Tombol jawaban:
- Background: putih dengan border abu
- Saat dipilih & benar: hijau
- Saat dipilih & salah: merah, jawaban benar berubah hijau
- Setelah feedback 1.2 detik → soal berikutnya otomatis

### Sesi game:
- 10 soal per sesi (5 Mode A + 5 Mode B, acak)
- Setelah 10 soal: tampilkan layar hasil (skor X/10, koin didapat, tombol "Main Lagi" dan "Kembali")

---

## File yang Harus Dibuat/Diubah

1. **Buat** `src/minigames/Ipa7PengukuranGame.jsx` — komponen game lengkap sesuai spec di atas
2. **Ubah** `src/App.jsx` — ganti placeholder route `ipa7pengukuran` dengan:
   ```js
   ipa7pengukuran: lazy(() => import('./minigames/Ipa7PengukuranGame')),
   ```

---

## Checklist Sebelum Selesai

- [ ] Game bisa dimainkan penuh 10 soal tanpa error
- [ ] `addReward` dipanggil hanya untuk jawaban benar
- [ ] Pilihan jawaban diacak posisinya setiap soal
- [ ] FeedbackBanner tampil setelah jawaban (correct/incorrect)
- [ ] Tombol back di TopBar memanggil `onBack()`
- [ ] Tidak ada `console.error` di browser
