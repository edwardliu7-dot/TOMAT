import React, { useState } from 'react'
import { useAuth } from '../AuthContext'
import logo from '../assets/logo.png'

export default function LoginScreen() {
  const { login } = useAuth()
  const [role, setRole] = useState('siswa')
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const selectRole = (r) => {
    setRole(r)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ role, username: form.username, password: form.password })
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0F1115', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 400, background: '#151821', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a3e, #2d1b69)',
          padding: '32px 24px', textAlign: 'center',
          borderBottom: '1px solid rgba(99,102,241,0.3)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 14px',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={logo} alt="TOMAT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', fontStyle: 'italic', letterSpacing: -0.5 }}>TOMAT</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Tantangan Otak MATematika · SMP TISA Islamic School</div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Role tabs */}
          <div style={{ display: 'flex', background: '#0F1115', borderRadius: 12, padding: 4, marginBottom: 18 }}>
            {[{ id: 'siswa', label: 'Siswa' }, { id: 'guru', label: 'Guru' }].map(r => (
              <button key={r.id} onClick={() => selectRole(r.id)} style={{
                flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                background: role === r.id ? '#1E2128' : 'transparent',
                color: role === r.id ? '#34D399' : '#94A3B8',
              }}>{r.label}</button>
            ))}
          </div>

          {/* Pendaftaran akun (siswa maupun guru) hanya dilakukan lewat aplikasi BLP,
              agar tidak terjadi akun ganda antara kedua aplikasi. */}
          <div style={{ marginBottom: 20, fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
            {role === 'guru'
              ? 'Akun guru dibuat oleh admin sekolah melalui aplikasi BLP. Masuk menggunakan akun yang sudah terdaftar.'
              : 'Akun siswa didaftarkan melalui aplikasi BLP. Masuk menggunakan akun yang sudah terdaftar.'}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Username">
              <input required value={form.username} onChange={update('username')} placeholder="username" autoCapitalize="none"
                style={inputStyle} />
            </Field>

            <Field label="Password">
              <input required type="password" value={form.password} onChange={update('password')} placeholder="••••••••"
                style={inputStyle} />
            </Field>

            {error && (
              <div style={{ color: '#f87171', fontSize: 13, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '10px 12px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: 6, background: loading ? '#166534' : 'linear-gradient(135deg,#22C55E,#16A34A)',
              color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0',
              fontSize: 15, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {loading ? 'Memproses…' : 'Masuk →'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', background: '#0F1115', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}
