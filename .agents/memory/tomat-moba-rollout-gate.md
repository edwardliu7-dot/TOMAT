---
name: TOMAT MOBA rollout gate
description: Kontrak rollout terbatas MOBA dan penerapan perubahan environment di workflow server.
---

Akses MOBA demo harus tetap dikendalikan oleh `MOBA_ENABLED` dan `MOBA_ALLOWED_STUDENT_IDS`; akun siswa biasa tidak boleh ikut terbuka hanya karena masalah preview.

**Why:** konfigurasi environment dapat sudah benar di workspace tetapi proses server yang sedang berjalan masih memegang konfigurasi lama sampai workflow direstart.

**How to apply:** setelah mengubah flag atau allowlist, restart workflow TOMAT, lalu verifikasi akun demo yang diizinkan dan satu akun biasa yang harus ditolak.