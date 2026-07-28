# Deploy TOMAT ke VPS — Panduan Lengkap

Panduan ini menggunakan **Docker + Nginx + Let's Encrypt** di VPS Ubuntu/Debian.
Database tetap di Neon (cloud PostgreSQL) — tidak perlu migrasi.

---

## Prasyarat

- VPS dengan Ubuntu 20.04+ atau Debian 11+
- Domain yang sudah diarahkan ke IP VPS (A record)
- Akses SSH ke VPS

---

## 1. Arahkan Domain ke VPS

Di panel DNS domain Anda, tambahkan A record:

| Type | Name              | Value          | TTL |
|------|-------------------|----------------|-----|
| A    | tomat             | IP_VPS_ANDA    | 300 |

> Contoh: subdomain `tomat.namadomain.com` → IP VPS

Tunggu DNS propagasi (biasanya 5–30 menit). Cek dengan:
```bash
nslookup tomat.namadomain.com
```

---

## 2. Install Docker di VPS

```bash
# Login ke VPS via SSH
ssh root@IP_VPS_ANDA

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose plugin
apt-get install -y docker-compose-plugin

# Verifikasi
docker --version
docker compose version
```

---

## 3. Upload Kode ke VPS

**Opsi A — via Git (direkomendasikan):**
```bash
git clone https://github.com/USERNAME/REPO.git tomat
cd tomat
```

**Opsi B — via SCP dari komputer lokal:**
```bash
# Di komputer lokal:
scp -r /path/ke/project root@IP_VPS:/root/tomat
ssh root@IP_VPS
cd /root/tomat
```

---

## 4. Setup Environment Variables

```bash
cp .env.example .env
nano .env
```

Isi semua nilai di `.env` (lihat komentar di file tersebut).  
Nilai `NEON_DATABASE_URL` dan `SESSION_SECRET` bisa disalin dari Replit Secrets.

---

## 5. Setup Nginx & SSL

**Edit domain di nginx.conf:**
```bash
# Ganti YOUR_DOMAIN dengan domain asli, misal: tomat.namadomain.com
sed -i 's/YOUR_DOMAIN/tomat.namadomain.com/g' nginx/nginx.conf
```

**Jalankan HTTP saja dulu (untuk verifikasi certbot):**

Sementara comment blok `server { listen 443 ... }` di `nginx/nginx.conf`, jalankan:
```bash
docker compose up -d nginx
```

**Ambil sertifikat SSL:**
```bash
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d tomat.namadomain.com \
  --email email@anda.com \
  --agree-tos --no-eff-email
```

**Aktifkan kembali blok HTTPS** (uncomment) lalu restart:
```bash
docker compose restart nginx
```

---

## 6. Jalankan Aplikasi

```bash
# Build dan jalankan semua service
docker compose up -d --build

# Cek status
docker compose ps

# Lihat log
docker compose logs -f app
```

Aplikasi sekarang live di `https://tomat.namadomain.com` 🎉

---

## 7. Update APK untuk Pakai Domain Baru

Di Replit atau komputer lokal:
```bash
pnpm cap:set-url https://tomat.namadomain.com
pnpm cap:sync
```

Lalu rebuild APK di Android Studio. APK ini tidak akan pernah bergantung ke Replit lagi.

---

## Cara Update Aplikasi

Setiap kali ada perubahan kode:

```bash
# Di VPS:
git pull                        # ambil kode terbaru
docker compose up -d --build   # build ulang dan restart
```

---

## Cara Force Update APK

Saat rilis APK baru dan ingin pengguna wajib update:

1. Naikkan `versionCode` di `android/app/build.gradle`:
   ```groovy
   versionCode 2   // ← naikkan dari sebelumnya
   versionName "1.1"
   ```

2. Build APK baru, upload ke GitHub Releases

3. Update `.env` di VPS:
   ```env
   MIN_APP_VERSION_CODE=2
   APP_DOWNLOAD_URL=https://github.com/USERNAME/REPO/releases/download/v1.1/tomat.apk
   ```

4. Restart app:
   ```bash
   docker compose up -d app
   ```

Pengguna dengan APK lama langsung melihat layar "Update Diperlukan" saat buka app.

---

## Perpanjang SSL Otomatis

Certbot sudah dikonfigurasi auto-renew via docker-compose.yml.
Pastikan container `certbot` berjalan:
```bash
docker compose ps certbot
```

---

## Troubleshooting

**App tidak bisa diakses:**
```bash
docker compose logs app      # cek error aplikasi
docker compose logs nginx    # cek error nginx
```

**SSL gagal:**
- Pastikan A record domain sudah mengarah ke IP VPS
- Pastikan port 80 dan 443 terbuka di firewall VPS:
  ```bash
  ufw allow 80 && ufw allow 443
  ```

**Database error:**
- Pastikan `NEON_DATABASE_URL` di `.env` benar dan tidak ada whitespace
