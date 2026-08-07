# TOMAT — Arsitektur Mode MOBA Edukasi Non-Combat

> **Status:** fondasi Hari 1–7 sudah diimplementasikan dan diverifikasi; integrasi Socket.io/frontend dimulai pada Hari 9–12
> **Tujuan dokumen:** menjadi spesifikasi teknis sekaligus roadmap pengerjaan berkala.  
> **Batas sesi:** setiap hari dirancang sebagai satu unit kerja yang dapat dikerjakan oleh satu akun dengan limit harian gratis. Jangan menggabungkan dua hari dalam satu sesi kecuali pekerjaan hari sebelumnya sudah selesai dan terverifikasi.

## 1. Ringkasan fitur

Mode ini adalah mode multiplayer tim **2 dimensi (2D)** yang hadir **berdampingan dengan mode individu** di TOMAT, bukan pengganti mode individu. Karena jumlah siswa TISA masih terbatas, format pertandingan dibatasi menjadi **1v1, 2v2, atau 3v3**, dengan durasi sekitar 10 menit. Karakter yang bergerak di arena adalah **Pet milik siswa**, bukan avatar manusia terpisah. Pemain tidak menyerang pemain lain secara langsung. Mereka:

1. bergerak di arena;
2. mengambil titik soal yang muncul secara dinamis;
3. menjawab soal;
4. membawa **Gulungan Soal** ke area base lawan;
5. mengisi dan menghancurkan Tower Luar;
6. menyetor gulungan ke Base Utama setelah jalur terbuka;
7. mengumpulkan poin terbanyak sampai waktu berakhir.

Semua keputusan penting harus diproses server. Klien hanya mengirim niat pemain dan menampilkan state terbaru.

### 1.1 Hubungan dengan mode individu

TOMAT memiliki dua jalur bermain yang terpisah:

- **Mode individu:** siswa mengerjakan game matematika sendiri, termasuk Latihan Bebas, Mode Tugas, dan mode individu lain yang sudah tersedia.
- **Mode MOBA multiplayer 2D:** siswa masuk ke lobby pertandingan 1v1, 2v2, atau 3v3 dan mengendalikan Pet masing-masing secara real-time bersama siswa lain.

Mode MOBA tidak menghapus, menggantikan, atau mengubah alur mode individu. Keduanya harus memiliki:

- pilihan masuk yang berbeda pada UI;
- state pertandingan yang terisolasi dari state game individu;
- lifecycle dan error handling yang tidak mengganggu sesi individu;
- aturan reward yang tidak menggandakan reward dari mode individu;
- feature flag atau akses terbatas agar mode MOBA dapat dinonaktifkan tanpa mematikan game individu.

Satu siswa tidak boleh berada di dua pertandingan MOBA aktif sekaligus. Siswa tetap dapat kembali ke mode individu setelah pertandingan MOBA selesai atau dibatalkan.

### 1.2 Model karakter 2D berbasis Pet

- Setiap siswa direpresentasikan di arena oleh satu Pet aktif.
- Sprite, animasi, nama tampilan, dan efek status yang terlihat adalah milik Pet.
- `petType` dan `petSkinId` diambil dari loadout siswa yang sudah tervalidasi server.
- Pet yang dipakai dikunci ketika siswa masuk pertandingan; pergantian Pet hanya boleh dilakukan sebelum join.
- Tidak ada karakter manusia 3D, kamera 3D, atau engine 3D dalam MVP.
- Arena menggunakan koordinat 2D pada bidang `x/y`; lane, node soal, tower, dan base juga dirender sebagai elemen 2D.
- Buff Pet memengaruhi aturan server, sedangkan sprite Pet memberi umpan balik visual atas status seperti membawa gulungan, stun, atau shield.

## 2. Konteks teknologi dan batasan proyek

- Frontend: React 18 + Vite
- Mobile: Capacitor 8 untuk Android APK
- Backend: Node.js + Express
- Real-time: Socket.io
- Aplikasi utama: TOMAT di repository ini
- Mode baru harus mengikuti pola autentikasi, sesi siswa, pet, dan multiplayer yang sudah ada
- Jangan membuat sistem login atau pet kedua jika sistem yang sudah ada dapat digunakan kembali
- Karakter gameplay harus menggunakan Pet dan sistem skin Pet yang sudah ada; jangan membuat avatar karakter baru khusus MOBA
- Mode ini adalah 2D; jangan menambahkan dependensi rendering 3D untuk kebutuhan MVP
- Mode MOBA boleh memiliki lobby pertandingan sendiri, tetapi lobby tersebut harus hanya mengelola pertandingan MOBA dan tidak menggantikan lobby/flow mode individu
- Ukuran pertandingan yang valid hanya `1v1`, `2v2`, dan `3v3`; ukuran lain harus ditolak server
- Satu pertandingan memiliki jumlah pemain yang sama di kedua tim: 1 lawan 1, 2 lawan 2, atau 3 lawan 3
- Jangan memindahkan state pertandingan aktif ke database sebagai sumber kebenaran utama
- Database hanya digunakan untuk data yang memang perlu disimpan setelah pertandingan, misalnya hasil, statistik, atau reward

