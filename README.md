# SMARTISA — Platform Pembelajaran Gamifikasi

**SMARTISA** (Smart Integrated System for Academic Achievement) adalah platform pembelajaran berbasis gamifikasi yang dikembangkan untuk siswa dan guru SMP. Platform ini terdiri dari tiga modul utama:

| Modul | Pengguna | Deskripsi |
|-------|----------|-----------|
| **TOMAT** | Siswa | Aplikasi utama — game edukasi Matematika & IPA, pet, toko, duel, turnamen |
| **BLP Harian** | Siswa & Guru | Rekap aktivitas belajar harian |
| **GURU (EOB5)** | Guru | Absensi, nilai, jadwal, jurnal mengajar, soal AI |

---

## Teknologi

| Lapisan | Stack |
|---------|-------|
| Frontend | React 18 + Vite + JSX (inline styles) |
| Mobile | Capacitor 8 (Android APK) |
| Backend | Node.js + Express |
| Database | PostgreSQL via Neon (shared dengan BLP Harian) |
| Realtime | Socket.io (Duel, Turnamen, Boss Raid) |
| Auth | Session-based (express-session + connect-pg-simple) |
| Push Notif | Web Push API + VAPID |

---

## Struktur Direktori

```
smartisa-web/
├── src/
│   ├── screens/          # Layar utama (Home, Profile, Shop, dll.)
│   ├── minigames/        # 100+ game edukasi (Matematika & IPA kelas 7–9)
│   ├── components/       # Komponen reusable (shared.jsx, AppShell, dll.)
│   ├── App.jsx           # Router utama + state global
│   ├── AuthContext.jsx   # Session auth
│   ├── PlayerContext.jsx # Koin, XP, level siswa
│   ├── PetContext.jsx    # Status pet (lapar, mati, skin)
│   ├── nativePatch.js    # Capacitor fetch/XHR intercept ke server produksi
│   └── version.js        # Versi app (sync dengan build.gradle)
├── server/               # Express API + Socket.io
│   ├── index.js          # Entry point server
│   ├── schema.js         # ensureSchema() — auto-migrasi saat startup
│   ├── boss-state.js     # State Boss Raid (in-memory)
│   └── tournament-questions.js
├── android/              # Capacitor Android project
│   └── app/src/main/
│       ├── AndroidManifest.xml
│       └── res/xml/network_security_config.xml
├── ipa-prompts/          # Prompt desain game IPA (00–13)
├── bundles/              # Bundle OTA hasil build
└── capacitor.config.json
```

---

## Fitur Utama

### 🎮 Game Edukasi
- **Matematika Kelas 7–9**: ±89 minigame (Bilangan, Aljabar, Geometri, Statistika, Peluang)
- **IPA Kelas 7–9**: ±80+ minigame (Biologi, Fisika, Kimia — sistem organ, gerak, cahaya, dll.)
- Setiap game: 10 soal diacak, reward 15 koin + 10 XP per jawaban benar

### 🐾 Sistem Pet
- 4 jenis pet: **Tomi** (marmot), **Kelinsay** (kelinci), **Monyong** (monyet), **Nananaga** (naga)
- Mekanik lapar, mati, revive (300 koin), skin dengan bonus (coinMult / expMult / wrongImmunity)
- Skin Nananaga: perisai imunitas jawaban salah di Duel/Turnamen

### ⚔️ Kompetisi Real-time
- **Duel 1v1**: Socket.io, soal sinkron, slider jawaban
- **Turnamen**: Bracket otomatis, podium top-3
- **Boss Raid**: Kooperatif kelas — guru buat boss, siswa serang bersama

### 💬 Komunikasi
- Private chat siswa ↔ guru (dalam kelas yang sama)
- Forum kelas
- Notifikasi in-app + Web Push

### 🎓 Fitur Guru
- Dashboard: kelas, nilai, absensi, jadwal
- Tugas: assign minigame spesifik ke kelas
- Mode Mengajar: tampilan full-screen untuk proyektor
- Hafalan interaktif: flash card × kuis mandiri perkalian/pembagian

---

## Menjalankan Lokal

```bash
# Install dependensi
pnpm install

# Development (web)
npm run dev

# Build production
npm run build

# Sync ke Android (setelah build)
npx cap sync android
```

### Environment Variables (Secrets)

| Key | Keterangan |
|-----|-----------|
| `NEON_DATABASE_URL` | Connection string PostgreSQL Neon |
| `SESSION_SECRET` | Secret untuk express-session |
| `VAPID_PUBLIC_KEY` | Web Push public key |
| `VAPID_PRIVATE_KEY` | Web Push private key |
| `GROQ_API_KEY` | AI soal otomatis (modul GURU) |

Schema database dibuat otomatis oleh `ensureSchema()` saat server pertama kali start — tidak perlu migration manual.

---

## Konvensi Game Baru

Setiap minigame mengikuti pola:

```jsx
import { usePlayer } from '../PlayerContext'
import { useSurvival } from '../difficulty'
import { TopBar, PlayerHeader, Card, FeedbackBanner } from '../components/shared'

export default function NamaGame({ onBack }) {
  const { addCoins, addExp } = usePlayer()
  useSurvival()
  // 10 soal diacak, auto-next 1300ms, addCoins(15) + addExp(10) hanya saat benar
}
```

Daftarkan di `src/App.jsx`:
```js
namaKey: { name: 'Nama Game', emoji: '🎮', Component: React.lazy(() => import('./minigames/NamaGame')) },
```

Panduan lengkap per bab ada di `ipa-prompts/` (00–13).

---

## Deployment

App di-deploy ke Coolify dengan tiga service terpisah:

| Service | URL |
|---------|-----|
| TOMAT | `https://y4e6icv3cej4ax65idvhusde.157.10.161.229.sslip.io` |
| BLP Harian | `https://nswzqjz1jnr821kuh3s9aji1.157.10.161.229.sslip.io` |
| GURU (EOB5) | `https://sfptjjfqgqidt4736qzont0l.157.10.161.229.sslip.io` |

APK Android dibangun dari Android Studio menggunakan `android/` project Capacitor.

---

## Versi

Saat ini: **v1.4.5**

Bump versi: edit `src/version.js` **dan** `android/app/build.gradle` secara bersamaan.  
What's New modal tampil otomatis sekali per versi via localStorage.

---

## Tim

Dikembangkan oleh **AI Studio** untuk ekosistem pendidikan SMARTISA.
