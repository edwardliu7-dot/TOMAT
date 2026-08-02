# Prompt 09 — Frontend Screens: Audit & Alignment

> Eksekusi ini terakhir, setelah semua backend prompt selesai.

## Latar Belakang

Original frontend (TypeScript + ShadCN + Tailwind) sudah dikonversi ke workspace (JSX + inline styles). Audit ini memetakan fitur per screen yang mungkin hilang atau berbeda dalam konversi.

Referensi screen original: `artifacts/guru-eob5/src/pages/` (dari `docs/audit-eob5.md`).

## Audit Per Screen

### 1. `Eob5NilaiScreen.jsx` — ⚠️ PERLU FIX (tergantung Prompt 02)
Setelah Prompt 02 selesai, pastikan:
- Tab/toggle "Sumatif Tengah" muncul di UI
- Form input sumatif tengah: hanya perlu nilai (tidak perlu lingkup_materi atau tp_number)
- Tampilan rekap nilai juga menampilkan baris sumatif tengah
- Kalkulasi rata-rata/aggregat mempertimbangkan sumatif tengah

### 2. `Eob5AbsensiScreen.jsx` — ⚠️ PERLU VERIFIKASI (tergantung Prompt 03)
Setelah Prompt 03 selesai:
- Pastikan tabel absensi menampilkan kolom `filled_by_teacher_name` (siapa yang mengisi)
- Rekap per bulan harus berfungsi (data dari `attendance_records`, bukan `absensi`)
- Status dropdown hanya punya 4 opsi: Hadir / Sakit / Izin / Alpa (hapus 'Alpha' jika ada)

### 3. `Eob5KurikulumScreen.jsx` (TP Screen) — ⚠️ PERLU FIX (tergantung Prompt 04)
Setelah Prompt 04 selesai:
- Tambahkan tombol "Import dari File" di header screen
- Dialog upload file PDF/DOCX dengan preview hasil ekstrak AI
- Tabel preview: checkbox per TP, bisa uncheck yang tidak mau disimpan
- Konfirmasi → POST /bulk dengan shiftTpNumbers
- Tampilan tree: TP dikelompokkan per Lingkup Materi (sudah ada? verifikasi)

### 4. `Eob5PoinScreen.jsx` — ⚠️ PERLU FIX (tergantung Prompt 05)
Setelah Prompt 05 selesai:
- Tambahkan mode "Input Massal" (tabel per hari, satu baris per siswa)
- Tiap baris: pilih jenis (+ / -), input angka poin, input keterangan
- Siswa tanpa input → tidak dikirim
- Tombol "Simpan Semua" → POST /points/bulk-mixed

### 5. `Eob5AkunSiswaScreen.jsx` — ⚠️ PERLU FIX (tergantung Prompt 06)
Setelah Prompt 06 selesai:
- Tampilkan pesan "Hanya wali kelas" untuk guru non-wali-kelas
- Tombol "Download Kartu" (ikon PDF) per siswa yang sudah punya akun
- Tombol "Download Semua Kartu" di header

### 6. `Eob5SoalAiScreen.jsx` — ⚠️ PERLU FIX (tergantung Prompt 07)
Setelah Prompt 07 selesai:
- Field form: `jumlahSoal` (bukan `jumlah`), `jenisSoal` (bukan `jenis`), tambah `tingkatKesulitan`
- Di list soal tersimpan: tombol "Download DOCX" per item
- Indikator model AI yang dipakai (optional, nice-to-have)

### 7. `Eob5ProsemScreen.jsx` — ⚠️ PERLU FIX (tergantung Prompt 08)
Setelah Prompt 08 selesai:
- Field mata pelajaran → dropdown dari subjects API (bukan text bebas)
- Pilih kalender akademik dari dropdown
- Tombol "Import dari File" untuk AI prosem extraction

### 8. Screens yang Perlu VERIFIKASI (kemungkinan sudah OK)

Buka dan test setiap screen berikut — cari bug atau fitur yang kelihatannya kosong/error:

- `Eob5DashboardScreen.jsx` — hitungan KPI harus muncul (students, attendance today, journal entries)
- `Eob5JurnalScreen.jsx` — dropdown mata pelajaran, link ke prosem item (opsional), tanggal picker
- `Eob5JadwalScreen.jsx` — CRUD jadwal, tampilan grid per hari, import dari PDF
- `Eob5KalenderScreen.jsx` — kalender akademik + minggu efektif, buat minggu baru
- `Eob5InfoPekananScreen.jsx` — weekly info per mata pelajaran + kelas
- `Eob5WaliKelasScreen.jsx` — rekap siswa kelas, jurnal wali kelas
- `Eob5RekapScreen.jsx` — rekap absensi + nilai, filter bulan/semester
- `Eob5InboxScreen.jsx` — daftar percakapan + baca/kirim pesan
- `Eob5FeedbackScreen.jsx` — form feedback dengan kategori

### 9. Cross-cutting: Loading & Error States

Cek semua screen untuk:
- Tampilkan skeleton/spinner saat data loading (bukan blank screen)
- Error boundary atau error message yang informatif saat API error
- Konfirmasi dialog sebelum DELETE (sudah ada di sebagian screen, pastikan konsisten)

### 10. Cross-cutting: Navigasi

Cek `src/App.jsx` dan screen EOB5:
- Semua route `eob5-*` terdaftar dengan benar
- Sidebar/nav menyorot item aktif
- Deep link (buka URL langsung) berfungsi

## Cara Eksekusi Prompt Ini

Untuk setiap item ⚠️, buka screen yang dimaksud dan:
1. Bandingkan fitur yang ada vs yang seharusnya ada (sesuai deskripsi di atas)
2. Implementasikan yang hilang
3. Test di browser sebelum pindah ke screen berikutnya

Prioritas: Nilai → Absensi → TP → Poin → AkunSiswa → SoalAI → Prosem → yang lain

## File yang Disentuh

Bervariasi per item — semua file di `src/screens/eob5/`.
