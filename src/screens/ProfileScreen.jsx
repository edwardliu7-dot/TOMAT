import React, { useRef, useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import { TopBar, Btn, Card, ProfileBanner, UserAvatar } from '../components/shared'
import { useAuth } from '../AuthContext'
import { usePlayer } from '../PlayerContext'
import { readFileAsDataUrl, getCroppedImage, compressDataUrlToLimit } from '../utils/imageUtils'

async function apiGet(path) {
  const res = await fetch(path, { credentials: 'include' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

const MAX_BIO_LENGTH = 300
const MAX_PHOTO_BYTES = 1024 * 1024

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
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ background: '#111827', borderRadius: 20, width: '100%', maxWidth: 400, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Sesuaikan Foto</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Geser dan perbesar untuk memilih bagian foto</div>
        </div>
        <div style={{ position: 'relative', width: '100%', height: 320, background: '#000' }}>
          <Cropper
            image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round"
            showGrid={false} onCropChange={setCrop} onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div style={{ padding: '14px 18px' }}>
          <input type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={e => setZoom(Number(e.target.value))} style={{ width: '100%' }} />
          {error && (
            <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid #dc2626', borderRadius: 10, padding: '8px 12px', color: '#fca5a5', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={onCancel} disabled={processing} style={{
              flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#E2E2E6',
              borderRadius: 12, padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>Batal</button>
            <button onClick={handleConfirm} disabled={processing || !croppedAreaPixels} style={{
              flex: 1, background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', color: '#fff',
              borderRadius: 12, padding: '11px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              opacity: processing ? 0.7 : 1,
            }}>{processing ? 'Memproses...' : 'Oke'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileScreen({ goBack }) {
  const { user, updateProfile } = useAuth()
  const playerCtx = usePlayer()
  const player = playerCtx?.player ?? null
  const fileInputRef = useRef(null)
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl || null)
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
    setError('')
    setSuccess('')
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar.'); return }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setCropSrc(dataUrl)
    } catch (err) {
      setError(err.message || 'Gagal memproses gambar.')
    }
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await updateProfile({
        photoUrl: photoPreview !== user?.photoUrl ? photoPreview : undefined,
        bio,
      })
      setSuccess('Profil berhasil disimpan!')
    } catch (err) {
      setError(err.message || 'Gagal menyimpan profil.')
    } finally {
      setSaving(false)
    }
  }

  const initial = (user?.name || '?')[0]?.toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#0A0B14', position: 'relative' }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-20%', width: '60%', height: '50%', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '0', right: '-15%', width: '50%', height: '40%', borderRadius: '50%', background: 'rgba(52,211,153,0.1)', filter: 'blur(100px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '20px 16px',
          background: 'rgba(10,11,20,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <button onClick={goBack} style={{
            width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)', color: '#67E8F9', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>←</button>
          <h1 style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginLeft: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Profil Saya</h1>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32, paddingBottom: 8 }}>
          <div style={{ width: 'calc(100% - 40px)', maxWidth: 420, marginBottom: 18 }}>
            <ProfileBanner user={user} height={104} />
          </div>
          <div style={{ position: 'relative' }}>
            <UserAvatar user={{ ...user, photoUrl: photoPreview }} size={112} />
            <button onClick={handlePickPhoto} style={{
              position: 'absolute', bottom: 0, right: 0, width: 36, height: 36,
              borderRadius: '50%', background: '#06B6D4', border: '3px solid #0A0B14',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 10px rgba(6,182,212,0.5)',
            }}>📷</button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          {cropSrc && (
            <PhotoCropModal
              imageSrc={cropSrc}
              onCancel={() => setCropSrc(null)}
              onConfirm={(compressed) => { setPhotoPreview(compressed); setCropSrc(null) }}
            />
          )}

          <h2 style={{ marginTop: 14, fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>{user?.name?.toUpperCase()}</h2>
          <div style={{
            marginTop: 6, padding: '5px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(103,232,249,0.2)', color: '#67E8F9',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
          }}>
            {user?.kelas || 'Siswa'} · SMP TISA
          </div>

          {photoPreview && (
            <button onClick={() => setPhotoPreview(null)} style={{
              marginTop: 8, background: 'none', border: 'none', color: '#F87171',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Hapus Foto</button>
          )}
        </div>

        {/* Stats row — siswa only */}
        {player && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '16px 20px' }}>
            {[
              { icon: '⭐', label: 'Level', value: player.level, color: '#FBBF24' },
              { icon: '🪙', label: 'Koin', value: player.coins?.toLocaleString?.() ?? player.coins, color: '#FBBF24' },
              { icon: '⚡', label: 'EXP', value: player.exp?.toLocaleString?.() ?? player.exp, color: '#67E8F9' },
            ].map(s => (
              <div key={s.label} style={{
                background: '#111827', borderRadius: 18, padding: '14px 8px',
                border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <div style={{ fontSize: 26, lineHeight: 1 }}>{s.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#111827', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
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
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    rows={4}
                    style={{
                      width: '100%', background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14,
                      fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'none',
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 10, fontWeight: 700, color: '#475569', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 6 }}>
                    {bio.length}/{MAX_BIO_LENGTH}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 14, padding: '12px 14px', color: '#fca5a5', fontSize: 13, textAlign: 'center' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.4)', borderRadius: 14, padding: '12px 14px', color: '#4ade80', fontSize: 13, textAlign: 'center' }}>
              {success}
            </div>
          )}

          <button onClick={handleSave} disabled={saving} style={{
            background: saving ? '#065f46' : 'linear-gradient(135deg, #10B981, #059669)',
            color: '#fff', border: 'none', borderRadius: 16, padding: '16px 0',
            fontSize: 15, fontWeight: 800, cursor: saving ? 'default' : 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 0 20px rgba(16,185,129,0.3)',
          }}>
            💾 {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>

          <HafalanSection />
        </div>
      </div>
    </div>
  )
}

function HafalanBadge({ label, lulus }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '10px 6px', borderRadius: 12,
      background: lulus ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${lulus ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.05)'}`,
    }}>
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
        {/* Progress bar */}
        <div style={{ height: 7, borderRadius: 99, background: 'rgba(255,255,255,0.07)', marginBottom: 18, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#FBBF24,#F59E0B)', width: `${pct}%`, transition: 'width 0.5s', boxShadow: '0 0 8px rgba(251,191,36,0.5)' }} />
        </div>
        {/* Perkalian */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#34D399', marginBottom: 8 }}>
            ✖ Perkalian — {Object.values(perkalian).filter(s => s === 'lulus').length}/10 lulus
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <HafalanBadge key={n} label={`×${n}`} lulus={perkalian[n] === 'lulus'} />
            ))}
          </div>
        </div>
        {/* Pembagian */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#60A5FA', marginBottom: 8 }}>
            ➗ Pembagian — {Object.values(pembagian).filter(s => s === 'lulus').length}/10 lulus
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <HafalanBadge key={n} label={`÷${n}`} lulus={pembagian[n] === 'lulus'} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
