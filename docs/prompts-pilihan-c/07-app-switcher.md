# Prompt 07 — App Switcher & Shell Terpadu

## Prasyarat
- Prompt 00–06 selesai: semua backend + frontend BLP dan EOB5 sudah berjalan.
- `BlpHomeScreen.jsx` terdaftar di App.jsx dengan key `'blp-home'`.
- `Eob5DashboardScreen.jsx` terdaftar di App.jsx dengan key `'eob5-dashboard'`.

---

## Konteks Proyek

Aplikasi ini adalah **TOMAT** — game RPG edukasi berbasis web untuk siswa SMP.  
**Baca RULES.md sebelum melakukan apapun.**

Ini adalah prompt **terakhir** dari seri Pilihan C. Tujuannya: membuat App Switcher agar pengguna yang sudah login bisa berpindah antara tiga modul — TOMAT, BLP Harian, dan GuruEOB5 — tanpa perlu login ulang.

---

## Yang Harus Dihasilkan

### Tampilan akhir untuk **guru**:
```
┌─────────────────────────────────────────────────────┐
│  🍅 SMP TISA   [ TOMAT | BLP | EOB5 ]      👤 Guru │
├─────────────────────────────────────────────────────┤
│  (konten sesuai modul aktif)                         │
└─────────────────────────────────────────────────────┘
```

### Tampilan akhir untuk **siswa**:
```
┌─────────────────────────────────────────────────────┐
│  🍅 SMP TISA   [ TOMAT | BLP ]              👤 Siswa│
├─────────────────────────────────────────────────────┤
│  (konten sesuai modul aktif)                         │
└─────────────────────────────────────────────────────┘
```

---

## Komponen yang Dibuat / Diubah

### 1. Buat `src/components/AppSwitcher.jsx`

Komponen tab switcher yang ditampilkan di dalam `AppShell`. Tampilkan tombol modul sesuai role user.

```jsx
import { useAuth } from '../AuthContext'

const TABS = {
  guru: [
    { key: 'tomat', label: 'TOMAT',   emoji: '🍅', homeScreen: 'home' },
    { key: 'blp',   label: 'BLP',     emoji: '📋', homeScreen: 'blp-home' },
    { key: 'eob5',  label: 'EOB5',    emoji: '🏫', homeScreen: 'eob5-dashboard' },
  ],
  siswa: [
    { key: 'tomat', label: 'TOMAT',   emoji: '🍅', homeScreen: 'home' },
    { key: 'blp',   label: 'BLP',     emoji: '📋', homeScreen: 'blp-home' },
  ],
}

export default function AppSwitcher({ activeModule, onSwitch }) {
  const { user } = useAuth()
  const tabs = TABS[user?.role] || TABS.siswa

  return (
    <div style={{
      display: 'flex', gap: 4, alignItems: 'center',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: 10, padding: '3px 4px',
    }}>
      {tabs.map(tab => {
        const isActive = activeModule === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onSwitch(tab)}
            style={{
              background: isActive ? 'rgba(99,102,241,0.35)' : 'transparent',
              border: isActive ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent',
              borderRadius: 8,
              padding: '5px 10px',
              color: isActive ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
              fontSize: 12,
              fontWeight: isActive ? 800 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              letterSpacing: 0.3,
            }}
          >
            {tab.emoji} {tab.label}
          </button>
        )
      })}
    </div>
  )
}
```

---

### 2. Update `src/components/AppShell.jsx`

Tambahkan `AppSwitcher` ke dalam header navbar AppShell.

Baca file `src/components/AppShell.jsx` terlebih dahulu untuk memahami strukturnya.

Yang perlu ditambahkan:
- Import `AppSwitcher`
- State `activeModule` — track modul aktif saat ini
- Deteksi modul berdasarkan `currentScreen` prop:
  - Screen dimulai dengan `'blp-'` → `'blp'`
  - Screen dimulai dengan `'eob5-'` → `'eob5'`
  - Lainnya → `'tomat'`
