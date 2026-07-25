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
}

export function genTournamentQ(gameKey) {
  const gen = generators[gameKey]
  if (!gen) throw new Error(`Game '${gameKey}' belum didukung untuk turnamen.`)
  return gen()
}

export const SUPPORTED_TOURNAMENT_GAMES = Object.keys(generators)
// ['katak', 'termometer', 'pabrikrobot', 'gembok', 'mercusuar']
