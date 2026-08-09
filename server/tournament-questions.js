/**
 * TOMAT Tournament — server-authoritative question generators
 * Satu fungsi genTournamentQ(gameKey) untuk semua game yang didukung.
 */

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

const generators = {
  // Katak Pelompat — bilangan bulat, garis bilangan
  katak: () => {
    const jump  = rand(2, 7)
    const bound = 15 - jump
    const start = rand(-bound, bound)
    const isForward = Math.random() < 0.5
    const answer = isForward ? start + jump : start - jump
    return {
      question: {
        start, jump, isForward,
        text: `Katak di posisi ${start}, lompat ${isForward ? 'maju' : 'mundur'} ${jump} langkah. Posisi akhir?`,
      },
      answer,
      sliderMin: -20,
      sliderMax: 20,
      gameLabel: 'Katak Pelompat',
    }
  },

  // Termometer — penjumlahan/pengurangan bilangan bulat
  termometer: () => {
    const start  = rand(-15, 15)
    const change = rand(1, 10) * (Math.random() < 0.5 ? 1 : -1)
    const answer = start + change
    return {
      question: {
        text: `Suhu awal ${start}°C, ${change >= 0 ? 'naik' : 'turun'} ${Math.abs(change)}°. Suhu akhir?`,
      },
      answer,
      sliderMin: -25,
      sliderMax: 25,
      gameLabel: 'Termometer',
    }
  },

  // Pabrik Robot — perkalian bilangan bulat
  pabrikrobot: () => {
    const a = rand(2, 9)
    const b = rand(2, 9) * (Math.random() < 0.3 ? -1 : 1)
    const answer = a * b
    return {
      question: { text: `${a} × ${b} = ?` },
      answer,
      sliderMin: -81,
      sliderMax: 81,
      gameLabel: 'Pabrik Robot',
    }
  },

  // FPB
  gembok: () => {
    const factors = [2, 3, 4, 5, 6]
    const fpb = factors[rand(0, factors.length - 1)]
    const a = fpb * rand(2, 6)
    let b = fpb * rand(2, 6)
    if (a === b) b += fpb
    return {
      question: { text: `FPB dari ${a} dan ${b}?` },
      answer: fpb,
      sliderMin: 1,
      sliderMax: 30,
      gameLabel: 'Gembok Roda Gigi',
    }
  },

  // KPK
  mercusuar: () => {
    const a = rand(2, 6)
    const b = rand(2, 6)
    const gcd = (x, y) => y === 0 ? x : gcd(y, x % y)
    const answer = (a * b) / gcd(a, b)
    return {
      question: { text: `KPK dari ${a} dan ${b}?` },
      answer,
      sliderMin: 1,
      sliderMax: 60,
      gameLabel: 'Mercusuar',
    }
  },

  // Spora Jamur — pangkat/eksponen bilangan bulat positif
  sporajamur: () => {
    const bases = [2, 3, 4, 5]
    const exps  = [2, 3]
    const base  = bases[rand(0, bases.length - 1)]
    const exp   = exps[rand(0, exps.length - 1)]
    const answer = Math.pow(base, exp)
    return {
      question: { text: `${base}^${exp} = ? (${base} dipangkatkan ${exp})`, base, exp },
      answer,
      sliderMin: 1,
      sliderMax: 150,
      gameLabel: 'Spora Jamur',
    }
  },

  // Scanner Permata — hitung bilangan prima dari daftar angka
  scanner: () => {
    function isPrime(n) {
      if (n < 2) return false
      for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false
      return true
    }
    function shuffleArr(arr) {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }
    const pool = [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]
    const selected = shuffleArr(pool).slice(0, 6)
    const primeCount = selected.filter(isPrime).length
    return {
      question: {
        text: `Dari angka-angka: ${selected.join(', ')} — berapa banyak yang merupakan bilangan prima?`,
        numbers: selected,
      },
      answer: primeCount,
      sliderMin: 0,
      sliderMax: 6,
      gameLabel: 'Scanner Permata',
    }
  },

  // ── GRADE 8 BAB I: Bilangan Berpangkat ─────────────────────────────────────

  // Penggandaan Sel Ramuan — b^e (pangkat bulat positif)
  g8selramuan: () => {
    const bases = [2, 3, 4]
    const exps  = [2, 3]
    const b = bases[rand(0, bases.length - 1)]
    const e = exps[rand(0, exps.length - 1)]
    const answer = Math.pow(b, e)
    return {
      question: { text: `Sel berkembang ${b}× setiap tahap selama ${e} tahap. Nilai ${b}^${e} = ?` },
      answer,
      sliderMin: 1,
      sliderMax: 70,
      gameLabel: 'Penggandaan Sel Ramuan',
    }
  },

  // Ekstraksi Racun Miniatur — p0 × b^n (pertumbuhan eksponensial berlapis)
  g8racunminiatur: () => {
    const p0 = rand(1, 2)
    const b  = rand(2, 3)
    const n  = rand(2, 3)
    const answer = p0 * Math.pow(b, n)
    return {
      question: { text: `${p0} racun awal berkembang ${b}× setiap tahap, selama ${n} tahap. Berapa total racun? (${p0} × ${b}^${n})` },
      answer,
      sliderMin: 1,
      sliderMax: 60,
      gameLabel: 'Ekstraksi Racun Miniatur',
    }
  },

  // Pemisahan Elemen Kristal — akar pangkat (√, ∛, ∜)
  g8kristal: () => {
    const ROOTS = [
      // akar kuadrat
      { n: 2, val: 4,   answer: 2 },
      { n: 2, val: 9,   answer: 3 },
      { n: 2, val: 16,  answer: 4 },
      { n: 2, val: 25,  answer: 5 },
      { n: 2, val: 36,  answer: 6 },
      { n: 2, val: 49,  answer: 7 },
      // akar pangkat tiga
      { n: 3, val: 8,   answer: 2 },
      { n: 3, val: 27,  answer: 3 },
      { n: 3, val: 64,  answer: 4 },
      { n: 3, val: 125, answer: 5 },
    ]
    const r = ROOTS[rand(0, ROOTS.length - 1)]
    const sym = r.n === 2 ? '√' : r.n === 3 ? '∛' : '∜'
    return {
      question: { text: `Nilai dari ${sym}${r.val} = ?` },
      answer: r.answer,
      sliderMin: 1,
      sliderMax: 12,
      gameLabel: 'Pemisahan Elemen Kristal',
    }
  },

  // Fusi Energi Alkemis — pangkat pecahan b^(p/q)
  g8fusienergi: () => {
    const POOL = [
      { expr: '8^(1/3)',  answer: 2 },
      { expr: '27^(1/3)', answer: 3 },
      { expr: '4^(1/2)',  answer: 2 },
      { expr: '9^(1/2)',  answer: 3 },
      { expr: '64^(1/3)', answer: 4 },
      { expr: '8^(2/3)',  answer: 4 },
      { expr: '27^(2/3)', answer: 9 },
      { expr: '16^(3/4)', answer: 8 },
      { expr: '4^(3/2)',  answer: 8 },
      { expr: '25^(1/2)', answer: 5 },
      { expr: '16^(1/2)', answer: 4 },
      { expr: '64^(2/3)', answer: 16 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Nilai dari ${p.expr} = ?` },
      answer: p.answer,
      sliderMin: 1,
      sliderMax: 20,
      gameLabel: 'Fusi Energi Alkemis',
    }
  },

  // Penyederhanaan Mantra Akar — √a + √b = ?√c (koefisien surd)
  g8mantraakar: () => {
    const PAIRS = [
      { na: 8,  nb: 18, base: 2, answer: 5 },   // 2√2 + 3√2
      { na: 50, nb: 18, base: 2, answer: 8 },   // 5√2 + 3√2
      { na: 32, nb: 8,  base: 2, answer: 6 },   // 4√2 + 2√2
      { na: 12, nb: 27, base: 3, answer: 5 },   // 2√3 + 3√3
      { na: 48, nb: 75, base: 3, answer: 9 },   // 4√3 + 5√3
      { na: 20, nb: 45, base: 5, answer: 5 },   // 2√5 + 3√5
    ]
    const p = PAIRS[rand(0, PAIRS.length - 1)]
    return {
      question: { text: `√${p.na} + √${p.nb} = ?√${p.base}` },
      answer: p.answer,
      sliderMin: 1,
      sliderMax: 12,
      gameLabel: 'Penyederhanaan Mantra Akar',
    }
  },

  // Ekspedisi Geolog Kerajaan — p0 × b^n (konteks mineral/lapisan)
  g8geolog: () => {
    const p0 = rand(1, 2)
    const b  = rand(2, 3)
    const n  = rand(2, 3)
    const answer = p0 * Math.pow(b, n)
    return {
      question: { text: `Geolog menemukan ${p0} mineral. Setiap lapisan menggandakan ${b}× selama ${n} lapisan. Total mineral? (${p0} × ${b}^${n})` },
      answer,
      sliderMin: 1,
      sliderMax: 60,
      gameLabel: 'Ekspedisi Geolog Kerajaan',
    }
  },

  // ── GRADE 8 BAB II: Teorema Pythagoras ─────────────────────────────────────

  // Bidikan Tepat Trebuchet — hypotenuse given two legs
  g8trebuchet: () => {
    const TRIPLES = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15],[7,24,25],[9,40,41]]
    const [a, b, c] = TRIPLES[rand(0, TRIPLES.length - 1)]
    return {
      question: { text: `Trebuchet membentuk segitiga siku-siku. Tinggi tiang (a) = ${a} m, jarak ke sasaran (b) = ${b} m. Berapa panjang tali pelontar (c)?`, a, b },
      answer: c,
      sliderMin: 1,
      sliderMax: 50,
      gameLabel: 'Bidikan Tepat Trebuchet',
    }
  },

  // Restorasi Perisai Kerajaan — rhombus missing diagonal
  g8perisai: () => {
    const RHOMBUS = [
      { s:5,  d1:6,  d2:8  },
      { s:13, d1:10, d2:24 },
      { s:17, d1:16, d2:30 },
      { s:10, d1:12, d2:16 },
      { s:5,  d1:8,  d2:6  },
    ]
    const r = RHOMBUS[rand(0, RHOMBUS.length - 1)]
    return {
      question: { text: `Perisai berbentuk belah ketupat. Sisi (s) = ${r.s} cm, diagonal d1 = ${r.d1} cm. Berapa diagonal d2? (d2 = 2 × √(s² − (d1/2)²))`, s: r.s, d1: r.d1 },
      answer: r.d2,
      sliderMin: 1,
      sliderMax: 55,
      gameLabel: 'Restorasi Perisai Kerajaan',
    }
  },

  // Harta Karun di Sudut Ruangan — space diagonal of a box
  g8hartakarun: () => {
    const BOXES = [
      {l:1,w:2,h:2,d:3}, {l:2,w:3,h:6,d:7}, {l:2,w:4,h:4,d:6},
      {l:1,w:4,h:8,d:9}, {l:2,w:6,h:9,d:11},{l:6,w:6,h:7,d:11},
      {l:3,w:4,h:12,d:13},{l:4,w:7,h:4,d:9},
    ]
    const b = BOXES[rand(0, BOXES.length - 1)]
    return {
      question: { text: `Peti harta berbentuk balok: P=${b.l} m, L=${b.w} m, T=${b.h} m. Berapa panjang diagonal ruangnya? (d = √(P²+L²+T²))`, l: b.l, w: b.w, h: b.h },
      answer: b.d,
      sliderMin: 1,
      sliderMax: 18,
      gameLabel: 'Harta Karun di Sudut Ruangan',
    }
  },

  // Inspeksi Sudut Menara — find a² + b²
  g8inspeksisudut: () => {
    const TRIPLES = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15],[7,24,25]]
    const [a, b] = TRIPLES[rand(0, TRIPLES.length - 1)]
    const answer = a * a + b * b
    return {
      question: { text: `Periksa menara: sisi a = ${a} m, sisi b = ${b} m. Berapa nilai a² + b²?`, a, b },
      answer,
      sliderMin: 1,
      sliderMax: 650,
      gameLabel: 'Inspeksi Sudut Menara',
    }
  },

  // Peta Radar Pengintai — distance between two points
  g8petaradar: () => {
    const PAIRS = [
      {x1:0,y1:0,x2:3,y2:4,d:5}, {x1:0,y1:0,x2:5,y2:12,d:13},
      {x1:1,y1:1,x2:4,y2:5,d:5}, {x1:2,y1:3,x2:7,y2:15,d:13},
      {x1:0,y1:0,x2:8,y2:15,d:17},{x1:0,y1:0,x2:6,y2:8,d:10},
      {x1:3,y1:0,x2:3,y2:12,d:12},
    ]
    const p = PAIRS[rand(0, PAIRS.length - 1)]
    return {
      question: { text: `Ksatria di (${p.x1},${p.y1}), benteng musuh di (${p.x2},${p.y2}). Berapa jaraknya? (d = √(Δx²+Δy²))`, x1:p.x1, y1:p.y1, x2:p.x2, y2:p.y2 },
      answer: p.d,
      sliderMin: 1,
      sliderMax: 25,
      gameLabel: 'Peta Radar Pengintai',
    }
  },

  // Misi Penyelamatan Tali Gantung — hypotenuse (context: rope/ladder)
  g8taligantung: () => {
    const TRIPLES = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15],[9,40,41]]
    const [a, b, c] = TRIPLES[rand(0, TRIPLES.length - 1)]
    return {
      question: { text: `Tali penyelamat melintangi jurang. Tinggi (a) = ${a} m, jarak horisontal (b) = ${b} m. Berapa panjang tali (c)?`, a, b },
      answer: c,
      sliderMin: 1,
      sliderMax: 50,
      gameLabel: 'Misi Penyelamatan Tali Gantung',
    }
  },

  // ── GRADE 8 BAB III: Persamaan & Pertidaksamaan Linear Satu Variabel ────────

  // Teka-Teki Gerbang Logika — ax = c → x
  g8gerbanglogika: () => {
    const a = rand(2, 6)
    const x = rand(2, 9)
    const c = a * x
    return {
      question: { text: `Gerbang logika: ${a}x = ${c}. Nilai x = ?` },
      answer: x,
      sliderMin: 1,
      sliderMax: 15,
      gameLabel: 'Teka-Teki Gerbang Logika',
    }
  },

  // Katrol Penyeimbang Jembatan — ax + b = c → x
  g8katrol: () => {
    const a = rand(2, 5)
    const x = rand(1, 8)
    const b = rand(1, 10)
    const c = a * x + b
    return {
      question: { text: `Katrol: ${a}x + ${b} = ${c}. Nilai x = ?` },
      answer: x,
      sliderMin: 1,
      sliderMax: 12,
      gameLabel: 'Katrol Penyeimbang Jembatan',
    }
  },

  // Penerjemah Gulungan Kuno — ax + b = c dengan konteks berbeda
  g8gulungan: () => {
    const TMPL = [
      (a,b,c) => `Gulungan kuno: ${a}x + ${b} = ${c}. Nilai x = ?`,
      (a,b,c) => `Surat rahasia: nilai ${a} kali angka ditambah ${b} sama dengan ${c}. Angkanya = ?`,
      (a,b,c) => `Kode gulungan: ${a}x + ${b} = ${c}, x = ?`,
    ]
    const a = rand(2, 5)
    const x = rand(1, 8)
    const b = rand(1, 12)
    const c = a * x + b
    const t = TMPL[rand(0, TMPL.length - 1)]
    return {
      question: { text: t(a, b, c) },
      answer: x,
      sliderMin: 1,
      sliderMax: 12,
      gameLabel: 'Penerjemah Gulungan Kuno',
    }
  },

  // Kapasitas Kereta Kuda — ax = c (konteks kapasitas/muatan)
  g8keretakuda: () => {
    const a = rand(3, 7)
    const x = rand(2, 8)
    const c = a * x
    return {
      question: { text: `Kereta kuda membawa ${a} kotak per perjalanan. Total muatan ${c} kotak. Berapa perjalanan diperlukan (x)? ${a}x = ${c}` },
      answer: x,
      sliderMin: 1,
      sliderMax: 12,
      gameLabel: 'Kapasitas Kereta Kuda',
    }
  },

  // ── GRADE 7 BAB II: Bilangan Rasional ───────────────────────────────────────

  // Koki Pizza — sisa potongan pizza
  kokipizza: () => {
    const CASES = [
      { n:8,  eaten:3, rem:5 }, { n:6,  eaten:2, rem:4 },
      { n:10, eaten:3, rem:7 }, { n:12, eaten:5, rem:7 },
      { n:8,  eaten:5, rem:3 }, { n:6,  eaten:4, rem:2 },
      { n:10, eaten:7, rem:3 }, { n:12, eaten:8, rem:4 },
    ]
    const c = CASES[rand(0, CASES.length - 1)]
    return {
      question: { text: `Pizza dibagi ${c.n} potongan. ${c.eaten} potongan dimakan. Berapa potongan yang tersisa?` },
      answer: c.rem,
      sliderMin: 0,
      sliderMax: 12,
      gameLabel: 'Koki Pizza',
    }
  },

  // Pipa Air — pecahan × bilangan bulat → hasil bulat
  pipaair: () => {
    const POOL = [
      { p:1, q:2, n:10, a:5  }, { p:3, q:4, n:8,  a:6  },
      { p:2, q:3, n:9,  a:6  }, { p:3, q:5, n:10, a:6  },
      { p:1, q:3, n:12, a:4  }, { p:5, q:6, n:12, a:10 },
      { p:2, q:5, n:15, a:6  }, { p:3, q:8, n:16, a:6  },
    ]
    const e = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Pipa mengalirkan ${e.p}/${e.q} liter per menit. Dalam ${e.n} menit, berapa liter total? (${e.p}/${e.q} × ${e.n})` },
      answer: e.a,
      sliderMin: 1,
      sliderMax: 15,
      gameLabel: 'Pipa Air Ajaib',
    }
  },

  // Bor Tambang — pecahan × bilangan bulat (konteks tambang)
  bortambang: () => {
    const POOL = [
      { p:2, q:5, n:15, a:6  }, { p:3, q:4, n:12, a:9  },
      { p:1, q:4, n:20, a:5  }, { p:3, q:5, n:25, a:15 },
      { p:2, q:3, n:6,  a:4  }, { p:5, q:6, n:18, a:15 },
      { p:3, q:7, n:14, a:6  }, { p:4, q:5, n:20, a:16 },
    ]
    const e = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Bor tambang menghasilkan ${e.p}/${e.q} ton per hari. Dalam ${e.n} hari, berapa ton total? (${e.p}/${e.q} × ${e.n})` },
      answer: e.a,
      sliderMin: 1,
      sliderMax: 20,
      gameLabel: 'Bor Tambang',
    }
  },

  // KaBaTaKu — pecahan dari bilangan bulat
  kabataku: () => {
    const POOL = [
      { text:'2/6 dari 18 = ?', a:6  }, { text:'3/5 dari 25 = ?', a:15 },
      { text:'4/8 dari 16 = ?', a:8  }, { text:'2/4 dari 12 = ?', a:6  },
      { text:'3/9 dari 27 = ?', a:9  }, { text:'4/6 dari 18 = ?', a:12 },
      { text:'5/10 dari 30 = ?',a:15 }, { text:'3/4 dari 20 = ?', a:15 },
      { text:'2/7 dari 21 = ?', a:6  }, { text:'5/9 dari 18 = ?', a:10 },
    ]
    const c = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: c.text },
      answer: c.a,
      sliderMin: 1,
      sliderMax: 20,
      gameLabel: 'KaBaTaKu Pecahan',
    }
  },

  // Baterai — persentase dari kapasitas (hasil bulat)
  baterai: () => {
    const POOL = [
      { pct:25, tot:80,  a:20  }, { pct:50, tot:60,  a:30  },
      { pct:75, tot:40,  a:30  }, { pct:40, tot:50,  a:20  },
      { pct:30, tot:100, a:30  }, { pct:60, tot:50,  a:30  },
      { pct:25, tot:120, a:30  }, { pct:20, tot:150, a:30  },
    ]
    const e = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Baterai kapasitas ${e.tot} unit. Saat ini terisi ${e.pct}%. Berapa unit yang terisi? (${e.pct}% × ${e.tot})` },
      answer: e.a,
      sliderMin: 1,
      sliderMax: 50,
      gameLabel: 'Baterai Ajaib',
    }
  },

  // Timbangan Emas — pecahan dari bilangan bulat (konteks timbangan)
  timbanganemas: () => {
    const POOL = [
      { text:'3/4 dari 8 gram = ?',  a:6  },
      { text:'5/6 dari 12 gram = ?', a:10 },
      { text:'2/3 dari 9 gram = ?',  a:6  },
      { text:'7/8 dari 16 gram = ?', a:14 },
      { text:'3/5 dari 20 gram = ?', a:12 },
      { text:'4/7 dari 21 gram = ?', a:12 },
      { text:'5/9 dari 18 gram = ?', a:10 },
      { text:'3/4 dari 24 gram = ?', a:18 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: p.text },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 25,
      gameLabel: 'Timbangan Emas',
    }
  },

  // Fokus Teleskop — perbesaran = panjang / okuler
  fokusteleskop: () => {
    const POOL = [
      { f:120, o:20, a:6 }, { f:180, o:30, a:6 }, { f:100, o:25, a:4 },
      { f:200, o:40, a:5 }, { f:150, o:50, a:3 }, { f:240, o:30, a:8 },
      { f:280, o:40, a:7 }, { f:270, o:90, a:3 }, { f:360, o:60, a:6 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Teleskop panjang ${p.f} cm, okuler ${p.o} cm. Perbesaran = ${p.f} ÷ ${p.o} = ?` },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 12,
      gameLabel: 'Fokus Teleskop',
    }
  },

  // ── GRADE 7 BAB III: Rasio & Perbandingan ───────────────────────────────────

  // Ramuan Jus — perbandingan bagian : total
  ramuanjus: () => {
    const POOL = [
      { ra:2, rb:3, tot:20, qa:'apel', qb:'jeruk', aa:8,  ab:12 },
      { ra:3, rb:5, tot:24, qa:'apel', qb:'jeruk', aa:9,  ab:15 },
      { ra:1, rb:3, tot:16, qa:'apel', qb:'jeruk', aa:4,  ab:12 },
      { ra:2, rb:6, tot:24, qa:'apel', qb:'jeruk', aa:6,  ab:18 },
      { ra:3, rb:4, tot:21, qa:'apel', qb:'jeruk', aa:9,  ab:12 },
    ]
    const e = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Rasio ${e.qa}:${e.qb} = ${e.ra}:${e.rb}. Total minuman ${e.tot} liter. Berapa liter ${e.qa}?` },
      answer: e.aa,
      sliderMin: 1,
      sliderMax: 25,
      gameLabel: 'Ramuan Jus',
    }
  },

  // Kasir Sihir — proporsi langsung (harga × jumlah)
  kasirsihir: () => {
    const POOL = [
      { item:'pensil', n1:3, h1:9,  n2:5, a:15 },
      { item:'buku',   n1:4, h1:12, n2:6, a:18 },
      { item:'permen', n1:5, h1:15, n2:8, a:24 },
      { item:'penghapus', n1:2, h1:6, n2:7, a:21 },
      { item:'pulpen',    n1:3, h1:12, n2:5, a:20 },
      { item:'crayon',    n1:4, h1:20, n2:3, a:15 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Harga ${p.n1} ${p.item} = ${p.h1} ribu. Harga ${p.n2} ${p.item} = ?` },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 30,
      gameLabel: 'Kasir Sihir',
    }
  },

  // Benteng — skala peta/dimensi
  benteng: () => {
    const POOL = [
      { scale:1, real:3, cm:6, a:18 },
      { scale:1, real:5, cm:4, a:20 },
      { scale:1, real:4, cm:7, a:28 },
      { scale:1, real:2, cm:9, a:18 },
      { scale:1, real:6, cm:5, a:30 },
      { scale:1, real:3, cm:8, a:24 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Peta skala 1:${p.real}. Panjang di peta ${p.cm} cm. Panjang sebenarnya = ? cm` },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 40,
      gameLabel: 'Benteng Kerajaan',
    }
  },

  // Nakhoda — kecepatan dan jarak (proporsi)
  nakhoda: () => {
    const POOL = [
      { v:30, t:4, d:120 }, { v:40, t:3, d:120 }, { v:50, t:2, d:100 },
      { v:60, t:3, d:180 }, { v:25, t:4, d:100 }, { v:45, t:2, d:90  },
      { v:80, t:3, d:240 }, { v:35, t:4, d:140 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Kapal berlayar dengan kecepatan ${p.v} km/jam selama ${p.t} jam. Berapa jarak yang ditempuh?` },
      answer: p.d,
      sliderMin: 1,
      sliderMax: 300,
      gameLabel: 'Petualangan Nakhoda',
    }
  },

  // Rel Kereta — kecepatan = jarak/waktu
  relkereta: () => {
    const POOL = [
      { d:240, t:4, v:60 }, { d:180, t:3, v:60 }, { d:300, t:5, v:60 },
      { d:200, t:4, v:50 }, { d:210, t:3, v:70 }, { d:350, t:5, v:70 },
      { d:160, t:4, v:40 }, { d:240, t:3, v:80 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Kereta menempuh ${p.d} km dalam ${p.t} jam. Kecepatan rata-rata (km/jam) = ?` },
      answer: p.v,
      sliderMin: 1,
      sliderMax: 120,
      gameLabel: 'Rel Kereta Ekspres',
    }
  },

  // Brankas — perbandingan senilai (cari salah satu bagian)
  brankas: () => {
    const POOL = [
      { ra:3, rb:2, va:15, a:10 }, { ra:4, rb:3, va:20, a:15 },
      { ra:2, rb:5, va:8,  a:20 }, { ra:3, rb:4, va:9,  a:12 },
      { ra:5, rb:2, va:25, a:10 }, { ra:2, rb:3, va:10, a:15 },
      { ra:4, rb:5, va:16, a:20 }, { ra:3, rb:7, va:9,  a:21 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Brankas A berisi ${p.va} koin. Rasio A:B = ${p.ra}:${p.rb}. Berapa koin di brankas B?` },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 30,
      gameLabel: 'Brankas Rahasia',
    }
  },

  // ── GRADE 9 BAB I: SPLDV ────────────────────────────────────────────────────

  // Manifest Kargo — x+y=S, x-y=D → x = (S+D)/2
  g9manifest: () => {
    const POOL = [
      { S:10, D:2, x:6, y:4 }, { S:12, D:4, x:8, y:4 },
      { S:8,  D:2, x:5, y:3 }, { S:14, D:4, x:9, y:5 },
      { S:10, D:4, x:7, y:3 }, { S:16, D:2, x:9, y:7 },
      { S:12, D:6, x:9, y:3 }, { S:18, D:4, x:11,y:7 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Dua kontainer: jumlah isinya ${p.S} ton, selisihnya ${p.D} ton. Berapa ton kontainer yang lebih besar?` },
      answer: p.x,
      sliderMin: 1,
      sliderMax: 15,
      gameLabel: 'Manifest Kargo Alien',
    }
  },

  // Plot Rute — persamaan linear y = mx + b, cari y
  g9plotrute: () => {
    const POOL = [
      { m:2,  b:3, x:4,  a:11 }, { m:3,  b:1, x:5,  a:16 },
      { m:4,  b:2, x:3,  a:14 }, { m:2,  b:5, x:6,  a:17 },
      { m:3,  b:4, x:4,  a:16 }, { m:5,  b:2, x:3,  a:17 },
      { m:2,  b:6, x:5,  a:16 }, { m:4,  b:1, x:4,  a:17 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Persamaan rute: y = ${p.m}x + ${p.b}. Jika x = ${p.x}, berapa nilai y?` },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 25,
      gameLabel: 'Plotting Rute Grafik',
    }
  },

  // Interseksi Radar — x+y=S, x-y=D → x (eliminasi)
  g9interseksi: () => {
    const POOL = [
      { S:11, D:3, x:7, y:4 }, { S:13, D:5, x:9, y:4 },
      { S:9,  D:1, x:5, y:4 }, { S:15, D:3, x:9, y:6 },
      { S:11, D:5, x:8, y:3 }, { S:17, D:3, x:10,y:7 },
      { S:13, D:7, x:10,y:3 }, { S:19, D:5, x:12,y:7 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Dua sinyal radar: x + y = ${p.S} dan x − y = ${p.D}. Cari nilai x.` },
      answer: p.x,
      sliderMin: 1,
      sliderMax: 15,
      gameLabel: 'Interseksi Radar Sinyal',
    }
  },

  // Dekripsi Konsol — 2x + y = b, x + y = c → x = b − c
  g9konsol: () => {
    const POOL = [
      { x:3, y:4, b:10, c:7  }, { x:5, y:2, b:12, c:7  },
      { x:4, y:3, b:11, c:7  }, { x:6, y:1, b:13, c:7  },
      { x:3, y:5, b:11, c:8  }, { x:7, y:2, b:16, c:9  },
      { x:4, y:6, b:14, c:10 }, { x:5, y:4, b:14, c:9  },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Sistem kode: 2x + y = ${p.b} dan x + y = ${p.c}. Nilai x = ?` },
      answer: p.x,
      sliderMin: 1,
      sliderMax: 12,
      gameLabel: 'Dekripsi Konsol Komputer',
    }
  },

  // Pasar Galaksi — SPLDV harga barang: p*x + q*y = total, cari x
  g9pasargalaksi: () => {
    const POOL = [
      { px:3, qy:2, t1:16, t2:10, x:4, label1:'apel', label2:'jeruk' },
      { px:4, qy:3, t1:23, t2:12, x:5, label1:'batu', label2:'kristal' },
      { px:2, qy:5, t1:21, t2:10, x:3, label1:'logam', label2:'mineral' },
      { px:5, qy:2, t1:19, t2:6,  x:3, label1:'alien', label2:'robot' },
      { px:3, qy:4, t1:22, t2:12, x:4, label1:'bahan', label2:'sumber' },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Harga ${p.px} ${p.label1} + ${p.qy} ${p.label2} = ${p.t1}. Harga ${p.px} ${p.label1} saja = ${p.t2}. Harga 1 ${p.label2} = ?` },
      answer: p.x,
      sliderMin: 1,
      sliderMax: 12,
      gameLabel: 'Barter Di Pasar Galaksi',
    }
  },

  // ── GRADE 9 BAB II: Lingkaran (π = 22/7) ────────────────────────────────────

  // Kalibrasi Radar — keliling lingkaran C = 2πr (r kelipatan 7)
  g9kalibrasirada: () => {
    const POOL = [
      { r:7,  a:44  },
      { r:14, a:88  },
      { r:21, a:132 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Radar berbentuk lingkaran dengan jari-jari r = ${p.r} km. Keliling radar (C = 2πr, π = 22/7) = ?` },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 150,
      gameLabel: 'Kalibrasi Jangkauan Radar',
    }
  },

  // Kalkulasi Orbit — keliling C = πd (d kelipatan 7)
  g9orbit: () => {
    const POOL = [
      { d:14, a:44  },
      { d:28, a:88  },
      { d:42, a:132 },
      { d:7,  a:22  },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Orbit satelit berbentuk lingkaran dengan diameter d = ${p.d} km. Panjang orbit (C = πd, π = 22/7) = ?` },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 150,
      gameLabel: 'Kalkulasi Orbit Satelit',
    }
  },

  // Medan Gaya Shield — luas lingkaran L = πr² (r kelipatan 7)
  g9shieldgaya: () => {
    const POOL = [
      { r:7,  a:154 },
      { r:14, a:616 },
      { r:21, a:1386},
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Shield berbentuk lingkaran dengan jari-jari r = ${p.r} m. Luas shield (L = πr², π = 22/7) = ?` },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 1500,
      gameLabel: 'Medan Gaya Shield Pelindung',
    }
  },

  // Tembakan Laser Sektor — luas juring = (θ/360)·πr²
  g9laserjuring: () => {
    const POOL = [
      { r:14, theta:90,  label:'90°',  a:154 },
      { r:14, theta:180, label:'180°', a:308 },
      { r:21, theta:60,  label:'60°',  a:231 },
      { r:21, theta:120, label:'120°', a:462 },
      { r:7,  theta:180, label:'180°', a:77  },
      { r:14, theta:45,  label:'45°',  a:77  },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Laser menembak sektor lingkaran: r = ${p.r} m, sudut θ = ${p.label}. Luas sektor (π=22/7) = ?` },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 500,
      gameLabel: 'Tembakan Laser Sektor',
    }
  },

  // Jalur Pintas Sabuk Asteroid — jarak titik ke tali busur d = √(r²−(c/2)²)
  g9asteroid: () => {
    const POOL = [
      { r:5,  c:6,  a:4  },
      { r:13, c:10, a:12 },
      { r:10, c:12, a:8  },
      { r:17, c:16, a:15 },
      { r:25, c:14, a:24 },
      { r:13, c:24, a:5  },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Asteroid membentuk tali busur sepanjang ${p.c} m di lingkaran r = ${p.r} m. Jarak tali busur ke pusat lingkaran (d = √(r²−(c/2)²)) = ?` },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 30,
      gameLabel: 'Jalur Pintas Sabuk Asteroid',
    }
  },

  // ── GRADE 9 BAB III: Bangun Ruang ────────────────────────────────────────────

  // Optimalisasi Boks Baterai — volume balok V = p×l×t
  g9boksbaterai: () => {
    const l = rand(2, 6)
    const w = rand(2, 6)
    const h = rand(2, 6)
    return {
      question: { text: `Boks baterai berbentuk balok: panjang ${l}, lebar ${w}, tinggi ${h} cm. Volume = p×l×t = ?` },
      answer: l * w * h,
      sliderMin: 1,
      sliderMax: 250,
      gameLabel: 'Optimalisasi Boks Baterai',
    }
  },

  // Refraktor Kristal — luas selimut prisma segitiga = keliling alas × tinggi
  g9refraktor: () => {
    const TRIPLES = [[3,4,5],[5,12,13],[8,15,17],[6,8,10],[9,12,15]]
    const [a, b, c] = TRIPLES[rand(0, TRIPLES.length - 1)]
    const L = rand(2, 6)
    const perim = a + b + c
    return {
      question: { text: `Prisma segitiga siku-siku: sisi ${a}, ${b}, ${c} cm, tinggi prisma ${L} cm. Luas selimut lateral = keliling alas × tinggi = ?` },
      answer: perim * L,
      sliderMin: 1,
      sliderMax: 250,
      gameLabel: 'Refraktor Kristal Energi',
    }
  },

  // Kuil Alien — volume limas persegi V = 1/3·s²·t
  g9kuilalien: () => {
    const POOL = [
      { s:3, t:3, v:9  }, { s:6, t:4, v:48  }, { s:9, t:6, v:162 },
      { s:3, t:6, v:18 }, { s:6, t:10,v:120 }, { s:9, t:3, v:81  },
      { s:12,t:4, v:192}, { s:3, t:12,v:36  },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Kuil berbentuk limas persegi: alas ${p.s}×${p.s} m, tinggi ${p.t} m. Volume = 1/3·s²·t = ?` },
      answer: p.v,
      sliderMin: 1,
      sliderMax: 220,
      gameLabel: 'Manifest Kargo Alien',
    }
  },

  // Reaktor Bahan — volume tabung V = πr²t (π=22/7, r=7 atau 14)
  g9reaktorbahan: () => {
    const POOL = [
      { r:7,  t:10, v:1540 },
      { r:7,  t:15, v:2310 },
      { r:7,  t:5,  v:770  },
      { r:7,  t:3,  v:462  },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Reaktor berbentuk tabung: jari-jari r = ${p.r} m, tinggi t = ${p.t} m. Volume (V = πr²t, π = 22/7) = ?` },
      answer: p.v,
      sliderMin: 1,
      sliderMax: 2500,
      gameLabel: 'Reaktor Bahan Bakar',
    }
  },

  // Sinyal Kerucut — volume kerucut V = 1/3·πr²·t
  g9sinyalkerucut: () => {
    const POOL = [
      { r:7, h:3, v:154 }, { r:7, h:6, v:308 }, { r:7, h:9, v:462 },
      { r:14,h:3, v:616 }, { r:7, h:12,v:616 }, { r:14,h:6, v:1232},
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Antena berbentuk kerucut: r = ${p.r} m, tinggi t = ${p.h} m. Volume (V = 1/3·πr²·t, π = 22/7) = ?` },
      answer: p.v,
      sliderMin: 1,
      sliderMax: 1300,
      gameLabel: 'Sinyal Kerucut',
    }
  },

  // Bintang — luas permukaan bola L = 4πr²
  g9bintang: () => {
    const POOL = [
      { r:7,  sa:616  },
      { r:14, sa:2464 },
      { r:21, sa:5544 },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Bintang berbentuk bola: jari-jari r = ${p.r} juta km. Luas permukaan (L = 4πr², π = 22/7) = ?` },
      answer: p.sa,
      sliderMin: 1,
      sliderMax: 6000,
      gameLabel: 'Kalkulasi Orbit Satelit',
    }
  },

  // Upgrade Kapal — volume bertambah k³ kali lipat
  g9upgradekapal: () => {
    const POOL = [
      { k:2, v0:3, a:24  }, { k:2, v0:5, a:40  }, { k:3, v0:2, a:54  },
      { k:2, v0:4, a:32  }, { k:3, v0:3, a:81  }, { k:2, v0:6, a:48  },
    ]
    const p = POOL[rand(0, POOL.length - 1)]
    return {
      question: { text: `Upgrade kapal memperbesar setiap dimensi ${p.k}×. Volume awal ${p.v0} m³. Volume baru = ${p.k}³ × ${p.v0} = ?` },
      answer: p.a,
      sliderMin: 1,
      sliderMax: 100,
      gameLabel: 'Upgrade Kapasitas Kapal',
    }
  },
}

export function genTournamentQ(gameKey) {
  const gen = generators[gameKey]
  if (!gen) throw new Error(`Game '${gameKey}' belum didukung untuk turnamen.`)
  return gen()
}

export const SUPPORTED_TOURNAMENT_GAMES = Object.keys(generators)
// ['katak', 'termometer', 'pabrikrobot', 'gembok', 'mercusuar']
