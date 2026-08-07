---
name: TOMAT MOBA question nodes
description: Aturan durable untuk spawn, expiry, dan claim titik soal pada mode MOBA TOMAT.
---

Node soal dibuat dan diklaim melalui match manager server-side. Spawn harus berada di batas arena, tidak menimpa base, pemain, atau node lain; node memiliki TTL dan dihapus saat expiry. Claim memeriksa fase running, koneksi/stun pemain, node available, masa berlaku, dan jarak interaksi sebelum mengubah status secara sinkron.

**Why:** Node adalah resource first-come-first-served; state klien tidak boleh menentukan pemenang atau membuat node yang bisa membocorkan jawaban.

**How to apply:** Adapter Socket.io hanya meneruskan hasil manager dan event `node_spawned`, `node_claimed`, serta `node_expired`. Sesi soal dan jawaban benar tetap menjadi tanggung jawab subsistem Hari 5 dan tidak boleh dimasukkan ke payload node publik.