# BUGLIST.md — Daftar Bug TOMAT (Audit 6 Agustus 2026)

> File ini dibuat dari hasil audit otomatis. Jangan hapus entri sebelum bug benar-benar diperbaiki.
> Tandai dengan ✅ dan tambahkan tanggal fix ketika selesai.

---

## 🔴 HIGH — Bug Kritis (Potensi Eksploitasi / Data Loss)

### BUG-01 — Immunity duel tidak divalidasi di server ✅ (6 Agustus 2026)
- **File:** `server/multiplayer.js` — handler `duel:use-immunity`
- **Masalah:** Server tidak memverifikasi bahwa jawaban terakhir siswa memang salah, tidak mengecek sisa token immunity, dan tidak mengonsumsi token di server. Client bisa emit event ini berulang kali dan mendapatkan soal tambahan tanpa batas tanpa round maju.
- **Dampak:** Siswa bisa cheat di duel — dapat unlimited soal tambahan.
- **Fix yang dibutuhkan:** Tambahkan validasi di server: cek `player.lastAnswerWasWrong`, kurangi/simpan `immunityTokensLeft` per-player di room state, reject emit kalau sudah habis atau kondisi tidak memenuhi.

---

### BUG-02 — Immunity turnamen tidak divalidasi di server ✅ (6 Agustus 2026)
- **File:** `server/multiplayer.js` — handler `tournament:use-immunity`
- **Masalah:** Masalah sama dengan BUG-01. Tidak ada ownership check, tidak ada cek answered/wrong, tidak ada konsumsi token. Bisa overwrite soal aktif player lain di room yang sama.
- **Dampak:** Siswa bisa cheat di turnamen.
- **Fix yang dibutuhkan:** Sama seperti BUG-01 — validasi token di server per `(tournamentId, matchId, userId)`.

---

### BUG-03 — Boss Raid: jawaban numeric selalu salah ✅ (6 Agustus 2026)
- **File:** `server/multiplayer.js` — handler `boss:answer` (sekitar baris 573–594)
- **Masalah:** Boss menggunakan `value === pending.answer` (strict string comparison). Duel dan turnamen menggunakan `Number(...)` untuk normalisasi. Client yang mengirim jawaban berupa angka (number) selalu dianggap salah di boss mode.
- **Dampak:** Boss Raid tidak bisa dimenangkan dengan benar jika client mengirim angka.
- **Fix yang dibutuhkan:** Ganti ke `Number(value) === Number(pending.answer)` konsisten dengan mode lain.

---

### BUG-04 — Tournament room join tanpa validasi kepemilikan match ✅ (6 Agustus 2026)
- **File:** `server/multiplayer.js` — handler `tournament:player-ready` (sekitar baris 823–845)
- **Masalah:** Socket di-join ke `match.roomCode` sebelum validasi bahwa user benar-benar bagian dari match tersebut. Di kelompok mode, `_teamMemberSockets` ditulis tanpa cek tim. Participant dari match lain bisa masuk room dan memengaruhi readiness atau seleksi juru jawab.
- **Dampak:** Race condition / eksploitasi di bracket turnamen kelompok.
- **Fix yang dibutuhkan:** Lakukan validasi match membership sebelum `socket.join(roomCode)`.

---

### BUG-05 — Kelompok: klaim juru jawab tidak aman ✅ (6 Agustus 2026)
- **File:** `server/tournament-engine.js` (sekitar baris 239–265) + `server/multiplayer.js` (sekitar baris 899–925)
- **Masalah:** Klaim juru jawab hanya cek tournament membership (`getTeamIdForUser()`), bukan apakah user sudah join match ini (`_teamMemberSockets[user.id]`). Auto-selection timer dan klaim manual bisa race karena state in-memory tanpa mutex.
- **Dampak:** Siswa dari tim/match lain bisa klaim juru jawab.
- **Fix yang dibutuhkan:** Tambahkan pengecekan `_teamMemberSockets` sebelum menerima klaim.

---

## 🟡 MEDIUM — Bug Logika

