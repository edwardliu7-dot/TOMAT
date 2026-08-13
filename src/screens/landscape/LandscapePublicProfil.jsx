/**
 * LandscapePublicProfil — landscape-mode public profile view for OTHER students.
 * Shows spanduk background, avatar+frame, pet, stats (level/coins/exp), hafalan,
 * bio, cosmetics info, and "Ajak Duel" button.
 *
 * Props:
 *   profile      – pre-fetched profile object from fetchPublicProfile
 *   goBack       – function to go back
 *   onInviteDuel – function(profile) to challenge to duel
 */
import { useEffect } from 'react'
import { useAuth } from '../../AuthContext'
import PetSVG, { PET_CSS } from '../../components/PetSVG'
import {
  UserAvatar,
  LuxuryAvatarFrame,
  CelestiaParticles,
  RoyalShimmer,
  BannerSparkles,
  ensureLuxuryStyles,
} from '../../components/shared'
import MobaHistorySection from '../../components/MobaHistorySection'
import { SPANDUK_VISUALS, BINGKAI_VISUALS } from '../../shopVisuals'

const C = {
  bg: '#12172b', card: '#1c2340', border: '#313a5c',
  txt: '#f2ede3', sub: '#8b8f9e', muted: '#5a6180',
  green: '#5dcaa5', gold: '#fac775', red: '#f0997b',
  purple: '#cecbf6', orange: '#e2653f',
}

const ANGKA_LIST = [1,2,3,4,5,6,7,8,9,10,11,12]

function chipColor(status) {
  if (status === 'lulus')  return { bg:'rgba(93,202,165,0.2)', border:'#5dcaa5', text:'#9fe1cb' }
  if (status === 'diulang') return { bg:'rgba(250,199,117,0.15)', border:'#fac775', text:'#fde68a' }
  return { bg:'rgba(255,255,255,0.04)', border:'#313a5c', text:'#5a6180' }
}

