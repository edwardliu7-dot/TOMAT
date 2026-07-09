import React, { useRef, useState } from 'react'
import { TopBar, Btn, Card } from '../components/shared'
import { useAuth } from '../AuthContext'

const MAX_BIO_LENGTH = 300

function compressImage(file, maxSize = 320, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('File bukan gambar yang valid.'))
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxSize) {
          height = Math.round(height * (maxSize / width))
          width = maxSize
        } else if (height > maxSize) {
          width = Math.round(width * (maxSize / height))
          height = maxSize
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export default function ProfileScreen({ goBack }) {
  const { user, updateProfile } = useAuth()
  const fileInputRef = useRef(null)
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl || null)
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
      const dataUrl = await compressImage(file)
      setPhotoPreview(dataUrl)
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
