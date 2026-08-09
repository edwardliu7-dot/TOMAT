# TOMAT MOBA — Hasil Audit Hari 1

> **Tanggal audit:** 7 Agustus 2026  
> **Scope:** audit repository dan keputusan integrasi  
> **Status:** selesai  
> **Batas:** tidak membuat fitur MOBA, tidak mengubah schema database, dan tidak mengubah alur mode individu.

Dokumen ini mencatat titik integrasi yang ditemukan untuk melanjutkan roadmap
`docs/tomat-moba-edukasi-arsitektur-roadmap.md`.

## 1. Ringkasan keputusan integrasi

1. **MOBA memakai route, state, dan namespace Socket.io sendiri.**
   - Route yang disiapkan pada tahap implementasi: `moba-lobby`, `moba-match`,
     dan `moba-result`.
   - Event baru memakai prefix `moba:*`.
   - Jangan menumpangkan state atau lifecycle MOBA ke `duel-lobby`,
     `duel-katak`, `duelState`, atau `tournamentMatchData`.

2. **Server Socket.io yang sudah ada digunakan ulang.**
   - Tidak perlu membuat `http.Server`, session middleware, atau koneksi
     Socket.io kedua.
   - Handler MOBA nantinya ditambahkan sebagai modul terpisah yang dipasang
     melalui `setupMultiplayer()` atau adapter yang jelas dari sana.

3. **Session siswa yang sudah tervalidasi menjadi sumber identitas socket.**
   - Server mengambil user dari `socket.request.session.user`.
   - Payload MOBA tidak boleh menerima `playerId` atau identitas siswa sebagai
     sumber kebenaran.

4. **State pertandingan MOBA tetap in-memory dan server-authoritative.**
   - Pola ini konsisten dengan duel, turnamen, dan boss raid yang sudah ada.
   - Database hanya dipakai untuk kebutuhan persisten setelah mekanik MOBA
     stabil, sesuai roadmap.

5. **Pet dan sprite yang sudah ada digunakan ulang.**
   - Loadout aktif berasal dari `students.equipped_pet_skin`.
   - Renderer `PetSVG` dan sprite khusus Pet dapat dipakai kembali untuk arena,
     HUD, dan roster.
   - Bonus MOBA harus dibuat sebagai aturan server khusus; jangan memakai
     multiplier coin/EXP biasa sebagai pengganti aturan skor Tower/Base.

## 2. Audit backend dan Socket.io

### 2.1 Pembuatan server dan session

Lokasi utama:

- `server/index.js:90-158` membuat Express dan shared
  `express-session` dengan PostgreSQL session store pada tabel
  `tomat_sessions`.
- `server/index.js:196-200` membuat `http.createServer(app)`, memasang
  `setupMultiplayer(httpServer, sessionMiddleware)`, lalu membagikan instance
  Socket.io ke modul boss dan turnamen melalui `setIo()` dan
  `setTournamentIo()`.
- `server/multiplayer.js:200-218` membuat Socket.io pada path
  `/socket.io`, mengaktifkan credentials, dan menjalankan session middleware
  pada Engine.IO request.
- `src/socket.js:9-39` menyediakan client singleton `getSocket()` dan
  `connectSocket()` dengan `withCredentials: true`, reconnect delay 1–5
  detik, serta transport websocket-only untuk Capacitor.

**Reuse untuk MOBA:** `src/socket.js`, session middleware yang sama, path
`/socket.io`, dan pola pemasangan pada raw HTTP server.

### 2.2 Identitas dan validasi koneksi

`server/multiplayer.js:220-241`:

- mengambil `socket.request.session.user`;
- menolak koneksi tanpa session atau role selain `siswa`/`guru`;
- menyimpan `socket.data.userId` dan `socket.data.role`;
- mendaftarkan koneksi ke `userSockets`;
- otomatis memasukkan siswa ke room `kelas:<kelas>` bila kelas tersedia.

