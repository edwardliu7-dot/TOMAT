import React from 'react'
import PetSVG, { getPetName } from './PetSVG'

const RESULT_META = {
  win: { label: 'MENANG', color: '#34D399', background: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)' },
  loss: { label: 'KALAH', color: '#F87171', background: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)' },
  draw: { label: 'SERI', color: '#FBBF24', background: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)' },
}

function formatFinishedAt(value) {
  if (!value) return 'Waktu tidak diketahui'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Waktu tidak diketahui'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function PetBadge({ player, muted = false }) {
  const skinId = player?.petSkinId || player?.petType || 'golden'
  const name = player?.petSkinId ? getPetName(player.petSkinId) : null
  if (!player?.petSkinId && muted) {
    return <span style={{ color: '#64748B', fontSize: 11 }}>Identitas disamarkan</span>
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <PetSVG state="happy" skinId={skinId} size={38} />
      <div style={{ minWidth: 0 }}>
        <div style={{ color: muted ? '#94A3B8' : '#E2E8F0', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name || 'Pet saat bertanding'}
        </div>
        <div style={{ color: '#64748B', fontSize: 10 }}>Pet saat bertanding</div>
      </div>
    </div>
  )
}

function MatchHistoryCard({ item, showReward }) {
  const meta = RESULT_META[item?.result] || RESULT_META.draw
  const teamSize = Number(item?.teamSize) || 1
  const opponents = Array.isArray(item?.opponents) ? item.opponents : []

  return (
    <article style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ height: 2, background: meta.color }} />
      <div style={{ padding: '13px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#CBD5E1', fontSize: 12, fontWeight: 800 }}>⚔️ MOBA · {teamSize}v{teamSize}</div>
            <div style={{ color: '#64748B', fontSize: 10, marginTop: 3 }}>{formatFinishedAt(item?.finishedAt)}</div>
          </div>
          <span style={{ color: meta.color, background: meta.background, border: `1px solid ${meta.border}`, borderRadius: 20, padding: '4px 9px', fontSize: 10, fontWeight: 900, letterSpacing: 0.5 }}>
            {meta.label}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div style={{ color: '#64748B', fontSize: 10, fontWeight: 700, marginBottom: 5 }}>Timku</div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>{Number(item?.scores?.mine || 0).toLocaleString('id-ID')}</div>
          </div>
          <div style={{ color: '#475569', fontSize: 11, fontWeight: 800 }}>VS</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#64748B', fontSize: 10, fontWeight: 700, marginBottom: 5 }}>Lawan</div>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>{Number(item?.scores?.opponent || 0).toLocaleString('id-ID')}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12, marginTop: 12 }}>
          <div>
            <div style={{ color: '#64748B', fontSize: 10, fontWeight: 800, marginBottom: 6 }}>Pet pemain</div>
            <PetBadge player={item?.myPlayer} />
          </div>
          <div>
            <div style={{ color: '#64748B', fontSize: 10, fontWeight: 800, marginBottom: 6 }}>Lawan</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {opponents.length > 0
                ? opponents.map((opponent, index) => (
                    <div key={`${item?.matchId}-opponent-${index}`} style={{ minWidth: 0 }}>
                      <div style={{ color: '#CBD5E1', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {opponent.displayName || 'Lawan'}
                      </div>
                      <PetBadge player={opponent} muted={!opponent.petSkinId} />
                    </div>
                  ))
                : <span style={{ color: '#64748B', fontSize: 11 }}>Tidak ada data lawan</span>}
            </div>
          </div>
        </div>

        {showReward && item?.rewardCoins != null && (
          <div style={{ color: '#FBBF24', fontSize: 10, fontWeight: 800, marginTop: 11 }}>🪙 +{Number(item.rewardCoins || 0).toLocaleString('id-ID')} koin</div>
        )}
      </div>
    </article>
  )
}

export default function MobaHistorySection({
  history,
  loading = false,
  error = '',
  title = 'Riwayat Arena MOBA',
  showReward = false,
}) {
  if (loading) {
    return (
      <section style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 18, color: '#64748B', fontSize: 12 }}>
        Memuat riwayat pertandingan MOBA…
      </section>
    )
  }

  if (error) {
    return (
      <section style={{ background: '#111827', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 20, padding: 18, color: '#FCA5A5', fontSize: 12 }}>
        {error}
      </section>
    )
  }

  const items = Array.isArray(history?.items) ? history.items : []
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 22 }}>⚔️</div>
        <div>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 900 }}>{title}</div>
          <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>Pertandingan terbaru, dengan pet yang dipakai saat itu</div>
        </div>
      </div>
      {items.length === 0 ? (
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 18px', color: '#64748B', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
          Belum ada riwayat pertandingan MOBA.<br />
          Cari lawan dan mulai pertandingan pertamamu!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
          {items.map(item => <MatchHistoryCard key={item.matchId} item={item} showReward={showReward} />)}
        </div>
      )}
    </section>
  )
}