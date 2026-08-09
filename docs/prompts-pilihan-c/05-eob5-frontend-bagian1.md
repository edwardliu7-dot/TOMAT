# Prompt 05 — GuruEOB5: Frontend Bagian 1
## (Dashboard Guru, Absensi, Manajemen Kelas & Siswa)

## Prasyarat
- Prompt 00 selesai: `docs/audit-eob5.md` ada, `src/screens/eob5/` sudah dibuat.
- Prompt 03 selesai: backend EOB5 Bagian 1 sudah berjalan (`/api/eob5/absensi`, `/api/eob5/kelas`, dll).

---

## Konteks Proyek

Aplikasi ini adalah **TOMAT** — game RPG edukasi berbasis web untuk siswa SMP.  
**Baca RULES.md sebelum melakukan apapun.**

Kamu sedang membuat frontend GuruEOB5, khusus **Bagian 1**: layar dashboard guru, absensi, dan manajemen kelas/siswa. Modul EOB5 adalah khusus untuk **guru** — siswa tidak bisa akses.

---

## Konteks Teknis TOMAT Frontend

### Navigasi (App.jsx) — BUKAN React Router
```jsx
// Setiap screen menerima props navigate dan goBack
export default function NamaScreen({ navigate, goBack }) {
  navigate('nama-screen')   // push screen baru
  goBack()                  // kembali
}
```

### Auth — hanya guru yang boleh akses EOB5
```jsx
import { useAuth } from '../../AuthContext'

export default function Eob5DashboardScreen({ navigate, goBack }) {
  const { user } = useAuth()
  if (user?.role !== 'guru') {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#ef4444' }}>
        Akses hanya untuk guru.
      </div>
    )
  }
  // render konten
}
```

### Komponen Shared (dari `src/components/shared.jsx`)
```jsx
import { TopBar, Card, Btn } from '../../components/shared'
```

### Pola Warna EOB5
Gunakan palet oranye-amber yang konsisten untuk EOB5:
- Primary: `#f59e0b` (amber)
- Secondary: `#d97706`
- Background: `#1a1200` → `#2d1e00`
- Card border: `rgba(245,158,11,0.3)`
- Text secondary: `#92400e`

### Fetch Pattern
```jsx
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

useEffect(() => {
  fetch('/api/eob5/endpoint', { credentials: 'include' })
    .then(r => r.json())
    .then(d => { setData(d); setLoading(false) })
    .catch(() => { setError('Gagal memuat data'); setLoading(false) })
}, [])
```

---

## Cara Kerja

1. Baca `docs/audit-eob5.md` untuk memahami semua screen EOB5 bagian ini.
2. Baca kode sumber asli di `/tmp/eob5-source/` (folder frontend).
3. Port screen-screen yang tercantum ke `src/screens/eob5/` sebagai **JSX**.
4. Daftarkan semua screen di `src/App.jsx`.

---

## Aturan Konversi

- Hapus semua TypeScript (interface, type annotations, generics)
- Tailwind → inline styles (`className="bg-amber-900 p-4"` → `style={{ background: '#451a03', padding: 16 }}`)
- ShadCN/Radix components → komponen JSX native dengan inline styles
- `import React from 'react'` → tidak perlu
- Import hooks: `import { useState, useEffect } from 'react'`
- Local imports: tambahkan `.jsx` atau `.js`

### Tabel Tailwind → Inline Style yang Umum
| Tailwind | Inline Style |
|----------|-------------|
| `text-white` | `color: '#fff'` |
| `text-amber-400` | `color: '#fbbf24'` |
| `bg-amber-950` | `background: '#1c0a00'` |
| `rounded-xl` | `borderRadius: 12` |
| `rounded-2xl` | `borderRadius: 16` |
| `p-4` | `padding: 16` |
| `p-6` | `padding: 24` |
| `gap-4` | `gap: 16` |
| `flex flex-col` | `display:'flex', flexDirection:'column'` |
| `grid grid-cols-2` | `display:'grid', gridTemplateColumns:'1fr 1fr'` |
| `font-bold` | `fontWeight: 700` |
| `font-semibold` | `fontWeight: 600` |
| `text-sm` | `fontSize: 13` |
| `text-xs` | `fontSize: 11` |
| `opacity-50` | `opacity: 0.5` |

### ShadCN → Native Equivalents
| ShadCN | Ganti Dengan |
|--------|-------------|
| `<Button>` | `<Btn>` dari shared.jsx, atau `<button style={{...}}>` |
| `<Card>` | `<Card>` dari shared.jsx, atau `<div style={{...}}>` |
| `<Input>` | `<input style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'10px 14px', color:'#fff', width:'100%' }}>` |
| `<Select>` | `<select style={{ background:'#1c0a00', border:'1px solid rgba(245,158,11,0.3)', borderRadius:8, padding:'10px', color:'#fff' }}>` |
| `<Table>` | `<table style={{ width:'100%', borderCollapse:'collapse' }}>` |
| `<Badge>` | `<span style={{ background:'rgba(245,158,11,0.2)', color:'#fbbf24', borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:700 }}>` |
| `<Dialog>` | `<div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>` |
| `<Tabs>` | Tab buttons + conditional render manual |
| `<Toast>` | Skip atau implementasi sederhana dengan state |

---

## Screen yang Dibuat

### `src/screens/eob5/Eob5DashboardScreen.jsx` — Entry point EOB5
**Hanya untuk guru.** Tampilkan:
- Header: "Dashboard Guru" dengan nama guru
- Kartu statistik: jumlah siswa aktif, absensi hari ini, materi tersimpan
- Navigasi cepat ke fitur-fitur EOB5: Absensi, Nilai, Jadwal, Prosem, Materi, Soal AI
- Recent activity (opsional)

