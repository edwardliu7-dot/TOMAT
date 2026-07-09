import React from 'react'
import { TopBar, PlayerHeader } from '../components/shared'

function SectionHeader({ title, subtitle, color }) {
  return (
    <div style={{ marginTop: 20, marginBottom: 12 }}>
      <div style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>{subtitle}</div>
      <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginTop: 2 }}>{title}</div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: 2, marginTop: 6 }} />
    </div>
  )
}

function MissionBtn({ emoji, title, desc, onClick, accent, locked }) {
  return (
    <div onClick={locked ? undefined : onClick} style={{
      background: locked ? 'rgba(255,255,255,0.02)' : '#1E2128',
      borderRadius: 14, border: `1px solid ${locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
      padding: '14px', cursor: locked ? 'default' : 'pointer',
      display: 'flex', gap: 12, alignItems: 'flex-start',
      opacity: locked ? 0.45 : 1, transition: 'all 0.15s',
    }}
      onMouseEnter={e => { if (!locked) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-1px)' } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = '' }}
    >
      <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{locked ? '🔒' : emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: locked ? '#4B5563' : '#fff', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}>{desc}</div>
      </div>
      {!locked && <div style={{ flexShrink: 0, color: accent, fontSize: 16, paddingTop: 4 }}>▶</div>}
    </div>
  )
}

export default function Grade7ZoneScreen({ navigate, goBack }) {
  const accent = '#67E8F9'
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="🌊 Zona Penjelajah Pemula" onBack={goBack} accentColor={accent} />
      <div style={{ padding: '0 16px 40px' }}>
        <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginBottom: 4 }}>KELAS 7 · 20 MISI</div>
        <div style={{ fontSize: 13, color: '#94A3B8' }}>Pilih misi dan selesaikan tantangan matematika!</div>

        {/* BAB I */}
        <SectionHeader title="BAB I: Bilangan Bulat" subtitle="7 Misi" color="#67E8F9" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🌡️" title="Termometer Penyelamat" desc="Selamatkan hewan peliharaan dari cuaca ekstrem dengan memahami bilangan positif & negatif." onClick={() => navigate('termometer')} accent={accent} />
          <MissionBtn emoji="🐸" title="Katak Pelompat Batu" desc="Katak menyeberangi sungai. Angka positif = lompat maju, negatif = lompat mundur." onClick={() => navigate('katak')} accent={accent} />
          <MissionBtn emoji="🤖" title="Pabrik Pasukan Robot" desc="Rakit dan bagi pasukan robot menggunakan perkalian & pembagian bilangan bulat." onClick={() => navigate('pabrikrobot')} accent={accent} />
          <MissionBtn emoji="🍄" title="Serangan Spora Jamur" desc="Tembak jamur yang terus membelah! Tebak jumlah berdasarkan konsep bilangan berpangkat." onClick={() => navigate('sporajamur')} accent={accent} />
          <MissionBtn emoji="💎" title="Scanner Batu Permata" desc="Gunakan pemindai untuk menghancurkan angka komposit, hanya sisakan bilangan prima." onClick={() => navigate('scanner')} accent={accent} />
          <MissionBtn emoji="⚙️" title="Gembok Roda Gigi" desc="Buka pintu penjara dengan memasang roda gigi terbesar yang memutar dua mesin (FPB)." onClick={() => navigate('gembok')} accent={accent} />
          <MissionBtn emoji="🏮" title="Sinyal Mercusuar" desc="Temukan detik saat dua mercusuar berkedip bersamaan untuk menyelamatkan kapal (KPK)." onClick={() => navigate('mercusuar')} accent={accent} />
        </div>

        {/* BAB II */}
        <SectionHeader title="BAB II: Bilangan Rasional" subtitle="7 Misi" color="#A78BFA" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🍕" title="Koki Pemotong Pizza" desc="Potong pizza menjadi bagian yang tepat sebelum monster marah. Belajar pecahan & lambangnya." onClick={() => navigate('kokipizza')} accent="#A78BFA" />
          <MissionBtn emoji="🔧" title="Teknisi Pipa Air" desc="Sambungkan potongan pipa dengan panjang pecahan untuk memperbaiki saluran bocor." onClick={() => navigate('pipaair')} accent="#A78BFA" />
          <MissionBtn emoji="⛏️" title="Bor Tambang Bumi" desc="Bor ke kedalaman dengan pecahan negatif. Hitung posisi akhir bor di bawah tanah." onClick={() => navigate('bortambang')} accent="#A78BFA" />
          <MissionBtn emoji="🚂" title="Rute Kereta Tambang" desc="Selesaikan ekspresi KABATAKU (urutan operasi) untuk memindahkan tuas rel." onClick={() => navigate('kabataku')} accent="#A78BFA" />
          <MissionBtn emoji="🚀" title="Baterai Pesawat Luar Angkasa" desc="Isi daya pesawat ke persentase yang diminta menggunakan perhitungan persen." onClick={() => navigate('baterai')} accent="#A78BFA" />
          <MissionBtn emoji="⚖️" title="Timbangan Emas Digital" desc="Hitung berat serbuk emas dengan presisi tinggi menggunakan operasi bilangan desimal." onClick={() => navigate('timbanganemas')} accent="#A78BFA" />
          <MissionBtn emoji="🔭" title="Fokus Teleskop Bintang" desc="Ubah jarak planet ke bentuk baku (notasi ilmiah) untuk mempertajam lensa teleskop." onClick={() => navigate('fokusteleskop')} accent="#A78BFA" />
        </div>

        {/* BAB III */}
        <SectionHeader title="BAB III: Rasio" subtitle="6 Misi" color="#34D399" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <MissionBtn emoji="🧃" title="Ramuan Jus Buah" desc="Campur buah ke dalam blender sesuai rasio yang diminta untuk membuat jus sempurna." onClick={() => navigate('ramuanjus')} accent="#34D399" />
          <MissionBtn emoji="🏪" title="Kasir Toko Sihir" desc="Hitung harga total barang menggunakan konsep perbandingan senilai." onClick={() => navigate('kasirsihir')} accent="#34D399" />
          <MissionBtn emoji="🏰" title="Pembangun Benteng Pertahanan" desc="Sewa lebih banyak pekerja untuk percepat pembangunan. Belajar perbandingan berbalik nilai." onClick={() => navigate('benteng')} accent="#34D399" />
          <MissionBtn emoji="⚓" title="Nakhoda Kapal Penjelajah" desc="Konversi jarak di peta ke jarak nyata menggunakan skala peta untuk mengarahkan kapal." onClick={() => navigate('nakhoda')} accent="#34D399" />
          <MissionBtn emoji="🚄" title="Menyusun Rel Kereta Cepat" desc="Lengkapi tabel perbandingan untuk menyambung rel kereta dengan benar." onClick={() => navigate('relkereta')} accent="#34D399" />
          <MissionBtn emoji="🔐" title="Peretas Brankas Sandi" desc="Temukan nilai x menggunakan perkalian silang pada persamaan rasio." onClick={() => navigate('brankas')} accent="#34D399" />
        </div>
      </div>
    </div>
  )
}
