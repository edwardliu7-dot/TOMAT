---
name: SMARTISA production server URLs
description: URL produksi resmi masing-masing modul SMARTISA
---

## Server URLs (Production)

| Modul | URL |
|-------|-----|
| TOMAT (siswa) | `https://smartisa.app.tisaislamic.sch.id` |
| GURU (EOB5)   | `https://guru.app.tisaislamic.sch.id` |
| BLP Harian    | `https://blp.app.tisaislamic.sch.id` |

**Why:** Ketiga modul memakai domain produksi resmi TISA Islamic. URL TOMAT dipakai di `src/nativePatch.js` sebagai `PROD`, sedangkan URL Guru dan BLP dipakai untuk deep-link antar modul.

**How to apply:** Jika TOMAT app perlu memanggil API Guru/BLP langsung (misalnya untuk unified notifikasi atau SSO cross-module), gunakan URL ini sebagai base. Jangan hardcode di source — simpan sebagai env var atau konstanta di file terpisah.
