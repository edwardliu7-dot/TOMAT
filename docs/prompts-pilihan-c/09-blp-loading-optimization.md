# Prompt 09 — BLP Loading Optimization (Cache & Query Fix)

## Prasyarat
- Bisa dikerjakan kapan saja, tidak bergantung prompt lain.
- Hanya menyentuh modul BLP (`server/blp/dashboard.js`, `src/screens/blp/`, `src/App.jsx`).
- Tidak mengubah skema database — tidak perlu ALTER TABLE apapun.

---

## Latar Belakang & Masalah

Saat ini modul BLP sisi guru terasa lambat karena tiga masalah berlapis:

### Masalah 1 — Tidak Ada Cache (Dampak Terbesar)

Empat layar guru masing-masing memanggil `fetch('/api/blp/dashboard')` secara independen:

| File | Baris | Kapan dipanggil |
|------|-------|----------------|
| `src/screens/blp/BlpHomeScreen.jsx` | 323 | Setiap kali layar Home dimuat |
| `src/screens/blp/BlpGuruRekapScreen.jsx` | 37 | Setiap kali layar Rekap dimuat |
| `src/screens/blp/BlpGuruSiswaDetailScreen.jsx` | 28 | Setiap buka detail siswa |
| `src/screens/blp/BlpGuruPeriodeScreen.jsx` | 26 | Setiap buka manajemen periode |

Hasil: navigasi antar layar selalu muncul spinner "Memuat..." meski data belum berubah.

### Masalah 2 — Query Backend Berat (Dampak Medium)

Di `server/blp/dashboard.js` (route guru, baris ~45–137):

```javascript
// ❌ Sekarang: ambil SEMUA siswa, filter di JavaScript
pool.query('SELECT id, username, name, kelas ... FROM students')
// lalu: if (normalizeKelas(row.kelas) === kelasWali)

// ❌ Sekarang: ambil SEMUA daily_records tanpa batas tanggal
pool.query(
  'SELECT student_id, record_date, ... FROM daily_records WHERE student_id = ANY($1)',
  [studentIds]  // tidak ada WHERE record_date untuk batasi rentang
)

// ❌ Sekarang: ambil SEMUA blp_periods tanpa filter kelas
pool.query('SELECT kelas, year, month, start_day, end_day FROM blp_periods')
// lalu filter di JS: if (normalizeKelas(row.kelas) !== kelasWali) continue
```

### Masalah 3 — Re-fetch Setelah Review (Dampak Kecil)

Di `BlpGuruSiswaDetailScreen.jsx:50`, setelah guru me-review aktivitas 1 siswa:
```javascript
await fetch(`/api/blp/students/${student.id}/records/${date}/submissions/${activityId}/review`, ...)
loadData()  // ❌ fetch ulang SELURUH data kelas hanya karena 1 field berubah
```

---

## Solusi

### Fix 1 — Buat `BlpDataContext` sebagai Cache (File Baru)

Buat `src/contexts/BlpDataContext.jsx`:

```jsx
import { createContext, useContext, useState, useCallback, useRef } from 'react'

const BlpDataContext = createContext(null)

export function BlpDataProvider({ children }) {
  const [data, setData] = useState(null)      // null = belum pernah fetch
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fetchingRef = useRef(false)           // cegah concurrent fetch

  // Fetch dashboard — hanya ambil dari server jika cache kosong atau force=true
  const loadDashboard = useCallback(async ({ force = false } = {}) => {
    if (!force && data) return data           // kembalikan cache langsung
    if (fetchingRef.current) return           // sudah ada fetch berjalan
    fetchingRef.current = true
    setLoading(true)
    try {
      const res = await fetch('/api/blp/dashboard', { credentials: 'include' })
      if (!res.ok) throw new Error('Gagal memuat data BLP')
      const json = await res.json()
      setData(json)
      setError(null)
      return json
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [data])

  // Invalidate cache — panggil setelah aksi yang mengubah data (review, buat periode, dll)
  const invalidate = useCallback(() => setData(null), [])

  // Patch satu record siswa di cache lokal tanpa re-fetch
  // Dipakai oleh BlpGuruSiswaDetailScreen setelah review
  const patchSubmission = useCallback((studentId, date, activityId, reviewData) => {
    setData(prev => {
      if (!prev) return prev
      const student = prev.students[studentId]
      if (!student) return prev
      const records = { ...student.records }
      const record = records[date] ? { ...records[date] } : { submissions: {} }
      record.submissions = { ...record.submissions, [activityId]: { ...record.submissions[activityId], ...reviewData } }
      records[date] = record
      return {
        ...prev,
        students: {
          ...prev.students,
          [studentId]: { ...student, records }
        }
      }
    })
  }, [])

  return (
    <BlpDataContext.Provider value={{ data, loading, error, loadDashboard, invalidate, patchSubmission }}>
      {children}
    </BlpDataContext.Provider>
  )
}

export function useBlpData() {
  const ctx = useContext(BlpDataContext)
  if (!ctx) throw new Error('useBlpData harus dipakai di dalam BlpDataProvider')
  return ctx
}
```

