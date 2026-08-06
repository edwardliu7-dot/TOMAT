# KomoDIH — Penjelajah Jejak Purba

## Identitas

- **ID:** `pet_komodih`
- **Kategori:** Pet Langka
- **Jenis:** Komodo
- **Tema:** Penjelajah, observasi, dan ketekunan belajar
- **Sprite:** `komodih.png`
- **Format sprite:** 768×768 px, grid 6×6, 128×128 px per frame

## Tagline

> Setiap jejak menyimpan pelajaran.

## Story

KomoDIH adalah komodo muda dari pulau terpencil yang tidak hanya pandai
menemukan harta karun, tetapi juga suka menemukan jawaban. Dengan topi
penjelajah warisan seorang ilmuwan tua dan kalung bunga dari sahabat-sahabatnya
di hutan, ia menjelajah mencari “Jejak Purba”—tanda misterius yang konon hanya
muncul bagi mereka yang terus belajar.

KomoDIH memang terlihat santai dan sering tertidur di bawah batu hangat. Namun
begitu mendengar pertanyaan matematika, ekornya langsung bergerak dan matanya
bersinar. Ia bisa mencium jejak jawaban yang benar, bahkan di antara pilihan
yang paling membingungkan.

Konon, setiap jawaban benar membuat satu simbol kuno menyala di sepanjang
punggungnya. Jika seluruh simbol berhasil menyala, KomoDIH akan menemukan jalan
menuju Pulau Pengetahuan.

## Kepribadian

- Santai, tetapi sangat penasaran.
- Suka mengoleksi benda-benda kecil dari perjalanan.
- Lambat ketika berjalan, tetapi sangat teliti.
- Sering tidur sambil tetap memakai topi penjelajahnya.
- Tidak suka terburu-buru—jawaban terbaik selalu meninggalkan jejak.

## Efek gameplay

### Pasif: Jejak Pengetahuan

- **+15% EXP** dari jawaban benar.
- **+10% durasi makanan**.
- Tidak memberikan immunity.
- Tidak memberikan bonus koin langsung.

Efek ini menempatkan KomoDIH sebagai pet belajar dan observasi. Bonusnya
berbeda dari Tomi yang berfokus pada koin, Monyang yang memberi bonus koin dan
EXP, serta Nananaga yang memiliki immunity.

## Efek visual yang disarankan

- Jejak kaki kecil berkilau saat KomoDIH berjalan.
- Animasi mengendus dan sparkle kompas setelah jawaban benar.
- Gelembung tidur berisi kompas atau angka saat state tidur.
- Saat naik level, KomoDIH mengangkat topinya dan memunculkan pesan
  **“Jejak baru ditemukan!”**.

## Batasan implementasi

- KomoDIH adalah pet dasar mandiri, bukan skin Monyang.
- Hunger pool menggunakan key `komodih`, terpisah dari pet lain.
- Bonus EXP dan durasi makanan dihitung server-side.
- Client hanya menampilkan bonus dan memberikan optimistic display EXP.
- Kemampuan pet tidak boleh memberi jawaban atau mengubah skor secara langsung.