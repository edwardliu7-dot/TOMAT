import React, { useState } from 'react'
import Sidebar from './Sidebar'
import { getGradeNumber } from '../kelasUtils'
import AudioPanel from './AudioPanel'
import AppSwitcher from './AppSwitcher'

function useIsDesktop() {
  const [desk, setDesk] = React.useState(() => window.innerWidth >= 1024)
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setDesk(mq.matches)
    const h = e => setDesk(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return desk
}

// Screens that should show the mobile bottom navigation bar
const BOTTOM_NAV_SCREENS = new Set(['home', 'grade7', 'grade8', 'grade9', 'toko', 'papanperingkat', 'profile'])

/**
 * AppShell — wrapper yang menambahkan sidebar di kiri dan offset konten di kanan.
 * Di mobile juga menampilkan bottom navigation bar yang persisten di semua layar utama.
 * Props: { user, navigate, currentScreen, onLogout, onSwitchModule, children }
 */
export default function AppShell({ user, navigate, currentScreen, onLogout, onSwitchModule, children }) {
  const isDesktop = useIsDesktop()
  const gradeNum = getGradeNumber(user?.kelas)
  const zoneId = gradeNum ? `grade${gradeNum}` : 'grade7'
  const isZoneActive = currentScreen === 'grade7' || currentScreen === 'grade8' || currentScreen === 'grade9'
  const showNav = !isDesktop && BOTTOM_NAV_SCREENS.has(currentScreen)

  const activeModule = currentScreen?.startsWith('blp-') ? 'blp'
    : currentScreen?.startsWith('eob5-') ? 'eob5'
    : 'tomat'

  const handleSwitch = (tab) => {
    onSwitchModule?.(tab.homeScreen)
  }

  return (
    <>
      <style>{`
        .appshell-bottom-nav {
          position: fixed; z-index: 100;
          display: flex; left: 0; right: 0; bottom: 0;
          justify-content: space-around;
          padding: 10px 16px calc(22px + env(safe-area-inset-bottom, 0px));
          padding-left: calc(16px + env(safe-area-inset-left, 0px));
          padding-right: calc(16px + env(safe-area-inset-right, 0px));
          border-top: 1px solid rgba(99,102,241,.10);
          background: rgba(7,19,33,.96);
          backdrop-filter: blur(16px);
        }
        .appshell-bottom-nav button {
          position: relative; display: flex; flex-direction: column;
          align-items: center; gap: 4px; width: 64px;
          border: 0; background: none; color: #4B6480;
          cursor: pointer; font: inherit;
        }
        .appshell-bottom-nav button span { font-size: 20px; opacity: .55; }
        .appshell-bottom-nav button small { font-size: 10px; }
        .appshell-bottom-nav button.is-active { color: #818CF8; font-weight: 800; }
        .appshell-bottom-nav button.is-active span { opacity: 1; }
        .appshell-bottom-nav button.is-active::before {
          content: ''; position: absolute; top: -10px;
          width: 20px; height: 3px; border-radius: 99px; background: #818CF8;
        }
        @media (max-width: 900px) {
          .with-sidebar.with-nav { padding-bottom: 84px; }
        }
      `}</style>
      <Sidebar
        user={user}
        navigate={navigate}
        currentScreen={currentScreen}
        onLogout={onLogout}
      />
      <div className={`with-sidebar${showNav ? ' with-nav' : ''}`}>
        {children}
      </div>
      {/* Mobile-only audio panel — desktop has it in the Sidebar */}
      {!isDesktop && (
        <div style={{
          position: 'fixed', bottom: showNav ? 96 : 16, right: 16,
          zIndex: 200,
        }}>
          <AudioPanel
            placement="up-right"
            buttonStyle={{
              width: 40, height: 40, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(15,17,28,0.88)', backdropFilter: 'blur(8px)',
              cursor: 'pointer', fontSize: 18, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          />
        </div>
      )}
      {showNav && (
        <nav className="appshell-bottom-nav">
          {[
            ['home',          '🏠', 'Beranda'],
            [zoneId,          '🗺️', 'Zona'],
            ['toko',          '🛒', 'Toko'],
            ['papanperingkat','🏆', 'Peringkat'],
            ['profile',       '👤', 'Profil'],
          ].map(([id, icon, label]) => {
            const active = (label === 'Zona' ? isZoneActive : id === currentScreen)
            return (
              <button type="button" key={label} className={active ? 'is-active' : ''} onClick={() => navigate(id)}>
                <span>{icon}</span><small>{label}</small>
              </button>
            )
          })}
        </nav>
      )}
      {/* App Switcher — ditampilkan sebagai floating bar di bawah, di atas bottom nav */}
      {user && onSwitchModule && (
        <div style={{
          position: 'fixed',
          bottom: showNav ? 88 : 14,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(7,19,33,0.90)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 14,
          padding: '4px 6px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}>
          <AppSwitcher activeModule={activeModule} onSwitch={handleSwitch} />
        </div>
      )}
    </>
  )
}
