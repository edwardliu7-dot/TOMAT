import React, { useState, useCallback, Component } from 'react'
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
import TaskOverlay from './components/TaskOverlay'

// BAB I: Bilangan Bulat
import TermometerGame from './minigames/TermometerGame'
import KatakGame from './minigames/SubmarineGame'
import PabrikRobotGame from './minigames/PabrikSenjataGame'
import SporaJamurGame from './minigames/JembatanGame'
import ScannerPermatGame from './minigames/SortirKargoGame'
import GembokRodaGigiGame from './minigames/GembokRodaGigiGame'
import MercusaarGame from './minigames/WormholeGame'

// BAB II: Bilangan Rasional
import KokiPizzaGame from './minigames/KokiPizzaGame'
import PipaAirGame from './minigames/LabKimiaGame'
import BorTambangGame from './minigames/BorTambangGame'
import KeretaTambangGame from './minigames/PemanahGame'
import BateraiGame from './minigames/ShieldGame'
import TimbanganEmasGame from './minigames/TimbanganEmasGame'
import FokusTeleskopGame from './minigames/FokusTeleskopGame'

// BAB III: Rasio
import RamuanJusGame from './minigames/RamuanJusGame'
import KasirSihirGame from './minigames/PasarBarterGame'
import BentengPertahananGame from './minigames/BentengPertahananGame'
import NakhodaGame from './minigames/ArsitekGame'
import RelKeretaGame from './minigames/RelKeretaGame'
import BrankasSandiGame from './minigames/HologramGame'

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

// All game routes that require mode selection before entry
const GAME_ROUTES = {
  termometer: { name: 'Termometer Penyelamat', emoji: '🌡️', Component: TermometerGame },
  katak: { name: 'Katak Pelompat Batu', emoji: '🐸', Component: KatakGame },
  pabrikrobot: { name: 'Pabrik Pasukan Robot', emoji: '🤖', Component: PabrikRobotGame },
  sporajamur: { name: 'Serangan Spora Jamur', emoji: '🍄', Component: SporaJamurGame },
  scanner: { name: 'Scanner Batu Permata', emoji: '💎', Component: ScannerPermatGame },
  gembok: { name: 'Gembok Roda Gigi', emoji: '⚙️', Component: GembokRodaGigiGame },
  mercusuar: { name: 'Sinyal Mercusuar', emoji: '🏮', Component: MercusaarGame },
  kokipizza: { name: 'Koki Pemotong Pizza', emoji: '🍕', Component: KokiPizzaGame },
  pipaair: { name: 'Teknisi Pipa Air', emoji: '🔧', Component: PipaAirGame },
  bortambang: { name: 'Bor Tambang Bumi', emoji: '⛏️', Component: BorTambangGame },
  kabataku: { name: 'Rute Kereta Tambang', emoji: '🚂', Component: KeretaTambangGame },
  baterai: { name: 'Baterai Pesawat Luar Angkasa', emoji: '🚀', Component: BateraiGame },
  timbanganemas: { name: 'Timbangan Emas Digital', emoji: '⚖️', Component: TimbanganEmasGame },
  fokusteleskop: { name: 'Fokus Teleskop Bintang', emoji: '🔭', Component: FokusTeleskopGame },
  ramuanjus: { name: 'Ramuan Jus Buah', emoji: '🧃', Component: RamuanJusGame },
  kasirsihir: { name: 'Kasir Toko Sihir', emoji: '🏪', Component: KasirSihirGame },
  benteng: { name: 'Pembangun Benteng Pertahanan', emoji: '🏰', Component: BentengPertahananGame },
  nakhoda: { name: 'Nakhoda Kapal Penjelajah', emoji: '⚓', Component: NakhodaGame },
  relkereta: { name: 'Menyusun Rel Kereta Cepat', emoji: '🚄', Component: RelKeretaGame },
  brankas: { name: 'Peretas Brankas Sandi', emoji: '🔐', Component: BrankasSandiGame },
}

const STATIC_ROUTES = { home: HomeScreen, grade7: Grade7ZoneScreen, grade8: Grade8ZoneScreen, grade9: Grade9ZoneScreen }

export default function App() {
  const { user, checking } = useAuth()
  const [history, setHistory] = useState(['home'])
  const [pendingGame, setPendingGame] = useState(null) // { key, name, emoji }
  const [lastGrade, setLastGrade] = useState(null)

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
  const handleModeSelected = useCallback((_mode, _taskId) => {
    replaceTop(pendingGame.key)
  }, [pendingGame, replaceTop])

  // Called by TaskContext when a task session is fully completed
  const handleTaskComplete = useCallback((gradeRecord) => {
    setLastGrade(gradeRecord)
    // Replace game route with result screen
    setHistory(h => [...h.slice(0, -1), 'taskresult'])
  }, [])

  // Navigate function for TaskResultScreen (doesn't go through mode-select)
  const navigateTo = useCallback((route) => {
    setHistory(h => [...h, route])
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

    if (GAME_ROUTES[current]) {
      const { Component } = GAME_ROUTES[current]
      return <Component navigate={navigate} goBack={goBack} />
    }

    const StaticScreen = STATIC_ROUTES[current] || HomeScreen
    return <StaticScreen navigate={navigate} goBack={goBack} />
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F1115', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
        Memuat…
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  if (user.role === 'guru') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
        <ErrorBoundary onReset={() => {}}>
          <GuruDashboardScreen />
        </ErrorBoundary>
      </div>
    )
  }

  return (
    <PlayerProvider>
      <TaskProvider onTaskComplete={handleTaskComplete}>
        <BabLockProvider>
          <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
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
