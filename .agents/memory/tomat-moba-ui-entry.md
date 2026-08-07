---
name: TOMAT MOBA UI entry and acknowledgement
description: Aturan agar mode MOBA tetap dapat ditemukan siswa dan state lobby tidak tertinggal dari server.
---

MOBA harus selalu memiliki entry point siswa yang jelas menuju lobby sebelum arena. Lobby menangani pembuatan, join via match ID, pilihan 1v1/2v2/3v3, ready, dan rejoin arena.

**Why:** Arena yang hanya menerima `matchId` menjadi fitur orphaned, sementara acknowledgement create/join/ready yang tidak menghidrasi snapshot membuat UI tampak kosong meski server sudah menerima aksi.

**How to apply:** Saat menambah aksi MOBA baru, jika acknowledgement mengandung snapshot publik, dispatch snapshot segera ke reducer. Pertahankan arena sebagai layar live dan lobby sebagai layar discovery/join.