/**
 * BlpLayout.jsx — Layout wrapper modul BLP Harian
 *
 * Desktop (≥1024px): sidebar 220px inline di kiri + konten di kanan (flex),
 *                    keduanya height 100dvh.
 * Mobile (<1024px):  konten full-width + footer navigation bar di bawah.
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

const BLP_PRIMARY = '#10b981'

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

export default function BlpLayout({ user, navigate, currentScreen, onLogout, children }) {
  const isDesktop = useIsDesktop()
  const isGuru = user?.role === 'guru'
  const footerNav = isGuru ? GURU_FOOTER_NAV : getSiswaFooterNav(user)

  return (
    <>
      {/* Bottom nav styles — injected once, global scope */}
      <style>{`
        .blp-bottom-nav {
          position: fixed; z-index: 200;
          display: flex; left: 0; right: 0; bottom: 0;
          justify-content: space-around;
          padding: 10px 16px calc(18px + env(safe-area-inset-bottom, 0px));
          padding-left:  calc(16px + env(safe-area-inset-left, 0px));
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
        .blp-bottom-nav button span  { font-size: 20px; opacity: .55; }
        .blp-bottom-nav button small { font-size: 10px; }
        .blp-bottom-nav button.blp-active              { color: ${BLP_PRIMARY}; font-weight: 800; }
        .blp-bottom-nav button.blp-active span         { opacity: 1; }
        .blp-bottom-nav button.blp-active::before {
          content: ''; position: absolute; top: -10px;
          width: 20px; height: 3px; border-radius: 99px;
          background: ${BLP_PRIMARY};
        }
      `}</style>

      {/* Root flex container — fills the viewport */}
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Desktop: inline sidebar */}
        {isDesktop && (
          <BlpSidebar
            user={user}
            navigate={navigate}
            currentScreen={currentScreen}
            onLogout={onLogout}
          />
        )}

        {/* Content area — scrollable */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          minWidth: 0,
          ...((!isDesktop) ? { paddingBottom: 80 } : {}),
        }}>
          {children}
        </div>
      </div>

      {/* Mobile footer navigation */}
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
