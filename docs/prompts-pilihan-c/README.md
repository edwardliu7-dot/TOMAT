# Seri Prompt Pilihan C — Penggabungan TOMAT + BLP + EOB5

> Dibuat: 1 Agustus 2026  
> Target: satu aplikasi, satu login, tiga modul

---

## Cara Pakai

Setiap file prompt di folder ini dirancang untuk dikerjakan oleh **satu Replit Agent dalam satu sesi** (estimasi ~1–3 jam per prompt, sesuai limit harian tier gratis).

**Urutan wajib:**

| # | File | Isi | Prasyarat |
|---|------|-----|-----------|
| 00 | `00-audit-dan-persiapan.md` | Clone repo BLP+EOB5, audit, scaffold direktori | — |
| 01 | `01-blp-backend.md` | Port semua backend BLP → `server/blp/` | 00 |
| 02 | `02-blp-frontend.md` | Port semua frontend BLP → `src/screens/blp/` | 00, 01 |
| 03 | `03-eob5-backend-bagian1.md` | Backend EOB5: absensi, guru, siswa, kelas | 00 |
| 04 | `04-eob5-backend-bagian2.md` | Backend EOB5: nilai, jadwal, prosem, materi, soal AI, rekap, inbox | 00, 03 |
| 05 | `05-eob5-frontend-bagian1.md` | Frontend EOB5: dashboard, absensi, manajemen siswa | 00, 03 |
| 06 | `06-eob5-frontend-bagian2.md` | Frontend EOB5: nilai, jadwal, prosem, materi, soal AI, rekap, inbox | 00, 04, 05 |
| 07 | `07-app-switcher.md` | App Switcher, HomeScreen quick-access, update RULES.md | 00–06 |

**Cara mulai setiap prompt:**
1. Buka Replit Agent baru
2. Copy-paste **seluruh isi** file prompt yang sesuai sebagai pesan pertama
3. Biarkan agent bekerja sampai semua Kriteria Selesai di-checklist
4. Verifikasi app masih berjalan: `npm run dev`
5. Lanjut ke prompt berikutnya

---

## Yang Boleh Paralel (tanpa konflik file)

Setelah Prompt 00 selesai, **Prompt 01–02 (BLP)** dan **Prompt 03 (EOB5 Backend Bag.1)** bisa dikerjakan paralel oleh dua agent berbeda karena menyentuh file yang berbeda:
- Prompt 01 & 02 menyentuh: `server/blp/`, `src/screens/blp/`, `src/App.jsx`
- Prompt 03 menyentuh: `server/eob5/`, `server/schema.js`, `server/index.js`

Namun **hati-hati**: jika dua agent mengedit `server/index.js` atau `src/App.jsx` bersamaan, akan terjadi konflik. Lebih aman dikerjakan berurutan.

---

## Environment Variables yang Dibutuhkan

| Key | Sudah Ada | Dipakai Oleh |
|-----|-----------|-------------|
| `NEON_DATABASE_URL` | ✅ | Semua server routes |
| `SESSION_SECRET` | ✅ | Express session |
| `GROQ_API_KEY` | ✅ | Prompt 04 — soal-otomatis |
| `VAPID_PUBLIC_KEY` | ✅ | Push notifications TOMAT |
| `VAPID_PRIVATE_KEY` | ✅ | Push notifications TOMAT |

Tidak ada env var tambahan yang dibutuhkan. Groq menggantikan Gemini yang ada di EOB5 asli.

---

## Apa yang TIDAK diubah oleh seri prompt ini

- Login/auth system TOMAT (tetap di `server/auth.js`, `src/AuthContext.jsx`)
- Semua game Matematika TOMAT (Grade 7/8/9)
- Sistem multiplayer (duel, turnamen, boss raid)
- Sistem pet, toko, koin, EXP
- Chat/komunikasi TOMAT
- Database schema TOMAT yang sudah ada (hanya menambah tabel baru)

---

## Catatan Teknis Penting

### Stack Mismatch
BLP dan EOB5 aslinya TypeScript. Semua kode yang diport ke TOMAT **harus dikonversi ke JavaScript** (plain JSX/JS, bukan TSX/TS) karena:
- Tailwind → inline styles
- ShadCN/Radix UI → komponen native dengan inline styles
- Drizzle ORM → raw `pool.query()`
- Type annotations → dihapus semua

### Prefix Tabel Database
- Tabel baru BLP: prefix `blp_`
- Tabel baru EOB5: prefix `eob5_`
- Tabel TOMAT existing (`gurus`, `students`, `nilai`, dll): jangan diubah

### Navigasi
TOMAT tidak pakai React Router. Semua navigasi via history stack di `App.jsx`. Setiap screen baru harus didaftarkan di `App.jsx` dengan format:
```jsx
if (current === 'nama-screen') return <NamaScreen navigate={navigate} goBack={goBack} />
```
