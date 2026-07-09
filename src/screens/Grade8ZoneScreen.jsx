import React from 'react'
import { TopBar, PlayerHeader, MissionCard } from '../components/shared'

export default function Grade8ZoneScreen({ navigate, goBack }) {
  const accent = '#FDBA74'
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #450A0A 0%, #3b0a0a 100%)' }}>
      <PlayerHeader />
      <TopBar title="Zona Pejuang Abad Pertengahan" onBack={goBack} accentColor={accent} />
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ fontSize: 13, color: accent, fontWeight: 700, marginBottom: 16 }}>Pilih Misi (Kelas 8)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MissionCard
            chapter="Bab 1: Pola Bilangan"
            title="🗿 Jembatan Batu Ajaib"
            description="Temukan batu yang hilang dengan mengidentifikasi pola barisan bilangan."
            onClick={() => navigate('jembatan')}
            accentColor={accent}
          />
          <MissionCard
            chapter="Bab 2: Fungsi"
            title="⚒️ Pabrik Senjata Pandai Besi"
            description="Hitung nilai fungsi f(x) untuk menempa senjata yang tepat."
            onClick={() => navigate('pabrik')}
            accentColor={accent}
          />
          <MissionCard
            chapter="Bab 3: Gradien"
            title="🏹 Pemanah Balista"
            description="Sesuaikan kemiringan bidikan panah agar tepat sasaran."
            onClick={() => navigate('pemanah')}
            accentColor={accent}
          />
          <MissionCard
            chapter="Bab 4: Persamaan Simultan"
            title="🛒 Pasar Barter Kerajaan"
            description="Pecahkan sistem persamaan untuk menentukan harga adil di pasar barter."
            onClick={() => navigate('pasar')}
            accentColor={accent}
          />
        </div>
      </div>
    </div>
  )
}
