---
name: TOMAT MOBA lifecycle
description: Keputusan desain untuk registry pertandingan dan lifecycle mode MOBA TOMAT.
---

Match manager MOBA harus tetap transport-agnostic dan hidup di registry in-memory terpisah dari Socket.io, lobby mode individu, UI, dan database. Lifecycle menggunakan timestamp absolut (`startedAt`, `endsAt`) dan dependency clock/timer dapat diinjeksi agar transisi countdown, finish otomatis, dan cleanup dapat diuji deterministik.

**Why:** Mode MOBA harus dapat dikembangkan bertahap tanpa mengubah multiplayer individu, dan timer berbasis waktu klien atau test yang menunggu waktu nyata mudah menghasilkan state yang tidak konsisten.

**How to apply:** Adapter Socket.io berikutnya hanya menerjemahkan method/event manager. Jangan menaruh lifecycle di handler socket; gunakan manager yang sama untuk validasi lobby, ready, start, finish, dan cleanup.