import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Clock3, LoaderCircle, Shield, Sparkles, X } from 'lucide-react'

function formatQuestionTime(remainingMs) {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000))
  return `${seconds}s`
}

export default function MobaQuestionModal({
  questionState,
  onAnswer,
  disabled = false,
}) {
  const [now, setNow] = useState(() => Date.now())
  const syncRef = useRef(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const question = questionState?.question

  useEffect(() => {
    setSelectedAnswer('')
    setSubmitting(false)
    if (Number.isFinite(Number(questionState?.serverNow))) {
      syncRef.current = {
        serverNow: Number(questionState.serverNow),
        receivedAt: Date.now(),
      }
    }
  }, [questionState?.questionSessionId])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [])

  const sync = syncRef.current
  const estimatedServerNow = sync
    ? sync.serverNow + (now - sync.receivedAt)
    : now
  const remainingMs = Math.max(0, Number(questionState?.expiresAt || 0) - estimatedServerNow)
  const options = useMemo(() => (
    Array.isArray(question?.options) ? question.options : []
  ), [question?.options])
  const isExpired = remainingMs <= 0
  const isDisabled = disabled || submitting || isExpired || !question

  const submit = async event => {
    event.preventDefault()
    if (isDisabled || selectedAnswer === '') return
    setSubmitting(true)
    try {
      await onAnswer({
        questionSessionId: questionState.questionSessionId,
        answer: selectedAnswer,
      })
    } catch {
      setSubmitting(false)
    }
  }

  if (!questionState || !question) return null

  return (
    <div className="moba12-modal-layer" role="presentation">
      <section
        className="moba12-question-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="moba12-question-title"
      >
        <div className="moba12-modal-kicker">
          <span><Sparkles size={14} /> Node {question.difficulty || 'soal'}</span>
          <span className={`moba12-question-timer ${remainingMs <= 5000 ? 'is-urgent' : ''}`}>
            <Clock3 size={14} /> {isExpired ? 'Waktu habis' : formatQuestionTime(remainingMs)}
          </span>
        </div>
        <h2 id="moba12-question-title">{question.prompt}</h2>
        <p className="moba12-modal-help">
          Jawab sebelum waktu habis. Hasil dan hadiah ditentukan server.
        </p>

        <form onSubmit={submit}>
          {options.length ? (
            <div className="moba12-answer-options">
              {options.map((option, index) => {
                const value = String(option)
                const isSelected = selectedAnswer === value
                return (
                  <button
                    type="button"
                    className={`moba12-answer-option ${isSelected ? 'is-selected' : ''}`}
                    key={`${value}-${index}`}
                    onClick={() => setSelectedAnswer(value)}
                    disabled={isDisabled}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>
                    {value}
                  </button>
                )
              })}
            </div>
          ) : (
            <input
              className="moba12-answer-input"
              value={selectedAnswer}
              onChange={event => setSelectedAnswer(event.target.value)}
              placeholder="Tulis jawabanmu"
              disabled={isDisabled}
              autoFocus
            />
          )}
          <button
            className="moba12-submit-answer"
            type="submit"
            disabled={isDisabled || selectedAnswer === ''}
          >
            {submitting ? <LoaderCircle size={17} className="moba11-spin" /> : <Check size={17} />}
            {submitting ? 'Memeriksa…' : isExpired ? 'Waktu habis' : 'Kirim jawaban'}
          </button>
        </form>
        <div className="moba12-modal-note">
          <Shield size={13} /> Jawaban benar tidak dikirim ke lawan.
        </div>
      </section>
    </div>
  )
}

export function MobaQuestionResult({ result, onClose }) {
  if (!result) return null
  const isCorrect = result.correct === true
  const isImmune = result.immune === true
  const title = isCorrect
    ? 'Jawaban benar!'
    : result.timedOut
      ? 'Waktu habis'
      : isImmune
        ? 'Perisai Nananaga aktif'
        : 'Jawaban belum tepat'
  const body = isCorrect
    ? `Gulungan +${result.scroll?.points || 0} poin sudah kamu bawa.`
    : result.timedOut || !isImmune
      ? 'Pet terkena stun sementara. Coba lagi setelah pulih.'
      : 'Jawaban belum tepat, tetapi kamu tidak terkena stun.'

  return (
    <div className={`moba12-result moba12-result--${isCorrect ? 'correct' : 'wrong'}`} role="status">
      <div className="moba12-result__icon">
        {isCorrect ? <Check size={19} /> : <X size={19} />}
      </div>
      <div>
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Tutup hasil">
        <X size={15} />
      </button>
    </div>
  )
}
