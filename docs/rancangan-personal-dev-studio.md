# Rancangan Personal AI Development Studio

> Status: **Rancangan awal**  
> Target pengguna: **satu pengguna pribadi**  
> Tujuan: menyediakan lingkungan pengembangan mandiri yang mengambil fitur penting dari Replit tanpa bergantung pada langganan Replit.

---

## 1. Ringkasan

Personal AI Development Studio adalah aplikasi pribadi untuk mengembangkan, menjalankan, memperbaiki, dan mem-preview proyek software melalui browser.

Fokusnya bukan membuat platform publik seperti Replit, melainkan membuat alat kerja pribadi yang memiliki fitur yang paling sering dibutuhkan:

- Mengambil repository dari GitHub.
- Mengedit kode melalui browser.
- Memiliki AI Agent untuk coding dan problem solving.
- Memiliki mode **Build** dan **Design**.
- Menjalankan aplikasi dan menampilkan preview.
- Menyimpan secret dengan aman.
- Melakukan Git pull, commit, diff, branch, push, dan pull request.
- Menjalankan build, test, dan debugging otomatis.
- Menyimpan checkpoint serta menyediakan rollback.

Seluruh biaya infrastruktur dan AI berada di luar Replit. Aplikasi dapat menggunakan API key milik sendiri, provider AI yang lebih murah/gratis, model lokal, atau kombinasi beberapa provider.

---

## 2. Prinsip Utama

### 2.1 Pribadi, bukan multi-tenant

Pengguna aplikasi hanya satu orang. Karena itu, versi awal tidak membutuhkan:

- Registrasi pengguna.
- Sistem organisasi atau tim.
- Billing.
- Quota per pengguna.
- Kolaborasi realtime.
- Permission kompleks antar pengguna.
- Autoscaling multi-tenant.

Tetap diperlukan autentikasi atau akses privat agar aplikasi dan secret tidak terbuka ke publik.

### 2.2 Provider AI tidak boleh mengunci aplikasi

AI harus melalui satu lapisan abstraksi bernama **AI Gateway**. Agent tidak boleh terikat langsung ke satu provider.

Provider dapat diganti berdasarkan:

- Harga.
- Kualitas.
- Kecepatan.
- Dukungan vision.
- Ketersediaan free tier.
- Apakah model berjalan lokal atau melalui API.

### 2.3 Pengguna menyetujui perubahan berisiko

Agent boleh melakukan pekerjaan rutin secara otomatis, tetapi operasi berisiko harus meminta persetujuan:

- Menghapus banyak file.
- Mengubah database atau schema.
- Mengubah dependency besar.
- Mengubah konfigurasi deployment.
- Menggunakan atau menghapus secret.
- Push ke branch utama.
- Menjalankan command yang berpotensi merusak sistem.

### 2.4 Workspace harus dapat dipulihkan

Setiap perubahan agent perlu dapat dilihat melalui diff dan dikembalikan melalui:

- Undo perubahan terakhir.
- Checkpoint sebelum agent bekerja.
- Git branch.
- Git reset/restore.
- Rollback ke checkpoint sebelumnya.

---

## 3. Sasaran Penggunaan

Alur utama yang ingin didukung:

```text
Login ke Personal Dev Studio
        ↓
Import atau buka repository GitHub
        ↓
Pilih Build atau Design Mode
        ↓
Minta agent mengerjakan perubahan
        ↓
Agent membaca kode dan membuat rencana
        ↓
Agent mengubah file
        ↓
Build, test, dan preview dijalankan
        ↓
Agent membaca error jika ada
        ↓
Pengguna memeriksa diff dan preview
        ↓
Commit dan push ke GitHub
```

Contoh instruksi:

- “Perbaiki halaman login agar responsif di Android.”
- “Cari penyebab build gagal dan perbaiki tanpa mengubah API publik.”
- “Buat tiga variasi desain dashboard ini.”
- “Tarik perubahan terbaru dari GitHub lalu jelaskan konflik yang terjadi.”
- “Jalankan test, perbaiki error, dan jangan push sebelum saya setujui.”

