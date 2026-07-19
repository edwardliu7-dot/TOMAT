import React, { useState, useCallback, Component, Suspense, useEffect } from 'react'
import { PlayerProvider } from './PlayerContext'
import { TaskProvider } from './TaskContext'
import { BabLockProvider } from './BabLockContext'
import { useAuth } from './AuthContext'
import LoginScreen from './screens/LoginScreen'
import GuruDashboardScreen from './screens/GuruDashboardScreen'
import HomeScreen from './screens/HomeScreen'
import Grade7ZoneScreen from './screens/Grade7ZoneScreen'
import Grade8ZoneScreen from './screens/Grade8ZoneScreen'
import Grade9ZoneScreen from './screens/Grade9ZoneScreen'
import ModeSelectScreen from './screens/ModeSelectScreen'
import TaskResultScreen from './screens/TaskResultScreen'
import GradesScreen from './screens/GradesScreen'
import ProfileScreen from './screens/ProfileScreen'
import ShopScreen from './screens/ShopScreen'
import LeaderboardScreen from './screens/LeaderboardScreen'
import BadgesScreen from './screens/BadgesScreen'
import TaskOverlay from './components/TaskOverlay'

// All game components are lazy-loaded on first navigation to keep initial bundle small

// Shown while a lazy game chunk is downloading (typically <0.5s on wifi)
function GameLoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0F1115',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{ fontSize: 40 }}>⚔️</div>
      <div style={{ color: '#6366F1', fontSize: 15, fontWeight: 700 }}>Memuat misi…</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i === 0 ? '#6366F1' : i === 1 ? '#A78BFA' : '#C4B5FD',
            animation: 'bounce 1s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }} />
        ))}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  )
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  componentDidCatch(error, info) { console.error('Screen error:', error, info) }
  reset() { this.setState({ hasError: false, error: null }); this.props.onReset?.() }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#0A2647', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <div style={{ color: '#f87171', fontSize: 18, fontWeight: 700, textAlign: 'center' }}>Oops! Terjadi error.</div>
          <div style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', maxWidth: 320 }}>{String(this.state.error)}</div>
          <button onClick={() => this.reset()} style={{ marginTop: 8, background: '#6366F1', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            ← Kembali ke Menu
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Lazy-load all game components — each is fetched only when the student first opens that game
const GAME_ROUTES = {
  termometer:         { name: 'Termometer Penyelamat',          emoji: '🌡️', Component: React.lazy(() => import('./minigames/TermometerGame')) },
  katak:              { name: 'Katak Pelompat Batu',            emoji: '🐸', Component: React.lazy(() => import('./minigames/SubmarineGame')) },
  pabrikrobot:        { name: 'Pabrik Pasukan Robot',           emoji: '🤖', Component: React.lazy(() => import('./minigames/PabrikSenjataGame')) },
  sporajamur:         { name: 'Serangan Spora Jamur',           emoji: '🍄', Component: React.lazy(() => import('./minigames/JembatanGame')) },
  scanner:            { name: 'Scanner Batu Permata',           emoji: '💎', Component: React.lazy(() => import('./minigames/SortirKargoGame')) },
  gembok:             { name: 'Gembok Roda Gigi',               emoji: '⚙️', Component: React.lazy(() => import('./minigames/GembokRodaGigiGame')) },
  mercusuar:          { name: 'Sinyal Mercusuar',               emoji: '🏮', Component: React.lazy(() => import('./minigames/WormholeGame')) },
  kokipizza:          { name: 'Koki Pemotong Pizza',            emoji: '🍕', Component: React.lazy(() => import('./minigames/KokiPizzaGame')) },
  pipaair:            { name: 'Teknisi Pipa Air',               emoji: '🔧', Component: React.lazy(() => import('./minigames/LabKimiaGame')) },
  bortambang:         { name: 'Bor Tambang Bumi',               emoji: '⛏️', Component: React.lazy(() => import('./minigames/BorTambangGame')) },
  kabataku:           { name: 'Rute Kereta Tambang',            emoji: '🚂', Component: React.lazy(() => import('./minigames/PemanahGame')) },
  baterai:            { name: 'Baterai Pesawat Luar Angkasa',   emoji: '🚀', Component: React.lazy(() => import('./minigames/ShieldGame')) },
  timbanganemas:      { name: 'Timbangan Emas Digital',         emoji: '⚖️', Component: React.lazy(() => import('./minigames/TimbanganEmasGame')) },
  fokusteleskop:      { name: 'Fokus Teleskop Bintang',         emoji: '🔭', Component: React.lazy(() => import('./minigames/FokusTeleskopGame')) },
  ramuanjus:          { name: 'Ramuan Jus Buah',                emoji: '🧃', Component: React.lazy(() => import('./minigames/RamuanJusGame')) },
  kasirsihir:         { name: 'Kasir Toko Sihir',               emoji: '🏪', Component: React.lazy(() => import('./minigames/PasarBarterGame')) },
  benteng:            { name: 'Pembangun Benteng Pertahanan',   emoji: '🏰', Component: React.lazy(() => import('./minigames/BentengPertahananGame')) },
  nakhoda:            { name: 'Nakhoda Kapal Penjelajah',       emoji: '⚓', Component: React.lazy(() => import('./minigames/ArsitekGame')) },
  relkereta:          { name: 'Menyusun Rel Kereta Cepat',      emoji: '🚄', Component: React.lazy(() => import('./minigames/RelKeretaGame')) },
  brankas:            { name: 'Peretas Brankas Sandi',          emoji: '🔐', Component: React.lazy(() => import('./minigames/HologramGame')) },
  // Grade 8
  g8selramuan:        { name: 'Penggandaan Sel Ramuan',         emoji: '🧪', Component: React.lazy(() => import('./minigames/G8SelRamuanGame')) },
  g8racunminiatur:    { name: 'Ekstraksi Racun Miniatur',       emoji: '☠️', Component: React.lazy(() => import('./minigames/G8RacunMiniaturGame')) },
  g8kristal:          { name: 'Pemisahan Elemen Kristal',       emoji: '💎', Component: React.lazy(() => import('./minigames/G8KristalGame')) },
  g8fusienergi:       { name: 'Fusi Energi Alkemis',           emoji: '⚗️', Component: React.lazy(() => import('./minigames/G8FusiEnergiGame')) },
  g8mantraakar:       { name: 'Penyederhanaan Mantra Akar',    emoji: '✨', Component: React.lazy(() => import('./minigames/G8MantraAkarGame')) },
  g8geolog:           { name: 'Ekspedisi Geolog Kerajaan',      emoji: '⛏️', Component: React.lazy(() => import('./minigames/G8GeologGame')) },
  g8trebuchet:        { name: 'Bidikan Tepat Trebuchet',        emoji: '⚔️', Component: React.lazy(() => import('./minigames/G8TrebuchetGame')) },
  g8perisai:          { name: 'Restorasi Perisai Kerajaan',     emoji: '🛡️', Component: React.lazy(() => import('./minigames/G8PerisaiGame')) },
  g8hartakarun:       { name: 'Harta Karun di Sudut Ruangan',  emoji: '💰', Component: React.lazy(() => import('./minigames/G8HartaKarunGame')) },
  g8inspeksisudut:    { name: 'Inspeksi Sudut Menara',         emoji: '🗼', Component: React.lazy(() => import('./minigames/G8InspeksiSudutGame')) },
  g8petaradar:        { name: 'Peta Radar Pengintai',          emoji: '📡', Component: React.lazy(() => import('./minigames/G8PetaRadarGame')) },
  g8taligantung:      { name: 'Misi Penyelamatan Tali Gantung',emoji: '🪢', Component: React.lazy(() => import('./minigames/G8TaliGantungGame')) },
  g8gerbanglogika:    { name: 'Teka-Teki Gerbang Logika',      emoji: '🚪', Component: React.lazy(() => import('./minigames/G8GerbangLogikaGame')) },
  g8katrol:           { name: 'Katrol Penyeimbang Jembatan',   emoji: '⚙️', Component: React.lazy(() => import('./minigames/G8KatrolGame')) },
  g8gulungan:         { name: 'Penerjemah Gulungan Kuno',      emoji: '📜', Component: React.lazy(() => import('./minigames/G8GulunganGame')) },
  g8keretakuda:       { name: 'Kapasitas Kereta Kuda',         emoji: '🐴', Component: React.lazy(() => import('./minigames/G8KeretaKudaGame')) },
  // Grade 9
  g9manifest:         { name: 'Manifest Kargo Alien',         emoji: '📦', Component: React.lazy(() => import('./minigames/G9ManifestGame')) },
  g9plotrute:         { name: 'Plotting Rute Grafik',         emoji: '🗺️', Component: React.lazy(() => import('./minigames/G9PlotRuteGame')) },
  g9interseksi:       { name: 'Interseksi Radar Sinyal',      emoji: '📡', Component: React.lazy(() => import('./minigames/G9InterseksiGame')) },
  g9konsol:           { name: 'Dekripsi Konsol Komputer',     emoji: '💻', Component: React.lazy(() => import('./minigames/G9KonsolGame')) },
  g9pasargalaksi:     { name: 'Barter Di Pasar Galaksi',      emoji: '👽', Component: React.lazy(() => import('./minigames/G9PasarGalaksiGame')) },
  g9kalibrasirada:    { name: 'Kalibrasi Jangkauan Radar',    emoji: '🎯', Component: React.lazy(() => import('./minigames/G9KalibrasiRadaGame')) },
  g9orbit:            { name: 'Kalkulasi Orbit Satelit',      emoji: '🛰️', Component: React.lazy(() => import('./minigames/G9OrbitGame')) },
  g9shieldgaya:       { name: 'Medan Gaya Shield Pelindung',  emoji: '🛡️', Component: React.lazy(() => import('./minigames/G9ShieldGayaGame')) },
  g9laserjuring:      { name: 'Tembakan Laser Sektor',        emoji: '⚡', Component: React.lazy(() => import('./minigames/G9LaserJuringGame')) },
  g9asteroid:         { name: 'Jalur Pintas Sabuk Asteroid',  emoji: '☄️', Component: React.lazy(() => import('./minigames/G9AsteroidGame')) },
  g9boksbaterai:      { name: 'Optimalisasi Boks Baterai',    emoji: '🔋', Component: React.lazy(() => import('./minigames/G9BoksBateraiGame')) },
  g9refraktor:        { name: 'Refraktor Kristal Energi',     emoji: '💎', Component: React.lazy(() => import('./minigames/G9RefraktorGame')) },
  g9kuilalien:        { name: 'Eksplorasi Kuil Alien',        emoji: '🏛️', Component: React.lazy(() => import('./minigames/G9KuilAlienGame')) },
  g9reaktorbahan:     { name: 'Pengisian Reaktor Bahan Bakar',emoji: '⚛️', Component: React.lazy(() => import('./minigames/G9ReaktorBahanGame')) },
  g9sinyalkerucut:    { name: 'Zona Pancaran Sinyal',         emoji: '📡', Component: React.lazy(() => import('./minigames/G9SinyalKerucutGame')) },
  g9bintang:          { name: 'Kompresi Inti Bintang',        emoji: '⭐', Component: React.lazy(() => import('./minigames/G9BintangGame')) },
  g9upgradekapal:     { name: 'Upgrade Kapal Induk',          emoji: '🚀', Component: React.lazy(() => import('./minigames/G9UpgradeKapalGame')) },
}

const STATIC_ROUTES = { home: HomeScreen, grade7: Grade7ZoneScreen, grade8: Grade8ZoneScreen, grade9: Grade9ZoneScreen }

// Shared game-playing shell. Used for students (normal play with tasks/nilai) and for
// teachers in "Mode Mengajar" (free-play only, used as a teaching aid in class).
function PlayerExperience({ guruMode = false, onExitGuruMode }) {
  const [history, setHistory] = useState(['home'])
  const [pendingGame, setPendingGame] = useState(null) // { key, name, emoji }
  const [lastGrade, setLastGrade] = useState(null)
  const [gameConfig, setGameConfig] = useState(null) // { difficulty } or { survival: true }

  const current = history[history.length - 1]

  // Push a new route onto the stack
  const navigate = useCallback((route) => {
    if (GAME_ROUTES[route]) {
      // Intercept: show mode select before any game
      setPendingGame({ key: route, ...GAME_ROUTES[route] })
      setHistory(h => [...h, 'modeselect'])
    } else {
      setHistory(h => [...h, route])
    }
  }, [])

  const goBack = useCallback(() => {
    setHistory(h => h.length > 1 ? h.slice(0, -1) : h)
  }, [])

  // Replace the top of the history stack (used when transitioning from modeselect → game)
  const replaceTop = useCallback((route) => {
    setHistory(h => [...h.slice(0, -1), route])
  }, [])

  // Called by ModeSelectScreen when user picks a mode.
  // startTaskSession is called inside ModeSelectScreen (within TaskProvider tree) before this.
  const handleModeSelected = useCallback((_mode, _taskId, config) => {
    setGameConfig(config || null)
    replaceTop(pendingGame.key)
  }, [pendingGame, replaceTop])

  // Called by TaskContext when a task session is fully completed
  const handleTaskComplete = useCallback((gradeRecord) => {
    setLastGrade(gradeRecord)
    // Replace game route with result screen
    setHistory(h => [...h.slice(0, -1), 'taskresult'])
  }, [])

  // Navigate function for TaskResultScreen (doesn't go through mode-select).
  // Resets the stack instead of pushing, since taskresult is a terminal screen —
  // leaving it stacked underneath would make the back button loop through
  // stale result/mode-select screens instead of reaching the dashboard.
  const navigateTo = useCallback((route) => {
    setHistory(route === 'home' ? ['home'] : ['home', route])
  }, [])

  // Render the current screen
  const renderScreen = () => {
    if (current === 'modeselect') {
      return (
        <ModeSelectScreen
          navigate={navigate}
          goBack={goBack}
          pendingGame={pendingGame}
          onModeSelected={handleModeSelected}
        />
      )
    }

    if (current === 'taskresult') {
      return (
        <TaskResultScreen
          goBack={goBack}
          grade={lastGrade}
          navigateTo={navigateTo}
        />
      )
    }

    if (current === 'grades') {
      return <GradesScreen goBack={goBack} navigate={navigate} />
    }

    if (current === 'profile') {
      return <ProfileScreen goBack={goBack} />
    }

    if (current === 'toko') {
      return <ShopScreen goBack={goBack} />
    }

    if (current === 'papanperingkat') {
      return <LeaderboardScreen goBack={goBack} />
    }

    if (current === 'lencana') {
      return <BadgesScreen goBack={goBack} />
    }

    if (GAME_ROUTES[current]) {
      const { Component } = GAME_ROUTES[current]
      const difficulty = gameConfig?.difficulty || 'medium'
      const survival = !!gameConfig?.survival
      return (
        <Suspense fallback={<GameLoadingFallback />}>
          <Component navigate={navigate} goBack={goBack} difficulty={difficulty} survival={survival} />
        </Suspense>
      )
    }

    if (current === 'home') {
      return <HomeScreen navigate={navigate} goBack={goBack} guruMode={guruMode} onExitGuruMode={onExitGuruMode} />
    }

    const StaticScreen = STATIC_ROUTES[current] || HomeScreen
    return <StaticScreen navigate={navigate} goBack={goBack} />
  }

  return (
    <PlayerProvider>
      <TaskProvider onTaskComplete={handleTaskComplete}>
        <BabLockProvider>
          <div style={{ maxWidth: 'var(--shell-max)', margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
            <ErrorBoundary key={current} onReset={goBack}>
              {renderScreen()}
            </ErrorBoundary>
            {/* Floating task progress strip — shown during any task session */}
            <TaskOverlay />
          </div>
        </BabLockProvider>
      </TaskProvider>
    </PlayerProvider>
  )
}

export default function App() {
  const { user, checking } = useAuth()
  const [guruPracticeMode, setGuruPracticeMode] = useState(false)

  // Hide the inline HTML splash once React has mounted and auth check is done
  useEffect(() => {
    if (!checking) {
      window.__hideSplash?.()
    }
  }, [checking])

  if (checking) {
    // Splash is still visible — render nothing so there's no flash
    return null
  }

  if (!user) {
    return <LoginScreen />
  }

  if (user.role === 'guru') {
    if (guruPracticeMode) {
      return (
        <div style={{ maxWidth: 'var(--shell-max)', margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
          <ErrorBoundary onReset={() => setGuruPracticeMode(false)}>
            <PlayerExperience guruMode onExitGuruMode={() => setGuruPracticeMode(false)} />
          </ErrorBoundary>
        </div>
      )
    }
    return (
      <div style={{ maxWidth: 'var(--shell-max-wide)', margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
        <ErrorBoundary onReset={() => {}}>
          <GuruDashboardScreen onPlayGames={() => setGuruPracticeMode(true)} />
        </ErrorBoundary>
      </div>
    )
  }

  return <PlayerExperience />
}