- Tampilkan `AppSwitcher` di tengah header (antara logo dan profil)
- Handler `onSwitch`: terima tab object, reset history ke home screen tab tersebut via prop callback

```jsx
import AppSwitcher from './AppSwitcher'

// Di dalam AppShell, tambahkan prop onSwitchModule:
export default function AppShell({ user, navigate, currentScreen, onLogout, onSwitchModule, children }) {
  
  const activeModule = currentScreen?.startsWith('blp-') ? 'blp'
    : currentScreen?.startsWith('eob5-') ? 'eob5'
    : 'tomat'

  const handleSwitch = (tab) => {
    onSwitchModule?.(tab.homeScreen)
  }

  // Di dalam JSX header — tambahkan AppSwitcher di samping/bawah logo:
  // <AppSwitcher activeModule={activeModule} onSwitch={handleSwitch} />
}
```

Tempatkan `AppSwitcher` di posisi yang tidak bentrok dengan elemen header yang sudah ada. Opsi:
- **Opsi A:** Di baris yang sama dengan logo (jika ada ruang)
- **Opsi B:** Baris kedua kecil di bawah header utama (lebih aman untuk mobile)
- Pilih yang paling sesuai dengan layout AppShell yang ada

---

### 3. Update `src/App.jsx`

Tambahkan prop `onSwitchModule` ke pemanggilan `AppShell`, dan implementasikan logika switch module.

```jsx
// Di dalam AppContent (atau fungsi render utama):

const handleSwitchModule = useCallback((homeScreen) => {
  // Reset history ke home screen modul yang dipilih
  // Gunakan navigate() yang sudah ada
  setHistory([homeScreen])
}, [])

// Pada render AppShell:
<AppShell
  user={user}
  navigate={navigate}
  currentScreen={current}
  onLogout={logout}
  onSwitchModule={handleSwitchModule}  // ← tambahkan ini
>
```

---

### 4. Update `src/screens/HomeScreen.jsx` (opsional tapi direkomendasikan)

Tambahkan section kecil di HomeScreen yang menampilkan quick-access ke BLP (untuk semua siswa) dan EOB5 (untuk guru):

```jsx
// Di bawah menu utama TOMAT, tambahkan section:
{user?.role === 'siswa' && (
  <div style={{ marginTop: 24, padding: '0 16px' }}>
    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
      APLIKASI LAIN
    </div>
    <button
      onClick={() => navigate('blp-home')}
      style={{
        width: '100%', background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12,
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer', color: '#fff', fontFamily: 'inherit', textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 24 }}>📋</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>BLP Harian</div>
        <div style={{ fontSize: 12, color: '#34d399', marginTop: 2 }}>Isi aktivitas BLP hari ini</div>
      </div>
      <span style={{ marginLeft: 'auto', color: '#34d399' }}>→</span>
    </button>
  </div>
)}

{user?.role === 'guru' && (
  <div style={{ marginTop: 24, padding: '0 16px' }}>
    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
      APLIKASI LAIN
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button onClick={() => navigate('blp-home')} style={{
        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer', color: '#fff', fontFamily: 'inherit', textAlign: 'left',
      }}>
        <span style={{ fontSize: 24 }}>📋</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>BLP Harian</div>
          <div style={{ fontSize: 12, color: '#34d399', marginTop: 2 }}>Rekap aktivitas siswa</div>
        </div>
        <span style={{ marginLeft: 'auto', color: '#34d399' }}>→</span>
      </button>
      <button onClick={() => navigate('eob5-dashboard')} style={{
        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer', color: '#fff', fontFamily: 'inherit', textAlign: 'left',
      }}>
        <span style={{ fontSize: 24 }}>🏫</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Administrasi (EOB5)</div>
          <div style={{ fontSize: 12, color: '#fbbf24', marginTop: 2 }}>Absensi, nilai, jadwal, soal AI</div>
        </div>
        <span style={{ marginLeft: 'auto', color: '#fbbf24' }}>→</span>
      </button>
    </div>
  </div>
)}
```