function HafalanSection({ hafalan }) {
  if (!hafalan) return null
  const { perkalian = {}, pembagian = {} } = hafalan
  const pCount = ANGKA_LIST.filter(n => perkalian[n] === 'lulus').length
  const bCount = ANGKA_LIST.filter(n => pembagian[n] === 'lulus').length

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>🧮 HAFALAN</div>

      {/* Perkalian */}
      <div style={{ background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:10, padding:'8px 10px', backdropFilter:'blur(6px)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ color:C.txt, fontSize:9, fontWeight:700 }}>× Perkalian</span>
          <span style={{ color:C.green, fontSize:8.5 }}>{pCount}/12 lulus</span>
        </div>
        <div style={{ height:3, background:'#2a3158', borderRadius:3, marginBottom:5 }}>
          <div style={{ height:3, width:`${(pCount/12)*100}%`, background:`linear-gradient(90deg,${C.green},#22d3a5)`, borderRadius:3 }} />
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
          {ANGKA_LIST.map(n => {
            const col = chipColor(perkalian[n])
            return (
              <div key={n} style={{ width:24, height:20, borderRadius:4, background:col.bg, border:`0.5px solid ${col.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:7.5, color:col.text, fontWeight:600 }}>
                {n}×
              </div>
            )
          })}
        </div>
      </div>

      {/* Pembagian */}
      <div style={{ background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:10, padding:'8px 10px', backdropFilter:'blur(6px)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ color:C.txt, fontSize:9, fontWeight:700 }}>÷ Pembagian</span>
          <span style={{ color:C.purple, fontSize:8.5 }}>{bCount}/12 lulus</span>
        </div>
        <div style={{ height:3, background:'#2a3158', borderRadius:3, marginBottom:5 }}>
          <div style={{ height:3, width:`${(bCount/12)*100}%`, background:`linear-gradient(90deg,#a78bfa,#c4b5fd)`, borderRadius:3 }} />
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
          {ANGKA_LIST.map(n => {
            const col = chipColor(pembagian[n])
            return (
              <div key={n} style={{ width:24, height:20, borderRadius:4, background:col.bg, border:`0.5px solid ${col.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:7.5, color:col.text, fontWeight:600 }}>
                {n}÷
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function LandscapePublicProfil({ profile, goBack, onInviteDuel }) {
  const { user: currentUser } = useAuth()

  useEffect(() => {
    ensureLuxuryStyles()
    if (PET_CSS && !document.getElementById('ls-pubprofil-pet-css')) {
      const s = document.createElement('style')
      s.id = 'ls-pubprofil-pet-css'
      s.textContent = PET_CSS
      document.head.appendChild(s)
    }
  }, [])

  if (!profile) return null

  if (profile.profileError) {
    return (
      <div style={{ width:'100vw', height:'100vh', background:C.bg, display:'flex', flexDirection:'column', fontFamily:'system-ui,sans-serif' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px 8px', borderBottom:`0.5px solid ${C.border}` }}>
          <div onClick={goBack} style={{ width:30, height:30, borderRadius:8, background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>👤 Profil</span>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#f0997b', fontSize:13 }}>
          {profile.profileError}
        </div>
      </div>
    )
  }

  const spandukId   = profile.equippedSpanduk ?? profile.equipped_spanduk
  const spanduk     = spandukId ? SPANDUK_VISUALS[spandukId] : null
  const bingkaiId   = profile.equippedBingkai ?? profile.equipped_bingkai
  const bingkai     = bingkaiId ? BINGKAI_VISUALS[bingkaiId] : null
  const isLuxuryFrame = bingkai?.luxury === 'aurum' || bingkai?.luxury === 'void'
  const isCelestia  = spanduk?.luxury === 'celestia'
  const isRoyal     = spanduk?.luxury === 'royal'
  const petSkin     = profile.equippedPetSkin
  const canDuel     = profile.role === 'siswa' && currentUser?.role === 'siswa'
                      && String(profile.id) !== String(currentUser?.id)
  const kelas       = Array.isArray(profile.kelas)
    ? profile.kelas.join(' · ')
    : (profile.kelas || '—')
  const firstName   = profile.name?.split(' ')[0] || 'Siswa'
  const hafalan     = profile.hafalan ?? null

  return (
    <div style={{
      width: '100vw', height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
      background: C.bg,
    }}>

      {/* ── Spanduk background ─── */}
      {spanduk && (
        <>
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: spanduk.image
              ? `url(${spanduk.image}) center center / cover no-repeat, ${spanduk.gradient}`
              : spanduk.gradient,
            opacity: 0.45,
          }} />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: 'linear-gradient(180deg, rgba(18,23,43,0.55) 0%, rgba(18,23,43,0.82) 55%, rgba(18,23,43,0.96) 100%)',
          }} />
        </>
      )}
      {!spanduk && (
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 50% 80% at 25% 45%, rgba(60,52,137,0.15) 0%, transparent 65%)', zIndex:0 }} />
      )}

      {/* Celestia / Royal particles */}
      {isCelestia && (
        <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none', overflow:'hidden' }}>
          <CelestiaParticles />
          <BannerSparkles color="#93c5fd" count={20} />
        </div>
      )}
      {isRoyal && (
        <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none', overflow:'hidden' }}>
          <BannerSparkles color="#d4af37" count={16} />
          <RoyalShimmer />
        </div>
      )}

      {/* ── Header ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px 8px',
        borderBottom: `0.5px solid rgba(49,58,92,0.6)`,
        flexShrink: 0, position: 'relative', zIndex: 2,
        background: 'rgba(18,23,43,0.60)', backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div
            onClick={goBack}
            style={{ width:30, height:30, borderRadius:8, background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }}
          >‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>👤 Profil Siswa</span>
        </div>
        {canDuel && (
          <button
            onClick={() => onInviteDuel?.(profile)}
            style={{ background:'linear-gradient(90deg,#6366F1,#8B5CF6)', border:'none', borderRadius:8, padding:'6px 16px', color:'#fff', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 10px rgba(99,102,241,0.4)' }}
          >⚔️ Ajak Duel</button>
        )}
      </div>

      {/* ── Body: 3 kolom ─── */}
      <div style={{ flex:1, display:'flex', minHeight:0, position:'relative', zIndex:2 }}>

        {/* KIRI — Avatar + Pet + Identitas */}
        <div style={{
          width: '26%', borderRight: `0.5px solid rgba(49,58,92,0.5)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '14px 12px', gap: 10, overflowY: 'auto',
        }}>
          {/* Avatar with frame */}
          {isLuxuryFrame ? (
            <LuxuryAvatarFrame user={profile} size={76} bingkai={bingkai} bingkaiId={bingkaiId} />
          ) : (
            <UserAvatar user={profile} size={76} />
          )}

          {/* Name + class */}
          <div style={{ textAlign:'center' }}>
            <div style={{ color:C.txt, fontSize:14, fontWeight:800 }}>{profile.name}</div>
            <div style={{ color:C.sub, fontSize:9.5, marginTop:2 }}>{kelas}</div>
            {profile.bio && (
              <div style={{ color:C.muted, fontSize:8.5, marginTop:5, lineHeight:1.4, textAlign:'center' }}>{profile.bio}</div>
            )}
          </div>

          {/* Pet card */}
          {petSkin && (
            <div style={{ display:'flex', alignItems:'center', gap:9, background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'7px 10px', width:'100%', backdropFilter:'blur(6px)' }}>
              <div style={{ animation:'tomi-idle 2.4s ease-in-out infinite', transformOrigin:'center bottom', flexShrink:0 }}>
                <PetSVG skinId={petSkin} state="happy" size={42} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:C.txt, fontSize:10, fontWeight:600 }}>Pet Aktif</div>
                <div style={{ color:C.muted, fontSize:8 }}>Menemani {firstName}</div>
              </div>
            </div>
          )}

          {/* Spanduk label */}
          {spanduk && (
            <div style={{ width:'100%', background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'6px 10px', backdropFilter:'blur(6px)', textAlign:'center' }}>
              <div style={{ color:C.muted, fontSize:7.5, marginBottom:2 }}>SPANDUK AKTIF</div>
              <div style={{
                color: isCelestia ? '#93c5fd' : isRoyal ? '#d4af37' : C.txt,
                fontSize: 9, fontWeight: 600,
              }}>
                {isCelestia ? 'Celestia Relic' : isRoyal ? 'Royal Mathematician' : spandukId?.replace(/_/g,' ')?.replace(/\b\w/g, c=>c.toUpperCase())}
              </div>
            </div>
          )}

          {/* Duel button */}
          {canDuel && (
            <button
              onClick={() => onInviteDuel?.(profile)}
              style={{ width:'100%', background:'linear-gradient(90deg,#6366F1,#8B5CF6)', border:'none', borderRadius:9, padding:'8px 0', color:'#fff', fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 12px rgba(99,102,241,0.35)' }}
            >⚔️ Ajak Duel</button>
          )}
        </div>

        {/* TENGAH — Stats + Hafalan */}
        <div style={{
          width: '38%', borderRight: `0.5px solid rgba(49,58,92,0.5)`,
          display: 'flex', flexDirection: 'column', padding: '12px 12px', gap: 8, overflowY: 'auto',
        }}>
          <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>STATISTIK</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
            {[
              { icon:'⭐', val: profile.level ?? '—', label:'Level', color:C.gold },
              { icon:'🪙', val: typeof profile.coins === 'number' ? profile.coins.toLocaleString('id-ID') : (profile.coins ?? '—'), label:'Koin Total', color:C.gold },
              { icon:'⚡', val: typeof profile.exp === 'number' ? profile.exp.toLocaleString('id-ID') : (profile.exp ?? '—'), label:'Total EXP', color:C.purple },
              { icon:'🧑‍🎓', val: profile.role === 'siswa' ? 'Siswa' : 'Guru', label:'Role', color:C.green },
            ].map((s,i) => (
              <div key={i} style={{ background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:10, padding:'10px 9px', display:'flex', flexDirection:'column', gap:5, alignItems:'center', backdropFilter:'blur(6px)' }}>
                <span style={{ fontSize:16 }}>{s.icon}</span>
                <div style={{ color:s.color, fontSize:13, fontWeight:800 }}>{s.val}</div>
                <div style={{ color:C.muted, fontSize:7.5, textAlign:'center' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Hafalan section — shown if the profile includes it */}
          {hafalan && <HafalanSection hafalan={hafalan} />}
        </div>

        {/* KANAN — Kosmetik + Duel CTA */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'12px 16px', gap:10, overflowY:'auto' }}>
          <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>KOLEKSI</div>

          {/* Cosmetics */}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {bingkaiId && (
              <div style={{ background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'8px 12px', display:'flex', alignItems:'center', gap:8, backdropFilter:'blur(6px)' }}>
                <span style={{ fontSize:16 }}>🖼️</span>
                <div>
                  <div style={{ color:C.muted, fontSize:7, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:2 }}>Bingkai</div>
                  <div style={{ color: isLuxuryFrame ? C.gold : C.txt, fontSize:10, fontWeight:600 }}>
                    {bingkaiId.replace(/_/g,' ').replace(/\b\w/g, c=>c.toUpperCase())}
                  </div>
                </div>
                {isLuxuryFrame && <span style={{ marginLeft:'auto', fontSize:10 }}>✨</span>}
              </div>
            )}
            {petSkin && (
              <div style={{ background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'8px 12px', display:'flex', alignItems:'center', gap:8, backdropFilter:'blur(6px)' }}>
                <span style={{ fontSize:16 }}>🐾</span>
                <div>
                  <div style={{ color:C.muted, fontSize:7, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:2 }}>Pet</div>
                  <div style={{ color:C.txt, fontSize:10, fontWeight:600 }}>
                    {petSkin.replace(/_/g,' ').replace(/\b\w/g, c=>c.toUpperCase())}
                  </div>
                </div>
              </div>
            )}
            {spandukId && (
              <div style={{ background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'8px 12px', display:'flex', alignItems:'center', gap:8, backdropFilter:'blur(6px)' }}>
                <span style={{ fontSize:16 }}>🎌</span>
                <div>
                  <div style={{ color:C.muted, fontSize:7, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5, marginBottom:2 }}>Spanduk</div>
                  <div style={{ color: isCelestia ? '#93c5fd' : isRoyal ? '#d4af37' : C.txt, fontSize:10, fontWeight:600 }}>
                    {isCelestia ? 'Celestia Relic' : isRoyal ? 'Royal Mathematician' : spandukId.replace(/_/g,' ').replace(/\b\w/g, c=>c.toUpperCase())}
                  </div>
                </div>
                {(isCelestia || isRoyal) && <span style={{ marginLeft:'auto', fontSize:10 }}>{isCelestia ? '🌌' : '👑'}</span>}
              </div>
            )}
            {!bingkaiId && !petSkin && !spandukId && (
              <div style={{ color:C.muted, fontSize:10, textAlign:'center', marginTop:10 }}>Belum ada kosmetik</div>
            )}
          </div>
          {profile.role === 'siswa' && <MobaHistorySection history={profile.mobaHistory} />}

          {/* Duel CTA */}
          {canDuel && (
            <div style={{ marginTop:'auto', background:'rgba(99,102,241,0.08)', border:'0.5px solid rgba(99,102,241,0.28)', borderRadius:12, padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:24, marginBottom:6 }}>⚔️</div>
              <div style={{ color:'#a5b4fc', fontSize:12, fontWeight:700, marginBottom:4 }}>
                Tantang {firstName} Duel!
              </div>
              <div style={{ color:C.muted, fontSize:9, marginBottom:12, lineHeight:1.5 }}>
                Pilih permainan dan mulai pertandingan matematika
              </div>
              <button
                onClick={() => onInviteDuel?.(profile)}
                style={{ background:'linear-gradient(90deg,#6366F1,#8B5CF6)', border:'none', borderRadius:9, padding:'9px 28px', color:'#fff', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 12px rgba(99,102,241,0.35)' }}
              >Ajak Duel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
