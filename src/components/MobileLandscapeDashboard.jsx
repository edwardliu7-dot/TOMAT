import React, { useEffect, useState } from 'react'
import PetSVG, { getPetName } from './PetSVG'
import { UserAvatar } from './shared'

function formatNumber(value) {
  return Number(value || 0).toLocaleString('id-ID')
}

function useLandscapeViewport() {
  const getState = () => window.innerWidth > window.innerHeight && window.innerWidth >= 620
  const [landscape, setLandscape] = useState(getState)

  useEffect(() => {
    const update = () => setLandscape(getState())
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return landscape
}

function RotateDevice() {
  return (
    <main className="landscape-rotate-screen">
      <style>{styles}</style>
      <div className="landscape-rotate-orbit landscape-rotate-orbit--one" />
      <div className="landscape-rotate-orbit landscape-rotate-orbit--two" />
      <div className="landscape-rotate-mark">T</div>
      <div className="landscape-rotate-phone">
        <span />
        <div><b>+</b><b>−</b><b>×</b></div>
      </div>
      <div className="landscape-rotate-arrow">↻</div>
      <p className="landscape-kicker">TOMAT · PETUALANGAN BELAJAR</p>
      <h1>Putar perangkat<br />ke lanskap</h1>
      <p className="landscape-rotate-copy">
        Dunia TOMI menunggu di layar lebar. Miringkan perangkatmu untuk masuk ke cockpit permainan.
      </p>
      <div className="landscape-rotate-dots"><i /><i /><i /></div>
    </main>
  )
}

function ResourcePill({ icon, value, tone = '' }) {
  return <span className={`landscape-resource ${tone}`}><b>{icon}</b>{value}</span>
}

function ActionButton({ icon, label, note, tone, selected, onClick }) {
  return (
    <button type="button" className={`landscape-action ${tone} ${selected ? 'is-selected' : ''}`} onClick={onClick}>
      <span>{icon}</span>
      <div><strong>{label}</strong><small>{note}</small></div>
    </button>
  )
}

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
}) {
  const landscape = useLandscapeViewport()
  const [notice, setNotice] = useState('')
  const [selectedAction, setSelectedAction] = useState('Misi')
  const [notifications, setNotifications] = useState(pendingTaskCount)
  const [arenaEntered, setArenaEntered] = useState(false)

  useEffect(() => setNotifications(pendingTaskCount), [pendingTaskCount])

  const toast = message => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2400)
  }

  const firstZone = zones.find(zone => !zone.locked)
  const levelProgress = Math.min(100, Math.round((Number(player.exp || 0) / Math.max(Number(player.maxExp || 100), 1)) * 100))
  const petState = pet.isDead ? 'dead' : pet.isStarving ? 'hungry' : 'idle'
  const petStatus = pet.isDead ? 'Perlu dihidupkan kembali' : pet.isStarving ? 'Sedang lapar' : 'Siap menjelajah'
  const missionTitle = nextTask?.gameName || firstZone?.title || 'Mulai petualanganmu'
  const missionDescription = nextTask
    ? `Selesaikan ${nextTask.totalQuestions || 5} soal untuk mendapatkan nilai dari gurumu.`
    : 'Pilih zona petualangan dan kumpulkan pengalaman baru hari ini.'

  const openMission = () => {
    if (nextTask) {
      navigate(nextTask.gameKey, { taskId: nextTask.id })
      return
    }
    if (firstZone) navigate(firstZone.id)
  }

  const openArena = () => {
    if (!canUseDemoMoba) {
      toast('Arena MOBA sedang dibuka terbatas untuk akun demo.')
      return
    }
    setArenaEntered(value => !value)
    navigate('moba-lobby')
  }

  const selectAction = (label, action, note) => {
    setSelectedAction(label)
    action()
    if (note) toast(note)
  }

  if (!landscape) return <RotateDevice />

  return (
    <main className="landscape-dashboard">
      <style>{styles}</style>
      <div className="landscape-world-image" />
      <div className="landscape-world-wash" />
      <div className="landscape-world-grid" />

      <header className="landscape-topbar">
        <div className="landscape-brand">
          <span>T</span>
          <div><strong>TOMAT</strong><small>SMARTISA · PETUALANGAN BELAJAR</small></div>
        </div>
        <div className="landscape-resources">
          <ResourcePill icon="🪙" value={formatNumber(player.coins)} tone="gold" />
          <ResourcePill icon="⚡" value={`Lv ${player.level}`} tone="mint" />
          <button type="button" onClick={() => { setNotifications(0); toast('Semua notifikasi sudah dibaca') }} aria-label="Notifikasi" className="landscape-icon-button">
            🔔{notifications > 0 && <b>{notifications}</b>}
          </button>
          <button type="button" onClick={() => toast('Pengaturan cockpit dibuka')} aria-label="Pengaturan" className="landscape-icon-button">⚙</button>
        </div>
      </header>

      <section className="landscape-profile-card">
        <UserAvatar user={user} size={54} />
        <div className="landscape-profile-copy">
          <small>PEMAIN AKTIF</small>
          <h2>{firstName}</h2>
          <span>Penjelajah Pijar <strong>LV. {String(player.level).padStart(2, '0')}</strong></span>
        </div>
        <div className="landscape-level-track">
          <div><span>PROGRES LEVEL</span><b>{formatNumber(player.exp)} / {formatNumber(player.maxExp)} XP</b></div>
          <i><em style={{ width: `${levelProgress}%` }} /></i>
        </div>
      </section>

      <section className="landscape-mission-card">
        <div className="landscape-eyebrow">✦ {nextTask ? 'TUGAS AKTIF' : 'MISI YANG DITUNGGU TOMI'}</div>
        <h1>{missionTitle}</h1>
        <p>{missionDescription}</p>
        <div className="landscape-mission-progress">
          <span>{nextTask ? `${nextTask.totalQuestions || 5} tantangan` : 'Misi baru tersedia'}</span>
          <strong>{nextTask ? `+${(nextTask.totalQuestions || 5) * 10} EXP` : '+40 EXP'}</strong>
          <i><em style={{ width: nextTask ? '18%' : '0%' }} /></i>
        </div>
        <button type="button" onClick={openMission}>LANJUTKAN MISI <b>›</b></button>
      </section>

      <section className="landscape-pet-stage" aria-label={`${getPetName(pet.skin || 'golden')} ${petStatus}`}>
        <div className="landscape-sun-ring" />
        <div className="landscape-pet-glow" />
        <div className="landscape-pet-sprite"><PetSVG skinId={pet.skin || 'golden'} state={petState} size={220} /></div>
        <div className="landscape-pet-caption"><strong>{getPetName(pet.skin || 'golden').toUpperCase()}</strong><small>{petStatus}</small></div>
        <span className="landscape-pet-chip landscape-pet-chip--energy">♥ {pet.isDead ? '0' : pet.hunger}% energi</span>
        <span className="landscape-pet-chip landscape-pet-chip--ready">✦ {pet.isDead ? 'butuh bantuan' : 'siap menjelajah'}</span>
      </section>

      <aside className="landscape-action-rail">
        <div className="landscape-rail-label">AKSI CEPAT</div>
        <ActionButton icon="🧭" label="Misi" note={`${pendingTaskCount} aktif`} tone="coral" selected={selectedAction === 'Misi'} onClick={() => selectAction('Misi', openMission)} />
        <ActionButton icon="♛" label="Peringkat" note="Lihat kelas" tone="violet" selected={selectedAction === 'Peringkat'} onClick={() => selectAction('Peringkat', () => navigate('papanperingkat'))} />
        <ActionButton icon="🛡" label="Koleksi" note={`${grades.length} nilai tersimpan`} tone="teal" selected={selectedAction === 'Koleksi'} onClick={() => selectAction('Koleksi', () => navigate('toko'))} />
        <ActionButton icon="💬" label="Teman" note="Chat guru" tone="gold" selected={selectedAction === 'Teman'} onClick={() => selectAction('Teman', () => navigate('komunikasi'))} />
      </aside>

      <div className="landscape-arena-wrap">
        <button type="button" className={`landscape-arena-cta ${arenaEntered ? 'is-entered' : ''}`} onClick={openArena}>
          <span>{canUseDemoMoba ? '⚔️' : '🚀'}</span>
          <div><small>{canUseDemoMoba ? 'TANTANGAN HARI INI' : 'JALUR BELAJAR'}</small><strong>{canUseDemoMoba ? 'MASUK ARENA' : 'MULAI MISI'}</strong></div>
          <b>›</b>
        </button>
        {!canUseDemoMoba && <small className="landscape-arena-note">Arena MOBA segera hadir</small>}
      </div>

      <button type="button" className="landscape-profile-link" onClick={() => navigate('profile')}>
        <UserAvatar user={user} size={30} /><span>Profil</span>
      </button>

      {pet.isDead && (
        <button type="button" className="landscape-pet-action" onClick={openPetShop}>HIDUPKAN TOMI</button>
      )}
      {notice && <div className="landscape-toast">✦ {notice}<button type="button" onClick={() => setNotice('')}>×</button></div>}
    </main>
  )
}