---

### 5. Update `RULES.md`

Tambahkan section tentang App Switcher di akhir file:

```markdown
## 19. App Switcher

- Komponen: `src/components/AppSwitcher.jsx`
- Ditampilkan di `AppShell` header untuk semua user yang sudah login
- Siswa: tab TOMAT + BLP
- Guru: tab TOMAT + BLP + EOB5
- Switch module: `setHistory([homeScreen])` — reset history ke home screen modul yang dipilih
- Palet warna per modul: TOMAT = biru-ungu, BLP = hijau, EOB5 = amber-oranye
```

---

### 6. Update `docs/planning-penggabungan-apps.md`

Ubah status di bagian atas dokumen planning:

```markdown
> Status: **Pilihan C selesai — semua 3 app tergabung dalam satu codebase**
```

Dan tambahkan section catatan implementasi di bawah:

```markdown
## Catatan Implementasi Pilihan C

| Komponen | Status | Catatan |
|----------|--------|---------|
| BLP Backend | ✅ `server/blp/` | prefix `/api/blp/*` |
| BLP Frontend | ✅ `src/screens/blp/` | entry: `blp-home` |
| EOB5 Backend Bag.1 | ✅ `server/eob5/` | absensi, guru, siswa, kelas |
| EOB5 Backend Bag.2 | ✅ `server/eob5/` | nilai, jadwal, prosem, materi, soal AI |
| EOB5 Frontend Bag.1 | ✅ `src/screens/eob5/` | dashboard, absensi, manajemen |
| EOB5 Frontend Bag.2 | ✅ `src/screens/eob5/` | nilai, jadwal, prosem, materi, soal AI |
| App Switcher | ✅ `src/components/AppSwitcher.jsx` | terintegrasi di AppShell |
| Auth Terpadu | ✅ | satu login, session shared |
| Soal AI | ✅ Groq (`GROQ_API_KEY`) | ganti Gemini |
```

---

## Aturan Wajib

- **Jangan ubah** sistem auth, login screen, atau session management TOMAT.
- **Jangan install** packages baru tanpa alasan yang jelas.
- **Semua teks dalam Bahasa Indonesia.**
- **Inline styles** — tidak ada Tailwind atau library CSS.
- AppSwitcher harus **tidak muncul** di LoginScreen atau UpdateRequiredScreen.
- Jika `user` null (belum login), AppSwitcher tidak render.

---

## Testing Akhir

Setelah semua perubahan, lakukan pengecekan:

1. **Login sebagai siswa** → HomeScreen tampil section "Aplikasi Lain" dengan tombol BLP → klik → masuk BlpHomeScreen → AppSwitcher di navbar menunjukkan tab TOMAT aktif/BLP aktif
2. **Login sebagai guru** → HomeScreen tampil section "Aplikasi Lain" dengan tombol BLP + EOB5 → klik EOB5 → masuk Eob5DashboardScreen → semua menu dashboard berfungsi
3. **Switch module via AppSwitcher** → klik tab TOMAT saat di BLP → kembali ke HomeScreen
4. **Logout** → login ulang sebagai user berbeda → tidak ada state lama yang tertinggal

---

## Kriteria Selesai

- [ ] `AppSwitcher.jsx` ada dan render tab sesuai role
- [ ] `AppShell.jsx` menampilkan AppSwitcher di header
- [ ] `App.jsx` punya `handleSwitchModule` yang reset history
- [ ] `HomeScreen.jsx` menampilkan quick-access BLP (siswa) dan BLP+EOB5 (guru)
- [ ] Switch module via AppSwitcher berfungsi tanpa crash
- [ ] AppSwitcher tidak muncul di LoginScreen
- [ ] `RULES.md` section 19 ditambahkan
- [ ] `docs/planning-penggabungan-apps.md` status diupdate
- [ ] App TOMAT masih berfungsi normal (game, duel, toko, pet, dll tidak rusak)
- [ ] Tidak ada console error saat berpindah antar modul
