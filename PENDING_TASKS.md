# Pending Tasks — TOMAT / SMARTISA

Task-task ini belum dikerjakan dan bisa dilanjutkan di sesi/akun lain.

---

## Task A — Hapus Chat dari Dashboard Guru TOMAT

**Konteks keputusan:**
Chat guru di TOMAT dihapus karena fitur komunikasi sudah ada di GuruEOB5. Guru balas pesan siswa dari sana. Sisi siswa TOMAT *tetap* bisa mengirim pesan ke guru.

**Yang perlu dilakukan:**

1. **`src/screens/GuruDashboardScreen.jsx`**
   - Hapus tab `{ id: 'komunikasi', icon: '💬', label: 'Chat' }` dari `PRIMARY_TABS_ALL` dan `DESKTOP_TABS`
   - Hapus `{tab === 'komunikasi' && <CommunicationScreen embedded initialTarget={komunikasiTarget} />}` dari `tabContent`
   - Hapus state `komunikasiTarget` dan `setKomunikasiTarget`
   - Hapus mapping `guruKomunikasi: 'komunikasi'` dari event listener `tomat:guru-nav`
   - Hapus prop `onCommunicationClick` dari `<AppNotificationBell>` (atau biarkan tanpa aksi navigate ke chat)
   - Hapus `<MessageNotificationBell>` di header guru (baris ~2736) — guru tidak perlu shortcut chat di TOMAT
   - Hapus import `CommunicationScreen` dari baris 15

2. **`src/components/Sidebar.jsx`**
   - Hapus `{ key: 'guruKomunikasi', emoji: '💬', label: 'Komunikasi' }` dari `GURU_NAV_FULL` dan `GURU_NAV_READONLY`

3. **Notifikasi chat siswa → guru** tetap berfungsi via GuruEOB5 (sudah cross-module lewat `notifyUser`).

**File yang terpengaruh:**
- `src/screens/GuruDashboardScreen.jsx`
- `src/components/Sidebar.jsx`

---

## Task B — Notifikasi Lintas Modul (TOMAT + BLP Harian)

**Konteks keputusan:**
- Sumber notif: TOMAT + BLP Harian
- Notif BLP ke **guru**: hanya wali kelas dari kelas siswa yang submit pengisian BLP
- Notif BLP ke **siswa**: ketika guru memberikan feedback pada pengisian BLP siswa
- UI: satu bell icon unified, tiap notif card punya badge asal modul (pill kecil) — TOMAT = hijau `#9fe3bd`, BLP = biru `#67E8F9`

**Yang perlu dilakukan:**

1. **`server/schema.js`** — tambah kolom `source` di tabel `notifications`:
   ```sql
   ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'tomat';
   ```

2. **`server/notifications.js`** — terima param `source` di `notifyUser()` / `notifyUsers()`:
   ```js
   // Tambahkan source ke INSERT statement
   // Default 'tomat' agar semua pemanggil lama tetap berfungsi
   ```

3. **BLP Harian routes** — hook `notifyUser()` di dua tempat:
   - Siswa submit pengisian BLP → cari wali kelas dari `gurus` (`wali_kelas_kelas = kelas_siswa`) → `notifyUser(guruId, { type: 'blp_submit', source: 'blp', ... })`
   - Guru beri feedback pada BLP siswa → `notifyUser(siswaId, { type: 'blp_feedback', source: 'blp', ... })`

4. **`src/components/shared.jsx`** — komponen `AppNotificationBell`:
   - Fetch notifikasi sudah ada; tambahkan rendering badge `source` per item
   - Pill kecil di pojok kanan setiap notif card: `TOMAT` (background `rgba(159,227,189,0.15)`, color `#9fe3bd`) atau `BLP` (background `rgba(103,232,249,0.15)`, color `#67E8F9`)

**File yang terpengaruh:**
- `server/schema.js`
- `server/notifications.js`
- Route BLP yang handle submit & feedback (cari di `server/` atau `server/blp*.js`)
- `src/components/shared.jsx`

---

## Referensi konteks yang relevan

- Lihat `.agents/memory/tomat-guru-access-control.md` untuk konteks access control yang sudah dikerjakan
- Notifikasi server: `server/notifications.js` — fungsi `notifyUser(userId, payload)`
- Tabel `notifications` ada di `server/schema.js`
- `AppNotificationBell` ada di `src/components/shared.jsx`