## 3. Keputusan desain utama

### 3.1 Server authoritative

Server adalah sumber kebenaran untuk:

- posisi dan validitas gerak pemain;
- node yang aktif;
- siapa yang berhasil mengklaim node;
- timer soal;
- benar atau salahnya jawaban;
- isi gulungan dan jumlah gulungan;
- status stun;
- kapasitas gulungan;
- poin Tower Luar;
- HP/poin Base Utama;
- waktu pertandingan;
- hasil akhir dan reward.

Klien tidak boleh:

- mengirim skor akhir;
- menentukan dirinya menyentuh node;
- menentukan jawaban benar;
- menambah gulungan atau poin secara lokal lalu meminta server menyimpannya;
- memaksa fase pertandingan;
- mengubah tipe pet di tengah pertandingan.

### 3.2 Model arena dua sisi

Gunakan dua tim tetap dengan ukuran yang ditentukan oleh `teamSize`:

```text
match.teamSize = 1 | 2 | 3
teamA[teamSize] -> towerA -> baseA
teamB[teamSize] -> towerB -> baseB
```

Pemain dari `teamA` menyetor ke target milik `teamB`, dan sebaliknya. Nama yang tampil ke pengguna boleh berupa nama kelas atau nama tim, tetapi state internal menggunakan ID yang stabil. Arena dan aturan skor tetap sama untuk 1v1, 2v2, dan 3v3; yang berubah hanya jumlah pemain per tim.

### 3.3 Poin dan HP

Konfigurasi awal yang disarankan:

| Komponen | Nilai |
|---|---:|
| Node hijau / mudah | 10 poin |
| Node kuning / sedang | 25 poin |
| Node merah / sulit | 50 poin |
| HP Tower Luar | 100 poin |
| Durasi pertandingan | 600 detik |
| Stun karena jawaban salah | 3 detik |
| Bonus Tomi | +20% poin setoran |
| Bonus Kelinsay | +15% kecepatan tanpa gulungan |
| Kapasitas dasar | 1 gulungan |
| Kapasitas Monyong | 2 gulungan |

Nilai ini harus diletakkan di satu konfigurasi mode, bukan disebar di komponen React dan handler Socket.io.

### 3.4 Urutan fase

```text
lobby
  -> countdown
  -> running_outer_tower
  -> running_main_base
  -> finished
```

`running_main_base` hanya boleh dimulai jika setidaknya satu Tower Luar telah hancur. Jika waktu habis, server langsung menghitung pemenang tanpa menunggu animasi klien.

## 4. Struktur state pertandingan di backend

Buat modul state khusus mode ini. Nama file final mengikuti struktur server yang sudah ada, tetapi bentuk datanya sebaiknya setara dengan berikut:

```js
const match = {
  id: "match-id",
  mode: "tomat-moba",
  teamSize: 1, // hanya 1, 2, atau 3
  phase: "lobby",
  createdAt: 0,
  startedAt: null,
  endsAt: null,
  tick: 0,
  config: {
    durationMs: 600_000,
    nodeSpawnIntervalMs: 8_000,
    maxActiveNodes: 12,
    towerMaxPoints: 100,
    wrongAnswerStunMs: 3_000,
  },
  teams: {
    teamA: {
      id: "teamA",
      name: "Tim A",
      playerIds: [],
      maxPlayers: 1,
      tower: { points: 0, maxPoints: 100, destroyed: false },
      base: { points: 0, maxPoints: 100, hp: 100 },
    },
    teamB: {
      id: "teamB",
      name: "Tim B",
      playerIds: [],
      maxPlayers: 1,
      tower: { points: 0, maxPoints: 100, destroyed: false },
      base: { points: 0, maxPoints: 100, hp: 100 },
    },
  },
  players: new Map(), // playerId -> PlayerState
  activeNodes: new Map(), // nodeId -> QuestionNode
  questions: new Map(), // questionId -> server-only question data
  timers: {
    spawn: null,
    finish: null,
  },
  eventSeq: 0,
};
```

