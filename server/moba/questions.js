/**
 * Server-side question session helpers for TOMAT MOBA.
 *
 * The question bank/generator is injected by the match manager. This module
 * only owns the private session shape and the safe question projection.
 */

import { randomUUID } from 'node:crypto'

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