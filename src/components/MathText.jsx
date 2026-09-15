import React, { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const MATH_TOKEN = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\$)\$(?!\$)[^$\n]+(?<!\$)\$(?!\$))/g
const PLAIN_MATH_CHARS = /(?:\^|_|√|∑|∫|≤|≥|≠|×|÷|±|π|²|³|⁺|⁻|₁|₂|₃)/

function stripDelimiter(value) {
  const raw = String(value ?? '')
  if (raw.startsWith('$$') && raw.endsWith('$$')) return { expression: raw.slice(2, -2), displayMode: true }
  if (raw.startsWith('\\[') && raw.endsWith('\\]')) return { expression: raw.slice(2, -2), displayMode: true }
  if (raw.startsWith('$') && raw.endsWith('$')) return { expression: raw.slice(1, -1), displayMode: false }
  if (raw.startsWith('\\(') && raw.endsWith('\\)')) return { expression: raw.slice(2, -2), displayMode: false }
  return { expression: raw, displayMode: false }
}

function renderExpression(expression, displayMode) {
  try {
    return katex.renderToString(expression, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      trust: false,
      output: 'htmlAndMathml',
    })
  } catch {
    return null
  }
}

function renderLine(line) {
  const source = String(line ?? '')
  const segments = []
  let cursor = 0
  let match
  MATH_TOKEN.lastIndex = 0

  while ((match = MATH_TOKEN.exec(source))) {
    if (match.index > cursor) segments.push({ type: 'text', value: source.slice(cursor, match.index) })
    const parsed = stripDelimiter(match[0])
    const html = renderExpression(parsed.expression, parsed.displayMode)
    segments.push(html
      ? { type: 'math', html, displayMode: parsed.displayMode }
      : { type: 'text', value: match[0] })
    cursor = match.index + match[0].length
  }

  if (cursor < source.length) segments.push({ type: 'text', value: source.slice(cursor) })

  // A pasted value such as "2^2" has no delimiters. Treat only clearly
  // mathematical lines as equations and keep ordinary prose untouched.
  const trimmedSource = source.trim()
  const hasProseWord = /[A-Za-z]{2,}/.test(trimmedSource)
  if (segments.length === 1 && segments[0]?.type === 'text' && PLAIN_MATH_CHARS.test(trimmedSource) && !hasProseWord) {
    const html = renderExpression(trimmedSource, false)
    if (html) return [{ type: 'math', html, displayMode: false }]
  }

  return segments.length ? segments : [{ type: 'text', value: '' }]
}

function MathSegment({ segment }) {
  if (segment.type === 'math') {
    return (
      <span
        className={segment.displayMode ? 'tomat-math tomat-math-display' : 'tomat-math'}
        dangerouslySetInnerHTML={{ __html: segment.html }}
      />
    )
  }
  return <React.Fragment>{segment.value}</React.Fragment>
}

export default function MathText({ value, className = '', style, displayMode = false }) {
  const lines = useMemo(() => String(value ?? '').split(/\r?\n/), [value])
  return (
    <span
      className={`tomat-math-text ${className}`.trim()}
      style={{
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        ...style,
      }}
      aria-label={String(value ?? '')}
    >
      {lines.map((line, lineIndex) => {
        const segments = renderLine(line)
        return (
          <React.Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {segments.map((segment, segmentIndex) => (
              <MathSegment key={`${lineIndex}-${segmentIndex}`} segment={segment} />
            ))}
          </React.Fragment>
        )
      })}
    </span>
  )
}