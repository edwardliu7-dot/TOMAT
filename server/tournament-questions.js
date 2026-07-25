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
}

export function genTournamentQ(gameKey) {
  const gen = generators[gameKey]
  if (!gen) throw new Error(`Game '${gameKey}' belum didukung untuk turnamen.`)
  return gen()
}

export const SUPPORTED_TOURNAMENT_GAMES = Object.keys(generators)
// ['katak', 'termometer', 'pabrikrobot', 'gembok', 'mercusuar']
