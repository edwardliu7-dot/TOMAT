---
name: TOMAT MOBA UI entry and acknowledgement
description: Aturan agar mode MOBA tetap dapat ditemukan siswa dan state lobby tidak tertinggal dari server.
---

MOBA harus selalu memiliki entry point siswa yang jelas menuju lobby sebelum arena. Lobby memakai antrean matchmaking otomatis per ukuran tim 1v1/2v2/3v3; siswa tidak perlu membuat atau membagikan match ID.

**Why:** Arena yang hanya menerima `matchId` menjadi fitur orphaned, sementara antrean otomatis memberi alur seperti game multiplayer umum dan acknowledgement yang tidak menghidrasi snapshot membuat UI tampak kosong meski server sudah menerima aksi.

**How to apply:** Saat menambah aksi MOBA baru, jika acknowledgement mengandung snapshot publik, dispatch snapshot segera ke reducer. Matchmaking harus dipisah per ukuran tim, mencegah user ganda, menghapus antrean saat disconnect/cancel, dan mengirim event match-found agar klien masuk arena otomatis.