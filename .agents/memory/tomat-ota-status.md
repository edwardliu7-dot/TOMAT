---
name: TOMAT OTA readiness
description: Batasan aktual mekanisme OTA bundle untuk APK TOMAT.
---

Kode aplikasi sudah memiliki pemeriksaan versi dan UI OTA, tetapi plugin native updater belum menjadi dependency/configuration APK. Karena itu fallback OTA hanya mengunduh/menandai bundle lalu reload; fallback tersebut tidak mengganti asset web yang tertanam di APK.

**Why:** Asset statis APK berasal dari `dist/`, sedangkan `nativePatch` sengaja mengarahkan hanya API dan Socket.io ke server produksi.

**How to apply:** Perubahan React/CSS/gameplay client harus masuk ke rebuild APK sampai plugin OTA native dipasang dan diuji. Perubahan server-authoritative tetap harus dideploy ke server produksi secara terpisah. Setelah plugin OTA menjadi bagian dari APK, satu rebuild bootstrap diperlukan sebelum update JS/CSS berikutnya dapat dikirim sebagai OTA.