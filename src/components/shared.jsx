import React from 'react'
import { usePlayer } from '../PlayerContext'
import { useAuth } from '../AuthContext'
import { useTask, TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../difficulty'
import { BINGKAI_VISUALS, SPANDUK_VISUALS, STIKER_VISUALS } from '../shopVisuals'
import TomiSVG from './TomiSVG'
import PetSVG from './PetSVG'
import { useAppNotifications, usePushNotifications } from '../notifications'

function useIsDesktop() {
  const [desk, setDesk] = React.useState(() => window.innerWidth >= 1024)
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setDesk(mq.matches)
    const h = e => setDesk(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return desk
}

export function TopBar({ title, onBack, accentColor = '#67E8F9', rightElement }) {
  const isDesktop = useIsDesktop()
  return (
    <div className="tomat-topbar" style={{ display: 'flex', alignItems: 'center', padding: isDesktop ? '14px 20px' : '16px', gap: 12, minHeight: isDesktop ? 58 : 'auto', background: 'rgba(7,19,33,0.72)', borderBottom: '1px solid rgba(99,102,241,0.1)', backdropFilter: 'blur(14px)' }}>
      <button onClick={onBack} style={{
        background: '#0E1E35', border: '1px solid rgba(99,102,241,0.18)', color: '#C4B5FD',
        width: 38, height: 38, borderRadius: 11, cursor: 'pointer', fontSize: 19,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
      >←</button>
      <h2 style={{ color: '#fff', fontSize: isDesktop ? 15 : 16, fontWeight: 800, flex: 1, margin: 0 }}>{title}</h2>
      {rightElement}
    </div>
  )
}

// WhatsApp-style public user identity: photo/initial inside the equipped frame.
// Accepts both API snake_case fields and the AuthContext camelCase fields.
export function UserAvatar({ user, size = 40, onClick, title }) {
  const photoUrl = user?.photoUrl ?? user?.photo_url
  const bingkaiId = user?.equippedBingkai ?? user?.equipped_bingkai
  const bingkai = bingkaiId ? BINGKAI_VISUALS[bingkaiId] : null
  const initial = (user?.name || '?')[0]?.toUpperCase()
  const [imageFailed, setImageFailed] = React.useState(false)
  React.useEffect(() => { setImageFailed(false) }, [photoUrl])
  const showPhoto = Boolean(photoUrl) && !imageFailed
  const useImageFrame = Boolean(bingkai?.image)
  const spread = useImageFrame ? Math.round(size * 0.22) : 0
  const avatarDiv = (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3, flexShrink: 0,
      background: showPhoto
        ? `url(${photoUrl}) center/cover no-repeat`
        : user?.role === 'guru'
          ? 'linear-gradient(135deg, #8B5CF6, #6366F1)'
          : 'linear-gradient(135deg, #0891B2, #2563EB)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 900, color: '#fff',
      border: (bingkai && !useImageFrame)
        ? `${Math.max(2, Math.round(size / 16))}px ${bingkai.style} ${bingkai.border}`
        : `${Math.max(2, Math.round(size / 20))}px solid rgba(255,255,255,0.16)`,
      boxSizing: 'border-box',
      boxShadow: (bingkai && !useImageFrame && bingkai.glow) ? `0 0 ${Math.max(8, Math.round(size / 3))}px ${bingkai.border}88` : 'none',
    }}>
      {showPhoto && (
        <img
          src={photoUrl}
          alt=""
          aria-hidden="true"
          onError={() => setImageFailed(true)}
          style={{ display: 'none' }}
        />
      )}
      {!showPhoto && initial}
    </div>
  )
  const content = useImageFrame ? (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, display: 'inline-flex' }}>
      {avatarDiv}
      <img src={bingkai.image} alt="" aria-hidden="true" style={{
        position: 'absolute',
        inset: -spread,
        width: size + spread * 2,
        height: size + spread * 2,
        pointerEvents: 'none',
        zIndex: 3,
        objectFit: 'contain',
      }} />
    </div>
  ) : avatarDiv
  if (!onClick) return content
  return (
    <button onClick={onClick} title={title || 'Lihat profil'} aria-label={title || `Lihat profil ${user?.name || ''}`} style={{
      border: 'none', background: 'none', padding: 0, cursor: 'pointer',
      display: 'flex', flexShrink: 0, borderRadius: size * 0.3 + 3,
      transition: 'box-shadow 0.15s', outline: 'none',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 0 2px #6366F1' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
    >
      {content}
    </button>
  )
}

export function normalizeProfileTarget(target) {
  const role = typeof target?.role === 'string' ? target.role.trim().toLowerCase() : ''
  if (!target?.id || (role !== 'guru' && role !== 'siswa')) {
    throw new Error('Data profil tidak lengkap.')
  }
  return { ...target, id: target.id, role }
}

export async function fetchPublicProfile(target) {
  const normalizedTarget = normalizeProfileTarget(target)
  const res = await fetch(`/api/komunikasi/profile/${normalizedTarget.role}/${encodeURIComponent(normalizedTarget.id)}`, {
    credentials: 'include',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Gagal memuat profil.')
  const profile = data.profile
  if (!profile?.id || !profile?.role) throw new Error('Data profil yang diterima tidak lengkap.')
  return normalizeProfileTarget({
    ...profile,
    photoUrl: profile.photoUrl ?? profile.photo_url ?? null,
    equippedBingkai: profile.equippedBingkai ?? profile.equipped_bingkai ?? null,
    equippedSpanduk: profile.equippedSpanduk ?? profile.equipped_spanduk ?? null,
    equippedPetSkin: profile.equippedPetSkin ?? profile.equipped_pet_skin ?? null,
    stikerLayout: profile.stikerLayout ?? profile.stiker_layout ?? [],
    kelas: profile.kelas ?? [],
  })
}

// Keyframe CSS injected once for luxury cosmetic animations
const LUXURY_KEYFRAMES = `
@keyframes tomat-spin-cw  { from { transform: rotate(0deg) }   to { transform: rotate(360deg) } }
@keyframes tomat-spin-ccw { from { transform: rotate(0deg) }   to { transform: rotate(-360deg) } }
@keyframes tomat-orbit    { from { transform: rotate(0deg) }   to { transform: rotate(360deg) } }
@keyframes tomat-orbit-r  { from { transform: rotate(360deg) } to { transform: rotate(0deg) } }
@keyframes tomat-pulse-g  { 0%,100% { opacity:.5; transform:scale(1) } 50% { opacity:1; transform:scale(1.18) } }
@keyframes tomat-float-a  { 0%,100% { transform:translateY(0px) } 50% { transform:translateY(-6px) } }
@keyframes tomat-float-b  { 0%,100% { transform:translateY(0px) } 50% { transform:translateY(5px) } }
@keyframes tomat-shimmer  { 0% { left:-60% } 100% { left:160% } }
`
let _luxuryStyleInjected = false
export function ensureLuxuryStyles() {
  if (_luxuryStyleInjected) return
  _luxuryStyleInjected = true
  const el = document.createElement('style')
  el.textContent = LUXURY_KEYFRAMES
  document.head.appendChild(el)
}

// Profile cover for the equipped spanduk — kept as a compact strip for non-modal contexts.
export function ProfileBanner({ user, height = 92 }) {
  const spandukId = user?.equippedSpanduk ?? user?.equipped_spanduk
  const spanduk = spandukId ? SPANDUK_VISUALS[spandukId] : null
  if (!spanduk) return null
  const isCelestia = spanduk.luxury === 'celestia'
  const isRoyal = spanduk.luxury === 'royal'
  return (
    <div
      aria-label={`Spanduk ${spandukId}`}
      style={{
        height,
        width: '100%',
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
        background: spanduk.gradient,
        border: `1px solid ${isRoyal ? 'rgba(212,175,55,0.5)' : isCelestia ? 'rgba(147,197,253,0.42)' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: isRoyal
          ? '0 0 28px rgba(212,175,55,0.16)'
          : isCelestia
            ? '0 0 28px rgba(96,165,250,0.16)'
            : 'none',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: isCelestia
          ? 'radial-gradient(circle at 18% 50%, rgba(191,219,254,0.3), transparent 20%), radial-gradient(circle at 82% 25%, rgba(96,165,250,0.22), transparent 28%)'
          : isRoyal
            ? 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.2), transparent 45%), linear-gradient(90deg, transparent, rgba(212,175,55,0.08), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
      }} />
      <div style={{
        position: 'absolute', inset: 12,
        border: `1px solid ${isRoyal ? 'rgba(212,175,55,0.28)' : isCelestia ? 'rgba(147,197,253,0.24)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: 12,
      }} />
      <div style={{
        position: 'absolute', left: 18, bottom: 12,
        color: isRoyal ? '#f5e7b2' : isCelestia ? '#dbeafe' : '#fff',
        fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
        textShadow: '0 1px 8px rgba(0,0,0,0.6)',
      }}>
        {isRoyal ? 'Royal Mathematician' : isCelestia ? 'Celestia Relic' : 'Spanduk Profil'}
      </div>
      <div style={{
        position: 'absolute', right: 18, top: 12,
        color: isRoyal ? '#d4af37' : isCelestia ? '#93c5fd' : '#cbd5e1',
        fontSize: 16, opacity: 0.9,
      }}>
        {isRoyal ? '◇' : isCelestia ? '✦' : '✧'}
      </div>
    </div>
  )
}

// Avatar wrapped with animated luxury frame rings (for Aurum/Void Monarch).
export function LuxuryAvatarFrame({ user, size, bingkai, bingkaiId }) {
  React.useEffect(() => { ensureLuxuryStyles() }, [])
  const photoUrl = user?.photoUrl ?? user?.photo_url
  const [imageFailed, setImageFailed] = React.useState(false)
  React.useEffect(() => { setImageFailed(false) }, [photoUrl])
  const showPhoto = Boolean(photoUrl) && !imageFailed
  const isAurum = bingkai?.luxury === 'aurum'
  const isVoid  = bingkai?.luxury === 'void'
  const ringColor = bingkai?.border || '#D4AF37'

  // Diamond dot at each cardinal position of the rotating ring
  const DiamondDot = ({ angle }) => (
    <div style={{
      position: 'absolute',
      width: 7, height: 7,
      background: ringColor,
      transform: `rotate(${angle}deg) translateY(-${size / 2 + 14}px) rotate(45deg)`,
      top: '50%', left: '50%',
      marginTop: -3.5, marginLeft: -3.5,
      opacity: 0.85,
      boxShadow: `0 0 6px ${ringColor}cc`,
    }} />
  )

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Outer rotating ring */}
      <div style={{
        position: 'absolute',
        inset: -14,
        borderRadius: '50%',
        border: `1px solid ${ringColor}44`,
        animation: 'tomat-spin-cw 18s linear infinite',
      }}>
        <DiamondDot angle={0} />
        <DiamondDot angle={90} />
        <DiamondDot angle={180} />
        <DiamondDot angle={270} />
      </div>
      {/* Inner dashed ring */}
      <div style={{
        position: 'absolute',
        inset: -6,
        borderRadius: '50%',
        border: `1.5px dashed ${ringColor}55`,
        animation: 'tomat-spin-ccw 12s linear infinite',
      }} />
      {/* Glow pulse */}
      {isAurum && (
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: size * 0.3,
          boxShadow: `0 0 22px 6px ${ringColor}55`,
          animation: 'tomat-pulse-g 2.8s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}
      {isVoid && (
        <>
          <div style={{
            position: 'absolute', inset: -9,
            borderRadius: '50%',
            border: `1px solid ${ringColor}66`,
            animation: 'tomat-spin-cw 30s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: size * 0.3,
            boxShadow: `0 0 28px 8px ${ringColor}44`,
            animation: 'tomat-pulse-g 3.5s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        </>
      )}
      {/* Avatar itself */}
      <div style={{
        width: size, height: size, borderRadius: size * 0.3, flexShrink: 0,
        background: showPhoto
          ? `url(${photoUrl}) center/cover no-repeat`
          : user?.role === 'guru'
            ? 'linear-gradient(135deg, #8B5CF6, #6366F1)'
            : 'linear-gradient(135deg, #0891B2, #2563EB)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.38, fontWeight: 900, color: '#fff',
        border: `${Math.max(2, Math.round(size / 16))}px ${bingkai.style} ${ringColor}`,
        boxSizing: 'border-box',
        position: 'relative', zIndex: 1,
      }}>
        {showPhoto && (
          <img
            src={photoUrl}
            alt=""
            aria-hidden="true"
            onError={() => setImageFailed(true)}
            style={{ display: 'none' }}
          />
        )}
        {!showPhoto && (user?.name || '?')[0]?.toUpperCase()}
      </div>
    </div>
  )
}

// Animated orbiting particles for Celestia banner background
export function CelestiaParticles() {
  React.useEffect(() => { ensureLuxuryStyles() }, [])
  const orbs = [
    { size: 5, dist: 94, dur: '9s',  delay: '0s',    color: '#93c5fd' },
    { size: 3, dist: 90, dur: '13s', delay: '-4s',   color: '#bfdbfe' },
    { size: 4, dist: 86, dur: '7s',  delay: '-2s',   color: '#60a5fa' },
    { size: 2, dist: 92, dur: '16s', delay: '-7s',   color: '#e0f2fe' },
    { size: 3, dist: 88, dur: '11s', delay: '-10s',  color: '#93c5fd' },
    { size: 5, dist: 83, dur: '8s',  delay: '-5.5s', color: '#38bdf8' },
  ]
  return (
    <>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: o.size, height: o.size,
          marginTop: -o.size / 2, marginLeft: -o.size / 2,
          borderRadius: '50%',
          background: o.color,
          boxShadow: `0 0 8px 2px ${o.color}99`,
          animation: `tomat-orbit ${o.dur} linear ${o.delay} infinite`,
          transformOrigin: `${o.size / 2}px ${o.size / 2}px`,
          transform: `rotate(${i * 60}deg) translateX(${o.dist}px)`,
        }} />
      ))}
    </>
  )
}

// Royal shimmer streak
export function RoyalShimmer() {
  React.useEffect(() => { ensureLuxuryStyles() }, [])
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', top: 0, bottom: 0, width: '40%',
        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.18), transparent)',
        animation: 'tomat-shimmer 3.5s ease-in-out 1.2s infinite',
      }} />
    </div>
  )
}

