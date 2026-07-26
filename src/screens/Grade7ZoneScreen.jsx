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

const ACCENT = '#67E8F9'

const BABS = [
  {
    id: 'I', color: '#67E8F9',
    missions: [
      { key: 'termometer', emoji: '🌡️', title: 'Termometer Penyelamat', desc: 'Selamatkan hewan peliharaan dari cuaca ekstrem dengan memahami bilangan positif & negatif.' },
      { key: 'katak', emoji: '🐸', title: 'Katak Pelompat Batu', desc: 'Katak menyeberangi sungai. Angka positif = lompat maju, negatif = lompat mundur.' },
      { key: 'pabrikrobot', emoji: '🤖', title: 'Pabrik Pasukan Robot', desc: 'Rakit dan bagi pasukan robot menggunakan perkalian & pembagian bilangan bulat.' },
      { key: 'sporajamur', emoji: '🍄', title: 'Serangan Spora Jamur', desc: 'Tembak jamur yang terus membelah! Tebak jumlah berdasarkan konsep bilangan berpangkat.' },
      { key: 'scanner', emoji: '💎', title: 'Scanner Batu Permata', desc: 'Gunakan pemindai untuk menghancurkan angka komposit, hanya sisakan bilangan prima.' },
      { key: 'gembok', emoji: '⚙️', title: 'Gembok Roda Gigi', desc: 'Buka pintu penjara dengan memasang roda gigi terbesar yang memutar dua mesin (FPB).' },
      { key: 'mercusuar', emoji: '🏮', title: 'Sinyal Mercusuar', desc: 'Temukan detik saat dua mercusuar berkedip bersamaan untuk menyelamatkan kapal (KPK).' },
    ],
  },
  {
    id: 'II', color: '#A78BFA',
    missions: [
      { key: 'kokipizza', emoji: '🍕', title: 'Koki Pemotong Pizza', desc: 'Potong pizza menjadi bagian yang tepat sebelum monster marah. Belajar pecahan & lambangnya.' },
      { key: 'pipaair', emoji: '🔧', title: 'Teknisi Pipa Air', desc: 'Sambungkan potongan pipa dengan panjang pecahan untuk memperbaiki saluran bocor.' },
      { key: 'bortambang', emoji: '⛏️', title: 'Bor Tambang Bumi', desc: 'Bor ke kedalaman dengan pecahan negatif. Hitung posisi akhir bor di bawah tanah.' },
      { key: 'kabataku', emoji: '🚂', title: 'Rute Kereta Tambang', desc: 'Selesaikan ekspresi KABATAKU (urutan operasi) untuk memindahkan tuas rel.' },
      { key: 'baterai', emoji: '🚀', title: 'Baterai Pesawat Luar Angkasa', desc: 'Isi daya pesawat ke persentase yang diminta menggunakan perhitungan persen.' },
      { key: 'timbanganemas', emoji: '⚖️', title: 'Timbangan Emas Digital', desc: 'Hitung berat serbuk emas dengan presisi tinggi menggunakan operasi bilangan desimal.' },
      { key: 'fokusteleskop', emoji: '🔭', title: 'Fokus Teleskop Bintang', desc: 'Ubah jarak planet ke bentuk baku (notasi ilmiah) untuk mempertajam lensa teleskop.' },
    ],
  },
  {
    id: 'III', color: '#34D399',
    missions: [
      { key: 'ramuanjus', emoji: '🧃', title: 'Ramuan Jus Buah', desc: 'Campur buah ke dalam blender sesuai rasio yang diminta untuk membuat jus sempurna.' },
      { key: 'kasirsihir', emoji: '🏪', title: 'Kasir Toko Sihir', desc: 'Hitung harga total barang menggunakan konsep perbandingan senilai.' },
      { key: 'benteng', emoji: '🏰', title: 'Pembangun Benteng Pertahanan', desc: 'Sewa lebih banyak pekerja untuk percepat pembangunan. Belajar perbandingan berbalik nilai.' },
      { key: 'nakhoda', emoji: '⚓', title: 'Nakhoda Kapal Penjelajah', desc: 'Konversi jarak di peta ke jarak nyata menggunakan skala peta untuk mengarahkan kapal.' },
      { key: 'relkereta', emoji: '🚄', title: 'Menyusun Rel Kereta Cepat', desc: 'Lengkapi tabel perbandingan untuk menyambung rel kereta dengan benar.' },
      { key: 'brankas', emoji: '🔐', title: 'Peretas Brankas Sandi', desc: 'Temukan nilai x menggunakan perkalian silang pada persamaan rasio.' },
    ],
  },
]

function TaskBadge({ task }) {
  const color = TYPE_COLORS[task.type]
  const icon = TYPE_ICONS[task.type]
  return (
    <span style={{ background: `${color}22`, color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, letterSpacing: 0.3, flexShrink: 0 }}>
      {icon} TUGAS
    </span>
  )
}

