# Prompt 03 — IPA Kelas 7 BAB II: Fluid & Molecular Quest

## Konteks Proyek

Aplikasi **TOMAT** — gamifikasi belajar SMP. Stack: React (Vite) + Express + PostgreSQL.  
Infrastruktur IPA sudah ada (Prompt 01). Route key game ini: `ipa7zat`.  
File yang dibuat: `src/minigames/Ipa7ZatGame.jsx`.

### Konvensi Wajib Game TOMAT

```jsx
import { usePlayer } from '../contexts/PlayerContext';
import { useSurvival } from '../hooks/useSurvival';
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared';

export default function Ipa7ZatGame({ onBack }) {
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

## Materi BAB II: Zat, Wujud Zat, dan Perubahannya

**Target kurikulum:**
- Tiga wujud zat: padat, cair, gas — sifat masing-masing
- Perubahan wujud: mencair, membeku, menguap, mengembun, menyublim, mengkristal
- Kohesi (gaya tarik antar molekul sejenis) vs Adhesi (gaya tarik antar molekul berbeda jenis)
- Kapilaritas — air merambat naik pada pipa kapiler
- Meniskus cekung (air di kaca) vs cembung (air raksa di kaca)

---

## Mekanisme Game: Fluid & Molecular Quest

Game quiz 3 mode bergantian secara acak, 10 soal per sesi.

### Mode A — "Identifikasi Wujud Zat"

Tampilkan deskripsi benda/fenomena, siswa memilih wujud zatnya.

**Data soal (8 soal):**

```js
const WUJUD_SOAL = [
  { deskripsi: 'Benda ini memiliki bentuk tetap dan volume tetap. Contoh: batu dan logam. 🪨', jawaban: 'Padat', salah: ['Cair', 'Gas', 'Plasma'] },
  { deskripsi: 'Benda ini mengikuti bentuk wadahnya tetapi volume tetap. Contoh: air dan minyak. 💧', jawaban: 'Cair', salah: ['Padat', 'Gas', 'Plasma'] },
  { deskripsi: 'Benda ini mengisi seluruh ruang wadahnya. Bentuk dan volume berubah. Contoh: oksigen. 💨', jawaban: 'Gas', salah: ['Padat', 'Cair', 'Plasma'] },
  { deskripsi: 'Es batu berubah menjadi air saat dipanaskan. Perubahan wujud ini disebut... 🧊→💧', jawaban: 'Mencair (Meleleh)', salah: ['Membeku', 'Menguap', 'Menyublim'] },
  { deskripsi: 'Air berubah menjadi uap air saat dipanaskan. Perubahan wujud ini disebut... 💧→☁️', jawaban: 'Menguap', salah: ['Mengembun', 'Mencair', 'Mengkristal'] },
  { deskripsi: 'Uap air di udara berubah menjadi titik-titik air di permukaan gelas dingin. Ini disebut... ❄️', jawaban: 'Mengembun', salah: ['Menguap', 'Membeku', 'Mencair'] },
  { deskripsi: 'Kapur barus (kamper) langsung berubah dari padat ke gas tanpa jadi cair. Ini disebut... 🧴', jawaban: 'Menyublim', salah: ['Menguap', 'Mengkristal', 'Membeku'] },
  { deskripsi: 'Air didinginkan hingga 0°C dan berubah menjadi es. Perubahan wujud ini disebut... ❄️', jawaban: 'Membeku', salah: ['Mengembun', 'Mengkristal', 'Mencair'] },
];
```

### Mode B — "Kohesi, Adhesi, atau Kapilaritas?"

Tampilkan fenomena, siswa mengidentifikasi jenis gaya/fenomena.

**Data soal (8 soal):**

```js
const GAYA_SOAL = [
  { fenomena: 'Air tidak mau bercampur dengan minyak karena molekul air lebih tertarik ke sesama air. 🫧', jawaban: 'Kohesi', salah: ['Adhesi', 'Kapilaritas', 'Tegangan permukaan'] },
  { fenomena: 'Air menempel pada dinding gelas kaca dan membentuk cekungan (meniskus cekung). 🥛', jawaban: 'Adhesi', salah: ['Kohesi', 'Kapilaritas', 'Gravitasi'] },
  { fenomena: 'Air raksa tidak membasahi kaca, justru membentuk benjolan (meniskus cembung). ⚗️', jawaban: 'Kohesi > Adhesi', salah: ['Adhesi > Kohesi', 'Kapilaritas', 'Tegangan permukaan'] },
  { fenomena: 'Air naik sendiri melalui pipa tipis (sedotan kecil) meskipun tidak dipompa. 🌿', jawaban: 'Kapilaritas', salah: ['Kohesi', 'Adhesi', 'Gravitasi'] },
  { fenomena: 'Air bisa merembes naik pada kain lap/handuk sehingga seluruh kain basah. 🧻', jawaban: 'Kapilaritas', salah: ['Adhesi', 'Kohesi', 'Osmosis'] },
  { fenomena: 'Nyamuk bisa berjalan di atas permukaan air tanpa tenggelam. 🦟', jawaban: 'Tegangan permukaan (Kohesi)', salah: ['Adhesi', 'Kapilaritas', 'Gravitasi'] },
  { fenomena: 'Tumbuhan bisa mengangkat air dari akar ke daun melalui pembuluh xilem yang tipis. 🌱', jawaban: 'Kapilaritas', salah: ['Osmosis', 'Kohesi', 'Adhesi'] },
  { fenomena: 'Cat dapat menempel pada dinding karena gaya tarik antara cat dan dinding. 🖌️', jawaban: 'Adhesi', salah: ['Kohesi', 'Kapilaritas', 'Gravitasi'] },
];
```

### Mode C — "Benar atau Salah?" (True/False)

Tampilkan pernyataan, siswa menekan ✅ Benar atau ❌ Salah.

**Data soal (6 soal):**

```js
const BENAR_SALAH = [
  { pernyataan: 'Zat cair memiliki bentuk tetap tetapi volume yang berubah-ubah.', jawaban: false, penjelasan: 'Salah! Zat cair memiliki volume tetap, tetapi bentuknya mengikuti wadah.' },
  { pernyataan: 'Menyublim adalah perubahan wujud dari padat langsung ke gas.', jawaban: true, penjelasan: 'Benar! Contoh: kapur barus dan es kering (dry ice).' },
  { pernyataan: 'Adhesi adalah gaya tarik-menarik antara molekul yang sejenis.', jawaban: false, penjelasan: 'Salah! Adhesi adalah gaya tarik antara molekul berbeda jenis. Kohesi yang sejenis.' },
  { pernyataan: 'Kapilaritas bisa terjadi karena adanya gaya adhesi dan kohesi bersama-sama.', jawaban: true, penjelasan: 'Benar! Kapilaritas terjadi ketika adhesi lebih besar dari kohesi.' },
  { pernyataan: 'Air raksa di dalam pipa kaca membentuk meniskus cekung.', jawaban: false, penjelasan: 'Salah! Air raksa membentuk meniskus cembung karena kohesi > adhesi.' },
  { pernyataan: 'Mengembun adalah perubahan wujud dari gas menjadi cair.', jawaban: true, penjelasan: 'Benar! Contoh: embun pagi hari dan titik air di gelas dingin.' },
];
```

---

## UI Game

### Layout:
```
[TopBar: "Fluid & Molecular Quest 💧" | tombol back]
[PlayerHeader]
[Label mode + progress soal ke-X dari 10]
[Card soal:]
  [Emoji besar + teks fenomena/deskripsi]
  [Mode A & B: 4 tombol pilihan jawaban, grid 2×2]
  [Mode C: 2 tombol besar — ✅ BENAR | ❌ SALAH]
[FeedbackBanner dengan penjelasan singkat]
```

### FeedbackBanner:
- Untuk Mode C, tampilkan juga teks `penjelasan` dari data soal di dalam FeedbackBanner agar siswa belajar.
- Delay auto-next: 1.5 detik (sedikit lebih lama karena ada penjelasan).

### Sesi:
- 10 soal: campuran acak dari 3 mode
- Layar akhir: skor, koin, tombol "Main Lagi" & "Kembali"

---

## File yang Harus Dibuat/Diubah

1. **Buat** `src/minigames/Ipa7ZatGame.jsx`
2. **Ubah** `src/App.jsx` — ganti placeholder `ipa7zat` dengan:
   ```js
   ipa7zat: lazy(() => import('./minigames/Ipa7ZatGame')),
   ```

## Checklist

- [ ] Tiga mode berjalan (pilihan ganda, gaya tarik-menarik, benar/salah)
- [ ] FeedbackBanner menampilkan penjelasan untuk mode Benar/Salah
- [ ] `addReward` hanya dipanggil saat jawaban benar
- [ ] Pilihan jawaban diacak posisinya
- [ ] Tidak ada crash saat 10 soal selesai
