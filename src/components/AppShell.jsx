import React, { useContext } from 'react'
import Sidebar from './Sidebar'
import { getGradeNumber } from '../kelasUtils'
import AudioPanel from './AudioPanel'
import AppSwitcher from './AppSwitcher'
import { UserAvatar, MessageNotificationBell, AppNotificationBell } from './shared'
import { PlayerContext } from '../PlayerContext'

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

// Safely reads coins/level from PlayerContext — only rendered when user is siswa
// and the component tree is guaranteed to be inside <PlayerProvider>.
function SiswaPlayerInfo() {
  const ctx = useContext(PlayerContext)
  if (!ctx) return null
  const { player } = ctx
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 2 }}>
      <span style={{
        fontSize: 9, color: '#FCD34D', fontWeight: 700,
        background: 'rgba(252,211,77,0.12)', borderRadius: 99, padding: '1px 5px',
      }}>🪙 {player.coins}</span>
      <span style={{
        fontSize: 9, color: '#34D399', fontWeight: 700,
        background: 'rgba(52,211,153,0.12)', borderRadius: 99, padding: '1px 5px',
      }}>⚡ Lv{player.level}</span>
    </div>
  )
}

/**
 * AppShell — wrapper yang menambahkan sidebar di kiri dan offset konten di kanan.
 * Di mobile juga menampilkan unified top header dan bottom navigation bar.
 * Props: { user, navigate, currentScreen, onLogout, onSwitchModule, children }
 */
