import React, { useState, useEffect } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { useTask, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'
import { useBabLock } from '../BabLockContext'
import { GRADE_BAB_LABELS } from '../gamesCatalog'
import { useBossRaid } from '../hooks/useBossRaid'

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

const ACCENT = '#FDBA74'

const BABS = [
  {
    id: 'I', color: '#FBBF24',
    missions: [
      { key: 'g8selramuan',     emoji: '🧪', title: 'Penggandaan Sel Ramuan',      desc: 'Alkemis menetaskan sel ajaib. Hitung hasil pangkat (basis × eksponen) untuk mengetahui total sel ramuan.' },
      { key: 'g8racunminiatur', emoji: '☠️', title: 'Ekstraksi Racun Miniatur',    desc: 'Miniaturkan penawar racun menggunakan pangkat negatif. Ubah aˉⁿ menjadi bentuk pecahan 1/aⁿ.' },
      { key: 'g8kristal',       emoji: '💎', title: 'Pemisahan Elemen Kristal',    desc: 'Hancurkan kristal besar menjadi pecahan daya stabil menggunakan akar kuadrat, kubik, atau ke-4.' },
      { key: 'g8fusienergi',    emoji: '⚗️', title: 'Fusi Energi Alkemis',         desc: 'Gabungkan dua ramuan bereksponen pecahan. Hitung nilai a^(p/q) agar reaktor tidak meledak.' },
      { key: 'g8mantraakar',    emoji: '✨', title: 'Penyederhanaan Mantra Akar',  desc: 'Sederhanakan bentuk akar (misal √50 = 5√2) untuk mengaktifkan tembok pelindung kastil.' },
      { key: 'g8geolog',        emoji: '⛏️', title: 'Ekspedisi Geolog Kerajaan',   desc: 'Selesaikan teka-teki pertumbuhan populasi monster atau luas tambang menggunakan eksponen nyata.' },
    ],
  },
  {
    id: 'II', color: '#93C5FD',
    missions: [
      { key: 'g8trebuchet',     emoji: '⚔️', title: 'Bidikan Tepat Trebuchet',         desc: 'Hitung panjang tali pelontar (sisi miring c) dengan Teorema Pythagoras a²+b²=c².' },
      { key: 'g8perisai',       emoji: '🛡️', title: 'Restorasi Perisai Kerajaan',     desc: 'Cari panjang diagonal yang hilang pada perisai belah ketupat menggunakan Pythagoras.' },
      { key: 'g8hartakarun',    emoji: '💰', title: 'Harta Karun di Sudut Ruangan',   desc: 'Hitung diagonal ruang dari peti harta berbentuk balok untuk menemukan slot kunci rahasia.' },
      { key: 'g8inspeksisudut', emoji: '🗼', title: 'Inspeksi Sudut Menara',          desc: 'Periksa apakah menara tegak lurus 90° dengan menghitung a²+b² dan memverifikasi triple Pythagoras.' },
      { key: 'g8petaradar',     emoji: '📡', title: 'Peta Radar Pengintai',           desc: 'Ksatria di koordinat (x₁,y₁), benteng di (x₂,y₂). Hitung jarak lurus terpendek di antara keduanya.' },
      { key: 'g8taligantung',   emoji: '🪢', title: 'Misi Penyelamatan Tali Gantung', desc: 'Soal cerita: hitung panjang minimal tali, tangga, atau jembatan untuk menyelamatkan putri kerajaan.' },
    ],
  },
  {
    id: 'III', color: '#86EFAC',
    missions: [
      { key: 'g8gerbanglogika', emoji: '🚪', title: 'Teka-Teki Gerbang Logika',   desc: 'Temukan nilai kebenaran x dari pernyataan matematika kuno yang terukir di pintu gerbang (ax = c).' },
      { key: 'g8katrol',        emoji: '⚙️', title: 'Katrol Penyeimbang Jembatan', desc: 'Seimbangkan jembatan gantung: beban ax+b di kiri harus sama dengan beban c di kanan. Cari x!' },
      { key: 'g8gulungan',      emoji: '📜', title: 'Penerjemah Gulungan Kuno',    desc: 'Ubah teka-teki dari warga desa menjadi model matematika PLSV, lalu selesaikan untuk menemukan x.' },
      { key: 'g8keretakuda',    emoji: '🐴', title: 'Kapasitas Kereta Kuda',       desc: 'Muat logistik kerajaan ke kereta. Total beban tidak boleh melebihi batas (ax+b ≤ C). Berapa peti max?' },
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

export default function Grade8ZoneScreen({ navigate, goBack }) {
  const isDesktop = useIsDesktop()
  const { getTaskForGame } = useTask()
  const { isBabLocked } = useBabLock()
  const { raid, checked } = useBossRaid()
  const [selectedBab, setSelectedBab] = useState(null)

  const lockedMap = { I: isBabLocked(8, 'I'), II: isBabLocked(8, 'II'), III: isBabLocked(8, 'III') }
  const labelsMap = GRADE_BAB_LABELS[8]
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0a00 0%, #2d1400 100%)' }}>
        <style>{`@keyframes bossGlow{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}`}</style>
        <PlayerHeader />
        <TopBar title="⚔️ Zona Ksatria Geometri" onBack={goBack} accentColor={ACCENT} />
        <div style={{ padding: '8px 16px 40px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          <BossAlert />
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 4 }}>KELAS 8 · 16 MISI</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Pilih misi dan selesaikan tantangan matematika!</div>
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0a00 0%, #2d1400 100%)' }}>
      <style>{`@keyframes bossGlow{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}`}</style>
      <TopBar title="⚔️ Zona Ksatria Geometri" onBack={goBack} accentColor={ACCENT} />
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '16px var(--page-pad) 40px' }}>
        <BossAlert />
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>KELAS 8 · 16 MISI</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Pilih misi dan selesaikan tantangan matematika!</div>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* BAB filter sidebar */}
          <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => setSelectedBab(null)} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', background: selectedBab === null ? 'rgba(253,186,116,0.15)' : 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${selectedBab === null ? ACCENT : 'transparent'}`, color: selectedBab === null ? '#fff' : '#94A3B8' }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Semua Bab</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>16 misi</div>
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
