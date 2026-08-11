# TOMAT — Riwayat Match MOBA di Profil

## Tujuan

Menampilkan riwayat pertandingan MOBA pada profil siswa dengan informasi:

- pet yang dipakai siswa pada saat pertandingan;
- hasil pertandingan: menang, kalah, atau seri;
- lawan yang dihadapi;
- skor akhir kedua tim;
- waktu pertandingan selesai.

Riwayat harus bersumber dari hasil pertandingan durable, bukan dari registry MOBA in-memory. Dengan begitu riwayat tetap tersedia setelah server restart dan setelah cleanup match selesai.

---

## Sumber Data

Tabel yang digunakan:

```text
moba_match_results
```

Kolom yang sudah tersedia:

| Kolom | Kegunaan |
|---|---|
| `match_id` | ID unik pertandingan dan idempotency key |
| `team_size` | Format pertandingan: 1, 2, atau 3 |
| `winner` | `teamA`, `teamB`, atau `draw` |
| `team_a_score` | Skor akhir Tim A |
| `team_b_score` | Skor akhir Tim B |
| `snapshot` | Snapshot final yang memuat pemain, `userId`, nama, tim, `petType`, `petSkinId`, dan skor pemain |
| `reward_coins` | Reward hasil settlement |
| `finished_at` | Waktu pertandingan selesai |

Pet yang ditampilkan wajib dibaca dari:

```text
snapshot.players[].petType
snapshot.players[].petSkinId
```

Jangan mengambil pet dari `students.equipped_pet_skin` untuk riwayat lama. Kolom profil hanya menunjukkan pet yang sedang digunakan sekarang; snapshot menunjukkan pet yang benar-benar dipakai pada pertandingan tersebut.

---

## Lokasi UI

### Profil sendiri

Tambahkan section baru pada `ProfileScreen.jsx`:

```text
Profil
├── Hero / identitas
├── Statistik
├── Biodata
├── Ekuipmen
├── Hafalan
└── Riwayat Arena MOBA
```

Section ini hanya ditampilkan untuk profil siswa. Profil guru tidak memiliki riwayat MOBA.

### Profil publik

Tambahkan ringkasan riwayat pada `PublicProfileScreen.jsx` jika profil yang dibuka adalah siswa dan viewer memiliki akses profil sesuai aturan class circle yang sudah ada.

Untuk profil publik:

- tampilkan riwayat pertandingan pemilik profil;
- tampilkan nama lawan dan pet lawan jika lawan berada dalam lingkaran akses viewer;
- jika lawan tidak boleh ditampilkan, gunakan label `Lawan` tanpa data identitas;
- jangan menampilkan `userId`, email, WhatsApp, atau data privat lainnya.

Jika implementasi awal hanya menargetkan profil sendiri, API dan struktur response tetap harus dirancang agar dapat dipakai kemudian oleh profil publik tanpa mengubah kontrak data utama.

---

## Desain Kartu Riwayat

Setiap pertandingan ditampilkan sebagai satu kartu, terbaru di atas.

### Header kartu

```text
⚔️ MOBA · 1v1
12 Agustus 2026, 14:32
```

Format mode:

- `1v1` untuk `team_size = 1`;
- `2v2` untuk `team_size = 2`;
- `3v3` untuk `team_size = 3`.

### Status hasil

Status ditentukan dari tim pemain terhadap kolom `winner`:

| Kondisi | Label | Warna |
|---|---|---|
| Tim pemain sama dengan `winner` | `MENANG` | hijau |
| `winner = draw` | `SERI` | kuning |
| Tim pemain berbeda dari `winner` | `KALAH` | merah |

Jangan menentukan hasil hanya dari perbandingan skor di client. Server mengembalikan status hasil yang sudah dihitung dari snapshot.

### Pet pemain

Tampilkan:

- sprite atau ikon dari `petSkinId`;
- nama skin yang ramah pengguna;
- fallback ke `petType` jika skin tidak ditemukan di katalog visual;
- label `Pet saat bertanding`.

Contoh:

