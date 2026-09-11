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
| Frontend | React 18.3 + Vite 5 + JSX (Tailwind CSS 4.3) |
| Mobile | Capacitor 8.4 (Android APK) |
| Backend | Node.js 20+ + Express 5 |
| Database | PostgreSQL via Neon (shared dengan BLP Harian & EOB5) |
| Realtime | Socket.io 4.8 (Duel, Turnamen, Boss Raid) |
| Auth | Session-based (express-session + connect-pg-simple) |
| Push Notif | Web Push API + VAPID |
| Document | PDF (jsPDF + pdfkit), Excel (ExcelJS), Word (docx) |
| AI | Groq API (soal otomatis) |

---

## Struktur Direktori

```
TOMAT/
├── src/
│   ├── screens/          # Layar utama (Home, Profile, Shop, BLP, EOB5, dll.)
│   │   ├── blp/          # Modul BLP Harian (rekap aktivitas belajar)
│   │   └── eob5/         # Modul GURU (absensi, nilai, jadwal, soal AI)
│   ├── minigames/        # 100+ game edukasi (Matematika & IPA kelas 7–9)
│   ├── components/       # Komponen reusable (shared.jsx, AppShell, dll.)
│   ├── App.jsx           # Router utama + state global
│   ├── AuthContext.jsx   # Session auth
│   ├── PlayerContext.jsx # Koin, XP, level siswa
│   ├── PetContext.jsx    # Status pet (lapar, mati, skin)
│   ├── version.js        # Versi app (v1.5.6)
│   ├── nativePatch.js    # Capacitor fetch/XHR intercept ke server produksi
│   └── difficulty.js     # Sistem survival (kesulitan game)
├── server/               # Express API + Socket.io
│   ├── index.js          # Entry point server
│   ├── auth.js           # Autentikasi TOMAT
│   ├── schema.js         # ensureSchema() — auto-migrasi saat startup
│   ├── boss-state.js     # State Boss Raid (in-memory)
│   ├── tournament-questions.js
│   ├── blp/              # Routes & API BLP Harian
│   │   ├── index.js
│   │   ├── activities.js
│   │   └── exports.js
│   └── eob5/             # Routes & API GURU (EOB5)
│       ├── index.js
│       ├── absensi.js
│       ├── nilai.js
│       ├── jadwal.js
│       ├── soal-ai.js
│       └── rekap.js
├── scripts/              # Build & deployment scripts
│   ├── postbuild.js      # Post-build processing
│   └── set-server-url.js # Script untuk set URL server Capacitor
├── android/              # Capacitor Android project
│   └── app/src/main/
│       ├── AndroidManifest.xml
│       └── res/xml/network_security_config.xml
├── artifacts/            # Sandbox & mockup environment
│   └── mockup-sandbox/   # UI preview & testing
├── docs/                 # Dokumentasi
│   └── prompts-pilihan-c/ # Panduan merger BLP + EOB5 → TOMAT
├── ipa-prompts/          # Prompt desain game IPA (00–13)
├── bundles/              # Bundle OTA hasil build
├── package.json          # Dependencies (v1.5.6)
├── capacitor.config.json
└── vite.config.js
```

---

## Fitur Utama

### 🎮 Game Edukasi
- **Matematika Kelas 7–9**: ±89 minigame (Bilangan, Aljabar, Geometri, Statistika, Peluang)
- **IPA Kelas 7–9**: ±80+ minigame (Biologi, Fisika, Kimia — sistem organ, gerak, cahaya, dll.)
- Setiap game: 10 soal diacak, reward 15 koin + 10 XP per jawaban benar
- Sistem kesulitan adaptif dengan `useSurvival()`

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

### 📊 Modul BLP Harian
- Rekap aktivitas belajar siswa per hari
- Dashboard kelas untuk guru
- Export laporan (PDF, Excel, Word)

### 🎓 Modul GURU (EOB5)
- **Dashboard**: kelas, nilai, absensi, jadwal, prosem, materi
- **Absensi**: input & verifikasi absensi siswa
- **Nilai**: input nilai, tracking progress siswa
- **Jadwal**: manajemen jadwal pelajaran & aktivitas
- **Soal AI**: pembuatan soal otomatis dengan Groq API
- **Hafalan**: flash card × kuis mandiri perkalian/pembagian
- **Rekap Pembelajaran**: laporan komprehensif per siswa/kelas
- **Inbox**: komunikasi siswa ↔ guru

---

## Menjalankan Lokal

```bash
# Install dependensi
pnpm install

# Development (web + server)
npm run dev

# Build production
npm run build

# Sync ke Android (setelah build)
npm run cap:sync

# Buka Android Studio
npm run cap:open

# Set server URL untuk Capacitor
npm run cap:set-url
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

## Versi & Changelog

Saat ini: **v1.5.6**

### Update Terakhir (v1.5.6)
- ✅ Upgrade React 18.3, Vite 5, Express 5
- ✅ Tambah support export PDF/Excel/Word
- ✅ Integrasi Groq API untuk pembuatan soal AI
- ✅ Improve CSS dengan Tailwind 4.3
- ✅ Tambah scripts untuk deployment Capacitor
- ✅ Mulai integrasi modul BLP Harian
- ✅ Mulai integrasi modul GURU (EOB5)

Bump versi: edit `src/version.js` **dan** `android/app/build.gradle` secara bersamaan.  
What's New modal tampil otomatis sekali per versi via localStorage.

---

## Integrasi Modul (In Progress)

Roadmap integrasi BLP Harian + EOB5 ke dalam TOMAT:

| Phase | Status | File Referensi |
|-------|--------|----------------|
| Audit & Setup | ✅ | `docs/prompts-pilihan-c/00-audit-dan-persiapan.md` |
| BLP Backend | 🔄 | `docs/prompts-pilihan-c/01-blp-backend.md` |
| BLP Frontend | 🔄 | `docs/prompts-pilihan-c/02-blp-frontend.md` |
| EOB5 Backend P.1 | 🔄 | `docs/prompts-pilihan-c/03-eob5-backend-bagian1.md` |
| EOB5 Backend P.2 | 🔄 | `docs/prompts-pilihan-c/04-eob5-backend-bagian2.md` |
| EOB5 Frontend P.1 | 🔄 | `docs/prompts-pilihan-c/05-eob5-frontend-bagian1.md` |
| EOB5 Frontend P.2 | 🔄 | `docs/prompts-pilihan-c/06-eob5-frontend-bagian2.md` |
| App Switcher | ⏳ | `docs/prompts-pilihan-c/07-app-switcher.md` |
| OTA Update | ⏳ | `docs/prompts-pilihan-c/08-ota-update.md` |

Panduan lengkap ada di `docs/prompts-pilihan-c/README.md`.

---

## Tim

Dikembangkan oleh **AI Studio** untuk ekosistem pendidikan SMARTISA.

Last Updated: September 2026
