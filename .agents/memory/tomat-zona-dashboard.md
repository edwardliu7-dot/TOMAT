---
name: TOMAT ZonaDashboard
description: New 3-column dashboard replacing the old MobileLandscapeDashboard; universal for desktop + mobile
---

## Layout
- **Top bar**: avatar+nama (kiri), XP bar (tengah), koin+ikon (kanan)
- **3 kolom**: kiri=tugas aktif+quicklinks, tengah=pet+nav bar, kanan=3 pintu (Matematika/IPA/Arena)
- **Wallpaper**: `/wallpaper-dashboard.png` center 72% / cover + dark wash overlay
- **Responsive**: desktop (≥1024px) wider cols, portrait mobile stacks vertically

## Key decisions
- `FloatingPet` DIHAPUS dari App.jsx render — pet hanya di dashboard stage
- `HomeScreen.jsx`: kondisi lama `!isDesktop && !guruMode && user?.role === 'siswa'` → sekarang `!guruMode && user?.role === 'siswa'` (semua device)
- `openArena` navigates ke `'arena'` (bukan 'moba-lobby'), semua user bisa masuk
- `RotateDevice` component dihapus dari MobileLandscapeDashboard (tidak ada lagi landscape-only guard)
- `SeasonalEventBanner` ditambahkan di zona kiri atas task card

**Why:** user minta dashboard baru terpasang di desktop maupun mobile; mockup ZonaDashboard (3-kolom) adalah referensinya.

## Files
- `src/components/MobileLandscapeDashboard.jsx` — sepenuhnya ditulis ulang
- `src/screens/HomeScreen.jsx` — hapus `!isDesktop` dari kondisi siswa
- `src/App.jsx` — FloatingPet render dihapus (import tetap ada)
