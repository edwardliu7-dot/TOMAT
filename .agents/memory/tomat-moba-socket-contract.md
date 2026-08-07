---
name: TOMAT MOBA Socket contract
description: Batas tanggung jawab adapter Socket.io dan reducer frontend untuk mode MOBA.
---

Adapter Socket.io MOBA harus tetap tipis: autentikasi memakai session socket, identitas pemain berasal dari user session, room memakai match ID, acknowledgement mengembalikan hasil manager, dan semua aksi memakai action ID untuk retry idempotent. Snapshot publik adalah sumber kebenaran setelah join/reconnect; soal aktif hanya dikirim ke socket pemain yang mengklaimnya.

**Why:** State manager sengaja transport-agnostic, sementara koneksi buruk dapat mengirim ulang aksi dan ID pemain internal server tidak selalu sama dengan user ID yang dipakai reducer.

**How to apply:** Jangan menaruh aturan scoring/lifecycle di handler socket. Saat event soal masuk ke reducer, terima player ID internal maupun user ID milik `self`; setelah reconnect selalu minta snapshot, dan jangan memakai optimistic update sebagai sumber skor/posisi.