export function TournamentMatchSporaJamur() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui, sans-serif', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* TopBar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', color: '#94A3B8', fontSize: 12, cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#94A3B8' }}>🍄 Spora Jamur</div>
          <div style={{ fontSize: 11, color: '#475569' }}>Bilangan Berpangkat</div>
        </div>
      </div>

      {/* Ghost game UI (blurred/dimmed) */}
      <div style={{ flex: 1, padding: '12px 16px', position: 'relative', filter: 'blur(2px)', opacity: 0.25, pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '20px', marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 8 }}>🍄🍄🍄🍄</div>
          <div style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>Jamur membelah diri setiap ronde.</div>
          <div style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Jika awal 2, setelah 4 kali: 2⁴ = ?</div>
        </div>
        <div style={{ background: '#1A1D27', borderRadius: 20, padding: '16px', border: '1px solid rgba(103,232,249,0.15)' }}>
          <input type="range" min={1} max={1000} value={16} readOnly style={{ width: '100%', accentColor: '#67E8F9' }} />
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 20, fontWeight: 900, color: '#67E8F9' }}>16</div>
        </div>
      </div>

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{ background: 'rgba(15,23,42,0.92)', border: '2px solid rgba(245,158,11,0.4)', borderRadius: 24, padding: '28px 24px', textAlign: 'center', maxWidth: 300, backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍄</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b', marginBottom: 8 }}>
            Mode Turnamen<br />Belum Tersedia
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.65, marginBottom: 16 }}>
            Game <strong style={{ color: '#fff' }}>Spora Jamur</strong> (Bilangan Berpangkat) belum mendukung format duel/turnamen karena jawaban bisa sangat besar.
          </div>
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, marginBottom: 4 }}>🛠️ Butuh adaptasi:</div>
            <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'left', lineHeight: 1.6 }}>
              • Range slider yang lebih besar<br />
              • Soal dengan pangkat kecil (2²–5³)<br />
              • Validasi rentang jawaban khusus
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#475569' }}>
            Game ini tetap bisa dimainkan<br />dalam Mode Solo 🎮
          </div>
        </div>
      </div>
    </div>
  )
}
