import React, { useRef, useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import { TopBar, Btn, Card, ProfileBanner, UserAvatar, LuxuryAvatarFrame, CelestiaParticles, RoyalShimmer, BannerSparkles, ensureLuxuryStyles } from '../components/shared'
import { BINGKAI_VISUALS, SPANDUK_VISUALS } from '../shopVisuals'
import { useAuth } from '../AuthContext'
import { usePlayer } from '../PlayerContext'
import { usePet } from '../PetContext'
import TomiSVG, { PET_CSS, STATE_ANIMS } from '../components/TomiSVG'
import PetSVG from '../components/PetSVG'
import { readFileAsDataUrl, getCroppedImage, compressDataUrlToLimit } from '../utils/imageUtils'

async function apiGet(path) {
  const res = await fetch(path, { credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

const MAX_BIO_LENGTH = 300
// Keep the encoded data URL under the server's request limit while retaining
// the roughly 1MB decoded-image budget described to users.
const MAX_PHOTO_BYTES = 760 * 1024

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

function PhotoCropModal({ imageSrc, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setProcessing(true)
    setError('')
    try {
      const cropped = await getCroppedImage(imageSrc, croppedAreaPixels)
      const compressed = await compressDataUrlToLimit(cropped, MAX_PHOTO_BYTES)
      onConfirm(compressed)
    } catch (err) {
      setError(err.message || 'Gagal memproses gambar.')
      setProcessing(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#111827', borderRadius: 20, width: '100%', maxWidth: 400, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Sesuaikan Foto</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Geser dan perbesar untuk memilih bagian foto</div>
        </div>
        <div style={{ position: 'relative', width: '100%', height: 320, background: '#000' }}>
          <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
        </div>
        <div style={{ padding: '14px 18px' }}>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: '100%' }} />
          {error && <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid #dc2626', borderRadius: 10, padding: '8px 12px', color: '#fca5a5', fontSize: 12, textAlign: 'center', marginTop: 8 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={onCancel} disabled={processing} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#E2E2E6', borderRadius: 12, padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Batal</button>
            <button onClick={handleConfirm} disabled={processing || !croppedAreaPixels} style={{ flex: 1, background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', color: '#fff', borderRadius: 12, padding: '11px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: processing ? 0.7 : 1 }}>{processing ? 'Memproses...' : 'Oke'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileHero({ user, photoPreview, onPickPhoto, onRemovePhoto }) {
  const { refreshMe } = useAuth()
  const petCtx = usePet()
  const pet = petCtx?.pet ?? null
  const spandukId = user?.equippedSpanduk ?? user?.equipped_spanduk
  const spanduk   = spandukId ? SPANDUK_VISUALS[spandukId] : null
  const bingkaiId = user?.equippedBingkai ?? user?.equipped_bingkai
  const bingkai   = bingkaiId ? BINGKAI_VISUALS[bingkaiId] : null
  const isCelestia    = spanduk?.luxury === 'celestia'
  const isRoyal       = spanduk?.luxury === 'royal'
  const isLuxuryFrame = bingkai?.luxury === 'aurum' || bingkai?.luxury === 'void'

  React.useEffect(() => {
    ensureLuxuryStyles()
    if (!document.getElementById('tomi-profile-css')) {
      const s = document.createElement('style')
      s.id = 'tomi-profile-css'
      s.textContent = `
        ${PET_CSS}
        @keyframes tomi-heart-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          50%  { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1);   opacity: 0.8; }
        }
      `
      document.head.appendChild(s)
    }
  }, [])

  const previewUser = { ...user, photoUrl: photoPreview }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 8 }}>
      {/* Banner */}
      <div data-raw-image="" style={{ position: 'relative', width: '100%', height: 150, overflow: 'hidden', background: spanduk ? (spanduk.image ? `url(${spanduk.image}) center center / cover no-repeat, ${spanduk.gradient}` : spanduk.gradient) : 'linear-gradient(160deg,#0c1a2e,#111827)', cursor: 'default' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: isCelestia ? 'radial-gradient(circle at 20% 60%, rgba(191,219,254,0.28), transparent 35%), radial-gradient(circle at 80% 30%, rgba(96,165,250,0.2), transparent 30%)' : isRoyal ? 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.25), transparent 55%), linear-gradient(90deg, transparent, rgba(212,175,55,0.08), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)' }} />
        {isCelestia && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <CelestiaParticles />
            <BannerSparkles color="#93c5fd" count={14} />
            {[...Array(18)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1,
                borderRadius: '50%', background: '#bfdbfe',
                opacity: 0.4 + (i % 4) * 0.12,
                top: `${(10 + (i * 17 + i * 3) % 80)}%`,
                left: `${(5 + (i * 23 + i * 7) % 90)}%`,
                animation: i % 2 === 0 ? 'tomat-float-a 4s ease-in-out infinite' : 'tomat-float-b 5s ease-in-out infinite',
                animationDelay: `${(i * 0.4).toFixed(1)}s`,
              }} />
            ))}
          </div>
        )}
        {isRoyal && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <BannerSparkles color="#d4af37" count={14} />
          </div>
        )}
        {isRoyal && <RoyalShimmer />}
        {spanduk && <div style={{ position: 'absolute', left: 16, bottom: 52, color: isRoyal ? '#f5e7b2cc' : isCelestia ? '#dbeafecc' : '#ffffffaa', fontSize: 8, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}>{isRoyal ? 'Royal Mathematician' : isCelestia ? 'Celestia Relic' : spandukId}</div>}
        {spanduk && <div style={{ position: 'absolute', top: 12, right: 16, color: isRoyal ? '#d4af37' : isCelestia ? '#93c5fd' : '#cbd5e1', fontSize: 13, opacity: 0.75, pointerEvents: 'none' }}>{isRoyal ? '◇' : isCelestia ? '✦' : '✧'}</div>}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, background: 'linear-gradient(to bottom, transparent, #0A0B14)', pointerEvents: 'none' }} />
        {isCelestia && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #60a5fa, #93c5fd, #60a5fa, transparent)', opacity: 0.6, pointerEvents: 'none' }} />}
        {isRoyal && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #d4af37, #f5e7b2, #d4af37, transparent)', opacity: 0.6, pointerEvents: 'none' }} />}
      </div>

      {/* Avatar + Tomi */}
      <div style={{ marginTop: -56, position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        <div style={{ position: 'relative' }}>
          {isLuxuryFrame ? <LuxuryAvatarFrame user={previewUser} size={112} bingkai={bingkai} bingkaiId={bingkaiId} /> : <UserAvatar user={previewUser} size={112} />}
          <button onClick={onPickPhoto} style={{ position: 'absolute', bottom: 0, right: isLuxuryFrame ? -6 : 0, width: 36, height: 36, borderRadius: '50%', background: '#06B6D4', border: '3px solid #0A0B14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 10px rgba(6,182,212,0.5)', zIndex: 3 }}>📷</button>
        </div>
        {pet && (
          <div style={{ position: 'relative', marginBottom: -8 }}>
            <div style={{ position: 'absolute', right: -2, top: -12, fontSize: 13, color: '#FF6B9D', animation: 'tomi-heart-pop 1.8s ease-in-out infinite' }}>♥</div>
            <div style={{ animation: 'tomi-idle 2.4s ease-in-out infinite', transformOrigin: 'center bottom' }}>
              <PetSVG state={pet.isDead ? 'dead' : pet.isStarving ? 'hungry' : 'happy'} skinId={pet.skin} size={80} />
            </div>
          </div>
        )}
      </div>

      {/* Name & kelas */}
      <h2 style={{ marginTop: 14, fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>{user?.name?.toUpperCase()}</h2>
      <div style={{ marginTop: 6, padding: '5px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(103,232,249,0.2)', color: '#67E8F9', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>{user?.kelas || 'Siswa'} · SMP TISA</div>

      {onRemovePhoto && <button onClick={onRemovePhoto} style={{ marginTop: 8, background: 'none', border: 'none', color: '#F87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Hapus Foto</button>}
    </div>
  )
}

function HafalanBadge({ label, lulus }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px', borderRadius: 12, background: lulus ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${lulus ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.05)'}` }}>
      <div style={{ fontSize: 14 }}>{lulus ? '✅' : '🔒'}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: lulus ? '#34D399' : '#374151' }}>{label}</div>
    </div>
  )
}

function HafalanSection() {
  const [hafalan, setHafalan] = useState(null)
  useEffect(() => { apiGet('/api/siswa/hafalan').then(setHafalan).catch(() => {}) }, [])
  if (!hafalan) return null

  const { perkalian = {}, pembagian = {}, totalLulus = 0 } = hafalan
  const pct = Math.round((totalLulus / 20) * 100)

  return (
    <div style={{ background: '#111827', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{ height: 2, background: 'linear-gradient(90deg, #34D399, #67E8F9)' }} />
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 22 }}>🧮</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Hafalan Matematika</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>Diverifikasi langsung oleh Guru</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#FBBF24' }}>{totalLulus}/20</div>
        </div>
        <div style={{ height: 7, borderRadius: 99, background: 'rgba(255,255,255,0.07)', marginBottom: 18, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#FBBF24,#F59E0B)', width: `${pct}%`, transition: 'width 0.5s', boxShadow: '0 0 8px rgba(251,191,36,0.5)' }} />
        </div>
        {/* Perkalian */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, marginBottom: 8 }}>× Perkalian</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <HafalanBadge key={n} label={`×${n}`} lulus={perkalian[String(n)]} />
            ))}
          </div>
        </div>
        {/* Pembagian */}
        <div>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, marginBottom: 8 }}>÷ Pembagian</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <HafalanBadge key={n} label={`÷${n}`} lulus={pembagian[String(n)]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileScreen({ goBack }) {
  const { user, updateProfile, logout } = useAuth()
  const playerCtx = usePlayer()
  const player = playerCtx?.player ?? null
  const isDesktop = useIsDesktop()
  const fileInputRef = useRef(null)
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl ?? user?.photo_url ?? null)
  // Keep preview in sync when user object refreshes (e.g. after saving or re-auth)
  useEffect(() => {
    const fresh = user?.photoUrl ?? user?.photo_url ?? null
    setPhotoPreview(prev => {
      // Only overwrite if no local unsaved change is pending (prev === saved server value)
      const saved = user?.photoUrl ?? user?.photo_url ?? null
      if (prev === saved || prev === null) return fresh
      return prev
    })
  }, [user?.photoUrl, user?.photo_url])
  const [cropSrc, setCropSrc] = useState(null)
  const [bio, setBio] = useState(user?.bio || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handlePickPhoto = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(''); setSuccess('')
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar.'); return }
    try { setCropSrc(await readFileAsDataUrl(file)) }
    catch (err) { setError(err.message || 'Gagal memproses gambar.') }
  }

  const handleSave = async () => {
    setError(''); setSuccess(''); setSaving(true)
    try {
      const savedPhoto = user?.photoUrl ?? user?.photo_url ?? null
      await updateProfile({ photoUrl: photoPreview !== savedPhoto ? photoPreview : undefined, bio })
      setSuccess('Profil berhasil disimpan!')
    } catch (err) {
      setError(err.message || 'Gagal menyimpan profil.')
    } finally { setSaving(false) }
  }

  const [profileTab, setProfileTab] = useState('ekuipmen')

  // ── Stats card (shared) ──
  const StatsCards = () => player ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '16px 20px' }}>
      {[
        { icon: '⭐', label: 'Level', value: player.level, color: '#FBBF24' },
        { icon: '🪙', label: 'Koin', value: player.coins?.toLocaleString?.() ?? player.coins, color: '#FBBF24' },
        { icon: '⚡', label: 'EXP', value: player.exp?.toLocaleString?.() ?? player.exp, color: '#67E8F9' },
      ].map(s => (
        <div key={s.label} style={{ background: '#111827', borderRadius: 18, padding: '14px 8px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 26, lineHeight: 1 }}>{s.icon}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{s.value}</div>
        </div>
      ))}
    </div>
  ) : null

  // ── Desktop left: Stats + Biodata ──
  const DesktopLeftPanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Stats card */}
      {player && (
        <div style={{ background: '#111827', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg, #FBBF24, #67E8F9)' }} />
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: '#FBBF24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Statistik</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '⭐', label: 'Level', value: player.level },
                { icon: '⚡', label: 'Total EXP', value: (player.exp ?? 0).toLocaleString('id-ID') },
                { icon: '🪙', label: 'Total Koin', value: (player.coins ?? 0).toLocaleString('id-ID') },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{s.icon}</div>
                  <div style={{ flex: 1, fontSize: 12, color: '#94A3B8' }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Biodata card */}
      <div style={{ background: '#111827', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }} />
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Biodata</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '👤', label: 'Nama', value: user?.name },
              { icon: '@', label: 'Username', value: user?.username ? `@${user.username}` : '—' },
              { icon: '📧', label: 'Email', value: user?.email || '—' },
              { icon: '📱', label: 'WhatsApp', value: user?.whatsapp || '—' },
              { icon: '🏫', label: 'Kelas', value: user?.kelas || '—' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontSize: 13, width: 20, textAlign: 'center', flexShrink: 0, marginTop: 1 }}>{item.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: '#CBD5E1', fontWeight: 600, marginTop: 2, wordBreak: 'break-word' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ── Desktop right: Ekuipmen tab content ──
  const EquipmentTab = () => {
    const bingkaiId = user?.equippedBingkai ?? user?.equipped_bingkai
    const spandukId = user?.equippedSpanduk ?? user?.equipped_spanduk
    const petSkin   = user?.equippedPetSkin ?? user?.equipped_pet_skin
    const items = [
      { label: 'Bingkai Avatar', icon: '🖼️', value: bingkaiId ? (BINGKAI_VISUALS[bingkaiId]?.name || bingkaiId) : null },
      { label: 'Spanduk Profil', icon: '🎨', value: spandukId || null },
      { label: 'Skin Pet',       icon: '🐾', value: petSkin && petSkin !== 'golden' ? petSkin : null },
    ]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Item kosmetik yang sedang kamu gunakan.</div>
        {items.map(it => (
          <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: it.value ? '#1A1D27' : 'rgba(255,255,255,0.02)', border: `1px solid ${it.value ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.05)'}` }}>
            <div style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{it.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 700 }}>{it.label}</div>
              <div style={{ fontSize: 13, color: it.value ? '#fff' : '#374151', fontWeight: it.value ? 700 : 400, marginTop: 2 }}>
                {it.value || '— Tidak digunakan'}
              </div>
            </div>
            {it.value && <div style={{ fontSize: 11, color: '#EAB308', fontWeight: 800, background: 'rgba(234,179,8,0.12)', padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>DIPAKAI</div>}
          </div>
        ))}
      </div>
    )
  }

  // ── Bio form (shared) ──
  const BioForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#111827', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }} />
        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Edit Bio</div>
          <div style={{ position: 'relative' }}>
            <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))} placeholder="Ceritakan sedikit tentang dirimu..." rows={4} style={{ width: '100%', background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'none' }} />
            <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 10, fontWeight: 700, color: '#475569', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 6 }}>{bio.length}/{MAX_BIO_LENGTH}</div>
          </div>
        </div>
      </div>
      {error && <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 14, padding: '12px 14px', color: '#fca5a5', fontSize: 13, textAlign: 'center' }}>{error}</div>}
      {success && <div style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.4)', borderRadius: 14, padding: '12px 14px', color: '#4ade80', fontSize: 13, textAlign: 'center' }}>{success}</div>}
      <button onClick={handleSave} disabled={saving} style={{ background: saving ? '#065f46' : 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px 0', fontSize: 15, fontWeight: 800, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
        💾 {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </div>
  )

  // ── Mobile bio form wrapper (with padding) ──
  const MobileBioForm = () => (
    <div style={{ padding: '0 20px' }}>
      <div style={{ background: '#111827', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }} />
        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Informasi Akun</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Nama</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>@{user?.username}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Bio</div>
            <div style={{ position: 'relative' }}>
              <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))} placeholder="Ceritakan sedikit tentang dirimu..." rows={4} style={{ width: '100%', background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'none' }} />
              <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 10, fontWeight: 700, color: '#475569', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 6 }}>{bio.length}/{MAX_BIO_LENGTH}</div>
            </div>
          </div>
        </div>
      </div>
      {error && <div style={{ marginBottom: 12, background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 14, padding: '12px 14px', color: '#fca5a5', fontSize: 13, textAlign: 'center' }}>{error}</div>}
      {success && <div style={{ marginBottom: 12, background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.4)', borderRadius: 14, padding: '12px 14px', color: '#4ade80', fontSize: 13, textAlign: 'center' }}>{success}</div>}
      <button onClick={handleSave} disabled={saving} style={{ width: '100%', background: saving ? '#065f46' : 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', border: 'none', borderRadius: 16, padding: '16px 0', fontSize: 15, fontWeight: 800, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
        💾 {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </div>
  )

  return (
    <div className="tomat-profile-screen" style={{ minHeight: '100vh', background: '#071321', position: 'relative', color: '#fff' }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-20%', width: '60%', height: '50%', borderRadius: '50%', background: 'rgba(79,70,229,0.14)', filter: 'blur(110px)' }} />
        <div style={{ position: 'absolute', bottom: '0', right: '-15%', width: '50%', height: '40%', borderRadius: '50%', background: 'rgba(6,182,212,0.07)', filter: 'blur(110px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
          <TopBar
            title="Profil Saya 👤"
            onBack={goBack}
            accentColor="#818CF8"
            rightElement={(
              <button
                onClick={logout}
                title="Keluar"
                style={{
                  border: '1px solid rgba(248,113,113,0.22)', borderRadius: 10,
                  background: 'rgba(248,113,113,0.08)', color: '#FCA5A5',
                  padding: '8px 11px', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 11, fontWeight: 800,
                }}
              >Keluar</button>
            )}
          />
        </div>

        {/* Profile hero — always full width */}
        <ProfileHero user={user} photoPreview={photoPreview} onPickPhoto={handlePickPhoto} onRemovePhoto={photoPreview ? () => setPhotoPreview(null) : null} />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        {cropSrc && <PhotoCropModal imageSrc={cropSrc} onCancel={() => setCropSrc(null)} onConfirm={(compressed) => { setPhotoPreview(compressed); setCropSrc(null) }} />}

        {!isDesktop ? (
          /* ── Mobile layout ── */
          <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
            <StatsCards />
            <div style={{ padding: '0 0 32px' }}>
              <MobileBioForm />
              <div style={{ padding: '16px 20px 0' }}>
                <HafalanSection />
              </div>
            </div>
          </div>
        ) : (
          /* ── Desktop two-column layout ── */
          <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '16px var(--page-pad) 40px' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              {/* Left: stats + biodata */}
              <div style={{ width: 300, flexShrink: 0 }}>
                <DesktopLeftPanel />
              </div>

              {/* Right: tabs — Ekuipmen / Statistik & Edit */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4 }}>
                  {[
                    { id: 'ekuipmen',    label: '🎨 Ekuipmen' },
                    { id: 'statistik',   label: '🧮 Statistik & Hafalan' },
                    { id: 'edit',        label: '✏️ Edit Profil' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setProfileTab(t.id)}
                      style={{
                        flex: 1, border: 'none', borderRadius: 8, padding: '10px 8px',
                        background: profileTab === t.id ? 'rgba(103,232,249,0.15)' : 'transparent',
                        color: profileTab === t.id ? '#67E8F9' : '#64748B',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.15s', whiteSpace: 'nowrap',
                      }}
                    >{t.label}</button>
                  ))}
                </div>

                {profileTab === 'ekuipmen'  && <EquipmentTab />}
                {profileTab === 'statistik' && <HafalanSection />}
                {profileTab === 'edit'      && <BioForm />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
