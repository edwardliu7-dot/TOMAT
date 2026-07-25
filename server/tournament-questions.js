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
}

export function genTournamentQ(gameKey) {
  const gen = generators[gameKey]
  if (!gen) throw new Error(`Game '${gameKey}' belum didukung untuk turnamen.`)
  return gen()
}

export const SUPPORTED_TOURNAMENT_GAMES = Object.keys(generators)
// ['katak', 'termometer', 'pabrikrobot', 'gembok', 'mercusuar']
