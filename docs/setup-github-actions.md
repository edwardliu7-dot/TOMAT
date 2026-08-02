# Setup GitHub Actions — OTA Bundle Deploy

Panduan ini menjelaskan cara mengkonfigurasi GitHub Actions agar setiap push ke `main`
secara otomatis build + upload bundle OTA ke VPS.

---

## Bagian 1 — Generate SSH Key (di komputer lokal kamu)

Buat SSH key khusus untuk GitHub Actions (jangan pakai key yang sudah ada):

```bash
ssh-keygen -t ed25519 -C "github-actions-tomat" -f ~/.ssh/tomat_deploy -N ""
```

Ini membuat dua file:
- `~/.ssh/tomat_deploy` → **private key** (dimasukkan ke GitHub Secrets)
- `~/.ssh/tomat_deploy.pub` → **public key** (didaftarkan di VPS)

---

## Bagian 2 — Daftarkan Public Key di VPS

Login ke VPS kamu lalu jalankan:

```bash
# Ganti YOUR_PUBLIC_KEY dengan isi file ~/.ssh/tomat_deploy.pub
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Atau cara lebih mudah, dari komputer lokal:

```bash
ssh-copy-id -i ~/.ssh/tomat_deploy.pub user@ip-vps-kamu
```

---

## Bagian 3 — Siapkan VPS

### a. Pastikan folder bundles/ ada

```bash
mkdir -p /var/www/tomat/bundles
```

### b. Pastikan pm2 sudah running

```bash
# Cek apakah server sudah jalan di pm2
pm2 list

# Kalau belum, start dulu dari folder app:
cd /var/www/tomat
pm2 start "node server/index.js" --name "tomat"
pm2 save
```

Catat nama app pm2-nya (contoh: `tomat`) — ini untuk `VPS_PM2_NAME`.

### c. Pastikan domain/IP bisa serve /bundles

Kalau pakai Nginx, tambahkan ini di config site:

```nginx
location /bundles/ {
    alias /var/www/tomat/bundles/;
    autoindex off;
}
```

Atau cukup andalkan Express static yang sudah dikonfigurasi di `server/index.js`
(sudah otomatis serve `/bundles` di mode produksi).

---

## Bagian 4 — Tambahkan Secrets ke GitHub

Buka repo GitHub kamu →
**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Tambahkan 5 secrets berikut:

| Secret Name | Contoh nilai | Keterangan |
|-------------|-------------|------------|
| `VPS_HOST` | `103.12.34.56` | IP atau domain VPS |
| `VPS_USER` | `ubuntu` | Username SSH di VPS |
| `VPS_SSH_KEY` | *(isi file `~/.ssh/tomat_deploy`)* | Private key — copy-paste seluruh isinya |
| `VPS_APP_PATH` | `/var/www/tomat` | Path root project di VPS |
| `VPS_BUNDLE_BASE_URL` | `https://linktomat.app` | URL publik server (tanpa trailing slash) |
| `VPS_PM2_NAME` | `tomat` | Nama app di pm2 |

**Cara ambil isi private key:**
```bash
cat ~/.ssh/tomat_deploy
```
Copy seluruh output termasuk baris `-----BEGIN...` dan `-----END...`.

---

## Bagian 5 — Test Manual

Setelah semua secrets ditambahkan, test workflow tanpa harus push kode:

1. Buka repo GitHub → tab **Actions**
2. Pilih workflow **"Deploy OTA Bundle"**
3. Klik **"Run workflow"** → pilih branch `main` → klik **Run**
4. Pantau log di tab Actions

---

## Bagian 6 — Cara Kerja Setelah Setup

```
Kamu push ke main
    ↓
GitHub Actions berjalan otomatis (~3–5 menit):
  1. npm ci + npm run build
  2. Zip dist/ → tomat-<version>.zip
  3. Hitung SHA256 + ukuran
  4. SCP zip ke VPS /bundles/
  5. Update server/app-version.js di VPS
  6. pm2 restart tomat
    ↓
User buka app → cek /api/app/version-check
    ↓
Banner OTA muncul → user download bundle baru (~3MB)
    ↓
User tap Restart → app jalan dengan kode terbaru ✅
```

---

## Kapan Harus Update Versi?

Bump `APP_VERSION` di `src/version.js` sebelum push:

```js
// src/version.js
export const APP_VERSION = '1.4.5'  // naikan ini
```

Workflow otomatis baca versi ini untuk nama file bundle.
Kalau kamu push dua kali dengan versi yang sama, bundle lama di VPS akan tertimpa.

---

## Troubleshooting

**SSH permission denied:**
Pastikan public key sudah ada di `~/.ssh/authorized_keys` di VPS dan private key
di GitHub Secret tidak ada spasi/newline ekstra.

**pm2: process not found:**
Jalankan `pm2 list` di VPS untuk cek nama yang benar, update `VPS_PM2_NAME`.

**Bundle tidak muncul di user:**
Cek apakah `bundleVersion` di `server/app-version.js` sudah terupdate dengan
`cat /var/www/tomat/server/app-version.js | grep bundleVersion`.

**app-version.js tidak terupdate:**
Pastikan user SSH punya write permission ke folder app:
`ls -la /var/www/tomat/server/`
