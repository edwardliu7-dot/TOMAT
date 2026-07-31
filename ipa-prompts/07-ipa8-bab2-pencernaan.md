# Prompt 07 — IPA Kelas 8 BAB II: Nutrient Test & Blood Transfusion Master

## Konteks Proyek

Aplikasi **TOMAT** — gamifikasi belajar SMP. Stack: React (Vite) + Express + PostgreSQL.  
Infrastruktur IPA sudah ada (Prompt 01). Route key game ini: `ipa8pencernaan`.  
File yang dibuat: `src/minigames/Ipa8PencernaanGame.jsx`.

### Konvensi Wajib Game TOMAT

```jsx
import { usePlayer } from '../contexts/PlayerContext';
import { useSurvival } from '../hooks/useSurvival';
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared';

export default function Ipa8PencernaanGame({ onBack }) {
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

## Materi BAB II: Sistem Pencernaan dan Peredaran Darah

**Target kurikulum:**
- Zat makanan dan fungsinya: karbohidrat, protein, lemak, vitamin, mineral, air
- Uji makanan: reagen Lugol (amilum), Biuret (protein), Benedict (glukosa), kertas buram (lemak)
- Organ pencernaan dan fungsinya (mulut → faring → esofagus → lambung → usus halus → usus besar → anus)
- Enzim pencernaan
- Komponen darah: plasma, eritrosit, leukosit, trombosit
- Golongan darah ABO dan aturan transfusi
- Organ jantung dan peredaran darah (peredaran kecil dan besar)
- Kelainan/penyakit: anemia, hipertensi, leukemia, hemofilia

---

## Mekanisme Game: Nutrient Test & Blood Transfusion Master

Game quiz 3 mode bergantian, 10 soal per sesi.

### Mode A — "Uji Makanan & Zat Gizi"

Tampilkan skenario uji makanan atau soal zat gizi, siswa memilih jawaban benar.

**Data soal (10 soal):**

```js
const GIZI_SOAL = [
  { soal: 'Reagen Lugol (yodium) diteteskan ke sampel makanan dan hasilnya BIRU KEHITAMAN. Kandungannya adalah...', jawaban: 'Amilum (karbohidrat/pati)', salah: ['Protein', 'Lemak', 'Glukosa'] },
  { soal: 'Reagen Benedict dipanaskan dengan larutan glukosa. Warna yang muncul adalah...', jawaban: 'Merah bata / oranye', salah: ['Biru kehitaman', 'Ungu', 'Tidak berubah warna'] },
  { soal: 'Reagen Biuret diteteskan ke putih telur (protein). Warna yang muncul adalah...', jawaban: 'Ungu / violet', salah: ['Merah bata', 'Biru kehitaman', 'Kuning'] },
  { soal: 'Untuk uji kandungan LEMAK pada makanan, digunakan...', jawaban: 'Kertas buram / kertas HVS (uji noda)', salah: ['Reagen Lugol', 'Reagen Benedict', 'Reagen Biuret'] },
  { soal: 'Fungsi utama karbohidrat bagi tubuh adalah...', jawaban: 'Sumber energi utama', salah: ['Membangun jaringan otot', 'Melarutkan vitamin', 'Membentuk hormon'] },
  { soal: 'Zat makanan yang berfungsi untuk MEMBANGUN dan MEMPERBAIKI jaringan tubuh adalah...', jawaban: 'Protein', salah: ['Karbohidrat', 'Lemak', 'Vitamin'] },
  { soal: 'Enzim yang diproduksi pankreas untuk memecah lemak disebut...', jawaban: 'Lipase', salah: ['Amilase', 'Protease', 'Sukrase'] },
  { soal: 'Organ pencernaan yang menghasilkan EMPEDU untuk mengemulsikan lemak adalah...', jawaban: 'Hati (liver)', salah: ['Pankreas', 'Lambung', 'Usus halus'] },
  { soal: 'Penyerapan sari makanan terjadi di...', jawaban: 'Usus halus (jejunum & ileum)', salah: ['Lambung', 'Usus besar', 'Mulut'] },
  { soal: 'Enzim amilase di mulut berfungsi memecah...', jawaban: 'Amilum (pati) menjadi maltosa', salah: ['Protein menjadi asam amino', 'Lemak menjadi gliserol', 'Glukosa menjadi energi'] },
];
```

### Mode B — "Golongan Darah & Transfusi"

Tampilkan soal golongan darah ABO, siswa memilih jawaban benar.

**Data soal (8 soal):**

```js
const DARAH_SOAL = [
  { soal: 'Golongan darah yang disebut "donor universal" karena dapat mendonorkan ke semua golongan adalah...', jawaban: 'O', salah: ['A', 'B', 'AB'] },
  { soal: 'Golongan darah yang disebut "resipien universal" karena dapat menerima dari semua golongan adalah...', jawaban: 'AB', salah: ['A', 'B', 'O'] },
  { soal: 'Golongan darah A boleh menerima transfusi dari golongan...', jawaban: 'A dan O', salah: ['A dan B', 'Semua golongan', 'Hanya A'] },
  { soal: 'Komponen darah yang berfungsi mengangkut oksigen adalah...', jawaban: 'Eritrosit (sel darah merah)', salah: ['Leukosit', 'Trombosit', 'Plasma darah'] },
  { soal: 'Komponen darah yang berfungsi dalam pembekuan darah saat luka adalah...', jawaban: 'Trombosit (keping darah)', salah: ['Eritrosit', 'Leukosit', 'Plasma'] },
  { soal: 'Peredaran darah kecil adalah sirkulasi antara...', jawaban: 'Jantung → Paru-paru → Jantung', salah: ['Jantung → Seluruh tubuh → Jantung', 'Paru-paru → Seluruh tubuh', 'Ginjal → Jantung'] },
  { soal: 'Penyakit di mana kadar hemoglobin rendah sehingga tubuh kekurangan oksigen disebut...', jawaban: 'Anemia', salah: ['Leukemia', 'Hemofilia', 'Hipertensi'] },
  { soal: 'Golongan darah B boleh mendonorkan ke golongan...', jawaban: 'B dan AB', salah: ['Semua golongan', 'Hanya B', 'A dan AB'] },
];
```

### Mode C — "Benar atau Salah?"

Tampilkan pernyataan, siswa menekan ✅ Benar atau ❌ Salah.

**Data soal (6 soal):**

```js
const BENAR_SALAH = [
  { pernyataan: 'Golongan darah O bisa menerima transfusi dari semua golongan darah.', jawaban: false, penjelasan: 'Salah! O hanya bisa menerima dari O. Tapi O bisa MENDONORKAN ke semua golongan.' },
  { pernyataan: 'Enzim pepsin di lambung berfungsi memecah protein.', jawaban: true, penjelasan: 'Benar! Pepsin diaktifkan oleh asam lambung (HCl) untuk mencerna protein.' },
  { pernyataan: 'Usus besar berfungsi menyerap sari-sari makanan.', jawaban: false, penjelasan: 'Salah! Usus besar berfungsi menyerap air dan garam mineral. Penyerapan sari makanan di usus halus.' },
  { pernyataan: 'Leukosit (sel darah putih) berfungsi melawan penyakit dan infeksi.', jawaban: true, penjelasan: 'Benar! Leukosit adalah bagian dari sistem imun tubuh.' },
  { pernyataan: 'Reagen Lugol yang berubah jadi ungu menandakan adanya protein.', jawaban: false, penjelasan: 'Salah! Lugol berubah jadi biru-hitam untuk amilum. Warna ungu adalah hasil reagen Biuret untuk protein.' },
  { pernyataan: 'Pankreas menghasilkan enzim lipase, amilase, dan protease sekaligus.', jawaban: true, penjelasan: 'Benar! Pankreas adalah kelenjar pencernaan yang menghasilkan banyak jenis enzim.' },
];
```

---

## UI Game

```
[TopBar: "Nutrient Test & Blood Lab 🩸" | tombol back]
[PlayerHeader]
[Card berisi:]
  [Label mode: "Uji Makanan & Gizi" / "Golongan Darah" / "Benar atau Salah"]
  [Progress: soal ke-X dari 10]
  [Emoji + teks soal]
  [Mode A & B: 4 tombol pilihan — grid 2×2]
  [Mode C: 2 tombol besar — ✅ BENAR | ❌ SALAH]
[FeedbackBanner dengan penjelasan untuk Mode C]
```

- Auto-next setelah 1.3 detik (Mode C: 1.5 detik karena ada penjelasan)
- Layar akhir: skor X/10, total koin, tombol "Main Lagi" dan "Kembali"

---

## File yang Harus Dibuat/Diubah

1. **Buat** `src/minigames/Ipa8PencernaanGame.jsx`
2. **Ubah** `src/App.jsx` — ganti placeholder `ipa8pencernaan` dengan:
   ```js
   ipa8pencernaan: lazy(() => import('./minigames/Ipa8PencernaanGame')),
   ```

## Checklist

- [ ] Tiga mode berjalan tanpa error
- [ ] FeedbackBanner menampilkan penjelasan untuk Mode C (Benar/Salah)
- [ ] `addReward` hanya dipanggil saat jawaban benar
- [ ] Pilihan jawaban diacak posisinya setiap soal
- [ ] Tidak ada crash saat 10 soal selesai
