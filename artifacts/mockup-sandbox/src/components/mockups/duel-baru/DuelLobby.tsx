import React, { useState } from 'react';

export function DuelLobby() {
  const [code, setCode] = useState('');

  const styles: { [key: string]: React.CSSProperties } = {
    wrapper: {
      background: '#000',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
    },
    container: {
      background: 'linear-gradient(180deg,#0A1628 0%,#0d1f3c 100%)',
      minHeight: '100vh',
      width: '100%',
      maxWidth: 390,
      fontFamily: 'system-ui, sans-serif',
      color: '#ffffff',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxSizing: 'border-box',
    },
    topBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 20px',
    },
    backButton: {
      background: '#1e293b',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#ffffff',
      borderRadius: '50%',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      cursor: 'pointer',
      padding: 0,
    },
    title: {
      fontSize: 18,
      fontWeight: 700,
      margin: 0,
      letterSpacing: '0.5px',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: '#1e293b',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: '#94A3B8',
      padding: '0 20px',
      marginBottom: 12,
      marginTop: 8,
    },
    gameList: {
      display: 'flex',
      gap: 12,
      padding: '0 20px',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      marginBottom: 24,
    },
    gameCardSelected: {
      width: 64,
      height: 64,
      minWidth: 64,
      borderRadius: 16,
      background: 'rgba(103,232,249,0.1)',
      border: '2px solid #67E8F9',
      boxShadow: '0 0 12px rgba(103,232,249,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 32,
      cursor: 'pointer',
    },
    gameCard: {
      width: 64,
      height: 64,
      minWidth: 64,
      borderRadius: 16,
      background: '#1A1D27',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 32,
      cursor: 'pointer',
      opacity: 0.7,
    },
    gameLabel: {
      fontSize: 10,
      color: '#94A3B8',
      textAlign: 'center',
      marginTop: 4,
      fontWeight: 500,
    },
    optionsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '0 20px',
      flex: 1,
    },
    createCard: {
      background: 'rgba(103,232,249,0.06)',
      border: '1px solid rgba(103,232,249,0.2)',
      borderRadius: 16,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    joinCard: {
      background: 'rgba(245,158,11,0.06)',
      border: '1px solid rgba(245,158,11,0.2)',
      borderRadius: 16,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
    cardIcon: {
      fontSize: 40,
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: '#ffffff',
      margin: '0 0 4px 0',
    },
    cardDesc: {
      fontSize: 14,
      color: '#94A3B8',
      margin: '0 0 20px 0',
    },
    createButton: {
      background: '#0891b2',
      color: '#fff',
      border: 'none',
      borderRadius: 14,
      padding: '16px',
      width: '100%',
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
    },
    joinButton: {
      background: '#b45309',
      color: '#fff',
      border: 'none',
      borderRadius: 14,
      padding: '16px',
      width: '100%',
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
    },
    codeInput: {
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(245,158,11,0.3)',
      borderRadius: 12,
      padding: '16px',
      width: '100%',
      fontSize: 24,
      fontWeight: 800,
      color: '#f59e0b',
      textAlign: 'center',
      letterSpacing: '4px',
      textTransform: 'uppercase',
      outline: 'none',
      marginBottom: 20,
      boxSizing: 'border-box',
    },
    banner: {
      position: 'absolute',
      bottom: 24,
      left: 20,
      right: 20,
      background: 'rgba(245,158,11,0.15)',
      border: '1px solid rgba(245,158,11,0.3)',
      borderRadius: 16,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      backdropFilter: 'blur(8px)',
    },
    bannerTextContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    bannerIcon: {
      fontSize: 24,
      background: 'rgba(245,158,11,0.2)',
      borderRadius: '50%',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bannerText: {
      fontSize: 14,
      color: '#ffffff',
      fontWeight: 500,
      flex: 1,
      lineHeight: 1.4,
    },
    bannerButtons: {
      display: 'flex',
      gap: 8,
    },
    bannerBtnAccept: {
      flex: 1,
      background: '#f59e0b',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      padding: '10px',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
    },
    bannerBtnDecline: {
      flex: 1,
      background: 'rgba(255,255,255,0.1)',
      color: '#94A3B8',
      border: 'none',
      borderRadius: 10,
      padding: '10px',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <style>{`
          .hide-scroll::-webkit-scrollbar {
            display: none;
          }
          input::placeholder {
            color: rgba(245,158,11,0.3);
          }
        `}</style>
        
        {/* Top Bar */}
        <div style={styles.topBar}>
          <button style={styles.backButton}>←</button>
          <h1 style={styles.title}>⚔️ Duel Matematika</h1>
          <div style={styles.avatar}>🧑‍🎓</div>
        </div>

        {/* Pilih Game */}
        <div style={styles.sectionTitle}>Pilih Mode</div>
        <div style={styles.gameList} className="hide-scroll">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={styles.gameCardSelected}>🐸</div>
            <div style={{...styles.gameLabel, color: '#67E8F9'}}>Katak</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={styles.gameCard}>🌡️</div>
            <div style={styles.gameLabel}>Termometer</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={styles.gameCard}>🤖</div>
            <div style={styles.gameLabel}>Pabrik</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={styles.gameCard}>💎</div>
            <div style={styles.gameLabel}>Scanner</div>
          </div>
        </div>

        {/* Dua Opsi Utama */}
        <div style={styles.optionsContainer}>
          {/* Card: Buat Ruangan */}
          <div style={styles.createCard}>
            <div style={styles.cardIcon}>⚔️</div>
            <h2 style={styles.cardTitle}>Buat Ruangan</h2>
            <p style={styles.cardDesc}>Bagikan kode ke temanmu</p>
            <button style={styles.createButton}>Buat Ruangan →</button>
          </div>

          {/* Card: Masuk dengan Kode */}
          <div style={styles.joinCard}>
            <input 
              style={styles.codeInput} 
              placeholder="A B C D 1 2" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
            <button style={styles.joinButton}>Bergabung →</button>
          </div>
        </div>

        {/* Banner Notifikasi Undangan */}
        <div style={styles.banner}>
          <div style={styles.bannerTextContainer}>
            <div style={styles.bannerIcon}>⚔️</div>
            <div style={styles.bannerText}>
              <span style={{color: '#f59e0b', fontWeight: 700}}>Ahmad</span> mengajakmu duel!<br/>
              Katak Pelompat 🐸
            </div>
          </div>
          <div style={styles.bannerButtons}>
            <button style={styles.bannerBtnDecline}>Tolak</button>
            <button style={styles.bannerBtnAccept}>Terima</button>
          </div>
        </div>

      </div>
    </div>
  );
}
