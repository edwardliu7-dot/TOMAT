import React, { useState } from 'react';

export function TournMatch() {
  const [sliderValue, setSliderValue] = useState(5);

  return (
    <div style={{
      background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
      minHeight: '100dvh',
      maxWidth: '390px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 1. TopBar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(10, 22, 40, 0.8)',
        zIndex: 10
      }}>
        {/* Tombol kembali */}
        <button style={{
          background: 'rgba(255,255,255,0.06)',
          border: 'none',
          borderRadius: '8px',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer',
          padding: 0
        }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>←</span>
        </button>
        
        {/* Tengah */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#f59e0b', fontSize: '15px', fontWeight: 'bold' }}>
            🏆 Ronde 2 Turnamen
          </div>
          <div style={{ color: '#94A3B8', fontSize: '11px', marginTop: '2px' }}>
            🌡️ Termometer • vs Siti
          </div>
        </div>

        {/* Kanan - Progress Dots */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#67E8F9', boxShadow: '0 0 6px rgba(103,232,249,0.6)' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)' }} />
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        
        {/* 2. Score Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#1A1D27',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {/* Kamu */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>KAMU</div>
            <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>Budi</div>
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#67E8F9', lineHeight: 1, marginTop: '4px' }}>2</div>
          </div>

          {/* Soal */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, letterSpacing: '1px' }}>SOAL</div>
            <div style={{ fontSize: '18px', color: '#ffffff', fontWeight: 800, marginTop: '4px' }}>3/7</div>
          </div>

          {/* Lawan */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>LAWAN</div>
            <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: 500, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>Siti</div>
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#f59e0b', lineHeight: 1, marginTop: '4px' }}>2</div>
          </div>
        </div>

        {/* 3. Game Card */}
        <div style={{
          background: '#1A1D27',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            fontSize: '18px',
            lineHeight: 1.5,
            textAlign: 'center',
            marginBottom: '32px',
            color: '#ffffff'
          }}>
            Suhu ruangan <span style={{ color: '#67E8F9', fontWeight: 'bold' }}>−3°C</span>. Setelah dipanaskan naik <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>8°C</span>. Berapa suhu akhirnya?
          </div>
          
          <div style={{ width: '100%', padding: '0 10px', position: 'relative', marginBottom: '24px' }}>
            {/* Badge Nilai */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <div style={{
                background: 'rgba(103, 232, 249, 0.1)',
                border: '1px solid rgba(103, 232, 249, 0.4)',
                color: '#67E8F9',
                padding: '8px 24px',
                borderRadius: '12px',
                fontSize: '28px',
                fontWeight: '900',
                boxShadow: '0 0 16px rgba(103, 232, 249, 0.15)'
              }}>
                {sliderValue}
              </div>
            </div>

            {/* Slider */}
            <input 
              type="range" 
              min="-20" 
              max="20" 
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#67E8F9',
                height: '6px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer'
              }} 
            />
            
            {/* Tick Labels */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '12px',
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: 600
            }}>
              <span>-20</span>
              <span>0</span>
              <span>20</span>
            </div>
          </div>

          {/* 4. Tombol Konfirmasi */}
          <button style={{
            width: '100%',
            background: '#0e7490',
            border: 'none',
            borderRadius: '14px',
            padding: '16px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(14, 116, 144, 0.3)',
            transition: 'background 0.2s',
            marginTop: '8px'
          }}>
            ✅ Konfirmasi Jawaban: {sliderValue}
          </button>
        </div>

        {/* 5. Result Banner */}
        <div style={{
          background: 'rgba(248, 113, 113, 0.12)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: 'auto',
          boxShadow: '0 4px 12px rgba(248, 113, 113, 0.05)'
        }}>
          <div style={{ 
            color: '#f87171', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <span>❌</span> Salah! Jawaban: 5
          </div>
          <div style={{ color: '#94A3B8', fontSize: '13px' }}>
            Soal berikutnya sebentar lagi…
          </div>
        </div>

      </div>
    </div>
  );
}
