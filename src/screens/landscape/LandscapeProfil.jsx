/**
 * LandscapeProfil — profile view with inline photo upload + bio editing.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { useAuth } from '../../AuthContext'
import { usePlayer } from '../../PlayerContext'
import { usePet } from '../../PetContext'
import PetSVG, { getPetName } from '../../components/PetSVG'
import { UserAvatar } from '../../components/shared'
import { SPANDUK_VISUALS } from '../../shopVisuals'
import { readFileAsDataUrl, getCroppedImage, compressDataUrlToLimit } from '../../utils/imageUtils'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', red:'#f0997b', purple:'#cecbf6', orange:'#e2653f' }

const MAX_BIO_LENGTH   = 300
const MAX_PHOTO_BYTES  = 760 * 1024

async function apiCall(path) {
  const r = await fetch(path, { credentials:'include' })
  return r.json().catch(()=>({}))
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
}

const ANGKA_LIST = [1,2,3,4,5,6,7,8,9,10,11,12]

/* ── Photo crop modal ─────────────────────────────────────────────────────── */
function PhotoCropModal({ imageSrc, onCancel, onConfirm }) {
  const [crop, setCrop]                     = useState({ x:0, y:0 })
  const [zoom, setZoom]                     = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [processing, setProcessing]         = useState(false)
  const [error, setError]                   = useState('')

  const onCropComplete = useCallback((_area, pixels) => setCroppedAreaPixels(pixels), [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setProcessing(true); setError('')
    try {
      const cropped    = await getCroppedImage(imageSrc, croppedAreaPixels)
      const compressed = await compressDataUrlToLimit(cropped, MAX_PHOTO_BYTES)
      onConfirm(compressed)
    } catch (err) {
      setError(err.message || 'Gagal memproses gambar.')
      setProcessing(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:'#111827', borderRadius:20, width:'100%', maxWidth:420, overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize:15, fontWeight:800, color:'#fff' }}>Sesuaikan Foto</div>
          <div style={{ fontSize:12, color:'#94A3B8', marginTop:2 }}>Geser dan perbesar untuk memilih bagian</div>
        </div>
        <div style={{ position:'relative', width:'100%', height:300, background:'#000' }}>
          <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
            onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
        </div>
        <div style={{ padding:'14px 18px' }}>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width:'100%', accentColor:'#10B981' }} />
          {error && <div style={{ background:'rgba(220,38,38,0.15)', border:'1px solid #dc2626', borderRadius:8, padding:'7px 12px', color:'#fca5a5', fontSize:12, marginTop:8 }}>{error}</div>}
          <div style={{ display:'flex', gap:10, marginTop:14 }}>
            <button onClick={onCancel} disabled={processing} style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'none', color:'#ccc', borderRadius:12, padding:'11px 0', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Batal</button>
            <button onClick={handleConfirm} disabled={processing || !croppedAreaPixels}
              style={{ flex:1, background:'linear-gradient(135deg,#10B981,#059669)', border:'none', color:'#fff', borderRadius:12, padding:'11px 0', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', opacity: processing ? 0.7 : 1 }}>
              {processing ? 'Memproses…' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Hafalan section ──────────────────────────────────────────────────────── */
function HafalanSection({ hafalan }) {
  if (!hafalan) return null
  const { perkalian = {}, pembagian = {} } = hafalan
  const pCount = ANGKA_LIST.filter(n => perkalian[n] === 'lulus').length
  const bCount = ANGKA_LIST.filter(n => pembagian[n] === 'lulus').length

  const chipColor = status => {
    if (status === 'lulus')  return { bg:'rgba(93,202,165,0.2)',   border:'#5dcaa5', text:'#9fe1cb' }
    if (status === 'diulang') return { bg:'rgba(250,199,117,0.15)', border:'#fac775', text:'#fde68a' }
    return { bg:'rgba(255,255,255,0.04)', border:'#313a5c', text:'#5a6180' }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>🧮 HAFALAN</div>

      {[['× Perkalian', perkalian, pCount, C.green, 'linear-gradient(90deg,#5dcaa5,#22d3a5)'],
        ['÷ Pembagian', pembagian, bCount, C.purple, 'linear-gradient(90deg,#a78bfa,#c4b5fd)']].map(([label, map, count, color, bar]) => (
        <div key={label} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:10, padding:'9px 10px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ color:C.txt, fontSize:9.5, fontWeight:700 }}>{label}</span>
            <span style={{ color, fontSize:8.5 }}>{count}/12 lulus</span>
          </div>
          <div style={{ height:3, background:'#2a3158', borderRadius:3, marginBottom:6 }}>
            <div style={{ height:3, width:`${(count/12)*100}%`, background:bar, borderRadius:3, transition:'width 0.5s' }} />
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
            {ANGKA_LIST.map(n => {
              const col = chipColor(map[n])
              return (
                <div key={n} style={{ width:26, height:22, borderRadius:5, background:col.bg, border:`0.5px solid ${col.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:col.text, fontWeight:600 }}>
                  {n}{label.startsWith('×') ? '×' : '÷'}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function LandscapeProfil({ goBack, navigate }) {
  const { user, updateProfile, logout } = useAuth()
  const playerCtx = usePlayer()
  const player    = playerCtx?.player ?? null
  const { pet }   = usePet() || {}

  const coins    = player?.coins ?? 0
  const level    = player?.level ?? user?.level ?? 1
  const xp       = player?.xp   ?? user?.xp   ?? 0
  const xpNeeded = level * 1000

  const [rank,    setRank]    = useState('—')
  const [badges,  setBadges]  = useState([])
  const [hafalan, setHafalan] = useState(null)

  useEffect(() => {
    apiCall('/api/siswa/papan-peringkat').then(data => {
      const lb = data.leaderboard || []
      const me = lb.find(e => String(e.id) === String(user?.id))
      if (me) setRank(`#${me.rank}`)
    }).catch(()=>{})
    apiCall('/api/siswa/lencana').then(data => setBadges((data.badges || []).slice(0, 6))).catch(()=>{})
    apiCall('/api/siswa/hafalan').then(data => setHafalan(data)).catch(()=>{})
  }, [user?.id])

  /* ── Edit panel state ─── */
  const [editing,      setEditing]      = useState(false)
  const [bio,          setBio]          = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [cropSrc,      setCropSrc]      = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [saveError,    setSaveError]    = useState('')
  const fileRef = useRef(null)

  // Sync preview + bio from server data whenever user changes
  useEffect(() => {
    setPhotoPreview(user?.photoUrl ?? user?.photo_url ?? null)
    setBio(user?.bio || '')
  }, [user?.photoUrl, user?.photo_url, user?.bio])

  const openEdit = () => {
    setBio(user?.bio || '')
    setPhotoPreview(user?.photoUrl ?? user?.photo_url ?? null)
    setSaveError('')
    setEditing(true)
  }
  const closeEdit = () => { setEditing(false); setSaveError('') }

  const handlePickPhoto = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setCropSrc(dataUrl)
    } catch { /* ignore */ }
    e.target.value = ''
  }

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    try {
      const savedPhoto = user?.photoUrl ?? user?.photo_url ?? null
      await updateProfile({
        bio,
        photoUrl: photoPreview !== savedPhoto ? photoPreview : undefined,
      })
      setEditing(false)
    } catch (err) {
      setSaveError(err.message || 'Gagal menyimpan.')
    } finally {
      setSaving(false)
    }
  }

  const name        = user?.name || user?.username || 'Siswa'
  const kelas       = user?.kelas || '—'
  const equippedSkin = pet?.skin || 'golden'
  const petStatus   = pet?.isDead ? 'dead' : pet?.isStarving ? 'hungry' : 'happy'
  const spandukId   = user?.equippedSpanduk ?? user?.equipped_spanduk ?? null
  const spanduk     = spandukId ? SPANDUK_VISUALS[spandukId] : null
  const displayBio  = user?.bio || ''

  return (
    <div style={{ width:'100vw', height:'100vh', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative', background:C.bg }}>

      {/* Spanduk background */}
      {spanduk && (
        <>
          <div style={{ position:'absolute', inset:0, zIndex:0, background: spanduk.image ? `url(${spanduk.image}) center/cover no-repeat, ${spanduk.gradient}` : spanduk.gradient, opacity:0.45 }} />
          <div style={{ position:'absolute', inset:0, zIndex:0, background:'linear-gradient(180deg, rgba(18,23,43,0.55) 0%, rgba(18,23,43,0.82) 55%, rgba(18,23,43,0.96) 100%)' }} />
        </>
      )}
      {!spanduk && <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 40% 70% at 18% 50%, rgba(226,101,63,0.08) 0%, transparent 60%)', zIndex:0 }} />}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:`0.5px solid rgba(49,58,92,0.6)`, flexShrink:0, position:'relative', zIndex:2, background:'rgba(18,23,43,0.55)', backdropFilter:'blur(10px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>👤 Profil</span>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          <div onClick={() => navigate?.('toko')} style={{ background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:7, padding:'5px 11px', color:C.sub, fontSize:10, cursor:'pointer' }}>🛒 Toko Spanduk</div>
          <div onClick={openEdit} style={{ background:'rgba(99,102,241,0.25)', border:'0.5px solid rgba(99,102,241,0.5)', borderRadius:7, padding:'5px 11px', color:'#c4b5fd', fontSize:10, fontWeight:700, cursor:'pointer' }}>✏️ Edit Profil</div>
          <div onClick={logout} style={{ background:'rgba(113,43,19,0.7)', borderRadius:7, padding:'5px 11px', color:'#faece7', fontSize:10, fontWeight:600, cursor:'pointer' }}>Logout</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', minHeight:0, position:'relative', zIndex:2 }}>

        {/* KIRI: Identitas */}
        <div style={{ width:'26%', borderRight:`0.5px solid rgba(49,58,92,0.5)`, display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 12px', gap:10, overflowY:'auto' }}>
          <UserAvatar user={user} size={68} />
          <div style={{ textAlign:'center', width:'100%' }}>
            <div style={{ color:C.txt, fontSize:14, fontWeight:800 }}>{name}</div>
            <div style={{ color:C.sub, fontSize:9.5, marginTop:2 }}>{kelas}</div>

            {/* Bio display */}
            {displayBio ? (
              <div style={{ marginTop:8, background:'rgba(28,35,64,0.6)', border:`0.5px solid ${C.border}`, borderRadius:8, padding:'7px 9px', textAlign:'left' }}>
                <div style={{ color:C.muted, fontSize:7.5, fontWeight:700, letterSpacing:0.6, marginBottom:3 }}>TENTANG</div>
                <div style={{ color:'#b0b5c8', fontSize:9, lineHeight:1.55 }}>{displayBio}</div>
              </div>
            ) : (
              <div onClick={openEdit} style={{ marginTop:8, border:`0.5px dashed ${C.border}`, borderRadius:8, padding:'7px 9px', color:C.muted, fontSize:9, cursor:'pointer', textAlign:'center' }}>
                + Tambahkan bio
              </div>
            )}
          </div>

          {/* Level bar */}
          <div style={{ width:'100%', background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'8px 10px', backdropFilter:'blur(6px)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <div style={{ background:'#3c3489', borderRadius:4, padding:'1px 6px', color:C.purple, fontSize:9, fontWeight:700 }}>Lv {level}</div>
              <span style={{ color:C.muted, fontSize:8.5 }}>{xp}/{xpNeeded} EXP</span>
            </div>
            <div style={{ height:4, background:'#2a3158', borderRadius:3 }}>
              <div style={{ height:4, width:`${Math.min((xp/xpNeeded)*100,100)}%`, background:`linear-gradient(90deg,${C.orange},${C.gold})`, borderRadius:3 }} />
            </div>
          </div>

          {/* Pet */}
          {pet && (
            <div style={{ display:'flex', alignItems:'center', gap:9, background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'7px 10px', width:'100%', backdropFilter:'blur(6px)' }}>
              <PetSVG skinId={equippedSkin} state={petStatus} size={40} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:C.txt, fontSize:10.5, fontWeight:600 }}>{getPetName(equippedSkin)}</div>
                <div style={{ color:C.muted, fontSize:8 }}>Pet Aktif</div>
              </div>
              <div style={{ background: pet.isDead?'rgba(58,28,28,0.8)':pet.isStarving?'rgba(58,44,10,0.8)':'rgba(8,80,65,0.8)', borderRadius:5, padding:'2px 7px', color: pet.isDead?'#f0997b':pet.isStarving?C.gold:'#9fe1cb', fontSize:8.5, flexShrink:0 }}>
                {pet.isDead?'Mati':pet.isStarving?'Lapar':'Sehat'}
              </div>
            </div>
          )}

          {/* Spanduk label */}
          {spanduk && (
            <div style={{ width:'100%', background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:9, padding:'6px 10px', backdropFilter:'blur(6px)', textAlign:'center' }}>
              <div style={{ color:C.muted, fontSize:7.5, marginBottom:2 }}>SPANDUK AKTIF</div>
              <div style={{ color:C.txt, fontSize:9, fontWeight:600 }}>{spandukId?.replace(/_/g,' ')?.replace(/\b\w/g, c=>c.toUpperCase())}</div>
            </div>
          )}
        </div>

        {/* TENGAH: Stats + Hafalan */}
        <div style={{ width:'30%', borderRight:`0.5px solid rgba(49,58,92,0.5)`, display:'flex', flexDirection:'column', padding:'12px 12px', gap:8, overflowY:'auto' }}>
          <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>STATISTIK</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
            {[
              { icon:'🪙', val: coins.toLocaleString('id-ID'), label:'Koin Total',       color:C.gold   },
              { icon:'👑', val: rank,                           label:'Rank Kelas',       color:C.red    },
              { icon:'⚡', val: xp.toLocaleString('id-ID'),     label:'Total EXP',        color:C.purple },
              { icon:'🎖️', val: badges.filter(b=>b.isUnlocked).length, label:'Lencana Diraih', color:C.green },
            ].map((s,i) => (
              <div key={i} style={{ background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, borderRadius:10, padding:'10px 9px', display:'flex', flexDirection:'column', gap:5, justifyContent:'center', alignItems:'center', backdropFilter:'blur(6px)' }}>
                <span style={{ fontSize:17 }}>{s.icon}</span>
                <div style={{ color:s.color, fontSize:13, fontWeight:800 }}>{s.val}</div>
                <div style={{ color:C.muted, fontSize:7.5, textAlign:'center' }}>{s.label}</div>
              </div>
            ))}
          </div>
          {hafalan !== null && <HafalanSection hafalan={hafalan} />}
        </div>

        {/* KANAN: Lencana */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'12px 16px', gap:8, overflowY:'auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>LENCANA TERBARU</div>
            <div onClick={() => navigate?.('lencana')} style={{ color:C.muted, fontSize:9, cursor:'pointer' }}>Lihat semua →</div>
          </div>
          {badges.length === 0 && <div style={{ color:C.muted, fontSize:10, textAlign:'center', marginTop:20 }}>Belum ada lencana diraih</div>}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7 }}>
            {badges.map((b,i) => (
              <div key={b.id||i} style={{ background: b.isUnlocked?'rgba(26,42,64,0.8)':'rgba(28,35,64,0.6)', border: b.isUnlocked?`0.5px solid #3a4a7a`:`0.5px dashed ${C.border}`, borderRadius:10, padding:'9px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:4, opacity: b.isUnlocked?1:0.45, backdropFilter:'blur(4px)' }}>
                <span style={{ fontSize:22, filter: b.isUnlocked?'none':'grayscale(1)' }}>{b.icon||'🏅'}</span>
                <div style={{ color: b.isUnlocked?C.txt:C.muted, fontSize:8.5, textAlign:'center', fontWeight: b.isUnlocked?600:400, lineHeight:1.3 }}>{b.nama||b.name||'Lencana'}</div>
                {b.isUnlocked && <div style={{ color:C.muted, fontSize:7.5 }}>{formatDate(b.earnedAt)}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          EDIT PANEL — slides up from bottom as a fixed overlay sheet
      ══════════════════════════════════════════════════════════════════════ */}
      {editing && (
        <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center' }}
          onClick={e => { if (e.target === e.currentTarget) closeEdit() }}>

          {/* Backdrop */}
          <div style={{ position:'absolute', inset:0, background:'rgba(8,12,30,0.72)', backdropFilter:'blur(4px)' }} onClick={closeEdit} />

          {/* Sheet */}
          <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:680, background:C.card, borderRadius:'18px 18px 0 0', border:`0.5px solid ${C.border}`, padding:'20px 24px 28px', display:'flex', flexDirection:'column', gap:18, maxHeight:'88vh', overflowY:'auto' }}>

            {/* Sheet handle */}
            <div style={{ width:36, height:4, borderRadius:2, background:C.border, margin:'0 auto -10px' }} />

            <div style={{ color:C.txt, fontSize:15, fontWeight:800 }}>✏️ Edit Profil</div>

            {/* ── Photo ── */}
            <div>
              <div style={{ color:C.sub, fontSize:9, fontWeight:700, letterSpacing:0.8, marginBottom:10 }}>FOTO PROFIL</div>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                {/* Avatar preview — click to pick */}
                <div style={{ position:'relative', cursor:'pointer', flexShrink:0 }} onClick={() => fileRef.current?.click()}>
                  {photoPreview
                    ? <img src={photoPreview} alt="preview" style={{ width:72, height:72, borderRadius:'50%', objectFit:'cover', border:`2px solid ${C.border}` }} />
                    : <div style={{ width:72, height:72, borderRadius:'50%', background:'#2a3158', border:`2px dashed ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>👤</div>
                  }
                  <div style={{ position:'absolute', bottom:0, right:0, width:22, height:22, borderRadius:'50%', background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, border:`2px solid ${C.card}` }}>📷</div>
                </div>
                <div>
                  <div style={{ color:C.txt, fontSize:12, fontWeight:600, marginBottom:4 }}>Ganti foto profil</div>
                  <div style={{ color:C.muted, fontSize:10.5, lineHeight:1.5 }}>Klik avatar untuk pilih gambar dari perangkat.<br/>Format: JPG / PNG · Maks. 1 MB</div>
                  {photoPreview && (
                    <button onClick={() => setPhotoPreview(null)}
                      style={{ marginTop:6, background:'rgba(240,153,123,0.15)', border:'0.5px solid rgba(240,153,123,0.4)', borderRadius:6, padding:'3px 10px', color:'#f0997b', fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>
                      Hapus foto
                    </button>
                  )}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePickPhoto} />
            </div>

            {/* ── Bio ── */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ color:C.sub, fontSize:9, fontWeight:700, letterSpacing:0.8 }}>BIO</div>
                <div style={{ color:C.muted, fontSize:9 }}>{bio.length}/{MAX_BIO_LENGTH}</div>
              </div>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
                placeholder="Ceritakan sedikit tentang dirimu…"
                rows={4}
                style={{ width:'100%', background:'rgba(18,23,43,0.8)', border:`1px solid ${C.border}`, borderRadius:12, padding:'11px 13px', color:C.txt, fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', resize:'none', lineHeight:1.55 }}
              />
            </div>

            {/* Error */}
            {saveError && (
              <div style={{ background:'rgba(220,38,38,0.12)', border:'0.5px solid #dc2626', borderRadius:8, padding:'8px 12px', color:'#fca5a5', fontSize:11 }}>{saveError}</div>
            )}

            {/* Actions */}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={closeEdit} disabled={saving}
                style={{ flex:1, background:'rgba(255,255,255,0.05)', border:`0.5px solid ${C.border}`, borderRadius:12, padding:'12px 0', color:C.sub, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Batal
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex:2, background:'linear-gradient(135deg,#6366f1,#4f46e5)', border:'none', borderRadius:12, padding:'12px 0', color:'#fff', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo crop modal */}
      {cropSrc && (
        <PhotoCropModal
          imageSrc={cropSrc}
          onCancel={() => setCropSrc(null)}
          onConfirm={compressed => { setPhotoPreview(compressed); setCropSrc(null) }}
        />
      )}
    </div>
  )
}
