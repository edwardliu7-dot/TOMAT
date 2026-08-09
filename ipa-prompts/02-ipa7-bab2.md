# Prompt 02 — IPA Kelas 7 BAB 2: Zat dan Perubahannya (4 Game)

## Prasyarat
Prompt 00 selesai. Key `ipa7b2t1`–`ipa7b2t4` sudah terdaftar di catalog dan App.jsx sebagai IpaGamePlaceholder.

## Konvensi Wajib
```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'
// addReward({ coins: 15, exp: 10 }) hanya saat benar
// 10 soal per sesi, pilihan diacak, auto-next 1.3 detik
```

---

## Game 1 — `ipa7b2t1`: Matter Inspector

**File:** `src/minigames/Ipa7B2T1Game.jsx`  
**TP:** Mengidentifikasi sifat zat padat, cair, dan gas  
**Tema:** ungu (`#a855f7`), background `#0d0a1a → #1a1030`

```js
const SOAL = [
  { teks: 'Zat yang memiliki bentuk dan volume tetap adalah...', benar: 'Zat Padat', salah: ['Zat Cair', 'Gas', 'Plasma'] },
  { teks: 'Sifat zat cair yang benar adalah...', benar: 'Volume tetap, bentuk mengikuti wadah', salah: ['Bentuk dan volume tetap', 'Bentuk dan volume berubah', 'Tidak bisa dialirkan'] },
  { teks: 'Gas memiliki sifat...', benar: 'Bentuk dan volume mengikuti wadah', salah: ['Volume tetap, bentuk berubah', 'Bentuk tetap, volume berubah', 'Massa selalu nol'] },
  { teks: 'Es batu termasuk zat...', benar: 'Padat', salah: ['Cair', 'Gas', 'Plasma'] },
  { teks: 'Uap air termasuk zat...', benar: 'Gas', salah: ['Padat', 'Cair', 'Larutan'] },
  { teks: 'Jarak antar partikel pada zat padat adalah...', benar: 'Sangat rapat dan teratur', salah: ['Renggang dan tidak teratur', 'Sangat renggang', 'Berubah-ubah'] },
  { teks: 'Mengapa air bisa dituang dari satu wadah ke wadah lain?', benar: 'Karena partikel zat cair dapat bergerak bebas', salah: ['Karena air ringan', 'Karena air tidak bermassa', 'Karena air berbentuk gas'] },
  { teks: 'Contoh zat cair dalam kehidupan sehari-hari adalah...', benar: 'Minyak goreng', salah: ['Besi', 'Asap', 'Pasir'] },
  { teks: 'Gas mudah dimampatkan (dikompresi) karena...', benar: 'Jarak antar partikelnya sangat jauh', salah: ['Partikelnya sangat berat', 'Gas tidak memiliki partikel', 'Gas selalu panas'] },
  { teks: 'Perbedaan utama zat cair dan gas adalah...', benar: 'Zat cair volumenya tetap, gas volumenya berubah', salah: ['Zat cair selalu panas, gas selalu dingin', 'Keduanya tidak memiliki bentuk tetap', 'Tidak ada perbedaan'] },
  { teks: 'Kayu, batu, dan logam termasuk contoh zat...', benar: 'Padat', salah: ['Cair', 'Gas', 'Campuran'] },
  { teks: 'Oksigen (O₂) yang kita hirup termasuk zat...', benar: 'Gas', salah: ['Padat', 'Cair', 'Koloid'] },
]
```

---

## Game 2 — `ipa7b2t2`: Phase Change Master

**File:** `src/minigames/Ipa7B2T2Game.jsx`  
**TP:** Menyelidiki perubahan wujud zat  
**Tema:** biru es (`#38bdf8`), background `#030d1a → #052040`

