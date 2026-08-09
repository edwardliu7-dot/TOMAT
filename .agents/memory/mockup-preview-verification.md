---
name: Mockup preview verification
description: Perbedaan jalur proxy utama dan port workflow sandbox saat memverifikasi iframe mockup.
---

Jika route `/__mockup/preview/...` pada proxy aplikasi utama menampilkan shell TOMAT atau splash, jangan langsung menganggap komponen mockup rusak. Cek workflow `artifacts/mockup-sandbox: Component Preview Server` dan verifikasi route yang sama melalui port sandbox yang sedang terbuka; iframe canvas tetap memakai URL dev sandbox yang dikelola canvas.

**Why:** Proxy utama dan server Vite sandbox dapat pulih pada waktu berbeda setelah restart, sehingga screenshot lewat port aplikasi bisa menangkap fallback shell sementara server komponen sebenarnya sudah sehat.

**How to apply:** Setelah perubahan mockup, cek log workflow sandbox, gunakan screenshot pada port sandbox bila proxy utama tidak menunjukkan komponen, lalu baru tandai iframe live setelah hasil langsung berhasil.