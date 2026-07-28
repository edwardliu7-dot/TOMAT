# Panduan Build APK Android — TOMAT

Panduan lengkap untuk menghasilkan file APK dari aplikasi TOMAT menggunakan Capacitor.

---

## Prasyarat

Install di komputer lokal:
- [Android Studio](https://developer.android.com/studio) (termasuk Android SDK)
- Java 17+ (sudah termasuk di Android Studio)
- Node.js 22+ dan pnpm

---

## Langkah-Langkah

### 1. Deploy Aplikasi ke Replit

APK menggunakan mode **Server URL** — WebView di Android memuat langsung dari server yang sudah di-deploy. Jadi TOMAT harus di-deploy dulu sebelum APK bisa digunakan.

Di Replit: klik tombol **Publish** untuk deploy aplikasi.

Setelah deploy, catat URL production (contoh: `https://tomat.replit.app`).

---

### 2. Set Server URL

Di Replit, jalankan:

```bash
pnpm cap:set-url https://URL-PRODUCTION-KAMU.replit.app
```

Ganti `https://URL-PRODUCTION-KAMU.replit.app` dengan URL asli dari langkah 1.

---

### 3. Sync Web Assets ke Android

```bash
pnpm cap:sync
```

Perintah ini akan:
- Build frontend React (`vite build`)
- Sync hasil build ke folder `android/`
- Update konfigurasi Capacitor

---

### 4. Download Project ke Komputer Lokal

Dari Replit, download project (zip atau via Git), lalu buka terminal di folder project.

---

### 5. Buka di Android Studio

```bash
# Dari folder project:
npx cap open android
```

Atau buka Android Studio secara manual → **Open** → pilih folder `android/`

---

### 6. Build APK di Android Studio

**Debug APK** (untuk testing):
- Menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- APK tersimpan di: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK** (untuk distribusi):
- Menu: **Build** → **Generate Signed Bundle / APK**
- Pilih **APK** → buat atau gunakan keystore yang sudah ada
- APK tersimpan di: `android/app/build/outputs/apk/release/`

---

## Alur Update Aplikasi

Setiap kali ada perubahan di kode:

```bash
# 1. Push ke Replit dan redeploy
# 2. (Kalau URL tidak berubah) Langsung sync saja:
pnpm cap:sync
# 3. Rebuild APK di Android Studio
```

> **Catatan:** Jika server URL tidak berubah, APK yang sudah terpasang di HP akan
> otomatis mendapat update karena konten dimuat dari server. Rebuild APK hanya
> diperlukan jika ada perubahan konfigurasi native Android.

---

## Struktur Folder Android

```
android/
  app/
    src/main/
      java/com/aistudio/tomat/
        MainActivity.java       ← Activity utama (Capacitor)
      assets/public/            ← Web assets hasil build (sync otomatis)
      AndroidManifest.xml       ← Konfigurasi app Android
    build.gradle                ← Dependensi & konfigurasi build
  build.gradle
  variables.gradle              ← Versi SDK & library
```

---

## App ID & Versi

| Setting | Nilai |
|---|---|
| Application ID | `com.aistudio.tomat` |
| Min Android | 7.0 (API 24) |
| Target Android | Android 16 (API 36) |
| Vite build output | `dist/` |

---

## Troubleshooting

**WebView menampilkan halaman blank:**
→ Pastikan server URL sudah di-set (`pnpm cap:set-url`) dan app sudah di-deploy.

**Tidak bisa login / session hilang:**
→ Normal pada mode server URL, session dikelola oleh server seperti di browser.

**CORS error di Android:**
→ Pastikan Express server tidak mem-block origin dari WebView. Capacitor menggunakan scheme `https://localhost` atau custom scheme.

**Build gagal di Android Studio:**
→ Pastikan Android SDK sudah terpasang, jalankan `pnpm cap:sync` ulang lalu buka di Android Studio.
