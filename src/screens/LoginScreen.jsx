import React, { useState } from 'react'
import { useAuth } from '../AuthContext'
import logo from '../assets/logo.png'

export default function LoginScreen() {
  const { login } = useAuth()
  const [chosen, setChosen] = useState(null) // 'siswa' | 'guru' | null
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const decide = (r) => { setChosen(r); setError('') }
  const goBack  = () => { setChosen(null); setError(''); setForm({ username: '', password: '' }) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ role: chosen, username: form.username, password: form.password })
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan.')
    } finally {
      setLoading(false)
    }
  }

  const isSiswa = chosen === 'siswa'
  const isGuru  = chosen === 'guru'

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#0F1115', display: 'flex',
      fontFamily: 'inherit', color: '#fff',
    }}>
      {/* ── Left branding panel (hidden on mobile) ── */}
      <div style={{
        width: '40%', flexShrink: 0,
        background: 'linear-gradient(160deg, #0F1115 0%, #1a1040 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px',
        position: 'relative', overflow: 'hidden',
      }} className="login-brand-panel">
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '50%', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '40%', borderRadius: '50%', background: 'rgba(167,139,250,0.1)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 320 }}>
          {/* Logo */}
          <img src={logo} alt="TOMAT" style={{ width: 80, height: 80, borderRadius: 20, objectFit: 'cover', marginBottom: 20, boxShadow: '0 0 40px rgba(99,102,241,0.4)' }} />

          {/* App name */}
          <div style={{
            fontSize: 36, fontWeight: 900, fontStyle: 'italic',
            background: 'linear-gradient(135deg, #818CF8, #A78BFA)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: -1, marginBottom: 8,
          }}>TOMAT</div>
          <div style={{ fontSize: 14, color: '#94A3B8', marginBottom: 48 }}>
            Tantangan Otak Matematika
          </div>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            {[
              { emoji: '✦', text: 'Gamifikasi Matematika SMP' },
              { emoji: '✦', text: 'Duel & Turnamen Real-time' },
              { emoji: '✦', text: 'Sistem Reward & Leaderboard' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#6366F1', fontSize: 16, fontWeight: 900 }}>{f.emoji}</span>
                <span style={{ fontSize: 14, color: '#CBD5E1', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom credit */}
          <div style={{ marginTop: 'auto', paddingTop: 64, fontSize: 12, color: '#475569' }}>
            SMP TISA Islamic School · v2.0
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1, background: '#111318',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile-only logo */}
          <div className="login-mobile-logo" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
            <img src={logo} alt="TOMAT" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', marginBottom: 10 }} />
            <div style={{ fontSize: 22, fontWeight: 900, fontStyle: 'italic', color: '#fff' }}>TOMAT</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Tantangan Otak Matematika</div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Masuk ke Akun</div>
            <div style={{ fontSize: 14, color: '#94A3B8' }}>Pilih peranmu dan masuk</div>
          </div>

          {/* Role selector */}
          {!chosen && (
            <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
              {[
                { role: 'siswa', emoji: '⚔️', label: 'Siswa', sub: 'Pejuang Angka', accent: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)' },
                { role: 'guru',  emoji: '🔮', label: 'Guru',  sub: 'Arsitek Ilmu',  accent: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.3)' },
              ].map(r => (
                <button
                  key={r.role}
                  onClick={() => decide(r.role)}
                  style={{
                    flex: 1, padding: '20px 16px', borderRadius: 16,
                    background: r.bg, border: `1px solid ${r.border}`,
                    cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${r.bg}` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{r.emoji}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: r.accent, marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{r.sub}</div>
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          {chosen && (
            <div>
              {/* Role indicator + back */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: isSiswa ? 'rgba(16,185,129,0.12)' : 'rgba(139,92,246,0.12)',
                  border: `1px solid ${isSiswa ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}`,
                  borderRadius: 20, padding: '6px 14px',
                }}>
                  <span style={{ fontSize: 16 }}>{isSiswa ? '⚔️' : '🔮'}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isSiswa ? '#10B981' : '#8B5CF6' }}>
                    Masuk sebagai {isSiswa ? 'Siswa' : 'Guru'}
                  </span>
                </div>
                <button
                  onClick={goBack}
                  style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#94A3B8', borderRadius: 20, padding: '6px 14px',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >← Ganti</button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
                    {isSiswa ? 'NISN atau Username' : 'Email atau Username'}
                  </label>
                  <input
                    required
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    placeholder={isSiswa ? 'Masukkan NISN atau username' : 'Masukkan email atau username'}
                    autoCapitalize="none"
                    style={{
                      width: '100%', background: '#1A1D27',
                      border: `1px solid ${isSiswa ? 'rgba(16,185,129,0.25)' : 'rgba(139,92,246,0.25)'}`,
                      borderRadius: 12, padding: '14px 16px',
                      color: '#fff', fontSize: 15, fontFamily: 'inherit',
                      outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = isSiswa ? '#10B981' : '#8B5CF6'}
                    onBlur={e => e.target.style.borderColor = isSiswa ? 'rgba(16,185,129,0.25)' : 'rgba(139,92,246,0.25)'}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      required
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      style={{
                        width: '100%', background: '#1A1D27',
                        border: `1px solid ${isSiswa ? 'rgba(16,185,129,0.25)' : 'rgba(139,92,246,0.25)'}`,
                        borderRadius: 12, padding: '14px 16px', paddingRight: 48,
                        color: '#fff', fontSize: 15, fontFamily: 'inherit',
                        outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = isSiswa ? '#10B981' : '#8B5CF6'}
                      onBlur={e => e.target.style.borderColor = isSiswa ? 'rgba(16,185,129,0.25)' : 'rgba(139,92,246,0.25)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      style={{
                        position: 'absolute', right: 14, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 16, padding: 4,
                        color: isSiswa ? 'rgba(16,185,129,0.6)' : 'rgba(139,92,246,0.6)',
                      }}
                    >{showPw ? '🙈' : '👁️'}</button>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)',
                    borderRadius: 10, padding: '10px 14px', color: '#fca5a5', fontSize: 13,
                  }}>{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 6,
                    height: 52,
                    background: loading
                      ? '#1A1D27'
                      : isSiswa
                        ? 'linear-gradient(135deg, #10B981, #059669)'
                        : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    color: '#fff', border: 'none', borderRadius: 14,
                    fontSize: 15, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: loading ? 'none' : isSiswa
                      ? '0 0 24px rgba(16,185,129,0.35)'
                      : '0 0 24px rgba(139,92,246,0.35)',
                    transition: 'opacity 0.15s, transform 0.15s',
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = '' }}
                >
                  {loading ? 'Memproses…' : 'MASUK →'}
                </button>
              </form>

              <div style={{ marginTop: 20, fontSize: 12, color: '#475569', textAlign: 'center' }}>
                {isSiswa
                  ? 'Akun siswa didaftarkan melalui aplikasi BLP.'
                  : 'Akun guru dibuat oleh admin sekolah melalui BLP.'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive: hide brand panel & show mobile logo on small screens */}
      <style>{`
        @media (max-width: 767px) {
          .login-brand-panel { display: none !important; }
          .login-mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
