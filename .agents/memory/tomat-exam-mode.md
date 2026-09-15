---
name: TOMAT Mode Ujian
description: Durable rules for the SMARTISA exam module and its security/resume boundaries.
---

Mode Ujian adalah modul terpisah dari tugas dan game biasa. Server adalah sumber kebenaran untuk token, validasi kelas, satu attempt per siswa, deadline, jawaban, penilaian, dan audit activity.

Token ujian disimpan sebagai SHA-256 hash; pembuatan ulang token langsung membatalkan token lama. Jawaban terbaru disimpan di database dan setiap perubahan disimpan sebagai event untuk riwayat.

Client menyimpan jawaban sementara di IndexedDB dan localStorage sebagai fallback, lalu mencoba autosave ke server. Resume harus tetap menggunakan deadline server, bukan waktu lokal browser. Browser fullscreen dan audit keluar/background membantu pengawasan, tetapi browser biasa tidak dapat menjamin pencegahan screenshot.

**Why:** Mode ujian membutuhkan integritas penilaian dan pemulihan koneksi tanpa mengandalkan state atau jam client yang dapat dimanipulasi.

**How to apply:** Perubahan berikutnya pada endpoint atau UI ujian harus mempertahankan server-authoritative validation, tidak membocorkan correctAnswer ke siswa, dan tidak menghidupkan kembali embedded BLP/GURU di TOMAT.

Mode Ujian siswa dibuka dari kartu di Arena Tanding, bukan dari sidebar atau bottom navigation. Sesi aktif mengikuti gaya Simulasi Ujian/TKA tetapi mencatat fullscreen exit, background/tab switch, reload, copy/cut/paste, context menu, dan shortcut browser; setelah tiga pelanggaran client mengirim submit otomatis, sementara server tetap menghitung nilai.

**Why:** Akses Arena membuat pintu masuk ujian konsisten dengan hub aktivitas siswa, sedangkan audit dan batas pelanggaran memberi pengawasan lebih ketat daripada simulasi latihan tanpa mengubah penilaian server.

**How to apply:** Pertahankan jumlah pelanggaran saat resume dari audit server, jangan menambahkan shortcut umum siswa, dan jangan menganggap blokir browser sebagai pencegahan screenshot yang sempurna.