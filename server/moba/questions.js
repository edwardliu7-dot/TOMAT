/**
 * Server-side question session helpers for TOMAT MOBA.
 *
 * The question bank/generator is injected by the match manager. This module
 * only owns the private session shape and the safe question projection.
 */

import { randomUUID } from 'node:crypto'
import { genTournamentQ, SUPPORTED_TOURNAMENT_GAMES } from '../tournament-questions.js'

function createId(prefix) {
  return `${prefix}-${randomUUID()}`
}

export function normalizeAnswer(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim().toLocaleLowerCase()
}

export function publicQuestion(question) {
  if (!question) return null
  const safe = {
    id: question.id,
    prompt: question.prompt,
    options: Array.isArray(question.options) ? [...question.options] : [],
    difficulty: question.difficulty,
    // gameKey is safe to expose — it identifies the mini-game type only,
    // not the correct answer.
    gameKey: question.gameKey || null,
    gameLabel: question.gameLabel || null,
  }
  // Deliberately build a whitelist: answer/correctAnswer never cross this
  // boundary, even if a future generator adds both fields.
  return safe
}

export function createQuestionSession({
  question,
  playerId,
  nodeId,
  openedAt,
  expiresAt,
  questionSessionId = createId('question-session'),
} = {}) {
  if (!question || !playerId || !nodeId) {
    throw new TypeError('question, playerId, and nodeId are required')
  }

  return {
    id: questionSessionId,
    questionId: question.id || createId('question'),
    playerId,
    nodeId,
    openedAt,
    expiresAt,
    answered: false,
    timer: null,
  }
}

/**
 * Small usable fallback for development/tests. Production can inject the
 * curriculum-specific generator through createMobaMatchManager().
 */
export function defaultQuestionGenerator({ difficulty = 'easy', random = Math.random } = {}) {
  const max = difficulty === 'hard' ? 20 : difficulty === 'medium' ? 12 : 8
  const left = 2 + Math.floor(random() * max)
  const right = 2 + Math.floor(random() * max)
  const answer = left * right
  return {
    prompt: `${left} × ${right} = ...`,
    options: [String(answer), String(answer + 2), String(Math.max(1, answer - 3))],
    answer: String(answer),
    difficulty,
  }
}

/**
 * Creates a synchronous curriculum-based question generator for MOBA.
 * Pulls questions from tournament-questions.js generators and wraps them
 * as 4-option multiple-choice questions for the arena question modal.
 *
 * @param {string[]} gameKeys – tournament game keys to draw from
 * @returns {function} question generator compatible with createMobaMatchManager()
 */
export function createCurriculumQuestionGenerator(gameKeys = []) {
  return function({ random = Math.random } = {}) {
    const filteredPool = gameKeys.filter(k => SUPPORTED_TOURNAMENT_GAMES.includes(k))
    const effectivePool = filteredPool.length > 0 ? filteredPool : SUPPORTED_TOURNAMENT_GAMES
    if (effectivePool.length === 0) return defaultQuestionGenerator({ random })

    const gameKey = effectivePool[Math.floor(random() * effectivePool.length)]
    let tournamentQ
    try {
      tournamentQ = genTournamentQ(gameKey)
    } catch {
      return defaultQuestionGenerator({ random })
    }

    const { question, answer } = tournamentQ
    const correct = Number(answer)
    if (!Number.isFinite(correct)) return defaultQuestionGenerator({ random })

    // Generate 3 distinct wrong options
    const wrongSet = new Set()
    let attempts = 0
    while (wrongSet.size < 3 && attempts < 50) {
      attempts++
      const delta = Math.floor(random() * 9) + 1
      const wrong = random() < 0.5 ? correct + delta : correct - delta
      if (wrong !== correct && Number.isFinite(wrong)) wrongSet.add(wrong)
    }
    // Guaranteed fallbacks
    if (wrongSet.size < 3) wrongSet.add(correct + wrongSet.size + 10)
    if (wrongSet.size < 3) wrongSet.add(correct - wrongSet.size - 10)
    if (wrongSet.size < 3) wrongSet.add(correct + 20)

    // Shuffle all 4 options
    const options = [String(correct), ...[...wrongSet].slice(0, 3).map(String)]
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }

    return {
      prompt: question.text || question.prompt || gameKey,
      options,
      answer: String(correct),
      gameKey,                          // propagated to publicQuestion
      gameLabel: tournamentQ.gameLabel, // human-readable name from generator
    }
  }
}
