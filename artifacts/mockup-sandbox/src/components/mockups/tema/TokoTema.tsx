export default function TokoTema() {
  const themes = [
    {
      id: 'default', name: 'Biru Klasik', price: 0, owned: true, equipped: true,
      bg: 'linear-gradient(135deg,#0d1b35 0%,#070e1c 100%)',
      accent: '#6366F1', stars: false,
    },
    {
      id: 'space', name: 'Luar Angkasa', price: 1500, owned: true, equipped: false,
      bg: 'linear-gradient(135deg,#050818 0%,#0a0f2e 50%,#030b1a 100%)',
      accent: '#22d3ee', stars: true,
    },
    {
      id: 'forest', name: 'Hutan Mistis', price: 2000, owned: false, equipped: false,
      bg: 'linear-gradient(135deg,#071a0d 0%,#0a2010 100%)',
      accent: '#4ade80', stars: false,
    },
    {
      id: 'fire', name: 'Api Merah', price: 2500, owned: false, equipped: false,
      bg: 'linear-gradient(135deg,#1a0a00 0%,#2d1000 100%)',
      accent: '#fb923c', stars: false,
    },
    {
      id: 'snow', name: 'Salju Abadi', price: 2000, owned: false, equipped: false,
      bg: 'linear-gradient(135deg,#071828 0%,#0d2540 100%)',
      accent: '#7dd3fc', stars: false,
    },
    {
      id: 'void', name: 'Void', price: 8000, owned: false, equipped: false,
      bg: 'linear-gradient(135deg,#030008 0%,#110020 100%)',
      accent: '#a855f7', stars: true, limited: true,
    },
  ]

  return (
    <div style={{
      width: 390, minHeight: 860, background: '#0F1115',
      fontFamily: "'Inter', sans-serif", color: '#E2E2E6',
      display: 'flex', flexDirection: 'column', overflowX: 'hidden',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 10px', background: 'rgba(15,17,21,0.96)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(255,255,255,0.06)', border: 'none',
            color: '#94A3B8', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>←</button>
          <span style={{ fontWeight: 800, fontSize: 17 }}>Toko</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)',
          borderRadius: 20, padding: '5px 12px',
        }}>
          <span style={{ fontSize: 14 }}>🪙</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#FDE68A' }}>4.250</span>
        </div>
      </div>

      {/* Tab strip */}
      <div style={{
        display: 'flex', overflowX: 'auto', gap: 0,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: '#0F1115',
      }}>
        {[
          { key: 'bingkai', label: '🖼️ Bingkai' },
          { key: 'spanduk', label: '🏷️ Spanduk' },
          { key: 'tema', label: '🎨 Tema' },
          { key: 'pet_skin', label: '🐸 Pet Skin' },
        ].map(t => (
          <button key={t.key} style={{
            padding: '11px 14px', border: 'none', cursor: 'pointer',
            background: 'transparent', fontFamily: 'inherit',
            fontSize: 12, fontWeight: t.key === 'tema' ? 800 : 500,
            color: t.key === 'tema' ? '#818CF8' : '#64748B',
            whiteSpace: 'nowrap', flexShrink: 0,
            borderBottom: t.key === 'tema' ? '2px solid #6366F1' : '2px solid transparent',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '16px 16px 24px', overflowY: 'auto' }}>

        {/* Section header */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#818CF8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
            TEMA TAMPILAN GAME
          </div>
          <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
            Ubah suasana visual semua layar game-mu. Tema aktif berlaku di seluruh sesi bermain.
          </div>
        </div>

        {/* Theme grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {themes.map(theme => (
            <div key={theme.id} style={{
              borderRadius: 16,
              border: theme.equipped
                ? '2px solid #6366F1'
                : '1.5px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: theme.equipped
                ? '0 0 18px rgba(99,102,241,0.25)'
                : 'none',
            }}>
              {/* Limited badge */}
              {theme.limited && (
                <div style={{
                  position: 'absolute', top: 8, right: 8, zIndex: 2,
                  background: 'rgba(168,85,247,0.9)', borderRadius: 6,
                  fontSize: 8, fontWeight: 800, color: '#fff',
                  padding: '2px 6px', letterSpacing: 0.5,
                }}>LIMITED</div>
              )}

              {/* Preview gradient */}
              <div style={{
                height: 88, background: theme.bg,
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Simulated game UI inside preview */}
                <div style={{
                  position: 'absolute', bottom: 10, left: 10, right: 10,
                  height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6,
                }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: theme.accent, opacity: 0.8 }} />
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '65%', height: '100%', borderRadius: 3, background: theme.accent }} />
                  </div>
                </div>
                {/* Accent dot */}
                <div style={{
                  position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
                  width: 20, height: 20, borderRadius: '50%',
                  background: theme.accent, opacity: 0.6,
                  boxShadow: `0 0 12px ${theme.accent}`,
                }} />
                {/* Stars overlay for starry themes */}
                {theme.stars && (
                  <>
                    {[
                      { top: '15%', left: '20%', size: 2 },
                      { top: '30%', left: '70%', size: 1.5 },
                      { top: '55%', left: '35%', size: 2 },
                      { top: '20%', left: '85%', size: 1.5 },
                      { top: '70%', left: '80%', size: 1 },
                    ].map((s, i) => (
                      <div key={i} style={{
                        position: 'absolute', top: s.top, left: s.left,
                        width: s.size, height: s.size, borderRadius: '50%',
                        background: '#fff', opacity: 0.8,
                      }} />
                    ))}
                  </>
                )}
                {/* Equipped badge */}
                {theme.equipped && (
                  <div style={{
                    position: 'absolute', top: 8, left: 8,
                    background: '#6366F1', borderRadius: 6,
                    fontSize: 8, fontWeight: 800, color: '#fff',
                    padding: '2px 6px',
                  }}>AKTIF</div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '10px 10px 11px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#E2E2E6', marginBottom: 6, lineHeight: 1.3 }}>
                  {theme.name}
                </div>

                {/* Price */}
                {theme.price > 0 && !theme.owned && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 11 }}>🪙</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#FDE68A' }}>{theme.price.toLocaleString('id')}</span>
                  </div>
                )}

                {/* Button */}
                {theme.equipped ? (
                  <div style={{
                    width: '100%', padding: '7px 0',
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.4)',
                    borderRadius: 8, textAlign: 'center',
                    fontSize: 11, fontWeight: 800, color: '#818CF8',
                  }}>✓ Terpasang</div>
                ) : theme.owned ? (
                  <button style={{
                    width: '100%', padding: '7px 0',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, textAlign: 'center',
                    fontSize: 11, fontWeight: 700, color: '#C4B5FD',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>Pakai</button>
                ) : (
                  <button style={{
                    width: '100%', padding: '7px 0',
                    background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                    border: 'none', borderRadius: 8, textAlign: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>Beli</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info callout */}
        <div style={{
          marginTop: 20, borderRadius: 12,
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.15)',
          padding: '12px 14px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.6 }}>
            Tema hanya mengubah tampilan layar game (background &amp; warna aksen). Profil, toko, dan navigasi tetap sama.
          </div>
        </div>
      </div>
    </div>
  )
}
