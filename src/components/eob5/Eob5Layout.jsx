/**
 * Eob5Layout.jsx — Layout wrapper untuk semua screen modul GURU (eob5-*)
 *
 * Desktop (≥1024px): sidebar 210px inline di kiri + konten di kanan (flex),
 *                    keduanya 100dvh.
 * Mobile (<1024px):  konten full-width + footer navigation bar di bawah.
 *                    Tombol "Menu ☰" di footer membuka drawer sidebar lengkap.
 *
 * Props: { navigate, currentScreen, children }
 */
import { useState, useEffect } from 'react'
import Eob5Sidebar from './Eob5Sidebar'

const EOB5_PRIMARY = '#f59e0b'

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

// 4 shortcut items in the mobile footer nav
const FOOTER_QUICK = [
  { key: 'eob5-dashboard', emoji: '🏫', label: 'Dashboard' },
  { key: 'eob5-absensi',   emoji: '📋', label: 'Absensi'   },
  { key: 'eob5-nilai',     emoji: '📊', label: 'Nilai'     },
  { key: 'eob5-jurnal',    emoji: '📖', label: 'Jurnal'    },
]

const NAV_BTN = {
  position: 'relative', display: 'flex', flexDirection: 'column',
  alignItems: 'center', gap: 4, minWidth: 56,
  border: 0, background: 'none', color: '#92400e',
  cursor: 'pointer', font: 'inherit',
}
const NAV_ICON = { fontSize: 20, opacity: .55 }
const NAV_LBL  = { fontSize: 10 }
const NAV_ACT_COLOR = EOB5_PRIMARY

export default function Eob5Layout({ navigate, currentScreen, user, onLogout, children }) {
  const isDesktop = useIsDesktop()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close drawer when switching to desktop
  useEffect(() => { if (isDesktop) setDrawerOpen(false) }, [isDesktop])

  const handleNavigate = (key) => {
    navigate(key)
    setDrawerOpen(false)
  }

  return (
    <>
      {/* Root flex container */}
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* ── Desktop: inline sidebar ── */}
        {isDesktop && (
          <Eob5Sidebar navigate={navigate} currentScreen={currentScreen} user={user} onLogout={onLogout} />
        )}

        {/* ── Mobile: drawer overlay ── */}
        {!isDesktop && drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 400,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(2px)',
              }}
            />
            <div style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              zIndex: 401, width: 230,
              boxShadow: '4px 0 32px rgba(0,0,0,0.6)',
            }}>
              <Eob5Sidebar
                navigate={handleNavigate}
                currentScreen={currentScreen}
                onClose={() => setDrawerOpen(false)}
                user={user}
                onLogout={onLogout}
              />
            </div>
          </>
        )}

        {/* ── Content area ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          minWidth: 0,
          ...((!isDesktop) ? { paddingBottom: 64 } : {}),
        }}>
          {children}
        </div>
      </div>

      {/* ── Mobile footer nav (fixed at bottom) ── */}
      {!isDesktop && (
        <nav style={{
          position: 'fixed', zIndex: 200,
          display: 'flex', left: 0, right: 0, bottom: 0,
          justifyContent: 'space-around',
          padding: `10px 8px calc(18px + env(safe-area-inset-bottom, 0px))`,
          paddingLeft:  'calc(8px + env(safe-area-inset-left, 0px))',
          paddingRight: 'calc(8px + env(safe-area-inset-right, 0px))',
          borderTop: 'rgba(245,158,11,0.15) solid 1px',
          background: 'rgba(26,18,0,0.97)',
          backdropFilter: 'blur(16px)',
        }}>
          {FOOTER_QUICK.map(({ key, emoji, label }) => {
            const active = currentScreen === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleNavigate(key)}
                style={{
                  ...NAV_BTN,
                  color: active ? NAV_ACT_COLOR : '#92400e',
                  fontWeight: active ? 800 : 400,
                }}
              >
                <span style={{ ...NAV_ICON, opacity: active ? 1 : 0.55 }}>{emoji}</span>
                <small style={NAV_LBL}>{label}</small>
                {active && (
                  <span style={{
                    position: 'absolute', top: -10,
                    width: 20, height: 3, borderRadius: 99,
                    background: EOB5_PRIMARY,
                  }} />
                )}
              </button>
            )
          })}

          {/* Menu button — opens the full sidebar drawer */}
          <button
            type="button"
            onClick={() => setDrawerOpen(v => !v)}
            style={{
              ...NAV_BTN,
              color: drawerOpen ? NAV_ACT_COLOR : '#92400e',
              fontWeight: drawerOpen ? 800 : 400,
            }}
          >
            <span style={{ ...NAV_ICON, opacity: drawerOpen ? 1 : 0.7 }}>☰</span>
            <small style={NAV_LBL}>Menu</small>
          </button>
        </nav>
      )}
    </>
  )
}