const styles = `
  .landscape-dashboard,
  .landscape-rotate-screen {
    box-sizing: border-box;
    min-height: 100dvh;
    width: 100%;
    overflow: hidden;
    font-family: "DM Sans", "Avenir Next", system-ui, sans-serif;
  }
  .landscape-dashboard *,
  .landscape-rotate-screen * { box-sizing: border-box; }
  .landscape-dashboard {
    position: relative;
    isolation: isolate;
    background: #153e49;
    color: #fff6d8;
  }
  .landscape-world-image {
    position: absolute;
    inset: 0;
    z-index: -3;
    background: url("/OIP_(1)_1786204149155.webp") center / cover no-repeat;
    filter: saturate(.82) contrast(1.08);
    transform: scale(1.08);
  }
  .landscape-world-wash {
    position: absolute;
    inset: 0;
    z-index: -2;
    background:
      linear-gradient(90deg, rgba(11,35,48,.96) 0%, rgba(14,47,57,.80) 28%, rgba(19,68,73,.30) 63%, rgba(12,31,46,.78) 100%),
      linear-gradient(0deg, rgba(8,28,40,.86), transparent 54%, rgba(13,39,56,.34));
  }
  .landscape-world-grid {
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: .17;
    background-image: linear-gradient(rgba(222,225,175,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(222,225,175,.3) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: linear-gradient(90deg, #000, transparent 86%);
    pointer-events: none;
  }
  .landscape-topbar {
    position: absolute;
    z-index: 5;
    top: 4.2%;
    left: 3.5%;
    right: 3.5%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .landscape-brand { display: flex; align-items: center; gap: 10px; }
  .landscape-brand > span,
  .landscape-rotate-mark {
    display: grid;
    place-items: center;
    width: 39px;
    height: 39px;
    border-radius: 13px 13px 13px 4px;
    background: #eb765c;
    color: #fff1c6;
    font: 800 20px "Space Mono", monospace;
    box-shadow: 4px 5px 0 rgba(8,30,39,.3);
  }
  .landscape-brand strong { display: block; letter-spacing: .2em; font-size: 15px; }
  .landscape-brand small {
    display: block;
    margin-top: 2px;
    color: #bcd0b5;
    font: 700 7px "Space Mono", monospace;
    letter-spacing: .08em;
  }
  .landscape-resources { display: flex; align-items: center; gap: 8px; }
  .landscape-resource,
  .landscape-icon-button {
    height: 34px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 11px;
    border: 1px solid rgba(251,226,160,.25);
    border-radius: 10px;
    background: rgba(12,46,57,.72);
    color: #f9dc91;
    font: 700 10px "Space Mono", monospace;
    backdrop-filter: blur(9px);
  }
  .landscape-resource.mint { color: #8fe1c8; }
  .landscape-icon-button {
    position: relative;
    width: 35px;
    padding: 0;
    justify-content: center;
    color: #e4e7c0;
    cursor: pointer;
  }
  .landscape-icon-button:hover { background: #327b78; transform: translateY(-2px); }
  .landscape-icon-button > b {
    position: absolute;
    top: -5px;
    right: -3px;
    display: grid;
    place-items: center;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #ee775c;
    color: #fff3cf;
    font-size: 8px;
  }
  .landscape-profile-card {
    position: absolute;
    z-index: 4;
    top: 16%;
    left: 3.5%;
    display: flex;
    align-items: center;
    gap: 10px;
    width: min(31vw, 355px);
    padding: 14px;
    border: 1px solid rgba(255,225,159,.3);
    border-radius: 15px;
    background: rgba(12,43,52,.78);
    box-shadow: 0 15px 30px rgba(2,25,35,.3);
    backdrop-filter: blur(12px);
  }
  .landscape-profile-copy { min-width: 88px; }
  .landscape-profile-copy small,
  .landscape-level-track span {
    color: #aec9b3;
    font: 700 8px "Space Mono", monospace;
    letter-spacing: .1em;
  }
  .landscape-profile-copy h2 { margin: 3px 0; font-size: 15px; }
  .landscape-profile-copy > span { color: #c6d7c1; font-size: 10px; }
  .landscape-profile-copy strong {
    margin-left: 4px;
    padding: 3px 5px;
    border-radius: 4px;
    background: #e6af5b;
    color: #4e3641;
    font: 700 8px "Space Mono", monospace;
  }
  .landscape-level-track { flex: 1; align-self: flex-end; }
  .landscape-level-track > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }
  .landscape-level-track b {
    color: #f0cf87;
    font: 700 8px "Space Mono", monospace;
    white-space: nowrap;
  }
  .landscape-level-track > i,
  .landscape-mission-progress > i {
    display: block;
    height: 5px;
    margin-top: 6px;
    overflow: hidden;
    border-radius: 99px;
    background: rgba(232,220,170,.2);
  }
  .landscape-level-track em,
  .landscape-mission-progress em {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: #e9a85b;
  }
  .landscape-mission-card {
    position: absolute;
    z-index: 4;
    bottom: 15%;
    left: 3.5%;
    width: min(32vw, 365px);
    padding: 16px 17px;
    border: 1px solid rgba(255,220,151,.35);
    border-radius: 17px;
    background: linear-gradient(135deg, rgba(22,71,72,.9), rgba(14,45,59,.86));
    box-shadow: 0 18px 38px rgba(3,27,37,.33);
    backdrop-filter: blur(10px);
  }
  .landscape-mission-card::after {
    content: "";
    position: absolute;
    top: -27px;
    right: -25px;
    width: 100px;
    height: 100px;
    border: 13px solid rgba(232,172,101,.1);
    border-radius: 50%;
  }
  .landscape-eyebrow {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #f4c570;
    font: 700 8px "Space Mono", monospace;
    letter-spacing: .1em;
  }
  .landscape-mission-card h1 {
    margin: 9px 0 5px;
    font-size: clamp(18px, 2.2vw, 27px);
    line-height: 1.04;
    letter-spacing: -.04em;
  }
  .landscape-mission-card p {
    max-width: 270px;
    margin: 0;
    color: #c4d1bb;
    font-size: 10px;
    line-height: 1.45;
  }
  .landscape-mission-progress {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 13px;
    color: #b8cdb5;
    font-size: 9px;
  }
  .landscape-mission-progress strong { color: #f1b980; font: 700 9px "Space Mono", monospace; }
  .landscape-mission-progress > i { position: absolute; right: 0; bottom: -9px; left: 0; }
  .landscape-mission-progress em { background: #e98368; }
  .landscape-mission-card > button {
    display: flex;
    align-items: center;
    gap: 3px;
    margin-top: 21px;
    padding: 0;
    border: 0;
    background: none;
    color: #fff0bd;
    cursor: pointer;
    font: 800 9px "Space Mono", monospace;
  }
  .landscape-mission-card > button:hover { color: #ffad89; gap: 7px; }
  .landscape-pet-stage {
    position: absolute;
    z-index: 3;
    top: 21%;
    right: 24%;
    bottom: 10%;
    left: 36%;
    display: grid;
    place-items: center;
  }
  .landscape-sun-ring {
    position: absolute;
    width: min(35vw, 390px);
    height: min(35vw, 390px);
    border: 1px solid rgba(255,218,151,.3);
    border-radius: 50%;
    box-shadow: 0 0 0 24px rgba(255,208,135,.06), 0 0 0 54px rgba(255,208,135,.04);
  }
  .landscape-pet-glow {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(239,131,100,.22);
    filter: blur(35px);
    animation: landscape-breathe 4s ease-in-out infinite;
  }
  .landscape-pet-sprite {
    position: relative;
    z-index: 1;
    animation: landscape-float 4s ease-in-out infinite;
    filter: drop-shadow(0 14px 0 rgba(12,43,49,.27));
  }
  .landscape-pet-caption {
    position: absolute;
    bottom: 1%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .landscape-pet-caption strong {
    color: #ffe6a7;
    font: 800 17px "Space Mono", monospace;
    letter-spacing: .18em;
  }
  .landscape-pet-caption small { color: #bdd0b8; font-size: 9px; }
  .landscape-pet-chip {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 9px;
    border: 1px solid rgba(255,227,161,.28);
    border-radius: 999px;
    background: rgba(13,49,59,.74);
    color: #e8dbad;
    font: 700 9px "Space Mono", monospace;
    backdrop-filter: blur(9px);
  }
  .landscape-pet-chip--energy { top: 32%; right: 3%; color: #ffb69a; }
  .landscape-pet-chip--ready { bottom: 24%; left: 3%; color: #9ddfca; }
  .landscape-action-rail {
    position: absolute;
    z-index: 4;
    top: 22%;
    right: 3.5%;
    bottom: 14%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 156px;
  }
  .landscape-rail-label {
    margin-bottom: 2px;
    color: #d3d7b1;
    font: 700 8px "Space Mono", monospace;
    letter-spacing: .15em;
  }
  .landscape-action {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px;
    border: 1px solid rgba(242,222,162,.18);
    border-radius: 12px;
    background: rgba(11,44,55,.72);
    color: #e8e5c7;
    text-align: left;
    cursor: pointer;
    backdrop-filter: blur(9px);
    transition: .2s;
  }
  .landscape-action:hover,
  .landscape-action.is-selected { transform: translateX(-4px); border-color: rgba(255,196,125,.7); background: rgba(43,94,91,.87); }
  .landscape-action > span {
    display: grid;
    place-items: center;
    width: 31px;
    height: 31px;
    border-radius: 9px;
    font-size: 16px;
  }
  .landscape-action.coral > span { background: rgba(231,117,91,.25); color: #ffa489; }
  .landscape-action.violet > span { background: rgba(128,116,201,.28); color: #c2b9ff; }
  .landscape-action.teal > span { background: rgba(75,184,163,.25); color: #91e4c8; }
  .landscape-action.gold > span { background: rgba(228,178,83,.23); color: #f3cf86; }
  .landscape-action strong,
  .landscape-action small { display: block; }
  .landscape-action strong { font-size: 10px; }
  .landscape-action small { margin-top: 2px; color: #a7c1b1; font-size: 8px; }
  .landscape-arena-wrap {
    position: absolute;
    z-index: 5;
    right: 3.5%;
    bottom: 10%;
  }
  .landscape-arena-cta {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 205px;
    padding: 10px 12px;
    border: 1px solid #ffd994;
    border-radius: 14px;
    background: linear-gradient(135deg, #eb765d, #ce5d5c);
    color: #fff3cc;
    box-shadow: 0 10px 0 rgba(104,48,56,.38), 0 18px 30px rgba(7,28,37,.35);
    cursor: pointer;
    transition: .2s;
  }
  .landscape-arena-cta:hover { transform: translateY(-4px); filter: saturate(1.12); }
  .landscape-arena-cta.is-entered { background: linear-gradient(135deg, #398e88, #27736f); }
  .landscape-arena-cta > span {
    display: grid;
    place-items: center;
    width: 37px;
    height: 37px;
    border-radius: 10px;
    background: rgba(255,244,197,.2);
    font-size: 19px;
  }
  .landscape-arena-cta small,
  .landscape-arena-cta strong { display: block; text-align: left; }
  .landscape-arena-cta small { color: #ffe2a7; font: 700 7px "Space Mono", monospace; letter-spacing: .08em; }
  .landscape-arena-cta strong { margin-top: 2px; font: 800 15px "Space Mono", monospace; }
  .landscape-arena-cta > b { margin-left: auto; font-size: 20px; }
  .landscape-arena-note { display: block; margin-top: 8px; color: #d7c58c; text-align: right; font-size: 9px; }
  .landscape-profile-link {
    position: absolute;
    z-index: 6;
    right: 3.5%;
    bottom: 3%;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    border: 0;
    background: none;
    color: #d3d7b1;
    cursor: pointer;
    font: 700 9px "Space Mono", monospace;
  }
  .landscape-pet-action {
    position: absolute;
    z-index: 7;
    bottom: 3%;
    left: 36%;
    padding: 7px 10px;
    border: 1px solid rgba(255,210,125,.5);
    border-radius: 9px;
    background: rgba(176,81,73,.8);
    color: #fff0bd;
    cursor: pointer;
    font: 800 8px "Space Mono", monospace;
  }
  .landscape-toast {
    position: absolute;
    z-index: 20;
    bottom: 5%;
    left: 50%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 13px;
    border: 1px solid rgba(255,224,157,.35);
    border-radius: 999px;
    background: rgba(10,42,52,.92);
    color: #f7e8bb;
    font-size: 10px;
    box-shadow: 0 12px 27px rgba(1,23,31,.35);
    transform: translateX(-50%);
  }
  .landscape-toast button { padding: 0; border: 0; background: none; color: #a8c6b6; cursor: pointer; font-size: 15px; }
  .landscape-rotate-screen {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    overflow: hidden;
    background: #103e49;
    color: #fff4d1;
    text-align: center;
  }
  .landscape-rotate-screen::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: .22;
    background-image: radial-gradient(#f6d78d 1px, transparent 1px);
    background-size: 22px 22px;
  }
  .landscape-rotate-orbit { position: absolute; border: 1px solid rgba(248,203,131,.22); border-radius: 50%; }
  .landscape-rotate-orbit--one { top: -80px; right: -100px; width: 290px; height: 290px; }
  .landscape-rotate-orbit--two { bottom: -70px; left: -90px; width: 230px; height: 230px; border-color: rgba(109,213,183,.2); }
  .landscape-rotate-mark { position: absolute; top: 8%; left: 8%; }
  .landscape-rotate-phone {
    position: relative;
    width: 98px;
    height: 166px;
    margin-bottom: 22px;
    border: 3px solid #ffda98;
    border-radius: 18px;
    background: #1d6b70;
    box-shadow: 11px 12px 0 rgba(5,29,39,.26);
    transform: rotate(-18deg);
    animation: landscape-tilt 3.4s ease-in-out infinite;
  }
  .landscape-rotate-phone > span { position: absolute; top: 8px; left: 35px; width: 25px; height: 5px; border-radius: 9px; background: #ffda98; }
  .landscape-rotate-phone > div {
    position: absolute;
    inset: 25px 9px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 11px;
    border-radius: 10px;
    background: linear-gradient(#46a99a, #2e7978);
    color: #fbd68c;
    font: 700 19px "Space Mono", monospace;
  }
  .landscape-rotate-arrow { position: absolute; top: 38%; right: 22%; color: #e9866b; font-size: 32px; animation: landscape-arrow 1.5s ease-in-out infinite; }
  .landscape-kicker { margin: 0; color: #83d0b2; font: 700 8px "Space Mono", monospace; letter-spacing: .18em; }
  .landscape-rotate-screen h1 { margin: 8px 0; font-size: clamp(26px, 8vw, 40px); line-height: 1.01; letter-spacing: -.05em; }
  .landscape-rotate-copy { max-width: 270px; margin: 0; color: #bbd2bc; font-size: 12px; line-height: 1.45; }
  .landscape-rotate-dots { display: flex; gap: 5px; margin-top: 20px; }
  .landscape-rotate-dots i { width: 5px; height: 5px; border-radius: 50%; background: #edaa69; }
  .landscape-rotate-dots i:nth-child(2) { background: #e77b62; }
  .landscape-rotate-dots i:nth-child(3) { background: #68c4ac; }
  @keyframes landscape-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes landscape-breathe { 0%,100% { transform: scale(.9); opacity: .65; } 50% { transform: scale(1.08); opacity: 1; } }
  @keyframes landscape-tilt { 0%,100% { transform: rotate(-18deg) translateY(0); } 50% { transform: rotate(-18deg) translateY(-7px); } }
  @keyframes landscape-arrow { 0%,100% { transform: rotate(0) translateX(0); } 50% { transform: rotate(90deg) translateX(5px); } }
  @media (max-width: 860px) and (orientation: landscape) {
    .landscape-topbar { top: 3%; left: 2.5%; right: 2.5%; }
    .landscape-brand small { display: none; }
    .landscape-resource { padding: 0 7px; }
    .landscape-profile-card { top: 14%; left: 2.5%; width: 33vw; transform: scale(.88); transform-origin: left top; }
    .landscape-mission-card { bottom: 12%; left: 2.5%; width: 34vw; transform: scale(.88); transform-origin: left bottom; }
    .landscape-pet-stage { top: 18%; right: 22%; bottom: 7%; left: 34%; }
    .landscape-action-rail { top: 17%; right: 2.5%; bottom: 12%; width: 130px; gap: 5px; }
    .landscape-action { padding: 7px; }
    .landscape-action > span { width: 27px; height: 27px; }
    .landscape-arena-wrap { right: 2.5%; bottom: 6%; }
    .landscape-profile-link { right: 2.5%; bottom: 1.5%; }
    .landscape-pet-chip--ready { display: none; }
  }
  @media (max-height: 430px) and (orientation: landscape) {
    .landscape-pet-sprite { transform: scale(.78); }
    .landscape-pet-caption { bottom: -2%; }
    .landscape-mission-card { padding: 12px 14px; }
    .landscape-mission-card p { display: none; }
    .landscape-mission-card > button { margin-top: 15px; }
  }
`
