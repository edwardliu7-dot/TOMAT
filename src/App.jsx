import React, { useState, useCallback, Component, Suspense, useEffect } from 'react'
import { PetProvider } from './PetContext'
import FloatingPet from './components/FloatingPet'
import { PlayerProvider } from './PlayerContext'
import { TaskProvider, useTask } from './TaskContext'
import { BabLockProvider } from './BabLockContext'
import { useAuth } from './AuthContext'
import AppShell from './components/AppShell'
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
import CommunicationScreen from './screens/CommunicationScreen'
import LobbyScreen from './screens/LobbyScreen'
import DuelKatakScreen from './screens/DuelKatakScreen'
import BossRaidScreen from './screens/BossRaidScreen'
import TournamentMatchScreen from './screens/TournamentMatchScreen'
import TournamentWaitScreen from './screens/TournamentWaitScreen'
import TournamentNotificationBanner from './components/TournamentNotificationBanner'
import PublicProfileScreen from './screens/PublicProfileScreen'
import DuelInviteBanner from './components/DuelInviteBanner'
import { connectSocket } from './socket'
import { DUEL_GAME_KEYS } from './gamesCatalog'
import { useAppUpdateCheck } from './hooks/useAppUpdateCheck'
import UpdateRequiredScreen from './screens/UpdateRequiredScreen'
import WhatsNewModal, { useWhatsNew } from './components/WhatsNewModal'

const DUEL_INVITE_GAMES = [
  { key: 'katak',       emoji: '🐸', name: 'Katak Pelompat' },
  { key: 'termometer',  emoji: '🌡️', name: 'Termometer' },
  { key: 'pabrikrobot', emoji: '🤖', name: 'Pabrik Robot' },
  { key: 'gembok',      emoji: '⚙️', name: 'Gembok FPB' },
  { key: 'mercusuar',   emoji: '🏮', name: 'Mercusuar KPK' },
  { key: 'scanner',     emoji: '💎', name: 'Scanner Prima' },
]

// Toast shown when a tugas submission fails (pet dead, network error, etc.)
// so students know their grade was not saved and can act accordingly.
function SubmitErrorToast() {
  const { submitError, clearSubmitError } = useTask()
  if (!submitError) return null
  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 10002, maxWidth: 380, width: 'calc(100% - 32px)',
      background: 'rgba(30,10,10,0.97)', border: '1.5px solid #ef4444',
      borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(239,68,68,0.25)',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>⚠️</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#f87171', marginBottom: 3 }}>Tugas Gagal Tersimpan</div>
        <div style={{ fontSize: 12, color: '#FCA5A5', lineHeight: 1.5 }}>{submitError}</div>
        <button onClick={clearSubmitError} style={{
          marginTop: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444',
          borderRadius: 8, padding: '6px 14px', color: '#f87171', fontSize: 12,
          fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>Tutup</button>
      </div>
    </div>
  )
}

function DuelGamePickerModal({ target, onPick, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 24px',
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'linear-gradient(135deg,#0e1a2e,#0d1f3c)',
        border: '2px solid rgba(99,102,241,0.55)',
        borderRadius: 24, padding: '24px 20px 20px',
        boxShadow: '0 0 60px rgba(99,102,241,0.25)',
      }}>
        <div style={{ fontSize: 11, color: '#818CF8', fontWeight: 800, letterSpacing: 1.5, marginBottom: 4 }}>PILIH GAME DUEL</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Ajak {target.name}</div>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 18 }}>Pilih game yang akan dimainkan dalam duel ini</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 16 }}>
          {DUEL_INVITE_GAMES.map(g => (
            <button key={g.key} onClick={() => onPick(g.key)} style={{
              background: 'rgba(99,102,241,0.08)', border: '1.5px solid rgba(99,102,241,0.25)',
              borderRadius: 14, padding: '14px 10px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)' }}
            >
              <span style={{ fontSize: 28 }}>{g.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#C4B5FD', textAlign: 'center', lineHeight: 1.3 }}>{g.name}</span>
            </button>
          ))}
        </div>

        <button onClick={onCancel} style={{
          width: '100%', background: 'transparent', border: 'none',
          color: '#475569', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: '8px',
        }}>
          Batal
        </button>
      </div>
    </div>
  )
}
import GameDesktopWrapper from './components/GameDesktopWrapper'
import { fetchPublicProfile, normalizeProfileTarget } from './components/shared'
import { getGameTheme, GameThemeOverlay, getInverseFilter } from './gameTheme'