Untuk MOBA, handler tetap harus memvalidasi role, kepemilikan match, status
connected, dan keanggotaan tim pada setiap aksi. `socket.data.userId` adalah
identitas teknis, bukan payload yang boleh ditentukan klien.

### 2.3 Room dan lifecycle yang sudah ada

Temuan room:

- duel: kode room enam karakter pada `rooms` Map di
  `server/multiplayer.js`;
- notifikasi kelas: `kelas:<kelas>`;
- boss raid: `boss:<kelas>`;
- turnamen: `tournament:<tournamentId>`;
- match turnamen: `match.roomCode`;
- spectator turnamen: `match-spectate:<matchId>`.

Temuan penting:

- duel menyimpan state room dan timer di `server/multiplayer.js`;
- turnamen menyimpan registry/lobby pada `server/tournament-state.js`, lalu
  engine dan timer pada `server/tournament-engine.js`;
- boss menyimpan state pada `server/boss-state.js` dan dapat menerima push
  dari REST melalui `setIo()`;
- state tersebut process-local, bukan Redis/shared state lintas instance.

**Keputusan:** MOBA memiliki registry dan room sendiri, misalnya room
berdasarkan `matchId`. Jangan menggunakan kode room duel karena duel
berasumsi dua pemain dan satu pertandingan soal.

### 2.4 Konvensi event yang tersedia

Namespace yang sudah dipakai:

- `duel:*`
- `boss:*`
- `tournament:*`
- `mission:*`

MOBA harus menggunakan `moba:*` untuk menghindari listener silang. Nama event
yang direncanakan pada roadmap (`moba:state_snapshot`,
`moba:node_spawned`, `moba:question_opened`, dan seterusnya) konsisten dengan
konvensi yang sudah ada.

### 2.5 Pola keamanan state

Pola yang dapat digunakan ulang:

- soal duel dikirim tanpa jawaban benar;
- state turnamen disanitasi melalui DTO sebelum dikirim;
- boss menggunakan `raidToClient()` untuk menghapus field server-only.

MOBA wajib memakai sanitizer tersendiri. Snapshot publik tidak boleh
memuat `answer`, `correctAnswer`, bank soal, question session server-only,
atau field privat lawan.

## 3. Audit frontend

### 3.1 Navigasi dan route

`src/App.jsx` memakai stack navigation:

- `navigate()` menambah route;
- `goBack()` menghapus route terakhir;
- `replaceTop()` mengganti screen aktif.

`src/App.jsx:908-917` menampilkan `ModeSelectScreen` dan saat ini hanya
menyediakan callback `onDuel` untuk mengarah ke `duel-lobby`.

`src/App.jsx:967-1015` menangani:

- `duel-lobby` → `LobbyScreen`;
- `duel-katak` → `DuelKatakScreen`;
- `tournament-wait` dan `tournament-match` untuk turnamen;
- `boss-raid` untuk boss raid.

**Titik integrasi yang disarankan:**

- tambahkan callback/pintu masuk MOBA terpisah dari `onDuel`;
- tambahkan route `moba-lobby`, `moba-match`, dan hasil bila diperlukan;
- simpan `mobaMatchData` atau state domain MOBA terpisah;
- jangan mengubah `pendingGame`/`handleModeSelected()` menjadi state MOBA
  generik karena saat ini alurnya khusus game individu.

### 3.2 Mode individu versus multiplayer

`src/screens/ModeSelectScreen.jsx:145-291` mengelola Latihan Bebas, Mode
Tugas, dan Mode Duel. Mode Duel saat ini:

- hanya muncul bila prop `onDuel` tersedia;
- memakai asumsi pertandingan 1v1;
- menonaktifkan multiplayer ketika Pet mati;
- memakai copy dan alur duel soal tunggal.

MOBA harus menjadi pilihan multiplayer yang berdampingan, tetapi lifecycle-nya
tidak boleh mengganggu sesi game individu. Feature flag atau akses terbatas
dapat ditambahkan pada tahap roadmap Hari 14, bukan saat audit ini.

