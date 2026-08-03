# Pending Tasks — TOMAT / SMARTISA

Task-task ini belum dikerjakan dan bisa dilanjutkan di sesi/akun lain.

---

> ✅ **Task A** (Hapus Chat Guru TOMAT) — **SELESAI** (3 Agustus 2026)
> ✅ **Task B** (Notifikasi Lintas Modul TOMAT + BLP) — **SELESAI** (3 Agustus 2026)

---

## Task C — Mode Mengajar Guru TOMAT

**Konteks keputusan:**
Mode mengajar saat ini menampilkan semua mapel (MTK dan IPA), dan navigasinya berubah saat masuk mode tersebut. Seharusnya:
- Hanya tampilkan zona belajar dari mapel yang diampu guru (filter by `user.mapel`)
- Navigasi UI guru tidak berubah — hanya konten zona belajar yang ganti

**Yang perlu dilakukan:**

1. **Mode Mengajar (cari di `GuruDashboardScreen.jsx` / screen terkait)**
   - Filter zona belajar berdasarkan `user.mapel` (dari `kelas_diampu` + mapel guru, tersedia di `AuthContext` setelah fix auth)
   - Hanya tampilkan tab mapel yang ada di `user.mapel` — bukan semua mapel yang ada di HomeScreen
   - Navigasi sidebar/bottom nav guru tetap sama saat masuk mode mengajar

2. **Zona belajar per kelas diampu**
   - Konten mode mengajar: zona belajar siswa dari kombinasi mapel + kelas_diampu guru
   - Gunakan `user.kelas_diampu` (array) untuk menentukan kelas yang ditampilkan

**File yang kemungkinan terpengaruh:**
- `src/screens/GuruDashboardScreen.jsx` (cek tab `guruMengajar` / mode mengajar)
- `src/screens/HomeScreen.jsx` (ZONES_MATEMATIKA, ZONES_IPA — referensi saja, jangan ubah)

---

## Referensi konteks yang relevan

- `user.jabatan`, `user.kelas_diampu`, `user.wali_kelas_kelas` kini tersedia di klien via AuthContext (fix auth 3 Agustus 2026)
- Lihat `RULES.md §11` untuk konvensi auth guru terbaru
- Notifikasi: `server/notifications.js` — `notifyUser({ ..., source: 'tomat'|'blp' })`
- Tabel `notifications` sudah punya kolom `source TEXT DEFAULT 'tomat'`
