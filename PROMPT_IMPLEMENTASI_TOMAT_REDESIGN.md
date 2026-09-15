# Prompt Implementasi TOMAT Redesign + Equation Soal

## Peran

Anda adalah senior full-stack engineer yang mengimplementasikan redesign UI TOMAT ke aplikasi yang sudah ada. Kerjakan perubahan langsung pada struktur project saat ini dan pertahankan fitur, kontrak API, database PostgreSQL, autentikasi, serta state realtime yang sudah berjalan.

Jangan membuat aplikasi baru, jangan mengganti database, dan jangan mengembalikan modul BLP atau GURU sebagai embedded module di TOMAT. BLP dan GURU tetap menjadi aplikasi terpisah yang dibuka melalui tautan eksternal.

## Konteks Produk

TOMAT adalah platform belajar matematika SMP dengan:

- Siswa kelas VII, VIII, dan IX.
- Game matematika, tugas guru, nilai, hafalan, leaderboard, toko kosmetik, Pet Tomi, chat/forum, duel, turnamen, Boss Raid, dan mode MOBA.
- Setiap tugas harus memiliki informasi nama mata pelajaran yang jelas.
- Tema visual dark space.
- Brand utama:
  - Background: `#071321`
  - Surface: `#0A1628` dan `#0E1E35`
  - Primary: `#6366F1`
  - Secondary: violet/indigo
  - Kelas VII: cyan
  - Kelas VIII: orange
  - Kelas IX: emerald
  - Koin: yellow
- Pet Tomi adalah guinea pig/marmot (`🐹`), bukan kura-kura.

## Struktur Project yang Harus Dipertahankan

- Frontend React 18 + Vite berada di `src/`.
- Entry dan routing state-based utama berada di `src/App.jsx`.
- Screen siswa berada di `src/screens/`.
- Context utama yang harus tetap digunakan:
  - `AuthContext`
  - `PetContext`
  - `PlayerContext`
  - `TaskContext`
  - `BabLockContext`
- Backend Node.js + Express berada di `server/`.
- Database menggunakan PostgreSQL yang sudah dipakai project.
- Realtime menggunakan Socket.io dan state pertandingan tetap authoritative di server.
- Mockup referensi berada di:
  - `artifacts/mockup-sandbox/src/components/mockups/tomat-redesign/`

Gunakan mockup tersebut sebagai referensi visual dan struktur informasi, bukan sebagai alasan untuk mengganti arsitektur aplikasi utama.

## Target Implementasi UI

Implementasikan atau sesuaikan tampilan aplikasi utama agar konsisten dengan mockup berikut:

### Siswa

- `LoginMobile`
- `LoginWeb`
- `HomeSiswaMobile`
- `HomeSiswaWeb`
- `GameMobile`
- `GameWeb`
- `LeaderboardMobile`
- `LeaderboardWeb`
- `ProfileMobile`
- `ProfileWeb`
- `ShopMobile`
- `ShopWeb`
- `ChatMobile`
- `ChatWeb`
- `NilaiMobile`
- `NilaiWeb`

### Guru

- `HomeGuruMobile`
- `HomeGuruWeb`
- Dashboard, tugas, pantau kelas, nilai siswa, hafalan, insight siswa, Boss Raid, turnamen, kunci bab, dan komunikasi sesuai fitur backend yang sudah tersedia.

### Navigasi Siswa

Gunakan label berikut jika screen tersebut memang tersedia:

1. Beranda
2. Zona Belajar
3. Nilai & Tugas
4. Papan Peringkat
5. Toko
6. Lencana
7. Chat

### Zona Belajar

- Gerbang Bilangan — Kelas VII
- Kerajaan Pythagoras — Kelas VIII
- Observatorium SPLDV — Kelas IX

Jangan menggunakan nama zona lama seperti “Hutan Ekosistem” atau “Pegunungan Logika”.

### Tab Toko

Gunakan enam tab:

1. Bingkai
2. Spanduk
3. Tema
4. Stiker
5. Pet Skin
6. Tomi

Item premium, limited edition, rarity, harga, kepemilikan, prasyarat skin, dan status equip harus tetap mengikuti validasi server. UI tidak boleh menjadi sumber kebenaran transaksi.

### Leaderboard

Leaderboard harus menampilkan:

- Tab `Kelasku`, `Kelas 8`, dan `Kelas 9`.
- `Poin` komposit, bukan hanya XP.
- Komposisi Poin:
  - Tugas: 40%
  - Level: 20%
  - XP: 10%
  - Hafalan: 30%
- Progress hafalan dengan indikator yang jelas.
- Ranking siswa dan perubahan posisi.

### Game dan Kompetisi

Game harus mempertahankan konteks:

