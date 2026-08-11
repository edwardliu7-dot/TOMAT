import React from 'react'

const NODE_ASSETS = {
  easy: 'FG_Treasure_Small_1.png',
  medium: 'FG_Crystal_Gold_1.png',
  hard: 'FG_Crystal_Blue_1.png',
}

export default function MobaNode({ node, style, isNearby = false, isQuestionActive = false, onClaim }) {
  if (!node) return null
  const difficulty = node.difficulty || 'easy'
  const isAvailable = node.status === 'available'

  return (
    <button
      type="button"
      className={[
        'moba11-node',
        `moba11-node--${difficulty}`,
        isAvailable ? '' : 'moba11-node--claimed',
        isQuestionActive ? 'moba11-node--question-active' : '',
      ].filter(Boolean).join(' ')}
      style={style}
      aria-label={`Node soal ${difficulty}, ${node.points ?? 0} poin, ${isAvailable ? 'tersedia' : 'tidak tersedia'}`}
      disabled={!isAvailable}
      onClick={() => isAvailable && onClaim?.(node)}
    >
      <span className="moba11-node__scroll-sprite" aria-hidden="true" />
    </button>
  )
}