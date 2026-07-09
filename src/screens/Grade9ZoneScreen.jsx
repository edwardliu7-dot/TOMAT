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
    <span style={{
      background: `${color}22`, color, fontSize: 10, fontWeight: 700,
      padding: '2px 7px', borderRadius: 20, letterSpacing: 0.3,
      flexShrink: 0,
    }}>
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
      position: 'relative',
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

export default function Grade9ZoneScreen({ navigate, goBack }) {
  const accent = '#34D399'
  const { getTaskForGame } = useTask()
  const { isBabLocked } = useBabLock()

  const babILocked = isBabLocked(9, 'I')
  const babIILocked = isBabLocked(9, 'II')
  const babIIILocked = isBabLocked(9, 'III')
  const babIVLocked = isBabLocked(9, 'IV')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #0d1624 100%)' }}>
      <PlayerHeader />
      <TopBar title="🚀 Zona Penjelajah Luar Angkasa" onBack={goBack} accentColor={accent} />
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 4 }}>KELAS 9 · 14 MISI</div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>Pilih misi dan selesaikan tantangan matematika!</div>

        {/* BAB I */}
        <SectionHeader title={GRADE_BAB_LABELS[9].I} subtitle="6 Misi" color="#67E8F9" locked={babILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="📦" title="Sortir Kargo Pesawat" desc="Kelompokkan peti kargo berlabel variabel sejenis agar pesawat seimbang (sederhanakan bentuk aljabar)." onClick={() => navigate('g9kargo')} accent="#67E8F9" task={getTaskForGame('g9kargo')} locked={babILocked} />
          <MissionBtn emoji="⚡" title="Transfer Energi Reaktor" desc="Jumlahkan daya dua reaktor untuk mengetahui total daya tembak meriam plasma." onClick={() => navigate('g9reaktor')} accent="#67E8F9" task={getTaskForGame('g9reaktor')} locked={babILocked} />
          <MissionBtn emoji="🚀" title="Perluasan Lambung Kapal" desc="Kalikan silang dua suku dua untuk menentukan luas total area pesawat baru." onClick={() => navigate('g9lambungkapal')} accent="#67E8F9" task={getTaskForGame('g9lambungkapal')} locked={babILocked} />
          <MissionBtn emoji="📡" title="Dekripsi Sinyal Alien" desc="Faktorkan persamaan kuadrat untuk menerjemahkan pesan damai dari alien." onClick={() => navigate('g9sinyalalien')} accent="#67E8F9" task={getTaskForGame('g9sinyalalien')} locked={babILocked} />
          <MissionBtn emoji="🫁" title="Kalibrasi Pipa Oksigen" desc="Samakan penyebut pecahan aljabar untuk mengalirkan udara ke kabin." onClick={() => navigate('g9pipaoksigen')} accent="#67E8F9" task={getTaskForGame('g9pipaoksigen')} locked={babILocked} />
          <MissionBtn emoji="👽" title="Misi Perdagangan Galaksi" desc="Terjemahkan tawaran barter alien menjadi model aljabar untuk bernegosiasi." onClick={() => navigate('g9perdagangangalaksi')} accent="#67E8F9" task={getTaskForGame('g9perdagangangalaksi')} locked={babILocked} />
        </div>

        {/* BAB II */}
        <SectionHeader title={GRADE_BAB_LABELS[9].II} subtitle="3 Misi" color="#C4B5FD" locked={babIILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🔬" title="Mikroskop Sub-Atomik" desc="Ubah bentuk pangkat negatif menjadi pecahan biasa saat zoom in ke sel mikroba." onClick={() => navigate('g9mikroskop')} accent="#C4B5FD" task={getTaskForGame('g9mikroskop')} locked={babIILocked} />
          <MissionBtn emoji="🌀" title="Generator Lubang Cacing" desc="Sederhanakan bentuk akar agar selaras dengan frekuensi portal hyperspace." onClick={() => navigate('g9wormhole')} accent="#C4B5FD" task={getTaskForGame('g9wormhole')} locked={babIILocked} />
          <MissionBtn emoji="🌌" title="Navigasi Tahun Cahaya" desc="Kalikan notasi ilmiah untuk menghitung jarak antar tata surya." onClick={() => navigate('g9tahuncahaya')} accent="#C4B5FD" task={getTaskForGame('g9tahuncahaya')} locked={babIILocked} />
        </div>

        {/* BAB III */}
        <SectionHeader title={GRADE_BAB_LABELS[9].III} subtitle="3 Misi" color="#86EFAC" locked={babIIILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🧊" title="Cetak Biru Hologram" desc="Bangun suku cadang asli yang sebangun dan proporsional dengan hologram kecil." onClick={() => navigate('g9cetakbiru')} accent="#86EFAC" task={getTaskForGame('g9cetakbiru')} locked={babIIILocked} />
          <MissionBtn emoji="🗽" title="Bayangan Menara Alien" desc="Gunakan perbandingan bayangan segitiga sebangun untuk mengukur tinggi menara." onClick={() => navigate('g9bayanganmenara')} accent="#86EFAC" task={getTaskForGame('g9bayanganmenara')} locked={babIIILocked} />
          <MissionBtn emoji="🛰️" title="Perakitan Panel Surya Satelit" desc="Hitung perubahan luas panel surya saat skala stasiun luar angkasa diperbesar." onClick={() => navigate('g9panelsurya')} accent="#86EFAC" task={getTaskForGame('g9panelsurya')} locked={babIIILocked} />
        </div>

        {/* BAB IV */}
        <SectionHeader title={GRADE_BAB_LABELS[9].IV} subtitle="2 Misi" color="#4ADE80" locked={babIVLocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🛡️" title="Medan Gaya Pelindung" desc="Aktifkan perisai lingkaran dengan menghitung jari-jari dari keliling minimum." onClick={() => navigate('g9medangaya')} accent="#4ADE80" task={getTaskForGame('g9medangaya')} locked={babIVLocked} />
          <MissionBtn emoji="📡" title="Sektor Pemindai" desc="Atur besar sudut pusat juring radar untuk memindai deposit mineral di kawah planet." onClick={() => navigate('g9sektorpemindai')} accent="#4ADE80" task={getTaskForGame('g9sektorpemindai')} locked={babIVLocked} />
        </div>
      </div>
    </div>
  )
}
