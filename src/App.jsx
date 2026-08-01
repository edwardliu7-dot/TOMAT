import React, { useState, useCallback, Component, Suspense, useEffect, useRef } from 'react'
import { PetProvider } from './PetContext'
import FloatingPet from './components/FloatingPet'
import { PlayerProvider, usePlayer } from './PlayerContext'
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
import Ipa7ZoneScreen from './screens/Ipa7ZoneScreen'
import Ipa8ZoneScreen from './screens/Ipa8ZoneScreen'
import Ipa9ZoneScreen from './screens/Ipa9ZoneScreen'
import ModeSelectScreen from './screens/ModeSelectScreen'
import TaskResultScreen from './screens/TaskResultScreen'
import GradesScreen from './screens/GradesScreen'
import ProfileScreen from './screens/ProfileScreen'
import ShopScreen from './screens/ShopScreen'
import LeaderboardScreen from './screens/LeaderboardScreen'
import BadgesScreen from './screens/BadgesScreen'
import HafalanScreen from './screens/HafalanScreen'
import LatihanUjianScreen from './screens/LatihanUjianScreen'
import TaskOverlay from './components/TaskOverlay'
import TaskGuard from './components/TaskGuard'
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
import OtaUpdateBanner from './components/OtaUpdateBanner'
import WhatsNewModal, { useWhatsNew } from './components/WhatsNewModal'
import BlpHomeScreen from './screens/blp/BlpHomeScreen'
import BlpSiswaDashboardScreen from './screens/blp/BlpSiswaDashboardScreen'
import BlpIsiAktivitasScreen from './screens/blp/BlpIsiAktivitasScreen'
import BlpRiwayatScreen from './screens/blp/BlpRiwayatScreen'
import BlpQuranScreen from './screens/blp/BlpQuranScreen'
import BlpHaidScreen from './screens/blp/BlpHaidScreen'
import BlpGuruRekapScreen from './screens/blp/BlpGuruRekapScreen'
import BlpGuruDashboardScreen from './screens/blp/BlpGuruDashboardScreen'
import BlpGuruSiswaDetailScreen from './screens/blp/BlpGuruSiswaDetailScreen'
import BlpGuruPeriodeScreen from './screens/blp/BlpGuruPeriodeScreen'
import { BlpDataProvider } from './contexts/BlpDataContext'
import Eob5DashboardScreen from './screens/eob5/Eob5DashboardScreen'
import Eob5AbsensiScreen from './screens/eob5/Eob5AbsensiScreen'
import Eob5ManajemenSiswaScreen from './screens/eob5/Eob5ManajemenSiswaScreen'
import Eob5DetailSiswaScreen from './screens/eob5/Eob5DetailSiswaScreen'
import Eob5NilaiScreen from './screens/eob5/Eob5NilaiScreen'
import Eob5JadwalScreen from './screens/eob5/Eob5JadwalScreen'
import Eob5ProsemScreen from './screens/eob5/Eob5ProsemScreen'
import Eob5MateriScreen from './screens/eob5/Eob5MateriScreen'
import Eob5SoalAiScreen from './screens/eob5/Eob5SoalAiScreen'
import Eob5RekapScreen from './screens/eob5/Eob5RekapScreen'
import Eob5InboxScreen from './screens/eob5/Eob5InboxScreen'
import Eob5JurnalScreen from './screens/eob5/Eob5JurnalScreen'
import Eob5KalenderScreen from './screens/eob5/Eob5KalenderScreen'
import Eob5InfoPekananScreen from './screens/eob5/Eob5InfoPekananScreen'
import Eob5PoinScreen from './screens/eob5/Eob5PoinScreen'
import Eob5AkunSiswaScreen from './screens/eob5/Eob5AkunSiswaScreen'
import Eob5DirektoriGuruScreen from './screens/eob5/Eob5DirektoriGuruScreen'
import Eob5DirektoriSiswaScreen from './screens/eob5/Eob5DirektoriSiswaScreen'
import Eob5KepsekScreen from './screens/eob5/Eob5KepsekScreen'
import Eob5KesiswaanScreen from './screens/eob5/Eob5KesiswaanScreen'
import Eob5WaliKelasScreen from './screens/eob5/Eob5WaliKelasScreen'
import Eob5KurikulumScreen from './screens/eob5/Eob5KurikulumScreen'
import Eob5AdministrasiScreen from './screens/eob5/Eob5AdministrasiScreen'
import Eob5FeedbackScreen from './screens/eob5/Eob5FeedbackScreen'
import Eob5PengaturanScreen from './screens/eob5/Eob5PengaturanScreen'
import Eob5Layout from './components/eob5/Eob5Layout'
import MissionProgressToast from './components/MissionProgressToast'
import MissionClaimNotification from './components/MissionClaimNotification'
import { getActiveEvents } from './data/seasonalEvents'
import { startBgm, stopBgm } from './bgm'
import {
  requestNotificationPermission,
  createNotificationChannels,
  showLocalNotification,
} from './capacitorNotify'

