import React from 'react'

export default function UpdateRequiredScreen({ downloadUrl }) {
  function handleDownload() {
    if (downloadUrl) {
      // Buka link download di browser eksternal HP
      window.open(downloadUrl, '_blank')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'linear-gradient(160deg, #0a0b14 0%, #0e1a2e 60%, #0a0b14 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
    }}>
      {/* Ikon update */}
      <div style={{
        width: 88, height: 88, borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40, marginBottom: 28,
        boxShadow: '0 0 40px rgba(99,102,241,0.45)',
      }}>
        🚀
      </div>

      {/* Judul */}
      <div style={{
        fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 10,
        letterSpacing: -0.3,
      }}>
        Update Diperlukan
      </div>

      {/* Pesan */}
      <div style={{
        fontSize: 15, color: '#94a3b8', lineHeight: 1.6,
        maxWidth: 300, marginBottom: 36,
      }}>
        Versi TOMAT yang terpasang sudah tidak didukung.
        Silakan download versi terbaru untuk melanjutkan.
      </div>

      {/* Tombol download */}
      {downloadUrl ? (
        <button onClick={handleDownload} style={{
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          color: '#fff', border: 'none', borderRadius: 16,
          padding: '16px 40px', fontSize: 16, fontWeight: 800,
          cursor: 'pointer', width: '100%', maxWidth: 300,
          boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
          letterSpacing: 0.2,
        }}>
          ⬇️  Download Update
        </button>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.06)', borderRadius: 14,
          padding: '16px 24px', color: '#94a3b8', fontSize: 14,
          maxWidth: 300, width: '100%',
        }}>
          Hubungi admin untuk mendapatkan link download APK terbaru.
        </div>
      )}

      {/* Versi info kecil */}
      <div style={{ marginTop: 40, fontSize: 12, color: '#334155' }}>
        TOMAT — Tantangan Otak Matematika
      </div>
    </div>
  )
}
