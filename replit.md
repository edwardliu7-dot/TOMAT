# SMARTISA / TOMAT

## Project overview

SMARTISA adalah platform pembelajaran TISA. TOMAT adalah modul siswa untuk
game matematika, tugas, gamifikasi, Pet, komunikasi, duel, turnamen, dan
mode multiplayer 2D yang direncanakan.

Modul BLP dan GURU berjalan sebagai aplikasi terpisah dan terhubung melalui
tautan eksternal; jangan mengembalikan embedded module tersebut ke TOMAT.

## Development notes

- Frontend: React 18 + Vite.
- Backend: Node.js + Express.
- Realtime: Socket.io dengan shared Express session.
- Database: PostgreSQL yang sudah dipakai project; jangan mengganti atau
  memigrasikan database tanpa permintaan eksplisit.
- State pertandingan realtime harus authoritative di server.
- Mode individu dan mode multiplayer harus memiliki lifecycle yang terisolasi.

## User preferences

- Pertahankan struktur project yang ada.
- Kerjakan scope roadmap per hari; jangan menggabungkan hari sebelum kriteria
  hari sebelumnya diverifikasi.
- Untuk mockup/UI, utamakan keterbacaan, responsif Android, dan reuse asset
  Pet TOMAT yang sudah ada.