### 3.3 Pola lobby yang bisa digunakan sebagai referensi

`src/screens/LobbyScreen.jsx` memakai fase:

`menu → creating/joining → waiting → ready → countdown`

Pola yang berguna:

- listener dipasang sebelum emit;
- `useRef` menyimpan room code dan index terbaru;
- listener dibersihkan saat unmount;
- handoff pertandingan dilakukan melalui callback `onStart`.

Yang **tidak** boleh disalin langsung:

- asumsi dua pemain;
- host/index tunggal;
- kode room enam karakter;
- event `duel:*`;
- alur slider dan satu soal per ronde.

`src/screens/TournamentWaitScreen.jsx` memberi referensi untuk lobby
multianggota dan state bracket, tetapi MOBA tetap membutuhkan kontrak lobby
sendiri karena format tim MOBA berbeda dari turnamen.

### 3.4 State, reconnect, dan error

Repository saat ini lebih banyak memakai `useState`/`useEffect` daripada
`useReducer`:

- `DuelKatakScreen.jsx` memakai state fase gameplay;
- `TournamentMatchScreen.jsx` memiliki state koneksi dan reconnect;
- `TaskContext.jsx` mempertahankan sesi tugas ketika submit gagal;
- `AuthContext.jsx` memiliki timeout bootstrap 8 detik.

**Keputusan untuk tahap implementasi:** MOBA sebaiknya memakai reducer atau
state machine domain sendiri karena menerima event berulang untuk posisi,
node, soal, setoran, fase, dan reconnect. Ini bukan perubahan pada context
yang sudah ada.

State UI minimum yang perlu dipisahkan:

- `loading`;
- `connection`;
- `reconnecting`;
- `match`;
- `self`;
- `players`;
- `nodes`;
- `activeQuestion`;
- `lastError`;
- `eventFeed`;
- `matchEnded`/`left`.

`DuelKatakScreen.jsx` dapat menjadi referensi reconnect melalui `duel:rejoin`,
sedangkan `TournamentMatchScreen.jsx` menjadi referensi banner
`isReconnecting`. MOBA harus memiliki event leave sendiri dan tidak boleh
mengirim `duel:leave`.

## 4. Audit autentikasi dan Pet

### 4.1 Session dan user

`server/auth.js:53-81` melakukan sanitasi user. Untuk siswa, `/me` dan login
menyertakan antara lain:

- `id`;
- `name`/`username`;
- `role`;
- `kelas`;
- `equippedPetSkin`;
- `petIsDead`;
- coin, level, dan EXP.

`src/AuthContext.jsx` sudah menghidrasi session user dan memiliki timeout
bootstrap. MOBA dapat memakai `useAuth()` dan tidak membutuhkan login kedua.

### 4.2 Sumber Pet aktif

Temuan:

- field database authoritative adalah `students.equipped_pet_skin`;
- endpoint Pet berada pada `server/pet.js`;
- hunger disimpan pada `pet_hunger_map`;
- normalisasi tipe Pet dan fallback legacy berada pada
  `server/pet-state.js`;
- `src/PetContext.jsx` menyediakan state Pet di klien;
- `PetSVG.jsx` menjadi dispatcher renderer Pet.

Pet yang aktif harus dibaca/ditetapkan dari session dan database server saat
join. Klien tidak boleh mengirim `petType` atau `petSkinId` untuk memaksa
loadout pertandingan.

### 4.3 Mapping tipe dan konflik nama

`server/pet-state.js` memetakan:

- `golden` dan `pet_skin_*` → `tomi`;
- `pet_kelinsay*` → `kelinsay`;
- `pet_monyong*` → `monyang`;
- `pet_komodih` → `komodih`;
- `pet_nananaga*` → `nananaga`.

Konflik yang harus didokumentasikan saat implementasi:

- skin `pet_monyong` memakai tipe internal `monyang`;
- branding Komodih memiliki variasi `KomoDIH`/`komodih`;
- beberapa skin musiman ada di client tetapi tidak memiliki entri eksplisit
  pada semua tabel server;
