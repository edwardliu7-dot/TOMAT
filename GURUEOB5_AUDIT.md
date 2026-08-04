# Audit Modul GuruEOB5 (SMARTISA) vs APP_LOGIC.md
> Dibuat: 2026-08-04  
> Referensi: https://github.com/edwardliu7-dot/GuruEOB5/blob/main/APP_LOGIC.md  
> Modul SMARTISA: `server/eob5/`, `src/screens/eob5/`, `src/components/eob5/`

---

## Ringkasan Eksekutif

Modul GuruEOB5 di SMARTISA sudah **sangat lengkap** secara keseluruhan. Mayoritas fungsionalitas dari APP_LOGIC.md sudah diimplementasi. Terdapat **5 gap fungsional** yang perlu diperbaiki, **3 masalah konsistensi response format**, dan **1 duplikasi kode** yang perlu dibersihkan.

---

## 1. Perbandingan Endpoint per Domain

### ✅ AUTH
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `POST /auth/login` | ✅ Ada | `/api/auth/login` (shared TOMAT) |
| `POST /auth/logout` | ✅ Ada | `/api/auth/logout` (shared TOMAT) |
| `GET /auth/me` | ✅ Ada | `/api/auth/me` (shared TOMAT) |

---

### ✅ TEACHERS (Guru)
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /teachers` | ✅ Ada | `server/eob5/teachers.js` |
| `PATCH /teachers/:id` | ✅ Ada | `server/eob5/teachers.js` |
| `DELETE /teachers/:id` | ✅ Ada | `server/eob5/teachers.js` |

---

### ⚠️ STUDENTS (Siswa)
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /students` | ⚠️ Partial | `GET /api/eob5/siswa/list` — path dan nama field berbeda |
| `GET /students/:id` | ⚠️ Partial | `GET /api/eob5/siswa/:id` — field berbeda |
| `POST /students` | ⚠️ Partial | `POST /api/eob5/siswa/` — ada tapi field berbeda |
| `PATCH /students/:id` | ❌ Missing | Hanya ada `PUT /api/eob5/siswa/:id`, bukan PATCH |
| `DELETE /students/:id` | ✅ Ada | `DELETE /api/eob5/siswa/:id` |
| `POST /students/import/analyze` | ❌ Missing | Tidak ada endpoint AI-parse untuk import siswa |
| `POST /students/bulk` | ⚠️ Partial | `POST /api/eob5/siswa/bulk` ada |

**Perbedaan Tabel:**  
APP_LOGIC.md menggunakan tabel `guru_eob5_students` dengan kolom `nisn`, `namaLengkap`, `jenisKelamin`, `school`.  
SMARTISA menggunakan tabel `students` milik TOMAT dengan kolom `name`, `username`, `email`, `whatsapp`, `jenis_kelamin`.  
→ **Ini by design** per RULES.md §18, bukan bug. Tapi field naming di response perlu dikomunikasikan.

---

### ✅ SUBJECTS (Mata Pelajaran)
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /subjects` | ✅ Ada | `server/eob5/subjects.js` — auto-sync ✅ |
| `POST /subjects` | ✅ Ada | |
| `PATCH /subjects/:id` | ✅ Ada | |
| `DELETE /subjects/:id` | ✅ Ada | Soft-delete ✅ |

**⚠️ Response field mismatch:**  
APP_LOGIC.md mengembalikan `teacherId` (camelCase).  
SMARTISA mengembalikan `guru_id` (snake_case).

---

### ✅ ATTENDANCE (Absensi)
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /attendance` | ✅ Ada | `server/eob5/attendance.js` |
| `GET /attendance/rekap` | ✅ Ada | Rekap agregat per kelas ✅ |
| `POST /attendance` | ✅ Ada | Upsert ✅ |
| `POST /attendance/bulk` | ✅ Ada | |
| `POST /attendance/bulk-mixed` | ✅ Ada | |
| `PATCH /attendance/:id` | ✅ Ada | |
| `DELETE /attendance/:id` | ❌ Missing | Tidak ada DELETE single record |
| `DELETE /attendance/bulk-kelas` | ✅ Ada | |

**🔴 DUPLIKASI:** `server/eob5/absensi.js` dan `server/eob5/attendance.js` keduanya di-mount dan membaca tabel `absensi` yang sama:
- `/api/eob5/absensi` → `absensi.js` (lebih lama, kurang lengkap, tidak ada PATCH, tidak ada bulk-mixed)
- `/api/eob5/attendance` → `attendance.js` (lebih baru, lengkap, sesuai APP_LOGIC)
→ `absensi.js` adalah duplikasi yang perlu dihapus atau dikonsolidasikan.

---

