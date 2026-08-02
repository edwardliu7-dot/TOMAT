# BLP Sync — Step 7: Update Layar-layar Lain

Update semua layar BLP yang masih menggunakan activity IDs lama atau fungsi scoring lama.

---

## BlpHomeScreen.jsx

Update import dan scoring:

```jsx
// HAPUS:
import { AKTIVITAS_LIST, isSedangHaid, hitungSkor, blpPeriodKey } from './blpAktivitasData.js'

// PAKAI:
import { BLP_CATEGORIES, isSedangHaid, blpPeriodKey } from './blpAktivitasData.js'
import { getEffectiveTotalActivities, getEffectiveCompletedCount } from './utils/blpScoring.js'

// Update total aktivitas:
const totalActivities = getEffectiveTotalActivities(new Date(today + 'T00:00:00'))

// Update skor hari ini:
const todayDate = new Date(today + 'T00:00:00')
const todaySkor = todayRecord
  ? Math.round((getEffectiveCompletedCount(todayDate, todayRecord.completedActivities, student.haidPeriods) /
                getEffectiveTotalActivities(todayDate)) * 100)
  : null

// Update jumlah aktivitas selesai hari ini:
const activitiesDone = todayRecord
  ? getEffectiveCompletedCount(new Date(today + 'T00:00:00'), todayRecord.completedActivities, student.haidPeriods)
  : 0
```

---

## BlpIsiAktivitasScreen.jsx

Layar ini melakukan hal yang sama dengan Tab Harian di `BlpSiswaDashboardScreen.jsx`.  
**Opsi 1:** Redirect ke `blp-home` (dashboard sudah punya checklist).  
**Opsi 2:** Update sama seperti `BlpSiswaDashboardScreen` — ganti AKTIVITAS_LIST dengan BLP_CATEGORIES + submission modals.

Jika memilih update:

```jsx
// HAPUS:
import { AKTIVITAS_LIST, isSedangHaid, hitungSkor } from './blpAktivitasData.js'

// PAKAI:
import { BLP_CATEGORIES, isSedangHaid, QURAN_ACTIVITY_ID, BELAJAR_ACTIVITY_ID,
         EVALUASI_ACTIVITY_ID, PERLENGKAPAN_ACTIVITY_ID, RECIPROCITY_ACTIVITY_IDS,
         PERLENGKAPAN_SEKOLAH_ITEMS } from './blpAktivitasData.js'
import { getEffectiveTotalActivities, getEffectiveCompletedCount } from './utils/blpScoring.js'
import TextSubmissionModal from './modals/TextSubmissionModal.jsx'
import ChecklistSubmissionModal from './modals/ChecklistSubmissionModal.jsx'
import QuranReadingModal from './modals/QuranReadingModal.jsx'
```

---

## BlpRiwayatScreen.jsx

```jsx
// HAPUS:
import { AKTIVITAS_LIST, hitungSkor, isSedangHaid } from './blpAktivitasData.js'

// PAKAI:
import { isSedangHaid } from './blpAktivitasData.js'
import { getEffectiveTotalActivities, getEffectiveCompletedCount } from './utils/blpScoring.js'

// Update tiap record di riwayat:
function getSkorForRecord(record, dateStr, haidPeriods) {
  const dateObj = new Date(dateStr + 'T00:00:00')
  const total = getEffectiveTotalActivities(dateObj)
  const done = getEffectiveCompletedCount(dateObj, record.completedActivities, haidPeriods)
  return total > 0 ? Math.round((done / total) * 100) : 0
}
```

---

## BlpGuruRekapScreen.jsx

```jsx
// Update semua hitungSkor() calls:
import { getEffectiveTotalActivities, getEffectiveCompletedCount,
         isDateCountedForRecap } from './utils/blpScoring.js'

// Untuk tiap siswa + hari, hitung skor dengan cara baru
// Tambahkan tombol Download Rekap PDF dan Excel (sama dengan GuruDashboard)
import { downloadRekapPDF, downloadRekapExcel } from './utils/rekapExport.js'
```

---

## BlpGuruSiswaDetailScreen.jsx

```jsx
// HAPUS:
import { hitungSkor, AKTIVITAS_LIST } from './blpAktivitasData.js'

// PAKAI:
import { BLP_CATEGORIES, PERLENGKAPAN_SEKOLAH_ITEMS } from './blpAktivitasData.js'
import { getEffectiveCompletedCount, getEffectiveTotalActivities } from './utils/blpScoring.js'
import GuruReviewSubmissionModal from './modals/GuruReviewSubmissionModal.jsx'

// Tampilkan submission per aktivitas per hari
// Saat guru klik review → buka GuruReviewSubmissionModal
// Panggil /api/blp/students/:id/records/:date/submissions/:activityId/review
```

---

## BlpGuruPeriodeScreen.jsx

```jsx
// Hapus seluruh form inline — ganti dengan BlpPeriodModal:
import BlpPeriodModal from './modals/BlpPeriodModal.jsx'

export default function BlpGuruPeriodeScreen({ goBack }) {
  return (
    <BlpPeriodModal
      // props...
      onClose={goBack}
      onSaved={goBack}
    />
  )
}
```

---

## BlpQuranScreen.jsx

Update untuk menggunakan SURAH_LIST dari data lengkap 114 surah:

```jsx
// HAPUS SURAH_LIST lama (subset) dari blpAktivitasData.js
// PAKAI SURAH_LIST lengkap (114 surah dengan nameArab, nameLatin, dll)
import { SURAH_LIST } from './blpAktivitasData.js'
// (pastikan blpAktivitasData.js mengekspor SURAH_LIST lengkap dari GitHub)
```

---

## App.jsx — Hapus Route Tidak Diperlukan

Setelah refactor selesai, pertimbangkan untuk remove route:
- `blp-isi-aktivitas` → dashboard sudah punya checklist inline
- `blp-guru-periode` → sudah masuk ke BlpPeriodModal di GuruDashboard
- `blp-guru-rekap` + `blp-guru-siswa-detail` → sudah masuk GuruDashboard

(Opsional — biarkan saja jika tidak ingin ubah routing)