### BUG-06 — Tie di turnamen mereset seluruh round (bukan hanya match yang tie) ✅ (6 Agustus 2026)
- **File:** `server/tournament-engine.js` (sekitar baris 489–515)
- **Masalah:** Ketika satu match berakhir tie, `startTournamentRound_all()` dipanggil dan mereset semua match di round tersebut — termasuk match yang sudah selesai — sehingga winner match lain bisa berubah.
- **Dampak:** Hasil turnamen bisa rusak saat ada tie.
- **Fix yang dibutuhkan:** Hanya restart match yang tie; jangan panggil `startTournamentRound_all()` untuk kondisi tie.

---

### BUG-07 — Race condition progress misi event (non-atomic update) ✅ (6 Agustus 2026)
- **File:** `server/event-missions.js` (sekitar baris 99–127)
- **Masalah:** Progress misi dibaca dalam satu query dan diupdate dalam query terpisah. Dua jawaban benar yang dikirim simultan (mis. di duel kelompok) bisa membaca nilai lama yang sama → delta toast salah → `_autoCompleteRequires()` bisa race di luar transaksi.
- **Dampak:** Progress misi tidak akurat, notifikasi selesai misi bisa ganda atau tidak muncul.
- **Fix yang dibutuhkan:** Gunakan atomic `UPDATE ... RETURNING` atau bungkus dalam satu transaksi PostgreSQL.

---

### BUG-08 — addCoins + addExp kirim dua POST → lost update ✅ (6 Agustus 2026)
- **File:** `src/PlayerContext.jsx` (sekitar baris 67–123)
- **Masalah:** `addCoins()` dan `addExp()` masing-masing POST ke `/api/siswa/player/gain` secara terpisah. Game memanggil keduanya setelah satu jawaban benar → dua request concurrent → response yang lebih lambat bisa overwrite state yang lebih baru → coins atau EXP hilang.
- **Dampak:** Siswa kehilangan sebagian reward koin/EXP secara intermiten.
- **Fix yang dibutuhkan:** Gabungkan `addCoins` + `addExp` ke satu request `/gain` dengan `{ coins, exp }`.

---

### BUG-09 — submitGrade menghapus activeSession sebelum POST berhasil ✅ (6 Agustus 2026)
- **File:** `src/TaskContext.jsx` (sekitar baris 129–153)
- **Masalah:** `submitGrade` menghapus `activeSession` di state lokal sebelum POST ke server. Jika request gagal (network error, server down), sesi tugas tidak bisa di-restore → progress hilang permanen.
- **Dampak:** Siswa yang sedang mengerjakan tugas kehilangan hasil saat koneksi putus.
- **Fix yang dibutuhkan:** Hapus `activeSession` hanya setelah POST sukses (dalam blok `.then()`).

---

### BUG-10 — TaskContext: correctAnswers tidak bertambah jika reward bukan 50 koin ✅ (6 Agustus 2026)
- **File:** `src/TaskContext.jsx` (sekitar baris 158–182)
- **Masalah:** `addCoins` di TaskContext hanya menghitung progress tugas jika `amount === 50`. Game yang menggunakan reward amount berbeda (misalnya game dengan difficulty modifier atau bonus) tidak akan increment `correctAnswers` meski jawaban benar.
- **Dampak:** Progress tugas tidak bergerak di beberapa game tertentu.
- **Fix yang dibutuhkan:** Lepaskan logika `correctAnswers++` dari nilai spesifik `amount`; gunakan flag terpisah `isCorrectAnswer`.

---

### BUG-11 — Immunity dikurangi lokal tanpa acknowledgement dari server ✅ (6 Agustus 2026)
- **File:** `src/screens/DuelKatakScreen.jsx` (sekitar baris 383–389) & `src/screens/TournamentMatchScreen.jsx` (sekitar baris 332–335)
- **Masalah:** Token immunity dikurangi di client (`immunityLeft.current--`) lalu `duel:use-immunity` / `tournament:use-immunity` diemit tanpa menunggu acknowledgement server. Jika emit hilang atau server menolak, client kehilangan token permanent dan state round bisa desync.
- **Dampak:** Token immunity terpotong meski tidak dipakai; round bisa stuck.
- **Fix yang dibutuhkan:** Kurangi token hanya setelah server acknowledge (tambahkan callback/ack di emit), atau implementasikan rollback jika gagal.

