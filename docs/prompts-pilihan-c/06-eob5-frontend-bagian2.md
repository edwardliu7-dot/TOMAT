# Prompt 06 — GuruEOB5: Frontend Bagian 2
## (Nilai Akademik, Jadwal, Prosem, Materi, Soal AI, Rekap, Inbox)

## Prasyarat
- Prompt 00 selesai: `docs/audit-eob5.md` ada.
- Prompt 04 selesai: backend EOB5 Bagian 2 sudah berjalan (`/api/eob5/nilai`, `/api/eob5/jadwal`, `/api/eob5/soal-otomatis`, dll).
- Prompt 05 selesai: `Eob5DashboardScreen.jsx` sudah ada dan terdaftar di App.jsx — prompt ini menambah screen yang ditaut dari dashboard tersebut.

---

## Konteks Proyek

Aplikasi ini adalah **TOMAT** — game RPG edukasi berbasis web untuk siswa SMP.  
**Baca RULES.md sebelum melakukan apapun.**

Kamu sedang membuat **Bagian 2** frontend GuruEOB5: layar nilai akademik, jadwal, prosem, materi ajar, soal otomatis AI (Groq), rekap, dan inbox. Semua layar hanya untuk guru.

---

## Konteks Teknis TOMAT Frontend

### Navigasi & Auth — sama seperti Prompt 05
```jsx
import { useAuth } from '../../AuthContext'
export default function NamaScreen({ navigate, goBack }) {
  const { user } = useAuth()
  if (user?.role !== 'guru') return <div style={{ padding: 40, color: '#ef4444', textAlign: 'center' }}>Akses hanya untuk guru.</div>
  // ...
}
```

### Palet Warna EOB5 — sama seperti Prompt 05
- Primary: `#f59e0b` | Background: `#1a1200 → #2d1e00` | Card border: `rgba(245,158,11,0.3)`

### Komponen Shared
```jsx
import { TopBar, Card, Btn } from '../../components/shared'
```

### Konversi Tailwind & ShadCN → inline styles
Ikuti tabel konversi yang sama dengan Prompt 05. Prinsip utama: hapus semua `className`, ganti dengan `style={{...}}`.

---

## Screen yang Dibuat

### `src/screens/eob5/Eob5NilaiScreen.jsx`
Input dan rekap nilai akademik siswa.

Fitur:
- Dropdown pilih kelas → dropdown pilih mata pelajaran → dropdown pilih jenis nilai (UH / UTS / UAS / Tugas)
- Tabel daftar siswa dengan input nilai inline (bisa edit langsung di cell)
- Tombol Simpan Semua
- Tab: "Input Nilai" | "Rekap Nilai"
- Rekap: rata-rata per siswa, rata-rata kelas, passing grade indicator

API:
- `GET /api/eob5/kelas/list`
- `GET /api/eob5/kelas/:id/siswa`
- `GET /api/eob5/nilai?kelas=...&mapel=...`
- `POST /api/eob5/nilai` (bulk)
- `GET /api/eob5/nilai/rekap`

---

### `src/screens/eob5/Eob5JadwalScreen.jsx`
Jadwal pelajaran per kelas/guru.

Fitur:
- Tampilkan jadwal dalam format grid minggu (Senin–Sabtu × jam)
- Atau sebagai list card per hari (lebih simpel, direkomendasikan)
- Tombol tambah jadwal baru (form: kelas, mapel, hari, jam mulai, jam selesai)
- Filter by kelas atau by guru

API:
- `GET /api/eob5/jadwal`
- `POST /api/eob5/jadwal`
- `PUT /api/eob5/jadwal/:id`
- `DELETE /api/eob5/jadwal/:id`

---

### `src/screens/eob5/Eob5ProsemScreen.jsx`
Program Semester (Prosem).

Fitur:
- Daftar prosem yang sudah dibuat (filter: mapel, kelas, semester)
- Tombol buat prosem baru
- Form buat prosem: mapel, kelas, semester (1/2), tahun ajaran, konten (textarea JSON atau rich text sederhana)
- Klik prosem → lihat detail & edit

