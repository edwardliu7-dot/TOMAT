/**
 * BlpLayout.jsx — Layout wrapper modul BLP Harian
 *
 * Desktop (≥1024px): sidebar 220px fixed di kiri + konten digeser ke kanan.
 * Mobile (<1024px):  footer navigation bar di bawah (seperti TOMAT mobile nav).
 *
 * Props: { user, navigate, currentScreen, onLogout, children }
 */
import { useState, useEffect } from 'react'
import BlpSidebar from './BlpSidebar'

function useIsDesktop() {
  const [desk, setDesk] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setDesk(mq.matches)
    const h = e => setDesk(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return desk
}

function getSiswaFooterNav(user) {
  const showHaid = user?.jenisKelamin !== 'L'
  return [
    ['blp-home',          '🏠', 'Beranda'],
    ['blp-isi-aktivitas', '✅', 'Aktivitas'],
    ['blp-riwayat',       '📋', 'Riwayat'],
    ['blp-quran',         '📖', 'Al-Quran'],
    ...(showHaid ? [['blp-haid', '🌸', 'Haid']] : []),
  ]
}

const GURU_FOOTER_NAV = [
  ['blp-guru-rekap',   '📊', 'Dashboard'],
  ['blp-guru-periode', '📅', 'Periode'],
]

const BLP_PRIMARY = '#10b981'

export default function BlpLayout({ user, navigate, currentScreen, onLogout, children }) {
  const isDesktop = useIsDesktop()
  const isGuru = user?.role === 'guru'
  const footerNav = isGuru ? GURU_FOOTER_NAV : getSiswaFooterNav(user)

  return (
    <>
      <style>{`
        .blp-content-wrap {
          min-height: 100dvh;
        }
        @media (min-width: 1024px) {
          .blp-content-wrap {
            margin-left: 220px;
          }
        }
        @media (max-width: 1023px) {
          .blp-content-wrap.blp-has-footer {
            padding-bottom: 80px;
          }
        }
        .blp-bottom-nav {
          position: fixed; z-index: 100;
          display: flex; left: 0; right: 0; bottom: 0;
          justify-content: space-around;
          padding: 10px 16px calc(18px + env(safe-area-inset-bottom, 0px));
          padding-left: calc(16px + env(safe-area-inset-left, 0px));
          padding-right: calc(16px + env(safe-area-inset-right, 0px));
          border-top: 1px solid rgba(16,185,129,0.15);
          background: rgba(7,26,16,0.97);
          backdrop-filter: blur(16px);
        }
        .blp-bottom-nav button {
          position: relative; display: flex; flex-direction: column;
          align-items: center; gap: 4px; min-width: 56px;
          border: 0; background: none; color: #4a7a5a;
          cursor: pointer; font: inherit;
        }
        .blp-bottom-nav button span { font-size: 20px; opacity: .55; }
        .blp-bottom-nav button small { font-size: 10px; }
        .blp-bottom-nav button.blp-active { color: ${BLP_PRIMARY}; font-weight: 800; }
        .blp-bottom-nav button.blp-active span { opacity: 1; }
        .blp-bottom-nav button.blp-active::before {
          content: ''; position: absolute; top: -10px;
          width: 20px; height: 3px; border-radius: 99px; background: ${BLP_PRIMARY};
        }
      `}</style>

      {/* Desktop sidebar */}
      {isDesktop && (
        <BlpSidebar
          user={user}
          navigate={navigate}
          currentScreen={currentScreen}
          onLogout={onLogout}
        />
      )}

      {/* Content area */}
      <div className={`blp-content-wrap${!isDesktop ? ' blp-has-footer' : ''}`}>
        {children}
      </div>

      {/* Mobile footer nav */}
      {!isDesktop && (
        <nav className="blp-bottom-nav">
          {footerNav.map(([key, emoji, label]) => (
            <button
              key={key}
              type="button"
              className={currentScreen === key ? 'blp-active' : ''}
              onClick={() => navigate(key)}
            >
              <span>{emoji}</span>
              <small>{label}</small>
            </button>
          ))}
        </nav>
      )}
    </>
  )
}
