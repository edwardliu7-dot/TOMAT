# Prompt 09 — IPA Kelas 9 BAB I: Homeostasis Balancer

## Konteks Proyek

Aplikasi **TOMAT** — gamifikasi belajar SMP. Stack: React (Vite) + Express + PostgreSQL.  
Infrastruktur IPA sudah ada (Prompt 01). Route key game ini: `ipa9koordinasi`.  
File yang dibuat: `src/minigames/Ipa9KoordinasiGame.jsx`.

### Konvensi Wajib Game TOMAT

```jsx
import { usePlayer } from '../contexts/PlayerContext';
import { useSurvival } from '../hooks/useSurvival';
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared';

export default function Ipa9KoordinasiGame({ onBack }) {
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

## Materi BAB I: Sistem Koordinasi dan Homeostasis Manusia

**Target kurikulum:**
- Sistem saraf: neuron (sensorik, motorik, konektor/interneuron), sinapsis, gerak sadar vs refleks
- Susunan saraf pusat (otak besar, otak kecil, batang otak) dan saraf tepi (somatik & otonom)
- Sistem endokrin (hormon): kelenjar hipofisis, tiroid, adrenal, pankreas, dll.
- Homeostasis: pengaturan suhu tubuh, kadar gula darah, keseimbangan air
- Alat indera: mata, telinga, hidung, lidah, kulit

---

## Mekanisme Game: Homeostasis Balancer

Game quiz 3 mode bergantian, 10 soal per sesi.

### Mode A — "Sistem Saraf"

**Data soal (10 soal):**

```js
const SARAF_SOAL = [
  { soal: 'Neuron yang membawa impuls dari alat indera ke otak disebut...', jawaban: 'Neuron sensorik (aferen)', salah: ['Neuron motorik (eferen)', 'Interneuron', 'Neuron otonom'] },
  { soal: 'Neuron yang membawa perintah dari otak ke otot disebut...', jawaban: 'Neuron motorik (eferen)', salah: ['Neuron sensorik', 'Interneuron', 'Neuron asosiasi'] },
  { soal: 'Gerak refleks berbeda dari gerak sadar karena...', jawaban: 'Gerak refleks tidak melalui otak, tapi melalui sumsum tulang belakang', salah: ['Gerak refleks lebih lambat', 'Gerak refleks melibatkan pikiran', 'Gerak refleks dipelajari'] },
  { soal: 'Bagian otak yang mengatur keseimbangan tubuh dan koordinasi gerakan otot adalah...', jawaban: 'Otak kecil (serebelum)', salah: ['Otak besar (serebrum)', 'Batang otak (medula oblongata)', 'Hipotalamus'] },
  { soal: 'Bagian otak yang mengatur fungsi vital seperti detak jantung dan pernapasan adalah...', jawaban: 'Batang otak (medula oblongata)', salah: ['Otak besar', 'Otak kecil', 'Talamus'] },
  { soal: 'Celah antara dua neuron yang menjadi tempat penyebaran impuls disebut...', jawaban: 'Sinapsis', salah: ['Akson', 'Dendrit', 'Mielin'] },
  { soal: 'Mielin pada akson berfungsi untuk...', jawaban: 'Mempercepat penghantaran impuls listrik', salah: ['Menerima rangsangan', 'Menyimpan neurotransmitter', 'Menghubungkan dua neuron'] },
  { soal: 'Sistem saraf otonom terdiri dari sistem saraf...', jawaban: 'Simpatis dan parasimpatis', salah: ['Sensorik dan motorik', 'Pusat dan tepi', 'Sadar dan refleks'] },
  { soal: 'Bagian otak besar yang mengatur kemampuan berbicara, berpikir, dan memori adalah...', jawaban: 'Otak besar (serebrum) — lobus temporal & frontal', salah: ['Otak kecil', 'Sumsum tulang belakang', 'Medula oblongata'] },
  { soal: 'Urutan jalannya impuls pada gerak sadar yang benar adalah...', jawaban: 'Reseptor → Saraf sensorik → Otak → Saraf motorik → Efektor', salah: ['Reseptor → Sumsum tulang belakang → Efektor', 'Otak → Saraf sensorik → Reseptor → Efektor', 'Efektor → Otak → Reseptor'] },
];
```

### Mode B — "Sistem Hormon & Homeostasis"

**Data soal (8 soal):**

```js
const HORMON_SOAL = [
  { soal: 'Hormon yang diproduksi pankreas untuk MENURUNKAN kadar gula darah adalah...', jawaban: 'Insulin', salah: ['Glukagon', 'Adrenalin', 'Tiroksin'] },
  { soal: 'Saat kadar gula darah TURUN terlalu rendah, pankreas melepaskan hormon...', jawaban: 'Glukagon (mengubah glikogen jadi glukosa)', salah: ['Insulin', 'Adrenalin', 'Kortisol'] },
  { soal: 'Hormon adrenalin diproduksi oleh kelenjar...', jawaban: 'Adrenal (kelenjar anak ginjal)', salah: ['Pankreas', 'Hipofisis', 'Tiroid'] },
  { soal: 'Saat tubuh kepanasan, mekanisme homeostasis yang terjadi adalah...', jawaban: 'Kulit berkeringat dan pembuluh darah melebar untuk melepas panas', salah: ['Otot bergetar (menggigil)', 'Pembuluh darah menyempit', 'Produksi urin meningkat'] },
  { soal: 'Hormon yang mengatur metabolisme dan pertumbuhan tubuh diproduksi oleh kelenjar...', jawaban: 'Tiroid (menghasilkan tiroksin)', salah: ['Pankreas', 'Adrenal', 'Paratiroid'] },
  { soal: 'Kelenjar hipofisis disebut "master gland" karena...', jawaban: 'Mengendalikan kerja kelenjar hormon lainnya', salah: ['Menghasilkan paling banyak hormon', 'Terletak di pusat tubuh', 'Berukuran paling besar'] },
  { soal: 'Diabetes mellitus tipe 1 terjadi karena...', jawaban: 'Pankreas tidak dapat memproduksi insulin', salah: ['Tubuh resisten terhadap insulin', 'Kelebihan hormon glukagon', 'Kerusakan kelenjar adrenal'] },
  { soal: 'Mekanisme homeostasis pengaturan suhu tubuh manusia melibatkan pusat pengendali di...', jawaban: 'Hipotalamus (di otak)', salah: ['Sumsum tulang belakang', 'Otak kecil', 'Kelenjar tiroid'] },
];
```

### Mode C — "Alat Indera"

Pilihan ganda tentang alat indera dan fungsinya.

**Data soal (6 soal):**

```js
const INDERA_SOAL = [
  { soal: 'Bagian mata yang berfungsi mengatur banyaknya cahaya yang masuk adalah...', jawaban: 'Iris (melalui pupil)', salah: ['Retina', 'Kornea', 'Lensa'] },
  { soal: 'Bayangan benda yang jatuh di retina sifatnya...', jawaban: 'Nyata, terbalik, dan diperkecil', salah: ['Maya, tegak, diperbesar', 'Nyata, tegak, diperkecil', 'Maya, terbalik, diperkecil'] },
  { soal: 'Bagian telinga yang berfungsi mengubah getaran udara menjadi impuls saraf adalah...', jawaban: 'Koklea (rumah siput)', salah: ['Gendang telinga', 'Tulang pendengaran', 'Saluran eustachius'] },
  { soal: 'Reseptor pada kulit yang peka terhadap sentuhan ringan disebut...', jawaban: 'Korpus Meissner', salah: ['Korpus Pacini', 'Ujung Ruffini', 'Ujung Krause'] },
  { soal: 'Rabun jauh (miopi) terjadi karena bayangan benda jatuh di...', jawaban: 'Di depan retina', salah: ['Di belakang retina', 'Tepat di retina', 'Di lensa mata'] },
  { soal: 'Fungsi saluran eustachius di telinga adalah...', jawaban: 'Menyeimbangkan tekanan udara antara telinga tengah dan luar', salah: ['Menghantarkan gelombang suara', 'Mengubah getaran menjadi impuls', 'Menjaga keseimbangan tubuh'] },
];
```

---

## UI Game

```
[TopBar: "Homeostasis Balancer 🧠" | tombol back]
[PlayerHeader]
[Card berisi:]
  [Label mode: "Sistem Saraf" / "Hormon & Homeostasis" / "Alat Indera"]
  [Progress: soal ke-X dari 10]
  [Emoji + teks soal]
  [4 tombol pilihan — grid 2×2]
[FeedbackBanner]
```

- Auto-next setelah 1.3 detik
- Layar akhir: skor X/10, total koin, tombol "Main Lagi" dan "Kembali"

---

## File yang Harus Dibuat/Diubah

1. **Buat** `src/minigames/Ipa9KoordinasiGame.jsx`
2. **Ubah** `src/App.jsx` — ganti placeholder `ipa9koordinasi` dengan:
   ```js
   ipa9koordinasi: lazy(() => import('./minigames/Ipa9KoordinasiGame')),
   ```

## Checklist

- [ ] Tiga mode berjalan tanpa error
- [ ] `addReward` hanya dipanggil saat jawaban benar
- [ ] Pilihan jawaban diacak posisinya setiap soal
- [ ] FeedbackBanner tampil dengan benar
- [ ] Tidak ada crash saat 10 soal selesai
