import React, { useState, Component } from 'react'
import { PlayerProvider } from './PlayerContext'
import HomeScreen from './screens/HomeScreen'
import Grade7ZoneScreen from './screens/Grade7ZoneScreen'
import Grade8ZoneScreen from './screens/Grade8ZoneScreen'
import Grade9ZoneScreen from './screens/Grade9ZoneScreen'

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
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('Screen error:', error, info)
  }
  reset() {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }
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

const ROUTES = {
  home: HomeScreen,
  grade7: Grade7ZoneScreen,
  grade8: Grade8ZoneScreen,
  grade9: Grade9ZoneScreen,
  // BAB I: Bilangan Bulat
  termometer: TermometerGame,
  katak: KatakGame,
  pabrikrobot: PabrikRobotGame,
  sporajamur: SporaJamurGame,
  scanner: ScannerPermatGame,
  gembok: GembokRodaGigiGame,
  mercusuar: MercusaarGame,
  // BAB II: Bilangan Rasional
  kokipizza: KokiPizzaGame,
  pipaair: PipaAirGame,
  bortambang: BorTambangGame,
  kabataku: KeretaTambangGame,
  baterai: BateraiGame,
  timbanganemas: TimbanganEmasGame,
  fokusteleskop: FokusTeleskopGame,
  // BAB III: Rasio
  ramuanjus: RamuanJusGame,
  kasirsihir: KasirSihirGame,
  benteng: BentengPertahananGame,
  nakhoda: NakhodaGame,
  relkereta: RelKeretaGame,
  brankas: BrankasSandiGame,
}

export default function App() {
  const [history, setHistory] = useState(['home'])
  const current = history[history.length - 1]

  const navigate = (route) => setHistory(h => [...h, route])
  const goBack = () => setHistory(h => h.length > 1 ? h.slice(0, -1) : h)

  const Screen = ROUTES[current] || HomeScreen

  return (
    <PlayerProvider>
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
        <ErrorBoundary key={current} onReset={goBack}>
          <Screen navigate={navigate} goBack={goBack} />
        </ErrorBoundary>
      </div>
    </PlayerProvider>
  )
}