---

### BUG-12 — Immunity tidak berlaku di kelompok mode turnamen ✅ (6 Agustus 2026)
- **File:** `src/screens/TournamentMatchScreen.jsx` (sekitar baris 313–321)
- **Masalah:** Path `team-answer-result` (kelompok mode) tidak menerapkan logika immunity, sementara path `answer-result` (individual mode) ya. Perilaku berbeda per mode.
- **Dampak:** Siswa dalam mode kelompok tidak mendapat benefit immunity dari Nananaga.
- **Fix yang dibutuhkan:** Tambahkan pengecekan immunity di path `team-answer-result`.

---

## 🟠 DATA / SCHEMA

### BUG-13 — schema.js menjalankan DROP TABLE CASCADE saat startup
- **File:** `server/schema.js` (sekitar baris 1145–1169)
- **Masalah:** Loop `MIGRATION_FORBIDDEN_TABLES` mengeksekusi `DROP TABLE ... CASCADE` untuk setiap tabel dalam daftar. Ini bertentangan dengan aturan RULES.md dan bisa menghapus tabel yang dipakai app GuruEOB5 standalone.
- **Dampak:** Data permanen bisa terhapus saat server restart jika ada tabel dalam daftar larangan.
- **Fix yang dibutuhkan:** Audit isi `MIGRATION_FORBIDDEN_TABLES`; ganti DROP dengan peringatan log saja, atau hapus loop ini.

---

### BUG-14 — subject_id hardcode INT, tapi bisa UUID di production
- **File:** `server/schema.js` — CREATE TABLE untuk `grades`, `prosem_items`, `documents`, `ai_modul_ajar`, dll.
- **Masalah:** `subject_id` didefinisikan sebagai `INT` di banyak tabel, sedangkan `subjects.id` di production database kemungkinan UUID (hanya `tujuan_pembelajaran` yang ada deteksi dinamis). Mismatch tipe menyebabkan CREATE TABLE / FK gagal atau incompatible.
- **Dampak:** Tabel baru tidak bisa dipakai; INSERT ke tabel yang ada gagal di production.
- **Fix yang dibutuhkan:** Tambahkan deteksi tipe `subjects.id` (seperti di `tujuan_pembelajaran`) dan terapkan ke semua tabel yang referensikan `subject_id`.

---

### BUG-15 — Grade8ZoneScreen & Grade9ZoneScreen tidak menampilkan semua game
- **File:** `src/screens/Grade8ZoneScreen.jsx`, `src/screens/Grade9ZoneScreen.jsx`
- **Masalah:**
  - G8: hanya 16 entry di zone screen, seharusnya 38 (22 game tidak tampil)
  - G9: hanya 17 entry di zone screen, seharusnya 31 (14 game tidak tampil)
  - `src/gamesCatalog.js` sudah berisi daftar lengkap, tapi zone screen belum di-sync.
- **Dampak:** Banyak game tidak bisa diakses siswa dari UI.
- **Fix yang dibutuhkan:** Sync entri di `Grade8ZoneScreen.jsx` dan `Grade9ZoneScreen.jsx` dengan `src/gamesCatalog.js`.

---

## 🔵 LOW / UX

### BUG-16 — SliderInput: divide by zero dan Infinity range
- **File:** `src/components/shared.jsx` — fungsi `randomSliderRange()` dan komponen `SliderInput`
- **Masalah:** `randomSliderRange()` tidak memvalidasi input kosong/non-numerik → `Math.min(...[])` = Infinity. Jika `max === min`, CSS percentage menjadi NaN dan slider tidak render dengan benar.
- **Dampak:** Slider rusak pada edge case soal tertentu.
- **Fix yang dibutuhkan:** Tambahkan validasi input di `randomSliderRange()`; handle `max === min` dengan fallback range minimal.