```text
🐾 Kelinsay Merah Putih
Pet saat bertanding
```

### Skor

Tampilkan skor final:

```text
Timku 120  —  95 Lawan
```

Untuk mode 2v2 atau 3v3, gunakan nama `Timku` dan `Lawan`, bukan hanya nama `Tim A` atau `Tim B`, agar hasil mudah dipahami dari sudut pandang pemilik profil.

### Lawan

Untuk setiap lawan, tampilkan:

- nama tampilan saat pertandingan dari `snapshot.players[].displayName`;
- pet yang dipakai lawan dari `petSkinId`;
- skor pribadi jika tersedia;
- avatar saat ini hanya jika endpoint profil memiliki izin dan data tersebut diperlukan.

Contoh 1v1:

```text
Lawan
👤 Ahmad
🐾 Tomi Kosmik · 42 poin
```

Contoh tim:

```text
Lawan
👤 Ahmad    🐾 Tomi Kosmik     42 poin
👤 Siti     🐾 Monyang Raja    38 poin
```

Nama lawan diambil dari snapshot final agar riwayat tidak berubah ketika nama profil saat ini berubah.

---

## Kontrak API yang Diusulkan

### Riwayat profil sendiri

```http
GET /api/siswa/moba/history?limit=20&offset=0
```

Autentikasi wajib menggunakan session siswa yang sedang login. `studentId` tidak boleh diterima dari query string untuk mencegah siswa meminta riwayat orang lain melalui endpoint pribadi.

### Riwayat profil publik

Pilihan yang disarankan:

```http
GET /api/komunikasi/profile/:role/:id/moba-history?limit=10&offset=0
```

Endpoint ini harus menggunakan pemeriksaan akses yang sama dengan:

```text
canViewProfile(user, otherId, otherRole)
```

Alternatifnya, response profil publik yang sudah ada dapat diberi field `mobaHistory`, tetapi endpoint terpisah lebih aman untuk pagination dan tidak memperberat pembukaan profil.

---

## Bentuk Response

```json
{
  "items": [
    {
      "matchId": "match-abc123",
      "teamSize": 1,
      "finishedAt": "2026-08-12T07:32:00.000Z",
      "result": "win",
      "myTeamId": "teamA",
      "winner": "teamA",
      "scores": {
        "mine": 120,
        "opponent": 95,
        "teamA": 120,
        "teamB": 95
      },
      "myPlayer": {
        "userId": "student-1",
        "displayName": "Budi",
        "petType": "kelinsay",
        "petSkinId": "kelinsay_merah_putih",
        "score": 120,
        "answeredCorrect": 8,
        "answeredWrong": 2,
        "deposits": 5
      },
      "opponents": [
        {
          "userId": "student-2",
          "displayName": "Ahmad",
          "petType": "tomi",
          "petSkinId": "tomi_kosmik",
          "score": 95
        }
      ],
      "rewardCoins": 120
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Catatan response

- `result` adalah nilai ternormalisasi: `win`, `loss`, atau `draw`.
- `scores.mine` adalah skor tim pemilik profil, bukan skor pemain individu.
- `scores.opponent` adalah skor tim lawan.
- `myPlayer.score` adalah skor individu pemilik profil jika tersedia.
- `rewardCoins` boleh ditampilkan hanya pada profil sendiri. Untuk profil publik, hilangkan atau set `null`.
- Response publik tidak boleh mengembalikan `userId` lawan jika aturan akses mengharuskan identitas disamarkan.

---

## Query dan Pemrosesan Server

### Menemukan pertandingan milik siswa

Gunakan `snapshot` final sebagai sumber keanggotaan:

```sql
SELECT match_id,
       team_size,
       winner,
       team_a_score,
       team_b_score,
       snapshot,
       finished_at,
       reward_coins
