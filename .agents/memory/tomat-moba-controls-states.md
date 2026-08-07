---
name: TOMAT MOBA controls and Pet visual states
description: Konvensi input responsif dan animasi Pet pada arena MOBA.
---

Mobile dan tablet menggunakan analog berbasis pointer; laptop menggunakan tombol atas/bawah/kiri/kanan yang mengulang gerak selama ditekan. State sprite MOBA adalah `idle` saat diam, `walk` saat event gerak diterima, `happy` setelah gulungan berhasil didapat, dan `hungry` saat terkena stun atau jawaban salah.

**Why:** Kontrol sentuh membutuhkan arah kontinu dan kontrol laptop perlu aksi yang mudah dipahami; state visual harus mencerminkan hasil aksi server, bukan tebakan klien.

**How to apply:** Jangan mengubah posisi secara optimistis di klien. Kirim arah berulang ke server, gunakan `actionId` pada event gerak untuk memicu `walk`, dan prioritaskan stun/hungry di atas state sementara lainnya.