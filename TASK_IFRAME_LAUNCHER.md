# Task: Ganti External Link dengan Iframe Launcher untuk BLP & GURU (EOB5)

## Konteks
TOMAT adalah app utama (React + Vite + Express, berjalan di port 5000).
Modul **BLP Harian** dan **GURU (EOB5)** sudah dihapus dari kodebase TOMAT karena terlalu banyak bug.
Keduanya berjalan sebagai **aplikasi terpisah** di server produksi.

**URL Produksi:**
- GURU (EOB5): `https://sfptjjfqgqidt4736qzont0l.157.10.161.229.sslip.io`
- BLP Harian:  `https://nswzqjz1jnr821kuh3s9aji1.157.10.161.229.sslip.io`

## Tujuan
Saat user menekan tombol GURU atau BLP di AppSwitcher / HomeScreen, **jangan buka tab baru**.
Sebaliknya, **tampilkan konten dari URL tersebut langsung di dalam TOMAT** menggunakan `<iframe>` fullscreen.
Konsepnya: TOMAT berperan sebagai PWA shell / native webview wrapper.

## Yang Harus Dibuat

### 1. Komponen Baru: `src/components/IframeAppShell.jsx`

Komponen fullscreen iframe yang:
- Mengambil `src` (URL) dan `title` sebagai props
- Menampilkan iframe `width: 100%, height: 100dvh` tanpa border
- Menampilkan **loading state** (spinner/bar) saat iframe pertama kali load (`onLoad`)
- Menampilkan **error state** jika iframe gagal load (gunakan `onError` + timeout fallback)
- Memiliki **tombol kembali ke TOMAT** (fixed/overlay di pojok atas kiri) agar user bisa balik
- Tombol kembali memanggil `onBack` prop
- Pada mobile, harus memperhitungkan safe-area-inset (notch)

```jsx
// Struktur kasar:
export default function IframeAppShell({ src, title, onBack }) {
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: '#000' }}>
      {/* Tombol balik — overlay tipis di atas iframe */}
      <div style={{ position: 'absolute', top: 'env(safe-area-inset-top, 0px)', left: 0, zIndex: 10, padding: 8 }}>
        <button onClick={onBack} style={{ /* style minimalis */ }}>← TOMAT</button>
      </div>

      {/* Loading indicator */}
      {loading && <LoadingBar />}

      {/* Error fallback */}
      {error && <ErrorState src={src} onBack={onBack} />}

      {/* Iframe utama */}
      <iframe
        src={src}
        title={title}
        style={{ width: '100%', height: '100%', border: 'none', display: error ? 'none' : 'block' }}
        allow="camera; microphone; geolocation; payment"
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true) }}
      />
    </div>
  )
}
```

**Catatan penting tentang X-Frame-Options:**
Kemungkinan besar server GURU/BLP tidak mengizinkan iframe dari origin lain (header `X-Frame-Options: SAMEORIGIN` atau CSP `frame-ancestors`). Jika terjadi, iframe akan blank/error.

**Solusi jika iframe diblokir:**
- Cek dulu dengan fetch apakah ada header `X-Frame-Options` atau `Content-Security-Policy: frame-ancestors`
- Jika diblokir → tampilkan **halaman intermediate** yang cantik dengan:
  - Logo/nama app (GURU atau BLP)
  - Deskripsi singkat
  - Tombol "**Buka Aplikasi**" yang buka di tab baru (`window.open`)
  - Info bahwa app berjalan terpisah karena alasan keamanan
- Jika TIDAK diblokir → langsung tampilkan iframe

### 2. Routing di `src/App.jsx`

Tambahkan state untuk tracking iframe app yang aktif:

```jsx
// Di dalam App() / PlayerExperience()
const [iframeApp, setIframeApp] = useState(null) // { src, title } | null
```

Ketika `iframeApp !== null`, render `IframeAppShell` di atas segalanya:

```jsx
{iframeApp && (
  <IframeAppShell
    src={iframeApp.src}
    title={iframeApp.title}
    onBack={() => setIframeApp(null)}
  />
)}
```

### 3. Update `src/components/AppSwitcher.jsx`

Saat ini tab GURU dan BLP memanggil `window.open(url, '_blank')`.
Ubah agar memanggil callback `onOpenApp(tab)` yang diteruskan dari AppShell → App.