State pemain:

```js
{
  id,
  teamId,
  userId,
  displayName,
  petType,                 // tomi | kelinsay | monyang | nananaga
  petSkinId,               // skin Pet yang dikunci saat join pertandingan
  position: { x, y, lane },
  connected,
  lastInputAt,
  stunUntil: 0,
  claimedNodeId: null,
  questionSession: null,   // server-only reference
  scrolls: [
    { id, points, difficulty, questionId, earnedAt }
  ],
  maxScrolls: 1,
  score: 0,
  answeredCorrect: 0,
  answeredWrong: 0,
  deposits: 0,
  immunityAvailable: false,
}
```

Node yang dikirim ke klien tidak boleh memuat jawaban:

```js
{
  id,
  difficulty: "easy",      // easy | medium | hard
  points: 10,
  position: { x, y, lane },
  status: "available",      // available | claimed | expired
  claimedBy: null,
  spawnedAt,
  expiresAt,
}
```

Data soal dan jawaban benar disimpan di `questions` yang hanya dapat diakses oleh server. Klien menerima teks soal dan pilihan jawaban tanpa field jawaban benar.

## 5. Invariant yang wajib dijaga server

Handler harus menolak aksi jika salah satu kondisi ini terjadi:

- pertandingan bukan pada fase yang sesuai;
- socket tidak terdaftar sebagai pemain pertandingan;
- pemain bukan anggota tim yang diklaimnya;
- `teamSize` bukan 1, 2, atau 3;
- tim sudah penuh sesuai `teamSize`;
- pertandingan belum memenuhi jumlah pemain minimum untuk format yang dipilih;
- pemain sedang stun;
- pemain sudah memiliki soal aktif;
- node tidak ada, sudah kedaluwarsa, atau sudah diklaim;
- posisi pemain berada di luar jarak interaksi node;
- jawaban dikirim setelah batas waktu;
- pemain sudah mencapai kapasitas gulungan;
- target setor masih memiliki Tower Luar;
- target setor bukan base lawan;
- gulungan yang disetor bukan milik pemain;
- event dikirim ulang dengan `actionId` yang sama;
- input gerak terlalu cepat atau melampaui batas kecepatan.

Setiap penolakan mengembalikan error terstruktur dan tidak mengubah state.

```js
{
  code: "NODE_NOT_AVAILABLE",
  message: "Titik soal sudah diambil pemain lain.",
  actionId
}
```

## 6. Alur event Socket.io

### 6.1 Event server ke klien

| Event | Isi | Penerima |
|---|---|---|
| `moba:state_snapshot` | state aman lengkap saat masuk/reconnect | satu pemain |
| `moba:match_started` | waktu mulai dan waktu berakhir | satu room |
| `moba:node_spawned` | node tanpa jawaban | satu room |
| `moba:node_claimed` | node dan pemain yang mengklaim | satu room |
| `moba:question_opened` | soal untuk pengklaim | socket pengklaim |
| `moba:question_closed` | hasil jawaban dan perubahan pemain | room atau pemain |
| `moba:player_updated` | posisi/status publik pemain | satu room |
| `moba:scroll_deposited` | setoran dan skor terbaru | satu room |
| `moba:tower_destroyed` | tower terbuka/hancur | satu room |
| `moba:match_finished` | hasil final | satu room |
| `moba:error` | penolakan aksi | socket pengirim |

### 6.2 Event klien ke server

| Event | Payload minimum |
|---|---|
| `moba:join` | `matchId` |
| `moba:ready` | tidak ada atau `ready: true` |
| `moba:move` | `{ actionId, direction, clientPosition }` |
| `moba:claim_node` | `{ actionId, nodeId }` |
| `moba:answer_question` | `{ actionId, questionSessionId, answer }` |
| `moba:deposit_scroll` | `{ actionId, targetId, scrollId }` |
| `moba:leave` | tidak ada |

Semua event aksi memakai `actionId` unik. Server menyimpan action ID terakhir dalam jangka pendek agar retry dari jaringan buruk tidak menggandakan reward atau setoran.

### 6.3 Contoh `spawn_node`

```js
function spawnNode(match) {
  if (match.phase !== "running_outer_tower" &&
      match.phase !== "running_main_base") return;

  if (match.activeNodes.size >= match.config.maxActiveNodes) return;

  const difficulty = chooseDifficulty(match);
  const node = {
    id: createId("node"),
    difficulty,
    points: POINTS_BY_DIFFICULTY[difficulty],
    position: randomValidSpawn(match),
    status: "available",
    claimedBy: null,
    spawnedAt: Date.now(),
    expiresAt: Date.now() + NODE_TTL_MS,
  };

  match.activeNodes.set(node.id, node);
  io.to(matchRoom(match.id)).emit("moba:node_spawned", publicNode(node));
  scheduleNodeExpiry(match, node.id);
}
```

