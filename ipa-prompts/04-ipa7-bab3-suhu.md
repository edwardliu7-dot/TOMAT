# Prompt 04 — IPA Kelas 7 BAB III: Thermal Control Center

## Konteks Proyek

Aplikasi **TOMAT** — gamifikasi belajar SMP. Stack: React (Vite) + Express + PostgreSQL.  
Infrastruktur IPA sudah ada (Prompt 01). Route key game ini: `ipa7suhu`.  
File yang dibuat: `src/minigames/Ipa7SuhuGame.jsx`.

### Konvensi Wajib Game TOMAT

```jsx
import { usePlayer } from '../contexts/PlayerContext';
import { useSurvival } from '../hooks/useSurvival';
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared';

export default function Ipa7SuhuGame({ onBack }) {
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

- Jawaban benar: `addReward({ coins: 15, exp: 10 })` + `onCorrect()`
- Jawaban salah: `onWrong()`
- Selalu ada `TopBar` dengan tombol back (`onBack`) dan `PlayerHeader`

---

## Materi BAB III: Suhu, Pemuaian, dan Kalor

**Target kurikulum:**
- Pengertian suhu dan alat ukurnya (termometer)
- Empat skala suhu: Celsius, Fahrenheit, Kelvin, Reamur
- Rumus konversi antar skala suhu
- Pemuaian zat padat, cair, dan gas
- Kalor: perpindahan panas (konduksi, konveksi, radiasi)

**Rumus konversi suhu (wajib ada di kode sebagai komentar):**
```
°C → °F : (C × 9/5) + 32
°C → K  : C + 273
°C → °R : C × 4/5
°F → °C : (F − 32) × 5/9
```

---

## Mekanisme Game: Thermal Control Center

Game quiz 3 mode bergantian, 10 soal per sesi.

### Mode A — "Konversi Suhu"

Tampilkan soal konversi suhu, siswa memilih jawaban benar dari 4 pilihan.

**Data soal (minimal 10 soal):**

```js
const KONVERSI_SOAL = [
  { soal: '100°C = ___ °F',   jawaban: 212,    salah: [100, 180, 373]  },
  { soal: '0°C = ___ °F',     jawaban: 32,     salah: [0, 273, -32]    },
  { soal: '100°C = ___ K',    jawaban: 373,    salah: [100, 273, 212]  },
  { soal: '0°C = ___ K',      jawaban: 273,    salah: [0, 100, 373]    },
  { soal: '100°C = ___ °R',   jawaban: 80,     salah: [100, 125, 60]   },
  { soal: '40°C = ___ °R',    jawaban: 32,     salah: [40, 50, 36]     },
  { soal: '37°C = ___ K',     jawaban: 310,    salah: [273, 237, 37]   },
  { soal: '212°F = ___ °C',   jawaban: 100,    salah: [212, 180, 120]  },
  { soal: '32°F = ___ °C',    jawaban: 0,      salah: [32, -32, 100]   },
  { soal: '60°C = ___ °F',    jawaban: 140,    salah: [100, 160, 120]  },
  { soal: '25°C = ___ K',     jawaban: 298,    salah: [248, 273, 325]  },
  { soal: '20°C = ___ °R',    jawaban: 16,     salah: [20, 25, 24]     },
];
```

Acak posisi 4 pilihan setiap soal.

### Mode B — "Pemuaian Zat"

Tampilkan fenomena pemuaian, siswa memilih jenis pemuaian atau zat yang dimaksud.

**Data soal (8 soal):**

```js
const PEMUAIAN_SOAL = [
  {
    soal: 'Kabel listrik di luar ruangan tampak lebih kendur di siang hari dibanding malam hari. Fenomena ini disebut pemuaian...',
    jawaban: 'Zat Padat (panjang)',
    salah: ['Zat Cair', 'Zat Gas', 'Zat Padat (volume)']
  },
  {
    soal: 'Balon gas yang diisi penuh lalu diletakkan di tempat panas akan mengembang dan bisa meletus. Ini contoh pemuaian...',
    jawaban: 'Zat Gas',
    salah: ['Zat Padat', 'Zat Cair', 'Pemuaian termal']
  },
  {
    soal: 'Sambungan rel kereta api diberi celah kecil antar logam. Tujuannya adalah untuk...',
    jawaban: 'Memberi ruang pemuaian agar rel tidak bengkok',
    salah: ['Menghemat bahan logam', 'Memperkuat sambungan', 'Mencegah korosi']
  },
  {
    soal: 'Termometer bekerja berdasarkan prinsip pemuaian...',
    jawaban: 'Zat Cair (raksa/alkohol)',
    salah: ['Zat Padat', 'Zat Gas', 'Pemuaian udara']
  },
  {
    soal: 'Zat yang memuai paling besar untuk kenaikan suhu yang sama adalah...',
    jawaban: 'Gas',
    salah: ['Padat', 'Cair', 'Semua sama']
  },
  {
    soal: 'Botol kaca berisi air penuh, lalu dipanaskan. Kemungkinan yang terjadi adalah...',
    jawaban: 'Botol bisa pecah karena air memuai lebih cepat dari kaca',
    salah: ['Air menyusut karena panas', 'Tidak terjadi apa-apa', 'Kaca memuai lebih cepat dari air']
  },
  {
    soal: 'Ban mobil bisa kempes di cuaca sangat dingin. Ini karena...',
    jawaban: 'Gas di dalam ban menyusut (berkurang volume) saat dingin',
    salah: ['Ban bocor karena suhu rendah', 'Karet mengembang saat dingin', 'Tekanan ban tidak berubah']
  },
  {
    soal: 'Perbedaan pemuaian panjang dan pemuaian volume adalah...',
    jawaban: 'Pemuaian panjang untuk 1 dimensi, volume untuk 3 dimensi',
    salah: ['Tidak ada perbedaan', 'Pemuaian volume hanya untuk gas', 'Pemuaian panjang hanya untuk cair']
  },
];
```

### Mode C — "Perpindahan Kalor"

Tampilkan fenomena, siswa memilih jenis perpindahan kalor (Konduksi / Konveksi / Radiasi).

**Data soal (6 soal):**

```js
const KALOR_SOAL = [
  { fenomena: 'Ujung sendok logam menjadi panas saat dicelupkan ke dalam sup panas. 🥄🔥', jawaban: 'Konduksi', salah: ['Konveksi', 'Radiasi', 'Evaporasi'] },
  { fenomena: 'Air di panci dipanaskan — air di bawah naik ke atas dan yang di atas turun membentuk arus. 🫕', jawaban: 'Konveksi', salah: ['Konduksi', 'Radiasi', 'Konduksi & Radiasi'] },
  { fenomena: 'Kita merasakan hangat dari sinar matahari meskipun tidak menyentuh matahari. ☀️', jawaban: 'Radiasi', salah: ['Konduksi', 'Konveksi', 'Induksi'] },
  { fenomena: 'Api unggun menghangatkan orang yang berdiri di dekatnya tanpa harus menyentuh api. 🔥', jawaban: 'Radiasi', salah: ['Konduksi', 'Konveksi', 'Evaporasi'] },
  { fenomena: 'Angin laut terjadi karena udara di atas daratan yang panas naik, digantikan udara dari laut. 🌊', jawaban: 'Konveksi', salah: ['Konduksi', 'Radiasi', 'Adveksi'] },
  { fenomena: 'Setrika menghangatkan pakaian dengan cara menempel langsung pada kain. 👔', jawaban: 'Konduksi', salah: ['Konveksi', 'Radiasi', 'Induksi'] },
];
```

---

## UI Game

```
[TopBar: "Thermal Control Center 🌡️" | tombol back]
[PlayerHeader]
[Card berisi:]
  [Label mode: "Konversi Suhu" / "Pemuaian Zat" / "Perpindahan Kalor"]
  [Progress: soal ke-X dari 10]
  [Emoji besar + teks soal]
  [4 tombol pilihan — grid 2×2]
[FeedbackBanner]
```

- Tombol jawaban: background putih border abu
- Saat benar: hijau; saat salah: merah, jawaban benar tetap hijau
- Auto-next setelah 1.3 detik
- Layar akhir: skor X/10, total koin, tombol "Main Lagi" dan "Kembali"

---

## File yang Harus Dibuat/Diubah

1. **Buat** `src/minigames/Ipa7SuhuGame.jsx`
2. **Ubah** `src/App.jsx` — ganti placeholder `ipa7suhu` dengan:
   ```js
   ipa7suhu: lazy(() => import('./minigames/Ipa7SuhuGame')),
   ```

## Checklist

- [ ] Tiga mode berjalan tanpa error
- [ ] Rumus konversi suhu menghasilkan jawaban yang benar secara matematis
- [ ] `addReward` hanya dipanggil saat jawaban benar
- [ ] Pilihan jawaban diacak posisinya setiap soal
- [ ] FeedbackBanner tampil dengan benar (correct/incorrect)
- [ ] Tidak ada crash saat 10 soal selesai