---

## 4. Arsitektur Tingkat Tinggi

```text
┌────────────────────────────────────────────────────────┐
│ Browser                                                │
│                                                        │
│ Project Manager │ Code Editor │ AI Agent │ Preview     │
│ Build Mode      │ Design Mode│ Terminal │ Git         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ Personal Dev Studio Backend                            │
│                                                        │
│ Auth & Session                                         │
│ Project Manager                                        │
│ Workspace Runner                                       │
│ AI Gateway                                             │
│ GitHub Service                                         │
│ Secret Manager                                         │
│ Preview Proxy                                          │
│ Checkpoint Manager                                     │
└───────────────┬────────────────┬───────────────────────┘
                │                │
                ▼                ▼
       ┌────────────────┐  ┌────────────────────┐
       │ Workspace       │  │ External Services  │
       │ terisolasi      │  │                    │
       │                 │  │ GitHub             │
       │ source code     │  │ AI providers       │
       │ terminal       │  │ Ollama              │
       │ build server    │  │ Storage/backup     │
       └────────────────┘  └────────────────────┘
```

### Komponen utama

| Komponen | Tanggung jawab |
|---|---|
| Dashboard | Antarmuka proyek, agent, editor, preview, dan Git |
| Project Manager | Daftar proyek, lokasi workspace, branch aktif, dan status |
| Code Editor | Membaca dan mengubah file melalui browser |
| AI Gateway | Memilih provider, model, quota, retry, dan pencatatan pemakaian |
| AI Agent | Merencanakan, membaca, mengubah, menjalankan, dan memverifikasi |
| Workspace Runner | Menjalankan command dan server proyek |
| Preview Proxy | Meneruskan port workspace ke browser |
| GitHub Service | Clone, pull, branch, diff, commit, push, dan pull request |
| Secret Manager | Menyimpan dan menginjeksi secret proyek |
| Checkpoint Manager | Snapshot perubahan dan pemulihan |

---

## 5. Pilihan Deployment

### 5.1 Lokal — pilihan awal yang direkomendasikan

Semua komponen berjalan di komputer pribadi:

```text
Browser → Personal Dev Studio lokal → Workspace lokal
                              ├── GitHub
                              ├── AI API
                              └── Ollama opsional
```

**Kelebihan:**

- Biaya bulanan hampir nol.
- Source code dan secret tetap di komputer pribadi.
- Workspace dapat memakai CPU, RAM, dan storage lokal.
- Tidak perlu VPS atau reverse proxy publik.
- Cocok untuk tahap pengembangan awal.

**Kekurangan:**

- Hanya tersedia ketika komputer menyala.
- Akses dari luar membutuhkan VPN atau tunnel privat.
- Backup harus dirancang sendiri.

### 5.2 VPS pribadi

Dashboard, agent, workspace, dan preview berjalan di satu VPS.

**Kelebihan:**

- Dapat diakses dari mana saja.
- Bisa memiliki domain dan preview online.
- Komputer pribadi tidak harus menyala.

**Kekurangan:**

- Ada biaya VPS dan storage.
- Workspace dan command harus diisolasi dengan benar.
- Model lokal berat mungkin tidak nyaman dijalankan.

### 5.3 Hybrid

```text
VPS:
- Dashboard
- Backend
- GitHub integration
- Metadata proyek
- Preview ringan

Komputer pribadi:
- Source workspace
- Terminal dan build berat
- Docker
- Ollama dan model lokal
```

Koneksi dapat memakai Tailscale atau WireGuard. Hybrid cocok jika aplikasi perlu diakses dari luar, tetapi compute utama tetap ingin dilakukan di komputer pribadi.

### Keputusan awal

Mulai dari **lokal**, kemudian tambahkan mode hybrid atau VPS setelah alur Build, Design, dan AI Agent stabil.

