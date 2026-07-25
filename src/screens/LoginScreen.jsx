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
  const goBack  = () => { setChosen(null); setError('') }

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

  const siswaActive = chosen === 'siswa'
  const guruActive  = chosen === 'guru'
  const decided     = chosen !== null

  return (
    <div style={{
      position: 'relative', minHeight: '100vh', height: '100%',
      width: '100%', overflow: 'hidden',
      fontFamily: 'inherit', color: '#fff', display: 'flex', flexDirection: 'column',
    }}>
      {/* ── Two world panels ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: '100%', position: 'relative' }}>

        {/* SISWA WORLD */}
        <div
          onClick={() => !decided && decide('siswa')}
          style={{
            position: 'relative', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden',
            cursor: decided ? 'default' : 'pointer',
            width: decided ? (siswaActive ? '100%' : '0%') : '50%',
            transition: 'width 0.65s cubic-bezier(0.77,0,0.175,1)',
            flexShrink: 0,
            background: 'linear-gradient(160deg, #022c22 0%, #064e3b 35%, #0a1220 100%)',
          }}
        >
          {/* Glow orbs */}
          <div style={{ position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(16,185,129,0.25)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          {/* Grid */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(16,185,129,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

          <div style={{
            position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column',
            alignItems: 'center', paddingTop: siswaActive ? 'clamp(120px,18vh,160px)' : 'clamp(60px,8vh,100px)',
            opacity: decided && !siswaActive ? 0 : 1, transition: 'opacity 0.4s',
            width: '100%', maxWidth: siswaActive ? 440 : '100%', margin: '0 auto',
          }}>
            {siswaActive && (
              <button onClick={e => { e.stopPropagation(); goBack() }} style={{
                position: 'absolute', top: 16, left: 16, width: 36, height: 36,
                borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>←</button>
            )}
            {/* Role identity — fades out when the login form opens */}
            <div style={{ opacity: siswaActive ? 0 : 1, transition: 'opacity 0.35s', pointerEvents: 'none' }}>
              <div style={{ fontSize: 'clamp(36px, 6vw, 64px)', filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.7))', textAlign: 'center' }}>⚔️</div>
              <div style={{ fontSize: 'clamp(16px, 2.5vw, 26px)', fontWeight: 900, letterSpacing: '0.2em', color: '#34D399', textTransform: 'uppercase', marginTop: 10, textAlign: 'center' }}>Siswa</div>
              <div style={{ fontSize: 'clamp(9px, 1.2vw, 13px)', color: '#059669', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 2, textAlign: 'center' }}>Pejuang Angka</div>
            </div>

            {!decided && (
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {['Quest Harian', 'Koin & XP', 'Level Up'].map(t => (
                  <div key={t} style={{
                    fontSize: 'clamp(9px, 1.3vw, 12px)', fontWeight: 700, padding: 'clamp(4px,0.8vw,7px) clamp(10px,1.8vw,18px)', borderRadius: 20,
                    background: 'rgba(16,185,129,0.15)', color: '#34D399',
                    border: '1px solid rgba(16,185,129,0.3)', letterSpacing: '0.1em',
                  }}>{t}</div>
                ))}
                <div style={{ marginTop: 16, width: 32, height: 2, background: 'rgba(52,211,153,0.5)', borderRadius: 2 }} />
                <div style={{ fontSize: 'clamp(8px, 1.1vw, 11px)', color: '#059669', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase' }}>TAP MASUK</div>
              </div>
            )}

            {siswaActive && (
              <div style={{ width: '100%', padding: '0 24px', marginTop: 28, boxSizing: 'border-box' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 9, color: '#059669', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Masuk sebagai</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#34D399', letterSpacing: '0.15em' }}>SISWA</div>
                  <div style={{ fontSize: 11, color: 'rgba(52,211,153,0.7)', marginTop: 6, lineHeight: 1.5 }}>
                    Akun siswa didaftarkan melalui aplikasi BLP.
                  </div>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    required value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    placeholder="NISN atau Username" autoCapitalize="none"
                    style={siswaInputStyle}
                  />
                  <div style={{ position: 'relative' }}>
                    <input
                      required type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      style={{ ...siswaInputStyle, paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'rgba(52,211,153,0.6)',
                      cursor: 'pointer', fontSize: 16, padding: 4,
                    }}>{showPw ? '🙈' : '👁️'}</button>
                  </div>
                  {error && (
                    <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 10, padding: '10px 12px', color: '#fca5a5', fontSize: 12 }}>
                      {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading} style={{
                    marginTop: 4, background: loading ? '#065f46' : 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0',
                    fontSize: 15, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 0 24px rgba(16,185,129,0.35)',
                  }}>
                    {loading ? 'Memproses…' : 'MASUK →'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {!decided && (
            <div style={{ position: 'absolute', top: 0, right: 0, width: 1, height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.35), transparent)' }} />
          )}
        </div>

        {/* GURU WORLD */}
        <div
          onClick={() => !decided && decide('guru')}
          style={{
            position: 'relative', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden',
            cursor: decided ? 'default' : 'pointer',
            width: decided ? (guruActive ? '100%' : '0%') : '50%',
            transition: 'width 0.65s cubic-bezier(0.77,0,0.175,1)',
            flexShrink: 0,
            background: 'linear-gradient(160deg, #1e1b4b 0%, #2e1065 35%, #0a0a1a 100%)',
          }}
        >
          <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(139,92,246,0.25)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(167,139,250,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

          <div style={{
            position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column',
            alignItems: 'center', paddingTop: guruActive ? 'clamp(120px,18vh,160px)' : 'clamp(60px,8vh,100px)',
            opacity: decided && !guruActive ? 0 : 1, transition: 'opacity 0.4s',
            width: '100%', maxWidth: guruActive ? 440 : '100%', margin: '0 auto',
          }}>
            {guruActive && (
              <button onClick={e => { e.stopPropagation(); goBack() }} style={{
                position: 'absolute', top: 16, left: 16, width: 36, height: 36,
                borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>←</button>
            )}
            {/* Role identity — fades out when the login form opens */}
            <div style={{ opacity: guruActive ? 0 : 1, transition: 'opacity 0.35s', pointerEvents: 'none' }}>
              <div style={{ fontSize: 'clamp(36px, 6vw, 64px)', filter: 'drop-shadow(0 0 20px rgba(167,139,250,0.7))', textAlign: 'center' }}>🔮</div>
              <div style={{ fontSize: 'clamp(16px, 2.5vw, 26px)', fontWeight: 900, letterSpacing: '0.2em', color: '#A78BFA', textTransform: 'uppercase', marginTop: 10, textAlign: 'center' }}>Guru</div>
              <div style={{ fontSize: 'clamp(9px, 1.2vw, 13px)', color: '#7C3AED', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 2, textAlign: 'center' }}>Arsitek Ilmu</div>
            </div>

            {!decided && (
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {['Buat Tugas', 'Pantau Kelas', 'Lihat Nilai'].map(t => (
                  <div key={t} style={{
                    fontSize: 'clamp(9px, 1.3vw, 12px)', fontWeight: 700, padding: 'clamp(4px,0.8vw,7px) clamp(10px,1.8vw,18px)', borderRadius: 20,
                    background: 'rgba(139,92,246,0.15)', color: '#A78BFA',
                    border: '1px solid rgba(139,92,246,0.3)', letterSpacing: '0.1em',
                  }}>{t}</div>
                ))}
                <div style={{ marginTop: 16, width: 32, height: 2, background: 'rgba(167,139,250,0.5)', borderRadius: 2 }} />
                <div style={{ fontSize: 'clamp(8px, 1.1vw, 11px)', color: '#7C3AED', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase' }}>TAP MASUK</div>
              </div>
            )}

            {guruActive && (
              <div style={{ width: '100%', padding: '0 24px', marginTop: 28, boxSizing: 'border-box' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 9, color: '#7C3AED', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Masuk sebagai</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#A78BFA', letterSpacing: '0.15em' }}>GURU</div>
                  <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.7)', marginTop: 6, lineHeight: 1.5 }}>
                    Akun guru dibuat oleh admin sekolah melalui BLP.
                  </div>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    required value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    placeholder="Email atau Username" autoCapitalize="none"
                    style={guruInputStyle}
                  />
                  <div style={{ position: 'relative' }}>
                    <input
                      required type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                      style={{ ...guruInputStyle, paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'rgba(167,139,250,0.6)',
                      cursor: 'pointer', fontSize: 16, padding: 4,
                    }}>{showPw ? '🙈' : '👁️'}</button>
                  </div>
                  {error && (
                    <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 10, padding: '10px 12px', color: '#fca5a5', fontSize: 12 }}>
                      {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading} style={{
                    marginTop: 4, background: loading ? '#2e1065' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    color: '#fff', border: 'none', borderRadius: 14, padding: '14px 0',
                    fontSize: 15, fontWeight: 800, cursor: loading ? 'default' : 'pointer',
                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 0 24px rgba(139,92,246,0.35)',
                  }}>
                    {loading ? 'Memproses…' : 'MASUK →'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand strip — always visible; only "Pilih Duniamu" fades when a role is chosen */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{ marginTop: 'clamp(18px,3vh,36px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={logo} alt="TOMAT" style={{ width: 'clamp(36px,5vw,52px)', height: 'clamp(36px,5vw,52px)', borderRadius: 12, objectFit: 'cover', marginBottom: 6 }} />
          <div style={{ fontSize: 'clamp(18px,3vw,28px)', fontWeight: 900, fontStyle: 'italic', letterSpacing: '0.05em', color: '#fff' }}>TOMAT</div>
          <div style={{ fontSize: 'clamp(8px,1.1vw,11px)', color: '#67E8F9', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Tantangan Otak MATematika</div>
        </div>
        <div style={{ marginTop: 12, width: 1, height: 24, background: 'rgba(255,255,255,0.1)', opacity: decided ? 0 : 1, transition: 'opacity 0.35s' }} />
        <div style={{ fontSize: 'clamp(8px,1vw,11px)', color: '#475569', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4, opacity: decided ? 0 : 1, transition: 'opacity 0.35s' }}>Pilih Duniamu</div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center',
        zIndex: 20, pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 9, color: '#374151', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          SMP TISA Islamic School · v2.0
        </div>
      </div>
    </div>
  )
}

const baseInputStyle = {
  width: '100%', borderRadius: 12, padding: '12px 14px',
  color: '#fff', fontSize: 14, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box', border: 'none',
}
const siswaInputStyle = {
  ...baseInputStyle,
  background: 'rgba(0,0,0,0.45)',
  border: '1px solid rgba(16,185,129,0.25)',
}
const guruInputStyle = {
  ...baseInputStyle,
  background: 'rgba(0,0,0,0.45)',
  border: '1px solid rgba(139,92,246,0.25)',
}