// Auth-aware wrappers — need useAuth inside the PlayerProvider/AuthContext tree
function TournamentMatchWithAuth({ matchData, goBack, onMatchOver }) {
  const { user } = useAuth()
  return (
    <TournamentMatchScreen
      tournamentId={matchData.tournamentId}
      matchId={matchData.matchId}
      opponent={matchData.opponent}
      gameKey={matchData.gameKey}
      round={matchData.round}
      myUserId={user?.id}
      myName={user?.name}
      goBack={goBack}
      onMatchOver={onMatchOver}
    />
  )
}

function TournamentWaitWithAuth({ tournamentId, goBack }) {
  const { user } = useAuth()
  return (
    <TournamentWaitScreen
      tournamentId={tournamentId}
      myUserId={user?.id}
      myName={user?.name}
      goBack={goBack}
    />
  )
}

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

const STATIC_ROUTES = { home: HomeScreen, grade7: Grade7ZoneScreen, grade8: Grade8ZoneScreen, grade9: Grade9ZoneScreen, komunikasi: CommunicationScreen }

const SCREEN_TITLES = {
  home: 'Beranda',
  grade7: 'Zona Kelas 7',
  grade8: 'Zona Kelas 8',
  grade9: 'Zona Kelas 9',
  toko: 'Toko',
  papanperingkat: 'Papan Peringkat',
  lencana: 'Lencana',
  grades: 'Nilai & Tugas',
  komunikasi: 'Chat',
  profile: 'Profil',
  modeselect: 'Pilih Mode',
  'duel-lobby': 'Duel Lobby',
  'boss-raid': 'Boss Raid',
  'tournament-wait': 'Turnamen',
}

