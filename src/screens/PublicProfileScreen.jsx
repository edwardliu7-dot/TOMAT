import React, { useEffect } from 'react'
import { TopBar, UserAvatar, LuxuryAvatarFrame, CelestiaParticles, RoyalShimmer, ensureLuxuryStyles } from '../components/shared'
import { BINGKAI_VISUALS, SPANDUK_VISUALS } from '../shopVisuals'
import TomiSVG, { PET_CSS } from '../components/TomiSVG'
import { useAuth } from '../AuthContext'

export default function PublicProfileScreen({ profile, goBack, onInviteDuel }) {
  const { user: currentUser } = useAuth()

  useEffect(() => {
    ensureLuxuryStyles()
    if (!document.getElementById('tomi-pubprofile-css')) {
      const s = document.createElement('style')
      s.id = 'tomi-pubprofile-css'
      s.textContent = PET_CSS
      document.head.appendChild(s)
    }
  }, [])

  if (!profile) return null

  const spandukId   = profile.equippedSpanduk ?? profile.equipped_spanduk
  const spanduk     = spandukId ? SPANDUK_VISUALS[spandukId] : null
  const bingkaiId   = profile.equippedBingkai ?? profile.equipped_bingkai
  const bingkai     = bingkaiId ? BINGKAI_VISUALS[bingkaiId] : null
  const isCelestia  = spanduk?.luxury === 'celestia'
  const isRoyal     = spanduk?.luxury === 'royal'
  const isLuxuryFrame = bingkai?.luxury === 'aurum' || bingkai?.luxury === 'void'

  const canDuel = profile.role === 'siswa' && currentUser?.role === 'siswa' && profile.id !== currentUser?.id

  return (
    <div style={{ minHeight: '100vh', background: '#0A0B14' }}>
      <TopBar title="Profil" onBack={goBack} />

      {/* ── BANNER ── */}
      <div style={{
        position: 'relative',
        height: 160,
        background: spanduk ? spanduk.gradient : 'linear-gradient(160deg,#0c1a2e,#111827)',
        overflow: 'hidden',
      }}>
        {/* Glow overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: isCelestia
            ? 'radial-gradient(circle at 20% 60%, rgba(191,219,254,0.28), transparent 35%), radial-gradient(circle at 80% 30%, rgba(96,165,250,0.2), transparent 30%)'
            : isRoyal
              ? 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.25), transparent 55%), linear-gradient(90deg, transparent, rgba(212,175,55,0.08), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
          pointerEvents: 'none',
        }} />

        {/* Celestia particles */}
        {isCelestia && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <CelestiaParticles />
            {[...Array(18)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: i % 3 === 0 ? 2 : 1,
                height: i % 3 === 0 ? 2 : 1,
                borderRadius: '50%',
                background: '#bfdbfe',
                opacity: 0.4 + (i % 4) * 0.12,
                top: `${10 + (i * 17 + i * 3) % 80}%`,
                left: `${5 + (i * 23 + i * 7) % 90}%`,
                animation: i % 2 === 0 ? 'tomat-float-a 4s ease-in-out infinite' : 'tomat-float-b 5s ease-in-out infinite',
                animationDelay: `${(i * 0.4).toFixed(1)}s`,
              }} />
            ))}
          </div>
        )}

        {/* Royal shimmer */}
        {isRoyal && <RoyalShimmer />}

        {/* Item label */}
        {spanduk && (
          <div style={{
            position: 'absolute', left: 16, bottom: 52,
            color: isRoyal ? '#f5e7b2cc' : isCelestia ? '#dbeafecc' : '#ffffffaa',
            fontSize: 8, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase',
            textShadow: '0 1px 10px rgba(0,0,0,0.7)',
          }}>
            {isRoyal ? 'Royal Mathematician' : isCelestia ? 'Celestia Relic' : spandukId}
          </div>
        )}

        {/* Placed stickers (read-only) */}
        {(profile.stikerLayout || []).map(s => (
          <div key={s.uid} style={{
            position: 'absolute',
            left: `${s.x}%`, top: `${s.y}%`,
            fontSize: s.size, lineHeight: 1,
            transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
            zIndex: 12,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))',
          }}>{s.emoji}</div>
        ))}

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 56,
          background: 'linear-gradient(to bottom, transparent, #0A0B14)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── AVATAR overlapping banner ── */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        marginTop: -52, marginBottom: 10, position: 'relative', zIndex: 2, gap: 8,
      }}>
        {/* Pet */}
        {profile.equippedPetSkin && profile.role === 'siswa' ? (
          <div style={{ animation: 'tomi-idle 2.4s ease-in-out infinite', transformOrigin: 'center bottom', marginBottom: 4 }}>
            <TomiSVG state="happy" skinId={profile.equippedPetSkin} size={64} />
          </div>
        ) : (
          <div style={{ width: 64 }} />
        )}

        {isLuxuryFrame ? (
          <LuxuryAvatarFrame user={profile} size={88} bingkai={bingkai} bingkaiId={bingkaiId} />
        ) : (
          <UserAvatar user={profile} size={88} />
        )}
        <div style={{ width: 64 }} />
      </div>

      {/* ── PROFILE INFO ── */}
      <div style={{ padding: '0 20px 24px', textAlign: 'center' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{profile.name}</div>

        <div style={{
          display: 'inline-block', marginTop: 8, padding: '5px 14px', borderRadius: 99,
          background: profile.role === 'guru' ? 'rgba(167,139,250,0.14)' : 'rgba(103,232,249,0.12)',
          color: profile.role === 'guru' ? '#C4B5FD' : '#67E8F9',
          fontSize: 12, fontWeight: 800,
        }}>{profile.role === 'guru' ? '🎓 Guru' : '🧑‍🎓 Siswa'}</div>

        <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 10 }}>
          {Array.isArray(profile.kelas) ? profile.kelas.join(' · ') : profile.kelas}
        </div>

        {/* Stats — only for siswa */}
        {profile.role === 'siswa' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, margin: '18px 0' }}>
            {[
              { label: 'Level', value: profile.level ?? '—', icon: '⭐' },
              { label: 'Koin', value: profile.coins ?? '—', icon: '🪙' },
              { label: 'EXP', value: profile.exp ?? '—', icon: '⚡' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '14px 6px',
              }}>
                <div style={{ fontSize: 20 }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 4 }}>{value}</div>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Hafalan badges — only for siswa */}
        {profile.role === 'siswa' && Array.isArray(profile.badges) && (() => {
          const kali = profile.badges.filter(b => b.id?.startsWith('hafalan_kali_'))
          const bagi = profile.badges.filter(b => b.id?.startsWith('hafalan_bagi_'))
          if (kali.length === 0 && bagi.length === 0) return null
          return (
            <div style={{ margin: '0 0 16px', textAlign: 'left' }}>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>🏅 Hafalan</div>
              {kali.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>Perkalian</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {kali.map(b => (
                      <span key={b.id} style={{
                        background: `${b.color}22`, border: `1px solid ${b.color}55`,
                        color: b.color, borderRadius: 20, padding: '3px 9px',
                        fontSize: 11, fontWeight: 700,
                      }}>{b.icon} {b.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {bagi.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>Pembagian</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {bagi.map(b => (
                      <span key={b.id} style={{
                        background: `${b.color}22`, border: `1px solid ${b.color}55`,
                        color: b.color, borderRadius: 20, padding: '3px 9px',
                        fontSize: 11, fontWeight: 700,
                      }}>{b.icon} {b.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* Bio */}
        <div style={{
          padding: '13px 14px', borderRadius: 13, textAlign: 'left',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          color: profile.bio ? '#CBD5E1' : '#64748B', fontSize: 13, lineHeight: 1.6,
        }}>{profile.bio || 'Belum ada bio.'}</div>

        {/* Duel button */}
        {canDuel && (
          <button
            onClick={() => onInviteDuel?.(profile)}
            style={{
              marginTop: 20, width: '100%', padding: '15px 0',
              borderRadius: 14, border: 'none',
              background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', color: '#fff',
              fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
            }}
          >⚔️ Ajak Duel</button>
        )}
      </div>

      {/* Celestia/Royal accent strip at bottom of card */}
      {isCelestia && (
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #60a5fa, #93c5fd, #60a5fa, transparent)', opacity: 0.7 }} />
      )}
      {isRoyal && (
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #d4af37, #f5e7b2, #d4af37, transparent)', opacity: 0.7 }} />
      )}
    </div>
  )
}