Aturan penting:

- random spawn menggunakan generator server;
- posisi harus berada di area yang valid dan tidak menimpa base, pemain, atau node lain;
- node kedaluwarsa dihapus server lalu disiarkan sebagai expired;
- interval spawn dan TTL dapat dikonfigurasi untuk pengujian.

### 6.4 Contoh `claim_node`

```js
socket.on("moba:claim_node", ({ actionId, nodeId }, ack) => {
  const result = claimNode({
    match,
    playerId: socket.data.playerId,
    nodeId,
    actionId,
  });

  if (!result.ok) {
    emitMobaError(socket, result.error);
    return ack?.(result);
  }

  io.to(matchRoom(match.id)).emit("moba:node_claimed", {
    nodeId,
    playerId: result.player.id,
  });

  socket.emit("moba:question_opened", sanitizeQuestion(result.question));
  ack?.({ ok: true, questionSessionId: result.questionSessionId });
});
```

`claimNode` harus melakukan validasi jarak dan status secara atomik dalam satu event loop. Pemain kedua yang mengirim event sesudah state berubah harus menerima `NODE_NOT_AVAILABLE`.

### 6.5 Contoh `answer_question`

```js
socket.on("moba:answer_question", (payload, ack) => {
  const result = answerQuestion({
    match,
    playerId: socket.data.playerId,
    ...payload,
  });

  if (!result.ok) {
    emitMobaError(socket, result.error);
    return ack?.(result);
  }

  socket.emit("moba:question_closed", result.privateResult);
  io.to(matchRoom(match.id)).emit("moba:player_updated", result.publicPlayer);
  ack?.({ ok: true });
});
```

Hasil benar:

- node dihapus dari `activeNodes`;
- gulungan dibuat sesuai nilai node;
- kapasitas pemain diperiksa;
- statistik jawaban diperbarui;
- buff pet yang relevan dicatat untuk fase setor.

Hasil salah:

- gulungan tidak dibuat;
- statistik salah bertambah;
- `stunUntil` diisi tiga detik ke depan;
- Nananaga pada soal hard boleh memakai imunitas satu kali sesuai aturan pet;
- soal aktif ditutup.

### 6.6 Contoh `deposit_scroll`

```js
socket.on("moba:deposit_scroll", ({ actionId, targetId, scrollId }, ack) => {
  const result = depositScroll({
    match,
    playerId: socket.data.playerId,
    targetId,
    scrollId,
    actionId,
  });

  if (!result.ok) {
    emitMobaError(socket, result.error);
    return ack?.(result);
  }

  io.to(matchRoom(match.id)).emit("moba:scroll_deposited", {
    playerId: result.playerId,
    targetId,
    scrollId,
    awardedPoints: result.awardedPoints,
    tower: result.tower,
    base: result.base,
  });

  if (result.towerDestroyed) {
    io.to(matchRoom(match.id)).emit("moba:tower_destroyed", {
      targetId,
      phase: match.phase,
    });
  }

  ack?.({ ok: true, awardedPoints: result.awardedPoints });
});
```

Perhitungan poin harus berada di server:

```js
const awardedPoints = Math.round(scroll.points * petDepositMultiplier(player.petType));
```

Tomi memberi bonus setoran. Kelinsay hanya mempercepat gerak ketika `scrolls.length === 0`. Monyong menambah kapasitas. Nananaga menangani imunitas jawaban hard, bukan bonus setoran.

## 7. Siklus hidup pertandingan

1. **Membuat lobby:** server membuat `matchId`, memilih `teamSize` 1, 2, atau 3, lalu membuat room Socket.io.
2. **Join:** server memvalidasi siswa, kelas, format pertandingan, jumlah pemain, dan tim.
3. **Ready check:** pertandingan hanya mulai jika syarat minimal pemain terpenuhi.
4. **Countdown:** server menyiarkan `match_started` dengan timestamp absolut.
5. **Running:** server menjalankan spawn node, expiry node, validasi gerak, soal, setoran, dan timer.
6. **Tower hancur:** fase berpindah ke `running_main_base` jika syarat terpenuhi.
7. **Finish:** timer server menghentikan aksi, menghitung pemenang, dan mengirim snapshot final.
8. **Cleanup:** timer dibersihkan, room ditutup setelah grace period reconnect, dan ringkasan dapat disimpan.