---

## 6. Stack yang Disarankan

Stack dapat berubah sesuai kebutuhan, tetapi rancangan awal:

### Frontend

- React atau Next.js.
- Monaco Editor.
- Terminal berbasis xterm.js.
- Panel preview iframe.
- State management sederhana.

### Backend

- Node.js.
- Express atau Fastify.
- WebSocket untuk status agent, terminal, dan log realtime.
- Worker terpisah untuk pekerjaan agent dan build.

### Data

- SQLite untuk versi lokal pertama.
- PostgreSQL jika metadata, job queue, atau sinkronisasi bertambah.
- Filesystem workspace untuk source code.

### Workspace

- Docker container untuk isolasi dasar.
- User dan filesystem terbatas.
- Limit CPU, RAM, proses, dan durasi.
- Network dibatasi jika tidak dibutuhkan.

### Preview

- Reverse proxy internal.
- Port dinamis per workspace.
- Restart process.
- Log startup.
- Screenshot preview.

### AI lokal

- Ollama sebagai adapter opsional.
- Model lokal dipilih berdasarkan kemampuan hardware.

---

## 7. AI Gateway

AI Gateway menyediakan interface yang sama untuk semua provider.

```text
Agent
  ↓
AI Gateway
  ├── Provider API murah/gratis
  ├── Provider API premium dengan API key sendiri
  ├── Model lokal melalui Ollama
  └── Model vision untuk screenshot
```

### Tanggung jawab AI Gateway

- Memilih provider dan model.
- Membaca konfigurasi proyek.
- Mengatur token limit.
- Mengatur timeout.
- Retry terbatas.
- Menyimpan metrik pemakaian.
- Menyensor secret dari input dan output.
- Menghentikan loop agent yang tidak produktif.

### Routing berdasarkan jenis tugas

| Jenis tugas | Provider yang disarankan |
|---|---|
| Ringkasan file | Model lokal atau API murah |
| Pencarian lokasi bug | Model lokal/API murah |
| Menjelaskan error | API murah |
| Perubahan satu atau dua file | Model lokal atau API murah |
| Refactor besar | API terbaik milik pengguna |
| Analisis screenshot | Model vision |
| Autocomplete | Model lokal atau provider khusus autocomplete |

### Penghematan token

- Jangan mengirim `node_modules`, `dist`, cache, binary, dan file besar.
- Kirim hanya file yang relevan.
- Buat index struktur proyek.
- Cache ringkasan file.
- Ringkas log sebelum dikirim ke model.
- Batasi jumlah tool call.
- Hentikan agent setelah beberapa kegagalan berturut-turut.

Contoh batas awal:

```text
Maksimal langkah agent per permintaan: 20
Maksimal kegagalan build otomatis: 3
Maksimal ukuran log ke model: 20 KB
Screenshot otomatis: hanya saat diperlukan
```

---

## 8. AI Agent dan Tools

Agent menggunakan tools, bukan hanya chat teks.

### Tools inti

```text
read_file
list_files
search_code
inspect_project
write_file
apply_patch
run_command
run_build
run_tests
read_logs
take_screenshot
get_preview_status
git_status
git_diff
git_branch
git_commit
git_pull
git_push
```

### Siklus kerja agent

```text
1. Memahami permintaan.
2. Menginspeksi struktur proyek.
3. Membuat rencana singkat.
4. Meminta konfirmasi jika risikonya tinggi.
5. Membuat checkpoint.
6. Mengubah kode.
7. Menjalankan build atau test.
8. Membaca error.
9. Memperbaiki secara terbatas jika diperlukan.
10. Menampilkan ringkasan dan diff.
11. Menunggu persetujuan commit/push.
```

### Guardrail agent

Agent tidak boleh:

- Membaca nilai secret.
- Menampilkan credential di chat atau log.
- Push branch utama tanpa persetujuan.
- Menghapus repository.
- Mengubah file di luar workspace.
- Menjalankan command destruktif tanpa approval.
- Mengulangi langkah yang sama tanpa perubahan strategi.

