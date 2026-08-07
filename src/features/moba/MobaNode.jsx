import React from 'react'
import { CircleHelp } from 'lucide-react'

const DIFFICULTY_LABELS = {
  easy: 'mudah',
  medium: 'sedang',
  hard: 'sulit',
}

export default function MobaNode({ node, style, isNearby = false, onClaim }) {
  if (!node) return null
  const difficulty = node.difficulty || 'easy'
  const label = DIFFICULTY_LABELS[difficulty] || difficulty
  const isAvailable = node.status === 'available'
  const statusLabel = isAvailable ? 'tersedia' : `status ${node.status || 'tidak tersedia'}`

  return (
    <button
      type="button"
      className={`moba11-node moba11-node--${difficulty} ${isAvailable ? '' : 'moba11-node--claimed'}`}
      style={style}
      aria-label={`Node soal ${label}, ${node.points ?? 0} poin, ${statusLabel}`}
      disabled={!isAvailable}
      onClick={() => isAvailable && onClaim?.(node)}
    >
      <CircleHelp size={15} />
      <b>+{node.points ?? 0}</b>
      <span>{label}</span>
      {isNearby && isAvailable && <em>Ambil</em>}
    </button>
  )
}