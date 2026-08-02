# Prompt 02 — BLP Harian: Frontend Screens

## Prasyarat
- Prompt 00 selesai: `docs/audit-blp.md` ada, folder `src/screens/blp/` sudah dibuat.
- Prompt 01 selesai: semua backend BLP sudah berjalan di `/api/blp/*`.

---

## Konteks Proyek

Aplikasi ini adalah **TOMAT** — game RPG edukasi berbasis web untuk siswa SMP.  
**Baca RULES.md sebelum melakukan apapun.**

Kamu sedang menambahkan frontend BLP Harian ke dalam TOMAT. Semua layar BLP harus menggunakan:
- **Sistem navigasi TOMAT** (history stack di `App.jsx`) — bukan React Router
- **Inline styles** — bukan Tailwind atau library CSS apapun
- **Bahasa Indonesia** untuk semua teks UI
- **Auth dari TOMAT** (`useAuth()` dari `src/AuthContext.jsx`) — bukan auth BLP sendiri

---

## Konteks Teknis TOMAT Frontend

### Navigasi (App.jsx)
TOMAT tidak pakai React Router. Navigasi via history stack:
```jsx
// Props yang diterima setiap screen:
export default function NamaScreen({ navigate, goBack, ...otherProps }) {
  // navigate('nama-screen')  ← push screen baru
  // goBack()                 ← kembali ke screen sebelumnya
}
```

### Auth
```jsx
import { useAuth } from '../../AuthContext'

function MyScreen() {
  const { user } = useAuth()
  // user.id, user.role ('guru'|'siswa'), user.name, user.kelas
}
```

### Fetch API
```jsx
// Semua fetch ke backend — gunakan relative URL
const res = await fetch('/api/blp/aktivitas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  credentials: 'include',
})
const json = await res.json()
```

### Komponen Shared (gunakan dari `src/components/shared.jsx`)
```jsx
import { TopBar, Card, Btn } from '../../components/shared'

// TopBar — header layar dengan tombol back
<TopBar title="BLP Harian" onBack={goBack} />

// Card — container kartu standar
<Card>konten</Card>

// Btn — tombol standar
<Btn onClick={fn}>Label</Btn>
```

### Pola Warna BLP
Gunakan palet hijau-teal yang konsisten untuk layar BLP agar berbeda visual dari TOMAT (biru-ungu):
- Primary: `#10b981` (hijau)
- Background: `#0a1a12` → `#0d2d1a`
- Card border: `rgba(16,185,129,0.3)`

---

## Cara Kerja

1. Baca `docs/audit-blp.md` untuk daftar semua screen BLP.
2. Baca kode sumber asli di `/tmp/blp-source/src/` (atau `client/src/`).
3. Port setiap screen ke `src/screens/blp/` sebagai **JSX** (bukan TSX).
4. Buat satu screen utama `BlpHomeScreen.jsx` sebagai entry point BLP.
5. Daftarkan semua screen di `src/App.jsx`.

---

## Aturan Konversi TSX → JSX

```tsx
// SEBELUM (TypeScript/TSX)
interface Props {
  navigate: (screen: string) => void
  goBack: () => void
}

const BlpHome: React.FC<Props> = ({ navigate, goBack }) => {
  const [data, setData] = useState<Activity[]>([])
  return <div className="bg-green-900 p-4">...</div>
}
```

```jsx
// SESUDAH (JSX)
export default function BlpHome({ navigate, goBack }) {
  const [data, setData] = useState([])
  return <div style={{ background: '#0a1a12', padding: 16 }}>...</div>
}
```

Aturan:
- Hapus semua TypeScript (interface, type, generics, type annotations)
- Ganti semua Tailwind classes → inline styles yang setara
- Tambahkan `.jsx` di semua local imports
- Ganti `import React from 'react'` → tidak perlu (JSX transform sudah di-setup)
- Import `useState`, `useEffect`, dll langsung: `import { useState } from 'react'`

---

## File yang Dibuat

