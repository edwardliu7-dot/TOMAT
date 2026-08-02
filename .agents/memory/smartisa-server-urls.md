---
name: SMARTISA production server URLs
description: URL produksi masing-masing modul yang di-deploy di Coolify (157.10.161.229)
---

## Server URLs (Production)

| Modul | URL |
|-------|-----|
| TOMAT (siswa) | `https://y4e6icv3cej4ax65idvhusde.157.10.161.229.sslip.io` |
| GURU (EOB5)   | `https://sfptjjfqgqidt4736qzont0l.157.10.161.229.sslip.io` |
| BLP Harian    | `https://nswzqjz1jnr821kuh3s9aji1.157.10.161.229.sslip.io` |

**Why:** Ketiga modul di-deploy terpisah di Coolify. URL TOMAT sudah dipakai di `src/nativePatch.js` sebagai `PROD`. URL Guru dan BLP diperlukan jika ada cross-module API call atau deep-link antar modul.

**How to apply:** Jika TOMAT app perlu memanggil API Guru/BLP langsung (misalnya untuk unified notifikasi atau SSO cross-module), gunakan URL ini sebagai base. Jangan hardcode di source — simpan sebagai env var atau konstanta di file terpisah.