API:
- `GET /api/eob5/prosem`
- `POST /api/eob5/prosem`
- `PUT /api/eob5/prosem/:id`
- `GET /api/eob5/prosem/:id`

---

### `src/screens/eob5/Eob5MateriScreen.jsx`
Daftar materi/bahan ajar/modul ajar.

Fitur:
- Daftar materi (filter: kelas, mapel, tipe)
- Kartu tiap materi: judul, deskripsi, tipe (PDF/Video/Link), kelas & mapel
- Tombol tambah materi: form dengan input judul, deskripsi, URL, kelas, mapel, tipe
- Klik materi → preview/buka URL
- Tombol hapus

API:
- `GET /api/eob5/materi`
- `POST /api/eob5/materi`
- `DELETE /api/eob5/materi/:id`

---

### `src/screens/eob5/Eob5SoalAiScreen.jsx`
Generator soal otomatis menggunakan Groq AI.

Fitur:
- Form input: Topik/TP, Tingkat kelas (7/8/9), Jumlah soal (5–20), Jenis (Pilihan Ganda / Esai)
- Tombol "Generate Soal"
- Loading state saat generate ("🤖 AI sedang membuat soal...")
- Tampilkan soal hasil generate dalam kartu yang bisa di-scroll
- Untuk pilihan ganda: tampilkan pertanyaan, 4 pilihan, jawaban benar, pembahasan
- Tombol "Simpan Soal" — kirim ke backend untuk disimpan
- Tombol "Generate Ulang"

API:
- `POST /api/eob5/soal-otomatis/generate`
  - Body: `{ topik, tingkat, jumlah, jenis }`
  - Response: `{ soal: [{ pertanyaan, pilihan, jawaban, pembahasan }] }`

Contoh tampilan soal:
```jsx
soal.map((s, i) => (
  <div key={i} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
    <div style={{ fontWeight: 700, marginBottom: 8 }}>{i+1}. {s.pertanyaan}</div>
    {s.pilihan?.map((p, j) => (
      <div key={j} style={{ padding: '4px 0', color: p.startsWith(s.jawaban) ? '#34d399' : '#94a3b8' }}>
        {p.startsWith(s.jawaban) ? '✓ ' : '  '}{p}
      </div>
    ))}
    <div style={{ marginTop: 8, fontSize: 12, color: '#78716c' }}>💡 {s.pembahasan}</div>
  </div>
))
```

---

### `src/screens/eob5/Eob5RekapScreen.jsx`
Rekap menyeluruh per kelas atau per periode.

Fitur:
- Dropdown pilih kelas
- Tampilkan rekap: kehadiran rata-rata, nilai rata-rata per mapel, siswa dengan catatan khusus (banyak alpha/nilai rendah)
- Tab: "Per Kelas" | "Per Siswa"
- "Per Siswa" → link ke `Eob5DetailSiswaScreen` (dari Prompt 05)

API:
- `GET /api/eob5/rekap/kelas/:kelas`
- `GET /api/eob5/rekap/periode`

---

### `src/screens/eob5/Eob5InboxScreen.jsx`
Inbox pengumuman/pesan resmi.

> Jika dari `docs/audit-eob5.md` ternyata inbox EOB5 sama fungsinya dengan chat TOMAT, **skip screen ini** dan dokumentasikan alasannya sebagai komentar di atas file (atau buat file stub yang redirect ke CommunicationScreen TOMAT).

Fitur (jika berbeda dari chat TOMAT):
- Daftar pengumuman masuk (terbaru di atas)
- Badge jumlah belum dibaca
- Klik pengumuman → tampilkan isi lengkap + tandai dibaca
- Tombol "Buat Pengumuman" (untuk guru senior/admin)

API:
- `GET /api/eob5/inbox`
- `PUT /api/eob5/inbox/:id/baca`
- `POST /api/eob5/inbox`

---

## Pendaftaran di `src/App.jsx`

### Imports
```jsx
import Eob5NilaiScreen from './screens/eob5/Eob5NilaiScreen'
import Eob5JadwalScreen from './screens/eob5/Eob5JadwalScreen'
import Eob5ProsemScreen from './screens/eob5/Eob5ProsemScreen'
import Eob5MateriScreen from './screens/eob5/Eob5MateriScreen'
import Eob5SoalAiScreen from './screens/eob5/Eob5SoalAiScreen'
import Eob5RekapScreen from './screens/eob5/Eob5RekapScreen'
import Eob5InboxScreen from './screens/eob5/Eob5InboxScreen'
```