Gunakan timestamp server, bukan jumlah pengurangan timer dari klien. Tampilan timer klien menghitung:

```text
remainingMs = endsAt - currentClientTime
```

Kemudian lakukan sinkronisasi ulang setiap menerima snapshot atau event penting.

## 8. Struktur modul yang disarankan

Nama dan lokasi final harus disesuaikan setelah audit repository. Pemisahan tanggung jawab yang diharapkan:

```text
server/
  moba/
    config.js              # angka dan aturan mode
    match-manager.js       # lifecycle dan registry match
    match-state.js         # factory serta invariant state
    node-service.js        # spawn, expiry, claim
    question-service.js    # sesi soal dan validasi jawaban
    movement-service.js    # validasi gerak dan collision
    scoring-service.js     # tower, base, dan pemenang
    pet-effects.js         # buff pet khusus mode ini
    socket-handlers.js     # adapter event Socket.io
    public-state.js        # sanitasi state untuk klien
    tests/

src/
  features/moba/
    MobaScreen.jsx
    MobaArena.jsx
    MobaHud.jsx
    MobaQuestionModal.jsx
    MobaNode.jsx
    MobaPet.jsx             # karakter 2D yang dirender di arena
    MobaBase.jsx
    useMobaSocket.js
    mobaReducer.js
    mobaTypes.js
```

Jangan membuat file besar yang mencampur reducer React, handler Socket.io, aturan skor, dan rendering peta.

## 9. Struktur frontend React

### 9.1 Komponen inti

- `MobaScreen`: route, loading, error, reconnect, dan lifecycle pertandingan.
- `MobaArena`: wrapper peta dan koordinat arena.
- `MobaPet`: sprite Pet 2D, nama siswa, tim, stun, shield, dan gulungan.
- `MobaNode`: node hijau/kuning/merah dengan status available/claimed.
- `MobaBase`: tower, base, HP/poin, dan indikator jalur terbuka.
- `MobaHud`: timer, skor, jumlah gulungan, pet, dan status koneksi.
- `MobaQuestionModal`: soal aktif, countdown jawaban, pilihan jawaban, dan hasil.
- `MobaEventFeed`: event penting seperti tower hancur atau pemain gagal.
- `MobaReconnectOverlay`: snapshot sedang dipulihkan atau pertandingan sudah berakhir.

### 9.2 State React

Gunakan reducer atau state store khusus agar event Socket.io tidak tersebar di banyak komponen:

```js
const initialState = {
  connection: "idle",
  match: null,
  self: null,
  players: {},
  nodes: {},
  activeQuestion: null,
  lastError: null,
  eventFeed: [],
};
```

Reducer hanya menerapkan event server. Optimistic update boleh digunakan untuk animasi input, tetapi harus dibatalkan jika server mengirim posisi atau state yang berbeda.

### 9.3 Peta sederhana

Untuk MVP, gunakan peta 2D berbasis DOM/CSS dengan Pet sebagai karakter:

- arena memakai `position: relative`;
- sprite Pet, node, tower, dan base memakai `position: absolute`;
- koordinat state disimpan dalam rentang normalisasi `0..1`;
- rendering mengubah koordinat menjadi persentase;
- lane atau area interaksi ditampilkan dengan elemen dekoratif;
- sprite Pet dapat memakai asset sprite sheet 2D yang sudah tersedia;
- jangan mulai dengan canvas atau engine game jika DOM sudah memenuhi kebutuhan MVP.

Canvas atau library game baru hanya dipertimbangkan setelah mekanik server stabil dan kebutuhan performa terbukti.

## 10. Kontrak data publik

Snapshot yang dikirim ke klien harus aman:

```js
{
  matchId,
  phase,
  serverNow,
  startedAt,
  endsAt,
  teams: {
    teamA: {
      name,
      playerIds,
      tower: { points, maxPoints, destroyed },
      base: { points, maxPoints, hp },
    },
    teamB: { /* bentuk sama */ },
  },
  players: [
    {
      id,
      teamId,
      displayName,
      petType,
      petSkinId,
      position,
      stunUntil,
      scrollCount,
      maxScrolls,
      score,
    },
  ],
  nodes: [
    {
      id,
      difficulty,
      points,
      position,
      status,
      claimedBy,
      expiresAt,
    },
  ],
}
```

Jangan pernah memasukkan `answer`, `correctAnswer`, seluruh bank soal, atau informasi rahasia pemain lawan ke snapshot publik.