### `src/screens/blp/BlpHomeScreen.jsx` — Entry point BLP
Screen pertama yang muncul saat user masuk ke modul BLP. Harus menampilkan:
- **Untuk siswa:** ringkasan aktivitas hari ini, tombol untuk isi aktivitas, history singkat
- **Untuk guru:** ringkasan rekap kelas, daftar siswa yang sudah/belum isi

```jsx
import { TopBar } from '../../components/shared'
import { useAuth } from '../../AuthContext'

export default function BlpHomeScreen({ navigate, goBack }) {
  const { user } = useAuth()
  
  return (
    <div style={{ minHeight: '100vh', background: '#0a1a12', color: '#fff' }}>
      <TopBar title="BLP Harian" onBack={goBack} />
      {/* konten sesuai role */}
    </div>
  )
}
```

### Screen-screen lainnya
Buat screen-screen BLP lainnya sesuai `docs/audit-blp.md`. Semua di `src/screens/blp/`.

---

## Pendaftaran di App.jsx

### 1. Tambahkan imports di `src/App.jsx`
```jsx
// Tambahkan di bagian imports layar:
import BlpHomeScreen from './screens/blp/BlpHomeScreen'
// ... import screen BLP lainnya
```

### 2. Tambahkan ke route map di `renderScreen()` atau switch di `App.jsx`

Cari bagian di `App.jsx` di mana semua screen di-render (ada if/else atau switch berdasarkan `current`), tambahkan:

```jsx
if (current === 'blp-home') {
  return <BlpHomeScreen navigate={navigate} goBack={goBack} />
}
// ... screen BLP lainnya
```

### 3. Tambahkan ke SCREEN_TITLES (jika ada di App.jsx)
```jsx
const SCREEN_TITLES = {
  // ... yang sudah ada
  'blp-home': 'BLP Harian',
  // ... screen BLP lainnya
}
```

---

## Navigasi Antar Screen BLP

Semua `navigate()` di dalam screen BLP menggunakan key yang sudah kamu daftarkan:
```jsx
navigate('blp-home')
navigate('blp-isi-aktivitas')
navigate('blp-rekap')
// dst.
```

Untuk kembali ke TOMAT dari BLP, cukup `goBack()` — stack navigasi akan kembali ke screen sebelumnya.

---

## Catatan Khusus

### Loading State
Setiap screen yang fetch data harus tampilkan loading state:
```jsx
const [loading, setLoading] = useState(true)

if (loading) return (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div style={{ color: '#10b981' }}>Memuat...</div>
  </div>
)
```

### Error Handling
```jsx
const [error, setError] = useState('')

if (error) return (
  <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>
    {error}
  </div>
)
```

### Tidak Perlu Port
- Screen login BLP → tidak diperlukan (TOMAT sudah handle auth)
- Screen register/daftar BLP → tidak diperlukan
- Error boundary BLP → TOMAT sudah punya global ErrorBoundary

---

## Aturan Wajib

- **Semua teks UI dalam Bahasa Indonesia.**
- **Tidak ada Tailwind** — semua styling inline styles.
- **Tidak ada library UI** (Material UI, Ant Design, dll).
- **Gunakan `useAuth()` TOMAT** untuk data user — jangan fetch `/api/auth/me` sendiri.
- **Jangan ubah** file TOMAT yang sudah ada kecuali `src/App.jsx`.
- Komponen yang bisa reuse dari `src/components/shared.jsx`: `TopBar`, `Card`, `Btn`. Cek dulu sebelum buat komponen baru.

---

## Kriteria Selesai

- [ ] `BlpHomeScreen.jsx` ada dan menampilkan konten sesuai role (guru/siswa)
- [ ] Semua screen BLP dari `docs/audit-blp.md` sudah diport ke `src/screens/blp/`
- [ ] Semua screen terdaftar di `src/App.jsx`
- [ ] Tidak ada TypeScript (`interface`, type annotations, `.tsx` extension) di files baru
- [ ] Tidak ada Tailwind classes di files baru
- [ ] App bisa navigate ke 'blp-home' dan menampilkan konten tanpa crash
- [ ] Tidak ada console error saat screen BLP dibuka