### Render (tambahkan ke renderScreen() / switch di App.jsx)
```jsx
if (current === 'eob5-nilai')    return <Eob5NilaiScreen    navigate={navigate} goBack={goBack} />
if (current === 'eob5-jadwal')   return <Eob5JadwalScreen   navigate={navigate} goBack={goBack} />
if (current === 'eob5-prosem')   return <Eob5ProsemScreen   navigate={navigate} goBack={goBack} />
if (current === 'eob5-materi')   return <Eob5MateriScreen   navigate={navigate} goBack={goBack} />
if (current === 'eob5-soal-ai')  return <Eob5SoalAiScreen   navigate={navigate} goBack={goBack} />
if (current === 'eob5-rekap')    return <Eob5RekapScreen    navigate={navigate} goBack={goBack} />
if (current === 'eob5-inbox')    return <Eob5InboxScreen    navigate={navigate} goBack={goBack} />
```

### SCREEN_TITLES
```jsx
'eob5-nilai':   'EOB5 — Nilai Akademik',
'eob5-jadwal':  'EOB5 — Jadwal',
'eob5-prosem':  'EOB5 — Program Semester',
'eob5-materi':  'EOB5 — Materi Ajar',
'eob5-soal-ai': 'EOB5 — Soal AI',
'eob5-rekap':   'EOB5 — Rekap',
'eob5-inbox':   'EOB5 — Inbox',
```

---

## Pastikan `Eob5DashboardScreen.jsx` (dari Prompt 05) sudah terhubung

Menu di dashboard harus navigate ke semua screen baru ini:
```jsx
const MENU = [
  { key: 'eob5-absensi',  label: 'Absensi',    emoji: '📋' },
  { key: 'eob5-nilai',    label: 'Nilai',       emoji: '📊' },
  { key: 'eob5-jadwal',   label: 'Jadwal',      emoji: '📅' },
  { key: 'eob5-prosem',   label: 'Prosem',      emoji: '📝' },
  { key: 'eob5-materi',   label: 'Materi',      emoji: '📚' },
  { key: 'eob5-soal-ai',  label: 'Soal AI',     emoji: '🤖' },
  { key: 'eob5-rekap',    label: 'Rekap',       emoji: '📈' },
  { key: 'eob5-inbox',    label: 'Inbox',       emoji: '📬' },
]
```
Update `Eob5DashboardScreen.jsx` agar menyertakan Rekap dan Inbox di menu.

---

## Aturan Wajib

- **Semua teks UI dalam Bahasa Indonesia.**
- **Tidak ada Tailwind** — semua inline styles.
- **Tidak ada ShadCN** atau library komponen lain.
- **Hanya guru** yang bisa akses — guard di setiap screen.
- **Tidak ada React Router** — navigasi via props `navigate` / `goBack`.
- **Jangan ubah** file TOMAT yang sudah ada kecuali `src/App.jsx` dan `Eob5DashboardScreen.jsx`.

---

## Kriteria Selesai

- [ ] `Eob5NilaiScreen.jsx` — input & rekap nilai akademik
- [ ] `Eob5JadwalScreen.jsx` — CRUD jadwal pelajaran
- [ ] `Eob5ProsemScreen.jsx` — CRUD program semester
- [ ] `Eob5MateriScreen.jsx` — daftar & tambah materi ajar
- [ ] `Eob5SoalAiScreen.jsx` — generate soal via Groq (loading state + tampil hasil)
- [ ] `Eob5RekapScreen.jsx` — rekap kelas & siswa
- [ ] `Eob5InboxScreen.jsx` — inbox/pengumuman (atau stub terdokumentasi)
- [ ] Semua screen terdaftar di `src/App.jsx`
- [ ] Dashboard EOB5 punya link ke semua screen baru ini
- [ ] Tidak ada crash saat buka tiap screen
- [ ] Soal AI berhasil digenerate dan ditampilkan
