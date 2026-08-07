# TOMAT MOBA — Hari 14: Reward, statistik, dan kesiapan rilis

## Keputusan rilis MVP

- State pertandingan tetap realtime dan in-memory di `match-manager`.
- Hasil final disimpan di `moba_match_results` setelah `match_finished`.
- Pemenang mendapat 15 koin per anggota tim pemenang; seri tidak mendapat koin.
- `match_id` adalah kunci idempotensi. Retry event yang sama tidak membuat baris
  baru atau reward tambahan.
- `MOBA_ENABLED=false` mematikan akses MOBA tanpa mematikan Socket.io atau mode
  multiplayer individu.
- Untuk rollout terbatas, isi `MOBA_ALLOWED_STUDENT_IDS` dengan daftar ID siswa
  dipisahkan koma. Jika kosong, semua siswa yang sudah login boleh masuk ketika
  MOBA aktif.

## Observability

- Log startup harus menunjukkan server berjalan dan schema selesai.
- Endpoint guru `GET /api/guru/moba/results?limit=50` menampilkan hasil final,
  skor, pemenang, dan status reward tanpa membuka snapshot soal.
- Pantau error `[moba-results]` dan kegagalan transaksi database.
- Pantau jumlah hasil dengan `reward_issued_at IS NULL` untuk mendeteksi reward
  yang belum terselesaikan.
- Pantau koneksi Socket.io, `moba:error`, dan rasio pertandingan yang selesai.

## Rollback / kill switch

1. Set `MOBA_ENABLED=false`.
2. Restart workflow `TOMAT Web App`.
3. Verifikasi login, game individu, dan socket non-MOBA tetap berjalan.
4. Jangan menghapus `moba_match_results`; tabel diperlukan untuk mencegah
   reward ganda bila fitur dinyalakan kembali.
5. Jika hasil perlu diaudit, gunakan endpoint riwayat guru sebelum melakukan
   perubahan data.

## Verifikasi lokal

```bash
node --test test/moba-state.test.js test/moba-socket-adapter.test.js \
  test/moba-reducer.test.js test/moba-results.test.js
npm run build
```

Simulasi hasil:

1. Buat match 1v1/2v2/3v3.
2. Ready semua pemain dan jalankan sampai `match_finished`.
3. Kirim ulang event settlement dengan `match_id` sama.
4. Pastikan hanya settlement pertama yang mengubah saldo.