```js
const SOAL = [
  { teks: 'Perubahan wujud dari padat menjadi cair disebut...', benar: 'Mencair (meleleh)', salah: ['Membeku', 'Menguap', 'Menyublim'] },
  { teks: 'Es batu yang dibiarkan di ruang terbuka lama-kelamaan akan...', benar: 'Mencair (padat → cair)', salah: ['Menguap langsung', 'Membeku lagi', 'Mengembun'] },
  { teks: 'Air yang dipanaskan hingga mendidih mengalami perubahan wujud...', benar: 'Menguap (cair → gas)', salah: ['Mencair', 'Membeku', 'Mengkristal'] },
  { teks: 'Embun di pagi hari terbentuk dari uap air yang mengalami...', benar: 'Mengembun (gas → cair)', salah: ['Menguap', 'Menyublim', 'Mencair'] },
  { teks: 'Kapur barus (kamper) yang mengecil tanpa menjadi cair mengalami...', benar: 'Menyublim (padat → gas)', salah: ['Mencair', 'Menguap', 'Mengembun'] },
  { teks: 'Perubahan wujud dari gas menjadi padat langsung disebut...', benar: 'Mengkristal (deposisi)', salah: ['Menyublim', 'Mengembun', 'Membeku'] },
  { teks: 'Perubahan wujud dari cair menjadi padat disebut...', benar: 'Membeku', salah: ['Mencair', 'Menguap', 'Mengembun'] },
  { teks: 'Proses pembuatan es krim menggunakan prinsip perubahan wujud...', benar: 'Membeku (cair → padat)', salah: ['Menguap', 'Menyublim', 'Mengkristal'] },
  { teks: 'Salju yang terbentuk di pegunungan dingin merupakan contoh...', benar: 'Mengkristal (uap air → padat)', salah: ['Menyublim', 'Membeku dari cair', 'Mengembun'] },
  { teks: 'Perubahan wujud yang MENYERAP kalor adalah...', benar: 'Mencair, menguap, menyublim', salah: ['Membeku, mengembun, mengkristal', 'Semua perubahan wujud', 'Tidak ada yang menyerap kalor'] },
  { teks: 'Perubahan wujud yang MELEPAS kalor adalah...', benar: 'Membeku, mengembun, mengkristal', salah: ['Mencair, menguap, menyublim', 'Semua perubahan wujud', 'Hanya membeku'] },
  { teks: 'Tutup panci yang basah saat memasak menunjukkan proses...', benar: 'Mengembun (gas → cair)', salah: ['Menguap', 'Mencair', 'Menyublim'] },
]
```

---

## Game 3 — `ipa7b2t3`: Cohesion vs Adhesion Lab

**File:** `src/minigames/Ipa7B2T3Game.jsx`  
**TP:** Membedakan kohesi dan adhesi  
**Tema:** cyan (`#06b6d4`), background `#020d10 → #041a20`

```js
const SOAL = [
  { teks: 'Gaya tarik menarik antara partikel-partikel ZAT YANG SEJENIS disebut...', benar: 'Kohesi', salah: ['Adhesi', 'Gravitasi', 'Tegangan permukaan'] },
  { teks: 'Gaya tarik menarik antara partikel ZAT YANG BERBEDA JENIS disebut...', benar: 'Adhesi', salah: ['Kohesi', 'Gaya magnet', 'Gaya gesek'] },
  { teks: 'Air yang menempel pada dinding kaca gelas menunjukkan...', benar: 'Adhesi (air-kaca)', salah: ['Kohesi air', 'Gravitasi', 'Tegangan permukaan'] },
  { teks: 'Tinta yang menempel pada kertas merupakan contoh...', benar: 'Adhesi (tinta-kertas)', salah: ['Kohesi tinta', 'Kohesi kertas', 'Gaya gesek'] },
  { teks: 'Air raksa di dalam tabung kaca membentuk meniskus CEMBUNG karena...', benar: 'Kohesi raksa > adhesi raksa-kaca', salah: ['Adhesi raksa > kohesi', 'Gravitasi sangat kuat', 'Raksa ringan'] },
  { teks: 'Air di dalam tabung kaca membentuk meniskus CEKUNG karena...', benar: 'Adhesi air-kaca > kohesi air', salah: ['Kohesi air > adhesi', 'Air sangat berat', 'Tekanan udara'] },
  { teks: 'Cat yang menempel pada tembok adalah contoh...', benar: 'Adhesi (cat-tembok)', salah: ['Kohesi cat', 'Gaya magnet', 'Gravitasi'] },
  { teks: 'Air yang membentuk tetes bulat di atas daun talas menunjukkan...', benar: 'Kohesi air lebih besar dari adhesi air-daun', salah: ['Adhesi air-daun sangat kuat', 'Gravitasi rendah', 'Air bermassa kecil'] },
  { teks: 'Kapilaritas (naiknya air di pembuluh kapiler) terjadi karena...', benar: 'Adhesi air > kohesi air', salah: ['Kohesi air > adhesi', 'Gravitasi mendorong ke atas', 'Tekanan atmosfer'] },
  { teks: 'Spidol bisa menulis di papan whiteboard karena tinta mengalami...', benar: 'Adhesi dengan permukaan papan', salah: ['Kohesi yang kuat', 'Gaya gesek kinetik', 'Kapilaritas'] },
]
```

