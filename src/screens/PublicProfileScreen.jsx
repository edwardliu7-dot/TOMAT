import React, { useEffect, useState } from 'react'
import { TopBar, UserAvatar, LuxuryAvatarFrame, CelestiaParticles, RoyalShimmer, ensureLuxuryStyles } from '../components/shared'
import { BINGKAI_VISUALS, SPANDUK_VISUALS } from '../shopVisuals'
import TomiSVG, { PET_CSS } from '../components/TomiSVG'
import PetSVG from '../components/PetSVG'
import { useAuth } from '../AuthContext'
import MobaHistorySection from '../components/MobaHistorySection'

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

export default function PublicProfileScreen({ profile, goBack, onInviteDuel }) {
  const { user: currentUser } = useAuth()
  const isDesktop = useIsDesktop()

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

  if (profile.profileError) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0B14' }}>
        <TopBar title="Profil" onBack={goBack} />
        <div style={{ maxWidth: 420, margin: '80px auto', padding: 24, textAlign: 'center', color: '#FCA5A5', background: '#111827', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 18 }}>
          {profile.profileError}
        </div>
      </div>
    )
  }

  const spandukId   = profile.equippedSpanduk ?? profile.equipped_spanduk
  const spanduk     = spandukId ? SPANDUK_VISUALS[spandukId] : null
  const bingkaiId   = profile.equippedBingkai ?? profile.equipped_bingkai
  const bingkai     = bingkaiId ? BINGKAI_VISUALS[bingkaiId] : null
  const isCelestia  = spanduk?.luxury === 'celestia'
  const isRoyal     = spanduk?.luxury === 'royal'
  const isLuxuryFrame = bingkai?.luxury === 'aurum' || bingkai?.luxury === 'void'
  const canDuel = profile.role === 'siswa' && currentUser?.role === 'siswa' && profile.id !== currentUser?.id

  // ── Banner ──
  const Banner = () => (
    <div style={{ position: 'relative', height: isDesktop ? 200 : 160, background: spanduk ? (spanduk.image ? `url(${spanduk.image}) right center / auto 100% no-repeat, ${spanduk.gradient}` : spanduk.gradient) : 'linear-gradient(160deg,#0c1a2e,#111827)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: isCelestia ? 'radial-gradient(circle at 20% 60%, rgba(191,219,254,0.28), transparent 35%), radial-gradient(circle at 80% 30%, rgba(96,165,250,0.2), transparent 30%)' : isRoyal ? 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.25), transparent 55%), linear-gradient(90deg, transparent, rgba(212,175,55,0.08), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', pointerEvents: 'none' }} />
      {isCelestia && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <CelestiaParticles />
          {[...Array(18)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1, borderRadius: '50%', background: '#bfdbfe', opacity: 0.4 + (i % 4) * 0.12, top: `${10 + (i * 17 + i * 3) % 80}%`, left: `${5 + (i * 23 + i * 7) % 90}%`, animation: i % 2 === 0 ? 'tomat-float-a 4s ease-in-out infinite' : 'tomat-float-b 5s ease-in-out infinite', animationDelay: `${(i * 0.4).toFixed(1)}s` }} />
          ))}
        </div>
      )}
      {isRoyal && <RoyalShimmer />}
      {spanduk && <div style={{ position: 'absolute', left: 16, bottom: 52, color: isRoyal ? '#f5e7b2cc' : isCelestia ? '#dbeafecc' : '#ffffffaa', fontSize: 8, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}>{isRoyal ? 'Royal Mathematician' : isCelestia ? 'Celestia Relic' : spandukId}</div>}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 56, background: 'linear-gradient(to bottom, transparent, #0A0B14)', pointerEvents: 'none' }} />
    </div>
  )

  // ── Avatar area ──
  const AvatarArea = ({ size = 88, overlap = -52 }) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', marginTop: overlap, marginBottom: 10, position: 'relative', zIndex: 2, gap: 8 }}>
      {profile.equippedPetSkin && profile.role === 'siswa' ? (
        <div style={{ animation: 'tomi-idle 2.4s ease-in-out infinite', transformOrigin: 'center bottom', marginBottom: 4 }}>
          <PetSVG state="happy" skinId={profile.equippedPetSkin} size={64} />
        </div>
      ) : <div style={{ width: 64 }} />}
      {isLuxuryFrame ? <LuxuryAvatarFrame user={profile} size={size} bingkai={bingkai} bingkaiId={bingkaiId} /> : <UserAvatar user={profile} size={size} />}
      <div style={{ width: 64 }} />
    </div>
  )

  // ── Stats section ──
  const StatsSection = () => profile.role === 'siswa' ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, margin: '16px 0' }}>
      {[
        { label: 'Level', value: profile.level ?? '—', icon: '⭐' },
        { label: 'Koin', value: profile.coins ?? '—', icon: '🪙' },
        { label: 'EXP', value: profile.exp ?? '—', icon: '⚡' },
      ].map(({ label, value, icon }) => (
        <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: 20 }}>{icon}</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 4 }}>{value}</div>
          <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, marginTop: 2 }}>{label}</div>
        </div>
      ))}
    </div>
  ) : null

  // ── Hafalan badges ──
  const HafalanSection = () => {
    if (profile.role !== 'siswa' || !Array.isArray(profile.badges)) return null
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
              {kali.map(b => <span key={b.id} style={{ background: `${b.color}22`, border: `1px solid ${b.color}55`, color: b.color, borderRadius: 20, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>{b.icon} {b.name}</span>)}
            </div>
          </div>
        )}
        {bagi.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>Pembagian</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {bagi.map(b => <span key={b.id} style={{ background: `${b.color}22`, border: `1px solid ${b.color}55`, color: b.color, borderRadius: 20, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>{b.icon} {b.name}</span>)}
            </div>
          </div>
        )}
      </div>
    )
  }

  const BioPill = () => (
    <div style={{ display: 'inline-block', marginTop: 8, padding: '5px 14px', borderRadius: 99, background: profile.role === 'guru' ? 'rgba(167,139,250,0.14)' : 'rgba(103,232,249,0.12)', color: profile.role === 'guru' ? '#C4B5FD' : '#67E8F9', fontSize: 12, fontWeight: 800 }}>
      {profile.role === 'guru' ? '🎓 Guru' : '🧑‍🎓 Siswa'}
    </div>
  )

  const BioCard = () => (
    <div style={{ padding: '13px 14px', borderRadius: 13, textAlign: 'left', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: profile.bio ? '#CBD5E1' : '#64748B', fontSize: 13, lineHeight: 1.6 }}>
      {profile.bio || 'Belum ada bio.'}
    </div>
  )

  const DuelBtn = () => canDuel ? (
    <button onClick={() => onInviteDuel?.(profile)} style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', color: '#fff', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 24px rgba(99,102,241,0.4)', marginTop: 16 }}>
      ⚔️ Ajak Duel
    </button>
  ) : null

  if (!isDesktop) {
    // ── Mobile layout (existing) ──
    return (
      <div style={{ minHeight: '100vh', background: '#0A0B14' }}>
        <TopBar title="Profil" onBack={goBack} />
        <Banner />
        <AvatarArea />
        <div style={{ padding: '0 20px 24px', textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{profile.name}</div>
          <BioPill />
          <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 10 }}>{Array.isArray(profile.kelas) ? profile.kelas.join(' · ') : profile.kelas}</div>
          <StatsSection />
          <HafalanSection />
          <BioCard />
           {profile.role === 'siswa' && <MobaHistorySection history={profile.mobaHistory} />}
          <DuelBtn />
        </div>
        {isCelestia && <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #60a5fa, #93c5fd, #60a5fa, transparent)', opacity: 0.7 }} />}
        {isRoyal && <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #d4af37, #f5e7b2, #d4af37, transparent)', opacity: 0.7 }} />}
      </div>
    )
  }

  // ── Desktop layout ──
  return (
    <div style={{ minHeight: '100vh', background: '#0A0B14' }}>
      <TopBar title="Profil" onBack={goBack} />
      <Banner />

      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '0 var(--page-pad) 40px' }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', marginTop: -60 }}>

          {/* Left column: avatar + identity + duel */}
          <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2 }}>
            {isLuxuryFrame ? <LuxuryAvatarFrame user={profile} size={96} bingkai={bingkai} bingkaiId={bingkaiId} /> : <UserAvatar user={profile} size={96} />}
            {profile.equippedPetSkin && profile.role === 'siswa' && (
              <div style={{ position: 'absolute', left: 10, bottom: 100, animation: 'tomi-idle 2.4s ease-in-out infinite', transformOrigin: 'center bottom' }}>
                <PetSVG state="happy" skinId={profile.equippedPetSkin} size={52} />
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>{profile.name}</div>
              <BioPill />
              <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 8 }}>{Array.isArray(profile.kelas) ? profile.kelas.join(' · ') : profile.kelas}</div>
            </div>
            <DuelBtn />
          </div>

          {/* Right column: stats + hafalan + bio */}
          <div style={{ flex: 1, minWidth: 0, paddingTop: 70 }}>
            <StatsSection />
            <HafalanSection />
            <BioCard />
            {profile.role === 'siswa' && <MobaHistorySection history={profile.mobaHistory} />}
          </div>
        </div>
      </div>

      {isCelestia && <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #60a5fa, #93c5fd, #60a5fa, transparent)', opacity: 0.7 }} />}
      {isRoyal && <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #d4af37, #f5e7b2, #d4af37, transparent)', opacity: 0.7 }} />}
    </div>
  )
}