- Nama game dan bab matematika.
- Progress soal.
- Timer jika game memang menggunakannya.
- Mode duel dan skor lawan jika game adalah duel.
- Hadiah benar, termasuk `+15 koin` jika sesuai aturan server.
- Validasi dan pemberian reward tetap dilakukan server-side.

## Requirement Utama Baru: Equation pada Soal

Soal harus mendukung equation agar guru atau pembuat soal dapat menyalin equation dari sumber lain lalu menempelkannya ke soal, dan siswa melihat equation tersebut sebagai matematika yang ter-render dengan benar.

### Tujuan Fungsional

Contoh input yang harus dapat ditempel dan ditampilkan:

```text
2x + 5 = 17
```

```text
\frac{2x+1}{3} = 5
```

```text
\sqrt{x^2 + y^2} = z
```

```text
x^2 + y^2 = z^2
```

```text
\frac{1}{2} \times 8 = 4
```

Equation dapat berada di tengah kalimat, di baris sendiri, atau terdiri dari beberapa baris.

### Format Equation yang Didukung

Gunakan KaTeX sebagai renderer utama. Tambahkan dependency yang diperlukan melalui package manager project jika belum tersedia.

Renderer harus mendukung:

- Inline LaTeX:
  - `$x^2 + y^2 = z^2$`
  - `\(x^2 + y^2 = z^2\)`
- Display LaTeX:
  - `$$\frac{a}{b}$$`
  - `\[\frac{a}{b}\]`
- Plain text matematika yang tidak memakai delimiter:
  - `2x + 5 = 17`
  - `x² + y² = z²`
  - `√(x² + y²)`
- Unicode matematika yang umum:
  - `×`, `÷`, `−`, `≤`, `≥`, `≠`, `√`, `²`, `³`, `π`

Plain text harus tetap ditampilkan sebagai teks biasa jika tidak dapat dipastikan sebagai LaTeX. Jangan membuat equation biasa menjadi error hanya karena tidak memakai delimiter.

### Komponen yang Harus Dibuat

Buat satu renderer reusable, misalnya:

```text
src/components/MathText.jsx
```

atau gunakan lokasi komponen shared yang paling sesuai dengan struktur project.

API minimal yang diharapkan:

```jsx
<MathText
  value={question.text}
  className="question-text"
  displayMode={false}
/>
```

Komponen renderer harus:

1. Menerima string kosong/null tanpa crash.
2. Memisahkan teks biasa, inline equation, dan display equation.
3. Mempertahankan line break.
4. Menampilkan equation dengan ukuran yang responsif di mobile.
5. Menampilkan fallback teks yang aman jika parsing LaTeX gagal.
6. Tidak menggunakan `dangerouslySetInnerHTML` untuk konten user kecuali sudah disanitasi secara eksplisit dan aman.
7. Tidak mengeksekusi HTML, JavaScript, URL, atau command dari isi soal.
8. Memakai `throwOnError: false` atau mekanisme fallback setara.
9. Mendukung copy/paste tanpa merusak backslash, braces, underscore, caret, slash, dan delimiter LaTeX.
10. Mendukung equation display yang panjang dengan overflow horizontal yang nyaman, bukan merusak layout halaman.

Tambahkan stylesheet KaTeX secara global atau melalui import yang sesuai. Pastikan font equation tidak menyebabkan layout shift yang besar.

### Editor Soal untuk Guru

Di tempat guru membuat atau mengedit soal, sediakan:

- Field wajib `Nama Mata Pelajaran` atau `Mata Pelajaran` pada form tugas/soal.
- Jika daftar subject guru sudah tersedia, gunakan dropdown berdasarkan subject yang memang dimiliki guru.
- Untuk konteks TOMAT saat ini, pilihan default adalah `Matematika`, tetapi field tetap harus tersimpan dan tampil sebagai data tugas.
- Textarea atau editor soal yang mempertahankan isi equation mentah.
- Preview live menggunakan komponen `MathText`.
- Tombol atau bantuan format yang menjelaskan:
  - Inline: `$x^2$`
  - Baris sendiri: `$$\frac{a}{b}$$`
  - Pangkat: `x^2`
  - Pecahan: `\frac{a}{b}`
  - Akar: `\sqrt{x}`
