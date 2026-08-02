# Dependensi Baru yang Dibutuhkan

## Dari BLP

| Package | Alasan Dibutuhkan | Alternatif di TOMAT? |
|---------|------------------|--------------------|
| `date-fns` | Kalkulasi tanggal (BLP periods, rekap harian, Asia/Jakarta timezone) | Tidak ada — hanya `Date` native |
| `exceljs` | Export laporan BLP ke file Excel | Tidak ada |
| `jspdf` | Export laporan BLP ke PDF | Tidak ada |
| `jspdf-autotable` | Plugin tabel untuk jspdf | Tidak ada |
| `xlsx` | Parse/write file Excel (format .xlsx/.xls) | Tidak ada |

**Tidak perlu dari BLP:**
- `lucide-react` → TOMAT pakai icon inline SVG / emoji
- `motion` (framer-motion) → animasi bisa pakai CSS transition
- `clsx`, `tailwind-merge` → TOMAT pakai inline styles, tidak butuh class utility
- `@google/genai` → BLP belum aktif menggunakannya; TOMAT sudah punya `GROQ_API_KEY`

## Dari EOB5

| Package | Alasan Dibutuhkan |
|---------|-----------------|
| `groq-sdk` | AI generation soal otomatis & modul ajar (sudah punya `GROQ_API_KEY`) |
| `docx` | Generate file Word (.docx) untuk download soal & modul ajar |
| `pdf-parse` | Parse isi PDF jadwal pelajaran (import jadwal otomatis) |
| `pdfkit` | Generate file PDF untuk rekap/export |
| `mammoth` | Parse/convert file Word (.docx) yang diupload guru |

**Tidak perlu dari EOB5:**
- `drizzle-orm` → akan dikonversi ke `pool.query` biasa (TOMAT pakai `pg` langsung)
- `tailwindcss`, `@tailwindcss/vite` → TOMAT pakai inline styles
- Semua `@radix-ui/*` → bagian dari ShadCN, TOMAT pakai inline styles
- `@tanstack/react-query` → TOMAT pakai `fetch` + `useState` langsung
- `wouter` → TOMAT pakai navigation stack custom di `App.jsx`
- `react-hook-form`, `zod` → TOMAT pakai controlled components biasa
- `recharts` → grafik bisa dibuat dengan inline styles sederhana
- `@uppy/*` → upload file akan diganti dengan `<input type="file">` + `FormData` sederhana
- `class-variance-authority` → tidak dibutuhkan tanpa ShadCN
- `pino`, `pino-http` → logging production; TOMAT pakai `console.log`
- `google-auth-library` → tidak dipakai aktif di versi yang akan dimerge
- `connect-pg-simple` → **sudah ada di TOMAT**
- `bcryptjs` → **sudah ada di TOMAT**
- `cors`, `cookie-parser` → tidak dibutuhkan karena TOMAT same-origin

## Yang TIDAK perlu diinstall

- **Tailwind CSS** → TOMAT pakai inline styles
- **ShadCN/ui & Radix UI** → TOMAT pakai inline styles
- **Drizzle ORM** → akan dikonversi ke `pool.query` biasa
- **Auth libraries EOB5/BLP** → akan pakai auth TOMAT yang sudah ada
- **Wouter / React Router** → TOMAT pakai navigation stack custom
- **React Query / TanStack Query** → TOMAT pakai fetch langsung
- **Pino logging** → TOMAT pakai console.log
- **Uppy (file upload)** → disederhanakan ke input file + FormData

## Packages yang perlu diinstall sekarang

```bash
# Utilitas data & export (dari BLP)
pnpm add date-fns exceljs jspdf jspdf-autotable xlsx

# AI & document generation (dari EOB5)
pnpm add groq-sdk docx pdf-parse pdfkit mammoth
```

**Estimasi total:** 9 packages baru. Tidak ada konflik dengan dependensi TOMAT yang sudah ada.

**Catatan:** `date-fns` sudah dipakai BLP untuk kalkulasi tanggal Jakarta — versi 4.x kompatibel dengan Node 20+.
`groq-sdk` menggunakan `GROQ_API_KEY` yang sudah tersedia sebagai secret di TOMAT.
