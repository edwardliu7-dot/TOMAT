import React from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { useTask, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'
import { useBabLock } from '../BabLockContext'
import { GRADE_BAB_LABELS } from '../gamesCatalog'
import { useBossRaid } from '../hooks/useBossRaid'

function SectionHeader({ title, subtitle, color, locked }) {
  return (
    <div style={{ marginTop: 20, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{subtitle}</div>
        {locked && (
          <span style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
            🔒 DIKUNCI GURU
          </span>
        )}
      </div>
      <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginTop: 2 }}>{title}</div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 2, marginTop: 6 }} />
    </div>
  )
}

function TaskBadge({ task }) {
  const color = TYPE_COLORS[task.type]
  const icon = TYPE_ICONS[task.type]
  return (
    <span style={{ background: `${color}22`, color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, letterSpacing: 0.3, flexShrink: 0 }}>
      {icon} TUGAS
    </span>
  )
}

function MissionBtn({ emoji, title, desc, onClick, accent, locked, task }) {
  return (
    <div onClick={locked ? undefined : onClick} style={{
      background: locked ? 'rgba(255,255,255,0.02)' : '#1E2128',
      borderRadius: 14, border: `1px solid ${task ? (TYPE_COLORS[task.type] + '55') : locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
      padding: '14px', cursor: locked ? 'default' : 'pointer',
      display: 'flex', gap: 12, alignItems: 'flex-start',
      opacity: locked ? 0.45 : 1, transition: 'all 0.15s',
    }}
      onMouseEnter={e => { if (!locked) { e.currentTarget.style.borderColor = task ? TYPE_COLORS[task.type] : accent; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = task ? (TYPE_COLORS[task.type] + '55') : locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = '' }}
    >
      <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{locked ? '🔒' : emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: locked ? '#4B5563' : '#fff' }}>{title}</div>
          {task && <TaskBadge task={task} />}
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>{desc}</div>
        {task && <div style={{ marginTop: 6, fontSize: 11, color: TYPE_COLORS[task.type], fontWeight: 600 }}>📚 {task.totalQuestions} soal · Tenggat {task.dueAt}</div>}
      </div>
      {!locked && <div style={{ flexShrink: 0, color: task ? TYPE_COLORS[task.type] : accent, fontSize: 16, paddingTop: 4 }}>▶</div>}
    </div>
  )
}

export default function Grade9ZoneScreen({ navigate, goBack }) {
  const accent = '#34D399'
  const { getTaskForGame } = useTask()
  const { isBabLocked } = useBabLock()
  const { raid, checked } = useBossRaid()

  const babILocked    = isBabLocked(9, 'I')
  const babIILocked   = isBabLocked(9, 'II')
  const babIIILocked  = isBabLocked(9, 'III')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #0d1624 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚀 Zona Komandan Antariksa" onBack={goBack} accentColor={accent} />
      {checked && raid && (
        <div onClick={() => navigate('boss-raid')} style={{
          margin: '8px 16px 0', background: 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(245,158,11,0.12))',
          border: '1px solid rgba(239,68,68,0.5)', borderRadius: 12, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          animation: 'bossGlow 2s ease-in-out infinite',
        }}>
          <div style={{ fontSize: 26, lineHeight: 1 }}>{raid.bossEmoji || '👹'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', letterSpacing: 0.5 }}>⚔️ BOSS RAID AKTIF!</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{raid.bossName} — {raid.hp.toLocaleString()}/{raid.maxHp.toLocaleString()} HP</div>
          </div>
          <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 800 }}>Serang ▶</div>
        </div>
      )}
      <style>{`@keyframes bossGlow{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}`}</style>
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 4, marginTop: checked && raid ? 12 : 0 }}>KELAS 9 · 17 MISI</div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>Pilih misi dan selesaikan tantangan matematika!</div>

        {/* BAB I */}
        <SectionHeader title={GRADE_BAB_LABELS[9].I} subtitle="5 Misi" color="#67E8F9" locked={babILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="📦" title="Manifest Kargo Alien"      desc="Buat persamaan dari deklarasi bea cukai alien: dua kontainer dengan berat berbeda, total diketahui."      onClick={() => navigate('g9manifest')}     accent="#67E8F9" task={getTaskForGame('g9manifest')}     locked={babILocked} />
          <MissionBtn emoji="🗺️" title="Plotting Rute Grafik"      desc="Gambar garis lurus di layar navigasi (y=mx+b) untuk mendeteksi koordinat kapal yang mungkin dilewati." onClick={() => navigate('g9plotrute')}      accent="#67E8F9" task={getTaskForGame('g9plotrute')}      locked={babILocked} />
          <MissionBtn emoji="📡" title="Interseksi Radar Sinyal"   desc="Gabungkan dua persamaan radar untuk menemukan satu titik potong (x,y) kapal induk musuh."             onClick={() => navigate('g9interseksi')}    accent="#67E8F9" task={getTaskForGame('g9interseksi')}    locked={babILocked} />
          <MissionBtn emoji="💻" title="Dekripsi Konsol Komputer"  desc="Pilih metode eliminasi atau substitusi untuk memecahkan SPLDV dan meretas kode pertahanan musuh."       onClick={() => navigate('g9konsol')}        accent="#67E8F9" task={getTaskForGame('g9konsol')}        locked={babILocked} />
          <MissionBtn emoji="👽" title="Barter Di Pasar Galaksi"   desc="Hitung harga satuan 1 Tiket Warp dan 1 Botol Oksigen dari paket kombinasi pedagang antariksa."         onClick={() => navigate('g9pasargalaksi')}  accent="#67E8F9" task={getTaskForGame('g9pasargalaksi')}  locked={babILocked} />
        </div>

        {/* BAB II */}
        <SectionHeader title={GRADE_BAB_LABELS[9].II} subtitle="5 Misi" color="#C4B5FD" locked={babIILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🎯" title="Kalibrasi Jangkauan Radar"    desc="Atur titik pusat dan jari-jari (r) untuk membuat lingkaran sensor pemindai. Hitung kelilingnya!"        onClick={() => navigate('g9kalibrasirada')} accent="#C4B5FD" task={getTaskForGame('g9kalibrasirada')} locked={babIILocked} />
          <MissionBtn emoji="🛰️" title="Kalkulasi Orbit Satelit"       desc="Hitung panjang lintasan orbit melingkar satelit agar tidak menabrak atmosfer planet."                  onClick={() => navigate('g9orbit')}         accent="#C4B5FD" task={getTaskForGame('g9orbit')}         locked={babIILocked} />
          <MissionBtn emoji="🛡️" title="Medan Gaya Shield Pelindung"  desc="Aktifkan perisai plasma lingkaran. Hitung luas area yang harus dilindungi dari serangan musuh."       onClick={() => navigate('g9shieldgaya')}    accent="#C4B5FD" task={getTaskForGame('g9shieldgaya')}    locked={babIILocked} />
          <MissionBtn emoji="⚡" title="Tembakan Laser Sektor"        desc="Laser hanya menembak dalam juring tertentu. Hitung luas area tembakan dari sudut dan jari-jari."       onClick={() => navigate('g9laserjuring')}   accent="#C4B5FD" task={getTaskForGame('g9laserjuring')}   locked={babIILocked} />
          <MissionBtn emoji="☄️" title="Jalur Pintas Sabuk Asteroid"  desc="Hitung jarak dari pusat ke tali busur lingkaran asteroid untuk menemukan rute pelarian tercepat."      onClick={() => navigate('g9asteroid')}      accent="#C4B5FD" task={getTaskForGame('g9asteroid')}      locked={babIILocked} />
        </div>

        {/* BAB III */}
        <SectionHeader title={GRADE_BAB_LABELS[9].III} subtitle="7 Misi" color="#86EFAC" locked={babIIILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🔋" title="Optimalisasi Boks Baterai"     desc="Susun sel baterai berbentuk kubus ke dalam kompartemen balok. Hitung volume P×L×T agar semua muat."  onClick={() => navigate('g9boksbaterai')}  accent="#86EFAC" task={getTaskForGame('g9boksbaterai')}  locked={babIIILocked} />
          <MissionBtn emoji="💎" title="Refraktor Kristal Energi"      desc="Hitung luas selimut prisma segitiga kristal untuk memantulkan laser ke seluruh subsistem kapal."      onClick={() => navigate('g9refraktor')}    accent="#86EFAC" task={getTaskForGame('g9refraktor')}    locked={babIIILocked} />
          <MissionBtn emoji="🏛️" title="Eksplorasi Kuil Alien"         desc="Hitung volume udara dalam kuil berbentuk limas segi empat sebelum mengirim robot penjelajah."        onClick={() => navigate('g9kuilalien')}    accent="#86EFAC" task={getTaskForGame('g9kuilalien')}    locked={babIIILocked} />
          <MissionBtn emoji="⚛️" title="Pengisian Reaktor Bahan Bakar" desc="Hitung volume cairan hidrogen dalam tangki tabung silinder agar muatan kapal tidak berlebih."       onClick={() => navigate('g9reaktorbahan')} accent="#86EFAC" task={getTaskForGame('g9reaktorbahan')} locked={babIIILocked} />
          <MissionBtn emoji="📡" title="Zona Pancaran Sinyal"          desc="Antena memancarkan sinyal berbentuk kerucut. Hitung volume jangkauan pancaran gelombangnya."         onClick={() => navigate('g9sinyalkerucut')} accent="#86EFAC" task={getTaskForGame('g9sinyalkerucut')} locked={babIIILocked} />
          <MissionBtn emoji="⭐" title="Kompresi Inti Bintang"         desc="Hitung luas permukaan mini-planet bola sempurna menggunakan rumus 4πr²."                            onClick={() => navigate('g9bintang')}      accent="#86EFAC" task={getTaskForGame('g9bintang')}      locked={babIIILocked} />
          <MissionBtn emoji="🚀" title="Upgrade Kapal Induk"           desc="Jika dimensi kargo diduakalikan (k×), volume melonjak k³ kali lipat. Hitung volume kontainer baru!"  onClick={() => navigate('g9upgradekapal')} accent="#86EFAC" task={getTaskForGame('g9upgradekapal')} locked={babIIILocked} />
        </div>

      </div>
    </div>
  )
}