export function PublicProfileModal({ profile, loading, error, onClose }) {
  const { user: currentUser } = useAuth()

  // Close on Escape key
  React.useEffect(() => {
    if (!profile && !loading && !error) return
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [profile, loading, error, onClose])

  if (!profile && !loading && !error) return null

  const spandukId = profile?.equippedSpanduk ?? profile?.equipped_spanduk
  const spanduk    = spandukId ? SPANDUK_VISUALS[spandukId] : null
  const bingkaiId  = profile?.equippedBingkai ?? profile?.equipped_bingkai
  const bingkai    = bingkaiId ? BINGKAI_VISUALS[bingkaiId] : null
  const isCelestia = spanduk?.luxury === 'celestia'
  const isRoyal    = spanduk?.luxury === 'royal'
  const isLuxuryFrame = bingkai?.luxury === 'aurum' || bingkai?.luxury === 'void'

  // Card border color driven by the equipped spanduk
  const cardBorder = isCelestia
    ? '1px solid rgba(147,197,253,0.35)'
    : isRoyal
      ? '1px solid rgba(212,175,55,0.45)'
      : '1px solid rgba(103,232,249,0.25)'
  const cardGlow = isCelestia
    ? '0 20px 55px rgba(0,0,0,0.55), 0 0 40px rgba(96,165,250,0.12)'
    : isRoyal
      ? '0 20px 55px rgba(0,0,0,0.55), 0 0 40px rgba(212,175,55,0.12)'
      : '0 20px 55px rgba(0,0,0,0.55)'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18,
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxWidth: 360, background: '#0f172a',
        border: cardBorder, borderRadius: 22,
        boxShadow: cardGlow, overflow: 'hidden', position: 'relative',
      }} onClick={e => e.stopPropagation()}>

        {loading ? (
          <div style={{ color: '#64748B', textAlign: 'center', padding: '60px 20px', fontSize: 12 }}>Memuat profil…</div>
        ) : error ? (
          <div style={{ color: '#FCA5A5', textAlign: 'center', padding: '50px 20px', fontSize: 12 }}>{error}</div>
        ) : (
          <>
            {/* ── BANNER BACKGROUND (fullscreen top section) ── */}
            <div style={{
              position: 'relative',
              height: 140,
              background: spanduk
                ? spanduk.gradient
                : 'linear-gradient(160deg,#0c1a2e,#111827)',
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

              {/* Celestia animated orbiting particles */}
              {isCelestia && (
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  <CelestiaParticles />
                  {/* Static star dots */}
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

              {/* Item label bottom-left */}
              {spanduk && (
                <div style={{
                  position: 'absolute', left: 16, bottom: 48,
                  color: isRoyal ? '#f5e7b2cc' : isCelestia ? '#dbeafecc' : '#ffffffaa',
                  fontSize: 8, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase',
                  textShadow: '0 1px 10px rgba(0,0,0,0.7)',
                }}>
                  {isRoyal ? 'Royal Mathematician' : isCelestia ? 'Celestia Relic' : spandukId}
                </div>
              )}

              {/* Close button top-right */}
              <button onClick={onClose} aria-label="Tutup profil" style={{
                position: 'absolute', top: 10, right: 10,
                width: 28, height: 28, borderRadius: 8, border: 'none',
                background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
                color: '#94A3B8', cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>

              {/* Decorative icon top-left */}
              {spanduk && (
                <div style={{
                  position: 'absolute', top: 12, left: 14,
                  color: isRoyal ? '#d4af37' : isCelestia ? '#93c5fd' : '#cbd5e1',
                  fontSize: 13, opacity: 0.75,
                }}>
                  {isRoyal ? '◇' : isCelestia ? '✦' : '✧'}
                </div>
              )}

              {/* Soft fade-to-card at bottom */}
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, height: 56,
                background: 'linear-gradient(to bottom, transparent, #0f172a)',
                pointerEvents: 'none',
              }} />

              {/* ── Placed stickers (read-only) ── */}
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
            </div>

            {/* ── AVATAR (overlapping banner bottom) ── */}
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
              marginTop: -52, marginBottom: 10, position: 'relative', zIndex: 2,
              gap: 8,
            }}>
              {/* Pet — shown to the left of the avatar */}
              {profile.equippedPetSkin && profile.role === 'siswa' ? (
                <div style={{ animation: 'tomi-idle 2.4s ease-in-out infinite', transformOrigin: 'center bottom', marginBottom: 4 }}>
                  <PetSVG state="happy" skinId={profile.equippedPetSkin} size={64} />
                </div>
              ) : (
                <div style={{ width: 64 }} />
              )}
              {isLuxuryFrame ? (
                <LuxuryAvatarFrame user={profile} size={88} bingkai={bingkai} bingkaiId={bingkaiId} />
              ) : (
                <UserAvatar user={profile} size={88} />
              )}
              {/* spacer to keep avatar centred */}
              <div style={{ width: 64 }} />
            </div>

            {/* ── PROFILE INFO ── */}
            <div style={{ padding: '0 22px 10px', textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>{profile.name}</div>
              <div style={{
                display: 'inline-block', marginTop: 7, padding: '5px 12px', borderRadius: 99,
                background: profile.role === 'guru' ? 'rgba(167,139,250,0.14)' : 'rgba(103,232,249,0.12)',
                color: profile.role === 'guru' ? '#C4B5FD' : '#67E8F9',
                fontSize: 11, fontWeight: 800,
              }}>{profile.role === 'guru' ? '🎓 Guru' : '🧑‍🎓 Siswa'}</div>
              <div style={{ color: '#94A3B8', fontSize: 11, lineHeight: 1.5, marginTop: 12 }}>
                {Array.isArray(profile.kelas) ? profile.kelas.join(' · ') : profile.kelas}
              </div>

              {/* Stats — only for siswa */}
              {profile.role === 'siswa' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '14px 0 0' }}>
                  {[
                    { label: 'Level', value: profile.level ?? '—', icon: '⭐' },
                    { label: 'Koin',  value: profile.coins ?? '—', icon: '🪙' },
                    { label: 'EXP',   value: profile.exp   ?? '—', icon: '⚡' },
                  ].map(({ label, value, icon }) => (
                    <div key={label} style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 12, padding: '10px 4px',
                    }}>
                      <div style={{ fontSize: 16 }}>{icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginTop: 3 }}>{value}</div>
                      <div style={{ fontSize: 9, color: '#64748B', fontWeight: 600, marginTop: 1 }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{
                marginTop: 14, padding: '13px 14px', borderRadius: 13, textAlign: 'left',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                color: profile.bio ? '#CBD5E1' : '#64748B', fontSize: 12, lineHeight: 1.6,
              }}>{profile.bio || 'Belum ada bio.'}</div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, padding: '0 22px 18px', marginTop: 8 }}>
              <button
                onClick={() => {
                  // The modal already has the complete, access-checked profile.
                  // Pass it along so the full profile screen does not make a
                  // second request that can race or fail independently.
                  window.dispatchEvent(new CustomEvent('tomat:visit-profile', { detail: profile }))
                  onClose()
                }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)', color: '#E2E8F0',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >👤 Lihat Profil</button>

              {profile.role === 'siswa' && currentUser?.role === 'siswa' && profile.id !== currentUser?.id && (
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('tomat:invite-duel', { detail: profile }))
                    onClose()
                  }}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', color: '#fff',
                    fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
                  }}
                >⚔️ Ajak Duel</button>
              )}
            </div>

            {/* Celestia animated edge shimmer strip at very bottom */}
            {isCelestia && (
              <div style={{
                height: 2,
                background: 'linear-gradient(90deg, transparent, #60a5fa, #93c5fd, #60a5fa, transparent)',
                opacity: 0.7,
              }} />
            )}
            {isRoyal && (
              <div style={{
                height: 2,
                background: 'linear-gradient(90deg, transparent, #d4af37, #f5e7b2, #d4af37, transparent)',
                opacity: 0.7,
              }} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function usePublicProfile() {
  const [profileState, setProfileState] = React.useState({ profile: null, loading: false, error: '' })
  const openProfile = React.useCallback(async target => {
    let normalizedTarget
    try { normalizedTarget = normalizeProfileTarget(target) } catch { return }
    setProfileState({ profile: null, loading: true, error: '' })
    try {
      const profile = await fetchPublicProfile(normalizedTarget)
      setProfileState({ profile, loading: false, error: '' })
    } catch (err) {
      setProfileState({ profile: null, loading: false, error: err.message })
    }
  }, [])
  const closeProfile = React.useCallback(() => {
    setProfileState({ profile: null, loading: false, error: '' })
  }, [])
  return { ...profileState, openProfile, closeProfile }
}

// Small pill showing the active difficulty tier (or "Survival" streak) next to a TopBar title.
export function DifficultyBadge({ difficulty, survival, streak }) {
  if (survival) {
    return (
      <span style={{ background: 'rgba(248,113,113,0.15)', color: '#F87171', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap' }}>
        🔥 Survival · {streak ?? 0}
      </span>
    )
  }
  if (!difficulty) return null
  const color = DIFFICULTY_COLORS[difficulty] || '#67E8F9'
  return (
    <span style={{ background: `${color}22`, color, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap' }}>
      {DIFFICULTY_LABELS[difficulty] || difficulty}
    </span>
  )
}

// Shared "game over" screen for Survival mode: shown instead of the normal feedback/next-
// question UI the instant a wrong answer is recorded. Reused by every minigame.
export function SurvivalOverScreen({ streak, onRetry, goBack, accentColor = '#F87171' }) {
  const { reportSurvivalStreak } = usePlayer()
  const reportedRef = React.useRef(false)
  React.useEffect(() => {
    if (reportedRef.current) return
    reportedRef.current = true
    reportSurvivalStreak?.(streak)
  }, [streak, reportSurvivalStreak])
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🔥 Survival Berakhir" onBack={goBack} accentColor={accentColor} />
      <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 56 }}>💀</div>
        <div style={{ fontSize: 15, color: '#94A3B8', textAlign: 'center' }}>Jawaban salah — perjalanan survival-mu berakhir di sini.</div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase' }}>Soal Benar Berturut-turut</div>
          <div style={{ fontSize: 48, fontWeight: 900, color: '#EAB308' }}>{streak}</div>
        </div>
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <Btn onClick={onRetry} color={accentColor}>🔁 Coba Lagi</Btn>
          <Btn onClick={goBack} color="#334155">⬅ Kembali</Btn>
        </div>
      </div>
    </div>
  )
}

export function useMessageNotifications(enabled = true) {
  const [notifications, setNotifications] = React.useState({ total: 0, privateCount: 0, forumCount: 0 })
  const refresh = React.useCallback(async () => {
    if (!enabled) return
    try {
      const res = await fetch('/api/komunikasi/unread', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      setNotifications({
        total: Number(data.total) || 0,
        privateCount: Number(data.privateCount) || 0,
        forumCount: Number(data.forumCount) || 0,
      })
    } catch {
      // Notifications are supplementary; a temporary polling failure should not
      // interrupt the screen the user is currently using.
    }
  }, [enabled])

  React.useEffect(() => {
    refresh()
    if (!enabled) return undefined
    const timer = window.setInterval(refresh, 5000)
    return () => window.clearInterval(timer)
  }, [enabled, refresh])

  return notifications
}

export function MessageNotificationBell({ onClick, suppress }) {
  const notifications = useMessageNotifications(true)
  const [open, setOpen] = React.useState(false)
  const total = suppress ? 0 : notifications.total
  const openCommunication = () => {
    setOpen(false)
    onClick?.()
  }
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(value => !value)}
        title="Notifikasi pesan"
        aria-label={`Notifikasi pesan${total ? `, ${total} pesan baru` : ''}`}
        aria-expanded={open}
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 10,
          background: open ? 'rgba(103,232,249,0.16)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(103,232,249,0.45)' : 'rgba(255,255,255,0.08)'}`,
          color: '#67E8F9', cursor: 'pointer', fontSize: 17,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        💬
        {total > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18,
            padding: '0 4px', borderRadius: 99, background: '#EF4444', color: '#fff',
            fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #0A0B14',
          }}>{notifications.total > 99 ? '99+' : notifications.total}</span>
        )}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 46, right: 0, width: 245, maxWidth: 'calc(100vw - 32px)',
          background: '#151923', border: '1px solid rgba(103,232,249,0.25)',
          borderRadius: 16, boxShadow: '0 14px 34px rgba(0,0,0,0.45)', overflow: 'hidden', zIndex: 60,
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, fontWeight: 800 }}>
            💬 Pesan Baru
          </div>
          {total === 0 ? (
            <div style={{ padding: '18px 14px', color: '#64748B', fontSize: 12, textAlign: 'center' }}>Tidak ada pesan baru.</div>
          ) : (
            <button onClick={openCommunication} style={{
              width: '100%', border: 'none', background: 'transparent', color: '#CBD5E1',
              padding: '12px 14px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <div style={{ color: '#67E8F9', fontSize: 12, fontWeight: 800, marginBottom: 5 }}>Buka Komunikasi →</div>
              <div style={{ fontSize: 11, lineHeight: 1.6 }}>
                {notifications.privateCount > 0 && <div>✉️ {notifications.privateCount} chat pribadi</div>}
                {notifications.forumCount > 0 && <div>💬 {notifications.forumCount} pesan forum</div>}
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function notificationLabel(notification) {
  if (notification.type === 'pesan_pribadi') return '💬 Pesan pribadi'
  if (notification.type === 'pesan_forum') return '💬 Forum kelas'
  if (notification.type === 'tugas_baru') return '📝 Tugas baru'
  if (notification.type === 'nilai_baru') return '⭐ Nilai baru'
  if (notification.type === 'hafalan') return '🧮 Hafalan'
  return '🔔 Informasi TOMAT'
}

export function AppNotificationBell({ onCommunicationClick }) {
  const appNotifications = useAppNotifications(true)
  const push = usePushNotifications(true)
  const [open, setOpen] = React.useState(false)

  const openNotification = async notification => {
    await appNotifications.markRead(notification.id)
    setOpen(false)
    if (notification.url === '/komunikasi' || notification.type.startsWith('pesan_')) {
      const target = notification.metadata || {}
      onCommunicationClick?.(target)
      if (!onCommunicationClick) window.dispatchEvent(new CustomEvent('tomat:open-komunikasi', { detail: target }))
    }
  }

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(value => !value)}
        title="Pusat notifikasi"
        aria-label={`Pusat notifikasi${appNotifications.unreadCount ? `, ${appNotifications.unreadCount} belum dibaca` : ''}`}
        aria-expanded={open}
        style={{
          position: 'relative', width: 36, height: 36, borderRadius: 10,
          background: open ? 'rgba(167,139,250,0.16)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.08)'}`,
          color: '#C4B5FD', cursor: 'pointer', fontSize: 17,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        📣
        {appNotifications.unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18,
            padding: '0 4px', borderRadius: 99, background: '#EF4444', color: '#fff',
            fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #0A0B14',
          }}>{appNotifications.unreadCount > 99 ? '99+' : appNotifications.unreadCount}</span>
        )}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 46, right: 0, width: 310, maxWidth: 'calc(100vw - 32px)',
          background: '#151923', border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: 16, boxShadow: '0 14px 34px rgba(0,0,0,0.45)', overflow: 'hidden', zIndex: 70,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ flex: 1, color: '#fff', fontSize: 13, fontWeight: 800 }}>📣 Pusat Notifikasi</span>
            {appNotifications.unreadCount > 0 && (
              <button onClick={() => appNotifications.markAllRead()} style={{
                border: 'none', background: 'none', color: '#A78BFA', cursor: 'pointer',
                fontSize: 10, fontFamily: 'inherit', fontWeight: 700,
              }}>Tandai semua</button>
            )}
          </div>
          {push.supported && (
            <div style={{
              padding: '10px 14px', background: 'rgba(103,232,249,0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {push.subscribed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13 }}>✅</span>
                  <span style={{ flex: 1, color: '#CBD5E1', fontSize: 11 }}>Notifikasi HP aktif</span>
                  <button onClick={push.disable} style={{ border: 'none', background: 'none', color: '#64748B', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit' }}>Matikan</button>
                </div>
              ) : push.configured ? (
                <button onClick={push.enable} disabled={push.loading} style={{
                  width: '100%', border: '1px solid rgba(103,232,249,0.25)', borderRadius: 10,
                  background: 'rgba(103,232,249,0.08)', color: '#67E8F9', padding: '8px 10px',
                  cursor: push.loading ? 'default' : 'pointer', fontSize: 11, fontWeight: 800, fontFamily: 'inherit',
                }}>🔔 {push.loading ? 'Menyiapkan…' : 'Aktifkan notifikasi HP/browser'}</button>
              ) : (
                <div style={{ color: '#64748B', fontSize: 10, lineHeight: 1.5 }}>
                  Notifikasi perangkat belum dikonfigurasi. Pusat notifikasi aplikasi tetap aktif.
                </div>
              )}
              {push.error && <div style={{ color: '#FCA5A5', fontSize: 10, marginTop: 5 }}>{push.error}</div>}
            </div>
          )}
          {appNotifications.loading ? (
            <div style={{ padding: '18px 14px', color: '#64748B', fontSize: 12, textAlign: 'center' }}>Memuat…</div>
          ) : appNotifications.notifications.length === 0 ? (
            <div style={{ padding: '18px 14px', color: '#64748B', fontSize: 12, textAlign: 'center' }}>Belum ada notifikasi.</div>
          ) : (
            <div style={{ maxHeight: 330, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {appNotifications.notifications.map(notification => (
                <button key={notification.id} onClick={() => openNotification(notification)} style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  background: notification.read_at ? 'rgba(255,255,255,0.025)' : 'rgba(167,139,250,0.1)',
                  border: `1px solid ${notification.read_at ? 'rgba(255,255,255,0.06)' : 'rgba(167,139,250,0.25)'}`,
                  borderRadius: 11, padding: '9px 10px', color: '#fff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ flex: 1, color: notification.read_at ? '#CBD5E1' : '#C4B5FD', fontSize: 11, fontWeight: 800 }}>{notificationLabel(notification)}</span>
                    {!notification.read_at && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA' }} />}
                  </div>
                  <div style={{ color: '#E2E8F0', fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>{notification.title}</div>
                  <div style={{ color: '#94A3B8', fontSize: 10, marginTop: 3, lineHeight: 1.4 }}>{notification.body}</div>
                  <div style={{ color: '#64748B', fontSize: 9, marginTop: 5 }}>{new Date(notification.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PlayerHeader({ onAvatarClick, onNotificationTaskClick, onCommunicationClick }) {
  const { player } = usePlayer()
  const { logout, user } = useAuth()
  const { tasks = [] } = useTask() || {}
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const activeTasks = onNotificationTaskClick ? tasks.filter(task => task.status === 'active') : []
  const messageNotifications = useMessageNotifications(true)
  const appNotifications = useAppNotifications(true)
  const push = usePushNotifications(true)
  const expPct = Math.min(100, Math.round((player.exp / player.maxExp) * 100))
  const bingkai = user?.equippedBingkai ? BINGKAI_VISUALS[user.equippedBingkai] : null
  const isLuxuryFrame = bingkai?.luxury === 'aurum' || bingkai?.luxury === 'void'
  const avatar = isLuxuryFrame
    ? <LuxuryAvatarFrame user={user} size={48} bingkai={bingkai} bingkaiId={user.equippedBingkai} />
    : <UserAvatar user={user} size={48} />
  return (
    <div className="tomat-player-header" style={{
      padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(10,11,20,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 20,
    }}>
      <button onClick={onAvatarClick} disabled={!onAvatarClick} aria-label={onAvatarClick ? 'Buka profil' : undefined} style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0, padding: 0,
        cursor: onAvatarClick ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', background: 'transparent',
      }}>{avatar}</button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: '#34D399', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          ⭐ Level {player.level}
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 1 }}>{player.name}</div>
        <div style={{ marginTop: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 5, overflow: 'hidden', position: 'relative' }}>
          <div style={{ width: `${expPct}%`, height: '100%', background: 'linear-gradient(90deg, #10B981, #06B6D4)', borderRadius: 99, transition: 'width 0.6s ease', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
        </div>
        <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{player.exp} / {player.maxExp} EXP</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontSize: 16, fontWeight: 900, color: '#FBBF24',
          background: 'rgba(251,191,36,0.1)', padding: '4px 10px', borderRadius: 20,
          border: '1px solid rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', gap: 4,
        }}>🪙 {player.coins}</div>
      </div>
      {user && (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setNotificationsOpen(open => !open)}
            title="Notifikasi"
            aria-label={`Notifikasi${activeTasks.length || messageNotifications.total || appNotifications.unreadCount ? `, ${Math.max(activeTasks.length + messageNotifications.total, appNotifications.unreadCount)} item baru` : ''}`}
            aria-expanded={notificationsOpen}
            style={{
              position: 'relative', width: 36, height: 36, borderRadius: 10,
              background: notificationsOpen ? 'rgba(103,232,249,0.16)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${notificationsOpen ? 'rgba(103,232,249,0.45)' : 'rgba(255,255,255,0.08)'}`,
              color: '#67E8F9', cursor: 'pointer', fontSize: 17,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            🔔
            {Math.max(activeTasks.length + messageNotifications.total, appNotifications.unreadCount) > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18,
                padding: '0 4px', borderRadius: 99, background: '#EF4444', color: '#fff',
                fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #0A0B14',
              }}>{Math.max(activeTasks.length + messageNotifications.total, appNotifications.unreadCount) > 99 ? '99+' : Math.max(activeTasks.length + messageNotifications.total, appNotifications.unreadCount)}</span>
            )}
          </button>
          {notificationsOpen && (
            <div style={{
              position: 'absolute', top: 46, right: 0, width: 290, maxWidth: 'calc(100vw - 32px)',
              background: '#151923', border: '1px solid rgba(103,232,249,0.25)',
              borderRadius: 16, boxShadow: '0 14px 34px rgba(0,0,0,0.45)', overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                color: '#fff', fontSize: 13, fontWeight: 800,
              }}>
                 🔔 Notifikasi
              </div>
               {push.supported && (
                 <div style={{
                   padding: '10px 14px', background: 'rgba(103,232,249,0.05)',
                   borderBottom: '1px solid rgba(255,255,255,0.06)',
                 }}>
                   {push.subscribed ? (
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <span style={{ fontSize: 13 }}>✅</span>
                       <span style={{ flex: 1, color: '#CBD5E1', fontSize: 11 }}>Notifikasi HP aktif</span>
                       <button onClick={push.disable} style={{ border: 'none', background: 'none', color: '#64748B', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit' }}>Matikan</button>
                     </div>
                   ) : push.configured ? (
                     <button onClick={push.enable} disabled={push.loading} style={{
                       width: '100%', border: '1px solid rgba(103,232,249,0.25)', borderRadius: 10,
                       background: 'rgba(103,232,249,0.08)', color: '#67E8F9', padding: '8px 10px',
                       cursor: push.loading ? 'default' : 'pointer', fontSize: 11, fontWeight: 800, fontFamily: 'inherit',
                     }}>🔔 {push.loading ? 'Menyiapkan…' : 'Aktifkan notifikasi HP/browser'}</button>
                   ) : (
                     <div style={{ color: '#64748B', fontSize: 10, lineHeight: 1.5 }}>
                       Pusat notifikasi aplikasi aktif. Notifikasi HP menunggu konfigurasi server.
                     </div>
                   )}
                   {push.error && <div style={{ color: '#FCA5A5', fontSize: 10, marginTop: 5 }}>{push.error}</div>}
                 </div>
               )}
               {activeTasks.length === 0 && messageNotifications.total === 0 && appNotifications.notifications.length === 0 ? (
                <div style={{ padding: '18px 14px', color: '#64748B', fontSize: 12, textAlign: 'center' }}>
                   Tidak ada notifikasi baru.
                </div>
              ) : (
                 <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {appNotifications.notifications.slice(0, 5).map(notification => (
                      <button key={`app-${notification.id}`} onClick={() => {
                        appNotifications.markRead(notification.id)
                        setNotificationsOpen(false)
                        if (notification.url === '/komunikasi' || notification.type.startsWith('pesan_')) {
                          const target = notification.metadata || {}
                          onCommunicationClick?.(target)
                          if (!onCommunicationClick) window.dispatchEvent(new CustomEvent('tomat:open-komunikasi', { detail: target }))
                        }
                      }} style={{
                        width: '100%', textAlign: 'left', cursor: 'pointer',
                        background: notification.read_at ? 'rgba(255,255,255,0.025)' : 'rgba(167,139,250,0.1)',
                        border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, padding: '10px 11px', color: '#fff', fontFamily: 'inherit',
                      }}>
                        <div style={{ fontSize: 11, color: '#C4B5FD', fontWeight: 800 }}>{notificationLabel(notification)}</div>
                        <div style={{ fontSize: 11, color: '#E2E8F0', marginTop: 4 }}>{notification.title}</div>
                        <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}>{notification.body}</div>
                      </button>
                    ))}
                   {messageNotifications.total > 0 && (
                     <button
                       onClick={() => {
                         setNotificationsOpen(false)
                         const tabTarget = messageNotifications.privateCount > 0 ? { conversationType: 'private' } : { conversationType: 'forum' }
                         onCommunicationClick?.(tabTarget)
                         if (!onCommunicationClick) window.dispatchEvent(new CustomEvent('tomat:open-komunikasi', { detail: tabTarget }))
                       }}
                       style={{
                         width: '100%', textAlign: 'left', cursor: 'pointer',
                         background: 'rgba(103,232,249,0.08)', border: '1px solid rgba(103,232,249,0.25)',
                         borderRadius: 12, padding: '10px 11px', color: '#fff', fontFamily: 'inherit',
                       }}
                     >
                       <div style={{ fontSize: 12, fontWeight: 800, color: '#67E8F9' }}>💬 Pesan Baru</div>
                       <div style={{ color: '#CBD5E1', fontSize: 10, marginTop: 4 }}>
                         {messageNotifications.privateCount > 0 && `${messageNotifications.privateCount} chat pribadi`}
                         {messageNotifications.privateCount > 0 && messageNotifications.forumCount > 0 ? ' · ' : ''}
                         {messageNotifications.forumCount > 0 && `${messageNotifications.forumCount} pesan forum`}
                       </div>
                     </button>
                   )}
                  {activeTasks.map(task => {
                    const color = TYPE_COLORS[task.type] || '#67E8F9'
                    return (
                      <button
                        key={task.id}
                        onClick={() => {
                          setNotificationsOpen(false)
                          onNotificationTaskClick?.(task)
                        }}
                        style={{
                          width: '100%', textAlign: 'left', cursor: 'pointer',
                          background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}33`,
                          borderRadius: 12, padding: '10px 11px', color: '#fff', fontFamily: 'inherit',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 21 }}>{task.gameEmoji || '🎮'}</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: 'block', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.gameName}
                            </span>
                            <span style={{ display: 'block', marginTop: 3, color, fontSize: 10, fontWeight: 700 }}>
                              {TYPE_ICONS[task.type] || '📝'} {TYPE_LABELS[task.type] || 'Tugas'} · {task.totalQuestions} soal
                            </span>
                          </span>
                          <span style={{ color: '#67E8F9', fontSize: 15 }}>▶</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <button onClick={logout} title="Keluar" style={{
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
        color: '#64748B', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', fontSize: 15, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>⏻</button>
    </div>
  )
}

export function Card({ children, style = {}, border = 'rgba(255,255,255,0.08)', onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#0E1E35', borderRadius: 22, border: `1px solid ${border}`,
        padding: '16px', cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
        transition: onClick ? 'border-color 0.2s, box-shadow 0.2s, transform 0.15s' : undefined,
        ...style,
      }}
      onMouseEnter={onClick ? e => {
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      } : undefined}
      onMouseLeave={onClick ? e => {
        e.currentTarget.style.borderColor = border
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      } : undefined}
    >
      {children}
    </div>
  )
}

export function Btn({ children, onClick, disabled, color = '#6366F1', textColor = '#fff', style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? '#374151' : `linear-gradient(135deg, ${color}, #4F46E5)`,
      color: disabled ? '#6B7280' : textColor,
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 15, padding: '15px 20px',
      fontSize: 15, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%', fontFamily: 'inherit', transition: 'opacity 0.15s, transform 0.15s',
      boxShadow: disabled ? 'none' : '0 6px 24px rgba(79,70,229,0.28)',
      opacity: disabled ? 0.6 : 1, ...style,
    }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { e.currentTarget.style.opacity = disabled ? '0.6' : '1'; e.currentTarget.style.transform = 'translateY(0)' }}
    >{children}</button>
  )
}

export function OptionGrid({ options, onSelect, correct = null, disabled = false, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 10 }}>
      {options.map((opt, i) => {
        const isCorrect = correct !== null && opt === correct
        const bg = correct !== null ? (isCorrect ? '#16a34a' : '#1E2128') : '#1E2128'
        const border = correct !== null ? (isCorrect ? '#22c55e' : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.08)'
        return (
          <button key={i} onClick={() => !disabled && onSelect(opt)} style={{
            background: bg, border: `2px solid ${border}`, borderRadius: 12,
            padding: '14px 8px', color: '#fff', fontSize: 17, fontWeight: 700,
            cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}>{opt}</button>
        )
      })}
    </div>
  )
}

// FeedbackBanner supports two call patterns:
//   New (G7 games): <FeedbackBanner message="..." isCorrect={bool} extras="..." />
//   Legacy (G8/G9): <FeedbackBanner correct={bool} answer={val} onNext={fn} />
//
// In task (tugas) mode, when onNext is provided and the answer was WRONG, this
// component automatically calls recordWrongAnswer() before advancing so that the
// task session counts the question as answered (preventing infinite retries).
export function FeedbackBanner({ message, isCorrect, extras, correct, answer, onNext }) {
  const { recordWrongAnswer } = usePlayer()
  // Resolve which pattern is being used
  const resolvedIsCorrect = isCorrect !== undefined ? isCorrect : correct
  const resolvedMessage = message !== undefined
    ? message
    : resolvedIsCorrect
      ? `✅ Benar! Jawaban: ${answer}`
      : `❌ Salah! Jawaban yang benar: ${answer}`
  if (resolvedMessage === null || resolvedMessage === undefined || resolvedMessage === '') return null

  const handleNext = () => {
    if (!resolvedIsCorrect) recordWrongAnswer?.()
    onNext()
  }

  return (
    <>
      <div style={{
        padding: '16px', borderRadius: 16, marginTop: 16,
        background: resolvedIsCorrect ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
        border: `1px solid ${resolvedIsCorrect ? '#16a34a' : '#dc2626'}`,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: resolvedIsCorrect ? '#4ade80' : '#f87171' }}>{resolvedMessage}</div>
        {resolvedIsCorrect && extras && <div style={{ fontSize: 14, color: '#EAB308', marginTop: 4 }}>{extras}</div>}
        {resolvedIsCorrect && !extras && onNext && <div style={{ fontSize: 14, color: '#EAB308', marginTop: 4 }}>+50 Koin | +100 EXP</div>}
      </div>
      {onNext && (
        <Btn onClick={handleNext} color="#0e7490" style={{ marginTop: 8 }}>Misi Berikutnya ▶</Btn>
      )}
    </>
  )
}

// ── Keyboard-first numeric answer field ──────────────────────────────────────
// Use instead of SliderInput when the student should TYPE the answer.
export function NumericInput({ value, onChange, onSubmit, unit = '', accentColor = '#67E8F9', placeholder = 'Ketik jawaban…', disabled = false }) {
  const handleKey = (e) => { if (e.key === 'Enter' && !disabled) onSubmit?.() }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        type="number" inputMode="numeric" value={value} disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        style={{
          background: 'rgba(255,255,255,0.06)', border: `2px solid ${accentColor}55`,
          borderRadius: 14, padding: '18px 20px', fontSize: 32, fontWeight: 900,
          color: '#fff', textAlign: 'center', width: '100%', outline: 'none',
          fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = accentColor }}
        onBlur={e => { e.target.style.borderColor = `${accentColor}55` }}
      />
      {unit && <div style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>Satuan: <strong style={{ color: '#fff' }}>{unit}</strong></div>}
    </div>
  )
}

// ── 2×2 / 4-option multiple-choice tile grid ─────────────────────────────────
// `options` — array of strings/numbers shown as tiles.
// `correct`  — the correct value; null while waiting for input.
// Pass `cols` to override the 2-column default (e.g. cols=1 for Yes/No pairs).
export function MultipleChoice({ options, selected, onSelect, correct = null, disabled = false, accentColor = '#67E8F9', cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
      {options.map((opt, i) => {
        const isCorrect = correct !== null && String(opt) === String(correct)
        const isWrong   = correct !== null && String(selected) === String(opt) && !isCorrect
        let bg = '#1E2128', border = 'rgba(255,255,255,0.1)'
        if (isCorrect) { bg = 'rgba(34,197,94,0.15)';  border = '#22c55e' }
        else if (isWrong)  { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444' }
        else if (String(selected) === String(opt)) { bg = `${accentColor}22`; border = accentColor }
        return (
          <button key={i} onClick={() => !disabled && onSelect(opt)} style={{
            background: bg, border: `2px solid ${border}`, borderRadius: 14,
            padding: '18px 10px', color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit',
            transition: 'all 0.18s', textAlign: 'center', lineHeight: 1.3,
          }}>{String(opt)}</button>
        )
      })}
    </div>
  )
}

// ── Unified answer feedback + "Next" button ───────────────────────────────────
// Replaces the old FeedbackBanner usage in G8/G9 games.
export function GameFeedback({ correct, correctAnswer, onNext, unit = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{
        padding: '18px 16px', borderRadius: 16, textAlign: 'center',
        background: correct ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
        border: `1px solid ${correct ? '#22c55e' : '#ef4444'}`,
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{correct ? '✅' : '❌'}</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: correct ? '#4ade80' : '#f87171' }}>
          {correct ? 'Benar! Mantap 🎉' : 'Belum tepat'}
        </div>
        {!correct && correctAnswer !== undefined && (
          <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 6 }}>
            Jawaban yang benar:{' '}
            <span style={{ color: '#fff', fontWeight: 800 }}>{correctAnswer}{unit ? ' ' + unit : ''}</span>
          </div>
        )}
        {correct && <div style={{ fontSize: 13, color: '#EAB308', marginTop: 6 }}>+50 🪙 &nbsp;+100 XP</div>}
      </div>
      <button onClick={onNext} style={{
        background: '#1E2128', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14,
        padding: '14px', color: '#fff', fontSize: 15, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>Soal Berikutnya →</button>
    </div>
  )
}

// Computes a randomized [min,max] range for a SliderInput so the answer never sits at a
// predictable position (e.g. always in the middle, or always a fixed offset from an edge).
// Pass every value that MUST be visible on the slider (answer, start value, reference marks)
// as `mustInclude`. Randomizes independent left/right padding and occasionally widens the
// range further, then snaps to `step`. Call this once per new question (inside genQ()), not
// on every render, so the range itself is part of the randomized question state.
export function randomSliderRange(mustInclude, { step = 1, minPad = 6, maxPad = 30 } = {}) {
  const lo = Math.min(...mustInclude)
  const hi = Math.max(...mustInclude)
  const padLeft = minPad + Math.random() * (maxPad - minPad)
  const padRight = minPad + Math.random() * (maxPad - minPad)
  const snap = (v) => Math.round(v / step) * step
  let min = snap(lo - padLeft)
  let max = snap(hi + padRight)
  if (max <= min) max = min + step * 10
  return { min, max }
}

// Big touch-friendly slider for numeric answers. Replaces numpad/typing wherever the
// answer is a single number moving along a line (temperature, position, quantity, etc).
export function SliderInput({
  value, min, max, step = 1, onChange, disabled = false,
  accentColor = '#67E8F9', unit = '', markEvery = null,
  leftLabel, rightLabel, big = false, label,
}) {
  const pct = ((value - min) / (max - min)) * 100
  const marks = markEvery ? (() => {
    const arr = []
    for (let m = min; m <= max; m += markEvery) arr.push(m)
    return arr
  })() : null
  return (
    <div style={{ width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: big ? 38 : 28, fontWeight: 900, color: '#fff' }}>
          {label !== undefined ? label : `${value}${unit}`}
        </span>
      </div>
      <div style={{ position: 'relative', padding: '8px 4px' }}>
        <div style={{ position: 'relative', height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${accentColor}88, ${accentColor})`, transition: 'width 0.1s' }} />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value} disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: 'absolute', top: -13, left: 0, width: '100%', height: 36,
            appearance: 'none', background: 'transparent', margin: 0, cursor: disabled ? 'default' : 'pointer',
          }}
        />
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            appearance: none; width: 36px; height: 36px; border-radius: 50%;
            background: ${accentColor}; border: 4px solid #0F1115; box-shadow: 0 2px 8px rgba(0,0,0,0.5); cursor: ${disabled ? 'default' : 'grab'};
          }
          input[type=range]::-moz-range-thumb {
            width: 36px; height: 36px; border-radius: 50%; border: 4px solid #0F1115;
            background: ${accentColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.5); cursor: ${disabled ? 'default' : 'grab'};
          }
        `}</style>
      </div>
      {marks && (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', marginTop: 2 }}>
          {marks.map(m => <span key={m} style={{ fontSize: 10, color: '#6B7280' }}>{m}</span>)}
        </div>
      )}
      {(leftLabel || rightLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{leftLabel}</span>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{rightLabel}</span>
        </div>
      )}
    </div>
  )
}

// Generic drag-and-drop matcher: drag chips from a source tray onto target slots.
// Used for "connect the pipe/bridge piece" style interactions instead of multiple choice text.
export function DragMatch({ items, slots, placed, onPlace, disabled = false, accentColor = '#67E8F9', renderChip, renderSlot }) {
  const [dragId, setDragId] = React.useState(null)

  const handleDrop = (slotId) => {
    if (disabled || dragId == null) return
    onPlace(slotId, dragId)
    setDragId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {items.filter(it => !Object.values(placed).includes(it.id)).map(it => (
          <div key={it.id}
            draggable={!disabled}
            onDragStart={() => setDragId(it.id)}
            onTouchStart={() => setDragId(it.id)}
            onClick={() => setDragId(it.id)}
            style={{
              cursor: disabled ? 'default' : 'grab',
              border: dragId === it.id ? `2px solid ${accentColor}` : '2px solid rgba(255,255,255,0.15)',
              borderRadius: 12, padding: '10px 14px', background: '#1E2128',
              opacity: disabled ? 0.5 : 1, userSelect: 'none',
            }}>
            {renderChip ? renderChip(it) : <span style={{ color: '#fff', fontWeight: 700 }}>{it.label}</span>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {slots.map(slot => {
          const filledId = placed[slot.id]
          const filledItem = items.find(it => it.id === filledId)
          return (
            <div key={slot.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(slot.id)}
              onClick={() => dragId != null && handleDrop(slot.id)}
              style={{
                minWidth: 70, minHeight: 60, borderRadius: 12,
                border: `2px dashed ${filledItem ? accentColor : 'rgba(255,255,255,0.25)'}`,
                background: filledItem ? `${accentColor}18` : 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px 10px',
              }}>
              {filledItem
                ? (renderChip ? renderChip(filledItem) : <span style={{ color: '#fff', fontWeight: 700 }}>{filledItem.label}</span>)
                : (renderSlot ? renderSlot(slot) : <span style={{ color: '#6B7280', fontSize: 20 }}>+</span>)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// PageLayout — standard wrapper for all content screens.
// Props: { title, onBack, children, maxWidth, noPad }
export function PageLayout({ title, onBack, children, maxWidth, noPad }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0F1115' }}>
      {onBack && <TopBar title={title} onBack={onBack} />}
      <div style={{
        maxWidth: maxWidth || 'var(--content-max)',
        margin: '0 auto',
        padding: noPad ? 0 : 'var(--page-pad)',
        paddingTop: noPad ? 0 : 24,
      }}>
        {children}
      </div>
    </div>
  )
}

export function MissionCard({ chapter, title, description, onClick, accentColor }) {
  return (
    <div onClick={onClick} style={{
      background: '#1E2128', borderRadius: 16, border: `1px solid rgba(255,255,255,0.08)`,
      padding: '16px', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = accentColor }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
    >
      <div style={{ fontSize: 11, color: accentColor, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{chapter}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{description}</div>
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ background: `${accentColor}22`, color: accentColor, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Mulai Misi ▶</span>
      </div>
    </div>
  )
}
