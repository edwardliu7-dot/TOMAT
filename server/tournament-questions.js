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
}

export function genTournamentQ(gameKey) {
  const gen = generators[gameKey]
  if (!gen) throw new Error(`Game '${gameKey}' belum didukung untuk turnamen.`)
  return gen()
}

export const SUPPORTED_TOURNAMENT_GAMES = Object.keys(generators)
// ['katak', 'termometer', 'pabrikrobot', 'gembok', 'mercusuar']