// Shared game-playing shell. Used for students (normal play with tasks/nilai) and for
// teachers in "Mode Mengajar" (free-play only, used as a teaching aid in class).
function PlayerExperience({ guruMode = false, onExitGuruMode }) {
  const { user, logout } = useAuth()

  // Apply the equipped tema CSS filter to the whole page whenever it changes
  useEffect(() => {
    const theme = getGameTheme(user?.equippedTema)
    document.documentElement.style.filter = theme?.filter || ''
    return () => { document.documentElement.style.filter = '' }
  }, [user?.equippedTema])

  // Compute the inverse filter so image elements can counteract the global filter
  const inverseFilter = getInverseFilter(user?.equippedTema)

  const [history, setHistory] = useState(['home'])
  const [pendingGame, setPendingGame] = useState(null) // { key, name, emoji }
  const [pendingTaskId, setPendingTaskId] = useState(null)
  const [lastGrade, setLastGrade] = useState(null)
  const [gameConfig, setGameConfig] = useState(null) // { difficulty } or { survival: true }

  const current = history[history.length - 1]

  const [komunikasiTarget, setKomunikasiTarget]     = useState(null)
  const [duelState, setDuelState]                   = useState(null) // { code, myIndex, question, round, maxRounds, scores }
  const [tournamentMatchData, setTournamentMatchData] = useState(null)  // from tournament:your-match
  const [tournamentBanner,    setTournamentBanner]    = useState(null)  // show notification banner
  const [activeTournamentId,  setActiveTournamentId]  = useState(null)  // when we are spectating bracket
  const [publicProfileData, setPublicProfileData]   = useState(null)   // { ...profile }
  const [publicProfileError, setPublicProfileError] = useState('')
  const [duelInvite, setDuelInvite]                 = useState(null)   // { code, gameKey, from: { userId, name } }
  const [duelInviteCode, setDuelInviteCode]         = useState(null)   // auto-join code for LobbyScreen
  const [tokoInitialTab, setTokoInitialTab]         = useState(null)   // pre-select shop tab on open
  const [duelInvitePending, setDuelInvitePending]   = useState(null)   // { id, role, name } — waiting for game pick

  const { open: whatsNewOpen, dismiss: dismissWhatsNew } = useWhatsNew()

  // Update browser tab title whenever the active screen changes
  useEffect(() => {
    const gameRoute = GAME_ROUTES[current]
    if (gameRoute) {
      document.title = `${gameRoute.emoji} ${gameRoute.name} — TOMAT`
    } else {
      const label = SCREEN_TITLES[current]
      document.title = label ? `${label} — TOMAT` : 'TOMAT — Tantangan Otak Matematika'
    }
  }, [current])

  // ── Navigation helpers — defined before any useEffect so they are never in
  //    the Temporal Dead Zone when referenced in dependency arrays. ──────────
  // Push a new route onto the stack
  const navigate = useCallback((route, options = {}) => {
    if (GAME_ROUTES[route]) {
      // Intercept: show mode select before any game
      setPendingGame({ key: route, ...GAME_ROUTES[route] })
      setPendingTaskId(options.taskId || null)
      setHistory(h => [...h, 'modeselect'])
    } else {
      setPendingTaskId(null)
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

  useEffect(() => {
    const openCommunication = e => {
      setKomunikasiTarget(e?.detail || null)
      setHistory(h => h.includes('komunikasi') ? h : [...h, 'komunikasi'])
    }
    window.addEventListener('tomat:open-komunikasi', openCommunication)
    return () => window.removeEventListener('tomat:open-komunikasi', openCommunication)
  }, [])

  useEffect(() => {
    const onVisitProfile = async e => {
      let target
      try { target = normalizeProfileTarget(e.detail) } catch { return }
      setPublicProfileError('')
      try {
        setPublicProfileData(target.photoUrl !== undefined || target.bio !== undefined
          ? target
          : await fetchPublicProfile(target))
      } catch (error) {
        setPublicProfileData({ id: target.id, role: target.role, name: target.name || 'Pengguna', profileError: error.message || 'Gagal memuat profil.' })
      }
      setHistory(h => [...h, 'public-profile'])
    }
    const onInviteDuel = e => {
      const target = e.detail
      if (!target?.id) return
      setDuelInvitePending({ id: target.id, role: target.role || 'siswa', name: target.name || 'Siswa' })
    }
    window.addEventListener('tomat:visit-profile', onVisitProfile)
    window.addEventListener('tomat:invite-duel', onInviteDuel)
    return () => {
      window.removeEventListener('tomat:visit-profile', onVisitProfile)
      window.removeEventListener('tomat:invite-duel', onInviteDuel)
    }
  }, [navigate])

  // Tournament: connect socket and listen for match notifications
  useEffect(() => {
    if (guruMode) return  // guru tidak perlu socket di mode practice
    const socket = connectSocket()

    // Server mengirim notifikasi match
    socket.on('tournament:your-match', (data) => {
      setTournamentMatchData(data)
      setTournamentBanner(data)
    })

    // Turnamen selesai (broadcast ke kelas)
    socket.on('tournament:finished', () => {
      // Jika sedang di tournament-wait, setTournamentBanner cukup; bracket update via socket di screen
    })

    // Turnamen baru dimulai oleh guru
    socket.on('tournament:started', ({ tournamentId }) => {
      setActiveTournamentId(tournamentId)
    })

    socket.on('tournament:cancelled', () => {
      setActiveTournamentId(null)
      setTournamentBanner(null)
      setTournamentMatchData(null)
    })

    socket.on('duel:incoming-invite', (data) => {
      setDuelInvite(data)  // { code, from: { userId, name } }
    })

    socket.on('duel:invite-expired', () => {
      // Host: invite timed out — LobbyScreen handles its own state
    })

    return () => {
      socket.off('tournament:your-match')
      socket.off('tournament:finished')
      socket.off('tournament:started')
      socket.off('tournament:cancelled')
      socket.off('duel:incoming-invite')
      socket.off('duel:invite-expired')
    }
  }, [guruMode])

  // Called by ModeSelectScreen when user picks a mode.
  // startTaskSession is called inside ModeSelectScreen (within TaskProvider tree) before this.
  const handleModeSelected = useCallback((_mode, _taskId, config) => {
    setGameConfig(config || null)
    setPendingTaskId(null)
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
    if (current === 'public-profile' && publicProfileData) {
      return (
        <PublicProfileScreen
          profile={publicProfileData}
          goBack={goBack}
          onInviteDuel={(profile) => {
            setDuelInvitePending({ id: profile.id, role: profile.role || 'siswa', name: profile.name || 'Siswa' })
          }}
        />
      )
    }

    if (current === 'modeselect') {
      return (
        <ModeSelectScreen
          navigate={navigate}
          goBack={goBack}
          pendingGame={pendingGame}
          taskId={pendingTaskId}
          onModeSelected={handleModeSelected}
          onDuel={DUEL_GAME_KEYS.has(pendingGame?.key) ? () => replaceTop('duel-lobby') : undefined}
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
      return <ShopScreen goBack={() => { setTokoInitialTab(null); goBack() }} initialTab={tokoInitialTab} />
    }

    if (current === 'papanperingkat') {
      return <LeaderboardScreen goBack={goBack} />
    }

    if (current === 'lencana') {
      return <BadgesScreen goBack={goBack} />
    }

    if (current === 'komunikasi') {
      return <CommunicationScreen goBack={goBack} initialTarget={komunikasiTarget} />
    }

    if (current === 'duel-lobby') {
      const inviteCode = duelInviteCode
      return (
        <LobbyScreen
          goBack={() => { setDuelInviteCode(null); goBack() }}
          initialCode={inviteCode}
          gameKey={pendingGame?.key || 'katak'}
          onStart={(data) => {
            setDuelInviteCode(null)
            setDuelState(data)
            replaceTop('duel-katak')
          }}
        />
      )
    }

    if (current === 'duel-katak' && duelState) {
      return (
        <DuelKatakScreen
          {...duelState}
          goBack={goBack}
        />
      )
    }

    if (current === 'boss-raid') {
      return <BossRaidScreen goBack={goBack} />
    }

    if (current === 'tournament-match' && tournamentMatchData) {
      return (
        <TournamentMatchWithAuth
          matchData={tournamentMatchData}
          goBack={goBack}
          onMatchOver={() => {
            setActiveTournamentId(tournamentMatchData.tournamentId)
            replaceTop('tournament-wait')
          }}
        />
      )
    }

    if (current === 'tournament-wait') {
      return (
        <TournamentWaitWithAuth
          tournamentId={activeTournamentId || tournamentMatchData?.tournamentId}
          goBack={goBack}
        />
      )
    }

    if (GAME_ROUTES[current]) {
      const { Component, name, emoji } = GAME_ROUTES[current]
      const difficulty = gameConfig?.difficulty || 'medium'
      const survival = !!gameConfig?.survival
      return (
        <GameDesktopWrapper gameTitle={name} gameEmoji={emoji} onExit={goBack}>
          <Suspense fallback={<GameLoadingFallback />}>
            <Component navigate={navigate} goBack={goBack} difficulty={difficulty} survival={survival} />
          </Suspense>
        </GameDesktopWrapper>
      )
    }

    if (current === 'home') {
      return <HomeScreen navigate={navigate} goBack={goBack} guruMode={guruMode} onExitGuruMode={onExitGuruMode} openPetShop={() => { setTokoInitialTab('pet_skin'); navigate('toko') }} />
    }

    const StaticScreen = STATIC_ROUTES[current] || HomeScreen
    return <StaticScreen navigate={navigate} goBack={goBack} />
  }

  return (
    <PlayerProvider>
      <PetProvider>
        <TaskProvider onTaskComplete={handleTaskComplete}>
          <BabLockProvider>
            <AppShell user={user} navigate={navigate} currentScreen={current} onLogout={logout}>
            <div style={{ width: '100%', minHeight: '100vh', position: 'relative' }}>
              {/* Counteract global theme filter on raw image/sprite elements */}
              {inverseFilter && (
                <style>{`
                  img,
                  [data-raw-image] {
                    filter: ${inverseFilter} !important;
                  }
                `}</style>
              )}
              {/* Tema particles overlay — rendered on top of all screens */}
              <GameThemeOverlay temaId={user?.equippedTema} />
              <ErrorBoundary key={current} onReset={goBack}>
                {renderScreen()}
              </ErrorBoundary>
              {/* Floating task progress strip — shown during any task session */}
              <TaskOverlay />
              {/* Error toast when tugas submission fails */}
              <SubmitErrorToast />
              {/* Tomi the guinea pig — walks across screen for students */}
              <FloatingPet onHungryClick={() => {
                setTokoInitialTab('pet_skin')
                navigate('toko')
              }} />
              {/* Tournament match notification banner */}
              {tournamentBanner && current !== 'tournament-match' && (
                <TournamentNotificationBanner
                  matchData={tournamentBanner}
                  onAccept={(data) => {
                    setTournamentMatchData(data)
                    setActiveTournamentId(data.tournamentId)
                    setTournamentBanner(null)
                    navigate('tournament-match')
                  }}
                  onDismiss={() => setTournamentBanner(null)}
                />
              )}
              {/* Duel game picker — shown before sending a direct invite */}
              {duelInvitePending && (
                <DuelGamePickerModal
                  target={duelInvitePending}
                  onPick={(gameKey) => {
                    const t = duelInvitePending
                    setDuelInvitePending(null)
                    const socket = connectSocket()
                    socket.emit('duel:invite', {
                      targetUserId: t.id,
                      targetRole: t.role,
                      avatar: null,
                      gameKey,
                    })
                    navigate('duel-lobby')
                  }}
                  onCancel={() => setDuelInvitePending(null)}
                />
              )}
              {/* What's New modal — shown once per version after update */}
              {whatsNewOpen && !guruMode && (
                <WhatsNewModal onClose={dismissWhatsNew} />
              )}
              {/* Duel invite banner */}
              {duelInvite && current !== 'duel-lobby' && current !== 'duel-katak' && (
                <DuelInviteBanner
                  invite={duelInvite}
                  onAccept={(inv) => {
                    setDuelInvite(null)
                    setDuelInviteCode(inv.code)
                    navigate('duel-lobby')
                  }}
                  onDecline={() => {
                    const socket = connectSocket()
                    if (duelInvite?.code) socket.emit('duel:invite-decline', { code: duelInvite.code })
                    setDuelInvite(null)
                  }}
                />
              )}
            </div>
            </AppShell>
          </BabLockProvider>
        </TaskProvider>
      </PetProvider>
    </PlayerProvider>
  )
}

export default function App() {
  const { user, logout, checking } = useAuth()
  const [guruPracticeMode, setGuruPracticeMode] = useState(false)
  const { checking: checkingUpdate, updateRequired, downloadUrl } = useAppUpdateCheck()

  // Hide the inline HTML splash once React has mounted and auth check is done
  useEffect(() => {
    if (!checking && !checkingUpdate) {
      window.__hideSplash?.()
    }
  }, [checking, checkingUpdate])

  // Update tab title for guru dashboard and login screen
  useEffect(() => {
    if (checking) return
    if (user?.role === 'guru' && !guruPracticeMode) {
      document.title = 'Dashboard Guru — TOMAT'
    } else if (!user) {
      document.title = 'TOMAT — Tantangan Otak Matematika'
    }
  }, [user, guruPracticeMode, checking])

  if (checking || checkingUpdate) {
    // Splash is still visible — render nothing so there's no flash
    return null
  }

  if (updateRequired) {
    return <UpdateRequiredScreen downloadUrl={downloadUrl} />
  }

  if (!user) {
    return <LoginScreen />
  }

  if (user.role === 'guru') {
    if (guruPracticeMode) {
      return (
        <div style={{ width: '100%', minHeight: '100vh', position: 'relative' }}>
          <ErrorBoundary onReset={() => setGuruPracticeMode(false)}>
            <PlayerExperience guruMode onExitGuruMode={() => setGuruPracticeMode(false)} />
          </ErrorBoundary>
        </div>
      )
    }
    const guruNavigate = (key) => {
      window.dispatchEvent(new CustomEvent('tomat:guru-nav', { detail: { key } }))
    }
    return (
      <AppShell user={user} navigate={guruNavigate} currentScreen="guruDashboard" onLogout={logout}>
        <div style={{ width: '100%', minHeight: '100vh', position: 'relative' }}>
          <ErrorBoundary onReset={() => {}}>
            <GuruDashboardScreen onPlayGames={() => setGuruPracticeMode(true)} />
          </ErrorBoundary>
        </div>
      </AppShell>
    )
  }

  return <PlayerExperience />
}
