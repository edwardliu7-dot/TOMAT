export function TournamentMatchScanner() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)', fontFamily: 'system-ui, sans-serif', color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* TopBar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px', color: '#94A3B8', fontSize: 12, cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#94A3B8' }}>💎 Scanner Prima</div>
          <div style={{ fontSize: 11, color: '#475569' }}>Bilangan Prima</div>
        </div>
      </div>

      {/* Ghost game UI (blurred/dimmed) */}
      <div style={{ flex: 1, padding: '12px 16px', filter: 'blur(2px)', opacity: 0.2, pointerEvents: 'none' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '16px', marginBottom: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n => (
              <div key={n} style={{ width: 28, height: 28, borderRadius: 6, background: [2,3,5,7,11,13,17,19].includes(n) ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{n}</div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 8 }}>Hancurkan semua bilangan BUKAN prima!</div>
        </div>
        <div style={{ background: '#1A1D27', borderRadius: 20, padding: '16px', border: '1px solid rgba(103,232,249,0.15)' }}>
          <div style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>Sisa bilangan prima: 8/20</div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginTop: 8 }}>
            <div style={{ width: '40%', height: '100%', background: '#67E8F9', borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{ background: 'rgba(15,23,42,0.92)', border: '2px solid rgba(167,139,250,0.4)', borderRadius: 24, padding: '28px 24px', textAlign: 'center', maxWidth: 300, backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💎</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#a78bfa', marginBottom: 8 }}>
            Mode Turnamen<br />Belum Tersedia
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.65, marginBottom: 16 }}>
            Game <strong style={{ color: '#fff' }}>Scanner Prima</strong> berbasis klik/tap langsung ke angka — bukan format slider yang bisa dipantau lawan secara real-time.
          </div>
          <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 4 }}>🛠️ Butuh adaptasi:</div>
            <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'left', lineHeight: 1.6 }}>
              • Format soal diubah ke pilihan tunggal<br />
              • "Apakah {'{n}'} bilangan prima?" (Ya/Tidak)<br />
              • Timer per soal lebih ketat
            </div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>💡 Bisa dikembangkan ke:</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Format tap-race dua pemain</div>
          </div>
        </div>
      </div>
    </div>
  )
}
