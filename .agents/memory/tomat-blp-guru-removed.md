---
name: BLP dan GURU dihapus dari TOMAT
description: Modul BLP Harian dan GuruEOB5 tidak lagi embedded di TOMAT; semua akses via link eksternal ke app produksi terpisah.
---

## Rule
BLP Harian dan GURU (EOB5) kini adalah aplikasi terpisah yang berjalan di URL produksi sendiri. TOMAT hanya membuka link ke sana — tidak ada screen/route/server yang embedded lagi.

## URLs
- GURU (EOB5): `https://sfptjjfqgqidt4736qzont0l.157.10.161.229.sslip.io`
- BLP Harian:  `https://nswzqjz1jnr821kuh3s9aji1.157.10.161.229.sslip.io`

## Yang sudah dihapus
- `server/eob5/` — semua router GuruEOB5 (33 file)
- `server/blp/` — semua router BLP (8 file)
- `src/screens/eob5/` dan `src/screens/blp/` — semua screen
- `src/components/eob5/` dan `src/components/blp/` — Eob5Layout, BlpLayout, sidebar
- `src/contexts/BlpDataContext.jsx`
- Semua `import` dan routing di `src/App.jsx`
- Route registrations di `server/index.js`

## Yang diubah
- `src/components/AppSwitcher.jsx` — tab GURU dan BLP kini pakai `externalUrl`, buka tab baru
- `src/screens/HomeScreen.jsx` — quick-launch buttons pakai `window.open` ke URL produksi
- `src/App.jsx` — guru render hanya GuruDashboardScreen, tanpa guruHistory/BlpDataProvider/Eob5Layout

**Why:** Terlalu banyak bug di embedded module; keputusan arsitektur untuk biarkan setiap app jalan mandiri.

**How to apply:** Jika ada permintaan "tambahkan fitur BLP di TOMAT" atau "perbaiki guru EOB5" — arahkan ke repo app masing-masing, BUKAN ke TOMAT ini.