---

## 9. Mode Build

Mode Build adalah ruang kerja utama untuk coding dan debugging.

```text
┌───────────────┬───────────────────────────────┬───────────────┐
│ File Explorer │ Editor                        │ AI Agent      │
│               │                               │               │
│ src/          │ Monaco Editor                 │ Chat          │
│ public/       │ Tabs                          │ Plan          │
│ package.json  │ Search                        │ Tool status   │
├───────────────┴───────────────────────────────┴───────────────┤
│ Terminal │ Build Log │ Test Result │ Git Diff │ Checkpoints    │
└────────────────────────────────────────────────────────────────┘
```

### Fitur MVP

- File explorer.
- Membuka dan menyimpan file.
- Search kode.
- Monaco Editor.
- Terminal.
- Menjalankan command.
- Build dan test.
- Log realtime.
- AI Agent.
- Git diff.
- Checkpoint.

### Fitur lanjutan

- Multi-tab.
- Inline diagnostic.
- Command palette.
- Auto-format.
- LSP.
- Review diff per file.
- Apply/reject perubahan per hunks.
- Perbandingan checkpoint.

---

## 10. Mode Design

Mode Design dimulai sebagai visual workflow, bukan editor seperti Figma penuh.

### MVP Design Mode

- Preview live.
- Screenshot preview.
- Tombol inspect.
- Pemilihan elemen UI.
- Informasi komponen atau selector terkait.
- Chat agent dengan konteks visual.
- Generate beberapa variasi.
- Compare variasi.
- Apply variasi ke workspace.

### Alur desain

```text
Pengguna membuka preview
        ↓
Pengguna memilih elemen
        ↓
Sistem mengumpulkan screenshot dan konteks kode
        ↓
Pengguna memberi instruksi visual
        ↓
Agent membuat Variant A, B, dan C
        ↓
Pengguna memilih variasi
        ↓
Agent menerapkan perubahan ke branch/checkpoint
        ↓
Build dan preview diverifikasi
```

### Contoh instruksi

- “Buat kartu ini lebih mudah dibaca di layar Android.”
- “Pertahankan warna brand, tetapi buat hierarkinya lebih kuat.”
- “Buat tiga variasi hero section tanpa mengubah fungsinya.”
- “Jadikan layout ini landscape-only di mobile.”

---

## 11. GitHub Integration

### Fitur

- Import repository.
- Clone repository.
- Memilih branch awal.
- Pull perubahan.
- Melihat status Git.
- Melihat diff.
- Membuat branch.
- Commit.
- Push.
- Membuat pull request.
- Menangani konflik secara terbantu.

### Alur branch yang disarankan

```text
main/master
    ↓
agent/workspace-YYYYMMDD
    ↓
Agent bekerja dan membuat checkpoint
    ↓
Pengguna meninjau diff
    ↓
Commit dan push
    ↓
Merge atau Pull Request
```

Agent boleh membuat commit lokal otomatis setelah perubahan selesai, tetapi push ke remote sebaiknya tetap membutuhkan persetujuan.

### GitHub credential

Gunakan GitHub OAuth atau GitHub App jika memungkinkan. Token harus disimpan sebagai secret dan tidak boleh masuk ke prompt agent.

---

## 12. Secret Manager

Secret harus dipisahkan per proyek.

Contoh:

```text
Project TOMAT
├── DATABASE_URL
├── GROQ_API_KEY
└── SESSION_SECRET

Project Website
├── GITHUB_TOKEN
└── DEPLOY_TOKEN
```

### Persyaratan minimum

- Secret disimpan terenkripsi.
- Kunci enkripsi tidak disimpan bersama plaintext secret.
- Secret hanya diinjeksi ke proses yang membutuhkan.
- Nilai secret tidak dikirim ke browser.
- Nilai secret tidak ditampilkan ke agent.
- Secret disensor dari terminal dan log.
- Pengguna dapat menambah, mengganti, menghapus, dan merotasi secret.
- Secret memiliki scope proyek.

