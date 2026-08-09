---
name: TOMAT MOBA concept
description: Konsep dasar mode multiplayer MOBA TOMAT yang berdampingan dengan mode individu.
---

Mode MOBA TOMAT adalah arena multiplayer 2D non-combat yang berjalan berdampingan dengan mode individu. Format pertandingan hanya 1v1, 2v2, dan 3v3 karena jumlah siswa TISA masih terbatas. Karakter yang dirender dan dikendalikan adalah Pet siswa beserta skin aktifnya, bukan avatar manusia atau karakter 3D.

**Why:** Ini adalah keputusan produk inti agar mode multiplayer tetap ringan untuk jumlah pengguna saat ini, konsisten dengan sistem Pet TOMAT, dan tidak mengganggu alur game individu.

**How to apply:** Gunakan koordinat/rendering 2D, `petType` dan `petSkinId` yang divalidasi server serta dikunci saat join, dan pisahkan lobby/state MOBA dari mode individu. Jangan menambahkan format 5v5, rendering 3D, atau avatar karakter baru tanpa keputusan produk baru.