---

## Game 4 — `ipa7b2t4`: Capillary Tube Challenge

**File:** `src/minigames/Ipa7B2T4Game.jsx`  
**TP:** Mengaitkan kapilaritas dalam kehidupan sehari-hari  
**Tema:** hijau daun (`#16a34a`), background `#021008 → #041a10`

```js
const SOAL = [
  { teks: 'Kapilaritas adalah peristiwa...', benar: 'Naiknya atau turunnya zat cair dalam pipa/pembuluh sempit', salah: ['Mengalirnya air dari tempat tinggi ke rendah', 'Penguapan air di permukaan', 'Pembekuan air di suhu rendah'] },
  { teks: 'Air naik dari akar ke daun melalui xilem merupakan contoh kapilaritas yang berperan dalam...', benar: 'Pengangkutan air pada tumbuhan', salah: ['Fotosintesis langsung', 'Respirasi daun', 'Penyimpanan energi'] },
  { teks: 'Kain lap (serbet) yang menyerap air tumpahan adalah contoh kapilaritas karena...', benar: 'Air naik melalui celah-celah kecil antar serat kain', salah: ['Kain memiliki gaya magnet', 'Kain memiliki pori besar', 'Gravitasi menarik air ke kain'] },
  { teks: 'Sumbu kompor minyak bisa menyalurkan minyak ke api karena...', benar: 'Kapilaritas — minyak naik melalui serat sumbu', salah: ['Minyak bertekanan tinggi', 'Gaya gravitasi mendorong ke atas', 'Minyak mudah terbakar'] },
  { teks: 'Makin kecil diameter pipa kapiler, air yang naik makin...', benar: 'Tinggi', salah: ['Rendah', 'Tetap sama', 'Tidak tentu'] },
  { teks: 'Kapilaritas TIDAK terjadi pada...', benar: 'Pipa berdiameter besar', salah: ['Pembuluh darah kapiler', 'Sumbu lilin', 'Serat kain'] },
  { teks: 'Fenomena air tanah bisa naik ke permukaan tanah secara alami disebabkan oleh...', benar: 'Kapilaritas pada pori-pori tanah', salah: ['Gempa bumi', 'Tekanan gas dalam tanah', 'Gravitasi terbalik'] },
  { teks: 'Pada peristiwa kapilaritas, zat cair naik karena...', benar: 'Adhesi zat cair terhadap dinding pipa lebih besar dari kohesinya', salah: ['Gravitasi mendorong ke atas', 'Zat cair ringan', 'Kohesi lebih besar dari adhesi'] },
  { teks: 'Contoh kapilaritas yang merugikan dalam bangunan adalah...', benar: 'Tembok lembap karena air tanah naik ke dinding', salah: ['Air hujan masuk lewat atap', 'Banjir di lantai', 'Retakan tembok karena panas'] },
  { teks: 'Mengapa kertas tisu lebih baik menyerap air dari pada plastik?', benar: 'Kertas tisu memiliki banyak serat kecil yang memungkinkan kapilaritas', salah: ['Kertas tisu lebih berat', 'Plastik tidak bisa basah', 'Kertas memiliki gaya magnet'] },
]
```

---

## File yang Dibuat/Diubah

1. **Buat** `src/minigames/Ipa7B2T1Game.jsx`
2. **Buat** `src/minigames/Ipa7B2T2Game.jsx`
3. **Buat** `src/minigames/Ipa7B2T3Game.jsx`
4. **Buat** `src/minigames/Ipa7B2T4Game.jsx`
5. **Ubah** `src/App.jsx` — ganti 4 placeholder ipa7b2t1–ipa7b2t4 dengan lazy import.

## Checklist
- [ ] 4 game berjalan tanpa error
- [ ] Soal dan pilihan diacak setiap sesi
- [ ] `addReward` hanya saat benar
- [ ] Layar selesai: skor X/10, koin, Main Lagi & Kembali
