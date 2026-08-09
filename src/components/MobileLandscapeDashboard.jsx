import React, { useEffect, useState } from 'react'
import PetSVG, { getPetName } from './PetSVG'
import { UserAvatar } from './shared'
import SeasonalEventBanner from './SeasonalEventBanner'

function formatNumber(value) {
  return Number(value || 0).toLocaleString('id-ID')
}

// ── ZonaDashboard ─────────────────────────────────────────────────────────────
// Layout: ZONA ATAS (header bar) + 3 kolom utama (kiri/tengah/kanan)
// Responsif: desktop landscape, mobile landscape, portrait (stack)
// ─────────────────────────────────────────────────────────────────────────────
export default function MobileLandscapeDashboard({
  user,
  player,
  pet,
  nextTask,
  pendingTaskCount,
  grades,
  firstName,
  zones,
  canUseDemoMoba,
  navigate,
  openPetShop,
  openEventShop,
}) {
  const [notice, setNotice] = useState('')
  const [petFed, setPetFed] = useState(false)

  const toast = msg => { setNotice(msg); window.setTimeout(() => setNotice(''), 2400) }

  // Derived values
  const levelProgress = Math.min(100, Math.round((Number(player?.exp || 0) / Math.max(Number(player?.maxExp || 1000), 1)) * 100))
  const petState = pet?.isDead ? 'dead' : pet?.isStarving ? 'hungry' : 'idle'
  const petName = getPetName(pet?.skin || 'golden')
  const hungerPct = pet?.isDead ? 0 : Math.min(100, pet?.hunger ?? 100)
  const hungerColor = hungerPct > 60 ? '#5dcaa5' : hungerPct > 30 ? '#fac775' : '#f0997b'

  // User grade zone
  const gradeNum = parseInt(user?.kelas?.match(/\d+/)?.[0] || '7')
  const mathZoneId = gradeNum === 9 ? 'grade9' : gradeNum === 8 ? 'grade8' : 'grade7'
  const ipaZoneId  = gradeNum === 9 ? 'ipa9'   : gradeNum === 8 ? 'ipa8'   : 'ipa7'

  const handleFeed = () => {
    if (pet?.isDead) { openPetShop?.(); return }
    setPetFed(true)
    toast('Tomi makan! 🎉')
    fetch('/api/siswa/pet/feed', { method: 'POST', credentials: 'include' }).catch(() => {})
    window.setTimeout(() => setPetFed(false), 1200)
  }

  const RIGHT_ZONES = [
    { id: mathZoneId, bg: 'linear-gradient(160deg,#4a3fa8,#3c3489)', shadow: 'rgba(60,52,137,0.45)', icon: '➕', title: 'Zona Matematika', sub: `Kelas ${gradeNum}`, textColor: '#eeedfe', subColor: '#cecbf6' },
    { id: ipaZoneId,  bg: 'linear-gradient(160deg,#0d6b55,#085041)', shadow: 'rgba(8,80,65,0.45)',   icon: '🧪', title: 'Zona IPA',        sub: `Kelas ${gradeNum}`, textColor: '#e1f5ee', subColor: '#9fe1cb' },
    { id: 'arena',    bg: 'linear-gradient(160deg,#8c3518,#712b13)', shadow: 'rgba(113,43,19,0.5)', icon: '⚔️', title: 'Arena Tanding',  sub: 'Duel · Boss · MOBA', textColor: '#faece7', subColor: '#f5c4b3', badge: 'LIVE' },
  ]

  const NAV_ITEMS = [
    { icon: '🛒', label: 'Toko',    id: 'toko' },
    { icon: '🏅', label: 'Lencana', id: 'lencana' },
    { icon: '👑', label: 'Rank',    id: 'papanperingkat' },
    { icon: '👤', label: 'Profil',  id: 'profile' },
  ]

  return (
    <div className="zd-root">
      <style>{CSS}</style>

      {/* Wallpaper layers */}
      <div className="zd-bg-img" />
      <div className="zd-bg-wash" />

      {/* ── ZONA ATAS ─────────────────────────────── */}
      <header className="zd-topbar">
        {/* Avatar + Nama */}
        <div className="zd-identity">
          <UserAvatar user={user} size={30} />
          <div>
            <div className="zd-name">{firstName || user?.name || 'Siswa'}</div>
            <div className="zd-sub-row">
              <span className="zd-level-badge">Lv {player?.level ?? 1}</span>
              <span className="zd-rank-label">Penjelajah Pijar</span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="zd-xp-wrap">
          <div className="zd-xp-labels">
            <span>XP</span>
            <span style={{ color: '#5dcaa5' }}>{formatNumber(player?.exp)} / {formatNumber(player?.maxExp || 1000)}</span>
          </div>
          <div className="zd-xp-track"><div className="zd-xp-fill" style={{ width: `${levelProgress}%` }} /></div>
        </div>

        {/* Coins + utils */}
        <div className="zd-top-right">
          <div className="zd-coin-pill">🪙 {formatNumber(player?.coins)}</div>
          <div className="zd-icon-btn" onClick={() => navigate('grades')} title="Nilai">📊</div>
          <div className="zd-icon-btn" onClick={() => navigate('profile')} title="Profil">⚙️</div>
        </div>
      </header>

      {/* ── KONTEN UTAMA 3 KOLOM ──────────────────── */}
      <div className="zd-body">

        {/* ZONA KIRI */}
        <div className="zd-col-left">
          {/* Event banner (if active) */}
          <div className="zd-event-slot">
            <SeasonalEventBanner onOpenEventShop={openEventShop} />
          </div>

          {/* Tugas aktif */}
          <div className="zd-task-card">
            <div className="zd-eyebrow green">TUGAS AKTIF</div>
            {nextTask ? (
              <>
                <div className="zd-task-title">{nextTask.gameName || 'Tugas'}</div>
                <div className="zd-task-sub">Kerjakan sebelum batas waktu</div>
                <div className="zd-bar-wrap">
                  <div className="zd-bar-fill" style={{ width: '20%', background: '#5dcaa5' }} />
                </div>
                <div className="zd-task-note">0 / {nextTask.totalQuestions || 5} soal</div>
                <button className="zd-task-btn" onClick={() => navigate(nextTask.gameKey, { taskId: nextTask.id })}>Kerjakan ›</button>
              </>
            ) : (
              <>
                <div className="zd-task-title">Masuk Zona</div>
                <div className="zd-task-sub">Pilih zona & mulai belajar</div>
                <div className="zd-bar-wrap"><div className="zd-bar-fill" style={{ width: '0%', background: '#5dcaa5' }} /></div>
                <button className="zd-task-btn" onClick={() => navigate(mathZoneId)}>Mulai ›</button>
              </>
            )}
          </div>

          {/* Quick links row */}
          <div className="zd-quick-row">
            <div className="zd-quick-chip" onClick={() => navigate('hafalan')}>📖 <span>Hafalan</span></div>
            <div className="zd-quick-chip accent" onClick={() => navigate('latihan-ujian')}>✏️ <span>Ujian</span></div>
            <div className="zd-quick-chip" onClick={() => navigate('komunikasi')}>💬 <span>Chat</span></div>
          </div>
        </div>

        {/* ZONA TENGAH */}
        <div className="zd-col-center">
          {/* Pet area */}
          <div className="zd-pet-area">
            <div className="zd-welcome">Selamat datang, {firstName}!</div>

            <div className="zd-pet-stage">
              <div className="zd-pet-shadow" />
              <div className={`zd-pet-sprite ${petFed ? 'zd-pet-fed' : ''}`}>
                <PetSVG skinId={pet?.skin || 'golden'} state={petState} size={110} />
              </div>
            </div>

            <div className="zd-pet-name">{petName}</div>

            {/* Hunger bar */}
            <div className="zd-hunger-card">
              <div className="zd-hunger-labels">
                <span>Lapar</span>
                <span style={{ color: hungerColor }}>{hungerPct}%</span>
              </div>
              <div className="zd-bar-wrap">
                <div className="zd-bar-fill" style={{ width: `${hungerPct}%`, background: `linear-gradient(90deg,${hungerColor},${hungerColor}88)` }} />
              </div>
            </div>

            {/* Pet actions */}
            <div className="zd-pet-actions">
              <button className="zd-feed-btn" onClick={handleFeed}>
                {pet?.isDead ? '💊 Hidupkan' : '🍖 Beri Makan'}
              </button>
              <button className="zd-shop-btn" onClick={() => navigate('toko')}>🛍</button>
            </div>
          </div>

          {/* Bottom nav bar */}
          <div className="zd-bottom-bar">
            <div className="zd-chat-preview" onClick={() => navigate('komunikasi')}>
              <span>💬</span>
              <span className="zd-chat-text">Chat kelas...</span>
              {pendingTaskCount > 0 && <div className="zd-badge">{pendingTaskCount}</div>}
            </div>
            {NAV_ITEMS.map(n => (
              <div key={n.id} className="zd-nav-item" onClick={() => navigate(n.id)}>
                <span className="zd-nav-icon">{n.icon}</span>
                <span className="zd-nav-label">{n.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ZONA KANAN — 3 pintu */}
        <div className="zd-col-right">
          {RIGHT_ZONES.map(z => (
            <div key={z.id} className="zd-door" style={{ background: z.bg, boxShadow: `0 3px 10px ${z.shadow}` }} onClick={() => navigate(z.id)}>
              {z.badge && <div className="zd-door-badge">{z.badge}</div>}
              <div className="zd-door-shimmer" />
              <span className="zd-door-icon">{z.icon}</span>
              <div>
                <div className="zd-door-title" style={{ color: z.textColor }}>{z.title}</div>
                <div className="zd-door-sub" style={{ color: z.subColor }}>{z.sub}</div>
                <div className="zd-door-cta" style={{ color: z.textColor }}>▶ Masuk</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {notice && <div className="zd-toast">✦ {notice}</div>}
    </div>
  )
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  .zd-root {
    position: relative;
    width: 100%;
    min-height: 100dvh;
    background: #12172b;
    color: #f2ede3;
    font-family: "DM Sans", system-ui, sans-serif;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  .zd-root * { box-sizing: border-box; }

  /* ── Wallpaper ── */
  .zd-bg-img {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: url("/wallpaper-dashboard.png") center 72% / cover no-repeat;
    filter: saturate(1.05) contrast(1.06) brightness(0.82);
    pointer-events: none;
  }
  .zd-bg-wash {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(90deg, rgba(10,8,22,.96) 0%, rgba(18,12,36,.84) 24%, rgba(28,16,40,.22) 58%, rgba(14,10,30,.85) 100%),
      linear-gradient(0deg, rgba(8,6,20,.94), transparent 50%, rgba(20,10,30,.28));
    pointer-events: none;
  }

  /* ── Top bar ── */
  .zd-topbar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px 6px;
    border-bottom: 0.5px solid #1e2644;
    flex-shrink: 0;
    gap: 10px;
  }
  .zd-identity { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .zd-name { color: #f2ede3; font-size: 12px; font-weight: 600; letter-spacing: 0.3px; }
  .zd-sub-row { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
  .zd-level-badge { background: #3c3489; border-radius: 3px; padding: 1px 5px; color: #cecbf6; font-size: 8px; font-weight: 700; }
  .zd-rank-label { color: #5a6180; font-size: 8px; }
  .zd-xp-wrap { flex: 1; max-width: 200px; margin: 0 10px; }
  .zd-xp-labels { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 8px; color: #5a6180; }
  .zd-xp-track { height: 4px; background: #1c2340; border-radius: 2px; overflow: hidden; }
  .zd-xp-fill { height: 4px; background: linear-gradient(90deg,#5dcaa5,#3aaa85); border-radius: 2px; transition: width .5s; }
  .zd-top-right { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
  .zd-coin-pill { background: #1c2340; border: 0.5px solid #313a5c; border-radius: 7px; padding: 4px 9px; color: #fac775; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 3px; }
  .zd-icon-btn { background: #1c2340; border: 0.5px solid #313a5c; border-radius: 7px; width: 28px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 13px; cursor: pointer; transition: background .15s; }
  .zd-icon-btn:hover { background: #2a3158; }

  /* ── Body 3 cols ── */
  .zd-body {
    position: relative;
    z-index: 10;
    flex: 1;
    display: grid;
    grid-template-columns: 148px 1fr 162px;
    gap: 8px;
    padding: 8px 12px 10px;
    min-height: 0;
  }

  /* ── Left col ── */
  .zd-col-left { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .zd-event-slot > * { font-size: 9px !important; border-radius: 9px !important; margin: 0 !important; }
  .zd-task-card {
    background: rgba(28,35,64,0.82);
    border: 0.5px solid #313a5c;
    border-radius: 10px;
    padding: 9px 10px;
    flex: 1;
    min-height: 0;
    backdrop-filter: blur(8px);
  }
  .zd-eyebrow { font-size: 7.5px; font-weight: 700; letter-spacing: 0.8px; margin-bottom: 4px; }
  .zd-eyebrow.green { color: #5dcaa5; }
  .zd-task-title { color: #f2ede3; font-size: 11px; font-weight: 600; line-height: 1.3; }
  .zd-task-sub { color: #8b8f9e; font-size: 8px; margin-top: 2px; }
  .zd-bar-wrap { height: 3px; background: #2a3158; border-radius: 2px; margin: 5px 0 2px; overflow: hidden; }
  .zd-bar-fill { height: 3px; border-radius: 2px; transition: width .4s; }
  .zd-task-note { color: #5a6180; font-size: 7.5px; }
  .zd-task-btn { margin-top: 7px; padding: 4px 10px; background: linear-gradient(135deg,#e2653f,#c94f2d); border: none; border-radius: 6px; color: #fff; font-size: 9px; font-weight: 700; cursor: pointer; }
  .zd-quick-row { display: flex; gap: 5px; flex-shrink: 0; }
  .zd-quick-chip { flex: 1; background: rgba(28,35,64,0.82); border: 0.5px solid #313a5c; border-radius: 8px; padding: 5px 6px; display: flex; align-items: center; gap: 4px; font-size: 9px; color: #c9cdd8; cursor: pointer; white-space: nowrap; overflow: hidden; backdrop-filter: blur(6px); }
  .zd-quick-chip span { overflow: hidden; text-overflow: ellipsis; }
  .zd-quick-chip:hover { background: #2a3158; }
  .zd-quick-chip.accent { background: linear-gradient(135deg,rgba(26,58,42,0.9),rgba(15,42,30,0.9)); border-color: #2a5040; color: #5dcaa5; }

  /* ── Center col ── */
  .zd-col-center { display: flex; flex-direction: column; gap: 6px; min-height: 0; min-width: 0; }
  .zd-pet-area { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 4px; gap: 4px; min-height: 0; }
  .zd-welcome { color: #8b8f9e; font-size: 9px; flex-shrink: 0; margin-bottom: auto; margin-top: 4px; }
  .zd-pet-stage {
    position: relative;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .zd-pet-shadow {
    width: 72px;
    height: 10px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.38) 0%, transparent 70%);
    border-radius: 50%;
    margin-top: -4px; /* tucked under the pet's feet */
    flex-shrink: 0;
  }
  .zd-pet-sprite { filter: drop-shadow(0 4px 4px rgba(12,8,25,0.28)); }
  .zd-pet-sprite.zd-pet-fed { animation: zd-fed .4s ease-out; }
  .zd-pet-name { color: #f2ede3; font-size: 11px; font-weight: 600; flex-shrink: 0; }
  .zd-hunger-card { width: 88%; background: rgba(28,35,64,0.75); border-radius: 7px; padding: 5px 8px; flex-shrink: 0; backdrop-filter: blur(6px); }
  .zd-hunger-labels { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 7.5px; color: #5a6180; }
  .zd-pet-actions { display: flex; gap: 5px; width: 88%; flex-shrink: 0; }
  .zd-feed-btn { flex: 1; background: linear-gradient(135deg,#e2653f,#c94f2d); border: none; border-radius: 7px; padding: 5px 0; color: #fff; font-size: 9px; font-weight: 700; cursor: pointer; }
  .zd-shop-btn { background: rgba(28,35,64,0.82); border: 0.5px solid #313a5c; border-radius: 7px; padding: 5px 10px; color: #8b8f9e; font-size: 14px; cursor: pointer; }

  /* Bottom bar */
  .zd-bottom-bar { display: flex; gap: 5px; flex-shrink: 0; }
  .zd-chat-preview { flex: 1; background: rgba(28,35,64,0.85); border: 0.5px solid #313a5c; border-radius: 8px; padding: 5px 8px; display: flex; align-items: center; gap: 5px; cursor: pointer; min-width: 0; backdrop-filter: blur(6px); }
  .zd-chat-text { color: #5a6180; font-size: 9px; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .zd-badge { background: #e2653f; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 7px; font-weight: 700; flex-shrink: 0; }
  .zd-nav-item { background: rgba(28,35,64,0.85); border: 0.5px solid #313a5c; border-radius: 8px; padding: 5px 7px; min-width: 34px; display: flex; flex-direction: column; align-items: center; gap: 1px; cursor: pointer; backdrop-filter: blur(6px); flex-shrink: 0; }
  .zd-nav-item:hover { background: #2a3158; }
  .zd-nav-icon { font-size: 14px; }
  .zd-nav-label { color: #5a6180; font-size: 7px; }

  /* ── Right col — 3 doors ── */
  .zd-col-right { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .zd-door {
    flex: 1;
    border-radius: 10px;
    padding: 9px 11px;
    display: flex;
    align-items: center;
    gap: 9px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform .15s, filter .15s;
  }
  .zd-door:hover { transform: translateX(-3px); filter: brightness(1.08); }
  .zd-door-shimmer { position: absolute; top: -20px; right: -20px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.06); pointer-events: none; }
  .zd-door-badge { position: absolute; top: 5px; right: 7px; background: #f0997b; border-radius: 3px; padding: 1px 5px; color: #4a1b0c; font-size: 7px; font-weight: 700; }
  .zd-door-icon { font-size: 22px; flex-shrink: 0; }
  .zd-door-title { font-size: 10.5px; font-weight: 700; line-height: 1.2; }
  .zd-door-sub { font-size: 8.5px; margin-top: 2px; opacity: 0.8; }
  .zd-door-cta { margin-top: 5px; background: rgba(255,255,255,0.14); border-radius: 4px; padding: 2px 8px; display: inline-block; font-size: 8px; font-weight: 700; }

  /* ── Toast ── */
  .zd-toast {
    position: fixed;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99;
    background: rgba(10,8,25,0.92);
    border: 0.5px solid rgba(255,224,157,.35);
    border-radius: 999px;
    padding: 9px 16px;
    color: #f7e8bb;
    font-size: 10px;
    backdrop-filter: blur(10px);
    white-space: nowrap;
  }

  /* ── Keyframes ── */
  @keyframes zd-fed { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }

  /* ── Desktop (>= 1024px) ── */
  @media (min-width: 1024px) {
    .zd-body { grid-template-columns: 200px 1fr 200px; gap: 14px; padding: 12px 20px 16px; }
    .zd-topbar { padding: 10px 20px 8px; }
    .zd-xp-wrap { max-width: 280px; }
    .zd-door-icon { font-size: 26px; }
    .zd-door-title { font-size: 12px; }
    .zd-task-title { font-size: 13px; }
  }

  /* ── Compact landscape (height < 430px) ── */
  @media (max-height: 430px) {
    .zd-welcome { display: none; }
    .zd-hunger-card { padding: 3px 7px; }
    .zd-pet-name { font-size: 9px; }
  }

  /* ── Portrait mobile — stack vertically ── */
  @media (max-width: 619px), (orientation: portrait) and (max-width: 900px) {
    .zd-body {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      overflow-y: auto;
      padding: 8px 12px 80px;
      gap: 10px;
    }
    .zd-col-left { order: 2; }
    .zd-col-center { order: 1; }
    .zd-col-right { order: 3; flex-direction: row; }
    .zd-door { flex: 1; flex-direction: column; text-align: center; padding: 10px 6px; gap: 4px; }
    .zd-door-icon { font-size: 20px; }
    .zd-door-title { font-size: 9px; }
    .zd-door-sub, .zd-door-cta { display: none; }
    .zd-bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: rgba(18,23,43,0.96); border-top: 0.5px solid #1e2644; padding: 6px 12px; z-index: 50; backdrop-filter: blur(10px); }
    .zd-xp-wrap { display: none; }
  }
`
