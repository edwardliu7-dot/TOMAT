---
name: TOMAT APK YouTube embed
description: Persyaratan embed video YouTube di aplikasi Android Capacitor TOMAT.
---

Embed YouTube di APK tidak cukup hanya dengan mengubah URL iframe. WebView native harus mengizinkan JavaScript, DOM storage, database storage, dan third-party cookies; player native memakai host `www.youtube.com` dengan origin Capacitor.

**Why:** Player YouTube berjalan di iframe lintas-origin dan membutuhkan storage/cookie pihak ketiga untuk menginisialisasi player di Android WebView, sementara web browser biasa sudah menyediakan perilaku tersebut secara default.

**How to apply:** Jika embed video diubah, pertahankan konfigurasi WebView native dan rebuild APK karena asset React/native belum dikirim melalui OTA updater yang aktif.