function MissionCard({ mission, accent, locked, onClick, task, desktop }) {
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
      onMouseEnter={e => { if (!locked) { e.currentTarget.style.borderColor = task ? TYPE_COLORS[task.type] : accent; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = task ? (TYPE_COLORS[task.type] + '55') : locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = '' }}
    >
      <div style={{ fontSize: desktop ? 32 : 28, flexShrink: 0, lineHeight: 1 }}>{locked ? '🔒' : mission.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: locked ? '#4B5563' : '#fff' }}>{mission.title}</div>
          {task && <TaskBadge task={task} />}
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>{mission.desc}</div>
        {task && (
          <div style={{ marginTop: 6, fontSize: 11, color: TYPE_COLORS[task.type], fontWeight: 600 }}>
            📚 {task.totalQuestions} soal · Tenggat {task.dueAt}
          </div>
        )}
      </div>
      {!locked && <div style={{ flexShrink: 0, color: task ? TYPE_COLORS[task.type] : accent, fontSize: 16, paddingTop: 4 }}>▶</div>}
    </div>
  )
}

function BossRaidAlert({ raid, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(245,158,11,0.12))',
      border: '1px solid rgba(239,68,68,0.5)', borderRadius: 12, padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
      animation: 'bossGlow 2s ease-in-out infinite', marginBottom: 12,
    }}>
      <div style={{ fontSize: 26, lineHeight: 1 }}>{raid.bossEmoji || '👹'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', letterSpacing: 0.5 }}>⚔️ BOSS RAID AKTIF!</div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{raid.bossName} — {raid.hp.toLocaleString()}/{raid.maxHp.toLocaleString()} HP</div>
      </div>
      <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 800 }}>Serang ▶</div>
    </div>
  )
}

export default function Grade7ZoneScreen({ navigate, goBack }) {
  const isDesktop = useIsDesktop()
  const { getTaskForGame } = useTask()
  const { isBabLocked } = useBabLock()
  const { raid, checked } = useBossRaid()
  const [selectedBab, setSelectedBab] = useState(null)

  const lockedMap = { I: isBabLocked(7, 'I'), II: isBabLocked(7, 'II'), III: isBabLocked(7, 'III') }
  const colorMap = { I: '#67E8F9', II: '#A78BFA', III: '#34D399' }
  const labelsMap = GRADE_BAB_LABELS[7]

  const visibleBabs = selectedBab ? BABS.filter(b => b.id === selectedBab) : BABS

  if (!isDesktop) {
    // ── Mobile layout (existing) ──
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
        <style>{`@keyframes bossGlow{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}`}</style>
        <PlayerHeader />
        <TopBar title="🌊 Zona Penjelajah Pemula" onBack={goBack} accentColor={ACCENT} />
        <div style={{ padding: '0 16px 40px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
          {checked && raid && <BossRaidAlert raid={raid} onClick={() => navigate('boss-raid')} />}
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600, marginBottom: 4 }}>KELAS 7 · 20 MISI</div>
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <style>{`@keyframes bossGlow{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}`}</style>
      <TopBar title="🌊 Zona Penjelajah Pemula" onBack={goBack} accentColor={ACCENT} />
      <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '16px var(--page-pad) 40px' }}>
        {checked && raid && <BossRaidAlert raid={raid} onClick={() => navigate('boss-raid')} />}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: ACCENT, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>KELAS 7 · 20 MISI</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Pilih misi dan selesaikan tantangan matematika!</div>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Left: BAB filter */}
          <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => setSelectedBab(null)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                background: selectedBab === null ? 'rgba(103,232,249,0.15)' : 'rgba(255,255,255,0.04)',
                borderLeft: `3px solid ${selectedBab === null ? ACCENT : 'transparent'}`,
                color: selectedBab === null ? '#fff' : '#94A3B8',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800 }}>Semua Bab</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>20 misi</div>
            </button>

            {BABS.map(bab => {
              const isActive = selectedBab === bab.id
              const locked = lockedMap[bab.id]
              return (
                <button
                  key={bab.id}
                  onClick={() => setSelectedBab(bab.id)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    background: isActive ? `${bab.color}18` : 'rgba(255,255,255,0.04)',
                    borderLeft: `3px solid ${isActive ? bab.color : 'transparent'}`,
                    color: isActive ? '#fff' : '#94A3B8',
                    opacity: locked ? 0.6 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, flex: 1 }}>{labelsMap[bab.id]}</div>
                    {locked && <span style={{ fontSize: 10 }}>🔒</span>}
                  </div>
                  <div style={{ fontSize: 11, color: bab.color, marginTop: 3 }}>{bab.missions.length} misi</div>
                </button>
              )
            })}
          </div>

          {/* Right: mission grid */}
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
