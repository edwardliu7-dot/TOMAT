---
name: Personal AI Development Studio
description: Keputusan arsitektur untuk studio coding pribadi hemat biaya yang menjadi alternatif workflow Replit.
---

Personal AI Development Studio ditujukan hanya untuk satu pengguna dan sebaiknya dimulai sebagai aplikasi lokal, bukan platform multi-tenant. GitHub menjadi source of truth, AI dipanggil melalui AI Gateway multi-provider, Ollama menjadi opsi lokal, dan workspace dijalankan terisolasi.

**Why:** kebutuhan utama adalah mengurangi limit dan biaya Replit tanpa kehilangan GitHub, agent coding, Build/Design Mode, preview, dan secret; multi-user, billing, autoscaling, serta kolaborasi tidak diperlukan.

**How to apply:** prioritaskan workspace lokal, Monaco Editor, terminal, preview, Git diff/push/pull, secret terenkripsi per proyek, checkpoint, dan agent berbasis tools. Tambahkan VPS/hybrid hanya setelah MVP lokal stabil, dan jangan mengikat arsitektur ke satu provider AI.