```jsx
// AppSwitcher menerima prop tambahan: onOpenApp
export default function AppSwitcher({ activeModule, onSwitch, onOpenApp }) {
  // ...
  onClick={() => tab.externalUrl
    ? onOpenApp?.({ src: tab.externalUrl, title: tab.label })
    : onSwitch(tab)
  }
}
```

### 4. Update `src/components/AppShell.jsx`

AppShell perlu meneruskan `onOpenApp` ke AppSwitcher:

```jsx
export default function AppShell({ ..., onOpenApp }) {
  // Teruskan ke AppSwitcher di mobile header dan desktop floating bar
  <AppSwitcher activeModule={activeModule} onSwitch={handleSwitch} onOpenApp={onOpenApp} />
}
```

### 5. Update `src/App.jsx` — guru dan siswa render

Buat `openIframeApp` callback dan teruskan ke AppShell:

```jsx
const [iframeApp, setIframeApp] = useState(null)
const openIframeApp = useCallback(({ src, title }) => setIframeApp({ src, title }), [])

// Di render guru:
<AppShell ... onOpenApp={openIframeApp}>

// Di render siswa (PlayerExperience):
<AppShell ... onOpenApp={openIframeApp}>

// Overlay iframe (di luar AppShell, di level App):
{iframeApp && <IframeAppShell src={iframeApp.src} title={iframeApp.title} onBack={() => setIframeApp(null)} />}
```

### 6. Update `src/screens/HomeScreen.jsx`

Tombol BLP dan GURU di HomeScreen saat ini memanggil `window.open(...)`.
Ubah agar memanggil prop baru `onOpenApp`:

```jsx
// HomeScreen menerima prop onOpenApp
export default function HomeScreen({ navigate, goBack, guruMode, onExitGuruMode, onOpenApp, ... }) {
  // Tombol BLP:
  onClick={() => onOpenApp?.({ src: 'https://nswzqjz1...sslip.io', title: 'BLP Harian' })}

  // Tombol GURU:
  onClick={() => onOpenApp?.({ src: 'https://sfptjjfq...sslip.io', title: 'GURU (EOB5)' })}
}
```

Di App.jsx, teruskan `onOpenApp` saat merender HomeScreen:
```jsx
<HomeScreen ... onOpenApp={openIframeApp} />
```

## Checklist Implementasi

- [ ] Buat `src/components/IframeAppShell.jsx` dengan loading state, error state, tombol back
- [ ] Deteksi X-Frame-Options — jika diblokir tampilkan intermediate page, bukan iframe kosong
- [ ] Tambah `iframeApp` state di `App()` komponen utama
- [ ] Render `<IframeAppShell>` sebagai overlay level teratas saat `iframeApp !== null`
- [ ] Update `AppSwitcher.jsx` — prop `onOpenApp`, hapus `window.open`
- [ ] Update `AppShell.jsx` — teruskan `onOpenApp` ke AppSwitcher
- [ ] Update `App.jsx` — buat `openIframeApp` callback, teruskan ke AppShell dan HomeScreen
- [ ] Update `HomeScreen.jsx` — prop `onOpenApp`, hapus `window.open`
- [ ] Pastikan iframe fullscreen di mobile (safe-area, no-scroll pada parent)
- [ ] Tombol "← TOMAT" selalu visible di atas iframe (z-index tinggi)
- [ ] Test: apakah GURU dan BLP URL mengizinkan iframing?

## URLs untuk Referensi (dari `.agents/memory/smartisa-server-urls.md`)
```
GURU (EOB5): https://sfptjjfqgqidt4736qzont0l.157.10.161.229.sslip.io
BLP Harian:  https://nswzqjz1jnr821kuh3s9aji1.157.10.161.229.sslip.io
TOMAT:       https://y4e6icv3cej4ax65idvhusde.157.10.161.229.sslip.io
```

## File-file yang Relevan
```
src/App.jsx                      — routing utama, state iframeApp
src/components/AppShell.jsx      — wrapper dengan AppSwitcher
src/components/AppSwitcher.jsx   — tab GURU/BLP/TOMAT
src/screens/HomeScreen.jsx       — quick-launch buttons
src/components/IframeAppShell.jsx — BARU, dibuat dari awal
```

## Catatan Teknis
- Jangan tambahkan server route baru untuk proxy — langsung iframe ke URL produksi
- Jangan buka tab baru kecuali sebagai fallback jika iframe diblokir
- Pertahankan tombol back agar user bisa kembali ke TOMAT kapan saja
- Z-index `IframeAppShell` harus > semua komponen lain (gunakan 9000+)
