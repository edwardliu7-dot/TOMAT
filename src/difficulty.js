// Shared difficulty & survival-mode framework used by every minigame.
//
// Contract: each game's genQ() takes a `difficulty` argument ('easy'|'medium'|'hard')
// and scales its own numbers/operations accordingly. In Survival mode, the game does not
// receive a fixed difficulty from the mode-select screen — instead it uses the `difficulty`
// returned by useSurvival(), which starts at 'easy' and escalates automatically.
import { useState, useRef, useCallback } from 'react'

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard']
export const DIFFICULTY_LABELS = { easy: 'Mudah', medium: 'Sedang', hard: 'Sulit' }
export const DIFFICULTY_COLORS = { easy: '#34D399', medium: '#67E8F9', hard: '#F87171' }

// Random integer in [min, max], inclusive. Shared so every game's genQ() uses the same helper.
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Pick a value from a { easy, medium, hard } map for the current difficulty.
export function byDifficulty(difficulty, tiers) {
  return tiers[difficulty] ?? tiers.medium
}

// Filter a pool of question objects (each tagged with a `tier` field) down to the current
// difficulty. Falls back to the whole pool if a tier happens to be empty, so a shallow pool
// never breaks a game.
export function poolForDifficulty(pool, difficulty) {
  const filtered = pool.filter(item => item.tier === difficulty)
  return filtered.length > 0 ? filtered : pool
}

export function pickFrom(pool) {
  return pool[Math.floor(Math.random() * pool.length)]
}

function nextLevel(level) {
  const idx = DIFFICULTY_LEVELS.indexOf(level)
  return DIFFICULTY_LEVELS[Math.min(idx + 1, DIFFICULTY_LEVELS.length - 1)]
}

// Survival mode escalates every 7-10 correct answers (randomized per step so the timing
// isn't predictable), capped at 'hard'.
function randomSurvivalStep() {
  return randInt(7, 10)
}

// Shared Survival Mode state machine. Starts at 'easy'; games call recordResult(correct)
// from their existing confirm()/scoring handler. On a correct answer, the streak grows and
// the level may step up; on a wrong answer, `gameOver` is set (survival ends immediately).
export function useSurvival(enabled) {
  const [difficulty, setDifficulty] = useState('easy')
  const [streak, setStreak] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const questionsAtLevel = useRef(0)
  const stepTarget = useRef(randomSurvivalStep())

  const recordResult = useCallback((correct) => {
    if (!enabled) return
    if (correct) {
      questionsAtLevel.current += 1
      setStreak(s => s + 1)
      if (questionsAtLevel.current >= stepTarget.current) {
        questionsAtLevel.current = 0
        stepTarget.current = randomSurvivalStep()
        setDifficulty(d => nextLevel(d))
      }
    } else {
      setGameOver(true)
    }
  }, [enabled])

  const reset = useCallback(() => {
    setDifficulty('easy')
    setStreak(0)
    setGameOver(false)
    questionsAtLevel.current = 0
    stepTarget.current = randomSurvivalStep()
  }, [])

  return { difficulty, streak, gameOver, recordResult, reset }
}
