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

**How to apply:** Pertahankan validasi server untuk batas poin per soal dan kepemilikan ujian, jangan tampilkan nilai final sebelum status `confirmed`, dan hanya izinkan revisi nilai confirmed melalui aksi guru yang eksplisit, audit, serta notifikasi ulang kepada siswa.

Ujian terbit dapat diedit guru pemiliknya selama tidak ada siswa yang sedang mengerjakan. Update mempertahankan ID soal dan riwayat attempt; soal yang sudah memiliki jawaban/koreksi tidak boleh dihapus.

**Why:** Guru perlu memperbaiki typo atau kunci jawaban tanpa menghapus sejarah ujian, tetapi perubahan struktur saat attempt aktif dapat membuat soal client dan server tidak sinkron.

**How to apply:** Ujian closed tetap terkunci, blokir perubahan saat ada attempt `in_progress`, dan gunakan update soal yang mempertahankan ID sebelum menghapus soal yang belum pernah dipakai.

Draft ujian guru yang belum disimpan ke server dipertahankan lewat autosave browser dan dipulihkan setelah refresh; draft yang sudah masuk server tetap dibuka dari daftar ujian untuk melanjutkan edit.

**Why:** Form soal panjang tidak boleh hilang hanya karena refresh sebelum guru menekan tombol simpan, tetapi draft lokal tidak menggantikan penyimpanan server untuk riwayat lintas perangkat.

**How to apply:** Pertahankan indikator autosave, pulihkan data draft sebelum mengosongkan form, dan tetap arahkan guru untuk menyimpan ujian ke server sebelum menerbitkannya.

Draft ujian boleh dihapus guru melalui aksi khusus yang dikonfirmasi; endpoint harus memverifikasi pemilik dan status `draft`, sedangkan ujian terbit/ditutup tidak boleh dihapus dari UI ini.

**Why:** Penghapusan draft aman untuk merapikan soal yang batal, tetapi riwayat ujian yang sudah pernah tersedia bagi siswa harus tetap terlindungi.

**How to apply:** Pertahankan batas hapus hanya untuk draft dan gunakan cascade database agar soal draft ikut terhapus tanpa membuka penghapusan lintas guru.

Impor Word memakai Groq untuk mengubah teks `.docx` menjadi JSON soal. Model `llama-3.3-70b-versatile` sudah dihentikan Groq pada 16 Agustus 2026; gunakan `openai/gpt-oss-120b` sebagai default dan pertahankan fallback untuk konfigurasi model lama.

**Why:** Model yang dihentikan mengembalikan `404 model_not_found` setelah teks Word berhasil diekstrak, sehingga pengguna melihat impor gagal walaupun file tidak bermasalah.

**How to apply:** Saat Groq mengganti model lagi, perbarui default dan fallback impor bersama-sama; jangan menganggap error ini sebagai kerusakan parser `.docx`.

Siswa dapat membuka review setelah attempt berstatus `submitted` atau `expired`. Sebelum nilai final dikonfirmasi, review hanya menampilkan jawaban siswa dan poin otomatis sementara; kunci jawaban serta poin manual tetap disembunyikan. Setelah `confirmed`, review menampilkan kunci jawaban dan poin final per soal.

**Why:** Siswa perlu memahami hasil pengerjaannya tanpa membuka kunci jawaban ketika koreksi guru belum selesai atau memberi celah untuk membagikan soal yang masih aktif.

**How to apply:** Lindungi endpoint review dengan kepemilikan attempt siswa, tolak attempt `in_progress`, dan buat respons server menentukan kapan `correctAnswer` boleh dikirim.

Impor `.docx` harus memakai hasil konversi HTML Mammoth agar format bold tidak hilang; marker `[[BOLD_START]]...[[BOLD_END]]` dikirim ke AI sebagai kunci eksplisit. Jika kunci tidak tersedia, AI boleh menyelesaikan soal objektif dan mengembalikan `null` hanya jika ambigu.

**Why:** `extractRawText()` membuang format bold, sedangkan prompt yang melarang tebakan membuat soal tanpa kunci selalu masuk sebagai kunci kosong.

**How to apply:** Pertahankan instruksi marker bold di prompt AI, minta jawaban pilihan ganda tetap sama persis dengan option, dan tampilkan hasil impor sebagai draft yang tetap diperiksa guru.

Groq JSON mode pada model `openai/gpt-oss-120b` dapat mengembalikan `failed_generation` walaupun prompt sudah meminta JSON; impor Word perlu fallback ke respons teks terstruktur lalu mengekstrak dan memvalidasi objek JSON di server.

**Why:** Kegagalan validasi JSON dari provider tidak selalu berarti dokumen Word rusak, dan tanpa fallback guru melihat error mentah 400.

**How to apply:** Pertahankan validasi `questions` setelah parsing, jangan menyimpan hasil AI langsung ke database, dan tampilkan pesan impor yang ramah jika respons kedua juga gagal.