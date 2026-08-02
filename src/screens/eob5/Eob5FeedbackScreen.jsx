/**
 * Eob5FeedbackScreen.jsx — Kotak Masuk Feedback Guru
 * Admin: lihat saran/kritik/bug dari guru, tandai dibaca, hapus.
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b',
  dim: 'rgba(245,158,11,0.18)',
  border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7',
  sub: '#92400e',
  card: 'rgba(255,255,255,0.06)',
  green: '#4ade80',
  red: '#f87171',
  blue: '#60a5fa',
}

const KATEGORI = {
  saran:  { label: 'Saran',        emoji: '💡', color: 'rgba(245,158,11,0.2)',  text: '#f59e0b' },
  kritik: { label: 'Kritik',       emoji: '👎', color: 'rgba(239,68,68,0.2)',   text: '#f87171' },
  bug:    { label: 'Laporan Bug',  emoji: '🐛', color: 'rgba(168,85,247,0.2)',  text: '#c084fc' },
}

function safeDate(val) {
  try {
    if (!val) return '-'
    const d = new Date(val)
    if (isNaN(d)) return '-'
    return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '-' }
}

export default function Eob5FeedbackScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [markingId, setMarkingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [expandedId, setExpandedId] = useState(null)

  if (user?.role !== 'guru') return (
    <div style={{ padding: 60, textAlign: 'center', color: C.red, fontFamily: 'system-ui' }}>Akses hanya untuk guru.</div>
  )

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 4000) }

  const loadData = useCallback(() => {
    setLoading(true); setError('')
    fetch('/api/eob5/feedback', { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { setError('Gagal memuat feedback. Coba lagi.'); setLoading(false) })
  }, [])

  useEffect(() => { loadData() }, [])

  const handleMarkRead = async (id) => {
    setMarkingId(id)
    try {
      const r = await fetch(`/api/eob5/feedback/${id}/read`, { method: 'PATCH', credentials: 'include' })
      if (!r.ok) throw new Error()
      setData(prev => prev.map(f => f.id === id ? { ...f, is_read: true } : f))
    } catch { showMsg('error', 'Gagal menandai sudah dibaca') }
    setMarkingId(null)
  }

  const handleMarkAllRead = async () => {
    const unread = data.filter(f => !f.is_read)
    if (unread.length === 0) return
    await Promise.all(unread.map(f => fetch(`/api/eob5/feedback/${f.id}/read`, { method: 'PATCH', credentials: 'include' }).catch(() => {})))
    setData(prev => prev.map(f => ({ ...f, is_read: true })))
    showMsg('ok', `${unread.length} pesan ditandai sudah dibaca`)
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus feedback ini?')) return
    setDeletingId(id)
    try {
      const r = await fetch(`/api/eob5/feedback/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!r.ok) throw new Error()
      setData(prev => prev.filter(f => f.id !== id))
      showMsg('ok', 'Feedback dihapus')
    } catch { showMsg('error', 'Gagal menghapus') }
    setDeletingId(null)
  }

  const unreadCount = data.filter(f => !f.is_read).length

  const filtered = data.filter(f => {
    if (filter === 'all') return true
    if (filter === 'unread') return !f.is_read
    return f.kategori === filter
  })

  const FILTERS = [
    { key: 'all', label: 'Semua' },
    { key: 'unread', label: `Belum dibaca${unreadCount ? ` (${unreadCount})` : ''}` },
    { key: 'saran', label: '💡 Saran' },
    { key: 'kritik', label: '👎 Kritik' },
    { key: 'bug', label: '🐛 Laporan Bug' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'system-ui,sans-serif', color: C.text, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.4)', borderBottom: `1px solid ${C.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1.5 }}>GURU</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Kotak Masuk Feedback</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px', color: C.primary, fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ✓✓ Tandai semua dibaca
            </button>
          )}
          <button
            onClick={loadData}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 12px', color: '#94a3b8', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        {/* Message */}
        {msg.text && (
          <div style={{ background: msg.type === 'ok' ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${msg.type === 'ok' ? '#4ade80' : '#ef4444'}`, borderRadius: 10, padding: '10px 14px', color: msg.type === 'ok' ? C.green : C.red, fontSize: 13, marginBottom: 14 }}>
            {msg.text}
          </div>
        )}

        {/* Filter pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{ background: filter === f.key ? C.primary : 'rgba(255,255,255,0.06)', border: `1px solid ${filter === f.key ? C.primary : C.border}`, borderRadius: 20, padding: '5px 12px', color: filter === f.key ? '#1a0a00' : C.text, fontWeight: filter === f.key ? 700 : 400, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total', count: data.length, emoji: '📬', color: 'rgba(245,158,11,0.2)' },
            { label: 'Belum Dibaca', count: unreadCount, emoji: '🔵', color: 'rgba(96,165,250,0.2)' },
            { label: 'Saran', count: data.filter(f => f.kategori === 'saran').length, emoji: '💡', color: 'rgba(245,158,11,0.15)' },
            { label: 'Bug', count: data.filter(f => f.kategori === 'bug').length, emoji: '🐛', color: 'rgba(168,85,247,0.15)' },
          ].map(stat => (
            <div key={stat.label} style={{ background: stat.color, border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{stat.emoji}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{stat.count}</div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 700 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📬</div>
            <div style={{ color: C.sub, fontSize: 13 }}>Memuat feedback...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>⚠️</div>
            <div style={{ color: C.red, fontSize: 13, marginBottom: 8 }}>{error}</div>
            <button onClick={loadData} style={{ background: C.dim, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 14px', color: C.primary, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Coba Lagi</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: C.card, borderRadius: 14, border: `1px dashed ${C.border}` }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <div style={{ color: C.sub, fontSize: 13 }}>
              {filter === 'unread' ? 'Tidak ada pesan yang belum dibaca.' : 'Belum ada feedback yang masuk.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(item => {
              const kat = KATEGORI[item.kategori] || KATEGORI.saran
              const isExpanded = expandedId === item.id
              return (
                <div
                  key={item.id}
                  style={{ background: !item.is_read ? 'rgba(96,165,250,0.08)' : C.card, border: `1px solid ${!item.is_read ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s' }}
                >
                  {/* Main row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}
                  >
                    {/* Category icon */}
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: kat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {kat.emoji}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{item.teacher_name || item.teacherName || 'Guru'}</span>
                        <span style={{ background: kat.color, color: kat.text, borderRadius: 12, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>{kat.label}</span>
                        {!item.is_read && (
                          <span style={{ background: 'rgba(96,165,250,0.3)', color: C.blue, borderRadius: 12, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>Baru</span>
                        )}
                        <span style={{ fontSize: 10, color: C.sub, marginLeft: 'auto' }}>{safeDate(item.created_at)}</span>
                      </div>
                      {item.page_url && (
                        <a
                          href={item.page_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: 10, color: C.blue, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginBottom: 3 }}
                        >
                          🔗 {item.page_url.replace(/^https?:\/\/[^/]+/, '') || item.page_url}
                        </a>
                      )}
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5, overflow: isExpanded ? 'visible' : 'hidden', textOverflow: isExpanded ? 'unset' : 'ellipsis', whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap' }}>
                        {item.pesan}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                      {!item.is_read && (
                        <button
                          onClick={e => { e.stopPropagation(); handleMarkRead(item.id) }}
                          disabled={markingId === item.id}
                          style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 6, padding: '5px 8px', color: C.blue, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
                          title="Tandai sudah dibaca"
                        >
                          {markingId === item.id ? '⏳' : '✓✓'}
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(item.id) }}
                        disabled={deletingId === item.id}
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '5px 8px', color: C.red, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
                        title="Hapus"
                      >
                        {deletingId === item.id ? '⏳' : '🗑'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded: screenshot */}
                  {isExpanded && item.screenshot_base64 && (
                    <div style={{ padding: '0 14px 12px 62px' }}>
                      <details>
                        <summary style={{ cursor: 'pointer', fontSize: 11, color: C.sub, userSelect: 'none' }}>🖼 Lihat screenshot</summary>
                        <img
                          src={item.screenshot_base64}
                          alt="Screenshot"
                          style={{ marginTop: 8, maxWidth: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8, border: `1px solid ${C.border}` }}
                        />
                      </details>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