FROM moba_match_results
WHERE EXISTS (
  SELECT 1
  FROM jsonb_array_elements(snapshot->'players') AS player
  WHERE player->>'userId' = $1
)
ORDER BY finished_at DESC
LIMIT $2
OFFSET $3;
```

### Normalisasi setiap row

Server harus:

1. mencari player pemilik profil di `snapshot.players`;
2. membaca `myTeamId` dari player tersebut;
3. mengambil semua player dari tim lawan;
4. menghitung `result` dari `winner` dan `myTeamId`;
5. memetakan `team_a_score` / `team_b_score` menjadi `mine` / `opponent`;
6. menghapus field server-only sebelum response;
7. menerapkan filter privasi untuk lawan pada endpoint publik.

Jangan mengirim seluruh `snapshot` mentah ke client. Snapshot menyimpan data pertandingan yang lebih besar dari kebutuhan kartu profil dan dapat membocorkan field yang belum dimaksudkan untuk UI.

---

## Pagination dan Batas Data

- Default `limit`: 20 untuk profil sendiri.
- Default `limit`: 10 untuk profil publik.
- Nilai maksimum `limit`: 50.
- `offset` tidak boleh negatif.
- Urutan: `finished_at DESC`.
- Jika tidak ada riwayat, tampilkan empty state:

```text
Belum ada riwayat pertandingan MOBA.
Cari lawan dan mulai pertandingan pertamamu!
```

Riwayat lama tidak perlu dihapus otomatis. Jika volume data sudah besar, implementasi berikutnya dapat mengganti offset pagination dengan cursor berbasis `finished_at` dan `match_id`.

---

## Privasi dan Keamanan

- Endpoint profil sendiri wajib memakai session siswa aktif.
- Endpoint profil publik wajib memakai pemeriksaan class circle yang sudah ada.
- Jangan menerima `studentId` bebas untuk endpoint profil sendiri.
- Jangan menampilkan email, WhatsApp, password, session data, atau metadata database.
- `displayName` pada riwayat berasal dari snapshot final dan harus diperlakukan sebagai teks biasa.
- Jika lawan sudah tidak dapat dilihat oleh viewer, identitas lawan harus disamarkan tanpa menghapus hasil pertandingan pemilik profil.
- Riwayat publik tidak menampilkan jumlah reward koin milik pemain.
- Reward tidak dihitung ulang oleh client; `rewardCoins` hanya berasal dari hasil settlement server.

---

## Perubahan File yang Diperlukan Saat Diimplementasikan

Perubahan implementasi berikutnya kemungkinan mencakup:

```text
server/moba/results.js
server/moba/history.js                 # router/service baru, bila dipisahkan
server/komunikasi.js                   # endpoint riwayat profil publik
server/index.js                        # mount router baru bila diperlukan
src/screens/ProfileScreen.jsx          # section riwayat sendiri
src/screens/PublicProfileScreen.jsx    # section riwayat publik
src/components/                         # kartu riwayat bersama jika diperlukan
```

Database tidak perlu migrasi untuk MVP karena `moba_match_results.snapshot` sudah menyimpan data pet dan pemain. Jika kebutuhan query meningkat, pertimbangkan tabel turunan atau kolom indeks khusus hanya setelah profiling query.

---

## Acceptance Criteria

- [ ] Profil siswa menampilkan riwayat MOBA terbaru.
- [ ] Riwayat tetap ada setelah match dibersihkan dari registry in-memory.
- [ ] Pet yang ditampilkan adalah pet yang dipakai saat match, bukan pet terkini.
- [ ] Hasil menang/kalah/seri benar untuk Tim A maupun Tim B.
- [ ] Skor tim sendiri dan tim lawan benar untuk 1v1, 2v2, dan 3v3.
- [ ] Semua lawan ditampilkan pada mode tim dengan nama dan pet historisnya.
- [ ] Riwayat kosong memiliki empty state yang jelas.
- [ ] Pagination bekerja dan tidak mengambil seluruh riwayat sekaligus.
- [ ] Profil publik mengikuti pembatasan class circle.
- [ ] Data privat dan snapshot mentah tidak bocor ke client.
- [ ] Reward koin tidak dapat dipalsukan atau dihitung ulang di client.
- [ ] Test mencakup hasil Tim A, hasil Tim B, seri, pet historis, lawan ganda, pagination, dan akses profil publik.