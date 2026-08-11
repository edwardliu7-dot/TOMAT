---
name: TOMAT MOBA base scoring
description: Aturan angka yang ditampilkan di base dan bonus penyelesaian box.
---

Poin yang tampil di base tim hanya bertambah saat scroll disetor ke library/base tim tersebut; setiap box scoring yang penuh menambahkan bonus tetap 50 poin ke poin base, tanpa menambah skor match tim.

**Why:** Angka base harus merepresentasikan setoran yang benar-benar masuk ke base, sementara penyelesaian box adalah bonus progres terpisah.

**How to apply:** Pertahankan `team.base.points` sebagai sumber angka visual base. Deposit ke zona biasa hanya mengisi box; deposit ke library menambah poin base sesuai nilai scroll; transisi box menjadi penuh menambah satu bonus 50 poin.