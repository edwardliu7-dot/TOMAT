/**
 * Eob5Layout.jsx — Layout wrapper untuk semua screen modul GURU (eob5-*)
 *
 * Desktop (≥1024px): sidebar 210px di kiri + konten di kanan, keduanya 100dvh.
 * Mobile (<1024px) : footer navigation bar dengan 4 item utama + tombol "Menu"
 *                    yang membuka drawer sidebar lengkap.
 *
 * Props: { navigate, currentScreen, children }
 */
import { useState, useEffect } from 'react'
import Eob5Sidebar from './Eob5Sidebar'

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

const EOB5_PRIMARY = '#f59e0b'

// 4 item utama di footer + tombol Menu untuk membuka drawer
const FOOTER_QUICK = [
  { key: 'eob5-dashboard', emoji: '🏫', label: 'Dashboard' },
  { key: 'eob5-absensi',   emoji: '📋', label: 'Absensi' },
  { key: 'eob5-nilai',     emoji: '📊', label: 'Nilai' },
  { key: 'eob5-jurnal',    emoji: '📖', label: 'Jurnal' },
]

export default function Eob5Layout({ navigate, currentScreen, children }) {
  const isDesktop = useIsDesktop()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close drawer on desktop resize
  useEffect(() => { if (isDesktop) setDrawerOpen(false) }, [isDesktop])

  // Close drawer when navigating on mobile
  const handleNavigate = (key) => {
    navigate(key)
    setDrawerOpen(false)
  }

  return (
    <>
      <style>{`
        .eob5-content-wrap {
          width: 100%;
          height: 100dvh;
          overflow: hidden;
          position: relative;
        }
        @media (min-width: 1024px) {
          .eob5-layout-root {
            display: flex;
            width: 100%;
            height: 100dvh;
            overflow: hidden;
          }
          .eob5-content-wrap {
            flex: 1;
            min-width: 0;
          }
        }
        @media (max-width: 1023px) {
          .eob5-content-wrap {
            padding-bottom: 80px;
          }
        }
        .eob5-bottom-nav {
          position: fixed; z-index: 100;
          display: flex; left: 0; right: 0; bottom: 0;
          justify-content: space-around;
          padding: 10px 8px calc(18px + env(safe-area-inset-bottom, 0px));
          padding-left: calc(8px + env(safe-area-inset-left, 0px));
          padding-right: calc(8px + env(safe-area-inset-right, 0px));
          border-top: 1px solid rgba(245,158,11,0.15);
          background: rgba(26,18,0,0.97);
          backdrop-filter: blur(16px);
        }
        .eob5-bottom-nav button {
          position: relative; display: flex; flex-direction: column;
          align-items: center; gap: 4px; min-width: 56px;
          border: 0; background: none; color: #92400e;
          cursor: pointer; font: inherit;
        }
        .eob5-bottom-nav button span { font-size: 20px; opacity: .55; }
        .eob5-bottom-nav button small { font-size: 10px; }
        .eob5-bottom-nav button.eob5-active { color: ${EOB5_PRIMARY}; font-weight: 800; }
        .eob5-bottom-nav button.eob5-active span { opacity: 1; }
        .eob5-bottom-nav button.eob5-active::before {
          content: ''; position: absolute; top: -10px;
          width: 20px; height: 3px; border-radius: 99px; background: ${EOB5_PRIMARY};
        }
        .eob5-menu-btn span { opacity: .7 !important; }
      `}</style>

      <div className="eob5-layout-root">
        {/* ── Desktop: inline sidebar ── */}
        {isDesktop && (
          <Eob5Sidebar
            navigate={navigate}
            currentScreen={currentScreen}
          />
        )}

        {/* ── Mobile: drawer overlay ── */}
        {!isDesktop && drawerOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 400,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(2px)',
              }}
            />
            {/* Drawer panel */}
            <div style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              zIndex: 401, width: 230,
              boxShadow: '4px 0 32px rgba(0,0,0,0.6)',
            }}>
              <Eob5Sidebar
                navigate={handleNavigate}
                currentScreen={currentScreen}
                onClose={() => setDrawerOpen(false)}
              />
            </div>
          </>
        )}

        {/* ── Content area ── */}
        <div className="eob5-content-wrap">
          {children}
        </div>
      </div>

      {/* ── Mobile footer nav ── */}
      {!isDesktop && (
        <nav className="eob5-bottom-nav">
          {FOOTER_QUICK.map(({ key, emoji, label }) => (
            <button
              key={key}
              type="button"
              className={currentScreen === key ? 'eob5-active' : ''}
              onClick={() => handleNavigate(key)}
            >
              <span>{emoji}</span>
              <small>{label}</small>
            </button>
          ))}
          {/* Menu button — opens full sidebar drawer */}
          <button
            type="button"
            className={`eob5-menu-btn${drawerOpen ? ' eob5-active' : ''}`}
            onClick={() => setDrawerOpen(v => !v)}
          >
            <span>☰</span>
            <small>Menu</small>
          </button>
        </nav>
      )}
    </>
  )
}
