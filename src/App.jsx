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
import ProfileScreen from './screens/ProfileScreen'
import ShopScreen from './screens/ShopScreen'
import LeaderboardScreen from './screens/LeaderboardScreen'
import BadgesScreen from './screens/BadgesScreen'
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

// Grade 8: BAB I Bilangan Berpangkat
import G8SelRamuanGame from './minigames/G8SelRamuanGame'
import G8RacunMiniaturGame from './minigames/G8RacunMiniaturGame'
import G8KristalGame from './minigames/G8KristalGame'
import G8FusiEnergiGame from './minigames/G8FusiEnergiGame'
import G8MantraAkarGame from './minigames/G8MantraAkarGame'
import G8GeologGame from './minigames/G8GeologGame'

// Grade 8: BAB II Teorema Pythagoras
import G8TrebuchetGame from './minigames/G8TrebuchetGame'
import G8PerisaiGame from './minigames/G8PerisaiGame'
import G8HartaKarunGame from './minigames/G8HartaKarunGame'
import G8InspeksiSudutGame from './minigames/G8InspeksiSudutGame'
import G8PetaRadarGame from './minigames/G8PetaRadarGame'
import G8TaliGantungGame from './minigames/G8TaliGantungGame'

// Grade 8: BAB III Persamaan & Pertidaksamaan Linear Satu Variabel
import G8GerbangLogikaGame from './minigames/G8GerbangLogikaGame'
import G8KatrolGame from './minigames/G8KatrolGame'
import G8GulunganGame from './minigames/G8GulunganGame'
import G8KeretaKudaGame from './minigames/G8KeretaKudaGame'

// Grade 9: BAB I Sistem Persamaan Linear Dua Variabel
import G9ManifestGame from './minigames/G9ManifestGame'
import G9PlotRuteGame from './minigames/G9PlotRuteGame'
import G9InterseksiGame from './minigames/G9InterseksiGame'
import G9KonsolGame from './minigames/G9KonsolGame'
import G9PasarGalaksiGame from './minigames/G9PasarGalaksiGame'

// Grade 9: BAB II Lingkaran
import G9KalibrasiRadaGame from './minigames/G9KalibrasiRadaGame'
import G9OrbitGame from './minigames/G9OrbitGame'
import G9ShieldGayaGame from './minigames/G9ShieldGayaGame'
import G9LaserJuringGame from './minigames/G9LaserJuringGame'
import G9AsteroidGame from './minigames/G9AsteroidGame'

