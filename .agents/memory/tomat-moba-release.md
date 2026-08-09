---
name: TOMAT MOBA release and settlement
description: Batas rilis MVP, persistence hasil, dan idempotensi reward mode MOBA.
---

MOBA memisahkan state realtime in-memory dari hasil final durable. Settlement memakai match ID sebagai idempotency key; pemenang menerima reward satu kali, seri tidak menerima reward. Akses dikendalikan oleh env flag dan allowlist siswa.

**Why:** Reconnect, retry event, dan proses server yang terpisah dari realtime state tidak boleh menggandakan reward atau memaksa mode individu ikut mati saat MOBA dinonaktifkan.

**How to apply:** Pertahankan tabel hasil sebagai audit/idempotensi walau fitur dimatikan. Gunakan kill switch akses MOBA tanpa memutus Socket.io global, dan pantau settlement gagal atau hasil tanpa timestamp reward.

MOBA saat ini aktif untuk rollout terbatas pada akun demo `tomat-demo` dan `tomat-demo-2` melalui `MOBA_ENABLED=true` dan allowlist ID; entry point siswa tetap tersembunyi untuk akun lain. Kode, hasil pertandingan, dan Socket.io tetap dipertahankan untuk pengembangan berikutnya.