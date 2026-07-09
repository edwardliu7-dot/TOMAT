import React from 'react'
import { TopBar, PlayerHeader, MissionCard } from '../components/shared'

export default function Grade7ZoneScreen({ navigate, goBack }) {
  const accent = '#67E8F9'
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="Zona Penjelajah Pemula" onBack={goBack} accentColor={accent} />
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ fontSize: 13, color: accent, fontWeight: 700, marginBottom: 16 }}>Pilih Misi (Kelas 7)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MissionCard
            chapter="Bab 1: Bilangan Bulat"
            title="🐟 Kapal Selam Palung Mariana"
            description="Atur kedalaman kapal menggunakan perhitungan +/- untuk menghindari ranjau."
            onClick={() => navigate('submarine')}
            accentColor={accent}
          />
          <MissionCard
            chapter="Bab 2: Bilangan Rasional"
            title="⚗️ Laboratorium Kimia Penemu"
            description="Racik persentase dan pecahan cairan ke dalam kuali."
            onClick={() => navigate('labkimia')}
            accentColor={accent}
          />
          <MissionCard
            chapter="Bab 3: Rasio & Skala"
            title="🏙️ Ekspedisi Arsitek Kota"
            description="Hitung skala peta untuk membangun desa bawah air."
            onClick={() => navigate('arsitek')}
            accentColor={accent}
          />
        </div>
      </div>
    </div>
  )
}
