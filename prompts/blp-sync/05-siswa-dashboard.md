# BLP Sync — Step 5: Rewrite BlpSiswaDashboardScreen.jsx

Rewrite `src/screens/blp/BlpSiswaDashboardScreen.jsx` agar logikanya sama persis dengan `SiswaDashboard.tsx` di GitHub.

**Referensi:** https://raw.githubusercontent.com/edwardliu7-dot/BLP/main/src/components/SiswaDashboard.tsx

---

## Perubahan Utama

### 1. Ganti scoring function
```jsx
// HAPUS:
import { BLP_CATEGORIES, hitungSkorV2, isV2Record } from './blpAktivitasData.js'

// PAKAI:
import { BLP_CATEGORIES, QURAN_ACTIVITY_ID, BELAJAR_ACTIVITY_ID,
         EVALUASI_ACTIVITY_ID, PERLENGKAPAN_ACTIVITY_ID,
         RECIPROCITY_ACTIVITY_IDS, PERLENGKAPAN_SEKOLAH_ITEMS } from './blpAktivitasData.js'
import { getEffectiveTotalActivities, getEffectiveCompletedCount,
         isDateCountedForRecap } from './utils/blpScoring.js'
import { downloadRekapPDF, downloadRekapExcel } from './utils/rekapExport.js'
import TextSubmissionModal from './modals/TextSubmissionModal.jsx'
import ChecklistSubmissionModal from './modals/ChecklistSubmissionModal.jsx'
import QuranReadingModal from './modals/QuranReadingModal.jsx'
import ProfileModal from './modals/ProfileModal.jsx'
```

### 2. Hitung skor dengan cara baru
```jsx
// SEBELUM:
const pct = hitungSkorV2(checked, sedangHaid)

// SESUDAH:
const todayDate = new Date(today + 'T00:00:00')
const pct = Math.round(
  (getEffectiveCompletedCount(todayDate, checked, student?.haidPeriods || []) /
   getEffectiveTotalActivities(todayDate)) * 100
)
```

### 3. Tambahkan submission modal logic
```jsx
const [activeModalActivityId, setActiveModalActivityId] = useState(null)

// Konfigurasi aktivitas yang butuh submission (text/audio/checklist)
function getSubmissionConfig(activityId) {
  if (activityId === BELAJAR_ACTIVITY_ID) {
    return { minChars: 100, title: 'Rangkuman Belajar Hari Ini',
             placeholder: 'Tuliskan rangkuman materi yang kamu pelajari hari ini...' }
  }
  if (activityId === EVALUASI_ACTIVITY_ID) {
    return { minChars: 100, title: 'Evaluasi Diri Sebelum Tidur',
             placeholder: 'Tuliskan evaluasi dirimu hari ini...' }
  }
  if (RECIPROCITY_ACTIVITY_IDS.includes(activityId)) {
    return { title: 'Laporan Kegiatan',
             placeholder: 'Ceritakan kegiatan yang kamu lakukan...' }
  }
  return null
}

function getChecklistConfig(activityId) {
  if (activityId === PERLENGKAPAN_ACTIVITY_ID) {
    return { title: 'Ceklis Perlengkapan Sekolah', items: PERLENGKAPAN_SEKOLAH_ITEMS }
  }
  return null
}

// Saat user klik aktivitas:
function handleActivityClick(activityId) {
  const quranConfig = activityId === QURAN_ACTIVITY_ID
  const checklistConfig = getChecklistConfig(activityId)
  const textConfig = getSubmissionConfig(activityId)

  if (quranConfig || checklistConfig || textConfig) {
    // Buka modal dulu, baru tandai selesai setelah submit
    setActiveModalActivityId(activityId)
  } else {
    // Toggle langsung
    toggleActivity(activityId)
  }
}

// Setelah modal submit:
function applySubmissionCompletion(activityId, submission) {
  // 1. Tambahkan activityId ke checked
  // 2. Simpan submission ke record
  // 3. Auto-save ke server
}
```