### ✅ GRADES (Nilai)
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /grades` | ✅ Ada | `server/eob5/grades.js` |
| `POST /grades` | ✅ Ada | |
| `PATCH /grades/:id` | ✅ Ada | |
| `DELETE /grades/:id` | ✅ Ada | |

**Catatan:** SMARTISA juga punya `server/eob5/nilai.js` (path `/api/eob5/nilai`) yang merupakan versi lama dengan `PUT` bukan `PATCH` dan rekap tambahan. Tidak duplikasi secara murni — `nilai.js` punya rekap yang `grades.js` tidak punya — tapi perlu dikonsolidasikan.

---

### ✅ JOURNAL (Jurnal Mengajar)
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /journal` | ✅ Ada | `server/eob5/journal.js` |
| `POST /journal` | ✅ Ada | |
| `PATCH /journal/:id` | ✅ Ada | |
| `DELETE /journal/:id` | ✅ Ada | |

---

### ✅ POINTS (Poin Perilaku)
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /points` | ✅ Ada | `server/eob5/points.js` |
| `POST /points` | ✅ Ada | |
| `POST /points/bulk` | ✅ Ada | |
| `POST /points/bulk-mixed` | ✅ Ada | |
| `PATCH /points/:id` | ✅ Ada | |
| `DELETE /points/:id` | ✅ Ada | |

---

### ✅ ACADEMIC CALENDARS
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /academic-calendars` | ✅ Ada | `server/eob5/academic-calendars.js` |
| `POST /academic-calendars` | ✅ Ada | |
| `DELETE /academic-calendars/:id` | ✅ Ada | |
| `GET /academic-weeks` | ✅ Ada | |
| `GET /academic-weeks?calendarId` | ✅ Ada | |
| `POST /academic-weeks` | ✅ Ada | |
| `PATCH /academic-weeks/:id` | ✅ Ada | |
| `DELETE /academic-weeks/:id` | ✅ Ada | |

---

### ⚠️ JADWAL (Schedules)
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /jadwal` | ✅ Ada | `server/eob5/jadwal.js` |
| `GET /jadwal?teacherId=id` | ⚠️ Partial | Query param belum didukung |
| `POST /jadwal` | ✅ Ada | |
| `PATCH /jadwal/:id` | ❌ **Missing** | Tidak ada endpoint update jadwal |
| `DELETE /jadwal/:id` | ✅ Ada | |

**⚠️ Response field mismatch:**  
APP_LOGIC.md: `teacherId`, `teacherName`, `subjectName`, `jamMulai`, `jamSelesai` (camelCase).  
SMARTISA: `guru_id`, `jam_mulai`, `jam_selesai` (snake_case).

---

### ✅ PROSEM
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /prosem` | ✅ Ada | `server/eob5/prosem.js` |
| `POST /prosem` | ✅ Ada | |
| `DELETE /prosem/:id` | ✅ Ada | |
| `GET /prosem-items?prosemId` | ✅ Ada | Embedded dalam `GET /prosem/:id` |
| `POST /prosem-items` | ⚠️ Partial | Disimpan dalam JSONB `konten.items`, bukan relasional terpisah |
| `PATCH /prosem-items/:id` | ⚠️ Partial | Via `PUT /prosem/:id` update seluruh konten |
| `DELETE /prosem-items/:id` | ⚠️ Partial | Via `PUT /prosem/:id` update seluruh konten |

**Catatan:** SMARTISA menggunakan pendekatan JSONB (`konten` column) untuk prosem items alih-alih tabel relasional terpisah. Ini adalah perbedaan arsitektur yang disengaja (karena `prosem_items` lama punya `week_id` orphan — lihat RULES.md §18). Tidak perlu diubah.

---

### ⚠️ TUJUAN PEMBELAJARAN (TP)
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /tp` | ✅ Ada | Tapi path-nya `/api/eob5/tujuan-pembelajaran` |
| `POST /tp` | ✅ Ada | |
| `PATCH /tp/:id` | ✅ Ada | |
| `DELETE /tp/:id` | ✅ Ada | |
| `POST /tp/bulk` | ✅ Ada | |
| `POST /tp/import/analyze` | ✅ Ada | Via `/import-analyze` |
| `POST /tp/reorder` | ❌ **Missing** | Tidak ada endpoint reorder nomor TP |

---

### ⚠️ BAHAN AJAR
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /bahan-ajar` | ✅ Ada | `server/eob5/bahan-ajar.js` |
| `GET /bahan-ajar/:id/file` | ✅ Ada | File base64 dikecualikan dari GET list ✅ |
| `POST /bahan-ajar` | ✅ Ada | |
| `PATCH /bahan-ajar/:id` | ❌ **Missing** | Tidak ada endpoint update metadata bahan ajar |
| `DELETE /bahan-ajar/:id` | ✅ Ada | |

---

