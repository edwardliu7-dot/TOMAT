import React from 'react'
import { CircleHelp } from 'lucide-react'

const DIFFICULTY_LABELS = {
  easy: 'mudah',
  medium: 'sedang',
  hard: 'sulit',
}

export default function MobaNode({ node, style }) {
  if (!node) return null
  const difficulty = node.difficulty || 'easy'
  const label = DIFFICULTY_LABELS[difficulty] || difficulty
  const isAvailable = node.status === 'available'
  const statusLabel = isAvailable ? 'tersedia' : `status ${node.status || 'tidak tersedia'}`

  return (
    <div
      className={`moba11-node moba11-node--${difficulty} ${isAvailable ? '' : 'moba11-node--claimed'}`}
      style={style}
      aria-label={`Node soal ${label}, ${node.points ?? 0} poin, ${statusLabel}`}
    >
      <CircleHelp size={15} />
      <b>+{node.points ?? 0}</b>
      <span>{label}</span>
    </div>
  )
}