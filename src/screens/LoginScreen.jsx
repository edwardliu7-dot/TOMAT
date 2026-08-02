import React, { useState } from 'react'
import { useAuth } from '../AuthContext'
import logo from '../assets/logo.png'
import { APP_VERSION } from '../version'

const ROLES = {
  siswa: {
    label: 'Siswa',
    sub: 'Pelajar SMP TISA',
    icon: '↗',
    mark: 'S',
    accent: '#8b7cff',
    accentRgb: '139,124,255',
    accentSoft: 'rgba(139,124,255,.16)',
    border: 'rgba(139,124,255,.34)',
    bgDesktop: 'linear-gradient(135deg, #0f1635 0%, #1a1060 50%, #0f1635 100%)',
    bgMobile: 'linear-gradient(145deg,#171748 0%,#211861 52%,#131735 100%)',
    glowColor: 'rgba(99,102,241,.18)',
    features: ['TOMAT', 'BLP'],
    hint: 'Akses materi, nilai, dan permainanmu.',
    note: 'Akun didaftarkan melalui BLP',
    btnText: '#171331',
  },
  guru: {
    label: 'Guru',
    sub: 'Pengajar SMP TISA',
    icon: '✦',
    mark: 'G',
    accent: '#f6b84a',
    accentRgb: '246,184,74',
    accentSoft: 'rgba(246,184,74,.14)',
    border: 'rgba(246,184,74,.34)',
    bgDesktop: 'linear-gradient(135deg, #1a1008 0%, #2d1a00 50%, #1a1008 100%)',
    bgMobile: 'linear-gradient(145deg,#392312 0%,#503016 52%,#26190f 100%)',
    glowColor: 'rgba(245,158,11,.15)',
    features: ['TOMAT', 'BLP', 'GURU'],
    hint: 'Kelola kelas, penilaian, dan pembelajaran.',
    note: 'Akun dibuat oleh admin sekolah',
    btnText: '#211304',
  },
}

const FEATURE_COLORS = {
  TOMAT: { color: '#818CF8', bg: 'rgba(99,102,241,.15)', border: 'rgba(99,102,241,.3)' },
  BLP:   { color: '#34D399', bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.25)' },
  GURU:  { color: '#f6c468', bg: 'rgba(246,184,74,.16)', border: 'rgba(246,184,74,.3)' },
}

// ─── Sub-komponen didefinisikan DI LUAR LoginScreen ──────────────────────────
// Agar tidak dibuat ulang setiap render, sehingga input tidak kehilangan fokus.

function FeaturePills({ features }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {features.map(f => {
        const fc = FEATURE_COLORS[f] || {}
        return (
          <span key={f} style={{
            padding: '4px 10px', borderRadius: 99,
            background: fc.bg, border: `1px solid ${fc.border}`,
            color: fc.color, fontSize: 9, fontWeight: 800, letterSpacing: '.1em',
          }}>{f}</span>
        )
      })}
    </div>
  )
}

