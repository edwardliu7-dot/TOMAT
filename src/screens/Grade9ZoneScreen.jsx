import React, { useState, useEffect } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { useTask, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'
import { useBabLock } from '../BabLockContext'
import { GRADE_BAB_LABELS } from '../gamesCatalog'
import { useBossRaid } from '../hooks/useBossRaid'
import VideoMateriPanel from '../components/VideoMateriPanel'

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

const ACCENT = '#34D399'

const BABS = [
  {
    id: 'I', color: '#67E8F9',
    missions: [
      { key: 'g9manifest',     emoji: '📦', title: 'Manifest Kargo Alien',      desc: 'Buat persamaan dari deklarasi bea cukai alien: dua kontainer dengan berat berbeda, total diketahui.' },
      { key: 'g9plotrute',     emoji: '🗺️', title: 'Plotting Rute Grafik',      desc: 'Gambar garis lurus di layar navigasi (y=mx+b) untuk mendeteksi koordinat kapal yang mungkin dilewati.' },
      { key: 'g9interseksi',   emoji: '📡', title: 'Interseksi Radar Sinyal',   desc: 'Gabungkan dua persamaan radar untuk menemukan satu titik potong (x,y) kapal induk musuh.' },
      { key: 'g9konsol',       emoji: '💻', title: 'Dekripsi Konsol Komputer',  desc: 'Pilih metode eliminasi atau substitusi untuk memecahkan SPLDV dan meretas kode pertahanan musuh.' },
      { key: 'g9pasargalaksi', emoji: '👽', title: 'Barter Di Pasar Galaksi',   desc: 'Hitung harga satuan 1 Tiket Warp dan 1 Botol Oksigen dari paket kombinasi pedagang antariksa.' },
      { key: 'g9balancelab',   emoji: '⚖️', title: 'BalanceLab: SPLDV Visual',  desc: 'Geser benda di atas timbangan, tukar kesetaraan, dan eliminasi variabel secara visual untuk menemukan solusi SPLDV.' },
    ],
  },
  {
    id: 'II', color: '#C4B5FD',
    missions: [
      { key: 'g9kalibrasirada', emoji: '🎯', title: 'Kalibrasi Jangkauan Radar',    desc: 'Atur titik pusat dan jari-jari (r) untuk membuat lingkaran sensor pemindai. Hitung kelilingnya!' },
      { key: 'g9orbit',         emoji: '🛰️', title: 'Kalkulasi Orbit Satelit',       desc: 'Hitung panjang lintasan orbit melingkar satelit agar tidak menabrak atmosfer planet.' },
      { key: 'g9shieldgaya',    emoji: '🛡️', title: 'Medan Gaya Shield Pelindung',  desc: 'Aktifkan perisai plasma lingkaran. Hitung luas area yang harus dilindungi dari serangan musuh.' },
      { key: 'g9laserjuring',   emoji: '⚡', title: 'Tembakan Laser Sektor',        desc: 'Laser hanya menembak dalam juring tertentu. Hitung luas area tembakan dari sudut dan jari-jari.' },
      { key: 'g9asteroid',      emoji: '☄️', title: 'Jalur Pintas Sabuk Asteroid',  desc: 'Hitung jarak dari pusat ke tali busur lingkaran asteroid untuk menemukan rute pelarian tercepat.' },
    ],
  },
  {
    id: 'III', color: '#86EFAC',
    missions: [
      { key: 'g9boksbaterai',  emoji: '🔋', title: 'Optimalisasi Boks Baterai',     desc: 'Susun sel baterai berbentuk kubus ke dalam kompartemen balok. Hitung volume P×L×T agar semua muat.' },
      { key: 'g9refraktor',    emoji: '💎', title: 'Refraktor Kristal Energi',      desc: 'Hitung luas selimut prisma segitiga kristal untuk memantulkan laser ke seluruh subsistem kapal.' },
      { key: 'g9kuilalien',    emoji: '🏛️', title: 'Eksplorasi Kuil Alien',         desc: 'Hitung volume udara dalam kuil berbentuk limas segi empat sebelum mengirim robot penjelajah.' },
      { key: 'g9reaktorbahan', emoji: '⚛️', title: 'Pengisian Reaktor Bahan Bakar', desc: 'Hitung volume cairan hidrogen dalam tangki tabung silinder agar muatan kapal tidak berlebih.' },
      { key: 'g9sinyalkerucut',emoji: '📡', title: 'Zona Pancaran Sinyal',          desc: 'Antena memancarkan sinyal berbentuk kerucut. Hitung volume jangkauan pancaran gelombangnya.' },
      { key: 'g9bintang',      emoji: '⭐', title: 'Kompresi Inti Bintang',         desc: 'Hitung luas permukaan mini-planet bola sempurna menggunakan rumus 4πr².' },
      { key: 'g9upgradekapal', emoji: '🚀', title: 'Upgrade Kapal Induk',           desc: 'Jika dimensi kargo diduakalikan (k×), volume melonjak k³ kali lipat. Hitung volume kontainer baru!' },
    ],
  },
]

function MissionCard({ mission, accent, locked, onClick, task, desktop }) {
  const taskColor = task ? TYPE_COLORS[task.type] : accent
  return (
    <div
      onClick={locked ? undefined : onClick}
      style={{
        background: locked ? 'rgba(255,255,255,0.02)' : '#1E2128',
        borderRadius: 14,
        border: `1px solid ${task ? (TYPE_COLORS[task.type] + '55') : locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
        padding: desktop ? '16px' : '14px',
        cursor: locked ? 'default' : 'pointer',
        display: 'flex', gap: 12, alignItems: 'flex-start',
        opacity: locked ? 0.45 : 1, transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!locked) { e.currentTarget.style.borderColor = taskColor; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = task ? (TYPE_COLORS[task.type] + '55') : locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = '' }}
    >
      <div style={{ fontSize: desktop ? 32 : 28, flexShrink: 0, lineHeight: 1 }}>{locked ? '🔒' : mission.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: locked ? '#4B5563' : '#fff' }}>{mission.title}</div>
          {task && <span style={{ background: `${TYPE_COLORS[task.type]}22`, color: TYPE_COLORS[task.type], fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>{TYPE_ICONS[task.type]} TUGAS</span>}
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>{mission.desc}</div>
        {task && <div style={{ marginTop: 6, fontSize: 11, color: TYPE_COLORS[task.type], fontWeight: 600 }}>📚 {task.totalQuestions} soal · Tenggat {task.dueAt}</div>}
      </div>
      {!locked && <div style={{ flexShrink: 0, color: taskColor, fontSize: 16, paddingTop: 4 }}>▶</div>}
    </div>
  )
}

export default function Grade9ZoneScreen({ navigate, goBack }) {
  const isDesktop = useIsDesktop()
  const { getTaskForGame } = useTask()
  const { isBabLocked } = useBabLock()
  const { raid, checked } = useBossRaid()
  const [selectedBab, setSelectedBab] = useState(null)

  const lockedMap = { I: isBabLocked(9, 'I'), II: isBabLocked(9, 'II'), III: isBabLocked(9, 'III') }
  const labelsMap = GRADE_BAB_LABELS[9]
  const visibleBabs = selectedBab ? BABS.filter(b => b.id === selectedBab) : BABS

  const BossAlert = () => checked && raid ? (
    <div onClick={() => navigate('boss-raid')} style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(245,158,11,0.12))', border: '1px solid rgba(239,68,68,0.5)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', animation: 'bossGlow 2s ease-in-out infinite', marginBottom: 12 }}>
      <div style={{ fontSize: 26, lineHeight: 1 }}>{raid.bossEmoji || '👹'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', letterSpacing: 0.5 }}>⚔️ BOSS RAID AKTIF!</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{raid.bossName} — {raid.hp.toLocaleString()}/{raid.maxHp.toLocaleString()} HP</div>
      </div>
      <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 800 }}>Serang ▶</div>
    </div>
  ) : null

  if (!isDesktop) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #0d1624 100%)' }}>
        <style>{`@keyframes bossGlow{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}`}</style>
        <PlayerHeader />
        <TopBar title="🚀 Zona Komandan Antariksa" onBack={goBack} accentColor={ACCENT} />
        <div style={{ padding: '8px 16px 40px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <BossAlert />
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 4 }}>KELAS 9 · 18 MISI</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Pilih misi dan selesaikan tantangan matematika!</div>
          <VideoMateriPanel grade={9} subject="matematika" selectedBab={selectedBab} accent={ACCENT} />
          {BABS.map(bab => (
            <div key={bab.id}>
              <div style={{ marginTop: 20, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 11, color: bab.color, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{bab.missions.length} Misi</div>
                  {lockedMap[bab.id] && <span style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>🔒 DIKUNCI GURU</span>}
                </div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginTop: 2 }}>{labelsMap[bab.id]}</div>
                <div style={{ height: 2, background: `linear-gradient(90deg, ${bab.color}, transparent)`, borderRadius: 2, marginTop: 6 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bab.missions.map(m => (
                  <MissionCard key={m.key} mission={m} accent={bab.color} locked={lockedMap[bab.id]} onClick={() => navigate(m.key)} task={getTaskForGame(m.key)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Desktop layout ──
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #0d1624 100%)' }}>
      <style>{`@keyframes bossGlow{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}`}</style>
      <TopBar title="🚀 Zona Komandan Antariksa" onBack={goBack} accentColor={ACCENT} />
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '16px var(--page-pad) 40px' }}>
        <BossAlert />
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>KELAS 9 · 18 MISI</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Pilih misi dan selesaikan tantangan matematika!</div>
          <VideoMateriPanel grade={9} subject="matematika" selectedBab={selectedBab} accent={ACCENT} />
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* BAB filter sidebar */}
          <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => setSelectedBab(null)} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', background: selectedBab === null ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${selectedBab === null ? ACCENT : 'transparent'}`, color: selectedBab === null ? '#fff' : '#94A3B8' }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Semua Bab</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>18 misi</div>
            </button>
            {BABS.map(bab => {
              const isActive = selectedBab === bab.id
              return (
                <button key={bab.id} onClick={() => setSelectedBab(bab.id)} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', background: isActive ? `${bab.color}18` : 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${isActive ? bab.color : 'transparent'}`, color: isActive ? '#fff' : '#94A3B8', opacity: lockedMap[bab.id] ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, flex: 1 }}>{labelsMap[bab.id]}</div>
                    {lockedMap[bab.id] && <span style={{ fontSize: 10 }}>🔒</span>}
                  </div>
                  <div style={{ fontSize: 11, color: bab.color, marginTop: 3 }}>{bab.missions.length} misi</div>
                </button>
              )
            })}
          </div>

          {/* Mission grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {visibleBabs.map(bab => (
              <div key={bab.id} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: bab.color, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>{labelsMap[bab.id]}</div>
                  {lockedMap[bab.id] && <span style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>🔒 DIKUNCI GURU</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {bab.missions.map(m => (
                    <MissionCard key={m.key} mission={m} accent={bab.color} locked={lockedMap[bab.id]} onClick={() => navigate(m.key)} task={getTaskForGame(m.key)} desktop />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