export default function AppShell({ user, navigate, currentScreen, onLogout, onSwitchModule, onOpenApp, children }) {
  const isDesktop = useIsDesktop()
  const gradeNum = getGradeNumber(user?.kelas)
  const zoneId = gradeNum ? `grade${gradeNum}` : 'grade7'
  const isZoneActive = currentScreen === 'grade7' || currentScreen === 'grade8' || currentScreen === 'grade9'
  // Siswa-only bottom nav — never show for guru (guru has its own nav in GuruDashboardScreen)
  const showNav = !isDesktop && user?.role !== 'guru' && BOTTOM_NAV_SCREENS.has(currentScreen)
  const isMobileStudentHome = !isDesktop && currentScreen === 'home' && user?.role === 'siswa'
  const [isLandscapeHome, setIsLandscapeHome] = React.useState(() => (
    !isDesktop && currentScreen === 'home' && window.innerWidth > window.innerHeight && window.innerWidth >= 620
  ))

  React.useEffect(() => {
    const update = () => setIsLandscapeHome(
      !isDesktop && currentScreen === 'home' && window.innerWidth > window.innerHeight && window.innerWidth >= 620
    )
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [currentScreen, isDesktop])

  // ZonaDashboard adalah fullscreen — semua nav/chrome disembunyikan untuk siswa di home (semua device)
  const isZonaDashboard = currentScreen === 'home' && user?.role === 'siswa'

  const activeModule = currentScreen?.startsWith('blp-') ? 'blp'
    : currentScreen?.startsWith('eob5-') ? 'eob5'
    : 'tomat'

  const handleSwitch = (tab) => {
    onSwitchModule?.(tab.homeScreen)
  }

  // Warna aksen per modul untuk garis bawah header mobile
  const moduleAccent = activeModule === 'blp' ? '#10b981'
    : activeModule === 'eob5' ? '#f59e0b'
    : '#6366f1'
  const isImmersiveStudentHome = isMobileStudentHome || isZonaDashboard

  const isGuru = user?.role === 'guru'

  // Navigate to profile — guru uses custom event so GuruDashboardScreen can set view
  const goToProfile = () => {
    if (isGuru) {
      window.dispatchEvent(new CustomEvent('tomat:guru-nav', { detail: { key: 'profile' } }))
    } else {
      navigate('profile')
    }
  }

  // Navigate to komunikasi — guru uses internal tab key, siswa uses route
  const goToKomunikasi = () => {
    navigate(isGuru ? 'guruKomunikasi' : 'komunikasi')
  }

  // Kelas display for guru (kelas_diampu can be array)
  const guruKelas = isGuru
    ? (Array.isArray(user?.kelas) ? user.kelas.join(', ') : (user?.kelas || 'Guru'))
    : null

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
          .with-sidebar.with-module-header { padding-top: calc(100px + env(safe-area-inset-top, 0px)); }
        }
      `}</style>
      {/* Sidebar disembunyikan saat ZonaDashboard aktif — dashboard punya nav sendiri */}
      {!isZonaDashboard && (
        <Sidebar
          user={user}
          navigate={navigate}
          currentScreen={currentScreen}
          onLogout={onLogout}
        />
      )}
      {/* When showing BLP/EOB5 modules, the TOMAT sidebar is hidden but the
          CSS var still adds 220 px of margin-left. Override it to 0 so those
          modules' own sidebars fill the full viewport width. */}
      <div
        className={`with-sidebar${showNav && !isImmersiveStudentHome ? ' with-nav' : ''}${!isDesktop && onSwitchModule && !isImmersiveStudentHome ? ' with-module-header' : ''}${isLandscapeHome ? ' with-landscape-home' : ''}`}
        style={isDesktop && (activeModule !== 'tomat' || isZonaDashboard) ? { marginLeft: 0 } : undefined}
      >
        {children}
      </div>

      {/* Mobile: unified top header — SMARTISA banner + profile info + AppSwitcher + notifications */}
      {!isDesktop && user && onSwitchModule && !isImmersiveStudentHome && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 300,
          display: 'flex', flexDirection: 'column',
          background: 'rgba(7,19,33,0.97)',
          borderBottom: `2px solid ${moduleAccent}44`,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 1px 12px rgba(0,0,0,0.35)',
        }}>

          {/* Yellow SMARTISA banner — fills the safe-area notch zone */}
          <div style={{
            background: 'linear-gradient(90deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingLeft: 'calc(12px + env(safe-area-inset-left, 0px))',
            paddingRight: 'calc(12px + env(safe-area-inset-right, 0px))',
            paddingBottom: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 'calc(30px + env(safe-area-inset-top, 0px))',
          }}>
            <span style={{
              fontWeight: 900, fontSize: 13, letterSpacing: '0.18em',
              color: '#1C1917', textTransform: 'uppercase',
              fontFamily: 'system-ui, sans-serif',
              textShadow: '0 1px 0 rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              SMARTISA
              <span style={{ fontSize: 16 }}>⭐</span>
            </span>
          </div>

          {/* Action row — profile info + switcher + notifications */}
          <div style={{
            height: 56,
            display: 'flex', alignItems: 'center',
            gap: 6,
            paddingLeft: 'calc(10px + env(safe-area-inset-left, 0px))',
            paddingRight: 'calc(10px + env(safe-area-inset-right, 0px))',
          }}>

            {/* Left: avatar + user info — tappable → profile */}
            <button
              onClick={goToProfile}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                flex: 1, minWidth: 0,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 0', textAlign: 'left',
              }}
            >
              <UserAvatar user={user} size={34} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: 12, fontWeight: 800, color: '#fff',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}>
                  {user.name?.split(' ')[0]}
                </div>
                {isGuru ? (
                  <div style={{
                    fontSize: 9, color: '#A78BFA', fontWeight: 600,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginTop: 2, lineHeight: 1.2,
                  }}>
                    {guruKelas || 'Guru'}
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 9, color: '#67E8F9', fontWeight: 600, lineHeight: 1.2, marginTop: 2 }}>
                      {user.kelas}
                    </div>
                    <SiswaPlayerInfo />
                  </>
                )}
              </div>
            </button>

            {/* Center: App Switcher */}
            <div style={{ flexShrink: 0 }}>
              <AppSwitcher activeModule={activeModule} onSwitch={handleSwitch} onOpenApp={onOpenApp} />
            </div>

            {/* Right: notification bells + Mode Mengajar for guru */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <MessageNotificationBell onClick={goToKomunikasi} />
              <AppNotificationBell onCommunicationClick={goToKomunikasi} />
              {isGuru && (
                <button
                  onClick={() => navigate('guruMengajar')}
                  title="Mode Mengajar"
                  style={{
                    background: 'rgba(52,211,153,0.15)',
                    border: '1px solid rgba(52,211,153,0.3)',
                    color: '#34D399', borderRadius: 10,
                    width: 36, height: 36,
                    cursor: 'pointer', fontSize: 15,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >🎮</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile-only audio panel — desktop has it in the Sidebar */}
      {!isDesktop && !isImmersiveStudentHome && (
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

      {showNav && !isImmersiveStudentHome && (
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

      {/* Desktop: App Switcher — disembunyikan saat ZonaDashboard aktif */}
      {isDesktop && user && onSwitchModule && !isZonaDashboard && (
        <div style={{
          position: 'fixed',
          bottom: 14,
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
          <AppSwitcher activeModule={activeModule} onSwitch={handleSwitch} onOpenApp={onOpenApp} />
        </div>
      )}
    </>
  )
}
