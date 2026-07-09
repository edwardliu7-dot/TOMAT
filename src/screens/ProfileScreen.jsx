import React, { useRef, useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { TopBar, Btn, Card } from '../components/shared'
import { useAuth } from '../AuthContext'
import { readFileAsDataUrl, getCroppedImage, compressDataUrlToLimit } from '../utils/imageUtils'

const MAX_BIO_LENGTH = 300
const MAX_PHOTO_BYTES = 1024 * 1024 // 1 MB

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
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ background: '#161A22', borderRadius: 16, width: '100%', maxWidth: 400, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Sesuaikan Foto</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Geser dan perbesar untuk memilih bagian foto</div>
        </div>

        <div style={{ position: 'relative', width: '100%', height: 320, background: '#000' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div style={{ padding: '14px 18px' }}>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ width: '100%' }}
          />

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid #dc2626', borderRadius: 10, padding: '8px 12px', color: '#f87171', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={onCancel} disabled={processing} style={{
              flex: 1, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#E2E2E6',
              borderRadius: 12, padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>Batal</button>
            <button onClick={handleConfirm} disabled={processing || !croppedAreaPixels} style={{
              flex: 1, background: '#22C55E', border: 'none', color: '#06210F',
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
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.')
      return
    }
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
    <div style={{ minHeight: '100vh', background: '#0F1115' }}>
      <TopBar title="Profil Saya" onBack={goBack} />

      <div style={{ padding: '0 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%', flexShrink: 0,
            background: photoPreview ? `url(${photoPreview}) center/cover no-repeat` : 'linear-gradient(135deg, #6366F1, #A855F7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 800, color: '#fff', border: '3px solid rgba(255,255,255,0.15)',
          }}>
            {!photoPreview && initial}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          {cropSrc && (
            <PhotoCropModal
              imageSrc={cropSrc}
              onCancel={() => setCropSrc(null)}
              onConfirm={(compressed) => {
                setPhotoPreview(compressed)
                setCropSrc(null)
              }}
            />
          )}
          <button onClick={handlePickPhoto} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#E2E2E6',
            borderRadius: 20, padding: '8px 18px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>📷 Ganti Foto</button>
          {photoPreview && (
            <button onClick={() => setPhotoPreview(null)} style={{
              background: 'none', border: 'none', color: '#F87171',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Hapus Foto</button>
          )}
        </div>

        <Card>
          <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Nama</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>@{user?.username}</div>
        </Card>

        <Card>
          <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 700, marginBottom: 8 }}>Bio</div>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
            placeholder="Ceritakan sedikit tentang dirimu..."
            rows={4}
            style={{
              width: '100%', background: '#0F1115', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '11px 12px', color: '#fff', fontSize: 14,
              fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'none',
            }}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: '#6B7280', marginTop: 4 }}>
            {bio.length}/{MAX_BIO_LENGTH}
          </div>
        </Card>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid #dc2626', borderRadius: 12, padding: '12px 14px', color: '#f87171', fontSize: 13, textAlign: 'center' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid #16a34a', borderRadius: 12, padding: '12px 14px', color: '#4ade80', fontSize: 13, textAlign: 'center' }}>
            {success}
          </div>
        )}

        <Btn onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Profil'}</Btn>
      </div>
    </div>
  )
}