## 11. Reconnect, disconnect, dan idempotensi

- Socket baru harus dapat meminta `moba:state_snapshot`.
- Identitas pemain berasal dari sesi pengguna yang sudah tervalidasi, bukan dari `playerId` bebas pada payload.
- Disconnect singkat mempertahankan pemain untuk grace period.
- Pemain disconnected tidak dapat mengklaim node atau menyetor.
- Jika pemain reconnect, server mengirim state publik dan state privat soal aktif bila sesi soal belum kedaluwarsa.
- `actionId` disimpan per pemain dengan TTL terbatas.
- Ketika pertandingan selesai, semua aksi baru ditolak dengan `MATCH_FINISHED`.
- Timer dan interval harus dibersihkan pada finish, destroy, dan error.

## 12. Pengujian minimum sebelum dianggap selesai

### Backend

- dua pemain yang mengklaim node yang sama hanya satu yang berhasil;
- node kedaluwarsa tidak dapat diklaim;
- jawaban benar menghasilkan satu gulungan;
- jawaban salah menghasilkan stun tiga detik;
- Nananaga hanya mencegah stun sesuai aturan hard dan tidak menggandakan gulungan;
- Monyong dapat membawa dua gulungan, pet lain tidak;
- Kelinsay mendapat speed bonus hanya tanpa gulungan;
- Tomi memberi bonus poin setoran tepat satu kali;
- tower tidak dapat disetor lagi setelah hancur;
- base lawan menerima setoran, base sendiri ditolak;
- action yang di-retry tidak menggandakan skor;
- timer pertandingan mengakhiri pertandingan walaupun tidak ada klien yang mengirim event;
- snapshot tidak membocorkan jawaban soal.

### Frontend

- peta 2D dan sprite Pet tampil dalam desktop dan viewport Android;
- timer tetap konsisten setelah reconnect;
- modal soal hanya tampil untuk pemain yang mengklaim node;
- node yang diklaim pemain lain berubah status tanpa refresh;
- tombol setoran nonaktif jika tidak ada gulungan atau jalur belum terbuka;
- overlay koneksi dan hasil akhir dapat dipahami tanpa melihat console;
- animasi tidak menjadi sumber kebenaran skor atau posisi.

## 13. Roadmap pengerjaan per hari

Setiap bagian di bawah ini adalah **satu sesi harian**. Selesaikan kriteria selesai sebelum lanjut ke hari berikutnya.

### Hari 1 — Audit repository dan keputusan integrasi

**Tujuan:** memahami titik integrasi TOMAT tanpa mengubah perilaku aplikasi.

**Pekerjaan:**

- cari implementasi Socket.io yang sudah ada;
- cari pola lobby, room, autentikasi siswa, dan identitas socket;
- cari lokasi UI yang tepat untuk menampilkan pilihan mode individu dan mode MOBA berdampingan;
- cari model pet dan bonus yang sudah berjalan;
- cari pola game screen, route, dan reducer/state;
- catat file yang akan dipakai ulang dan konflik nama yang harus dihindari;
- tambahkan catatan hasil audit ke dokumen ini atau file catatan terpisah hanya jika diperlukan.

**Batas:** tidak membuat fitur MOBA dan tidak mengubah schema database.

**Kriteria selesai:** lokasi integrasi backend, frontend, autentikasi, pet, dan test sudah teridentifikasi.

### Hari 2 — Konfigurasi dan model state murni

**Tujuan:** membuat aturan dan factory state tanpa Socket.io atau UI.

**Pekerjaan:**

- buat konfigurasi mode;
- buat `MatchState` dan `PlayerState`;
- buat helper public-state sanitizer;
- definisikan enum fase, tingkat kesulitan, dan error code;
- tambahkan unit test untuk default state dan invariant dasar.

**Kriteria selesai:** state dapat dibuat, disalin untuk snapshot, dan tidak membocorkan jawaban soal.

### Hari 3 — Match manager dan lifecycle

**Tujuan:** mengelola lobby, join, ready, countdown, running, finish, dan cleanup.

**Pekerjaan:**

- buat registry pertandingan in-memory;
- validasi format hanya `1v1`, `2v2`, atau `3v3`;
- validasi kapasitas dan keseimbangan kedua tim;
- jangan mengubah atau memblokir lobby mode individu;
- gunakan timestamp absolut untuk `startedAt` dan `endsAt`;
- implementasikan transisi fase;
- pastikan timer dibersihkan.

**Kriteria selesai:** test lifecycle untuk 1v1, 2v2, dan 3v3 lulus, termasuk finish otomatis saat waktu habis dan isolasi dari mode individu.