### Representasi ke agent

Agent hanya boleh menerima informasi seperti:

```text
GROQ_API_KEY tersedia untuk proyek ini.
```

Agent tidak boleh menerima:

```text
GROQ_API_KEY=nilai-rahasia
```

### Pilihan implementasi

Untuk versi lokal pribadi:

- File environment terenkripsi.
- SOPS + age.
- SQLite dengan kolom terenkripsi.

Untuk versi lebih kuat:

- Infisical self-hosted.
- Vault self-hosted.

---

## 13. Workspace dan Preview

### Workspace

Setiap proyek memiliki:

- Direktori source.
- Branch aktif.
- Environment variable terpilih.
- Port preview.
- Riwayat checkpoint.
- Status proses.

### Isolasi minimum

Kode repository tidak boleh dijalankan langsung di proses backend utama.

Workspace runner harus membatasi:

- CPU.
- RAM.
- Jumlah proses.
- Durasi command.
- Filesystem.
- Akses network.
- Port.
- Akses ke host.

### Preview

Contoh pemetaan lokal:

```text
Project TOMAT    → localhost:3101
Project Website  → localhost:3102
Project API      → localhost:3103
```

Jika menggunakan VPS atau hybrid:

```text
https://preview.domain-pribadi.example/tomat
https://preview.domain-pribadi.example/website
```

Preview harus memiliki:

- Status server.
- Tombol restart.
- Log startup.
- Deteksi crash.
- Screenshot.
- Refresh otomatis setelah build berhasil.

---

## 14. Checkpoint dan Rollback

Checkpoint dibuat:

- Sebelum agent mulai mengubah kode.
- Sebelum refactor besar.
- Sebelum perubahan dependency.
- Sebelum perubahan database.
- Sebelum pengguna memilih variasi Design Mode.

Checkpoint dapat berupa:

- Git commit lokal.
- Git branch sementara.
- Snapshot filesystem.
- Kombinasi commit dan metadata agent.

Setiap checkpoint perlu menyimpan:

- Waktu.
- Permintaan pengguna.
- Ringkasan agent.
- Daftar file yang berubah.
- Hasil build/test.

---

## 15. Keamanan

Walaupun hanya digunakan oleh satu orang, aplikasi tetap harus menjaga keamanan karena menangani source code, token, dan secret.

### Minimum security baseline

- Akses lokal atau VPN secara default.
- Tidak membuka terminal ke internet tanpa autentikasi.
- Session menggunakan cookie aman.
- Secret tidak masuk ke frontend.
- Log disensor.
- Workspace tidak memiliki akses bebas ke host.
- Command timeout.
- Upload dan repository dibatasi ke lokasi workspace.
- Backup terenkripsi.
- Audit log untuk secret, push, dan command berisiko.

### Risiko yang perlu diperhatikan

| Risiko | Mitigasi |
|---|---|
| Repository berisi script berbahaya | Jalankan di container/runner terisolasi |
| Secret terbaca dari log | Masking output dan filter environment |
| Agent menghapus kode | Checkpoint sebelum perubahan |
| Agent push ke branch salah | Branch terpisah dan approval |
| Preview mengambil alih host | Port/proses/network isolation |
| Token GitHub bocor | Secret manager dan scope token minimal |
| Model mengulang loop | Batas tool call dan retry |

---

## 16. Strategi Biaya

### Mode biaya paling rendah

```text
GitHub Free
SQLite
Workspace lokal
Docker
Ollama
Backup lokal/encrypted drive
Provider AI gratis atau API key sendiri
```

Biaya bulanan dapat mendekati nol selain biaya listrik dan pemakaian API AI.

### Pembagian provider

```text
Tugas ringan      → Ollama/model lokal
Tugas rutin       → provider gratis atau murah
Tugas kompleks    → API key pribadi
Vision/design     → provider yang mendukung image
```

