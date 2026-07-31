# Prompt 11 — IPA Kelas 9 BAB III: Life Cycle & Propagation Match

## Konteks Proyek

Aplikasi **TOMAT** — gamifikasi belajar SMP. Stack: React (Vite) + Express + PostgreSQL.  
Infrastruktur IPA sudah ada (Prompt 01). Route key game ini: `ipa9reproduksi`.  
File yang dibuat: `src/minigames/Ipa9ReproduksiGame.jsx`.

### Konvensi Wajib Game TOMAT

```jsx
import { usePlayer } from '../contexts/PlayerContext';
import { useSurvival } from '../hooks/useSurvival';
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared';

export default function Ipa9ReproduksiGame({ onBack }) {
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

## Materi BAB III: Sistem Reproduksi pada Makhluk Hidup

**Target kurikulum:**
- Organ reproduksi manusia (pria & wanita) dan fungsinya
- Siklus menstruasi dan kehamilan
- Kelainan/penyakit pada sistem reproduksi (HIV, sifilis, gonore, dll.)
- Reproduksi tumbuhan: vegetatif alami (rizom, stolon, umbi, tunas), vegetatif buatan (stek, cangkok, okulasi), generatif (penyerbukan & pembuahan)
- Reproduksi hewan: ovipar (bertelur), vivipar (beranak), ovovivipar, serta fragmentasi dan partenogenesis

---

## Mekanisme Game: Life Cycle & Propagation Match

Game quiz 3 mode bergantian, 10 soal per sesi.

### Mode A — "Reproduksi Manusia"

**Data soal (10 soal):**

```js
const MANUSIA_SOAL = [
  { soal: 'Organ reproduksi pria yang berfungsi memproduksi sperma adalah...', jawaban: 'Testis', salah: ['Epididimis', 'Vas deferens', 'Vesikula seminalis'] },
  { soal: 'Organ reproduksi wanita tempat pembuahan (fertilisasi) terjadi adalah...', jawaban: 'Tuba falopi (saluran telur)', salah: ['Ovarium', 'Uterus (rahim)', 'Vagina'] },
  { soal: 'Siklus menstruasi rata-rata berlangsung selama...', jawaban: '28 hari (± 7 hari)', salah: ['14 hari', '60 hari', '7 hari'] },
  { soal: 'Ovulasi adalah proses...', jawaban: 'Pelepasan sel telur matang dari ovarium ke tuba falopi', salah: ['Pembuahan sel telur oleh sperma', 'Menempelnya embrio ke dinding rahim', 'Luruhnya dinding rahim'] },
  { soal: 'Bila tidak terjadi pembuahan setelah ovulasi, yang terjadi adalah...', jawaban: 'Dinding rahim luruh → menstruasi', salah: ['Kehamilan terjadi', 'Sel telur tetap di tuba falopi', 'Ovulasi terjadi lagi segera'] },
  { soal: 'Penyakit menular seksual yang disebabkan bakteri Neisseria gonorrhoeae adalah...', jawaban: 'Gonore (kencing nanah)', salah: ['Sifilis', 'HIV/AIDS', 'Herpes genital'] },
  { soal: 'Penyakit sifilis disebabkan oleh...', jawaban: 'Bakteri Treponema pallidum', salah: ['Virus HIV', 'Jamur Candida', 'Bakteri E. coli'] },
  { soal: 'Tempat perkembangan janin selama kehamilan adalah...', jawaban: 'Uterus (rahim)', salah: ['Tuba falopi', 'Ovarium', 'Vagina'] },
  { soal: 'Hormon yang mempertahankan kehamilan dan mencegah menstruasi adalah...', jawaban: 'Progesteron', salah: ['Estrogen', 'FSH', 'LH'] },
  { soal: 'Epididimis berfungsi sebagai tempat...', jawaban: 'Pematangan dan penyimpanan sperma', salah: ['Produksi sperma', 'Penyaluran sperma keluar', 'Produksi hormon testosteron'] },
];
```

### Mode B — "Reproduksi Tumbuhan"

**Data soal (8 soal):**

```js
const TUMBUHAN_SOAL = [
  { soal: 'Reproduksi vegetatif ALAMI pada tumbuhan dengan menggunakan STOLON (geragih) ditemukan pada...', jawaban: 'Stroberi dan rumput teki', salah: ['Pisang', 'Jahe', 'Kentang'] },
  { soal: 'Reproduksi vegetatif buatan dengan memotong batang dan menanamnya disebut...', jawaban: 'Stek', salah: ['Cangkok', 'Okulasi', 'Sambung pucuk'] },
  { soal: 'Cangkok adalah metode perbanyakan tumbuhan dengan cara...', jawaban: 'Mengupas kulit cabang dan membungkusnya tanah agar berakar sebelum dipotong', salah: ['Menyambung dua tanaman berbeda', 'Memotong dan menanam batang', 'Menanam biji yang sudah dikecambahkan'] },
  { soal: 'Penyerbukan yang dibantu angin disebut...', jawaban: 'Anemogami', salah: ['Entomogami', 'Hidrogami', 'Ornitogami'] },
  { soal: 'Pada tumbuhan, pembuahan ganda menghasilkan...', jawaban: 'Embrio (calon tumbuhan baru) dan endosperma (cadangan makanan)', salah: ['Dua embrio sekaligus', 'Biji dan buah saja', 'Serbuk sari baru'] },
  { soal: 'Kentang berkembang biak secara vegetatif menggunakan...', jawaban: 'Umbi batang', salah: ['Rizom (rimpang)', 'Stolon', 'Tunas adventif'] },
  { soal: 'Okulasi adalah teknik perbanyakan vegetatif buatan dengan cara...', jawaban: 'Menempelkan mata tunas dari satu tanaman ke batang tanaman lain', salah: ['Memotong dan menanam cabang', 'Menyilangkan dua spesies berbeda', 'Membungkus akar batang yang dikupas'] },
  { soal: 'Tanaman jahe dan kunyit berkembang biak secara vegetatif dengan...', jawaban: 'Rizom (rimpang/batang yang menjalar di dalam tanah)', salah: ['Stolon', 'Umbi lapis', 'Tunas adventif'] },
];
```

### Mode C — "Reproduksi Hewan"

**Data soal (6 soal):**

```js
const HEWAN_SOAL = [
  { soal: 'Hewan yang melahirkan anak dan menyusui disebut...', jawaban: 'Vivipar', salah: ['Ovipar', 'Ovovivipar', 'Partenogenesis'] },
  { soal: 'Ikan hiu dan beberapa ular berkembang biak dengan cara OVOVIVIPAR, artinya...', jawaban: 'Telur berkembang di dalam tubuh induk, anak lahir hidup', salah: ['Bertelur seperti biasa di luar', 'Beranak dan menyusui', 'Berkembang biak tanpa pembuahan'] },
  { soal: 'Planaria (cacing pipih) dapat beregenerasi menjadi individu baru dari potongan tubuhnya. Cara ini disebut...', jawaban: 'Fragmentasi', salah: ['Tunas', 'Partenogenesis', 'Pembelahan biner'] },
  { soal: 'Lebah ratu menghasilkan telur yang menetas tanpa dibuahi oleh sperma. Cara ini disebut...', jawaban: 'Partenogenesis', salah: ['Fragmentasi', 'Tunas', 'Ovovivipar'] },
  { soal: 'Katak termasuk hewan ovipar. Pembuahan pada katak terjadi secara...', jawaban: 'Eksternal (di luar tubuh, di dalam air)', salah: ['Internal (di dalam tubuh)', 'Tidak ada pembuahan (partenogenesis)', 'Di dalam telur setelah dierami'] },
  { soal: 'Contoh hewan yang berkembang biak dengan cara OVIPAR (bertelur) adalah...', jawaban: 'Ayam, burung, dan buaya', salah: ['Anjing dan kucing', 'Ikan hiu dan ular garter', 'Kelelawar dan lumba-lumba'] },
];
```

---

## UI Game

```
[TopBar: "Life Cycle & Propagation Match 🌱" | tombol back]
[PlayerHeader]
[Card berisi:]
  [Label mode: "Reproduksi Manusia" / "Reproduksi Tumbuhan" / "Reproduksi Hewan"]
  [Progress: soal ke-X dari 10]
  [Emoji + teks soal]
  [4 tombol pilihan — grid 2×2]
[FeedbackBanner]
```

- Auto-next setelah 1.3 detik
- Layar akhir: skor X/10, total koin, tombol "Main Lagi" dan "Kembali"

---

## File yang Harus Dibuat/Diubah

1. **Buat** `src/minigames/Ipa9ReproduksiGame.jsx`
2. **Ubah** `src/App.jsx` — ganti placeholder `ipa9reproduksi` dengan:
   ```js
   ipa9reproduksi: lazy(() => import('./minigames/Ipa9ReproduksiGame')),
   ```

## Checklist

- [ ] Tiga mode berjalan tanpa error
- [ ] `addReward` hanya dipanggil saat jawaban benar
- [ ] Pilihan jawaban diacak posisinya setiap soal
- [ ] FeedbackBanner tampil dengan benar
- [ ] Tidak ada crash saat 10 soal selesai
