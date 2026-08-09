---
name: SMARTISA rebrand
description: Platform resmi berganti nama dari TOMAT ke SMARTISA per 1 Agustus 2026; sub-modul dan internal route keys tetap.
---

# SMARTISA Rebrand

**Rule:** Platform sekarang bernama SMARTISA. Semua branding tampilan harus menggunakan SMARTISA, bukan TOMAT sebagai nama platform.

**Why:** Rebranding resmi per 1 Agustus 2026 oleh pihak sekolah.

**How to apply:**
- Nama platform di judul halaman, splash, login, manifest → SMARTISA
- Sub-modul tetap bernama TOMAT (siswa), BLP (jurnal), GURU (admin guru)
- Internal route keys tetap `eob5-*` — jangan diubah (merubah route key akan break navigation history)
- Label tampilan di AppSwitcher untuk modul guru admin: "GURU" (bukan EOB5)
- Logo: `/public/logo-smartisa.png` dan `src/assets/logo.png` — keduanya file yang sama
- `document.title` format: `[Nama Layar] — SMARTISA`
- Tagline: "Platform Pembelajaran Resmi TISA" (bukan "Tantangan Otak Mendidik Anak TISA" untuk level platform)
- "Tantangan Otak Mendidik Anak TISA" masih valid sebagai tagline sub-modul TOMAT
