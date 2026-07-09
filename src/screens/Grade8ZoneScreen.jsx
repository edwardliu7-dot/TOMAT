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

export default function Grade8ZoneScreen({ navigate, goBack }) {
  const accent = '#FDBA74'
  const { getTaskForGame } = useTask()
  const { isBabLocked } = useBabLock()

  const babILocked = isBabLocked(8, 'I')
  const babIILocked = isBabLocked(8, 'II')
  const babIIILocked = isBabLocked(8, 'III')
  const babIVLocked = isBabLocked(8, 'IV')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0a00 0%, #2d1400 100%)' }}>
      <PlayerHeader />
      <TopBar title="⚔️ Zona Pejuang Abad Pertengahan" onBack={goBack} accentColor={accent} />
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 4 }}>KELAS 8 · 22 MISI</div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>Pilih misi dan selesaikan tantangan matematika!</div>

        {/* BAB I */}
        <SectionHeader title={GRADE_BAB_LABELS[8].I} subtitle="5 Misi" color="#FCA5A5" locked={babILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🛡️" title="Formasi Pasukan Tameng" desc="Susun formasi ksatria bertameng membentuk pola geometris simetris (pola bentuk)." onClick={() => navigate('g8tameng')} accent="#FCA5A5" task={getTaskForGame('g8tameng')} locked={babILocked} />
          <MissionBtn emoji="🌸" title="Teka-teki Hutan Bunga" desc="Identifikasi pola kelopak bunga di alam untuk membuka jalan di hutan ajaib." onClick={() => navigate('g8bunga')} accent="#FCA5A5" task={getTaskForGame('g8bunga')} locked={babILocked} />
          <MissionBtn emoji="🌉" title="Jembatan Batu Ajaib" desc="Seberangi jurang lava dengan melompati batu sesuai urutan pola barisan angka." onClick={() => navigate('g8jembatanbatu')} accent="#FCA5A5" task={getTaskForGame('g8jembatanbatu')} locked={babILocked} />
          <MissionBtn emoji="🔮" title="Ramalan Penyihir Agung" desc="Gunakan rumus suku ke-n untuk memprediksi jumlah monster pada gelombang ke-15." onClick={() => navigate('g8ramalan')} accent="#FCA5A5" task={getTaskForGame('g8ramalan')} locked={babILocked} />
          <MissionBtn emoji="🗝️" title="Sandi Pintu Dungeon" desc="Pecahkan pola deret bertingkat untuk memutar roda sandi pintu dungeon." onClick={() => navigate('g8dungeon')} accent="#FCA5A5" task={getTaskForGame('g8dungeon')} locked={babILocked} />
        </div>

        {/* BAB II */}
        <SectionHeader title={GRADE_BAB_LABELS[8].II} subtitle="6 Misi" color="#FDBA74" locked={babIILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🐉" title="Radar Naga Pengintai" desc="Arahkan naga menjatuhkan suar ke titik (x, y) pada peta koordinat Cartesius." onClick={() => navigate('g8radar')} accent="#FDBA74" task={getTaskForGame('g8radar')} locked={babIILocked} />
          <MissionBtn emoji="💘" title="Makcomblang Desa" desc="Hubungkan warga desa dengan keahliannya menggunakan relasi yang tepat." onClick={() => navigate('g8makcomblang')} accent="#FDBA74" task={getTaskForGame('g8makcomblang')} locked={babIILocked} />
          <MissionBtn emoji="🚪" title="Gerbang Seleksi Sihir" desc="Sortir pendaftaran murid: mana yang sah (fungsi) dan mana yang curang (bukan fungsi)." onClick={() => navigate('g8gerbang')} accent="#FDBA74" task={getTaskForGame('g8gerbang')} locked={babIILocked} />
          <MissionBtn emoji="🔨" title="Pabrik Senjata Pandai Besi" desc="Gunakan rumus mesin f(x) untuk mengatur hasil cetakan pedang." onClick={() => navigate('g8pandaibesi')} accent="#FDBA74" task={getTaskForGame('g8pandaibesi')} locked={babIILocked} />
          <MissionBtn emoji="🗼" title="Kombinasi Kunci Menara" desc="Hitung banyak cara pemetaan antar lantai menara menggunakan rumus bᵃ." onClick={() => navigate('g8menara')} accent="#FDBA74" task={getTaskForGame('g8menara')} locked={babIILocked} />
          <MissionBtn emoji="💃" title="Pesta Dansa Kerajaan" desc="Pastikan setiap ksatria mendapat tepat satu pasangan putri (korespondensi satu-satu)." onClick={() => navigate('g8dansa')} accent="#FDBA74" task={getTaskForGame('g8dansa')} locked={babIILocked} />
        </div>

        {/* BAB III */}
        <SectionHeader title={GRADE_BAB_LABELS[8].III} subtitle="6 Misi" color="#93C5FD" locked={babIIILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🗺️" title="Ahli Peta Kerajaan" desc="Rumuskan persamaan jalur dari dua titik koordinat desa." onClick={() => navigate('g8petakerajaan')} accent="#93C5FD" task={getTaskForGame('g8petakerajaan')} locked={babIIILocked} />
          <MissionBtn emoji="🏹" title="Pemanah Balista" desc="Tembakkan panah mengikuti persamaan garis lurus untuk mengenai target." onClick={() => navigate('g8balista')} accent="#93C5FD" task={getTaskForGame('g8balista')} locked={babIIILocked} />
          <MissionBtn emoji="🐲" title="Mendaki Bukit Naga" desc="Hitung nilai kemiringan (gradien) tebing sebelum kuda ksatria mendaki." onClick={() => navigate('g8bukitnaga')} accent="#93C5FD" task={getTaskForGame('g8bukitnaga')} locked={babIIILocked} />
          <MissionBtn emoji="🧱" title="Rancangan Tembok Benteng" desc="Bangun tembok sejajar (m₁=m₂) atau tegak lurus (m₁×m₂=-1) sesuai arah." onClick={() => navigate('g8tembokbenteng')} accent="#93C5FD" task={getTaskForGame('g8tembokbenteng')} locked={babIIILocked} />
          <MissionBtn emoji="🚚" title="Jalur Suplai Logistik" desc="Prediksi posisi gerobak suplai berdasarkan gradien dan intersep y." onClick={() => navigate('g8logistik')} accent="#93C5FD" task={getTaskForGame('g8logistik')} locked={babIIILocked} />
          <MissionBtn emoji="🛡️" title="Sistem Pertahanan Berlapis" desc="Tentukan titik potong dua garis panah pelindung sihir." onClick={() => navigate('g8pertahananberlapis')} accent="#93C5FD" task={getTaskForGame('g8pertahananberlapis')} locked={babIIILocked} />
        </div>

        {/* BAB IV */}
        <SectionHeader title={GRADE_BAB_LABELS[8].IV} subtitle="5 Misi" color="#FDE68A" locked={babIVLocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="⚖️" title="Timbangan Emas dan Perak" desc="Terjemahkan percakapan saudagar menjadi model matematika dua variabel." onClick={() => navigate('g8timbangan')} accent="#FDE68A" task={getTaskForGame('g8timbangan')} locked={babIVLocked} />
          <MissionBtn emoji="🧪" title="Pedagang Misterius" desc="Cari kombinasi jumlah ramuan yang bisa dibeli dari persamaan linear dua variabel." onClick={() => navigate('g8pedagangmisterius')} accent="#FDE68A" task={getTaskForGame('g8pedagangmisterius')} locked={babIVLocked} />
          <MissionBtn emoji="🆘" title="Misi Penyelamatan Ganda" desc="Identifikasi dua kondisi (SPLDV) dari sandera yang ditawan di dua penjara." onClick={() => navigate('g8penyelamatan')} accent="#FDE68A" task={getTaskForGame('g8penyelamatan')} locked={babIVLocked} />
          <MissionBtn emoji="♟️" title="Ahli Taktik Perang" desc="Gunakan substitusi atau eliminasi untuk mengetahui jumlah pasukan musuh." onClick={() => navigate('g8taktikperang')} accent="#FDE68A" task={getTaskForGame('g8taktikperang')} locked={babIVLocked} />
          <MissionBtn emoji="🛒" title="Pasar Barter Ksatria" desc="Cari harga satuan barang dari dua paket harga yang ditawarkan pedagang." onClick={() => navigate('g8pasarbarter')} accent="#FDE68A" task={getTaskForGame('g8pasarbarter')} locked={babIVLocked} />
        </div>
      </div>
    </div>
  )
}