### ❌ INBOX (Pesan Guru ↔ Siswa)
| Endpoint APP_LOGIC | Status SMARTISA | Catatan |
|---|---|---|
| `GET /inbox` | ❌ Stub | `server/eob5/inbox.js` mengembalikan `[]` |
| `GET /inbox/:studentId` | ❌ Missing | |
| `POST /inbox/:studentId` | ❌ Stub | Mengembalikan 503 |
| `POST /inbox/:studentId/read` | ❌ Missing | |

**Catatan Penting:** `Eob5InboxScreen.jsx` sudah menggunakan `/api/komunikasi/*` (sistem komunikasi TOMAT) dan **sudah berfungsi**. File `server/eob5/inbox.js` adalah dead code yang tidak digunakan frontend. Artinya fitur inbox sudah berjalan via jalur berbeda.  
→ Opsi: implementasi ulang `inbox.js` menggunakan `pesan_pribadi` (Neon DB), atau biarkan frontend tetap menggunakan `/api/komunikasi/*` (lebih baik karena sudah berfungsi).

---

### ✅ MODUL TAMBAHAN (Ada di SMARTISA, Tidak di APP_LOGIC.md)
Fitur berikut ada di SMARTISA tapi tidak didokumentasikan di APP_LOGIC.md — ini adalah **penambahan nilai**:

| File | Fitur |
|---|---|
| `modul-ajar.js` | Generate modul ajar via Groq AI + ekspor .docx |
| `soal-otomatis.js` | Generate soal AI via Groq + ekspor .docx |
| `rekap.js` | Rekap kelas, siswa, absensi chart, nilai chart |
| `kepsek.js` | Dashboard kepala sekolah |
| `kesiswaan.js` | Rekap kesiswaan |
| `walikelas.js` | Rekap wali kelas |
| `kurikulum.js` | Supervisi kurikulum |
| `student-accounts.js` | Generate akun siswa + PDF |
| `feedback.js` | Sistem feedback dari siswa |
| `documents.js` | Repositori dokumen administrasi |
| `info-pekanan.js` | Ringkasan pekanan (prosem vs realisasi) |

---

## 2. Daftar Gap yang Perlu Diperbaiki

### 🔴 PRIORITAS TINGGI (Fungsional Hilang)

| No | Gap | File | Saran Perbaikan |
|---|---|---|---|
| 1 | `PATCH /api/eob5/jadwal/:id` tidak ada | `server/eob5/jadwal.js` | Tambah route PATCH untuk update kelas, hari, jam_mulai, jam_selesai |
| 2 | `PATCH /api/eob5/bahan-ajar/:id` tidak ada | `server/eob5/bahan-ajar.js` | Tambah route PATCH untuk update judul, deskripsi, mata_pelajaran, kelas, link_url |
| 3 | `DELETE /api/eob5/attendance/:id` tidak ada | `server/eob5/attendance.js` | Tambah route DELETE single record (sudah ada delete bulk-kelas) |

### 🟡 PRIORITAS SEDANG (Konsistensi)

| No | Gap | File | Saran Perbaikan |
|---|---|---|---|
| 4 | `PATCH /api/eob5/siswa/:id` tidak ada (hanya PUT) | `server/eob5/siswa-akun.js` | Tambah alias PATCH yang memanggil logika yang sama dengan PUT |
| 5 | `POST /tp/reorder` tidak ada | `server/eob5/tujuan-pembelajaran.js` | Tambah endpoint reorder yang memperbarui `tp_number` secara batch |
| 6 | Response `subjects.js` mengembalikan `guru_id` | `server/eob5/subjects.js` | Tambahkan alias `teacherId` di response (bisa tambah di SELECT AS) |
| 7 | Response `jadwal.js` menggunakan snake_case | `server/eob5/jadwal.js` | Tambahkan camelCase aliases (`teacherId`, `subjectName`, `jamMulai`, `jamSelesai`) di SELECT |

### 🟢 PRIORITAS RENDAH (Kebersihan Kode)

| No | Gap | File | Saran Perbaikan |
|---|---|---|---|
| 8 | Duplikasi `absensi.js` dan `attendance.js` | `server/eob5/absensi.js` | `attendance.js` sudah lebih lengkap. Pertimbangkan deprecate `absensi.js` (atau tetap jaga untuk backward compat frontend lama) |
| 9 | `inbox.js` adalah dead code | `server/eob5/inbox.js` | Hapus atau implementasikan ulang menggunakan `pesan_pribadi` |
| 10 | `POST /students/import/analyze` tidak ada | `server/eob5/siswa-akun.js` | Opsional: tambah AI-parse untuk import data siswa (butuh Groq API) |

---

## 3. Masalah School Scoping

APP_LOGIC.md menekankan `school` scoping sebagai fitur utama (§5). Di SMARTISA:
- `gurus.school` ada di Neon DB ✅
- Tapi `students` di TOMAT tidak punya kolom `school` — mereka dibedakan dengan `kelas`
- `attendance.js` dan beberapa router lain scoping berdasarkan `kelas_diampu` guru ✅
- `grades.js`, `points.js` scoping berdasarkan subject ownership guru ✅

