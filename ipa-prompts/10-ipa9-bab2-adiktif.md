# Prompt 10 — IPA Kelas 9 BAB II: Body Defender — Say No to Drugs

## Konteks Proyek

Aplikasi **TOMAT** — gamifikasi belajar SMP. Stack: React (Vite) + Express + PostgreSQL.  
Infrastruktur IPA sudah ada (Prompt 01). Route key game ini: `ipa9adiktif`.  
File yang dibuat: `src/minigames/Ipa9AdiktifGame.jsx`.

### Konvensi Wajib Game TOMAT

```jsx
import { usePlayer } from '../contexts/PlayerContext';
import { useSurvival } from '../hooks/useSurvival';
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared';

export default function Ipa9AdiktifGame({ onBack }) {
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

## Materi BAB II: Zat Adiktif dan Psikotropika

**Target kurikulum:**
- Pengertian zat adiktif dan psikotropika
- Jenis-jenis zat adiktif: rokok (nikotin), alkohol, narkotika (heroin, kokain, ganja, opium)
- Jenis psikotropika: stimulan (amfetamin), depresan (barbiturat), halusinogen (LSD)
- Dampak negatif pada organ: otak, jantung, paru-paru, hati, ginjal
- Upaya pencegahan: pendidikan, lingkungan, hukum
- Penolakan dalam skenario sosial

---

## Mekanisme Game: Body Defender — Say No to Drugs

Game quiz 3 mode bergantian, 10 soal per sesi.

### Mode A — "Klasifikasi Zat"

Tampilkan nama/deskripsi zat, siswa memilih kategori yang tepat.

**Data soal (10 soal):**

```js
const KLASIFIKASI_SOAL = [
  { soal: 'Nikotin dalam rokok termasuk zat adiktif jenis...', jawaban: 'Stimulan (merangsang sistem saraf)', salah: ['Depresan', 'Halusinogen', 'Narkotika'] },
  { soal: 'Heroin dan morfin termasuk golongan...', jawaban: 'Narkotika (golongan I)', salah: ['Psikotropika', 'Zat adiktif bukan narkotika', 'Stimulan'] },
  { soal: 'Zat yang menyebabkan halusinasi (seperti melihat/mendengar sesuatu yang tidak ada) disebut...', jawaban: 'Halusinogen', salah: ['Stimulan', 'Depresan', 'Narkotika'] },
  { soal: 'Alkohol (etanol) termasuk jenis zat yang bersifat...', jawaban: 'Depresan (memperlambat kerja sistem saraf)', salah: ['Stimulan', 'Halusinogen', 'Analgetik'] },
  { soal: 'Ganja (cannabis/THC) termasuk golongan...', jawaban: 'Narkotika golongan I', salah: ['Psikotropika golongan II', 'Zat adiktif legal', 'Depresan golongan III'] },
  { soal: 'Amfetamin (shabu-shabu) adalah jenis psikotropika yang bersifat...', jawaban: 'Stimulan kuat (merangsang sistem saraf secara berlebihan)', salah: ['Depresan', 'Halusinogen', 'Analgetik'] },
  { soal: 'Kafein dalam kopi dan teh termasuk zat adiktif...', jawaban: 'Bukan narkotika/psikotropika, tapi bersifat stimulan ringan', salah: ['Narkotika golongan II', 'Psikotropika golongan I', 'Halusinogen'] },
  { soal: 'Ketergantungan fisik pada zat adiktif terjadi karena...', jawaban: 'Tubuh membutuhkan zat itu untuk berfungsi normal (toleransi & withdrawal)', salah: ['Keinginan psikologis semata', 'Efek zat yang menyenangkan', 'Pengaruh teman sebaya'] },
  { soal: 'Overdosis narkotika dapat menyebabkan kematian karena...', jawaban: 'Menekan pusat pernapasan di batang otak hingga berhenti bernapas', salah: ['Menyebabkan serangan jantung saja', 'Merusak hati secara cepat', 'Menyebabkan pingsan sementara'] },
  { soal: 'LSD (lysergic acid diethylamide) termasuk jenis psikotropika...', jawaban: 'Halusinogen', salah: ['Stimulan', 'Depresan', 'Narkotika'] },
];
```

### Mode B — "Dampak pada Organ Tubuh"

Tampilkan organ dan zat, siswa memilih dampak yang benar.

**Data soal (8 soal):**

```js
const DAMPAK_SOAL = [
  { soal: 'Dampak rokok pada PARU-PARU dalam jangka panjang adalah...', jawaban: 'Kanker paru-paru, emfisema, dan penyakit paru obstruktif kronik (PPOK)', salah: ['Kerusakan hati (sirosis)', 'Gagal ginjal', 'Kerusakan pankreas'] },
  { soal: 'Alkohol dalam jangka panjang menyebabkan kerusakan serius pada...', jawaban: 'Hati (sirosis hepatis)', salah: ['Paru-paru', 'Ginjal', 'Pankreas'] },
  { soal: 'Penggunaan narkotika suntik yang berbagi jarum berisiko menularkan...', jawaban: 'HIV/AIDS dan Hepatitis B & C', salah: ['Tuberkulosis', 'Malaria', 'Tifoid'] },
  { soal: 'Nikotin dalam rokok menyebabkan pembuluh darah...', jawaban: 'Menyempit (vasokonstriksi), meningkatkan risiko serangan jantung', salah: ['Melebar sehingga tekanan darah turun', 'Rusak secara langsung', 'Tersumbat oleh nikotin'] },
  { soal: 'Amfetamin (shabu-shabu) dapat menyebabkan halusinasi dan kerusakan pada...', jawaban: 'Otak (kerusakan sel saraf dopamin)', salah: ['Hati dan ginjal', 'Paru-paru saja', 'Jantung saja'] },
  { soal: 'Penggunaan alkohol saat hamil dapat menyebabkan...', jawaban: 'Cacat janin (Fetal Alcohol Syndrome)', salah: ['Tidak ada dampak pada janin', 'Hanya berdampak pada ibu', 'Janin menjadi lebih kecil saja'] },
  { soal: 'Gejala putus obat (withdrawal) pada pecandu narkotika meliputi...', jawaban: 'Gelisah, nyeri seluruh tubuh, keringat berlebih, dan sulit tidur', salah: ['Euforia dan rasa senang', 'Peningkatan konsentrasi', 'Tidak ada gejala fisik'] },
  { soal: 'Perokok pasif (menghirup asap rokok orang lain) berisiko mengalami...', jawaban: 'Gangguan pernapasan dan risiko kanker hampir sama dengan perokok aktif', salah: ['Tidak ada risiko kesehatan', 'Hanya batuk ringan', 'Ketagihan nikotin secara langsung'] },
];
```

### Mode C — "Skenario Penolakan"

Tampilkan skenario sosial, siswa memilih tindakan pencegahan/penolakan yang tepat.

**Data soal (6 soal):**

```js
const SKENARIO_SOAL = [
  {
    skenario: 'Teman sekelas menawarkan rokok dan berkata "Masa cuma satu batang tidak mau? Kamu tidak gaul!" 😤',
    jawaban: 'Tolak dengan tegas: "Tidak, terima kasih. Aku tidak merokok karena berbahaya untuk kesehatan." lalu pergi.',
    salah: ['Coba sekali saja agar dianggap gaul', 'Diam saja dan menerimanya', 'Menghindari teman tersebut tanpa berkata apa-apa']
  },
  {
    skenario: 'Di pesta, seseorang menawarkan minuman yang katanya "buat seru-seruan aja, tidak berbahaya." 🥂',
    jawaban: 'Tolak dan katakan kamu tidak minum alkohol, lalu minta minuman non-alkohol.',
    salah: ['Minum sedikit agar tidak dianggap tidak enak', 'Pura-pura minum saja', 'Langsung pergi tanpa berkata apa-apa']
  },
  {
    skenario: 'Kamu menemukan teman sedang menggunakan zat tidak dikenal dan dia mengajak bergabung. 😟',
    jawaban: 'Tolak, ajak teman bicara tentang bahayanya, dan jika perlu laporkan ke orang tua atau guru.',
    salah: ['Ikut saja agar tidak dikucilkan', 'Pura-pura tidak melihat', 'Diamkan saja karena bukan urusanmu']
  },
  {
    skenario: 'Upaya pencegahan penyalahgunaan narkoba yang paling efektif dimulai dari...', 
    jawaban: 'Keluarga dan pendidikan sejak dini tentang bahaya narkoba',
    salah: ['Hukuman berat saja', 'Larangan dari pemerintah saja', 'Mengasingkan pecandu dari masyarakat']
  },
  {
    skenario: 'Jika kamu mengetahui ada penjual narkoba di sekolah, tindakan yang tepat adalah...',
    jawaban: 'Laporkan segera kepada guru, kepala sekolah, atau orang tua',
    salah: ['Diam saja karena takut', 'Beritahu teman-teman saja', 'Konfrontasi langsung dengan penjual']
  },
  {
    skenario: 'Seseorang yang sudah kecanduan narkoba sebaiknya ditangani dengan...',
    jawaban: 'Rehabilitasi medis dan dukungan keluarga, bukan hanya dihukum',
    salah: ['Dikucilkan dari masyarakat', 'Dibiarkan sembuh sendiri', 'Hanya dihukum penjara']
  },
];
```

---

## UI Game

```
[TopBar: "Body Defender 🛡️" | tombol back]
[PlayerHeader]
[Card berisi:]
  [Label mode: "Klasifikasi Zat" / "Dampak pada Tubuh" / "Skenario Penolakan"]
  [Progress: soal ke-X dari 10]
  [Emoji + teks soal/skenario]
  [4 tombol pilihan — grid 2×2 atau kolom jika teks panjang]
[FeedbackBanner]
```

**Catatan UI untuk Mode C (Skenario):** Pilihan jawaban bisa berupa teks panjang. Gunakan tombol dengan `flexWrap` atau ukuran font lebih kecil (14px) agar teks muat. Layout kolom tunggal (bukan 2×2) lebih cocok untuk Mode C.

- Auto-next setelah 1.5 detik (teks lebih panjang)
- Layar akhir: skor X/10, total koin, tombol "Main Lagi" dan "Kembali"

---

## File yang Harus Dibuat/Diubah

1. **Buat** `src/minigames/Ipa9AdiktifGame.jsx`
2. **Ubah** `src/App.jsx` — ganti placeholder `ipa9adiktif` dengan:
   ```js
   ipa9adiktif: lazy(() => import('./minigames/Ipa9AdiktifGame')),
   ```

## Checklist

- [ ] Tiga mode berjalan tanpa error
- [ ] Mode C (Skenario) menampilkan pilihan dengan layout yang terbaca meskipun teks panjang
- [ ] `addReward` hanya dipanggil saat jawaban benar
- [ ] Pilihan jawaban diacak posisinya setiap soal
- [ ] Tidak ada crash saat 10 soal selesai
