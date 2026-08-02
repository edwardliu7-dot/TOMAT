/**
 * Eob5PengaturanScreen.jsx — Pengaturan Profil Guru
 * Edit nama, sebutan/bio, foto profil, dan ganti password.
 */
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b',
  dim: 'rgba(245,158,11,0.18)',
  border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7',
  sub: '#92400e',
  card: 'rgba(255,255,255,0.06)',
  green: '#4ade80',
  red: '#f87171',
}

const inp = {
  background: 'rgba(255,255,255,0.07)',
  border: `1px solid rgba(245,158,11,0.3)`,
  borderRadius: 8,
  padding: '10px 12px',
  color: '#fff',
  fontFamily: 'inherit',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function Eob5PengaturanScreen({ navigate, goBack }) {
  const { user, setUser } = useAuth()
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState({ name: '', bio: '', photo_url: '', jabatan: '' })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [newPhotoFile, setNewPhotoFile] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false })

  const [msg, setMsg] = useState({ type: '', text: '' })

  if (user?.role !== 'guru') return (
    <div style={{ padding: 60, textAlign: 'center', color: C.red, fontFamily: 'system-ui' }}>Akses hanya untuk guru.</div>
  )

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 5000) }

  useEffect(() => {
    // Load profile from server
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setProfile({
          name: d.name || '',
          bio: d.bio || '',
          photo_url: d.photo_url || d.photoUrl || '',
          jabatan: d.jabatan || '',
        })
        if (d.photo_url || d.photoUrl) setPhotoPreview(d.photo_url || d.photoUrl)
      })
      .catch(() => {
        // Fallback ke data dari AuthContext
        if (user) {
          setProfile({
            name: user.name || '',
            bio: user.bio || '',
            photo_url: user.photo_url || user.photoUrl || '',
            jabatan: user.jabatan || '',
          })
          if (user.photo_url || user.photoUrl) setPhotoPreview(user.photo_url || user.photoUrl)
        }
      })
  }, [])

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { showMsg('error', 'Ukuran foto maksimal 2 MB'); return }
    const dataUrl = await readAsDataUrl(file)
    setPhotoPreview(dataUrl)
    setNewPhotoFile(file)
    setProfile(p => ({ ...p, photo_url: dataUrl }))
  }

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) { showMsg('error', 'Nama tidak boleh kosong'); return }
    setSavingProfile(true)
    try {
      const r = await fetch('/api/auth/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name.trim(),
          bio: profile.bio.trim(),
          photoUrl: profile.photo_url || null,
          jabatan: profile.jabatan.trim(),
        }),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Gagal') }
      const updated = await r.json()
      // Update AuthContext user
      if (setUser) setUser(prev => ({ ...prev, name: updated.name, bio: updated.bio, photo_url: updated.photo_url, jabatan: updated.jabatan }))
      showMsg('ok', 'Profil berhasil diperbarui!')
      setNewPhotoFile(null)
    } catch (err) { showMsg('error', err.message || 'Gagal menyimpan profil') }
    setSavingProfile(false)
  }

  const handleChangePassword = async () => {
    if (!pwForm.current) { showMsg('error', 'Password saat ini wajib diisi'); return }
    if (pwForm.newPw.length < 6) { showMsg('error', 'Password baru minimal 6 karakter'); return }
    if (pwForm.newPw !== pwForm.confirm) { showMsg('error', 'Konfirmasi password tidak cocok'); return }
    setSavingPw(true)
    try {
      // Coba endpoint khusus password guru, fallback ke /api/auth/change-password
      const r = await fetch('/api/eob5/guru/password', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      })
      if (r.status === 404) {
        // Fallback
        const r2 = await fetch('/api/auth/change-password', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
        })
        if (!r2.ok) { const d = await r2.json(); throw new Error(d.error || 'Gagal') }
      } else if (!r.ok) {
        const d = await r.json(); throw new Error(d.error || 'Gagal')
      }
      showMsg('ok', 'Password berhasil diubah!')
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (err) { showMsg('error', err.message || 'Gagal mengubah password') }
    setSavingPw(false)
  }

  const pf = (k, v) => setProfile(p => ({ ...p, [k]: v }))
  const pw = (k, v) => setPwForm(p => ({ ...p, [k]: v }))

  const initials = (profile.name || user?.name || 'G').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', color: C.text, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.4)', borderBottom: `1px solid ${C.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5 }}>GURU</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Pengaturan Profil</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: 16, overflowY: 'auto', maxWidth: 600, width: '100%', margin: '0 auto' }}>

        {/* Message */}
        {msg.text && (
          <div style={{ background: msg.type === 'ok' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${msg.type === 'ok' ? '#4ade80' : '#ef4444'}`, borderRadius: 10, padding: '10px 14px', color: msg.type === 'ok' ? C.green : C.red, fontSize: 13, marginBottom: 16 }}>
            {msg.text}
          </div>
        )}

        {/* ─── Profil Card ─── */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.primary, marginBottom: 16 }}>👤 Informasi Profil</div>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Foto profil"
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${C.primary}` }}
                />
              ) : (
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: C.dim, border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: C.primary }}>
                  {initials}
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: C.primary, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, border: '2px solid #1a1200' }}>
                📷
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{profile.name || user?.name || '-'}</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{profile.jabatan || 'Guru'}</div>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ marginTop: 6, background: C.dim, border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px', color: C.primary, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Ganti Foto
              </button>
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>NAMA LENGKAP *</div>
              <input value={profile.name} onChange={e => pf('name', e.target.value)} placeholder="Nama lengkap" style={inp} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>JABATAN</div>
              <input value={profile.jabatan} onChange={e => pf('jabatan', e.target.value)} placeholder="Misal: Guru Matematika, Wali Kelas..." style={inp} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>SEBUTAN / BIO</div>
              <textarea
                value={profile.bio}
                onChange={e => pf('bio', e.target.value)}
                placeholder="Deskripsi singkat tentang diri Anda..."
                rows={3}
                style={{ ...inp, resize: 'vertical' }}
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              style={{ background: savingProfile ? C.dim : `linear-gradient(90deg,#f59e0b,#d97706)`, border: 'none', borderRadius: 12, padding: '12px', color: '#1a0a00', fontWeight: 800, fontSize: 14, cursor: savingProfile ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {savingProfile ? '⏳ Menyimpan...' : '💾 Simpan Profil'}
            </button>
          </div>
        </div>

        {/* ─── Password Card ─── */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.primary, marginBottom: 16 }}>🔒 Ganti Password</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { key: 'current', label: 'PASSWORD SAAT INI', placeholder: 'Masukkan password saat ini' },
              { key: 'newPw', label: 'PASSWORD BARU', placeholder: 'Minimal 6 karakter' },
              { key: 'confirm', label: 'KONFIRMASI PASSWORD BARU', placeholder: 'Ulangi password baru' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw[key] ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={e => pw(key, e.target.value)}
                    placeholder={placeholder}
                    style={{ ...inp, paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.sub, fontSize: 16, cursor: 'pointer', padding: 0 }}
                  >
                    {showPw[key] ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
            ))}

            {/* Password strength hint */}
            {pwForm.newPw && (
              <div style={{ fontSize: 11, color: pwForm.newPw.length >= 8 ? C.green : pwForm.newPw.length >= 6 ? C.primary : C.red }}>
                {pwForm.newPw.length >= 8 ? '✅ Password kuat' : pwForm.newPw.length >= 6 ? '⚠️ Cukup (disarankan 8+ karakter)' : '❌ Terlalu pendek'}
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={savingPw || !pwForm.current || !pwForm.newPw || !pwForm.confirm}
              style={{ background: savingPw || !pwForm.current || !pwForm.newPw || !pwForm.confirm ? C.dim : 'rgba(239,68,68,0.2)', border: `1px solid ${savingPw ? C.dim : 'rgba(239,68,68,0.5)'}`, borderRadius: 12, padding: '12px', color: savingPw || !pwForm.current ? '#64748b' : C.red, fontWeight: 800, fontSize: 14, cursor: savingPw || !pwForm.current || !pwForm.newPw || !pwForm.confirm ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
            >
              {savingPw ? '⏳ Mengubah...' : '🔒 Ubah Password'}
            </button>
          </div>
        </div>

        {/* ─── Info Akun ─── */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.primary, marginBottom: 12 }}>ℹ️ Informasi Akun</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Username', value: user?.username || '-' },
              { label: 'Role', value: 'Guru' },
              { label: 'Email', value: user?.email || '-' },
              { label: 'WhatsApp', value: user?.whatsapp || '-' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
                <span style={{ fontSize: 12, color: C.sub, fontWeight: 700, width: 90, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 13, color: value === '-' ? '#475569' : '#e2e8f0' }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: C.sub, lineHeight: 1.5 }}>
            Untuk mengubah email, WhatsApp, atau username, hubungi administrator sekolah.
          </div>
        </div>

      </div>
    </div>
  )
}