---

### BUG-17 — PetContext: concurrent feed/revive tidak di-guard
- **File:** `src/PetContext.jsx` (sekitar baris 74–112)
- **Masalah:** Tidak ada guard untuk concurrent call pada `feedPet()` dan `revivePet()`. Dua tap cepat mengirim dua request → bisa deduct coins dua kali, response terakhir wins.
- **Dampak:** Siswa bisa kehilangan koin dobel secara tidak sengaja.
- **Fix yang dibutuhkan:** Tambahkan `isLoading` ref sebagai guard; tolak call kedua selagi request pertama belum selesai.

---

### BUG-18 — ShopScreen: prerequisite & missionOnly tidak dicek di buy handler
- **File:** `src/screens/ShopScreen.jsx` (sekitar baris 354–365)
- **Masalah:** Handler `buyEquipSkin` tidak memverifikasi `prerequisitePetId` dan `missionOnly` di client sebelum mengirim request. UI menampilkan badge tapi tidak menonaktifkan action. Server harus reject, tapi jika ada bug di server, item bisa dibeli tanpa syarat.
- **Dampak:** Potensi bypass prerequisite jika server validation lemah.
- **Fix yang dibutuhkan:** Tambahkan pengecekan `prerequisitePetId` dan `missionOnly` di handler sebelum memanggil API.

---

### BUG-19 — Route typo silently fallback ke HomeScreen
- **File:** `src/App.jsx` (sekitar baris 1028)
- **Masalah:** Route yang tidak terdaftar di `STATIC_ROUTES` atau `GAME_ROUTES` langsung merender `HomeScreen` tanpa error atau log. Navigasi ke route typo/salah sangat sulit di-debug.
- **Dampak:** Bug navigasi tersembunyi.
- **Fix yang dibutuhkan:** Tambahkan `console.warn` atau fallback screen "Route tidak ditemukan" saat route tidak ada di map.

---

### BUG-20 — event-missions: _ensureTable() async tanpa await saat startup
- **File:** `server/event-missions.js` (sekitar baris 15–33)
- **Masalah:** `_ensureTable()` dipanggil saat module import (top-level) tanpa `await`. Error diswallow. Request gameplay yang datang segera setelah startup bisa race sebelum tabel selesai dibuat.
- **Dampak:** Misi event tidak berjalan pada cold start pertama.
- **Fix yang dibutuhkan:** Panggil `_ensureTable()` dari `ensureSchema()` di `server/schema.js` agar dijalankan secara berurutan saat startup.

---

### BUG-21 — Immunity ref stale saat skin berganti mid-game
- **File:** `src/difficulty.js` — hook `useSurvival`
- **Masalah:** `immunityTotalRef` diperbarui setiap render (berdasarkan skin aktif), tapi `immunityLeft` hanya diinisialisasi satu kali dan direset hanya saat `reset()` dipanggil. Jika siswa mengganti skin saat game sedang terbuka (theoretically lewat background), token count tidak sinkron.
- **Dampak:** Token immunity bisa lebih/kurang dari seharusnya.
- **Fix yang dibutuhkan:** Sinkronkan `immunityLeft` dengan `immunityTotalRef` hanya saat nilai bertambah (upgrade skin); jangan kurangi kalau sudah terpakai.

---

## Ringkasan

| Kategori | Jumlah |
|----------|--------|
| 🔴 HIGH (eksploitasi / data loss) | 0 terbuka / 5 selesai |
| 🟡 MEDIUM (logika salah) | 0 terbuka / 7 selesai |
| 🟠 DATA / SCHEMA | 3 |
| 🔵 LOW / UX | 6 |
| **Total** | **21** |

---

*Dibuat: 6 Agustus 2026 — Audit otomatis + review manual*
*Update file ini setiap kali bug diperbaiki: tambahkan ✅ dan tanggal fix di baris bug terkait.*
