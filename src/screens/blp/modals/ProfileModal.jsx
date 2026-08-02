import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Camera, User as UserIcon, Loader2, Save } from 'lucide-react'
import PhotoCropModal from '../../../blp/components/modals/PhotoCropModal'

const MAX_BIO_LENGTH = 300

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
}

export default function ProfileModal({ name, currentPhotoUrl, currentBio, onClose, onSave }) {
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl ?? null)
  const [bio, setBio] = useState(currentBio ?? '')
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [rawImageSrc, setRawImageSrc] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG/PNG).')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setError(null)
    setIsProcessingImage(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setRawImageSrc(dataUrl)
    } catch (err) {
      console.error(err)
      setError('Gagal membaca foto. Coba foto lain.')
    } finally {
      setIsProcessingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await onSave(photoUrl, bio.trim())
      onClose()
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan profil. Silakan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 50,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: '24px 24px 0 0',
            width: '100%',
            maxWidth: 448,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: 0 }}>Edit Profil</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{name}</p>
              </div>
              <button
                onClick={onClose}
                style={{ padding: 6, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Photo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
                  background: '#f1f5f9', border: '2px solid #a7f3d0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Foto profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserIcon size={40} style={{ color: '#94a3b8' }} />
                  )}
                  {isProcessingImage && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Loader2 size={24} style={{ color: '#fff', animation: 'spin 1s linear infinite' }} />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: -4, right: -4,
                    background: '#059669', color: '#fff', padding: 8,
                    borderRadius: '50%', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  title="Ganti foto"
                >
                  <Camera size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              {photoUrl && (
                <button
                  onClick={() => setPhotoUrl(null)}
                  style={{ fontSize: 12, color: '#ef4444', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Hapus foto
                </button>
              )}
            </div>

            {/* Bio */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bio
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
                placeholder="Ceritakan sedikit tentang dirimu..."
                rows={4}
                style={{
                  width: '100%', padding: 16, border: '1px solid #e2e8f0',
                  borderRadius: 16, fontSize: 14, lineHeight: 1.6,
                  background: '#f8fafc', color: '#0f172a', resize: 'none',
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{bio.length}/{MAX_BIO_LENGTH}</span>
              </div>
            </div>

            {error && <p style={{ fontSize: 12, color: '#ef4444', fontWeight: 500, margin: 0 }}>{error}</p>}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={isSaving || isProcessingImage}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: isSaving || isProcessingImage ? '#e2e8f0' : '#059669',
                color: isSaving || isProcessingImage ? '#94a3b8' : '#fff',
                padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 14,
                border: 'none', cursor: isSaving || isProcessingImage ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
              }}
            >
              {isSaving
                ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                : <Save size={16} />}
              Simpan Profil
            </button>
          </div>
        </motion.div>
      </motion.div>

      {rawImageSrc && (
        <PhotoCropModal
          imageSrc={rawImageSrc}
          onCancel={() => setRawImageSrc(null)}
          onConfirm={croppedDataUrl => {
            setPhotoUrl(croppedDataUrl)
            setRawImageSrc(null)
          }}
        />
      )}
    </AnimatePresence>
  )
}
