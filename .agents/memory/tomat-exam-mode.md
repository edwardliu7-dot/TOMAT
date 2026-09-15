---
name: TOMAT Mode Ujian
description: Durable rules for the SMARTISA exam module and its security/resume boundaries.
---

Mode Ujian adalah modul terpisah dari tugas dan game biasa. Server adalah sumber kebenaran untuk token, validasi kelas, satu attempt per siswa, deadline, jawaban, penilaian, dan audit activity.

Token ujian disimpan sebagai SHA-256 hash; pembuatan ulang token langsung membatalkan token lama. Jawaban terbaru disimpan di database dan setiap perubahan disimpan sebagai event untuk riwayat.

Client menyimpan jawaban sementara di IndexedDB dan localStorage sebagai fallback, lalu mencoba autosave ke server. Resume harus tetap menggunakan deadline server, bukan waktu lokal browser. Browser fullscreen dan audit keluar/background membantu pengawasan, tetapi browser biasa tidak dapat menjamin pencegahan screenshot.

**Why:** Mode ujian membutuhkan integritas penilaian dan pemulihan koneksi tanpa mengandalkan state atau jam client yang dapat dimanipulasi.

**How to apply:** Perubahan berikutnya pada endpoint atau UI ujian harus mempertahankan server-authoritative validation, tidak membocorkan correctAnswer ke siswa, dan tidak menghidupkan kembali embedded BLP/GURU di TOMAT.