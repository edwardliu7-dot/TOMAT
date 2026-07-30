import React, { useEffect, useState } from 'react'
import { usePlayer } from '../PlayerContext'
import { useTask } from '../TaskContext'
import { useAuth } from '../AuthContext'
import { usePet } from '../PetContext'
import { UserAvatar } from '../components/shared'
import SeasonalEventBanner from '../components/SeasonalEventBanner'
import { getAccessibleGradesForUser } from '../kelasUtils'
import { getPetName } from '../components/PetSVG'

function getPetEmoji(skinId, isDead, isStarving) {
  if (isDead) return '💀'
  if (isStarving) return '😩'
  if (!skinId || skinId === 'golden' || skinId.startsWith('pet_skin_')) return '🐹'
  if (skinId.startsWith('pet_monyong')) return '🐒'
  if (skinId.startsWith('pet_kelinsay')) return '🐰'
  if (skinId.startsWith('pet_nananaga')) return '🐲'
  return '🐾'
}

const ZONES = [
  {
    id: 'grade7',
    grade: 7,
    label: 'KELAS VII',
    title: 'Gerbang Bilangan',
    icon: '🏰',
    subject: 'Bilangan Bulat, Rasional, Rasio',
    description: 'Bangun fondasi logika dan taklukkan bilangan.',
    accent: '#67E8F9',
    soft: 'rgba(103,232,249,0.08)',
    babs: ['BAB I: Bilangan Bulat', 'BAB II: Bilangan Rasional', 'BAB III: Rasio'],
    missions: 20,
  },
  {
    id: 'grade8',
    grade: 8,
    label: 'KELAS VIII',
    title: 'Kerajaan Pythagoras',
    icon: '⚔️',
    subject: 'Pythagoras, PLSV, Bangun Datar',
    description: 'Perjuangkan teorema dan persamaan linear.',
    accent: '#FB923C',
    soft: 'rgba(251,146,60,0.08)',
    babs: ['BAB I: Bilangan Berpangkat', 'BAB II: Pythagoras', 'BAB III: PLSV'],
    missions: 38,
  },
  {
    id: 'grade9',
    grade: 9,
    label: 'KELAS IX',
    title: 'Observatorium SPLDV',
    icon: '🚀',
    subject: 'SPLDV, Lingkaran, Bangun Ruang',
    description: 'Jelajahi antariksa persamaan dan geometri.',
    accent: '#34D399',
    soft: 'rgba(52,211,153,0.08)',
    babs: ['BAB I: SPLDV', 'BAB II: Lingkaran', 'BAB III: Bangun Ruang'],
    missions: 31,
  },
]

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const update = () => setDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return desktop
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('id-ID')
}

function ZoneCard({ zone, locked, selected, onClick }) {
  return (
    <button
      type="button"
      className={`home-zone ${selected ? 'is-selected' : ''} ${locked ? 'is-locked' : ''}`}
      style={{ '--zone-accent': zone.accent, '--zone-soft': zone.soft }}
      onClick={onClick}
      aria-label={locked ? `${zone.title} terkunci` : `Buka ${zone.title}`}
    >
      <div className="home-zone__top">
        <span className="home-zone__icon">{locked ? '🔒' : zone.icon}</span>
        <span className="home-zone__number">0{zone.grade - 6}</span>
      </div>
      <div className="home-zone__body">
        <span className="home-zone__label">{zone.label}</span>
        <strong>{zone.title}</strong>
        <small>{zone.subject}</small>
      </div>
      <div className="home-zone__progress">
        <span>{locked ? 'Selesaikan kelas sebelumnya untuk membuka' : `${zone.missions} misi tersedia`}</span>
        <div><i style={{ width: locked ? '0%' : '100%' }} /></div>
      </div>
      {!locked && <span className="home-zone__action">{selected ? 'ZONA DIPILIH' : 'BUKA PETA'} <b>›</b></span>}
    </button>
  )
}