Struktur navigasi cepat (grid 2x3):
```jsx
const MENU = [
  { key: 'eob5-absensi',  label: 'Absensi',    emoji: '📋' },
  { key: 'eob5-nilai',    label: 'Nilai',       emoji: '📊' },
  { key: 'eob5-jadwal',   label: 'Jadwal',      emoji: '📅' },
  { key: 'eob5-prosem',   label: 'Prosem',      emoji: '📝' },
  { key: 'eob5-materi',   label: 'Materi',      emoji: '📚' },
  { key: 'eob5-soal-ai',  label: 'Soal AI',     emoji: '🤖' },
]
```

### `src/screens/eob5/Eob5AbsensiScreen.jsx`
Layar input dan rekap absensi. Fitur:
- Pilih kelas dari dropdown
- Tampilkan daftar siswa kelas tersebut
- Toggle status tiap siswa: Hadir / Sakit / Izin / Alpha
- Tombol simpan absensi hari ini
- Tab: "Input Hari Ini" | "Rekap Bulanan"
- Rekap: tabel dengan persentase kehadiran per siswa

API yang dipakai:
- `GET /api/eob5/kelas/list` — daftar kelas
- `GET /api/eob5/kelas/:id/siswa` — siswa di kelas
- `GET /api/eob5/absensi/hari-ini` — absensi hari ini
- `POST /api/eob5/absensi` — simpan absensi
- `GET /api/eob5/absensi/rekap` — rekap bulanan

### `src/screens/eob5/Eob5ManajemenSiswaScreen.jsx`
Daftar siswa dengan fitur:
- Filter by kelas
- Search by nama
- Klik siswa → lihat detail/rekap lengkap
- Export (opsional, bisa dilewati jika kompleks)

API:
- `GET /api/eob5/siswa/list?kelas=VII-A`
- `GET /api/eob5/siswa/:id`

### `src/screens/eob5/Eob5DetailSiswaScreen.jsx`
Detail + rekap satu siswa:
- Info dasar (nama, kelas, NIS jika ada)
- Rekap absensi bulan ini (pie chart sederhana atau angka)
- Nilai akademik terbaru
- Tab: Absensi | Nilai | Aktivitas BLP (opsional jika BLP sudah di-merge)

API:
- `GET /api/eob5/rekap/siswa/:id`

---

## Pendaftaran di `src/App.jsx`

### Imports
```jsx
import Eob5DashboardScreen from './screens/eob5/Eob5DashboardScreen'
import Eob5AbsensiScreen from './screens/eob5/Eob5AbsensiScreen'
import Eob5ManajemenSiswaScreen from './screens/eob5/Eob5ManajemenSiswaScreen'
import Eob5DetailSiswaScreen from './screens/eob5/Eob5DetailSiswaScreen'
```

### Render (tambahkan di renderScreen() atau equivalent):
```jsx
if (current === 'eob5-dashboard') {
  return <Eob5DashboardScreen navigate={navigate} goBack={goBack} />
}
if (current === 'eob5-absensi') {
  return <Eob5AbsensiScreen navigate={navigate} goBack={goBack} />
}
if (current === 'eob5-siswa') {
  return <Eob5ManajemenSiswaScreen navigate={navigate} goBack={goBack} />
}
if (current === 'eob5-detail-siswa') {
  return <Eob5DetailSiswaScreen navigate={navigate} goBack={goBack} siswaId={eob5SiswaId} />
}
```

> State `eob5SiswaId` perlu ditambahkan ke App.jsx seperti pola `publicProfileData`:
```jsx
const [eob5SiswaId, setEob5SiswaId] = useState(null)
```
Dan di Eob5ManajemenSiswaScreen, saat user klik siswa:
```jsx
// Cara melewatkan eob5SiswaId ke App.jsx:
// Gunakan window event seperti pola yang sudah ada di TOMAT
window.dispatchEvent(new CustomEvent('eob5:lihat-siswa', { detail: { id: siswa.id } }))
```
Lalu di App.jsx tambahkan listener untuk event ini.

### SCREEN_TITLES
```jsx
'eob5-dashboard': 'EOB5 — Dashboard Guru',
'eob5-absensi': 'EOB5 — Absensi',
'eob5-siswa': 'EOB5 — Manajemen Siswa',
'eob5-detail-siswa': 'EOB5 — Detail Siswa',
```

---

## Aturan Wajib

- **Semua teks UI dalam Bahasa Indonesia.**
- **Tidak ada Tailwind** — semua styling inline styles.
- **Tidak ada ShadCN**, Radix UI, atau library komponen lain.
- **Hanya guru yang bisa akses** — cek `user?.role !== 'guru'` di setiap screen.
- Gunakan komponen dari `shared.jsx` (`TopBar`, `Card`, `Btn`) jika tersedia.
- **Jangan ubah** file TOMAT yang sudah ada kecuali `src/App.jsx`.

---

## Kriteria Selesai

- [ ] `Eob5DashboardScreen.jsx` ada, menampilkan menu navigasi EOB5
- [ ] `Eob5AbsensiScreen.jsx` ada, bisa input dan lihat rekap absensi
- [ ] `Eob5ManajemenSiswaScreen.jsx` ada, bisa filter dan search siswa
- [ ] `Eob5DetailSiswaScreen.jsx` ada, menampilkan rekap siswa
- [ ] Semua screen terdaftar di `src/App.jsx`
- [ ] Tidak ada TypeScript, tidak ada Tailwind, tidak ada ShadCN di files baru
- [ ] Guru bisa navigate ke 'eob5-dashboard' tanpa crash
- [ ] Siswa yang mencoba akses EOB5 mendapat pesan "Akses hanya untuk guru"
