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

export default function Grade7ZoneScreen({ navigate, goBack, onDuel }) {
  const accent = '#67E8F9'
  const { getTaskForGame } = useTask()
  const { isBabLocked } = useBabLock()
  const { raid, checked } = useBossRaid()

  const babILocked = isBabLocked(7, 'I')
  const babIILocked = isBabLocked(7, 'II')
  const babIIILocked = isBabLocked(7, 'III')

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌊 Zona Penjelajah Pemula" onBack={goBack} accentColor={accent} />
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
        <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 4, marginTop: checked && raid ? 12 : 0 }}>KELAS 7 · 20 MISI</div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>Pilih misi dan selesaikan tantangan matematika!</div>

        {/* BAB I */}
        <SectionHeader title={GRADE_BAB_LABELS[7].I} subtitle="7 Misi" color="#67E8F9" locked={babILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🌡️" title="Termometer Penyelamat" desc="Selamatkan hewan peliharaan dari cuaca ekstrem dengan memahami bilangan positif & negatif." onClick={() => navigate('termometer')} accent={accent} task={getTaskForGame('termometer')} locked={babILocked} />
          <MissionBtn emoji="🐸" title="Katak Pelompat Batu" desc="Katak menyeberangi sungai. Angka positif = lompat maju, negatif = lompat mundur." onClick={() => navigate('katak')} accent={accent} task={getTaskForGame('katak')} locked={babILocked} />
          <MissionBtn emoji="🤖" title="Pabrik Pasukan Robot" desc="Rakit dan bagi pasukan robot menggunakan perkalian & pembagian bilangan bulat." onClick={() => navigate('pabrikrobot')} accent={accent} task={getTaskForGame('pabrikrobot')} locked={babILocked} />
          <MissionBtn emoji="🍄" title="Serangan Spora Jamur" desc="Tembak jamur yang terus membelah! Tebak jumlah berdasarkan konsep bilangan berpangkat." onClick={() => navigate('sporajamur')} accent={accent} task={getTaskForGame('sporajamur')} locked={babILocked} />
          <MissionBtn emoji="💎" title="Scanner Batu Permata" desc="Gunakan pemindai untuk menghancurkan angka komposit, hanya sisakan bilangan prima." onClick={() => navigate('scanner')} accent={accent} task={getTaskForGame('scanner')} locked={babILocked} />
          <MissionBtn emoji="⚙️" title="Gembok Roda Gigi" desc="Buka pintu penjara dengan memasang roda gigi terbesar yang memutar dua mesin (FPB)." onClick={() => navigate('gembok')} accent={accent} task={getTaskForGame('gembok')} locked={babILocked} />
          <MissionBtn emoji="🏮" title="Sinyal Mercusuar" desc="Temukan detik saat dua mercusuar berkedip bersamaan untuk menyelamatkan kapal (KPK)." onClick={() => navigate('mercusuar')} accent={accent} task={getTaskForGame('mercusuar')} locked={babILocked} />
        </div>

        {/* BAB II */}
        <SectionHeader title={GRADE_BAB_LABELS[7].II} subtitle="7 Misi" color="#A78BFA" locked={babIILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🍕" title="Koki Pemotong Pizza" desc="Potong pizza menjadi bagian yang tepat sebelum monster marah. Belajar pecahan & lambangnya." onClick={() => navigate('kokipizza')} accent="#A78BFA" task={getTaskForGame('kokipizza')} locked={babIILocked} />
          <MissionBtn emoji="🔧" title="Teknisi Pipa Air" desc="Sambungkan potongan pipa dengan panjang pecahan untuk memperbaiki saluran bocor." onClick={() => navigate('pipaair')} accent="#A78BFA" task={getTaskForGame('pipaair')} locked={babIILocked} />
          <MissionBtn emoji="⛏️" title="Bor Tambang Bumi" desc="Bor ke kedalaman dengan pecahan negatif. Hitung posisi akhir bor di bawah tanah." onClick={() => navigate('bortambang')} accent="#A78BFA" task={getTaskForGame('bortambang')} locked={babIILocked} />
          <MissionBtn emoji="🚂" title="Rute Kereta Tambang" desc="Selesaikan ekspresi KABATAKU (urutan operasi) untuk memindahkan tuas rel." onClick={() => navigate('kabataku')} accent="#A78BFA" task={getTaskForGame('kabataku')} locked={babIILocked} />
          <MissionBtn emoji="🚀" title="Baterai Pesawat Luar Angkasa" desc="Isi daya pesawat ke persentase yang diminta menggunakan perhitungan persen." onClick={() => navigate('baterai')} accent="#A78BFA" task={getTaskForGame('baterai')} locked={babIILocked} />
          <MissionBtn emoji="⚖️" title="Timbangan Emas Digital" desc="Hitung berat serbuk emas dengan presisi tinggi menggunakan operasi bilangan desimal." onClick={() => navigate('timbanganemas')} accent="#A78BFA" task={getTaskForGame('timbanganemas')} locked={babIILocked} />
          <MissionBtn emoji="🔭" title="Fokus Teleskop Bintang" desc="Ubah jarak planet ke bentuk baku (notasi ilmiah) untuk mempertajam lensa teleskop." onClick={() => navigate('fokusteleskop')} accent="#A78BFA" task={getTaskForGame('fokusteleskop')} locked={babIILocked} />
        </div>

        {/* BAB III */}
        <SectionHeader title={GRADE_BAB_LABELS[7].III} subtitle="6 Misi" color="#34D399" locked={babIIILocked} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🧃" title="Ramuan Jus Buah" desc="Campur buah ke dalam blender sesuai rasio yang diminta untuk membuat jus sempurna." onClick={() => navigate('ramuanjus')} accent="#34D399" task={getTaskForGame('ramuanjus')} locked={babIIILocked} />
          <MissionBtn emoji="🏪" title="Kasir Toko Sihir" desc="Hitung harga total barang menggunakan konsep perbandingan senilai." onClick={() => navigate('kasirsihir')} accent="#34D399" task={getTaskForGame('kasirsihir')} locked={babIIILocked} />
          <MissionBtn emoji="🏰" title="Pembangun Benteng Pertahanan" desc="Sewa lebih banyak pekerja untuk percepat pembangunan. Belajar perbandingan berbalik nilai." onClick={() => navigate('benteng')} accent="#34D399" task={getTaskForGame('benteng')} locked={babIIILocked} />
          <MissionBtn emoji="⚓" title="Nakhoda Kapal Penjelajah" desc="Konversi jarak di peta ke jarak nyata menggunakan skala peta untuk mengarahkan kapal." onClick={() => navigate('nakhoda')} accent="#34D399" task={getTaskForGame('nakhoda')} locked={babIIILocked} />
          <MissionBtn emoji="🚄" title="Menyusun Rel Kereta Cepat" desc="Lengkapi tabel perbandingan untuk menyambung rel kereta dengan benar." onClick={() => navigate('relkereta')} accent="#34D399" task={getTaskForGame('relkereta')} locked={babIIILocked} />
          <MissionBtn emoji="🔐" title="Peretas Brankas Sandi" desc="Temukan nilai x menggunakan perkalian silang pada persamaan rasio." onClick={() => navigate('brankas')} accent="#34D399" task={getTaskForGame('brankas')} locked={babIIILocked} />
        </div>
      </div>
    </div>
  )
}
