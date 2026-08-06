---
name: TOMAT reward dan task submission
description: Aturan konsistensi reward gameplay dan penyimpanan progres tugas saat jaringan tidak stabil.
---

Reward coins dan EXP dari satu jawaban benar harus dikirim sebagai satu mutasi server-authoritative. Jika UI memanggil dua fungsi reward secara berurutan, lapisan state perlu menggabungkannya sebelum request agar respons tidak saling menimpa.

**Why:** Dua request reward bersamaan dapat mengembalikan saldo atau EXP yang stale dan menghilangkan sebagian reward siswa.

**How to apply:** Pertahankan batching di provider pemain. Sesi tugas yang sudah mencapai jumlah soal harus tetap ada selama POST nilai berjalan; hapus hanya setelah server sukses, dan izinkan retry setelah kegagalan jaringan.