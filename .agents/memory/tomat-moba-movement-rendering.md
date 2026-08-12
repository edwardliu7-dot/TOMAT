---
name: TOMAT MOBA movement rendering
description: Batasan performa renderer client untuk posisi Pet dan snapshot realtime arena.
---

Posisi entitas bergerak di arena harus diperbarui dengan `translate3d` berbasis ukuran world, bukan `left/top`. Komponen visual Pet perlu melewati memoization dengan pembanding properti visual, karena snapshot server dapat mengganti objek player meski sprite tidak berubah.

**Why:** Update posisi berbasis layout dan render ulang `PetSVG` pada setiap snapshot memperbesar biaya layout serta paint di perangkat mobile.

**How to apply:** Saat menambah efek atau entitas MOBA, pertahankan posisi pada jalur transform compositor-only; gunakan layout positioning hanya untuk dekorasi statis, node, dan minimap.