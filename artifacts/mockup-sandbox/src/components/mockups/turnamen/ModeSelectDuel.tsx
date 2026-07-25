export function ModeSelectDuel() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {/* Player Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#0e7490,#0284c7)', border: '2px solid #67E8F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐸</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Andi Saputra</div>
            <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 600 }}>🪙 240 koin</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>VII A</div>
      </div>

      {/* TopBar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px 8px' }}>
        <button style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 12px', color: '#94A3B8', fontSize: 13, cursor: 'pointer' }}>← Kembali</button>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#67E8F9' }}>Pilih Mode Bermain</div>
      </div>

      <div style={{ padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Game header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 32 }}>🐸</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Katak Pelompat</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Pilih mode untuk memulai</div>
          </div>
        </div>

        {/* Free Play Card */}
        <div style={{ background: '#1A1D27', border: '1.5px solid rgba(52,211,153,0.27)', borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: '#34D399', opacity: 0.06, filter: 'blur(20px)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ fontSize: 36, lineHeight: 1 }}>🎮</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 17, fontWeight: 900 }}>Latihan Bebas</div>
                <span style={{ background: 'rgba(52,211,153,0.14)', color: '#34D399', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>SELALU TERSEDIA</span>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Latihan kapan saja, tidak ada batas soal</div>
            </div>
          </div>
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>Pilih tingkat kesulitan:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 8 }}>
              {[['Mudah','#34D399'],['Sedang','#fbbf24'],['Sulit','#f87171']].map(([l,c]) => (
                <button key={l} style={{ background: `${c}18`, border: `1.5px solid ${c}55`, borderRadius: 12, padding: '12px 6px', color: c, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
              ))}
            </div>
            <button style={{ width: '100%', background: 'rgba(248,113,113,0.12)', border: '1.5px solid rgba(248,113,113,0.4)', borderRadius: 12, padding: '12px 6px', color: '#F87171', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>🔥 Survival</button>
          </div>
        </div>

        {/* Task Mode Card — disabled */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1.5px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, opacity: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ fontSize: 36, lineHeight: 1 }}>📋</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 900 }}>Mode Tugas</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Aktif jika guru telah menetapkan tugas atasmu</div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>Belum ada tugas yang ditetapkan oleh guru untuk misi ini.</div>
        </div>

        {/* ⚔️ Mode Duel Card — NEW */}
        <div style={{ background: '#1A1D27', border: '2px solid rgba(245,158,11,0.45)', borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: '#f59e0b', opacity: 0.08, filter: 'blur(24px)' }} />
          {/* NEW badge */}
          <div style={{ position: 'absolute', top: 12, right: 14, background: 'linear-gradient(90deg,#f59e0b,#ef4444)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20, letterSpacing: 1 }}>✨ BARU</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ fontSize: 36, lineHeight: 1 }}>⚔️</div>
            <div style={{ flex: 1, paddingRight: 52 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 17, fontWeight: 900 }}>Mode Duel</div>
                <span style={{ background: 'rgba(245,158,11,0.18)', color: '#f59e0b', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>MULTIPLAYER</span>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, lineHeight: 1.5 }}>Tantang teman sekelasmu secara real-time! 7 soal, siapa lebih banyak benar?</div>
            </div>
          </div>
          <div style={{ marginTop: 14, background: '#f59e0b', borderRadius: 12, padding: '12px 0', textAlign: 'center' }}>
            <span style={{ color: '#0A1628', fontSize: 14, fontWeight: 800 }}>Masuk Lobby Duel ▶</span>
          </div>
        </div>

        {/* Info note */}
        <div style={{ marginTop: 4, padding: '12px 16px', background: 'rgba(103,232,249,0.05)', borderRadius: 12, border: '1px solid rgba(103,232,249,0.1)' }}>
          <div style={{ fontSize: 12, color: '#67E8F9', fontWeight: 700, marginBottom: 4 }}>💡 Tentang Mode Tugas</div>
          <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>Nilaimu akan otomatis tersimpan di akun dan terlihat oleh guru setelah kamu menyelesaikan semua soal.</div>
        </div>
      </div>
    </div>
  )
}
