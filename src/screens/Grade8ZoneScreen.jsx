import React from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { useTask, TYPE_COLORS, TYPE_ICONS } from '../TaskContext'
import { useBabLock } from '../BabLockContext'
import { GRADE_BAB_LABELS } from '../gamesCatalog'

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

export default function Grade8ZoneScreen({ navigate, goBack }) {
  const accent = '#FDBA74'
  const { getTaskForGame } = useTask()
  const { isBabLocked } = useBabLock()

  const babILocked   = isBabLocked(8, 'I')
  const babIILocked  = isBabLocked(8, 'II')
  const babIIILocked = isBabLocked(8, 'III')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0a00 0%, #2d1400 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚔️ Zona Ksatria Geometri" onBack={goBack} accentColor={accent} />
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 4 }}>KELAS 8 · 16 MISI</div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>Pilih misi dan selesaikan tantangan matematika!</div>

        {/* BAB I */}
        <SectionHeader title={GRADE_BAB_LABELS[8].I} subtitle="6 Misi" color="#FBBF24" locked={babILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🧪" title="Penggandaan Sel Ramuan"      desc="Alkemis menetaskan sel ajaib. Hitung hasil pangkat (basis × eksponen) untuk mengetahui total sel ramuan."       onClick={() => navigate('g8selramuan')}     accent="#FBBF24" task={getTaskForGame('g8selramuan')}     locked={babILocked} />
          <MissionBtn emoji="☠️" title="Ekstraksi Racun Miniatur"    desc="Miniaturkan penawar racun menggunakan pangkat negatif. Ubah aˉⁿ menjadi bentuk pecahan 1/aⁿ."              onClick={() => navigate('g8racunminiatur')} accent="#FBBF24" task={getTaskForGame('g8racunminiatur')} locked={babILocked} />
          <MissionBtn emoji="💎" title="Pemisahan Elemen Kristal"    desc="Hancurkan kristal besar menjadi pecahan daya stabil menggunakan akar kuadrat, akar kubik, atau akar ke-4." onClick={() => navigate('g8kristal')}       accent="#FBBF24" task={getTaskForGame('g8kristal')}       locked={babILocked} />
          <MissionBtn emoji="⚗️" title="Fusi Energi Alkemis"         desc="Gabungkan dua ramuan bereksponen pecahan. Hitung nilai a^(p/q) agar reaktor laboratorium tidak meledak."   onClick={() => navigate('g8fusienergi')}    accent="#FBBF24" task={getTaskForGame('g8fusienergi')}    locked={babILocked} />
          <MissionBtn emoji="✨" title="Penyederhanaan Mantra Akar"  desc="Sederhanakan bentuk akar (misal √50 = 5√2) untuk mengaktifkan tembok pelindung kastil."                   onClick={() => navigate('g8mantraakar')}    accent="#FBBF24" task={getTaskForGame('g8mantraakar')}    locked={babILocked} />
          <MissionBtn emoji="⛏️" title="Ekspedisi Geolog Kerajaan"   desc="Selesaikan teka-teki pertumbuhan populasi monster atau luas tambang menggunakan perhitungan eksponen nyata." onClick={() => navigate('g8geolog')}        accent="#FBBF24" task={getTaskForGame('g8geolog')}        locked={babILocked} />
        </div>

        {/* BAB II */}
        <SectionHeader title={GRADE_BAB_LABELS[8].II} subtitle="6 Misi" color="#93C5FD" locked={babIILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="⚔️" title="Bidikan Tepat Trebuchet"         desc="Hitung panjang tali pelontar (sisi miring c) dengan Teorema Pythagoras a²+b²=c²."                         onClick={() => navigate('g8trebuchet')}     accent="#93C5FD" task={getTaskForGame('g8trebuchet')}     locked={babIILocked} />
          <MissionBtn emoji="🛡️" title="Restorasi Perisai Kerajaan"     desc="Cari panjang diagonal yang hilang pada perisai belah ketupat menggunakan Pythagoras."                    onClick={() => navigate('g8perisai')}       accent="#93C5FD" task={getTaskForGame('g8perisai')}       locked={babIILocked} />
          <MissionBtn emoji="💰" title="Harta Karun di Sudut Ruangan"   desc="Hitung diagonal ruang dari peti harta berbentuk balok untuk menemukan slot kunci rahasia."               onClick={() => navigate('g8hartakarun')}    accent="#93C5FD" task={getTaskForGame('g8hartakarun')}    locked={babIILocked} />
          <MissionBtn emoji="🗼" title="Inspeksi Sudut Menara"          desc="Periksa apakah menara tegak lurus 90° dengan menghitung a²+b² dan memverifikasi triple Pythagoras."     onClick={() => navigate('g8inspeksisudut')} accent="#93C5FD" task={getTaskForGame('g8inspeksisudut')} locked={babIILocked} />
          <MissionBtn emoji="📡" title="Peta Radar Pengintai"           desc="Ksatria di koordinat (x₁,y₁), benteng di (x₂,y₂). Hitung jarak lurus terpendek di antara keduanya."   onClick={() => navigate('g8petaradar')}     accent="#93C5FD" task={getTaskForGame('g8petaradar')}     locked={babIILocked} />
          <MissionBtn emoji="🪢" title="Misi Penyelamatan Tali Gantung" desc="Soal cerita: hitung panjang minimal tali, tangga, atau jembatan untuk menyelamatkan putri kerajaan."     onClick={() => navigate('g8taligantung')}   accent="#93C5FD" task={getTaskForGame('g8taligantung')}   locked={babIILocked} />
        </div>

        {/* BAB III */}
        <SectionHeader title={GRADE_BAB_LABELS[8].III} subtitle="4 Misi" color="#86EFAC" locked={babIIILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🚪" title="Teka-Teki Gerbang Logika"   desc="Temukan nilai kebenaran x dari pernyataan matematika kuno yang terukir di pintu gerbang (ax = c)."    onClick={() => navigate('g8gerbanglogika')} accent="#86EFAC" task={getTaskForGame('g8gerbanglogika')} locked={babIIILocked} />
          <MissionBtn emoji="⚙️" title="Katrol Penyeimbang Jembatan" desc="Seimbangkan jembatan gantung: beban ax+b di kiri harus sama dengan beban c di kanan. Cari x!"         onClick={() => navigate('g8katrol')}        accent="#86EFAC" task={getTaskForGame('g8katrol')}        locked={babIIILocked} />
          <MissionBtn emoji="📜" title="Penerjemah Gulungan Kuno"    desc="Ubah teka-teki dari warga desa menjadi model matematika PLSV, lalu selesaikan untuk menemukan x."     onClick={() => navigate('g8gulungan')}      accent="#86EFAC" task={getTaskForGame('g8gulungan')}      locked={babIIILocked} />
          <MissionBtn emoji="🐴" title="Kapasitas Kereta Kuda"       desc="Muat logistik kerajaan ke kereta. Total beban tidak boleh melebihi batas (ax+b ≤ C). Berapa peti max?" onClick={() => navigate('g8keretakuda')}    accent="#86EFAC" task={getTaskForGame('g8keretakuda')}    locked={babIIILocked} />
        </div>
      </div>
    </div>
  )
}