### Fix 2 — Daftarkan Provider di `src/App.jsx`

Cari di `App.jsx` tempat `BlpHomeScreen` dirender (ada di dalam `renderGuruScreen()` atau switch layar BLP). Wrap provider di level yang mencakup semua layar BLP guru.

Cara paling mudah: import dan tambahkan `BlpDataProvider` membungkus AppShell guru, seperti pola `PlayerProvider`, `TaskProvider` yang sudah ada:

```jsx
import { BlpDataProvider } from './contexts/BlpDataContext'

// Di dalam return guru (sekitar baris yang return AppShell guru):
return (
  <BlpDataProvider>
    <AppShell ...>
      ...
    </AppShell>
  </BlpDataProvider>
)
```

> **Catatan:** Provider harus di luar AppShell agar data tetap hidup selama navigasi antar layar BLP. Jika guru keluar dari BLP dan kembali, cache otomatis kosong (karena unmount) — ini perilaku yang benar.

### Fix 3 — Update Empat Layar Guru untuk Pakai Context

Ganti pola fetch lokal di setiap layar dengan `useBlpData()`:

**Pola lama (di setiap layar):**
```javascript
const [loading, setLoading] = useState(true)
const [data, setData] = useState(null)
useEffect(() => {
  fetch('/api/blp/dashboard', { credentials: 'include' })
    .then(r => r.json())
    .then(d => { setData(d); setLoading(false) })
    .catch(() => setLoading(false))
}, [])
```

**Pola baru (ganti dengan ini):**
```javascript
const { data, loading, error, loadDashboard } = useBlpData()
useEffect(() => { loadDashboard() }, [])
// Tidak ada lagi useState loading/data lokal
```

Lakukan ini untuk keempat file:
- `BlpHomeScreen.jsx`
- `BlpGuruRekapScreen.jsx`
- `BlpGuruSiswaDetailScreen.jsx`
- `BlpGuruPeriodeScreen.jsx`

### Fix 4 — Optimistic Update di `BlpGuruSiswaDetailScreen`

Ganti re-fetch penuh setelah review dengan patch lokal:

```javascript
// Sebelum:
await fetch(`/api/blp/students/${student.id}/records/${date}/submissions/${activityId}/review`, { ... })
loadData()  // ❌ fetch ulang semua

// Sesudah:
const { patchSubmission } = useBlpData()
await fetch(`/api/blp/students/${student.id}/records/${date}/submissions/${activityId}/review`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ status: 'reviewed' })
})
patchSubmission(student.id, date, activityId, { reviewed: true })  // ✅ update lokal
```

Untuk aksi yang benar-benar mengubah struktur data besar (buat/hapus periode BLP), panggil `invalidate()` agar fetch ulang dilakukan di navigasi berikutnya:
```javascript
const { invalidate } = useBlpData()
await fetch('/api/blp/periods', { method: 'POST', ... })
invalidate()  // cache dikosongkan, fetch ulang saat layar berikutnya dimuat
```

### Fix 5 — Perbaikan Query Backend di `server/blp/dashboard.js`

Ini perubahan di backend, bagian route guru (sekitar baris 45–137).