function FormFields({ form, onFormChange, onSubmit, showPassword, onTogglePassword,
                      error, loading, accentBorder, submitColor, submitText, note, accentRgb }) {
  return (
    <form onSubmit={onSubmit} style={{ marginTop: 'auto' }}>
      <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,.44)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 7 }}>
        Username
      </label>
      <input
        required
        type="text"
        value={form.username}
        onChange={e => onFormChange('username', e.target.value)}
        placeholder="Masukkan username"
        autoCapitalize="none"
        autoComplete="username"
        className="sl-input"
        style={{
          width: '100%', height: 45, color: '#fff', outline: 'none',
          border: `1px solid ${accentBorder}`, borderRadius: 11,
          background: 'rgba(255,255,255,.06)', padding: '0 13px',
          fontSize: 13, fontFamily: 'inherit', marginBottom: 11,
          boxSizing: 'border-box',
        }}
      />
      <label style={{ display: 'block', fontSize: 10, color: 'rgba(255,255,255,.44)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 7 }}>
        Kata Sandi
      </label>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input
          required
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={e => onFormChange('password', e.target.value)}
          placeholder="Kata sandi"
          autoComplete="current-password"
          className="sl-input"
          style={{
            width: '100%', height: 45, color: '#fff', outline: 'none',
            border: `1px solid ${accentBorder}`, borderRadius: 11,
            background: 'rgba(255,255,255,.06)', padding: '0 42px 0 13px',
            fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          style={{ position: 'absolute', right: 12, top: 12, border: 0, background: 'none', color: 'rgba(255,255,255,.45)', cursor: 'pointer', fontSize: 14 }}
        >
          {showPassword ? '🙈' : '👁'}
        </button>
      </div>

      {error && (
        <div role="alert" style={{
          marginBottom: 14, padding: '10px 13px',
          border: '1px solid rgba(248,113,113,.35)', borderRadius: 10,
          background: 'rgba(220,38,38,.12)', color: '#FCA5A5',
          fontSize: 12, lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="sl-btn"
        style={{
          width: '100%', height: 46, border: 0, borderRadius: 11,
          background: submitColor, color: submitText,
          fontWeight: 800, letterSpacing: '.08em', fontSize: 12,
          cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
          opacity: loading ? .65 : 1,
          boxShadow: `0 4px 20px rgba(${accentRgb},.35)`,
        }}
      >
        {loading ? 'MEMPROSES…' : 'MASUK KE PORTAL'}
      </button>

      <button
        type="button"
        onClick={() => {}}
        style={{ display: 'block', width: '100%', marginTop: 10, border: 0, background: 'none', color: 'rgba(255,255,255,.3)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', textAlign: 'center' }}
      >
        Lupa kata sandi?
      </button>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.22)', fontSize: 10, marginTop: 6 }}>
        {note}
      </div>
    </form>
  )
}

function DesktopLayout({ role, switchRole, formProps }) {
  return (
    <div className="sl-desktop" style={{
      display: 'flex', width: '100%', height: '100dvh', position: 'relative',
    }}>
      {/* top-center minimal header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, zIndex: 20,
        background: 'linear-gradient(to bottom, rgba(8,12,22,.95) 0%, transparent 100%)',
      }}>
        <img src={logo} alt="SMARTISA" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 8 }} />
        <span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,.7)', letterSpacing: '.04em' }}>SMARTISA</span>
      </div>

      {Object.entries(ROLES).map(([key, item]) => {
        const isActive = role === key
        return (
          <div
            key={key}
            onClick={() => !isActive && switchRole(key)}
            className="sl-portal"
            style={{
              flex: isActive ? 3 : 1,
              position: 'relative', overflow: 'hidden',
              cursor: isActive ? 'default' : 'pointer',
            }}
          >
            {/* bg */}
            <div style={{
              position: 'absolute', inset: 0,
              background: isActive ? item.bgDesktop : 'linear-gradient(135deg,#0a0e20,#0d1228)',
              transition: 'background .45s',
            }} />
            {/* glow */}
            <div style={{
              position: 'absolute', top: '20%', left: '30%',
              width: 400, height: 400,
              background: `radial-gradient(circle, ${item.glowColor} 0%, transparent 70%)`,
              opacity: isActive ? 1 : 0.25, transition: 'opacity .4s',
              transform: 'translate(-50%,-50%)', pointerEvents: 'none',
            }} />
            {/* divider line */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 1, background: 'rgba(255,255,255,.07)' }} />

            {/* content */}
            <div style={{
              position: 'relative', zIndex: 5, height: '100%',
              display: 'flex', flexDirection: 'column',
              padding: isActive ? '72px 44px 36px' : '72px 22px 36px',
              transition: 'padding .35s',
            }}>
              {/* role heading */}
              <div style={{ marginBottom: isActive ? 24 : 10 }}>
                <div style={{ fontSize: isActive ? 36 : 26, marginBottom: 8, transition: 'font-size .3s' }}>
                  {key === 'siswa' ? '📖' : '🎓'}
                </div>
                <div style={{
                  fontSize: isActive ? 26 : 18, fontWeight: 900,
                  color: isActive ? '#fff' : 'rgba(255,255,255,.5)',
                  transition: 'font-size .3s, color .3s', whiteSpace: 'nowrap',
                }}>
                  {item.label}
                </div>
                {isActive && <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{item.sub}</div>}
              </div>

              {isActive && (
                <>
                  <div style={{ marginBottom: 22 }}>
                    <FeaturePills features={item.features} />
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.55, marginBottom: 22 }}>
                    {item.hint}
                  </div>
                  <FormFields
                    {...formProps}
                    accentBorder={item.border}
                    submitColor={item.accent}
                    submitText={item.btnText}
                    note={item.note}
                    accentRgb={item.accentRgb}
                  />
                </>
              )}

              {!isActive && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.22)', marginTop: 'auto', paddingBottom: 32 }}>
                  Ketuk untuk masuk
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* bottom version */}
      <div style={{
        position: 'absolute', bottom: 14, left: 0, right: 0,
        textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,.15)', zIndex: 20,
      }}>
        v{APP_VERSION} · SMP TISA Islamic School
      </div>
    </div>
  )
}

