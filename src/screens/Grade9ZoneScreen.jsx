import React from 'react'
import { TopBar, PlayerHeader, MissionCard } from '../components/shared'

export default function Grade9ZoneScreen({ navigate, goBack }) {
  const accent = '#34D399'
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0F172A 0%, #0d1624 100%)' }}>
      <PlayerHeader />
      <TopBar title="Zona Penjelajah Luar Angkasa" onBack={goBack} accentColor={accent} />
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ fontSize: 13, color: accent, fontWeight: 700, marginBottom: 16 }}>Pilih Misi (Kelas 9)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MissionCard
            chapter="Bab 1: Operasi Aljabar"
            title="📦 Sortir Kargo & Negosiasi Alien"
            description="Sederhanakan variabel aljabar dari barang bawaan pesawat."
            onClick={() => navigate('kargo')}
            accentColor={accent}
          />
          <MissionCard
            chapter="Bab 2: Pangkat & Akar"
            title="🌀 Generator Lubang Cacing"
            description="Masukkan inti energi ke mesin dengan menyederhanakan bentuk akar."
            onClick={() => navigate('wormhole')}
            accentColor={accent}
          />
          <MissionCard
            chapter="Bab 3: Kesebangunan"
            title="📐 Cetak Biru Hologram"
            description="Bangun suku cadang proporsional dari cetak biru rasio."
            onClick={() => navigate('hologram')}
            accentColor={accent}
          />
          <MissionCard
            chapter="Bab 4: Lingkaran"
            title="🛡️ Medan Gaya (Shield)"
            description="Atur radius perisai energi menggunakan Luas/Keliling untuk menahan meteor."
            onClick={() => navigate('shield')}
            accentColor={accent}
          />
        </div>
      </div>
    </div>
  )
}
