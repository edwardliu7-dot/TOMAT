---
name: TOMAT landscape router
description: Central landscape screen routing + 11 landscape screen components for mobile landscape mode
---

## Cara kerja
- Hook `src/hooks/useLandscapeMobile.js` → `true` saat `innerWidth > innerHeight && width >= 620 && width < 1024`
- Di `PlayerExperience` (App.jsx): `const isLandscapeMobile = useLandscapeMobile()`
- Di `renderScreen()`: jika `isLandscapeMobile && !guruMode && user?.role === 'siswa'` → lookup `landscapeMap[current]` dan return landscape component
- Rute `arena` ditambahkan ke SCREEN_TITLES dan ditangani di `renderScreen()` (sebelum GAME_ROUTES check)

## Landscape components (src/screens/landscape/)
- LandscapeArena, LandscapeNilaiTugas, LandscapeLeaderboard, LandscapeZonaMap, LandscapeZonaIPA
- LandscapeLencana, LandscapeProfil, LandscapeChat, LandscapeHafalan, LandscapeLatihanUjian, LandscapeTokoScreen

## Pitfalls
- **Tidak ada CoinContext** — coins berasal dari `usePlayer()` → `player.coins`
- **Tidak ada src/contexts/** — semua context di src root: `../../AuthContext`, `../../TaskContext`, `../../PlayerContext`
- **Soal latihan ujian** ada di `src/data/soalUjian.js`, export `PAKET_UJIAN`; format `{ questions:[{soal,options:[{label,value}],answer}] }`; perlu normalise ke `{ soal:[{q,opts,ans}] }`
- **Vite tidak support require()** — pakai `import('../../data/soalUjian')` (dynamic import)
- Game routes (GAME_ROUTES) melewati landscape router karena ditangani lebih awal di renderScreen()

**Why:** landscape router terpusat di satu tempat (App.jsx) agar tidak perlu modif setiap screen individual; mudah disable/extend tanpa menyentuh 14 file berbeda.