function MobileLayout({ role, switchRole, formProps }) {
  const r = ROLES[role]
  return (
    <main style={{
      minHeight: '100dvh', width: '100%',
      background: '#080b16', color: '#fff',
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      position: 'relative', overflowY: 'auto',
      padding: '0 18px 18px',
    }}>
      {/* header */}
      <header style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logo} alt="SMARTISA" style={{ width: 30, height: 30, objectFit: 'contain', borderRadius: 8 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '.08em' }}>SMARTISA</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: '.16em', marginTop: 1 }}>PORTAL PEMBELAJARAN</div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.38)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 99, padding: '6px 10px' }}>
          v{APP_VERSION}
        </div>
      </header>

      {/* dynamic glow */}
      <div style={{
        position: 'fixed', top: 90, right: -130,
        width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle, ${r.accentSoft}, transparent 68%)`,
        pointerEvents: 'none', transition: 'background .5s', zIndex: 0,
      }} />

      {/* tagline */}
      <section style={{ position: 'relative', zIndex: 1, margin: '10px 0 16px' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.16em', color: '#9289d0', fontWeight: 700, marginBottom: 8 }}>
          Selamat datang kembali
        </div>
        <h1 style={{ margin: 0, fontSize: 'clamp(27px,8vw,36px)', lineHeight: 1.1, letterSpacing: '-.06em', fontWeight: 800 }}>
          Masuk sebagai<br />
          <span style={{ color: '#d4cffc' }}>{r.label.toLowerCase()}.</span>
        </h1>
      </section>

      {/* stacked role cards */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 2 }}>
        {Object.entries(ROLES).map(([key, item]) => {
          const isActive = role === key
          return (
            <article
              key={key}
              className="sl-card"
              onClick={() => !isActive && switchRole(key)}
              style={{
                flex: isActive ? '1.72' : '0.62',
                minHeight: isActive ? 438 : 82,
                position: 'relative', overflow: 'hidden', borderRadius: 22,
                border: `1px solid ${isActive ? item.border : 'rgba(255,255,255,.1)'}`,
                background: isActive ? item.bgMobile : 'linear-gradient(145deg,#101526,#111525)',
                cursor: isActive ? 'default' : 'pointer',
                boxShadow: isActive ? `0 20px 48px ${item.accentSoft}` : 'none',
                transition: 'min-height .45s cubic-bezier(.22,.8,.24,1)',
              }}
            >
              {/* inner glow */}
              <div style={{
                position: 'absolute', width: 210, height: 210, top: -86, right: -54,
                borderRadius: '50%',
                background: `radial-gradient(circle,${item.accentSoft},transparent 68%)`,
                opacity: isActive ? 1 : .25,
              }} />

              <div style={{
                padding: isActive ? '22px 20px 20px' : '15px 18px',
                height: '100%', display: 'flex',
                flexDirection: isActive ? 'column' : 'row',
                justifyContent: isActive ? 'flex-start' : 'center',
                gap: isActive ? 0 : 13, position: 'relative',
              }}>
                {/* role header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isActive ? 14 : 10, minHeight: isActive ? 66 : 48 }}>
                  <div style={{
                    width: isActive ? 51 : 35, height: isActive ? 51 : 35,
                    borderRadius: isActive ? 16 : 11,
                    display: 'grid', placeItems: 'center',
                    background: item.accentSoft, border: `1px solid ${item.border}`,
                    color: item.accent, fontSize: isActive ? 22 : 15, fontWeight: 800,
                    transition: 'all .35s', flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: isActive ? 24 : 16, fontWeight: 800, letterSpacing: '-.04em', color: isActive ? '#fff' : 'rgba(255,255,255,.62)' }}>
                      {item.label}
                    </div>
                    {isActive
                      ? <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 3 }}>{item.sub}</div>
                      : <div style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', marginTop: 2 }}>Ketuk untuk masuk</div>
                    }
                  </div>
                  {!isActive && <span style={{ marginLeft: 'auto', color: item.accent, fontSize: 18 }}>›</span>}
                </div>

                {/* expanded content */}
                {isActive && (
                  <>
                    <div style={{ margin: '16px 0 14px' }}>
                      <FeaturePills features={item.features} />
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.5, marginBottom: 14 }}>
                      {item.hint}
                    </div>
                    <FormFields
                      {...formProps}
                      accentBorder={item.border}
                      submitColor={item.accent}
                      submitText={item.btnText}
                      note={item.note}
                      accentRgb={item.accentRgb}
                    />
                  </>
                )}
              </div>
            </article>
          )
        })}
      </section>

      <footer style={{ textAlign: 'center', color: 'rgba(255,255,255,.18)', fontSize: 9, letterSpacing: '.06em', padding: '18px 0 0' }}>
        SMP TISA ISLAMIC SCHOOL · AMAN & TERHUBUNG
      </footer>
    </main>
  )
}

// ─── Screen utama ─────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { login } = useAuth()
  const [role, setRole] = useState('siswa')
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const switchRole = (next) => {
    setRole(next)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ role, username: form.username.trim(), password: form.password })
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const formProps = {
    form,
    onFormChange: handleFormChange,
    onSubmit: handleSubmit,
    showPassword,
    onTogglePassword: () => setShowPassword(v => !v),
    error,
    loading,
  }

  return (
    <>
      <style>{`
        /* font */
        .sl-desktop { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }

        /* portal flex transition */
        .sl-portal { transition: flex .4s cubic-bezier(.4,0,.2,1); }

        /* input focus */
        .sl-input::placeholder { color: rgba(255,255,255,.34); }
        .sl-input:focus { border-color: var(--sl-accent, rgba(139,124,255,.8)) !important; background: rgba(255,255,255,.09) !important; outline: none; }

        /* submit button */
        .sl-btn { transition: transform .2s ease, opacity .2s ease; }
        .sl-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .sl-btn:active:not(:disabled) { transform: scale(.98); }

        /* mobile card transition */
        .sl-card { transition: min-height .45s cubic-bezier(.22,.8,.24,1), box-shadow .3s; }

        /* aesthetic scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(139,124,255,.55) 0%, rgba(99,102,241,.3) 100%);
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(139,124,255,.85) 0%, rgba(99,102,241,.6) 100%);
        }
        * { scrollbar-width: thin; scrollbar-color: rgba(139,124,255,.45) transparent; }

        /* responsive: show desktop ≥900px, mobile <900px */
        .sl-show-desktop { display: block; }
        .sl-show-mobile  { display: none; }
        @media (max-width: 899px) {
          .sl-show-desktop { display: none; }
          .sl-show-mobile  { display: block; }
        }
      `}</style>

      <div className="sl-show-desktop">
        <DesktopLayout role={role} switchRole={switchRole} formProps={formProps} />
      </div>
      <div className="sl-show-mobile">
        <MobileLayout role={role} switchRole={switchRole} formProps={formProps} />
      </div>
    </>
  )
}