### Hari 4 — Spawn, expiry, dan claim node

**Tujuan:** mengimplementasikan titik soal dan first-come-first-served.

**Pekerjaan:**

- random spawn dengan batas arena;
- TTL node;
- validasi jarak pemain;
- claim atomik pada event loop;
- broadcast `node_spawned`, `node_claimed`, dan expiry.

**Kriteria selesai:** dua claim bersamaan hanya menghasilkan satu pemenang dan node tidak pernah memuat jawaban ke klien.

### Hari 5 — Soal, jawaban, dan gulungan

**Tujuan:** menyambungkan node yang diklaim ke sesi soal.

**Status:** selesai dan terverifikasi.

**Pekerjaan:**

- buat question session server-side;
- kirim soal tanpa jawaban benar;
- validasi timer dan jawaban;
- hasil benar membuat satu gulungan;
- hasil salah menghapus sesi dan menerapkan stun;
- tambahkan idempotensi `actionId`.

**Kriteria selesai:** skenario benar, salah, timeout, double-submit, dan pemain tanpa hak sudah teruji.

### Hari 6 — Gerak server-authoritative

**Tujuan:** membuat pemain dapat bergerak tanpa mempercayai koordinat klien.

**Status:** selesai dan terverifikasi.

**Pekerjaan:**

- definisikan format input gerak;
- validasi delta waktu dan kecepatan;
- batasi arena dan collision dasar;
- tolak gerak ketika stun;
- broadcast posisi yang telah disetujui server.

**Kriteria selesai:** klien tidak dapat memindahkan pemain melewati batas atau mengabaikan stun dengan mengirim koordinat besar.

### Hari 7 — Tower, Base, dan scoring

**Tujuan:** menyelesaikan loop membawa gulungan ke target.

**Status:** selesai dan terverifikasi.

**Pekerjaan:**

- validasi target base lawan;
- validasi jalur Tower Luar;
- terapkan nilai gulungan dan bonus Tomi;
- hancurkan tower pada ambang batas;
- pindahkan fase ke base utama;
- hitung pemenang saat waktu habis.

**Kriteria selesai:** setor sekali menghasilkan skor yang benar, setor ulang ditolak, dan tower/base memiliki transisi yang konsisten.

### Hari 8 — Integrasi buff pet

**Tujuan:** menerapkan empat pet menggunakan satu modul aturan.

**Status:** selesai dan terverifikasi.

**Pekerjaan:**

- Kelinsay: movement speed tanpa gulungan;
- Monyong: kapasitas dua gulungan;
- Tomi: bonus setoran;
- Nananaga: imunitas jawaban hard dan kesempatan kedua sesuai kontrak;
- pastikan nilai berasal dari state server, bukan pilihan payload.

**Kriteria selesai:** setiap buff memiliki unit test sendiri dan tidak memengaruhi pet lain.

### Hari 9 — Socket adapter dan reconnect

**Tujuan:** menghubungkan service murni dengan Socket.io.

**Status:** selesai dan terverifikasi.

**Pekerjaan:**

- pasang handler event dengan payload terdefinisi;
- gunakan room per pertandingan;
- gunakan acknowledgement dan error code;
- implementasikan snapshot awal;
- pertahankan state saat disconnect singkat;
- uji reconnect dan retry action.

**Kriteria selesai:** dua klien dapat melihat state yang sama dan reconnect tidak menggandakan aksi.

### Hari 10 — Reducer dan hook Socket.io frontend

**Tujuan:** menyiapkan state UI tanpa membangun seluruh visual.

**Status:** selesai dan terverifikasi.

**Pekerjaan:**

- buat tipe state frontend;
- buat reducer untuk semua event server;
- buat `useMobaSocket`;
- tangani loading, error, disconnect, dan snapshot;
- tambahkan logging development yang dapat dimatikan.

**Kriteria selesai:** event simulasi dapat mengubah state UI secara deterministik.

### Hari 11 — Arena dan HUD MVP

**Tujuan:** menampilkan state pertandingan dalam peta 2D sederhana.

**Status:** selesai dan terverifikasi.

**Pekerjaan:**

- buat `MobaArena`, `MobaPet`, `MobaNode`, dan `MobaBase`;
- render koordinat normalisasi;
- tampilkan timer, skor, tower, base, pet, dan gulungan;
- buat layout responsif untuk Android.

**Kriteria selesai:** pertandingan dapat dipantau dari layar tanpa data mock yang menjadi sumber kebenaran.

