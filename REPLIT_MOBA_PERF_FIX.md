# Optimasi Performa Arena MOBA (Replit) — Instruksi langkah demi langkah

Tujuan
- Menghilangkan lag/“berat” saat movement di arena MOBA pada perangkat HP.
- Terapkan perbaikan langsung via Replit: profiling → perbaikan kode → uji → build APK (opsional).
- File ini adalah prompt langkah demi langkah yang bisa kamu tempel ke repo (mis. `REPLIT_MOBA_PERF_FIX.md`) dan ikuti di Replit.

Ringkasan singkat (apa yang harus dilakukan)
- Profil dulu: rekam trace di Chrome DevTools pada device/Emulator — cari yang memakan waktu: Recalculate Style, Layout, Paint, Rasterize, Composite Layers.
- Gerakan: selalu pakai transform: translate3d(...) (GPU compositing) — jangan ubah left/top.
- Hindari setState tiap frame: perbarui DOM lewat refs atau gunakan engine rendering (canvas/WebGL) jika banyak entitas.
- Kurangi jumlah layer ber-GPU: hapus will-change dari banyak elemen; hanya set sementara saat animasi.
- Kurangi ukuran & jumlah texture: gunakan versi resolusi lebih rendah untuk mobile, atlas/gabungkan background statis.
- Lazy-load dan decode asset: jangan precache semua sprite besar saat startup; decode gambar off-thread (createImageBitmap) bila perlu.
- Jika > ~20 sprite bergerak pada mobile, pertimbangkan Canvas 2D atau WebGL (pixi.js / Phaser).

Langkah 0 — Catatan awal
- Hasil pencarian kode menemukan renderer sprite berbasis CSS (sheet 768×768, cell 128×128) di `src/components/*.jsx`. Itu sendiri tidak masalah, tetapi kombinasi: banyak instance sprite + banyak will-change + update posisi yang memicu layout → jank.
- Instruksi di bawah bersifat generik & cepat dipasang di Replit. Setelah perubahan, uji di HP/Emulator.

1) Profiling (WAJIB sebelum ubah besar)
- Jalankan dev server di Replit:
  - pnpm install
  - pnpm dev
- Di HP Android: buka Chrome -> chrome://inspect -> connect ke WebView/Remote target (atau gunakan emulator).
- Performance tab: start recording, lakukan scenario yang menimbulkan lag, stop.
- Catatan:
  - Jika dominan “Recalculate Style” / “Layout” → ada property yang memicu reflow (left/top/width/height).
  - Jika dominan “Paint” / “Rasterize” / “Composite Layers” → banyak layer/texture/overdraw.

2) Cari pola yang berbahaya di kode (jalankan di Replit shell)
- Cari update posisi yang menggunakan left/top atau setState tiap frame:
  - grep -R --line-number "style.left" src || true
  - grep -R --line-number "style.top" src || true
  - grep -R --line-number "\\.left" src || true
  - grep -R --line-number "setState(" src | grep -E "x|y|pos|position" || true
  - grep -R --line-number "will-change" src || true
- Jika menemukan update posisi yang dijalankan sering (mis. di event mousemove / socket tick) catat file tersebut.

3) Contoh perubahan: dari left/top atau setState-per-frame → transform + requestAnimationFrame
- Tujuan: hindari layout & rerender React setiap frame.
- Contoh komponen sebelum (berbahaya):
  - setState({ x, y }) tiap tick
  - element.style.left = `${x}px` (memicu layout)
- Contoh patch efisien (ganti di file yang meng-handle movement):

```jsx
// name=example/MoveToTransform.jsx
import React, { useRef, useEffect } from 'react';

// Komponen contoh -- gunakan pola ini untuk entitas di arena
export default function MovableSprite({ initialX = 0, initialY = 0, getNextPos /* fn: () => {x,y} */ }) {
  const el = useRef(null);
  const pos = useRef({ x: initialX, y: initialY });
  useEffect(() => {
    let raf = null;
    function tick() {
      // contoh: update pos.x,pos.y berdasarkan velocity / input
      const { x, y } = pos.current;
      if (el.current) el.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <div ref={el} style={{ position: 'absolute', willChange: 'transform' }}>...</div>;
}
```

- Catatan: will-change: transform sedikit membantu, tapi jangan set untuk ratusan elemen sekaligus.