**a. Filter siswa di SQL, bukan JavaScript:**
```javascript
// ❌ Sekarang:
const studentsRes = await pool.query(
  'SELECT id, username, name, kelas, ... FROM students'
)
// lalu filter: if (normalizeKelas(row.kelas) === kelasWali)

// ✅ Ganti dengan:
const studentsRes = await pool.query(
  `SELECT id, username, name, kelas, email, whatsapp, bio, quran_bookmark, jenis_kelamin
   FROM students
   WHERE kelas ILIKE $1 OR kelas ILIKE $2`,
  [kelasWali, kelasWali.replace(' ', '')]   // handle "VII A" vs "VIIA"
)
// Tidak perlu filter JS lagi — semua baris sudah kelas yang benar
```

**b. Batasi daily_records ke 2 bulan terakhir:**
```javascript
// ❌ Sekarang: ambil semua record sejak awal waktu
pool.query(
  'SELECT student_id, record_date, completed_activities, score, submissions FROM daily_records WHERE student_id = ANY($1)',
  [studentIds]
)

// ✅ Ganti dengan: batasi 2 bulan terakhir
pool.query(
  `SELECT student_id, record_date, completed_activities, score, submissions
   FROM daily_records
   WHERE student_id = ANY($1)
     AND record_date >= (CURRENT_DATE - INTERVAL '2 months')`,
  [studentIds]
)
```

**c. Filter blp_periods di SQL:**
```javascript
// ❌ Sekarang: ambil semua periode semua kelas
pool.query('SELECT kelas, year, month, start_day, end_day FROM blp_periods')
// lalu: if (normalizeKelas(row.kelas) !== kelasWali) continue

// ✅ Ganti dengan:
pool.query(
  'SELECT kelas, year, month, start_day, end_day FROM blp_periods WHERE kelas ILIKE $1 OR kelas ILIKE $2',
  [kelasWali, kelasWali.replace(' ', '')]
)
```

---

## File yang Diubah/Dibuat

| File | Aksi |
|------|------|
| `src/contexts/BlpDataContext.jsx` | **Buat baru** |
| `src/App.jsx` | Update: tambah `BlpDataProvider` wrapping AppShell guru |
| `src/screens/blp/BlpHomeScreen.jsx` | Update: ganti fetch lokal → `useBlpData()` |
| `src/screens/blp/BlpGuruRekapScreen.jsx` | Update: ganti fetch lokal → `useBlpData()` |
| `src/screens/blp/BlpGuruSiswaDetailScreen.jsx` | Update: ganti fetch lokal → `useBlpData()` + `patchSubmission` |
| `src/screens/blp/BlpGuruPeriodeScreen.jsx` | Update: ganti fetch lokal → `useBlpData()` + `invalidate` setelah buat/hapus periode |
| `server/blp/dashboard.js` | Update: perbaiki 3 query (WHERE kelas, date limit, filter periods) |

---

## Aturan Wajib

- **Baca RULES.md sebelum mulai.**
- Gunakan inline styles — tidak ada Tailwind/CSS class.
- Semua teks tetap Bahasa Indonesia.
- `BlpDataProvider` hanya wrapping komponen guru BLP, bukan seluruh app.
- Jangan ubah struktur response `/api/blp/dashboard` — hanya perbaiki query di dalamnya.
- Pastikan layar siswa BLP (`BlpHomeScreen` mode siswa, `BlpIsiAktivitasScreen`, dll.) **tidak terpengaruh** — mereka tidak pakai `useBlpData()`.
- `normalizeKelas()` sudah ada di `server/blp/helpers.js` — gunakan untuk konsistensi format kelas.

---

## Kriteria Selesai

- [ ] `src/contexts/BlpDataContext.jsx` ada dengan `BlpDataProvider` dan `useBlpData()`
- [ ] Navigasi antar layar BLP guru (Home → Rekap → Detail → Periode) tidak muncul spinner loading setelah fetch pertama
- [ ] Setelah guru review aktivitas siswa, UI terupdate instan tanpa spinner
- [ ] Setelah guru buat/hapus periode BLP, data di-refresh saat kembali ke layar berikutnya
- [ ] Query `server/blp/dashboard.js` sudah pakai WHERE kelas dan batas 2 bulan untuk daily_records
- [ ] Layar siswa BLP tidak rusak (tidak pakai context guru)
- [ ] Hard refresh (F5 / buka ulang app) tetap fetch data baru dari server
