import React from 'react';

export function TournGuruCreate() {
  const containerStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #0A1628 0%, #0d1f3c 100%)',
    minHeight: '100vh',
    width: '100%',
    maxWidth: '390px',
    margin: '0 auto',
    color: '#ffffff',
    fontFamily: 'system-ui, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    paddingBottom: '24px',
  };

  const topBarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: '#0A1628',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  };

  const contentStyle: React.CSSProperties = {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#1A1D27',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const fieldGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    color: '#94A3B8',
    letterSpacing: '0.05em',
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#111827',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '15px',
    appearance: 'none',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const gamesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  };

  const getGameCardStyle = (selected: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: selected ? 'rgba(103, 232, 249, 0.1)' : '#111827',
    border: selected ? '1px solid #67E8F9' : '1px solid rgba(255,255,255,0.1)',
    boxShadow: selected ? '0 0 8px rgba(103, 232, 249, 0.2)' : 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: selected ? 600 : 500,
    color: selected ? '#67E8F9' : '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  });

  const radioOptionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#111827',
    border: '1px solid rgba(255,255,255,0.1)',
  };

  const radioOptionSelectedStyle: React.CSSProperties = {
    ...radioOptionStyle,
    border: '1px solid #67E8F9',
    backgroundColor: 'rgba(103, 232, 249, 0.05)',
  };

  const radioCircleStyle = (selected: boolean): React.CSSProperties => ({
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: selected ? '5px solid #67E8F9' : '1px solid #94A3B8',
    backgroundColor: selected ? '#111827' : 'transparent',
    marginTop: '2px',
    flexShrink: 0,
    boxSizing: 'border-box',
  });

  const participantCardStyle: React.CSSProperties = {
    ...cardStyle,
    padding: '16px',
    gap: '16px',
  };

  const participantHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const participantListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const participantItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const statusDotStyle = (online: boolean): React.CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: online ? '#10b981' : '#475569',
  });

  const bannerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(103, 232, 249, 0.06)',
    border: '1px solid rgba(103, 232, 249, 0.15)',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '12px',
    color: '#94A3B8',
    lineHeight: 1.5,
  };

  const startButtonStyle: React.CSSProperties = {
    backgroundColor: '#b45309',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 700,
    width: '100%',
    cursor: 'pointer',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(180, 83, 9, 0.3)',
    marginTop: '8px',
  };

  return (
    <div style={containerStyle}>
      {/* Top Bar */}
      <div style={topBarStyle}>
        <div style={{ cursor: 'pointer', fontSize: '18px', padding: '4px' }}>←</div>
        <div style={{ fontWeight: 600, fontSize: '16px' }}>🏆 Buat Turnamen Baru</div>
        <div style={{ cursor: 'pointer', fontSize: '18px', padding: '4px', color: '#94A3B8' }}>✕</div>
      </div>

      <div style={contentStyle}>
        {/* Form Section */}
        <div style={cardStyle}>
          {/* Kelas */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>KELAS</div>
            <div style={{ position: 'relative' }}>
              <select style={inputStyle} defaultValue="VII Ibnu Batuttah">
                <option value="VII Ibnu Batuttah">VII Ibnu Batuttah</option>
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94A3B8' }}>▼</div>
            </div>
          </div>

          {/* Game */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>GAME</div>
            <div style={gamesGridStyle}>
              <div style={getGameCardStyle(true)}>
                <span style={{ fontSize: '16px' }}>🐸</span> Katak Pelompat
              </div>
              <div style={getGameCardStyle(false)}>
                <span style={{ fontSize: '16px' }}>🌡️</span> Termometer
              </div>
              <div style={getGameCardStyle(false)}>
                <span style={{ fontSize: '16px' }}>🤖</span> Pabrik Robot
              </div>
              <div style={getGameCardStyle(false)}>
                <span style={{ fontSize: '16px' }}>⚙️</span> Gembok FPB
              </div>
              <div style={getGameCardStyle(false)}>
                <span style={{ fontSize: '16px' }}>🏮</span> Mercusuar KPK
              </div>
              <div style={getGameCardStyle(false)}>
                <span style={{ fontSize: '16px' }}>💎</span> Scanner Prima
              </div>
            </div>
          </div>

          {/* Format */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>FORMAT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={radioOptionSelectedStyle}>
                <div style={radioCircleStyle(true)}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Eliminasi Tunggal</span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>Kalah sekali langsung gugur</span>
                </div>
              </div>
              <div style={radioOptionStyle}>
                <div style={radioCircleStyle(false)}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>Round Robin</span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>Semua lawan semua</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Peserta Card */}
        <div style={participantCardStyle}>
          <div style={participantHeaderStyle}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em' }}>PESERTA TERDAFTAR</div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
              8/16
            </div>
          </div>

          <div style={participantListStyle}>
            <div style={participantItemStyle}>
              <div style={statusDotStyle(true)}></div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0e7490', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>AF</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Ahmad Fauzi</span>
              </div>
            </div>
            
            <div style={participantItemStyle}>
              <div style={statusDotStyle(true)}></div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>BS</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Budi Santoso</span>
              </div>
            </div>

            <div style={participantItemStyle}>
              <div style={statusDotStyle(false)}></div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>SN</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>Siti Nurhaliza</span>
              </div>
            </div>

            <div style={participantItemStyle}>
              <div style={statusDotStyle(true)}></div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>DP</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Dani Pratama</span>
              </div>
            </div>

            <div style={participantItemStyle}>
              <div style={statusDotStyle(false)}></div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>RA</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#94A3B8' }}>Rizky Aditya</span>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#94A3B8', fontStyle: 'italic', paddingLeft: '52px', marginTop: '4px' }}>
              ...dan 3 lainnya
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div style={bannerStyle}>
          <span style={{ marginRight: '4px' }}>🎯</span> Turnamen akan dimulai setelah kamu klik Mulai. Semua siswa online akan otomatis masuk.
        </div>

        {/* Tombol Mulai */}
        <button style={startButtonStyle}>
          🏆 Mulai Turnamen — 8 Peserta
        </button>
      </div>
    </div>
  );
}