export default function HomeScreen({ navigate, guruMode, onExitGuruMode, openPetShop, openEventShop }) {
  const { player } = usePlayer()
  const { tasks, grades } = useTask()
  const { user } = useAuth()
  const { pet } = usePet()
  const isDesktop = useIsDesktop()
  const [activeZone, setActiveZone] = useState(null)
  const [notice, setNotice] = useState('')
  const accessibleGrades = getAccessibleGradesForUser(user)
  const pendingTasks = tasks.filter(task => task.status === 'active')
  const nextTask = pendingTasks[0] || null
  const firstName = (user?.name || player?.name || 'Pelajar').split(' ')[0]
  const photoUrl = user?.photoUrl ?? user?.photo_url

  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(timer)
  }, [notice])

  const zones = ZONES.map(zone => ({
    ...zone,
    locked: !accessibleGrades.includes(zone.grade),
  }))

  const openTask = task => task && navigate(task.gameKey, { taskId: task.id })
  const showNotice = text => setNotice(text)
  const openZone = zone => {
    if (zone.locked) {
      showNotice('Zona ini belum terbuka untuk akunmu.')
      return
    }
    if (activeZone === zone.id) navigate(zone.id)
    else setActiveZone(zone.id)
  }

  const quickLinks = [
    { id: 'hafalan', icon: '🧮', label: 'Hafalan', sub: 'Flash Card & Kuis', accent: '#818cf8' },
    { id: 'latihan-ujian', icon: '📝', label: 'Latihan Ujian', sub: 'UN & TKA', accent: '#C084FC' },
    { id: 'grades', icon: '📊', label: 'Nilai & Tugas', sub: `${grades.length} nilai tersimpan`, accent: '#818CF8' },
    { id: 'komunikasi', icon: '💬', label: 'Chat Guru', sub: 'Tanya gurumu', accent: '#67E8F9' },
    { id: 'toko', icon: '🛒', label: 'Toko', sub: `${formatNumber(player.coins)} koin`, accent: '#FBBF24' },
    { id: 'lencana', icon: '🏅', label: 'Lencana', sub: 'Koleksimu', accent: '#FB923C' },
  ]

  return (
    <main className={`home-screen ${isDesktop ? 'home-screen--desktop' : 'home-screen--mobile'} ${guruMode ? 'home-screen--guru' : ''}`}>
      <div className="home-screen__glow home-screen__glow--one" />
      <div className="home-screen__glow home-screen__glow--two" />
      <div className="home-screen__glow home-screen__glow--three" />

      {guruMode && (
        <div className="home-teacher-mode">
          <span>🎓 Mode Mengajar · Latihan bebas untuk media ajar</span>
          <button type="button" onClick={onExitGuruMode}>← Kembali</button>
        </div>
      )}

      <header className="home-topbar">
        <div className="home-topbar__date">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          <span>/</span> Semester Aktif
        </div>
        <div className="home-topbar__actions">
          {!guruMode && <button type="button" className="home-coins" onClick={() => navigate('toko')}>🪙 {formatNumber(player.coins)}</button>}
          <button
            type="button"
            className="home-notification"
            onClick={() => nextTask ? openTask(nextTask) : showNotice('Belum ada tugas aktif.')}
            aria-label="Notifikasi tugas"
          >
            🔔
            {pendingTasks.length > 0 && <i />}
          </button>
          <button type="button" className="home-profile-button" onClick={() => navigate('profile')}>
            <UserAvatar user={user} size={34} />
            <span>{firstName}</span>
            <b>⌄</b>
          </button>
        </div>
      </header>

      <div className="home-content">
        <section className="home-greeting">
          <div>
            <span className="home-eyebrow">PETA PERJALANANMU</span>
            <h1>Halo, {firstName}. <em>Siap menjelajah?</em></h1>
            <p>Satu langkah kecil hari ini membawa kamu lebih dekat ke tujuan.</p>
          </div>
          <div className="home-level">
            <span>🔥</span>
            <div><strong>Lv {player.level}</strong><small>level saat ini</small></div>
            <i />
            <div className="home-level__xp"><strong>{formatNumber(player.exp)} XP</strong><small>total EXP</small></div>
          </div>
        </section>

        {!guruMode && <SeasonalEventBanner onOpenEventShop={openEventShop} />}

        {!guruMode && (
          <section className="home-mission">
            <div className="home-mission__rings" />
            <div className="home-mission__copy">
              <div className="home-mission__meta">
                <span>{nextTask ? 'TUGAS AKTIF' : 'MISI BERIKUTNYA'}</span>
                <small>⚡ +{nextTask ? (nextTask.totalQuestions || 5) * 10 : 40} EXP</small>
              </div>
              <h2>
                {nextTask
                  ? nextTask.gameName || nextTask.gameKey
                  : zones.find(zone => !zone.locked)?.title || 'Mulai petualangan matematikamu'}
              </h2>
              <p>
                {nextTask
                  ? `Selesaikan ${nextTask.totalQuestions || 5} soal untuk mendapatkan nilai dari gurumu.`
                  : 'Pilih zona petualangan di bawah untuk mulai belajar dan kumpulkan pengalaman.'}
              </p>
              <div className="home-mission__buttons">
                <button type="button" onClick={() => nextTask ? openTask(nextTask) : navigate(zones.find(zone => !zone.locked)?.id || 'grade7')}>
                  {nextTask ? 'KERJAKAN SEKARANG' : 'MULAI MISI'} →
                </button>
                {pendingTasks.length > 1 && <button type="button" onClick={() => navigate('grades')}>Lihat tugas lainnya</button>}
              </div>
            </div>
            <div className="home-mission__progress">
              <div><span>PROGRES</span><strong>Lv {player.level}</strong></div>
              <div className="home-progress-bar"><i style={{ width: `${Math.min(100, Math.round((player.exp / Math.max(player.maxExp || 100, 1)) * 100))}%` }} /></div>
              <small>{pendingTasks.length ? `${pendingTasks.length} tugas menunggu` : 'Tidak ada tugas aktif'}</small>
            </div>
          </section>
        )}

        <section className="home-section-heading">
          <div><h2>Zona petualangan <span>3 ZONA</span></h2><p>Pilih jalur yang ingin kamu taklukkan.</p></div>
          <button type="button" onClick={() => showNotice('Semua zona yang tersedia sudah tampil di sini.')}>Lihat semua →</button>
        </section>
        <section className="home-zones">
          {zones.map(zone => (
            <ZoneCard key={zone.id} zone={zone} locked={zone.locked} selected={activeZone === zone.id} onClick={() => openZone(zone)} />
          ))}
        </section>

        {activeZone && !zones.find(zone => zone.id === activeZone)?.locked && (
          <section className="home-zone-detail">
            <div><strong>{zones.find(zone => zone.id === activeZone)?.title}</strong><div>{zones.find(zone => zone.id === activeZone)?.babs.map(bab => <span key={bab}>{bab}</span>)}</div></div>
            <button type="button" onClick={() => navigate(activeZone)}>Masuki Zona →</button>
          </section>
        )}

        {!guruMode && (
          <>
            <section className="home-section-heading home-section-heading--quick"><div><h2>Akses cepat</h2><p>Semua yang kamu butuhkan.</p></div></section>
            <section className="home-quick-links">
              {quickLinks.map(link => (
                <button key={link.id} type="button" onClick={() => navigate(link.id)} style={{ '--quick-accent': link.accent }}>
                  <span>{link.icon}</span><div><strong>{link.label}</strong><small>{link.sub}</small></div>
                </button>
              ))}
            </section>
            <section className="home-pet">
              <span className="home-pet__emoji">{getPetEmoji(pet.skin, pet.isDead, pet.isStarving)}</span>
              <div><strong>{getPetName(pet.skin || 'golden')} — {pet.isDead ? 'Perlu dihidupkan kembali' : pet.isStarving ? 'Lapar' : 'Kenyang'}</strong><div className="home-pet__bar"><i style={{ width: `${pet.hunger}%` }} /></div></div>
              <button type="button" onClick={pet.isDead && openPetShop ? openPetShop : () => navigate('toko')}>{pet.isDead ? 'Adopsi' : 'Beri Makan'}</button>
            </section>
          </>
        )}
      </div>


      {notice && <div className="home-notice">✦ {notice}<button type="button" onClick={() => setNotice('')}>×</button></div>}

      <style>{`
        .home-screen { min-height: 100vh; position: relative; overflow-x: hidden; background: #071321; color: #F1F5F9; }
        .home-screen__glow { position: fixed; pointer-events: none; border-radius: 50%; filter: blur(130px); z-index: 0; }
        .home-screen__glow--one { width: 520px; height: 520px; left: -180px; top: -160px; background: rgba(6,182,212,.08); }
        .home-screen__glow--two { width: 580px; height: 580px; right: -180px; top: 38%; background: rgba(99,102,241,.10); }
        .home-screen__glow--three { width: 520px; height: 520px; left: 35%; bottom: -300px; background: rgba(14,165,233,.06); }
        .home-teacher-mode { position: relative; z-index: 4; display:flex; justify-content:space-between; align-items:center; padding:10px 32px; background:rgba(52,211,153,.12); border-bottom:1px solid rgba(52,211,153,.3); color:#34D399; font-size:12px; font-weight:700; }
        .home-teacher-mode button { border:0; border-radius:20px; padding:6px 14px; background:rgba(255,255,255,.1); color:#fff; cursor:pointer; font:inherit; }
        .home-topbar { position:relative; z-index:3; display:flex; justify-content:space-between; align-items:center; min-height:68px; padding:14px 40px; border-bottom:1px solid rgba(255,255,255,.07); background:rgba(7,19,33,.72); backdrop-filter:blur(16px); }
        .home-topbar__date { color:#64748B; font-size:11px; font-weight:600; text-transform:capitalize; }
        .home-topbar__date span { margin:0 10px; color:#1E3A4C; }
        .home-topbar__actions { display:flex; align-items:center; gap:10px; }
        .home-coins, .home-notification, .home-profile-button { border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); color:#E2E8F0; cursor:pointer; font:inherit; }
        .home-coins { padding:9px 13px; border-color:rgba(251,191,36,.18); border-radius:12px; color:#FDE68A; font-size:12px; font-weight:800; }
        .home-notification { position:relative; width:38px; height:38px; border-radius:12px; font-size:16px; }
        .home-notification i { position:absolute; top:8px; right:8px; width:6px; height:6px; border-radius:50%; background:#67E8F9; box-shadow:0 0 8px #67E8F9; }
        .home-profile-button { display:flex; align-items:center; gap:8px; padding:4px 10px 4px 4px; border-radius:12px; font-size:11px; font-weight:800; }
        .home-profile-button > b { color:#475569; font-size:13px; }
        .home-content { position:relative; z-index:1; max-width:1160px; margin:0 auto; padding:36px 40px 72px; }
        .home-greeting { display:flex; justify-content:space-between; align-items:flex-end; gap:20px; margin-bottom:28px; }
        .home-eyebrow { color:#67E8F9; font-size:11px; font-weight:800; letter-spacing:.22em; }
        .home-greeting h1 { margin:8px 0 0; font-size:34px; letter-spacing:-.035em; }
        .home-greeting h1 em { color:#475569; font-style:normal; }
        .home-greeting p { margin:8px 0 0; color:#64748B; font-size:13px; }
        .home-level { display:flex; align-items:center; gap:12px; padding:12px 16px; border:1px solid rgba(255,255,255,.08); border-radius:16px; background:rgba(255,255,255,.035); flex-shrink:0; }
        .home-level > span { width:36px; height:36px; display:grid; place-items:center; border-radius:12px; background:rgba(251,146,60,.10); font-size:18px; }
        .home-level div { display:flex; flex-direction:column; gap:3px; }
        .home-level strong { color:#fff; font-size:14px; }
        .home-level small { color:#475569; font-size:10px; }
        .home-level > i { width:1px; height:28px; background:rgba(255,255,255,.1); }
        .home-level__xp strong { color:#67E8F9; }
        .home-mission { position:relative; display:flex; justify-content:space-between; gap:28px; overflow:hidden; margin-bottom:32px; padding:28px; border:1px solid rgba(103,232,249,.20); border-radius:24px; background:linear-gradient(135deg,#102E42,#0C2539,#151B47); box-shadow:0 22px 70px rgba(3,16,38,.35); }
        .home-mission__rings { position:absolute; right:-50px; top:-100px; width:290px; height:290px; border-radius:50%; border:34px solid rgba(103,232,249,.07); }
        .home-mission__copy { position:relative; z-index:1; flex:1; }
        .home-mission__meta { display:flex; align-items:center; gap:10px; margin-bottom:14px; }
        .home-mission__meta span { padding:4px 8px; border-radius:6px; background:rgba(103,232,249,.15); color:#67E8F9; font-size:9px; font-weight:900; letter-spacing:.16em; }
        .home-mission__meta small { color:#94A3B8; font-size:10px; }
        .home-mission h2 { max-width:550px; margin:0; font-size:28px; line-height:1.15; letter-spacing:-.025em; }
        .home-mission p { max-width:500px; margin:8px 0 0; color:rgba(203,213,225,.80); font-size:12px; line-height:1.7; }
        .home-mission__buttons { display:flex; align-items:center; flex-wrap:wrap; gap:16px; margin-top:20px; }
        .home-mission__buttons button:first-child { border:0; border-radius:12px; padding:12px 16px; background:#67E8F9; color:#082033; cursor:pointer; font:inherit; font-size:11px; font-weight:900; }
        .home-mission__buttons button:last-child { border:0; background:none; color:#CBD5E1; cursor:pointer; font:inherit; font-size:11px; text-decoration:underline; }
        .home-mission__progress { position:relative; z-index:1; width:260px; align-self:center; padding:16px; border:1px solid rgba(255,255,255,.10); border-radius:16px; background:rgba(7,24,39,.45); }
        .home-mission__progress > div:first-child { display:flex; justify-content:space-between; margin-bottom:12px; }
        .home-mission__progress span { color:#64748B; font-size:10px; font-weight:800; letter-spacing:.13em; }
        .home-mission__progress strong { color:#67E8F9; font-size:14px; }
        .home-progress-bar, .home-pet__bar { height:8px; overflow:hidden; border-radius:99px; background:rgba(255,255,255,.09); }
        .home-progress-bar i, .home-pet__bar i { display:block; height:100%; border-radius:inherit; background:#67E8F9; box-shadow:0 0 10px rgba(103,232,249,.35); }
        .home-mission__progress small { display:block; margin-top:12px; color:#64748B; font-size:10px; }
        .home-section-heading { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .home-section-heading h2 { margin:0; font-size:18px; }
        .home-section-heading h2 span { margin-left:8px; padding:4px 8px; border-radius:99px; background:rgba(103,232,249,.1); color:#67E8F9; font-size:9px; vertical-align:middle; }
        .home-section-heading p { margin:4px 0 0; color:#475569; font-size:11px; }
        .home-section-heading > button { border:0; background:none; color:#67E8F9; cursor:pointer; font:inherit; font-size:11px; font-weight:800; }
        .home-zones { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:26px; }
        .home-zone { position:relative; overflow:hidden; min-height:232px; display:flex; flex-direction:column; padding:20px; border:1px solid rgba(255,255,255,.08); border-radius:20px; background:rgba(11,28,44,.82); color:#fff; cursor:pointer; text-align:left; font:inherit; transition:.18s ease; }
        .home-zone:hover:not(.is-locked), .home-zone.is-selected { transform:translateY(-3px); border-color:var(--zone-accent); background:var(--zone-soft); box-shadow:0 14px 38px rgba(22,184,209,.10); }
        .home-zone.is-locked { opacity:.55; cursor:not-allowed; }
        .home-zone__top { display:flex; justify-content:space-between; align-items:flex-start; }
        .home-zone__icon { width:40px; height:40px; display:grid; place-items:center; border:1px solid color-mix(in srgb,var(--zone-accent) 25%,transparent); border-radius:12px; background:var(--zone-soft); font-size:19px; }
        .home-zone__number { color:#1E3A4C; font-family:monospace; font-size:10px; font-weight:700; letter-spacing:.18em; }
        .home-zone__body { margin-top:20px; }
        .home-zone__label { display:block; color:var(--zone-accent); font-size:10px; font-weight:800; letter-spacing:.13em; }
        .home-zone__body strong { display:block; margin-top:5px; font-size:16px; }
        .home-zone__body small { display:block; margin-top:5px; color:#64748B; font-size:10px; line-height:1.45; }
        .home-zone__progress { margin-top:auto; padding-top:18px; }
        .home-zone__progress span { display:block; margin-bottom:8px; color:#475569; font-size:10px; }
        .home-zone__progress > div { height:6px; overflow:hidden; border-radius:99px; background:rgba(255,255,255,.09); }
        .home-zone__progress i { display:block; height:100%; border-radius:inherit; background:var(--zone-accent); }
        .home-zone__action { display:block; margin-top:14px; color:#475569; font-size:10px; font-weight:900; }
        .home-zone__action b { font-size:14px; }
        .home-zone-detail { display:flex; align-items:center; justify-content:space-between; gap:16px; margin:-10px 0 26px; padding:16px 20px; border:1px solid rgba(103,232,249,.20); border-radius:16px; background:rgba(103,232,249,.07); }
        .home-zone-detail strong { font-size:14px; }
        .home-zone-detail div > div { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
        .home-zone-detail span { padding:3px 9px; border:1px solid rgba(103,232,249,.20); border-radius:99px; color:#67E8F9; font-size:10px; }
        .home-zone-detail button { border:0; border-radius:12px; padding:10px 18px; background:#67E8F9; color:#071321; cursor:pointer; font:inherit; font-size:11px; font-weight:900; }
        .home-section-heading--quick { margin-top:4px; }
        .home-quick-links { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .home-quick-links button { display:flex; align-items:center; gap:12px; padding:12px; border:1px solid rgba(255,255,255,.07); border-radius:16px; background:rgba(11,28,44,.75); color:#E2E8F0; cursor:pointer; text-align:left; font:inherit; }
        .home-quick-links button:hover { border-color:var(--quick-accent); background:rgba(255,255,255,.06); }
        .home-quick-links button > span { width:36px; height:36px; display:grid; place-items:center; border-radius:12px; background:color-mix(in srgb,var(--quick-accent) 13%,transparent); font-size:17px; }
        .home-quick-links strong, .home-quick-links small { display:block; }
        .home-quick-links strong { font-size:11px; }
        .home-quick-links small { margin-top:3px; color:#475569; font-size:9px; }
        .home-pet { display:flex; align-items:center; gap:12px; max-width:440px; margin-top:20px; padding:14px 16px; border:1px solid rgba(99,102,241,.15); border-radius:18px; background:#0E1E35; }
        .home-pet__emoji { font-size:27px; }
        .home-pet > div { flex:1; }
        .home-pet strong { display:block; margin-bottom:7px; font-size:12px; }
        .home-pet__bar { height:6px; }
        .home-pet__bar i { background:#34D399; }
        .home-pet button { border:1px solid rgba(251,191,36,.25); border-radius:10px; padding:7px 10px; background:rgba(251,191,36,.08); color:#FDE68A; cursor:pointer; font:inherit; font-size:10px; font-weight:800; }
        .home-notice { position:fixed; z-index:20; left:50%; bottom:22px; transform:translateX(-50%); display:flex; align-items:center; gap:12px; max-width:calc(100% - 32px); padding:12px 16px; border:1px solid rgba(103,232,249,.22); border-radius:12px; background:#10263A; color:#67E8F9; box-shadow:0 20px 60px rgba(0,0,0,.5); font-size:11px; font-weight:700; }
        .home-notice button { border:0; background:none; color:#475569; cursor:pointer; font-size:16px; }
        .home-bottom-nav { display:none; }
        @media (max-width:1100px) and (min-width:901px) { .home-content { padding-inline:24px; } .home-topbar { padding-inline:24px; } }
        @media (max-width:900px) {
          /* Guru mode: banner kembali jadi fixed di bawah topbar agar tidak tertindih */
          .home-screen--guru .home-teacher-mode {
            position: fixed; top: calc(62px + env(safe-area-inset-top, 0px));
            left: 0; right: 0; z-index: 11;
          }
          /* Tambah padding-top konten supaya tidak tertutup dua bar */
          .home-screen--guru .home-content { padding-top: 122px; }
          .home-topbar { position:fixed; top:0; left:0; right:0; z-index:10; min-height:62px; padding:calc(10px + env(safe-area-inset-top, 0px)) 16px 10px; }
          .home-topbar__date { display:none; }
          .home-topbar__actions { width:100%; justify-content:flex-end; }
          .home-profile-button > span, .home-profile-button > b { display:none; }
          .home-profile-button { padding:3px; border-radius:12px; }
          .home-content { padding:82px 16px 20px; }
          .home-greeting { display:block; margin-bottom:18px; }
          .home-eyebrow { font-size:9px; letter-spacing:.16em; }
          .home-greeting h1 { margin-top:6px; font-size:26px; }
          .home-greeting p { font-size:13px; }
          .home-level { margin-top:16px; justify-content:space-between; }
          .home-level > i { flex:0 0 1px; }
          .home-mission { display:block; margin-bottom:24px; padding:20px; border-radius:22px; }
          .home-mission h2 { font-size:19px; }
          .home-mission p { font-size:11px; }
          .home-mission__progress { width:auto; margin-top:20px; padding:0; border:0; background:none; }
          .home-section-heading h2 { font-size:14px; }
          .home-section-heading h2 span { display:none; }
          .home-section-heading > button { display:none; }
          .home-zones { display:flex; flex-direction:column; gap:10px; margin-bottom:22px; }
          .home-zone { min-height:0; display:grid; grid-template-columns:48px 1fr auto; grid-template-rows:auto auto; column-gap:12px; padding:15px; border-radius:18px; }
          .home-zone__top { grid-row:1 / 3; display:block; }
          .home-zone__number { display:none; }
          .home-zone__icon { width:46px; height:46px; font-size:21px; }
          .home-zone__body { margin:0; }
          .home-zone__label { font-size:9px; }
          .home-zone__body strong { margin-top:4px; font-size:14px; }
          .home-zone__body small { display:none; }
          .home-zone__progress { grid-column:2 / 4; padding-top:8px; }
          .home-zone__progress span { display:none; }
          .home-zone__action { grid-column:3; grid-row:1; margin:0; align-self:center; color:var(--zone-accent); }
          .home-zone__action b { display:none; }
          .home-zone-detail { align-items:flex-start; flex-direction:column; }
          .home-zone-detail button { width:100%; }
          .home-quick-links { grid-template-columns:repeat(2,1fr); gap:10px; }
          .home-quick-links button { padding:10px; }
          .home-pet { max-width:none; }
        }
        @media (max-width:430px) { .home-topbar__actions { gap:6px; } .home-coins { padding-inline:9px; } .home-level { padding:10px 12px; } .home-level__xp { text-align:right; } }
      `}</style>
    </main>
  )
}