- default unknown pada resolver mengarah ke Tomi, sehingga input skin harus
  divalidasi server sebelum pertandingan.

### 4.4 Bonus Pet dan batas reuse

`server/pet-bonuses.js` adalah sumber authoritative bonus ekonomi/EXP dan
imunitas. `src/petBonuses.js` hanya mirror untuk pengalaman UI/client.

Bonus yang ada saat ini tidak otomatis menjadi bonus MOBA:

- multiplier coin/EXP biasa bukan pengganti skor setoran;
- hunger multiplier bukan movement speed;
- imunitas Nananaga sudah terkait duel/turnamen/survival.

Saat Hari 8 dikerjakan, aturan MOBA harus memakai modul pet-effects khusus
yang mengambil tipe/skin server-side dan menguji:

- Kelinsay: speed hanya ketika tanpa gulungan;
- Monyang: kapasitas dua gulungan;
- Tomi: bonus setoran;
- Nananaga: imunitas soal hard sesuai kontrak MOBA.

### 4.5 Sprite

Renderer yang dapat digunakan ulang:

- `src/components/PetSVG.jsx`;
- `TomiSprite.jsx`;
- `KelinsaySprite.jsx`;
- `MonyangSprite.jsx`;
- `NananagaSprite.jsx`;
- renderer Komodih yang dirujuk oleh `PetSVG`.

Sprite sheet yang sudah dipakai berukuran 768×768 dengan grid 6×6 dan sel
128×128. Arena sebaiknya memanggil renderer yang ada dengan state dan skin
yang sudah tervalidasi, bukan membuat asset karakter baru.

## 5. Konflik integrasi yang wajib dihindari

| Area | Jangan lakukan | Gunakan |
|---|---|---|
| Socket server | membuat server/socket singleton kedua | `setupMultiplayer()` dan session middleware yang sama |
| Client socket | membuat `io()` baru di screen | `getSocket()`/`connectSocket()` |
| Identitas | menerima user/player ID dari payload | `socket.request.session.user` dan `socket.data.userId` |
| Room | memakai room duel atau turnamen | registry dan room `moba` sendiri |
| Event | memakai `duel:*` atau `tournament:*` | namespace `moba:*` |
| App state | menumpangkan ke `duelState`/`tournamentMatchData` | state MOBA terisolasi |
| Mode individu | mengubah lifecycle game soal yang ada | pintu masuk dan route multiplayer terpisah |
| Pet | membuat avatar atau loadout MOBA kedua | `equipped_pet_skin`, PetContext, dan PetSVG |
| Skor | menghitung reward final di klien | service scoring authoritative di server |
| Database | memindahkan active match ke schema baru | in-memory state sampai ada kebutuhan persistence |

## 6. Rencana urutan implementasi setelah Hari 1

Urutan roadmap tetap aman sebagai berikut:

1. Hari 2: konfigurasi dan model state murni;
2. Hari 3: match manager/lifecycle;
3. Hari 4–8: node, soal, gerak, scoring, dan efek Pet;
4. Hari 9: adapter Socket.io dan reconnect;
5. Hari 10: reducer dan hook frontend;
6. Hari 11–12: arena/HUD/modal soal;
7. Hari 13–14: hardening, reward, feature flag, dan kesiapan rilis.

Tidak ada pekerjaan Hari 2 atau UI arena yang dilakukan dalam audit ini.

## 7. Kriteria selesai Hari 1

- [x] Lokasi integrasi Socket.io dan session ditemukan.
- [x] Pola lobby/room/match yang sudah ada dipetakan.
- [x] Route dan UI untuk mode individu versus multiplayer dipetakan.
- [x] Sistem auth siswa dan identitas socket dipetakan.
- [x] Sistem Pet, loadout, bonus, dan sprite dipetakan.
- [x] Konflik nama dan batas reuse dicatat.
- [x] Tidak ada fitur MOBA yang dibuat.
- [x] Tidak ada perubahan schema database.