### Pengendalian biaya

- Batasi token per permintaan.
- Batasi jumlah langkah agent.
- Cache ringkasan proyek.
- Jangan mengirim file yang tidak relevan.
- Gunakan model lokal untuk pekerjaan sederhana.
- Minta approval sebelum tugas besar.
- Catat pemakaian token per provider.

---

## 17. Roadmap Implementasi

### Fase 0 — Fondasi

- Menentukan target deployment lokal.
- Membuat struktur backend dan frontend.
- Menentukan format project metadata.
- Menentukan format secret terenkripsi.
- Menentukan lifecycle workspace.

### Fase 1 — Personal Workspace MVP

- Login lokal atau akses privat.
- Project manager.
- Import GitHub.
- Clone repository.
- File explorer.
- Monaco Editor.
- Save file.
- Git status/diff.
- Terminal dasar.
- Preview satu workspace.

### Fase 2 — Build Mode

- AI Gateway.
- AI Agent dengan `read_file`, `search_code`, `apply_patch`, dan `run_command`.
- Build/test runner.
- Log realtime.
- Checkpoint otomatis.
- Review diff.
- Commit lokal.
- Pull dan push GitHub.

### Fase 3 — Secret dan Workspace yang Lebih Aman

- Secret manager per proyek.
- Masking log.
- Container workspace.
- CPU/RAM/timeout limit.
- Branch agent otomatis.
- Rollback.

### Fase 4 — Design Mode

- Live preview.
- Screenshot.
- Inspect elemen.
- Konteks komponen.
- Variasi desain.
- Compare dan apply.

### Fase 5 — AI Multi-Provider

- Ollama adapter.
- Provider API murah/gratis.
- Provider API premium dengan API key sendiri.
- Routing model berdasarkan tugas.
- Metrik pemakaian dan batas biaya.

### Fase 6 — Akses dari Luar

- Tailscale atau WireGuard.
- VPS opsional.
- Preview melalui domain pribadi.
- Backup otomatis.
- Hybrid runner.

---

## 18. Di Luar Scope Versi Awal

Fitur berikut tidak perlu dibuat pada versi pertama:

- Multi-user.
- Billing.
- Marketplace plugin publik.
- Kolaborasi realtime.
- Deployment multi-region.
- Autoscaling.
- Kubernetes.
- IDE mobile penuh.
- Editor visual setara Figma.
- Public app hosting untuk orang lain.

---

## 19. Kriteria Sukses MVP

MVP dianggap berhasil jika pengguna dapat:

1. Mengimpor repository GitHub.
2. Membuka dan mengubah file melalui browser.
3. Menjalankan command di workspace.
4. Melihat preview aplikasi.
5. Meminta AI Agent memperbaiki perubahan sederhana.
6. Melihat build log dan error.
7. Mengembalikan perubahan melalui checkpoint.
8. Menyimpan secret tanpa menampilkan nilainya ke browser atau agent.
9. Melakukan Git pull, diff, commit, dan push setelah approval.
10. Bekerja tanpa langganan Replit sebagai runtime utama.

---

## 20. Keputusan Awal yang Direkomendasikan

```text
Target pengguna       : satu pengguna pribadi
Deployment awal       : lokal
Database awal         : SQLite
Source of truth kode  : GitHub
AI utama              : AI Gateway multi-provider
AI lokal              : Ollama opsional
Workspace runner      : Docker
Editor                : Monaco Editor
Terminal              : xterm.js
Preview               : port lokal + proxy internal
Secret                : terenkripsi per proyek
Git workflow          : branch agent + approval push
Design Mode           : preview + inspect + variasi desain
```

Rancangan ini sengaja dimulai dari alat pribadi yang sederhana. Setelah alur kerja lokal stabil, deployment VPS, hybrid runner, dan fitur Design Mode yang lebih kaya dapat ditambahkan tanpa mengubah fondasi utama.
