---
name: Mockup component registry
description: Perilaku regenerasi registry komponen mockup saat workflow sandbox dijalankan.
---

Registry komponen mockup yang dilacak Git dapat ditulis ulang saat workflow sandbox dimulai. Regenerasi dapat mengubah urutan entri dan memasukkan semua komponen yang ditemukan di filesystem.

**Why:** Resolusi merge manual pada file generated bisa terlihat selesai, tetapi startup sandbox dapat menghasilkan diff baru yang valid.

**How to apply:** Setelah merge yang menyentuh registry, restart sandbox, pastikan semua import mengarah ke file yang ada, lalu commit hasil regenerasi jika working tree berubah.