- Paste dari clipboard harus mempertahankan teks equation.
- Jangan mengubah equation menjadi gambar.
- Jangan menghapus karakter `\`, `{}`, `^`, `_`, dan delimiter saat paste.
- Jika pengguna menempel equation dari Word/Google Docs dalam Unicode, tampilkan versi Unicode tersebut tanpa crash dan izinkan pengguna mengeditnya.
- Jika aplikasi sudah memiliki editor tugas/soal, integrasikan ke editor yang ada, jangan membuat alur duplikat tanpa alasan.

### Model Data dan API Soal

Pertahankan backward compatibility:

- Soal lama berbentuk string teks biasa harus tetap dapat dibaca dan ditampilkan.
- Tugas baru harus menyimpan nama mata pelajaran.
- Gunakan relasi `subject_id` ke tabel `subjects` jika relasi tersebut sudah tersedia dan tipe ID-nya kompatibel.
- Jika tugas membutuhkan snapshot nama untuk histori, simpan atau expose `mata_pelajaran`/nama subject melalui JOIN agar perubahan nama subject tidak membuat histori tugas menjadi ambigu.
- Jangan membuat field duplikat dengan nama yang berbeda tanpa memeriksa schema yang sudah ada. Standarkan mapping API ke `mataPelajaran` dan mapping database ke field yang digunakan project, misalnya `mata_pelajaran` atau `subject_id`.
- Jangan mengubah `correctAnswer`, `options`, scoring, atau validasi jawaban secara tidak perlu.
- Simpan isi soal sebagai teks sumber equation, bukan HTML hasil render.
- Jika schema membutuhkan perubahan, gunakan kolom nullable/backward-compatible.
- Jangan menjalankan migrasi destruktif.
- Jika payload API memakai field `text`, pertahankan field tersebut.
- Jika dibutuhkan metadata tambahan, gunakan format optional, misalnya:

```js
{
  text: "Tentukan nilai $x$ dari $$2x + 5 = 17$$",
  contentFormat: "math-text",
  mataPelajaran: "Matematika"
}
```

`contentFormat` boleh tidak ada pada data lama dan default-nya harus dianggap sebagai `math-text` dengan fallback plain text.

Untuk payload tugas, gunakan bentuk yang konsisten:

```js
{
  mataPelajaran: "Matematika",
  subjectId: 1,
  kelas: "VIII Ibnu Sina",
  gameKey: "g8...",
  gameName: "Teorema Pythagoras"
}
```

`subjectId` boleh nullable jika schema lama belum memiliki relasi subject, tetapi `mataPelajaran` harus tetap memiliki nilai untuk tugas baru. Untuk data tugas lama yang belum memiliki mapel, tampilkan fallback `Matematika` tanpa mengubah isi data secara destruktif.

### Tampilan Nama Mata Pelajaran

Nama mata pelajaran harus terlihat di seluruh alur tugas:

- Form buat/edit tugas guru.
- Preview tugas sebelum dipublikasikan.
- Daftar tugas guru.
- Daftar tugas siswa.
- Header/detail halaman pengerjaan.
- Kartu nilai dan histori hasil tugas.
- Notifikasi tugas baru jika notifikasi menampilkan nama tugas.
- Filter atau ringkasan nilai jika screen tersebut sudah memiliki filter mapel.

Gunakan label Indonesia `Mata Pelajaran` atau `Mapel`, bukan hanya ID subject. Jangan menampilkan `undefined`, `null`, atau angka ID kepada siswa.

Validasi server harus memastikan:

1. Nama mapel tidak kosong untuk tugas baru.
2. `subjectId`, jika dikirim, benar-benar subject yang terdaftar untuk guru tersebut.
3. Siswa hanya menerima data mapel dari tugas yang memang boleh ia akses.
4. Client tidak dapat mengganti nama mapel atau subject milik guru lain dengan memanipulasi request.
5. Tugas lama tanpa mapel tetap dapat dibuka dengan fallback `Matematika`.

Generator soal di server juga boleh menghasilkan equation, tetapi output tetap harus menyertakan `text` yang dapat dirender oleh client. Jangan mengirim hasil HTML dari server.

### Semua Surface yang Wajib Menggunakan Renderer

Pastikan `MathText` digunakan pada semua tempat berikut yang menampilkan isi soal:

- Task overlay atau halaman pengerjaan tugas.
- Game matematika siswa.
- Game duel.
- Turnamen individual.
- Turnamen kelompok.
- Boss Raid jika menampilkan pertanyaan.
- Mode ujian.
- MOBA question modal jika menampilkan pertanyaan.
- Review hasil tugas.
- Review atau histori jawaban.
- Preview soal guru.
- Preview tugas sebelum dipublikasikan.
- Notifikasi atau dialog yang memang menampilkan sebagian isi soal.

Jangan hanya memperbaiki satu game. Semua jalur pertanyaan harus memakai renderer yang sama agar format konsisten.

### Equation pada Realtime dan Reconnect

Untuk duel, turnamen, Boss Raid, dan MOBA:

- Server tetap mengirim data soal authoritative.
- Field equation/text harus ikut dalam payload realtime yang aman.
- Jangan melakukan parsing atau mengubah jawaban benar di client.
- Reconnect harus menghidrasi kembali soal equation yang sedang aktif.
- Spectator atau anggota kelompok harus melihat equation yang sama dari payload server.
- Sanitasi dan fallback rendering harus berlaku sama untuk payload REST maupun Socket.io.

## Aksesibilitas Equation

Renderer equation harus:

- Memiliki teks fallback atau `aria-label` yang bermakna.
- Tetap bisa dibaca menggunakan screen reader sejauh kemampuan KaTeX.
- Memiliki kontras warna yang sesuai tema TOMAT.
- Tidak mengandalkan warna saja untuk membedakan bagian equation.
- Dapat di-scroll horizontal pada layar kecil jika equation terlalu panjang.

## Responsiveness

Pastikan hasil implementasi nyaman pada:

- Android portrait 360–430px.
- Tablet landscape.
- Desktop 1280px atau lebih.

Pada mobile:

- Jangan membuat equation keluar dari viewport.
- Tombol jawaban dan tombol aksi tetap mudah disentuh.
- Preview equation tidak menutupi editor.
- Sidebar web berubah menjadi navigasi mobile sesuai pola aplikasi yang sudah ada.

## Aturan Keamanan dan Integritas Data

- Jangan mempercayai harga, reward, score, atau correct answer dari client.
- Jangan merender raw HTML dari input soal.
- Jangan mengubah isi equation menjadi executable code.
- Jangan mencatat password, token, secret, atau data pribadi ke log.
- Pertahankan otorisasi guru/siswa dan pembatasan akses kelas.
- Pertahankan session dan Socket.io contract yang sudah berjalan.
- Jangan menghapus data tugas atau soal lama.

## Tahapan Pengerjaan

Kerjakan secara berurutan:

1. Audit komponen question/task/game yang sudah ada.
2. Audit payload REST dan Socket.io yang membawa soal.
3. Tambahkan dependency dan stylesheet equation renderer.
4. Buat `MathText` reusable beserta parser/fallback yang aman.
5. Integrasikan ke preview/editor soal guru.
6. Integrasikan ke semua screen soal siswa dan realtime.
7. Terapkan visual redesign TOMAT pada screen target tanpa mengubah behavior yang sudah benar.
8. Pastikan data lama tetap tampil.
9. Tambahkan verifikasi untuk plain text, LaTeX inline, LaTeX display, Unicode equation, multiline, equation invalid, dan equation panjang.
10. Jalankan build dan verifikasi workflow yang relevan.

## Kriteria Penerimaan

Implementasi dianggap selesai jika semua kondisi berikut terpenuhi:

- Guru dapat menyalin string equation LaTeX ke editor soal.
- Setelah paste, preview langsung menampilkan equation ter-render.
- Equation tetap tersimpan sebagai source text, bukan gambar atau HTML.
- Guru dapat mengisi `Nama Mata Pelajaran` saat membuat tugas.
- Nama mata pelajaran tampil pada preview, daftar tugas, halaman pengerjaan, nilai, histori, dan notifikasi yang relevan.
- Tugas lama tanpa data mapel tetap tampil dengan fallback `Matematika`.
- Soal lama yang hanya berupa plain text tetap tampil normal.
- `$x^2$`, `$$\frac{a}{b}$$`, `\sqrt{x}`, Unicode `x²`, dan equation multiline dapat ditampilkan.
- LaTeX invalid tidak membuat halaman blank atau crash.
- Equation muncul konsisten pada tugas, game, duel, turnamen, Boss Raid, mode ujian, MOBA question modal, review, dan preview guru.
- Payload realtime membawa equation tanpa mengubah scoring server.
- Reconnect tidak menghilangkan equation yang sedang aktif.
- Mobile tidak mengalami horizontal overflow pada layout utama.
- Tidak ada raw HTML injection dari isi soal.
- Build frontend berhasil.
- Tidak ada error baru di browser console pada preview utama dan mockup sandbox.
- UI tetap menggunakan tema dark space TOMAT, warna indigo, label Indonesia, zona resmi, Pet Tomi guinea pig, dan navigasi yang sudah ditentukan.

## Output yang Diharapkan dari Implementer

Setelah selesai:

1. Jelaskan file yang diubah.
2. Jelaskan format equation yang didukung.
3. Jelaskan cara guru menulis atau menempel equation.
4. Jelaskan fallback jika equation invalid.
5. Jelaskan endpoint/payload yang ikut berubah jika ada.
6. Laporkan perintah build/verifikasi yang dijalankan dan hasilnya.
7. Jangan menyatakan selesai jika hanya mockup yang berubah sementara flow aplikasi utama belum memakai renderer equation.