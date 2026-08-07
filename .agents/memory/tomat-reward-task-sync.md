---
name: TOMAT reward dan task submission
description: Aturan konsistensi reward gameplay dan penyimpanan progres tugas saat jaringan tidak stabil.
---

Reward coins dan EXP dari satu jawaban benar harus dikirim sebagai satu mutasi server-authoritative. Jika UI memanggil dua fungsi reward secara berurutan, lapisan state perlu menggabungkannya sebelum request agar respons tidak saling menimpa.

**Why:** Dua request reward bersamaan dapat mengembalikan saldo atau EXP yang stale dan menghilangkan sebagian reward siswa.

**How to apply:** Pertahankan batching di provider pemain. Sesi tugas yang sudah mencapai jumlah soal harus tetap ada selama POST nilai berjalan; hapus hanya setelah server sukses, dan izinkan retry setelah kegagalan jaringan.

Penyimpanan nilai harus idempoten: setelah insert berhasil, endpoint segera mengembalikan nilai; badge dan notifikasi guru dijalankan sebagai side effect non-kritis. Retry terhadap request yang sebenarnya sudah tersimpan harus mengembalikan record nilai, bukan 409.

**Why:** Koneksi browser dapat terputus setelah database commit tetapi sebelum respons selesai. Menunggu query badge/notifikasi membuat nilai yang sudah tersimpan terlihat sebagai “Failed to fetch” dan retry tidak dapat memulihkan sesi.

**How to apply:** Terapkan pola ini pada semua endpoint submit hasil tugas/ujian yang memakai pasangan unik siswa+tugas.