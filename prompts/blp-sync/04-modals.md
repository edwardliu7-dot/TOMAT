# BLP Sync — Step 4: Modal Components

Buat folder `src/screens/blp/modals/` dan isi dengan 6 modal komponen berikut.

Semua modal menggunakan **inline styles** (tidak pakai Tailwind), karena workspace ini tidak menggunakan Tailwind.

---

## Daftar Modal

| File | Sumber GitHub | Fungsi |
|------|---------------|--------|
| `TextSubmissionModal.jsx` | `src/components/modals/TextSubmissionModal.tsx` | Siswa tulis rangkuman/evaluasi teks |
| `ChecklistSubmissionModal.jsx` | `src/components/modals/ChecklistSubmissionModal.tsx` | Siswa centang perlengkapan sekolah |
| `QuranReadingModal.jsx` | `src/components/modals/QuranReadingModal.tsx` | Siswa rekam audio bacaan Quran |
| `ProfileModal.jsx` | `src/components/modals/ProfileModal.tsx` | Edit foto & bio |
| `ConfirmModal.jsx` | `src/components/modals/ConfirmModal.tsx` | Konfirmasi aksi berbahaya |
| `GuruReviewSubmissionModal.jsx` | `src/components/modals/GuruReviewSubmissionModal.tsx` | Guru lihat submission siswa |
| `BlpPeriodModal.jsx` | `src/components/modals/BlpPeriodModal.tsx` | Guru atur periode aktif BLP |

Semua file tersedia di: https://github.com/edwardliu7-dot/BLP/tree/main/src/components/modals

---

## Panduan Konversi TypeScript → JavaScript (inline styles)

### 1. Hapus TypeScript annotations
```tsx
// SEBELUM (TypeScript)
interface TextSubmissionModalProps {
  title: string;
  onClose: () => void;
}
export default function TextSubmissionModal({ title, onClose }: TextSubmissionModalProps) {
```
```jsx
// SESUDAH (JavaScript)
export default function TextSubmissionModal({ title, onClose }) {
```

### 2. Ganti Tailwind className dengan inline style
```tsx
// SEBELUM (Tailwind)
<div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
  <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-lg">
```
```jsx
// SESUDAH (inline styles)
<div style={{
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  zIndex: 50,
}}>
  <div style={{
    background: '#fff', borderRadius: '24px 24px 0 0',
    padding: 24, width: '100%', maxWidth: 512,
  }}>
```

### 3. Ganti imports
```tsx
// SEBELUM (GitHub paths)
import { ChecklistItem } from '../../data/activities'
```
```jsx
// SESUDAH (workspace paths)
import { PERLENGKAPAN_SEKOLAH_ITEMS } from '../blpAktivitasData.js'
```

### 4. Pertahankan logika identik
- State management (useState, useEffect, useRef)
- Validasi (minChars, isValid, dll)
- API calls
- Audio recording (MediaRecorder API) di QuranReadingModal

---

## TextSubmissionModal — Logika Kunci

- State: `text` (string)
- Validasi: `minChars` — jika ada, teks harus minimal X karakter
- Submit: panggil `onSubmit(text)`

## ChecklistSubmissionModal — Logika Kunci

- State: `checked` (Record<string, boolean>)
- Items: dari `PERLENGKAPAN_SEKOLAH_ITEMS` (5 item)
- Valid jika semua 5 item dicentang
- Submit: panggil `onSubmit(checkedMap)`

## QuranReadingModal — Logika Kunci

- States: `recordState` ('idle' | 'recording' | 'recorded')
- Gunakan `MediaRecorder` API untuk rekam audio
- Tampilkan pilihan surah + ayat dari/sampai
- Submit: panggil `onSubmit(audioDataUrl, quranRef)`
- `quranRef`: `{ surahNo, surahName, ayatFrom, ayatTo, halaman? }`

## GuruReviewSubmissionModal — Logika Kunci

- Tampilkan konten submission berdasarkan `submission.type`:
  - `'text'` → tampilkan `submission.content`
  - `'audio'` → tampilkan `<audio>` player + info QS. surah
  - `'checklist'` → tampilkan list item yang dicentang
- Jika `submission.expired === true` → tampilkan pesan "konten sudah dihapus"
- Tampilkan `reviewedAt` dan tanggal expired (reviewedAt + 7 hari)

## BlpPeriodModal — Logika Kunci

- Form: kelas, tahun, bulan, startDay, endDay
- Validasi: endDay >= startDay, semua field valid
- Submit: PUT `/api/blp/periods` dengan body `{ kelas, year, month, startDay, endDay }`