/** Returns 'tema_merahputih' during Jul 15–Aug 31, otherwise null. */
function getSeasonalTema() {
  const active = getActiveEvents()
  return active.some(e => e.slug === 'kemerdekaan') ? 'tema_merahputih' : null
}

const DUEL_INVITE_GAMES = [
  { key: 'katak',       emoji: '🐸', name: 'Katak Pelompat' },
  { key: 'termometer',  emoji: '🌡️', name: 'Termometer' },
  { key: 'pabrikrobot', emoji: '🤖', name: 'Pabrik Robot' },
  { key: 'gembok',      emoji: '⚙️', name: 'Gembok FPB' },
  { key: 'mercusuar',   emoji: '🏮', name: 'Mercusuar KPK' },
  { key: 'scanner',     emoji: '💎', name: 'Scanner Prima' },
]

// Toast shown when Nananaga's wrong-answer immunity activates during duel/tournament/survival.
// Listens for the 'nananaga-shield' CustomEvent dispatched by useSurvival and the duel/
// tournament screen handlers. Auto-dismisses after 2.5 s.
function NananagaShieldToast() {
  const [visible, setVisible] = React.useState(false)
  const [tokensLeft, setTokensLeft] = React.useState(0)
  const timerRef = React.useRef(null)

  React.useEffect(() => {
    function handleShield(e) {
      setTokensLeft(e.detail?.tokensLeft ?? 0)
      setVisible(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setVisible(false), 2500)
    }
    window.addEventListener('nananaga-shield', handleShield)
    return () => {
      window.removeEventListener('nananaga-shield', handleShield)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
      zIndex: 10003, maxWidth: 340, width: 'calc(100% - 32px)',
      background: 'linear-gradient(135deg,rgba(20,10,40,0.97),rgba(30,10,10,0.97))',
      border: '1.5px solid rgba(251,146,60,0.7)',
      borderRadius: 18, padding: '14px 18px',
      boxShadow: '0 0 40px rgba(251,146,60,0.35), 0 8px 32px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', gap: 14,
      animation: 'nanaShieldIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <style>{`
        @keyframes nanaShieldIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.88); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1); }
        }
      `}</style>
      <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>🐲</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: '#FB923C', marginBottom: 2 }}>
          Nananaga melindungimu!
        </div>
        <div style={{ fontSize: 11, color: '#FED7AA', lineHeight: 1.4 }}>
          Jawaban salah diabaikan. Kamu mendapat soal tambahan.
          {tokensLeft > 0 && (
            <span style={{ marginLeft: 4, color: '#FB923C', fontWeight: 700 }}>
              ({tokensLeft} kebal tersisa)
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

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
// ── Daily login bonus modal ────────────────────────────────────────────────────
// Shown once per day when the server confirms a fresh login streak reward.
// dailyBonus shape: { coins, streak, nextMilestone }
function DailyBonusModal({ bonus, onDismiss }) {
  if (!bonus) return null

  const { coins = 100, streak = 1, nextMilestone = 7 } = bonus
  const cyclePos = streak % 7 === 0 ? 7 : streak % 7   // 1–7, never 0
  const progressPct = (cyclePos / 7) * 100
  const streakDisplay = cyclePos

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10005,
      background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 20px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'linear-gradient(135deg,#1a1020,#0d1a2e)',
        border: '2px solid rgba(251,191,36,0.55)',
        borderRadius: 28, padding: '32px 24px 24px',
        boxShadow: '0 0 80px rgba(251,191,36,0.2), 0 24px 60px rgba(0,0,0,0.6)',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 28, background: 'radial-gradient(circle at 50% 0%, rgba(251,191,36,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

        {/* Fire streak icon */}
        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>🔥</div>
        <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>
          BONUS LOGIN HARIAN
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
          Hari ke-{streak}!
        </div>
        <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 20, lineHeight: 1.5 }}>
          Kamu sudah login berturut-turut {streak} hari.
        </div>

        {/* Coin badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'linear-gradient(135deg,rgba(251,191,36,0.18),rgba(245,158,11,0.1))',
          border: '1.5px solid rgba(251,191,36,0.45)',
          borderRadius: 18, padding: '14px 28px',
          marginBottom: 22,
        }}>
          <span style={{ fontSize: 28 }}>🪙</span>
          <span style={{ fontSize: 30, fontWeight: 900, color: '#fbbf24' }}>+{coins}</span>
        </div>

        {/* 7-day progress bar */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginBottom: 6 }}>
            <span>Streak mingguan</span>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>{streakDisplay}/7 hari</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
              borderRadius: 8,
              transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </div>
          {nextMilestone > 0 && (
            <div style={{ fontSize: 10, color: '#475569', marginTop: 5 }}>
              {cyclePos === 7
                ? '🎁 Bonus spesial minggu ini tercapai!'
                : `${7 - cyclePos} hari lagi menuju bonus spesial 🎁`}
            </div>
          )}
        </div>

        {/* Claim button */}
        <button onClick={onDismiss} style={{
          width: '100%', background: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
          border: 'none', borderRadius: 16, padding: '16px',
          color: '#1a1020', fontSize: 16, fontWeight: 900,
          cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 0.3,
          boxShadow: '0 4px 24px rgba(251,191,36,0.4)',
        }}>
          🎉 Klaim Bonus!
        </button>
      </div>
    </div>
  )
}

import GameDesktopWrapper from './components/GameDesktopWrapper'
import { fetchPublicProfile, normalizeProfileTarget } from './components/shared'
import { getGameTheme, GameThemeOverlay, GameThemeStyles } from './gameTheme'

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

// Placeholder untuk game IPA yang belum diimplementasikan
function IpaGamePlaceholder({ onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: '#071321', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
      <div style={{ fontSize: 56 }}>🔬</div>
      <div style={{ color: '#22c55e', fontSize: 20, fontWeight: 800, textAlign: 'center' }}>Segera Hadir!</div>
      <div style={{ color: '#94A3B8', fontSize: 14, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
        Game IPA ini sedang dalam pengembangan. Pantau terus pembaruan aplikasi ya!
      </div>
      <button
        onClick={onBack}
        style={{ marginTop: 8, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
      >
        ← Kembali
      </button>
    </div>
  )
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
  // IPA Kelas 7 — BAB 1
  ipa7b1t1: { name: 'Unit Converter Dash',          emoji: '📏', Component: React.lazy(() => import('./minigames/Ipa7B1T1Game')) },
  ipa7b1t2: { name: 'Baku vs Non-Baku Sort',        emoji: '⚖️', Component: React.lazy(() => import('./minigames/Ipa7B1T2Game')) },
  ipa7b1t3: { name: 'Lab Measurement Simulator',    emoji: '🔬', Component: React.lazy(() => import('./minigames/Ipa7B1T3Game')) },
  // IPA Kelas 7 — BAB 2
  ipa7b2t1: { name: 'Matter Inspector',             emoji: '🧪', Component: React.lazy(() => import('./minigames/Ipa7B2T1Game')) },
  ipa7b2t2: { name: 'Phase Change Master',          emoji: '❄️', Component: React.lazy(() => import('./minigames/Ipa7B2T2Game')) },
  ipa7b2t3: { name: 'Cohesion vs Adhesion Lab',     emoji: '💧', Component: React.lazy(() => import('./minigames/Ipa7B2T3Game')) },
  ipa7b2t4: { name: 'Capillary Tube Challenge',     emoji: '🌿', Component: React.lazy(() => import('./minigames/Ipa7B2T4Game')) },
  // IPA Kelas 7 — BAB 3
  ipa7b3t1: { name: 'Thermometer Reader',           emoji: '🌡️', Component: React.lazy(() => import('./minigames/Ipa7B3T1Game')) },
  ipa7b3t2: { name: 'Temperature Converter Wheel',  emoji: '🔄', Component: React.lazy(() => import('./minigames/Ipa7B3T2Game')) },
  ipa7b3t3: { name: 'Thermal Expansion Builder',    emoji: '🔩', Component: React.lazy(() => import('./minigames/Ipa7B3T3Game')) },
  // IPA Kelas 7 — BAB 4
  ipa7b4t1: { name: 'Force Application Quest',      emoji: '💪', Component: React.lazy(() => import('./minigames/Ipa7B4T1Game')) },
  ipa7b4t2: { name: 'Resultant Tug of War',         emoji: '⚖️', Component: React.lazy(() => import('./minigames/Ipa7B4T2Game')) },
  ipa7b4t3: { name: 'Motion Classifier',            emoji: '🏃', Component: React.lazy(() => import('./minigames/Ipa7B4T3Game')) },
  ipa7b4t4: { name: 'Speed vs Velocity Pilot',      emoji: '✈️', Component: React.lazy(() => import('./minigames/Ipa7B4T4Game')) },
  ipa7b4t5: { name: "Newton's Law Arena",            emoji: '⚡', Component: React.lazy(() => import('./minigames/Ipa7B4T5Game')) },
  // IPA Kelas 8 — BAB 1
  ipa8b1t1: { name: 'History Timeline Puzzle',      emoji: '🕰️', Component: React.lazy(() => import('./minigames/Ipa8B1T1Game')) },
  ipa8b1t2: { name: 'Microscope Selector',          emoji: '🔭', Component: React.lazy(() => import('./minigames/Ipa8B1T2Game')) },
  ipa8b1t3: { name: 'Cell Organelle Sorter',        emoji: '🧫', Component: React.lazy(() => import('./minigames/Ipa8B1T3Game')) },
  ipa8b1t4: { name: 'Specialized Cell Match',       emoji: '🔬', Component: React.lazy(() => import('./minigames/Ipa8B1T4Game')) },
  ipa8b1t5: { name: 'Stem Cell Regenerator',        emoji: '🌱', Component: React.lazy(() => import('./minigames/Ipa8B1T5Game')) },
  // IPA Kelas 8 — BAB 2
  ipa8b2t1: { name: 'Nutritional Plate Balance',    emoji: '🥗', Component: React.lazy(() => import('./minigames/Ipa8B2T1Game')) },
  ipa8b2t2: { name: 'Virtual Food Reagent Test',    emoji: '🧪', Component: React.lazy(() => import('./minigames/Ipa8B2T2Game')) },
  ipa8b2t3: { name: 'Digestive Track Runner',       emoji: '🫁', Component: React.lazy(() => import('./minigames/Ipa8B2T3Game')) },
  ipa8b2t4: { name: 'Digestive Hospital Clinic',    emoji: '🏥', Component: React.lazy(() => import('./minigames/Ipa8B2T4Game')) },
  ipa8b2t5: { name: 'Circulatory System Navigator', emoji: '❤️', Component: React.lazy(() => import('./minigames/Ipa8B2T5Game')) },
  ipa8b2t6: { name: 'Blood Component Defender',     emoji: '🩸', Component: React.lazy(() => import('./minigames/Ipa8B2T6Game')) },
  ipa8b2t7: { name: 'Blood Transfusion Match',      emoji: '💉', Component: React.lazy(() => import('./minigames/Ipa8B2T7Game')) },
  ipa8b2t8: { name: 'Cardiovascular Healthy Life',  emoji: '🫀', Component: React.lazy(() => import('./minigames/Ipa8B2T8Game')) },
  // IPA Kelas 8 — BAB 3
  ipa8b3t1: { name: 'Organ Anatomy Builder',        emoji: '🫀', Component: React.lazy(() => import('./minigames/Ipa8B3T1Game')) },
  ipa8b3t2: { name: 'Organ Function Cards',         emoji: '🃏', Component: React.lazy(() => import('./minigames/Ipa8B3T2Game')) },
  ipa8b3t3: { name: 'Breathing Mechanism Pump',     emoji: '🫁', Component: React.lazy(() => import('./minigames/Ipa8B3T3Game')) },
  ipa8b3t4: { name: 'Alveoli Gas Exchange',         emoji: '💨', Component: React.lazy(() => import('./minigames/Ipa8B3T4Game')) },
  ipa8b3t5: { name: 'Nephron Urine Factory',        emoji: '🧫', Component: IpaGamePlaceholder },
  ipa8b3t6: { name: 'Medical Case Analyzer',        emoji: '🩺', Component: IpaGamePlaceholder },
  ipa8b3t7: { name: 'Healthy Habit Choice',         emoji: '🏃', Component: IpaGamePlaceholder },
  // IPA Kelas 9 — BAB 1
  ipa9b1t1: { name: 'Body Command Center',           emoji: '🧠', Component: IpaGamePlaceholder },
  ipa9b1t2: { name: 'Neuron Network Relay',          emoji: '⚡', Component: IpaGamePlaceholder },
  ipa9b1t3: { name: 'Hormone Gland Factory',         emoji: '🏭', Component: IpaGamePlaceholder },
  ipa9b1t4: { name: 'Homeostasis Stabilizer',        emoji: '⚖️', Component: IpaGamePlaceholder },
  ipa9b1t5: { name: 'Daily Stress Survival',         emoji: '🧘', Component: IpaGamePlaceholder },
  // IPA Kelas 9 — BAB 2
  ipa9b2t1: { name: 'Addictive Substance Quiz',      emoji: '⚠️', Component: IpaGamePlaceholder },
  ipa9b2t2: { name: 'Substance Categorizer',         emoji: '🗂️', Component: IpaGamePlaceholder },
  ipa9b2t3: { name: 'Impact Simulator',              emoji: '💔', Component: IpaGamePlaceholder },
  ipa9b2t4: { name: 'Substance Flashcards',          emoji: '🃏', Component: IpaGamePlaceholder },
  ipa9b2t5: { name: 'Consequence Analyzer',          emoji: '📊', Component: IpaGamePlaceholder },
  ipa9b2t6: { name: 'Say No Challenge',              emoji: '🛡️', Component: IpaGamePlaceholder },
  // IPA Kelas 9 — BAB 3
  ipa9b3t1: { name: 'Reproductive Anatomy Puzzle',   emoji: '🧬', Component: IpaGamePlaceholder },
  ipa9b3t2: { name: 'Human Life Stages Timeline',    emoji: '👶', Component: IpaGamePlaceholder },
  ipa9b3t3: { name: 'Reproductive Health Guardian',  emoji: '🏥', Component: IpaGamePlaceholder },
  ipa9b3t4: { name: 'Flora & Fauna Breeder',         emoji: '🌱', Component: IpaGamePlaceholder },
}

const STATIC_ROUTES = { home: HomeScreen, grade7: Grade7ZoneScreen, grade8: Grade8ZoneScreen, grade9: Grade9ZoneScreen, ipa7: Ipa7ZoneScreen, ipa8: Ipa8ZoneScreen, ipa9: Ipa9ZoneScreen, komunikasi: CommunicationScreen }

const SCREEN_TITLES = {
  home: 'Beranda',
  grade7: 'Zona Kelas 7',
  grade8: 'Zona Kelas 8',
  grade9: 'Zona Kelas 9',
  ipa7: 'IPA Kelas 7',
  ipa8: 'IPA Kelas 8',
  ipa9: 'IPA Kelas 9',
  toko: 'Toko',
  papanperingkat: 'Papan Peringkat',
  lencana: 'Lencana',
  grades: 'Nilai & Tugas',
  komunikasi: 'Chat',
  profile: 'Profil',
  hafalan: 'Hafalan Interaktif',
  'latihan-ujian': 'Latihan Ujian',
  modeselect: 'Pilih Mode',
  'duel-lobby': 'Duel Lobby',
  'boss-raid': 'Boss Raid',
  'tournament-wait': 'Turnamen',
  'blp-home': 'BLP Harian',
  'blp-isi-aktivitas': 'Isi Aktivitas BLP',
  'blp-riwayat': 'Riwayat BLP',
  'blp-quran': 'Quran Tracker',
  'blp-haid': 'Periode Haid',
  'blp-guru-rekap': 'Rekap Kelas BLP',
  'blp-guru-siswa-detail': 'Detail Siswa BLP',
  'blp-guru-periode': 'Atur Periode BLP',
  'eob5-dashboard': 'GURU — Dashboard',
  'eob5-absensi': 'GURU — Absensi',
  'eob5-siswa': 'GURU — Manajemen Siswa',
  'eob5-detail-siswa': 'GURU — Detail Siswa',
  'eob5-nilai': 'GURU — Nilai',
  'eob5-jadwal': 'GURU — Jadwal',
  'eob5-prosem': 'GURU — Prosem',
  'eob5-materi': 'GURU — Materi',
  'eob5-soal-ai': 'GURU — Soal AI',
  'eob5-rekap': 'GURU — Rekap',
  'eob5-inbox': 'GURU — Pesan Siswa',
  'eob5-jurnal': 'GURU — Jurnal Mengajar',
  'eob5-kalender': 'GURU — Kalender Akademik',
  'eob5-info-pekanan': 'GURU — Info Pekanan',
  'eob5-poin': 'GURU — Poin Siswa',
  'eob5-akun-siswa': 'GURU — Akun Siswa',
  'eob5-direktori-guru': 'GURU — Direktori Guru',
  'eob5-direktori-siswa': 'GURU — Direktori Siswa',
  'eob5-kepsek': 'GURU — Progres Kinerja Guru',
  'eob5-kesiswaan': 'GURU — Rekap Kesiswaan',
  'eob5-walikelas': 'GURU — Rekap Wali Kelas',
  'eob5-kurikulum': 'GURU — Supervisi Kurikulum',
  'eob5-administrasi': 'GURU — Administrasi',
  'eob5-feedback': 'GURU — Feedback',
  'eob5-pengaturan': 'GURU — Pengaturan Profil',
}

// Rendered inside PlayerProvider — safe to call usePlayer().
// Handles the mission:progress socket event and renders mission toasts/claims.
function MissionBridge() {
  const {
    missionToasts, missionClaims,
    dismissMissionToast, dismissMissionClaim, pushMissionProgress,
  } = usePlayer()

  useEffect(() => {
    const socket = connectSocket()
    socket.on('mission:progress', pushMissionProgress)
    return () => { socket.off('mission:progress', pushMissionProgress) }
  }, [pushMissionProgress])

  return (
    <>
      <MissionProgressToast
        toasts={missionToasts}
        onDismiss={dismissMissionToast}
      />
      <MissionClaimNotification
        missions={missionClaims}
        onDismiss={dismissMissionClaim}
        onClaim={async (missionId) => {
          try {
            const res = await fetch(`/api/siswa/event-missions/${missionId}/claim`, {
              method: 'POST', credentials: 'include',
            })
            if (!res.ok) {
              const err = await res.json().catch(() => ({}))
              console.error('[MissionClaim] gagal:', err.error)
            }
          } catch (err) {
            console.error('[MissionClaim]', err)
          } finally {
            dismissMissionClaim(missionId)
          }
        }}
      />
    </>
  )
}

// Shared game-playing shell. Used for students (normal play with tasks/nilai) and for
// teachers in "Mode Mengajar" (free-play only, used as a teaching aid in class).
function PlayerExperience({ guruMode = false, onExitGuruMode }) {
  const { user, logout, dailyBonus, dismissDailyBonus } = useAuth()

  // Set data-tema on <html> so GameThemeStyles can target structural elements only.
  // During Kemerdekaan event (Jul 15–Aug 31) tema_merahputih overrides the user's
  // equipped theme automatically and reverts when the event window closes.
  useEffect(() => {
    function applyTema() {
      const seasonal = getSeasonalTema()
      const effective = seasonal || user?.equippedTema || null
      if (effective) {
        document.documentElement.setAttribute('data-tema', effective)
      } else {
        document.documentElement.removeAttribute('data-tema')
      }
    }
    applyTema()
    // Re-evaluate every minute so the override activates / deactivates live
    const timer = setInterval(applyTema, 60_000)
    return () => {
      clearInterval(timer)
      document.documentElement.removeAttribute('data-tema')
    }
  }, [user?.equippedTema])

  // ── Background music ─────────────────────────────────────────────────────
  // kemerdekaan event → event track; otherwise → default track
  useEffect(() => {
    const isKemerdekaan = getActiveEvents().some(e => e.slug === 'kemerdekaan')
    const track = isKemerdekaan
      ? '/videoplayback.weba'
      : '/videoplayback (1).weba'
    startBgm(track)
    return () => stopBgm()
  }, [])   // mount once — event window is static for a session
  // ─────────────────────────────────────────────────────────────────────────

  // ── Android APK: request notification permission + create channels ────────
  useEffect(() => {
    if (!window.Capacitor || guruMode) return
    createNotificationChannels()
    requestNotificationPermission()
  }, [guruMode])

  // ── Android APK: reconnect socket when app comes back to foreground ───────
  // Android kills WebSocket connections when the app is suspended. Without an
  // explicit reconnect on resume, all socket-based in-game notifications
  // (duel invite, tournament match, mission progress) are permanently lost for
  // the rest of the session.
  useEffect(() => {
    if (!window.Capacitor) return
    let handle = null
    ;(async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app')
        handle = await CapApp.addListener('appStateChange', ({ isActive }) => {
          if (!isActive) return
          // App returned to foreground — re-establish socket and recover state
          const socket = connectSocket()
          if (!socket.connected) socket.connect()
          // Re-check tournament state in case we missed a 'tournament:your-match'
          // event while the socket was down
          if (!guruMode) {
            socket.once('connect', () => socket.emit('tournament:check-active'))
            if (socket.connected) socket.emit('tournament:check-active')
          }
        })
      } catch {
        // @capacitor/app not available (web build) — ignore silently
      }
    })()
    return () => { handle?.remove?.() }
  }, [guruMode])

  const [history, setHistory] = useState(['home'])
  const [pendingGame, setPendingGame] = useState(null) // { key, name, emoji }
  const [pendingTaskId, setPendingTaskId] = useState(null)
  const [lastGrade, setLastGrade] = useState(null)
  const [gameConfig, setGameConfig] = useState(null) // { difficulty } or { survival: true }

  const current = history[history.length - 1]

  const [komunikasiTarget, setKomunikasiTarget]     = useState(null)
  const [blpStudentId, setBlpStudentId]             = useState(null)
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
      document.title = `${gameRoute.emoji} ${gameRoute.name} — SMARTISA`
    } else {
      const label = SCREEN_TITLES[current]
      document.title = label ? `${label} — SMARTISA` : 'SMARTISA — Platform Pembelajaran TISA'
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
      if (route === 'blp-guru-siswa-detail' && options.studentId) {
        setBlpStudentId(options.studentId)
      }
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

    // Ask server if there is an ongoing tournament for this student's class
    socket.emit('tournament:check-active')

    // Server responds with active tournament state after page load / reconnect.
    // Shape: { tournamentId, match: { matchId, opponent, gameKey, round } | null }
    socket.on('tournament:active-state', ({ tournamentId, match } = {}) => {
      if (!tournamentId) return
      setActiveTournamentId(tournamentId)
      if (match) {
        // Student has a live pending match — show the full match notification
        const matchData = { tournamentId, ...match }
        setTournamentMatchData(matchData)
        setTournamentBanner(matchData)
      } else {
        // Tournament active but no pending match — show bracket rejoin banner
        setTournamentBanner({ type: 'bracket', tournamentId })
      }
    })

    // Server mengirim notifikasi match
    socket.on('tournament:your-match', (data) => {
      setTournamentMatchData(data)
      setTournamentBanner(data)
      // Fire native OS banner so the student notices even while focused on a game
      showLocalNotification({
        id: 9001,
        title: '🏆 Turnamen — Giliran Kamu!',
        body: `Lawan: ${data?.opponent?.name ?? 'Lawan'} • Game siap dimulai`,
        channel: 'tomat_game',
      })
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
      // Fire native OS banner so the student notices even while focused on a game
      showLocalNotification({
        id: 9002,
        title: '⚔️ Tantangan Duel!',
        body: `${data?.from?.name ?? 'Temanmu'} mengajakmu duel`,
        channel: 'tomat_game',
      })
    })

    socket.on('duel:invite-expired', () => {
      // Host: invite timed out — LobbyScreen handles its own state
    })

    return () => {
      socket.off('tournament:active-state')
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

  const handleSwitchModule = useCallback((homeScreen) => {
    setHistory([homeScreen])
  }, [])

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

    if (current === 'hafalan') {
      return <HafalanScreen goBack={goBack} />
    }

    if (current === 'latihan-ujian') {
      return <LatihanUjianScreen goBack={goBack} />
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

    if (current === 'blp-home') {
      return <BlpSiswaDashboardScreen navigate={navigate} goBack={goBack} />
    }

    if (current === 'blp-isi-aktivitas') {
      return <BlpIsiAktivitasScreen navigate={navigate} goBack={goBack} />
    }

    if (current === 'blp-riwayat') {
      return <BlpRiwayatScreen navigate={navigate} goBack={goBack} />
    }

    if (current === 'blp-quran') {
      return <BlpQuranScreen navigate={navigate} goBack={goBack} />
    }

    if (current === 'blp-haid') {
      return <BlpHaidScreen navigate={navigate} goBack={goBack} />
    }

    if (current === 'blp-guru-rekap') {
      return <BlpGuruDashboardScreen navigate={navigate} goBack={goBack} />
    }

    if (current === 'blp-guru-siswa-detail') {
      return <BlpGuruSiswaDetailScreen navigate={navigate} goBack={goBack} studentId={blpStudentId} />
    }

    if (current === 'blp-guru-periode') {
      return <BlpGuruPeriodeScreen navigate={navigate} goBack={goBack} />
    }

    if (current === 'home') {
      return <HomeScreen navigate={navigate} goBack={goBack} guruMode={guruMode} onExitGuruMode={onExitGuruMode} openPetShop={() => { setTokoInitialTab('pet_skin'); navigate('toko') }} openEventShop={() => { setTokoInitialTab('event'); navigate('toko') }} />
    }

    const StaticScreen = STATIC_ROUTES[current] || HomeScreen
    return <StaticScreen navigate={navigate} goBack={goBack} />
  }

  return (
    <PlayerProvider>
      <PetProvider>
        <TaskProvider onTaskComplete={handleTaskComplete}>
          <BabLockProvider>
            <BlpDataProvider>
            <AppShell user={user} navigate={navigate} currentScreen={current} onLogout={logout} onSwitchModule={handleSwitchModule}>
            <div style={{ width: '100%', minHeight: '100vh', position: 'relative' }}>
              {/* Inject CSS that filters ONLY structural nav/chrome elements.
                  Seasonal override (tema_merahputih during Jul 15–Aug 31) takes
                  priority over the user's own equipped theme. */}
              <GameThemeStyles temaId={getSeasonalTema() || user?.equippedTema} />
              {/* Tema particles overlay — rendered on top of all screens */}
              <GameThemeOverlay temaId={getSeasonalTema() || user?.equippedTema} />
              <ErrorBoundary key={current} onReset={goBack}>
                {renderScreen()}
              </ErrorBoundary>
              {/* Floating task progress strip — shown during any task session */}
              <TaskOverlay />
              {/* Anti-cheat: resets task and warns student if they leave mid-session */}
              <TaskGuard />
              {/* Error toast when tugas submission fails */}
              <SubmitErrorToast />
              {/* Nananaga immunity activation toast */}
              <NananagaShieldToast />
              {/* Mission toasts + claim modal — inside PlayerProvider via MissionBridge */}
              <MissionBridge />
              {/* Tomi the guinea pig — walks across screen for students */}
              <FloatingPet onHungryClick={() => {
                setTokoInitialTab('pet_skin')
                navigate('toko')
              }} />
              {/* Tournament match notification banner */}
              {tournamentBanner && current !== 'tournament-match' && current !== 'tournament-wait' && (
                <TournamentNotificationBanner
                  matchData={tournamentBanner}
                  onAccept={(data) => {
                    setTournamentBanner(null)
                    if (data?.type === 'bracket') {
                      // Rejoin bracket view — no pending match yet
                      setActiveTournamentId(data.tournamentId)
                      setHistory(h => [...h, 'tournament-wait'])
                    } else {
                      // Live match — go straight to arena
                      setTournamentMatchData(data)
                      setActiveTournamentId(data.tournamentId)
                      navigate('tournament-match')
                    }
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
              {/* Daily login bonus modal — shown once per day on first login */}
              {dailyBonus && !guruMode && (
                <DailyBonusModal bonus={dailyBonus} onDismiss={dismissDailyBonus} />
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
            </BlpDataProvider>
          </BabLockProvider>
        </TaskProvider>
      </PetProvider>
    </PlayerProvider>
  )
}

export default function App() {
  const { user, logout, checking } = useAuth()
  const [guruPracticeMode, setGuruPracticeMode] = useState(false)
  const [guruHistory, setGuruHistory] = useState(['guru-dashboard'])
  const [eob5SiswaId, setEob5SiswaId] = useState(null)
  const {
    checking: checkingUpdate,
    updateRequired, downloadUrl,
    bundleUpdateAvailable, bundleVersion, bundleUrl, bundleSize, bundleNotes,
  } = useAppUpdateCheck()

  // Hide the inline HTML splash once React has mounted and auth check is done
  useEffect(() => {
    if (!checking && !checkingUpdate) {
      window.__hideSplash?.()
    }
  }, [checking, checkingUpdate])

  // EOB5: lihat detail siswa — dispatched by Eob5ManajemenSiswaScreen
  useEffect(() => {
    const handler = (e) => {
      setEob5SiswaId(e.detail?.id || null)
      setGuruHistory(h => [...h, 'eob5-detail-siswa'])
    }
    window.addEventListener('eob5:lihat-siswa', handler)
    return () => window.removeEventListener('eob5:lihat-siswa', handler)
  }, [])

  // Update tab title for guru dashboard and login screen
  useEffect(() => {
    if (checking) return
    if (user?.role === 'guru' && !guruPracticeMode) {
      document.title = 'Dashboard Guru — SMARTISA'
    } else if (!user) {
      document.title = 'SMARTISA — Platform Pembelajaran TISA'
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

    const currentGuruScreen = guruHistory[guruHistory.length - 1]
    const guruGoBack = () => {
      if (guruHistory.length > 1) {
        setGuruHistory(h => h.slice(0, -1))
      }
    }
    const guruNavigate = (key) => {
      if (key === 'guruMengajar') { setGuruPracticeMode(true); return }
      if (key.startsWith('eob5-') || key.startsWith('blp-')) {
        setGuruHistory(h => [...h, key])
        return
      }
      window.dispatchEvent(new CustomEvent('tomat:guru-nav', { detail: { key } }))
    }

    const handleSwitchGuruModule = (homeScreen) => {
      setGuruHistory([homeScreen])
    }

    const renderGuruScreen = () => {
      if (currentGuruScreen === 'eob5-dashboard') {
        return <Eob5DashboardScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-absensi') {
        return <Eob5AbsensiScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-siswa') {
        return <Eob5ManajemenSiswaScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-detail-siswa') {
        return <Eob5DetailSiswaScreen navigate={guruNavigate} goBack={guruGoBack} siswaId={eob5SiswaId} />
      }
      if (currentGuruScreen === 'eob5-nilai') {
        return <Eob5NilaiScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-jadwal') {
        return <Eob5JadwalScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-prosem') {
        return <Eob5ProsemScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-materi') {
        return <Eob5MateriScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-soal-ai') {
        return <Eob5SoalAiScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-rekap') {
        return <Eob5RekapScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-inbox') {
        return <Eob5InboxScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-jurnal') {
        return <Eob5JurnalScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-kalender') {
        return <Eob5KalenderScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-info-pekanan') {
        return <Eob5InfoPekananScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-poin') {
        return <Eob5PoinScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-akun-siswa') {
        return <Eob5AkunSiswaScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-direktori-guru') {
        return <Eob5DirektoriGuruScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-direktori-siswa') {
        return <Eob5DirektoriSiswaScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-kepsek') {
        return <Eob5KepsekScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-kesiswaan') {
        return <Eob5KesiswaanScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-walikelas') {
        return <Eob5WaliKelasScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-kurikulum') {
        return <Eob5KurikulumScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-administrasi') {
        return <Eob5AdministrasiScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-feedback') {
        return <Eob5FeedbackScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'eob5-pengaturan') {
        return <Eob5PengaturanScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'blp-home') {
        return <BlpHomeScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'blp-guru-rekap') {
        return <BlpGuruDashboardScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      if (currentGuruScreen === 'blp-guru-siswa-detail') {
        return <BlpGuruSiswaDetailScreen navigate={guruNavigate} goBack={guruGoBack} studentId={eob5SiswaId} />
      }
      if (currentGuruScreen === 'blp-guru-periode') {
        return <BlpGuruPeriodeScreen navigate={guruNavigate} goBack={guruGoBack} />
      }
      // Default: main guru dashboard
      return <GuruDashboardScreen onPlayGames={() => setGuruPracticeMode(true)} />
    }

    const isEob5Screen = currentGuruScreen?.startsWith('eob5-')

    return (
      <BlpDataProvider>
        <AppShell user={user} navigate={guruNavigate} currentScreen={currentGuruScreen} onLogout={logout} onSwitchModule={handleSwitchGuruModule}>
          {isEob5Screen ? (
            <Eob5Layout navigate={guruNavigate} currentScreen={currentGuruScreen}>
              <ErrorBoundary onReset={guruGoBack}>
                {renderGuruScreen()}
              </ErrorBoundary>
            </Eob5Layout>
          ) : (
            <div style={{ width: '100%', height: '100dvh', overflow: 'hidden', position: 'relative' }}>
              <ErrorBoundary onReset={guruGoBack}>
                {renderGuruScreen()}
              </ErrorBoundary>
            </div>
          )}
        </AppShell>
      </BlpDataProvider>
    )
  }

  return (
    <>
      <PlayerExperience />
      {bundleUpdateAvailable && (
        <OtaUpdateBanner
          bundleVersion={bundleVersion}
          bundleUrl={bundleUrl}
          bundleSize={bundleSize}
          bundleNotes={bundleNotes}
        />
      )}
    </>
  )
}
