import React, { useState } from 'react'
import { useAuth } from '../AuthContext'
import logo from '../assets/logo.png'

const FEATURES = [
  ['⚔️', 'Duel Real-time'],
  ['💥', 'Boss Raid Co-op'],
  ['🏆', 'Turnamen Kelas'],
  ['🐹', 'Pet Tomi'],
  ['🛒', 'Toko Kosmetik'],
  ['🧮', 'Hafalan Interaktif'],
]

const ROLE_META = {
  siswa: {
    icon: '📖',
    label: 'Siswa',
    subtitle: 'Pelajar Tangguh',
    accent: '#818CF8',
    border: 'rgba(129,140,248,0.52)',
    soft: 'rgba(99,102,241,0.12)',
    placeholder: 'contoh: 08123456789',
    inputLabel: 'Email / WhatsApp',
  },
  guru: {
    icon: '🎓',
    label: 'Guru',
    subtitle: 'Pemandu Ilmu',
    accent: '#A78BFA',
    border: 'rgba(167,139,250,0.52)',
    soft: 'rgba(139,92,246,0.12)',
    placeholder: 'guru@sekolah.com',
    inputLabel: 'Alamat Email',
  },
}

export default function LoginScreen() {
  const { login } = useAuth()
  const [role, setRole] = useState('siswa')
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const meta = ROLE_META[role]

  const setRoleAndClearError = (nextRole) => {
    setRole(nextRole)
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
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

  return (
    <main className="tomat-login">
      <div className="tomat-login__glow tomat-login__glow--one" />
      <div className="tomat-login__glow tomat-login__glow--two" />
      <div className="tomat-login__glow tomat-login__glow--three" />

      <section className="tomat-login__brand">
        <div className="tomat-login__brand-inner">
           <div className="tomat-login__tomato" aria-hidden="true">
             <img src={logo} alt="" />
           </div>
          <h1>TOMAT</h1>
          <p className="tomat-login__tagline">Tantangan Otak Matematika</p>
          <p className="tomat-login__description">
            Platform gamifikasi matematika SMP yang membuat belajar jadi petualangan seru.
            <br />
            Kumpulkan koin, taklukkan boss, dan jadilah juara kelas! 🎮
          </p>
          <div className="tomat-login__features">
            {FEATURES.map(([icon, label]) => (
              <span key={label}><span aria-hidden="true">{icon}</span>{label}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="tomat-login__form-panel">
        <div className="tomat-login__form-wrap">
          <div className="tomat-login__mobile-brand">
             <div className="tomat-login__tomato tomat-login__tomato--small" aria-hidden="true">
               <img src={logo} alt="" />
             </div>
            <h1>TOMAT</h1>
            <p>Tantangan Otak Matematika</p>
            <span>Platform belajar matematika SMP yang menyenangkan 🎮</span>
          </div>

          <div className="tomat-login__heading">
            <h2>Masuk</h2>
            <p>Pilih peran dan masukkan kredensialmu.</p>
          </div>

          <div className="tomat-login__roles" role="group" aria-label="Pilih peran">
            {Object.entries(ROLE_META).map(([value, item]) => (
              <button
                type="button"
                key={value}
                className={`tomat-login__role ${role === value ? 'is-active' : ''}`}
                style={role === value ? { '--role-accent': item.accent, '--role-border': item.border, '--role-soft': item.soft } : undefined}
                onClick={() => setRoleAndClearError(value)}
                aria-pressed={role === value}
              >
                <span className="tomat-login__role-icon" aria-hidden="true">{item.icon}</span>
                <strong>{item.label}</strong>
                <small>{item.subtitle}</small>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="tomat-login__fields">
            <label>
              <span>{meta.inputLabel}</span>
              <input
                required
                type={role === 'guru' ? 'email' : 'text'}
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                placeholder={meta.placeholder}
                autoCapitalize="none"
                autoComplete="username"
              />
            </label>

            <label>
              <span>Kata Sandi</span>
              <div className="tomat-login__password">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Kata sandi"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </label>

            {error && <div className="tomat-login__error" role="alert">{error}</div>}

            <button
              className="tomat-login__submit"
              type="submit"
              disabled={loading}
              style={{ '--submit-start': role === 'siswa' ? '#6366F1' : '#8B5CF6', '--submit-end': role === 'siswa' ? '#4F46E5' : '#7C3AED' }}
            >
              {loading ? 'MEMPROSES…' : 'MASUK SEKARANG'}
            </button>
          </form>

          <button type="button" className="tomat-login__forgot" onClick={() => setError('Hubungi admin sekolah untuk mengatur ulang kata sandi.')}>
            Lupa kata sandi?
          </button>
          <p className="tomat-login__account-note">
            {role === 'siswa'
              ? 'Akun siswa didaftarkan melalui aplikasi BLP.'
              : 'Akun guru dibuat oleh admin sekolah melalui BLP.'}
          </p>
          <div className="tomat-login__version">v2.0 · SMP TISA Islamic School</div>
        </div>
      </section>

      <style>{`
        .tomat-login {
          min-height: 100dvh;
          width: 100%;
          position: relative;
          display: flex;
          overflow: hidden;
          background: #071321;
          color: #fff;
          font-family: inherit;
        }
        .tomat-login__glow {
          position: absolute;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(140px);
        }
        .tomat-login__glow--one {
          width: 700px; height: 700px; top: -260px; left: -240px;
          background: rgba(79,70,229,0.10);
        }
        .tomat-login__glow--two {
          width: 700px; height: 700px; right: -260px; bottom: -260px;
          background: rgba(139,92,246,0.08);
        }
        .tomat-login__glow--three {
          width: 500px; height: 500px; top: 30%; left: 40%;
          background: rgba(6,182,212,0.04);
        }
        .tomat-login__brand {
          position: relative;
          z-index: 1;
          width: 55%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px;
          background: linear-gradient(135deg, #0E1830 0%, #071321 100%);
          border-right: 1px solid rgba(99,102,241,0.10);
        }
        .tomat-login__brand-inner {
          max-width: 560px;
          text-align: center;
        }
        .tomat-login__tomato {
          width: 112px;
          height: 112px;
          margin: 0 auto 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 32px;
          background: linear-gradient(135deg, #6366F1, #7C3AED);
          box-shadow: 0 20px 60px rgba(99,102,241,0.40);
           overflow: hidden;
         }
         .tomat-login__tomato img {
           width: 100%;
           height: 100%;
           display: block;
           object-fit: cover;
        }
        .tomat-login__brand h1,
        .tomat-login__mobile-brand h1 {
          margin: 0;
          font-size: 48px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: .18em;
        }
        .tomat-login__tagline {
          margin: 12px 0 24px;
          color: #A5B4FC;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: .25em;
          text-transform: uppercase;
        }
        .tomat-login__description {
          margin: 0;
          color: #4B6480;
          font-size: 15px;
          line-height: 1.65;
        }
        .tomat-login__features {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-top: 40px;
        }
        .tomat-login__features span {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid rgba(99,102,241,0.20);
          border-radius: 999px;
          background: rgba(99,102,241,0.06);
          color: #C7D2FE;
          font-size: 12px;
          font-weight: 700;
        }
        .tomat-login__form-panel {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 64px;
        }
        .tomat-login__form-wrap {
          width: 100%;
          max-width: 430px;
        }
        .tomat-login__mobile-brand { display: none; }
        .tomat-login__heading { margin-bottom: 28px; }
        .tomat-login__heading h2 {
          margin: 0 0 8px;
          font-size: 28px;
          line-height: 1.15;
          font-weight: 900;
        }
        .tomat-login__heading p {
          margin: 0;
          color: #4B6480;
          font-size: 14px;
        }
        .tomat-login__roles {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .tomat-login__role {
          min-height: 142px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 18px;
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 20px;
          background: #0E1E35;
          color: rgba(255,255,255,0.60);
          cursor: pointer;
          font-family: inherit;
          transition: .2s ease;
        }
        .tomat-login__role:hover { transform: translateY(-2px); color: #fff; }
        .tomat-login__role.is-active {
          border-color: var(--role-border);
          background: var(--role-soft);
          color: #fff;
          box-shadow: 0 0 32px rgba(99,102,241,0.12);
        }
        .tomat-login__role-icon { font-size: 28px; line-height: 1; }
        .tomat-login__role strong { font-size: 15px; }
        .tomat-login__role small { color: #4B6480; font-size: 11px; font-weight: 700; }
        .tomat-login__fields { display: flex; flex-direction: column; gap: 16px; }
        .tomat-login__fields label > span {
          display: block;
          margin-bottom: 8px;
          color: #4B6480;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .10em;
          text-transform: uppercase;
        }
        .tomat-login__fields input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 14px;
          background: #0E1E35;
          padding: 14px 18px;
          color: #fff;
          outline: none;
          font: inherit;
          font-size: 14px;
          transition: .2s ease;
        }
        .tomat-login__fields input::placeholder { color: #4B6480; }
        .tomat-login__fields input:focus {
          border-color: rgba(129,140,248,0.60);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.14);
        }
        .tomat-login__password { position: relative; }
        .tomat-login__password input { padding-right: 52px; }
        .tomat-login__password button {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #64748B;
          font-size: 17px;
          cursor: pointer;
        }
        .tomat-login__error {
          padding: 11px 14px;
          border: 1px solid rgba(248,113,113,0.35);
          border-radius: 12px;
          background: rgba(220,38,38,0.12);
          color: #FCA5A5;
          font-size: 13px;
          line-height: 1.45;
        }
        .tomat-login__submit {
          width: 100%;
          height: 54px;
          margin-top: 8px;
          border: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--submit-start), var(--submit-end));
          color: #fff;
          box-shadow: 0 6px 32px rgba(99,102,241,0.35);
          cursor: pointer;
          font: inherit;
          font-size: 15px;
          font-weight: 950;
          letter-spacing: .02em;
          transition: .2s ease;
        }
        .tomat-login__submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(99,102,241,0.50); }
        .tomat-login__submit:disabled { cursor: wait; opacity: .65; }
        .tomat-login__forgot {
          display: block;
          width: 100%;
          margin-top: 18px;
          border: 0;
          background: transparent;
          color: rgba(129,140,248,0.72);
          cursor: pointer;
          font: inherit;
          font-size: 13px;
        }
        .tomat-login__forgot:hover { color: #818CF8; }
        .tomat-login__account-note {
          margin: 18px 0 0;
          color: #4B6480;
          font-size: 12px;
          line-height: 1.5;
          text-align: center;
        }
        .tomat-login__version {
          margin-top: 34px;
          color: #4B6480;
          font-size: 11px;
          text-align: center;
        }
        @media (max-width: 900px) {
          .tomat-login__brand { display: none; }
          .tomat-login__form-panel { padding: 36px 24px 70px; }
          .tomat-login__mobile-brand {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 34px;
            text-align: center;
          }
          .tomat-login__tomato--small {
            width: 80px; height: 80px; margin-bottom: 16px;
            border-radius: 24px; font-size: 34px;
          }
          .tomat-login__mobile-brand h1 { font-size: 36px; letter-spacing: .16em; }
          .tomat-login__mobile-brand p {
            margin: 6px 0 0;
            color: #A5B4FC;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: .20em;
            text-transform: uppercase;
          }
          .tomat-login__mobile-brand span { margin-top: 10px; color: #4B6480; font-size: 11px; }
        }
        @media (max-width: 430px) {
          .tomat-login__form-panel { padding-inline: 24px; }
          .tomat-login__heading h2 { font-size: 24px; }
          .tomat-login__roles { gap: 10px; }
          .tomat-login__role { min-height: 116px; padding: 12px; border-radius: 18px; }
          .tomat-login__role-icon { font-size: 24px; }
          .tomat-login__role strong { font-size: 13px; }
          .tomat-login__role small { font-size: 9px; }
          .tomat-login__version { margin-top: 28px; }
        }
      `}</style>
    </main>
  )
}