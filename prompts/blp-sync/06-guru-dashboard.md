# BLP Sync — Step 6: Rewrite BlpGuruDashboardScreen.jsx

Rewrite `src/screens/blp/BlpGuruDashboardScreen.jsx` agar logikanya sama persis dengan `GuruDashboard.tsx` di GitHub.

**Referensi:** https://raw.githubusercontent.com/edwardliu7-dot/BLP/main/src/components/GuruDashboard.tsx

---

## Views (sama dengan GitHub)

| View | Deskripsi |
|------|-----------|
| `'list'` | Daftar semua siswa, search, filter status |
| `'detail'` | Detail satu siswa — kalender + checklist per hari |
| `'presentation'` | Mode presentasi fullscreen (opsional, prioritas rendah) |

---

## Import yang Dibutuhkan

```jsx
import { BLP_CATEGORIES, PERLENGKAPAN_SEKOLAH_ITEMS, QURAN_ACTIVITY_ID } from './blpAktivitasData.js'
import { getEffectiveTotalActivities, getEffectiveCompletedCount,
         isDateCountedForRecap, getBlpPeriodKeyForDate } from './utils/blpScoring.js'
import { downloadRekapPDF, downloadRekapExcel } from './utils/rekapExport.js'
import ProfileModal from './modals/ProfileModal.jsx'
import ConfirmModal from './modals/ConfirmModal.jsx'
import GuruReviewSubmissionModal from './modals/GuruReviewSubmissionModal.jsx'
import BlpPeriodModal from './modals/BlpPeriodModal.jsx'
```

---

## Logika Kunci

### 1. Hitung skor siswa per hari (untuk rekap)
```jsx
// Untuk tiap hari dalam sebulan:
function getDaySkor(student, dateStr, blpPeriods) {
  const dateObj = new Date(dateStr + 'T00:00:00')
  if (!isDateCountedForRecap(dateObj, student.kelas, blpPeriods)) return null // hari di luar periode
  const record = student.records?.[dateStr]
  if (!record) return 0
  const total = getEffectiveTotalActivities(dateObj)
  const done = getEffectiveCompletedCount(dateObj, record.completedActivities, student.haidPeriods)
  return total > 0 ? Math.round((done / total) * 100) : 0
}
```

### 2. Review submission siswa
```jsx
async function handleReviewSubmission(studentId, dateKey, activityId) {
  await fetch(`/api/blp/students/${studentId}/records/${dateKey}/submissions/${activityId}/review`, {
    method: 'PUT', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  // Update cache lokal
  patchSubmission(studentId, dateKey, activityId, { reviewedAt: new Date().toISOString() })
}
```

### 3. Hapus siswa dengan ConfirmModal
```jsx
const [deletingStudentId, setDeletingStudentId] = useState(null)

// Tombol hapus di view detail:
<button onClick={() => setDeletingStudentId(student.id)}>Hapus Akun Siswa</button>

// Render ConfirmModal:
{deletingStudentId && (
  <ConfirmModal
    title="Hapus Akun Siswa"
    message={`Akun ${deletingStudent?.name} akan dihapus permanen beserta semua data BLP-nya.`}
    confirmLabel="Ya, Hapus Permanen"
    danger={true}
    onClose={() => setDeletingStudentId(null)}
    onConfirm={async () => {
      await fetch(`/api/blp/students/${deletingStudentId}`, {
        method: 'DELETE', credentials: 'include'
      })
      setDeletingStudentId(null)
      // Kembali ke list, refresh data
    }}
  />
)}
```

### 4. Review submission dengan GuruReviewSubmissionModal
```jsx
const [reviewingActivityId, setReviewingActivityId] = useState(null)
// (dalam context detail siswa + tanggal yang sedang dilihat)

{reviewingActivityId && currentRecord?.submissions?.[reviewingActivityId] && (
  <GuruReviewSubmissionModal
    activityName={BLP_CATEGORIES.flatMap(c => c.activities)
                    .find(a => a.id === reviewingActivityId)?.name || ''}
    submission={currentRecord.submissions[reviewingActivityId]}
    checklistItems={reviewingActivityId === 'rp1' ? PERLENGKAPAN_SEKOLAH_ITEMS : undefined}
    onClose={() => setReviewingActivityId(null)}
  />
)}
```

### 5. Atur Periode BLP
```jsx
const [showPeriodModal, setShowPeriodModal] = useState(false)

{showPeriodModal && (
  <BlpPeriodModal
    guru={currentGuru}
    blpPeriods={data?.blpPeriods || {}}
    onClose={() => setShowPeriodModal(false)}
    onSaved={() => { setShowPeriodModal(false); invalidate(); loadDashboard({ force: true }) }}
  />
)}
```

### 6. Fetch foto siswa on-demand (cache per session)
```jsx
// Sama persis dengan GitHub GuruDashboard.tsx
const _photoCache = new Map()
const _photoInflight = new Map()

function fetchStudentPhoto(studentId) {
  if (_photoCache.has(studentId)) return Promise.resolve(_photoCache.get(studentId))
  if (_photoInflight.has(studentId)) return _photoInflight.get(studentId)
  const p = fetch(`/api/blp/students/${studentId}/photo`, { credentials: 'include' })
    .then(r => r.ok ? r.json() : { photoUrl: null })
    .then(data => {
      const url = data.photoUrl || null
      _photoCache.set(studentId, url)
      _photoInflight.delete(studentId)
      return url
    })
    .catch(() => { _photoCache.set(studentId, null); _photoInflight.delete(studentId); return null })
  _photoInflight.set(studentId, p)
  return p
}
```

---

## Layar Lain yang Bisa Dihapus / Digabungkan

Setelah GuruDashboard direwrite menjadi lengkap, layar-layar ini bisa dihapus dari TOMAT routing karena fungsionalitasnya sudah masuk ke dalam GuruDashboard:

- `BlpGuruRekapScreen.jsx` → masuk ke view `'list'` di GuruDashboard
- `BlpGuruSiswaDetailScreen.jsx` → masuk ke view `'detail'` di GuruDashboard
- `BlpGuruPeriodeScreen.jsx` → masuk ke `BlpPeriodModal` di GuruDashboard
