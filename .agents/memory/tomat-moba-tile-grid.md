---
name: TOMAT MOBA tile grid
description: Skala grid dunia untuk tileset dan renderer arena MOBA.
---

Arena MOBA memakai ukuran grid konseptual **32 unit dunia per tile**. Dunia 8.000 × 8.000 unit menjadi 250 kolom × 250 baris. Metadata `tileSize`, `columns`, dan `rows` harus ikut tersedia pada konfigurasi arena yang dikirim ke klien.

**Why:** Tileset membutuhkan skala yang stabil untuk terrain, lane, dekorasi, dan minimap, tetapi gerakan Pet tetap perlu halus dan server-authoritative; memaksa movement ke tile akan membuat kontrol analog terasa patah-patah.

**How to apply:** Gunakan grid 32 unit untuk rendering, snapping/dekorasi, dan perencanaan map. Jangan mengubah koordinat gerak kontinu atau collision menjadi tile-step tanpa keputusan desain baru.