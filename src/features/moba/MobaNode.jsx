import React from 'react'

const DIFFICULTY_LABELS = {
  easy: 'mudah',
  medium: 'sedang',
  hard: 'sulit',
}

const NODE_ASSETS = {
  easy: 'FG_Treasure_Small_1.png',
  medium: 'FG_Crystal_Gold_1.png',
  hard: 'FG_Crystal_Blue_1.png',
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
      <img src={`/moba-arena/${NODE_ASSETS[difficulty] || NODE_ASSETS.easy}`} alt="" />
      <b>+{node.points ?? 0}</b>
      <span>{label}</span>
      {isNearby && isAvailable && <em>Ambil</em>}
    </button>
  )
}