### 4. Tambahkan tombol Download Rekap
```jsx
// Di header / settings tab:
<button onClick={() => downloadRekapPDF(student, selectedMonth, data?.blpPeriods)}>
  Download PDF
</button>
<button onClick={() => downloadRekapExcel(student, selectedMonth, data?.blpPeriods)}>
  Download Excel
</button>
```

### 5. School-day awareness untuk tampilan kalender
```jsx
// Di tampilan kalender, untuk setiap tanggal:
const dateObj = new Date(dateStr + 'T00:00:00')
const effectiveTotal = getEffectiveTotalActivities(dateObj)
const effectiveDone = getEffectiveCompletedCount(dateObj, record?.completedActivities || [], student.haidPeriods)
const pct = effectiveTotal > 0 ? Math.round((effectiveDone / effectiveTotal) * 100) : 0
```

---

## Struktur Tab (sama dengan GitHub)

| Tab | Konten |
|-----|--------|
| **Harian** | Checklist hari ini per kategori, auto-save, skor lingkaran |
| **Kalender** | Grid bulan, warna per % skor, navigasi bulan |
| **Pengaturan** | Edit profil, download rekap |

---

## Render Modal di Akhir Komponen

```jsx
return (
  <div>
    {/* ... konten dashboard ... */}

    {/* Modal Quran */}
    {activeModalActivityId === QURAN_ACTIVITY_ID && (
      <QuranReadingModal
        activityName="Membaca Al Qur'an"
        bookmark={student?.quranBookmark}
        onClose={() => setActiveModalActivityId(null)}
        onSubmit={(audioDataUrl, quranRef) => {
          applySubmissionCompletion(QURAN_ACTIVITY_ID, {
            type: 'audio', content: audioDataUrl, quranRef,
            recordedAt: new Date().toISOString(),
          })
          // Update quran bookmark
          updateQuranBookmark({ surahNo: quranRef.surahNo, surahName: quranRef.surahName,
                                ayat: quranRef.ayatTo + 1, halaman: null,
                                updatedAt: new Date().toISOString() })
        }}
      />
    )}

    {/* Modal Checklist */}
    {activeModalActivityId && activeModalActivityId !== QURAN_ACTIVITY_ID
      && getChecklistConfig(activeModalActivityId) && (
      <ChecklistSubmissionModal
        title={getChecklistConfig(activeModalActivityId).title}
        activityName={BLP_CATEGORIES.flatMap(c => c.activities)
                        .find(a => a.id === activeModalActivityId)?.name || ''}
        items={getChecklistConfig(activeModalActivityId).items}
        initialValues={currentRecord?.submissions?.[activeModalActivityId]?.items}
        onClose={() => setActiveModalActivityId(null)}
        onSubmit={(items) => {
          applySubmissionCompletion(activeModalActivityId, {
            type: 'checklist', items, recordedAt: new Date().toISOString(),
          })
        }}
      />
    )}

    {/* Modal Text */}
    {activeModalActivityId && activeModalActivityId !== QURAN_ACTIVITY_ID
      && getSubmissionConfig(activeModalActivityId) && (
      <TextSubmissionModal
        title={getSubmissionConfig(activeModalActivityId).title}
        activityName={BLP_CATEGORIES.flatMap(c => c.activities)
                        .find(a => a.id === activeModalActivityId)?.name || ''}
        placeholder={getSubmissionConfig(activeModalActivityId).placeholder}
        minChars={getSubmissionConfig(activeModalActivityId).minChars}
        initialValue={currentRecord?.submissions?.[activeModalActivityId]?.content || ''}
        onClose={() => setActiveModalActivityId(null)}
        onSubmit={(text) => {
          applySubmissionCompletion(activeModalActivityId, {
            type: 'text', content: text, charCount: text.trim().length,
            recordedAt: new Date().toISOString(),
          })
        }}
      />
    )}

    {/* Modal Profil */}
    {showProfileModal && (
      <ProfileModal
        user={student}
        onClose={() => setShowProfileModal(false)}
        onSave={(photoUrl, bio) => updateProfile(photoUrl, bio)}
      />
    )}
  </div>
)
```
