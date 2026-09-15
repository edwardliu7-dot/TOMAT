---
name: TOMAT Mode Ujian
description: Durable rules for the SMARTISA exam module and its security/resume boundaries.
---

Mode Ujian adalah modul terpisah dari tugas dan game biasa. Server adalah sumber kebenaran untuk token, validasi kelas, satu attempt per siswa, deadline, jawaban, penilaian, dan audit activity.

Token ujian disimpan sebagai SHA-256 hash; pembuatan ulang token langsung membatalkan token lama. Jawaban terbaru disimpan di database dan setiap perubahan disimpan sebagai event untuk riwayat.

Client menyimpan jawaban sementara di IndexedDB dan localStorage sebagai fallback, lalu mencoba autosave ke server. Resume harus tetap menggunakan deadline server, bukan waktu lokal browser. Fullscreen tidak dipaksakan; audit keluar/background dan peringatan layar membantu pengawasan, tetapi browser biasa tidak dapat menjamin pencegahan screenshot.

**Why:** Mode ujian membutuhkan integritas penilaian dan pemulihan koneksi tanpa mengandalkan state atau jam client yang dapat dimanipulasi.

**How to apply:** Perubahan berikutnya pada endpoint atau UI ujian harus mempertahankan server-authoritative validation, tidak membocorkan correctAnswer ke siswa, dan tidak menghidupkan kembali embedded BLP/GURU di TOMAT.

Mode Ujian siswa dibuka dari kartu di Arena Tanding, bukan dari sidebar atau bottom navigation. Sesi aktif mengikuti gaya Simulasi Ujian/TKA tanpa memaksa fullscreen; sistem mencatat background/tab switch, reload, copy/cut/paste, context menu, dan shortcut browser, lalu menampilkan peringatan langsung. Setelah tiga pelanggaran client mengirim submit otomatis, sementara server tetap menghitung nilai.

**Why:** Akses Arena membuat pintu masuk ujian konsisten dengan hub aktivitas siswa, sedangkan audit dan batas pelanggaran memberi pengawasan lebih ketat daripada simulasi latihan tanpa mengubah penilaian server.

**How to apply:** Pertahankan jumlah pelanggaran saat resume dari audit server, tampilkan peringatan untuk setiap pelanggaran, jangan mengaktifkan kembali pemaksaan fullscreen, dan jangan menganggap blokir browser sebagai pencegahan screenshot yang sempurna.

Nilai ujian yang baru dikumpulkan berstatus sementara: `score` otomatis hanya menjadi referensi awal. Poin final per soal disimpan terpisah oleh guru pemilik ujian; konfirmasi mengunci `final_score`, mencatat guru/waktu, dan mengirim notifikasi `exam_result_finalized` kepada siswa.

**Why:** Soal isian atau jawaban yang perlu interpretasi tidak selalu dapat dinilai otomatis, tetapi siswa tetap membutuhkan hasil yang jelas dan dapat dipercaya setelah guru mengonfirmasi.

**How to apply:** Pertahankan validasi server untuk batas poin per soal dan kepemilikan ujian, jangan tampilkan nilai final sebelum status `confirmed`, dan jangan membuka kembali koreksi yang sudah dikonfirmasi tanpa keputusan produk yang eksplisit.

Draft ujian guru yang belum disimpan ke server dipertahankan lewat autosave browser dan dipulihkan setelah refresh; draft yang sudah masuk server tetap dibuka dari daftar ujian untuk melanjutkan edit.

**Why:** Form soal panjang tidak boleh hilang hanya karena refresh sebelum guru menekan tombol simpan, tetapi draft lokal tidak menggantikan penyimpanan server untuk riwayat lintas perangkat.

**How to apply:** Pertahankan indikator autosave, pulihkan data draft sebelum mengosongkan form, dan tetap arahkan guru untuk menyimpan ujian ke server sebelum menerbitkannya.

Draft ujian boleh dihapus guru melalui aksi khusus yang dikonfirmasi; endpoint harus memverifikasi pemilik dan status `draft`, sedangkan ujian terbit/ditutup tidak boleh dihapus dari UI ini.

**Why:** Penghapusan draft aman untuk merapikan soal yang batal, tetapi riwayat ujian yang sudah pernah tersedia bagi siswa harus tetap terlindungi.

**How to apply:** Pertahankan batas hapus hanya untuk draft dan gunakan cascade database agar soal draft ikut terhapus tanpa membuka penghapusan lintas guru.