// Grade 9: BAB III Bangun Ruang
import G9BoksBateraiGame from './minigames/G9BoksBateraiGame'
import G9RefraktorGame from './minigames/G9RefraktorGame'
import G9KuilAlienGame from './minigames/G9KuilAlienGame'
import G9ReaktorBahanGame from './minigames/G9ReaktorBahanGame'
import G9SinyalKerucutGame from './minigames/G9SinyalKerucutGame'
import G9BintangGame from './minigames/G9BintangGame'
import G9UpgradeKapalGame from './minigames/G9UpgradeKapalGame'

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

  g8tameng: { name: 'Formasi Pasukan Tameng', emoji: '🛡️', Component: G8TamengGame },
  g8bunga: { name: 'Teka-teki Hutan Bunga', emoji: '🌸', Component: G8BungaGame },
  g8jembatanbatu: { name: 'Jembatan Batu Ajaib', emoji: '🌉', Component: G8JembatanBatuGame },
  g8ramalan: { name: 'Ramalan Penyihir Agung', emoji: '🔮', Component: G8RamalanGame },
  g8dungeon: { name: 'Sandi Pintu Dungeon', emoji: '🗝️', Component: G8DungeonGame },
  g8radar: { name: 'Radar Naga Pengintai', emoji: '🐉', Component: G8RadarNagaGame },
  g8makcomblang: { name: 'Makcomblang Desa', emoji: '💘', Component: G8MakcomblangGame },
  g8gerbang: { name: 'Gerbang Seleksi Sihir', emoji: '🚪', Component: G8GerbangSihirGame },
  g8pandaibesi: { name: 'Pabrik Senjata Pandai Besi', emoji: '🔨', Component: G8PandaiBesiGame },
  g8menara: { name: 'Kombinasi Kunci Menara', emoji: '🗼', Component: G8MenaraGame },
  g8dansa: { name: 'Pesta Dansa Kerajaan', emoji: '💃', Component: G8DansaGame },
  g8petakerajaan: { name: 'Ahli Peta Kerajaan', emoji: '🗺️', Component: G8PetaKerajaanGame },
  g8balista: { name: 'Pemanah Balista', emoji: '🏹', Component: G8BalistaGame },
  g8bukitnaga: { name: 'Mendaki Bukit Naga', emoji: '🐲', Component: G8BukitNagaGame },
  g8tembokbenteng: { name: 'Rancangan Tembok Benteng', emoji: '🧱', Component: G8TembokBentengGame },
  g8logistik: { name: 'Jalur Suplai Logistik', emoji: '🚚', Component: G8LogistikGame },
  g8pertahananberlapis: { name: 'Sistem Pertahanan Berlapis', emoji: '🛡️', Component: G8PertahananBerlapisGame },
  g8timbangan: { name: 'Timbangan Emas dan Perak', emoji: '⚖️', Component: G8TimbanganGame },
  g8pedagangmisterius: { name: 'Pedagang Misterius', emoji: '🧪', Component: G8PedagangMisteriusGame },
  g8penyelamatan: { name: 'Misi Penyelamatan Ganda', emoji: '🆘', Component: G8PenyelamatanGame },
  g8taktikperang: { name: 'Ahli Taktik Perang', emoji: '♟️', Component: G8TaktikPerangGame },
  g8pasarbarter: { name: 'Pasar Barter Ksatria', emoji: '🛒', Component: G8PasarBarterKsatriaGame },

  g9kargo: { name: 'Sortir Kargo Pesawat', emoji: '📦', Component: G9KargoGame },
  g9reaktor: { name: 'Transfer Energi Reaktor', emoji: '⚡', Component: G9ReaktorGame },
  g9lambungkapal: { name: 'Perluasan Lambung Kapal', emoji: '🚀', Component: G9LambungKapalGame },
  g9sinyalalien: { name: 'Dekripsi Sinyal Alien', emoji: '📡', Component: G9SinyalAlienGame },
  g9pipaoksigen: { name: 'Kalibrasi Pipa Oksigen', emoji: '🫁', Component: G9PipaOksigenGame },
  g9perdagangangalaksi: { name: 'Misi Perdagangan Galaksi', emoji: '👽', Component: G9PerdagangGalaksiGame },
  g9mikroskop: { name: 'Mikroskop Sub-Atomik', emoji: '🔬', Component: G9MikroskopGame },
  g9wormhole: { name: 'Generator Lubang Cacing', emoji: '🌀', Component: G9WormholeGame },
  g9tahuncahaya: { name: 'Navigasi Tahun Cahaya', emoji: '🌌', Component: G9TahunCahayaGame },
  g9cetakbiru: { name: 'Cetak Biru Hologram', emoji: '🧊', Component: G9CetakBiruGame },
  g9bayanganmenara: { name: 'Bayangan Menara Alien', emoji: '🗽', Component: G9BayanganMenaraGame },
  g9panelsurya: { name: 'Perakitan Panel Surya Satelit', emoji: '🛰️', Component: G9PanelSuryaGame },
  g9medangaya: { name: 'Medan Gaya Pelindung', emoji: '🛡️', Component: G9MedanGayaGame },
  g9sektorpemindai: { name: 'Sektor Pemindai', emoji: '📡', Component: G9SektorPemindaiGame },
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
      return <Component navigate={navigate} goBack={goBack} difficulty={difficulty} survival={survival} />
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