### Hari 12 — Modal soal dan aksi pemain

**Tujuan:** membuat alur interaktif pemain.

**Status:** selesai dan terverifikasi.

**Pekerjaan:**

- klik/dekat node mengirim claim;
- modal soal hanya muncul untuk pengklaim;
- jawab soal dengan timer;
- tampilkan hasil benar/salah/stun;
- tampilkan tombol setor dengan aturan server sebagai penentu akhir.

**Kriteria selesai:** satu alur lengkap dari gerak → claim → jawab → bawa gulungan → setor dapat dijalankan.

### Hari 13 — Uji integrasi dan hardening

**Tujuan:** menemukan bug race condition, reconnect, dan kebocoran data.

**Pekerjaan:**

- jalankan test backend dan build frontend;
- uji format 1v1, 2v2, dan 3v3;
- pastikan membuka/menutup MOBA tidak merusak alur mode individu;
- uji node yang sama diklaim bersamaan;
- uji jawaban dan setoran ganda;
- uji refresh/reconnect;
- uji viewport Android;
- periksa payload Socket.io agar jawaban benar tidak bocor.

**Kriteria selesai:** bug kritis dicatat dan diperbaiki; test serta build bersih.

### Hari 14 — Reward, statistik, dan kesiapan rilis

**Tujuan:** memisahkan hasil pertandingan dari state real-time dan menyiapkan rilis terbatas.

**Pekerjaan:**

- tentukan apakah hasil/reward perlu disimpan;
- jika perlu, buat endpoint atau service penyimpanan setelah pertandingan;
- pastikan reward diberikan sekali;
- tambahkan feature flag atau akses terbatas;
- buat checklist observability dan rollback;
- dokumentasikan cara menjalankan test dan simulasi lokal.

**Kriteria selesai:** mode dapat dinyalakan secara terbatas, hasil tidak menggandakan reward, dan ada cara mematikan fitur tanpa merusak mode TOMAT lain.

## 14. Urutan aman untuk MVP

Jika waktu terbatas, MVP berhenti setelah Hari 12 dengan batas berikut:

- satu map;
- arena 2D tanpa perspektif atau rendering 3D;
- dua tim seimbang;
- format pertandingan hanya 1v1, 2v2, dan 3v3;
- jumlah pemain maksimal 6 siswa per pertandingan;
- satu jenis soal per tingkat kesulitan;
- node hijau/kuning/merah;
- satu tower dan satu base per tim;
- karakter berupa Pet dengan empat buff Pet;
- skin Pet dikunci saat join dan tidak dapat diganti di tengah pertandingan;
- DOM/CSS 2D;
- tidak ada combat;
- tidak ada leaderboard permanen;
- hasil pertandingan hanya disimpan bila sudah ada kebutuhan produk yang jelas.

Jangan menambahkan matchmaking kompleks, chat pertandingan, animasi berat, replay, atau banyak map sebelum loop inti stabil. Jangan menghapus atau memigrasikan mode individu untuk mendukung MOBA.

## 15. Checklist setiap sesi harian

Sebelum mengakhiri satu hari:

- [ ] scope hari itu saja yang dikerjakan;
- [ ] tidak ada perubahan diam-diam pada fitur TOMAT yang tidak terkait;
- [ ] test yang relevan dijalankan;
- [ ] build atau workflow diperiksa jika ada perubahan kode;
- [ ] error tidak disembunyikan dengan fallback;
- [ ] state server tetap menjadi sumber kebenaran;
- [ ] hasil kerja dan hambatan dicatat di commit/checkpoint proyek;
- [ ] hari berikutnya tidak dimulai sebelum kriteria selesai terpenuhi.

## 16. Hal yang belum boleh diputuskan tanpa audit

Beberapa detail harus disesuaikan setelah Hari 1:

- nama modul Socket.io dan cara autentikasi socket yang sudah ada;
- apakah posisi saat ini berbasis grid, lane, atau koordinat bebas;
- sumber bank soal dan kontrak validasi jawaban;
- aturan reward TOMAT yang sudah berlaku;
- cara penyimpanan statistik dan nilai siswa;
- apakah pertandingan MOBA dimainkan antarkelas atau hanya dalam satu kelas;
- bagaimana tombol/pintu masuk mode individu dan mode MOBA ditempatkan berdampingan;
- apakah pet yang dipakai harus dikunci dari loadout sebelum join;
- batasan performa pada perangkat Android target.

Keputusan ini jangan ditebak dari brief. Catat hasil audit dan gunakan pola existing project agar mode baru tidak membuat duplikasi arsitektur.
