---
name: TOMAT MOBA rollout gate
description: Kontrak rollout terbatas MOBA dan penerapan perubahan environment di workflow server.
---

Akses MOBA demo harus tetap dikendalikan oleh `MOBA_ENABLED` dan `MOBA_ALLOWED_STUDENT_IDS`; akun siswa biasa tidak boleh ikut terbuka hanya karena masalah preview. Gate dapat mencocokkan ID atau username identitas sesi.

**Why:** konfigurasi environment dapat sudah benar di workspace tetapi proses server yang sedang berjalan masih memegang konfigurasi lama sampai workflow direstart; sesi login dapat membawa username yang berbeda dari ID siswa.

**How to apply:** setelah mengubah flag atau allowlist, restart workflow TOMAT, lalu verifikasi akun demo yang diizinkan melalui ID/username dan satu akun biasa yang harus ditolak.