4) Kurangi layer promotion / will-change abuse
- will-change pada banyak elemen memaksa browser membuat banyak texture layer GPU → memory pressure → jank.
- Pattern aman: tambahkan will-change hanya saat animasi dimulai, lalu remove setelah selesai:
```css
/* tambahkan via class saat animasi singkat */
.animating { will-change: transform; }
/* remove class setelah animasi selesai */
```

5) Sprite-sheet & ukuran asset
- Sheet 768×768 per character = OK untuk satu karakter. Masalah muncul kalau:
  - Banyak sheet beresolusi penuh dimuat sekaligus.
  - Setiap skin/varian di-precache dan didekode sekaligus.
- Rekomendasi:
  - Sediakan versi mobile (contoh: 384×384 atau 512×512) dan pilih berdasarkan devicePixelRatio / screen size.
  - Kompres ke WebP/AVIF untuk ukuran lebih kecil (WebView Android modern mendukung WebP).
  - Gunakan satu atlas untuk dekorasi statis (background tiles digabung ke satu gambar) agar browser merender satu layer.

6) Decode gambar off-main-thread
- Untuk menghindari hang saat decode image besar, gunakan createImageBitmap saat mungkin:
```js
// decode off-main-thread friendly
const resp = await fetch('/moba-sprite.webp');
const blob = await resp.blob();
const bitmap = await createImageBitmap(blob); // non-blocking render thread
// gunakan bitmap di canvas atau set as ImageBitmapSource
```
- Atau biarkan browser decode dengan <img decoding="async" srcset="..."> untuk meminimalkan blocking.

7) Jika banyak entity: pindah ke Canvas/WebGL
- DOM + CSS cepat untuk beberapa sprites (10–20) tapi untuk banyak (20+) gunakan canvas2D atau WebGL (pixi.js, Phaser).
- Contoh arsitektur: background statis (DOM/CSS), HUD/overlay (DOM), sprite world (pixi canvas).

8) Network & event throttling
- Batasi frekuensi event socket (posisi/inputs) yang dikirim ke server: kompres/quantize pos & gunakan dead-reckoning.
- Pada client, apply client-side smoothing/interpolation sehingga UI tidak jank saat paket terjatuh.

9) APK / build & asset bundling (kaitannya dengan repo)
- BUILD_APK.md tunjukkan semua asset di-bundle offline. Jangan bundel semua varian skin untuk initial APK:
  - Strategy: hanya bundle core minimal; sediakan mekanisme lazy-download asset MOBA saat pertama kali user masuk arena.
  - Atau sediakan feature-flag untuk mengaktifkan MOBA assets pada install khusus.

10) Monitoring & metrik produksi
- Laporkan FPS (via requestAnimationFrame timestamps), memori gambar, dan peak paint times ke log/telemetry saat mode debug. Contoh sederhana:
```js
let last = performance.now();
function frame(t) {
  const delta = t - last;
  last = t;
  // hitung FPS smoothed
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

Checklist cepat untuk debugging kamu sekarang
- [ ] Profil trace di device target → identifikasi apakah Layout/Paint atau Composite masalah utama.
- [ ] Pastikan movement komponen menggunakan transform, bukan top/left.
- [ ] Cek jumlah sprites aktif saat lag (console: document.querySelectorAll('.pet-sprite').length).
- [ ] Hapus/kurangi will-change di banyak elemen.
- [ ] Uji dengan menonaktifkan beberapa sprite/background untuk verifikasi bottleneck.
- [ ] Siapkan low-res sprite-sheet dan lazy-load asset MOBA.

Jika mau, saya bisa:
- Mencari file yang meng-handle movement di repo (cari komponen arena / match renderer) dan tunjukkan perubahan patch (PR) untuk mengganti left/top → transform serta mengganti render heavy DOM ke canvas/pixi jika perlu.
- Bikin contoh PR perubahan minimal (React component) yang mengganti update posisi menjadi rAF+transform dan menghilangkan setState tiap frame.

Pilih langkah selanjutnya:
- Mau saya langsung cari dan patch file movement di repo? (Saya butuh nama/letak komponen arena kalau sudah tahu, atau saya bisa search lebih luas.)
- Atau mau saya buat contoh migrasi ke pixi.js / contoh optimasi transform untuk komponen pet tertentu?