**Kesimpulan:** School scoping sudah diterapkan secara implisit via kelas dan subject ownership. Tidak perlu perubahan arsitektural.

---

## 4. Mapping Frontend Screen vs Backend Route

| Screen | Backend Route Digunakan | Status |
|---|---|---|
| `Eob5DashboardScreen` | `/api/eob5/dashboard` | ✅ |
| `Eob5AbsensiScreen` | `/api/eob5/attendance` | ✅ |
| `Eob5ManajemenSiswaScreen` | `/api/eob5/siswa/*` | ✅ |
| `Eob5NilaiScreen` | `/api/eob5/nilai/*` | ✅ |
| `Eob5JadwalScreen` | `/api/eob5/jadwal/*` | ⚠️ Tidak ada PATCH |
| `Eob5ProsemScreen` | `/api/eob5/prosem/*` | ✅ |
| `Eob5MateriScreen` | `/api/eob5/materi/*`, `/api/eob5/tujuan-pembelajaran/*` | ✅ |
| `Eob5SoalAiScreen` | `/api/eob5/soal-otomatis/*` | ✅ |
| `Eob5RekapScreen` | `/api/eob5/rekap/*` | ✅ |
| `Eob5InboxScreen` | `/api/komunikasi/*` (TOMAT) | ✅ Sudah berfungsi |
| `Eob5JurnalScreen` | `/api/eob5/journal/*` | ✅ |
| `Eob5KalenderScreen` | `/api/eob5/academic-calendars/*` | ✅ |
| `Eob5InfoPekananScreen` | `/api/eob5/info-pekanan` | ✅ |
| `Eob5PoinScreen` | `/api/eob5/points/*` | ✅ |
| `Eob5AkunSiswaScreen` | `/api/eob5/student-accounts/*` | ✅ |
| `Eob5DirektoriGuruScreen` | `/api/eob5/teachers` | ✅ |
| `Eob5DirektoriSiswaScreen` | `/api/eob5/siswa/*` | ✅ |
| `Eob5KepsekScreen` | `/api/eob5/kepsek/*` | ✅ |
| `Eob5KesiswaanScreen` | `/api/eob5/kesiswaan/*` | ✅ |
| `Eob5WaliKelasScreen` | `/api/eob5/walikelas/*` | ✅ |
| `Eob5KurikulumScreen` | `/api/eob5/kurikulum/*` | ✅ |
| `Eob5AdministrasiScreen` | `/api/eob5/documents/*` | ✅ |
| `Eob5FeedbackScreen` | `/api/eob5/feedback/*` | ✅ |

---

## 5. Rencana Perbaikan yang Disarankan

Urutan pengerjaan yang direkomendasikan:

```
FASE 1 — Gap Fungsional (estimasi: ~30 menit coding)
├── server/eob5/jadwal.js          → Tambah PATCH /:id
├── server/eob5/bahan-ajar.js      → Tambah PATCH /:id
└── server/eob5/attendance.js      → Tambah DELETE /:id

FASE 2 — Konsistensi API (estimasi: ~20 menit coding)
├── server/eob5/siswa-akun.js      → Tambah alias PATCH /:id
├── server/eob5/tujuan-pembelajaran.js → Tambah POST /reorder
└── server/eob5/subjects.js        → Tambah teacherId alias di response

FASE 3 — Kebersihan Kode (estimasi: ~15 menit)
├── server/eob5/inbox.js           → Hapus atau implementasikan ulang
└── server/eob5/absensi.js         → Evaluasi apakah masih dibutuhkan
```

---

## 6. Kesimpulan

**Skor kesesuaian keseluruhan: ~85%**

| Domain | Coverage |
|---|---|
| Auth | 100% |
| Teachers | 100% |
| Students | 75% (field mapping berbeda by design) |
| Subjects | 95% (minor field naming) |
| Attendance | 95% (DELETE single missing) |
| Grades | 100% |
| Journal | 100% |
| Points | 100% |
| Academic Calendars | 100% |
| Jadwal | 75% (PATCH missing) |
| Prosem | 90% (items via JSONB, bukan relasional) |
| Tujuan Pembelajaran | 90% (reorder missing) |
| Bahan Ajar | 80% (PATCH missing) |
| Inbox | 20% (stub, tapi frontend sudah pakai jalur lain) |

SMARTISA GuruEOB5 secara keseluruhan sudah lebih **kaya fitur** dibanding standalone GuruEOB5 (ada AI-generate soal/modul, rekap visual, boss raid integration, dll). Gap utama adalah endpoint PATCH/DELETE yang belum lengkap di beberapa domain.
