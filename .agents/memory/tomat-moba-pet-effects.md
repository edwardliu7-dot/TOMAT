---
name: TOMAT MOBA Pet effects
description: Aturan server-terpusat untuk buff Pet pada mode MOBA.
---

Seluruh buff Pet MOBA harus dihitung dari `PlayerState` yang sudah tervalidasi saat join melalui satu modul efek server. Kelinsay hanya mendapat bonus kecepatan saat tidak membawa gulungan; Monyang mendapat kapasitas dua gulungan; Tomi mendapat bonus setoran; Nananaga memakai token imunitas hanya untuk jawaban hard.

**Why:** Payload klien tidak boleh menentukan loadout atau mengubah bonus di tengah pertandingan, dan aturan yang tersebar mudah membuat mode Pet lain ikut terpengaruh.

**How to apply:** Saat menambah Pet atau mengubah angka buff MOBA, gunakan helper efek terpusat dan tambahkan unit test isolasi untuk Pet tersebut serta test bahwa Pet lain tetap memakai nilai dasar.