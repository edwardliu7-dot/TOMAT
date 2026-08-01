/**
 * Eob5Layout.jsx — Layout wrapper untuk semua screen modul GURU (eob5-*)
 *
 * Desktop (≥1024px): sidebar 210px di kiri + konten di kanan, keduanya 100dvh.
 * Mobile (<1024px) : konten full-width. Sidebar muncul sebagai drawer overlay
 *                    yang dibuka via tombol hamburger (☰) floating di pojok kiri atas.
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
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100dvh',
      overflow: 'hidden',
      position: 'relative',
    }}>
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
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minWidth: 0 }}>
        {children}

        {/* Mobile hamburger button — only when drawer is closed */}
        {!isDesktop && !drawerOpen && (
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              position: 'absolute',
              // Below the AppShell mobile header (64px) plus a small gap
              top: 72,
              left: 12,
              zIndex: 200,
              width: 36, height: 36,
              borderRadius: 10,
              background: 'rgba(245,158,11,0.22)',
              border: '1px solid rgba(245,158,11,0.4)',
              color: '#f59e0b',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
              fontFamily: 'inherit',
            }}
            title="Menu GURU"
          >
            ☰
          </button>
        )}
      </div>
    </div>
  )
}
