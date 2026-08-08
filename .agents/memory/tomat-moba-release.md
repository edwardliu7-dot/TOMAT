---
name: TOMAT MOBA release and settlement
description: Batas rilis MVP, persistence hasil, dan idempotensi reward mode MOBA.
---

MOBA memisahkan state realtime in-memory dari hasil final durable. Settlement memakai match ID sebagai idempotency key; pemenang menerima reward satu kali, seri tidak menerima reward. Akses dikendalikan oleh env flag dan allowlist siswa.

**Why:** Reconnect, retry event, dan proses server yang terpisah dari realtime state tidak boleh menggandakan reward atau memaksa mode individu ikut mati saat MOBA dinonaktifkan.

**How to apply:** Pertahankan tabel hasil sebagai audit/idempotensi walau fitur dimatikan. Gunakan kill switch akses MOBA tanpa memutus Socket.io global, dan pantau settlement gagal atau hasil tanpa timestamp reward.

Untuk sementara MOBA berada dalam status pengembangan: default server dan environment harus `MOBA_ENABLED=false`, sementara entry point siswa disembunyikan dari UI. Kode, hasil pertandingan, dan Socket.io tetap dipertahankan untuk pengembangan berikutnya.