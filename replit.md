# SMARTISA – Platform Pembelajaran TISA

Platform pembelajaran resmi guru dan siswa SMP TISA Islamic School.
Terdiri dari tiga modul: **TOMAT** (belajar siswa), **BLP** (jurnal harian), dan **GURU** (administrasi guru).

## Stack
- React 18 + Vite
- Vanilla CSS-in-JS (inline styles)
- No external UI library

## How to Run
```
npm run dev
```
Runs on port 5000.

## Project Structure
```
src/
  App.jsx              # Router (history stack)
  PlayerContext.jsx    # Global player state (coins, level, EXP)
  components/
    shared.jsx         # Reusable UI components
  screens/
    HomeScreen.jsx     # Landing / zone picker
    Grade7ZoneScreen.jsx
    Grade8ZoneScreen.jsx
    Grade9ZoneScreen.jsx
  minigames/
    SubmarineGame.jsx       # Kelas 7: Bilangan Bulat (slider)
    LabKimiaGame.jsx        # Kelas 7: Pecahan & Persen (mixing)
    ArsitekGame.jsx         # Kelas 7: Skala Peta (pilihan ganda)
    JembatanGame.jsx        # Kelas 8: Pola Bilangan (pilihan ganda)
    PabrikSenjataGame.jsx   # Kelas 8: Fungsi f(x) (input angka)
    PemanahGame.jsx         # Kelas 8: Gradien (slider)
    PasarBarterGame.jsx     # Kelas 8: Persamaan Simultan (pilihan)
    SortirKargoGame.jsx     # Kelas 9: Aljabar (pilihan ganda)
    WormholeGame.jsx        # Kelas 9: Bentuk Akar (pilihan ganda)
    HologramGame.jsx        # Kelas 9: Kesebangunan (pilihan ganda)
    ShieldGame.jsx          # Kelas 9: Lingkaran (slider)
```

## Original Project
Converted from Android (Kotlin/Jetpack Compose) exported from Google AI Studio.
Original app name: TOMAT — Tantangan Otak MATematika.

## User Preferences
- Keep Indonesian language for all in-game text.
