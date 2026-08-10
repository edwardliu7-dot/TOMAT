# Panduan Build APK Android — TOMAT

Panduan lengkap untuk menghasilkan file APK dari aplikasi TOMAT menggunakan Capacitor.

---

## Arsitektur APK

APK menggunakan mode **Offline Bundle** — semua asset UI, sprite, font, arena, dan wallpaper di-bundle langsung ke dalam APK saat build. WebView **tidak** memuat asset dari server eksternal.

Yang tetap memerlukan koneksi internet:
- API gameplay (login, skor, tugas) → `https://y4e6icv3cej4ax65idvhusde.157.10.161.229.sslip.io`
- Socket.io multiplayer (duel, MOBA, boss raid)

---

## Prasyarat

Install di komputer lokal:
- [Android Studio](https://developer.android.com/studio) (termasuk Android SDK)
- Java 17+ (sudah termasuk di Android Studio)
- Node.js 22+ dan pnpm

---

## Langkah-Langkah

### 1. Build & Sync di Replit

Di Replit, jalankan dari terminal:

```bash
pnpm cap:sync
```

Perintah ini akan:
- Build frontend React (`vite build`) → menghasilkan folder `dist/`
- Sync seluruh isi `dist/` ke `android/app/src/main/assets/public/`
- Update konfigurasi Capacitor native

> Tidak perlu deploy ke server terlebih dahulu. Asset sudah di-bundle ke APK.

---

### 2. Download Project ke Komputer Lokal

Dari Replit, download project (zip atau via Git), lalu buka terminal di folder project.

---

### 3. Buka di Android Studio

```bash
# Dari folder project:
npx cap open android
```

Atau buka Android Studio secara manual → **Open** → pilih folder `android/`

---

### 4. Build APK di Android Studio

**Debug APK** (untuk testing):
- Menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- APK tersimpan di: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK** (untuk distribusi):
- Menu: **Build** → **Generate Signed Bundle / APK**
- Pilih **APK** → buat atau gunakan keystore yang sudah ada
- APK tersimpan di: `android/app/build/outputs/apk/release/`

---

## Alur Update Aplikasi

Setiap kali ada perubahan kode atau asset:

```bash
# 1. Di Replit — sync ulang untuk bundle asset terbaru:
pnpm cap:sync

# 2. Download project terbaru ke komputer lokal

# 3. Rebuild APK di Android Studio
```

> APK yang sudah terpasang di HP **tidak** otomatis update karena semua asset ada di dalam APK.
> Perlu distribute APK baru setiap ada update.

---

## Struktur Folder Android

```
android/
  app/
    src/main/
      java/com/aistudio/tomat/
        MainActivity.java       ← Activity utama (Capacitor)
      assets/public/            ← Web assets hasil build (sync otomatis)
        *.png / *.gif / *.weba  ← Sprite, wallpaper, audio
        assets/                 ← JS/CSS ter-hash oleh Vite
        moba-arena/             ← Asset arena MOBA
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
| Mode | Offline bundle (tidak ada `server.url` di `capacitor.config.json`) |

---

## Troubleshooting

**WebView menampilkan halaman blank:**
→ Pastikan `pnpm cap:sync` sudah dijalankan dan folder `android/app/src/main/assets/public/` berisi file hasil build.

**Font tidak tampil saat pertama buka:**
→ Normal — font di-load dari bundle JS; tampil setelah JS selesai parse (< 1 detik di native).

**Tidak bisa login / API error:**
→ Pastikan perangkat terhubung internet. API server di `nativePatch.js` harus bisa dijangkau.

**CORS error di Android:**
→ Pastikan Express server tidak mem-block origin dari WebView. Capacitor menggunakan scheme `https://localhost`.

**Build gagal di Android Studio:**
→ Pastikan Android SDK sudah terpasang, jalankan `pnpm cap:sync` ulang lalu buka di Android Studio.
