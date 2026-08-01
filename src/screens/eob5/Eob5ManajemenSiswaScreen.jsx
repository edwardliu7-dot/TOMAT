import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'

const COLOR = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b',
  primaryDim: 'rgba(245,158,11,0.18)',
  border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7',
  textSub: '#92400e',
  card: 'rgba(255,255,255,0.04)',
}

export default function Eob5ManajemenSiswaScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [kelasList, setKelasList] = useState([])
  const [selectedKelas, setSelectedKelas] = useState('')
  const [siswaList, setSiswaList] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user?.role !== 'guru') {
    return <div style={{ padding: 60, textAlign: 'center', color: '#ef4444', fontFamily: 'system-ui' }}>Akses hanya untuk guru.</div>
  }

  useEffect(() => {
    fetch('/api/eob5/kelas/list', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setKelasList(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedKelas) { setSiswaList([]); return }
    setLoading(true); setError('')
    fetch(`/api/eob5/kelas/${encodeURIComponent(selectedKelas)}/siswa`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setSiswaList(data.siswa || [])
        setLoading(false)
      })
      .catch(() => { setError('Gagal memuat data siswa'); setLoading(false) })
  }, [selectedKelas])

  const filtered = siswaList.filter(s =>
    !searchQuery ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLihatSiswa = (siswa) => {
    window.dispatchEvent(new CustomEvent('eob5:lihat-siswa', { detail: { id: siswa.id } }))
  }

  return (
    <div style={{ minHeight: '100vh', background: COLOR.bg, fontFamily: 'system-ui, sans-serif', color: COLOR.text, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.35)', borderBottom: `1px solid ${COLOR.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: COLOR.primary, fontSize: 22, cursor: 'pointer', padding: '0 4px' }}>←</button>
        <div>
          <div style={{ fontSize: 11, color: COLOR.textSub, fontWeight: 700, letterSpacing: 1.5 }}>GURU</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Manajemen Siswa</div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Filter kelas */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: COLOR.textSub, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>FILTER KELAS</div>
          <select
            value={selectedKelas}
            onChange={e => { setSelectedKelas(e.target.value); setSearchQuery('') }}
            style={{ width: '100%', background: '#1c0a00', border: `1px solid ${COLOR.border}`, borderRadius: 10, padding: '10px 12px', color: '#fff', fontFamily: 'inherit', fontSize: 14 }}
          >
            <option value="">— Semua Kelas —</option>
            {kelasList.map(k => (
              <option key={k.kelas} value={k.kelas}>{k.kelas} ({k.jumlahSiswa} siswa)</option>
            ))}
          </select>
        </div>

        {/* Search */}
        {(selectedKelas || siswaList.length > 0) && (
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: COLOR.textSub, fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder="Cari nama atau username…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${COLOR.border}`, borderRadius: 10, padding: '10px 12px 10px 34px', color: '#fff', fontFamily: 'inherit', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
        )}

        {/* Status */}
        {loading && <div style={{ textAlign: 'center', color: COLOR.textSub, padding: 40 }}>Memuat data siswa…</div>}
        {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: 10, padding: '10px 14px', color: '#f87171', fontSize: 13 }}>{error}</div>}

        {!loading && !selectedKelas && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
            <div style={{ color: COLOR.textSub, fontSize: 14 }}>Pilih kelas untuk melihat daftar siswa</div>
          </div>
        )}

        {!loading && selectedKelas && filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: COLOR.textSub, padding: 40 }}>
            {searchQuery ? `Tidak ada siswa yang cocok dengan "${searchQuery}"` : 'Tidak ada siswa di kelas ini.'}
          </div>
        )}

        {/* Count */}
        {!loading && filtered.length > 0 && (
          <div style={{ fontSize: 11, color: COLOR.textSub, marginBottom: 10 }}>
            Menampilkan {filtered.length} dari {siswaList.length} siswa
            {selectedKelas ? ` — ${selectedKelas}` : ''}
          </div>
        )}

        {/* Siswa List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((s, i) => (
            <button key={s.id} onClick={() => handleLihatSiswa(s)} style={{
              background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: 14,
              padding: '14px 16px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 12,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = COLOR.primaryDim }}
            onMouseLeave={e => { e.currentTarget.style.background = COLOR.card }}
            >
              {/* Avatar */}
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: `hsl(${(i * 47) % 360},60%,35%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {s.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 11, color: COLOR.textSub, marginTop: 2 }}>
                  {s.username}
                  {s.kelas && ` · ${s.kelas}`}
                </div>
              </div>

              <div style={{ flexShrink: 0 }}>
                <span style={{
                  background: COLOR.primaryDim, color: COLOR.primary,
                  borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700,
                }}>
                  Detail →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
