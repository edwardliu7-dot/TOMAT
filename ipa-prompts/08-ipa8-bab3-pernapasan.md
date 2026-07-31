# Prompt 08 — IPA Kelas 8 BAB III: Respiration & Kidney Factory

## Konteks Proyek

Aplikasi **TOMAT** — gamifikasi belajar SMP. Stack: React (Vite) + Express + PostgreSQL.  
Infrastruktur IPA sudah ada (Prompt 01). Route key game ini: `ipa8pernapasan`.  
File yang dibuat: `src/minigames/Ipa8PernapasanGame.jsx`.

### Konvensi Wajib Game TOMAT

```jsx
import { usePlayer } from '../contexts/PlayerContext';
import { useSurvival } from '../hooks/useSurvival';
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared';

export default function Ipa8PernapasanGame({ onBack }) {
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

## Materi BAB III: Sistem Pernapasan dan Ekskresi

**Target kurikulum:**
- Organ pernapasan: hidung, faring, laring, trakea, bronkus, bronkiolus, alveolus, paru-paru
- Mekanisme pernapasan: inspirasi (diafragma turun, dada mengembang) vs ekspirasi
- Pertukaran gas di alveolus: O₂ masuk darah, CO₂ keluar
- Volume udara pernapasan (tidal, cadangan inspirasi, cadangan ekspirasi, residu)
- Organ ekskresi: ginjal (urin), kulit (keringat), paru-paru (CO₂+uap air), hati (bilirubin)
- Proses pembentukan urin: filtrasi (glomerulus) → reabsorpsi (tubulus proksimal) → augmentasi (tubulus distal)
- Kelainan: asma, TBC, pneumonia, batu ginjal, gagal ginjal, diabetes insipidus

---

## Mekanisme Game: Respiration & Kidney Factory

Game quiz 3 mode bergantian, 10 soal per sesi.

### Mode A — "Sistem Pernapasan"

**Data soal (10 soal):**

```js
const NAPAS_SOAL = [
  { soal: 'Tempat pertukaran O₂ dan CO₂ di paru-paru terjadi di...', jawaban: 'Alveolus', salah: ['Bronkus', 'Trakea', 'Laring'] },
  { soal: 'Saat INSPIRASI (menghirup udara), diafragma bergerak...', jawaban: 'Ke bawah (berkontraksi) sehingga rongga dada membesar', salah: ['Ke atas sehingga rongga dada mengecil', 'Tidak bergerak', 'Ke samping'] },
  { soal: 'Organ yang berfungsi menyaring udara, menghangatkan, dan melembapkan udara sebelum masuk paru-paru adalah...', jawaban: 'Hidung (rongga hidung)', salah: ['Laring', 'Trakea', 'Bronkus'] },
  { soal: 'Epiglotis berfungsi untuk...', jawaban: 'Menutup saluran pernapasan saat menelan makanan', salah: ['Memproduksi suara', 'Menghangatkan udara', 'Memperluas permukaan paru-paru'] },
  { soal: 'Volume udara yang masuk-keluar saat bernapas normal (tidak dipaksakan) disebut...', jawaban: 'Volume tidal', salah: ['Volume cadangan inspirasi', 'Volume residu', 'Kapasitas vital'] },
  { soal: 'Gas yang dikeluarkan paru-paru sebagai produk sisa respirasi sel adalah...', jawaban: 'CO₂ (karbon dioksida) dan uap air', salah: ['O₂ (oksigen)', 'N₂ (nitrogen)', 'H₂ (hidrogen)'] },
  { soal: 'Penyakit paru-paru akibat infeksi bakteri Mycobacterium tuberculosis disebut...', jawaban: 'Tuberkulosis (TBC)', salah: ['Asma', 'Pneumonia', 'Bronkitis'] },
  { soal: 'Asma adalah kondisi di mana saluran pernapasan...', jawaban: 'Menyempit dan meradang sehingga sulit bernapas', salah: ['Terinfeksi bakteri', 'Berisi cairan', 'Tersumbat batu'] },
  { soal: 'Urutan organ pernapasan dari luar ke dalam yang benar adalah...', jawaban: 'Hidung → Faring → Laring → Trakea → Bronkus → Alveolus', salah: ['Hidung → Laring → Faring → Bronkus → Trakea', 'Hidung → Trakea → Laring → Bronkus → Alveolus', 'Mulut → Trakea → Bronkus → Laring → Alveolus'] },
  { soal: 'Di alveolus, O₂ berpindah ke darah dan CO₂ berpindah ke alveolus melalui proses...', jawaban: 'Difusi (dari konsentrasi tinggi ke rendah)', salah: ['Osmosis', 'Transpor aktif', 'Filtrasi'] },
];
```

### Mode B — "Sistem Ekskresi & Pembentukan Urin"

**Data soal (8 soal):**

```js
const EKSKRESI_SOAL = [
  { soal: 'Tahap pertama pembentukan urin di ginjal adalah...', jawaban: 'Filtrasi di glomerulus → menghasilkan urin primer', salah: ['Reabsorpsi di tubulus', 'Augmentasi di tubulus distal', 'Sekresi di tubulus kolektivus'] },
  { soal: 'Pada tahap REABSORPSI, zat yang diserap kembali ke darah adalah...', jawaban: 'Glukosa, asam amino, air, dan garam yang masih dibutuhkan', salah: ['Urea dan kreatinin', 'CO₂ dan toksin', 'Hanya air saja'] },
  { soal: 'Pada tahap AUGMENTASI, terjadi penambahan zat sisa dari darah ke dalam urin sekunder. Zat yang ditambahkan adalah...', jawaban: 'Ion H⁺, NH₃, dan sisa obat-obatan', salah: ['Glukosa dan asam amino', 'O₂ dan hormon', 'Hanya air'] },
  { soal: 'Organ ekskresi yang mengeluarkan keringat (air, garam, dan sedikit urea) adalah...', jawaban: 'Kulit', salah: ['Ginjal', 'Paru-paru', 'Hati'] },
  { soal: 'Organ ekskresi yang bertugas mengurai hemoglobin tua menjadi bilirubin adalah...', jawaban: 'Hati (liver)', salah: ['Ginjal', 'Paru-paru', 'Kulit'] },
  { soal: 'Penyakit ginjal berupa endapan kristal garam mineral di saluran kemih disebut...', jawaban: 'Batu ginjal (nefrolitiasis)', salah: ['Gagal ginjal', 'Diabetes insipidus', 'Nefritis'] },
  { soal: 'Diabetes insipidus terjadi karena kekurangan hormon ADH, sehingga...', jawaban: 'Produksi urin sangat banyak dan encer', salah: ['Urin sangat sedikit dan pekat', 'Ginjal tidak bisa menyaring', 'Batu ginjal terbentuk'] },
  { soal: 'Urutan aliran urin yang benar setelah terbentuk di nefron adalah...', jawaban: 'Tubulus kolektivus → Pelvis ginjal → Ureter → Kandung kemih → Uretra', salah: ['Nefron → Uretra → Kandung kemih', 'Glomerulus → Uretra → Kandung kemih', 'Pelvis → Urethra → Ureter'] },
];
```

### Mode C — "Benar atau Salah?"

**Data soal (6 soal):**

```js
const BENAR_SALAH = [
  { pernyataan: 'Paru-paru termasuk organ ekskresi karena mengeluarkan CO₂ dan uap air.', jawaban: true, penjelasan: 'Benar! Paru-paru adalah salah satu dari 4 organ ekskresi (ginjal, kulit, paru-paru, hati).' },
  { pernyataan: 'Filtrasi glomerulus menghasilkan urin yang sudah siap dikeluarkan dari tubuh.', jawaban: false, penjelasan: 'Salah! Filtrasi menghasilkan urin PRIMER yang masih mengandung zat berguna. Urin final terbentuk setelah reabsorpsi dan augmentasi.' },
  { pernyataan: 'Saat ekspirasi, tulang rusuk bergerak ke bawah dan ke dalam sehingga rongga dada mengecil.', jawaban: true, penjelasan: 'Benar! Saat ekspirasi, diafragma naik dan tulang rusuk turun, memaksa udara keluar.' },
  { pernyataan: 'Nefron adalah unit terkecil penyaring darah yang hanya ditemukan di korteks ginjal.', jawaban: false, penjelasan: 'Salah! Nefron terdiri dari bagian di korteks (glomerulus, kapsul Bowman) DAN medula (tubulus).' },
  { pernyataan: 'Alveolus dikelilingi kapiler darah untuk memudahkan pertukaran gas.', jawaban: true, penjelasan: 'Benar! Alveolus memiliki dinding satu lapis sel tipis dan dikelilingi banyak kapiler untuk difusi O₂ dan CO₂.' },
  { pernyataan: 'Ginjal kiri letaknya lebih rendah dari ginjal kanan karena terdesak hati.', jawaban: false, penjelasan: 'Salah! Ginjal KANAN yang letaknya lebih rendah karena terdesak oleh hati yang ada di sebelah kanan.' },
];
```

---

## UI Game

```
[TopBar: "Respiration & Kidney Factory 🫁" | tombol back]
[PlayerHeader]
[Card berisi:]
  [Label mode: "Sistem Pernapasan" / "Sistem Ekskresi" / "Benar atau Salah"]
  [Progress: soal ke-X dari 10]
  [Emoji + teks soal]
  [Mode A & B: 4 tombol pilihan — grid 2×2]
  [Mode C: 2 tombol besar — ✅ BENAR | ❌ SALAH]
[FeedbackBanner dengan penjelasan untuk Mode C]
```

- Auto-next setelah 1.3 detik (Mode C: 1.5 detik)
- Layar akhir: skor X/10, total koin, tombol "Main Lagi" dan "Kembali"

---

## File yang Harus Dibuat/Diubah

1. **Buat** `src/minigames/Ipa8PernapasanGame.jsx`
2. **Ubah** `src/App.jsx` — ganti placeholder `ipa8pernapasan` dengan:
   ```js
   ipa8pernapasan: lazy(() => import('./minigames/Ipa8PernapasanGame')),
   ```

## Checklist

- [ ] Tiga mode berjalan tanpa error
- [ ] FeedbackBanner menampilkan penjelasan untuk Mode C
- [ ] `addReward` hanya dipanggil saat jawaban benar
- [ ] Pilihan jawaban diacak posisinya
- [ ] Tidak ada crash saat 10 soal selesai
