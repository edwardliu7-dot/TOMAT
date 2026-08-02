/**
 * Eob5InboxScreen.jsx
 * Chat guru ↔ siswa — two-panel UI.
 * Port dari kotak-masuk.tsx, adapted ke /api/komunikasi/* (TOMAT backend).
 *
 * Contacts:  GET  /api/komunikasi/contacts        → { contacts: [{ id, name, kelas, role }] }
 * Unread:    GET  /api/komunikasi/unread-detail    → { perContact: { 'siswa:id': n } }
 * Messages:  GET  /api/komunikasi/private/siswa/:id/messages  → { messages: [...] }
 * Send:      POST /api/komunikasi/private/siswa/:id/messages  → { body: "..." }
 * Mark read: POST /api/komunikasi/read             → { type:'private', otherRole:'siswa', otherId }
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../AuthContext'

const C = {
  bg: 'linear-gradient(160deg,#1a1200 0%,#2d1e00 100%)',
  primary: '#f59e0b', dim: 'rgba(245,158,11,0.18)', border: 'rgba(245,158,11,0.3)',
  text: '#fef3c7', sub: '#92400e', card: 'rgba(255,255,255,0.04)',
  white: 'rgba(255,255,255,0.07)',
}
const inp = { background:'rgba(255,255,255,0.07)', border:`1px solid ${C.border}`, borderRadius:8, padding:'9px 11px', color:'#fff', fontFamily:'inherit', fontSize:13, width:'100%', boxSizing:'border-box', outline:'none' }

function fmtTime(s) {
  if (!s) return ''
  try {
    const d = new Date(s)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })
    const y = new Date(now); y.setDate(now.getDate()-1)
    if (d.toDateString() === y.toDateString()) return 'Kemarin'
    return d.toLocaleDateString('id-ID', { day:'numeric', month:'short' })
  } catch { return '' }
}

function Avatar({ name='?', size=36 }) {
  const initials = name.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase() || '?'
  let h = 0; for (const c of name) h = (h*31+c.charCodeAt(0))&0xffff
  const bg = ['#f59e0b','#3b82f6','#8b5cf6','#22c55e','#ec4899','#14b8a6','#ef4444','#f97316'][h%8]
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.36, fontWeight:800, color:'#fff', flexShrink:0, userSelect:'none' }}>
      {initials}
    </div>
  )
}

// ── Chat Thread ──────────────────────────────────────────────────────────────
function ChatThread({ student, guruId, onBack }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)

  const load = useCallback(async (silent=false) => {
    if (!silent) setLoading(true)
    try {
      const r = await fetch(`/api/komunikasi/private/siswa/${student.id}/messages`, { credentials:'include' })
      if (r.ok) {
        const d = await r.json()
        setMessages(Array.isArray(d) ? d : (d.messages || []))
        // Mark read
        fetch('/api/komunikasi/read', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ type:'private', otherRole:'siswa', otherId: student.id }) }).catch(()=>{})
      }
    } catch {}
    if (!silent) setLoading(false)
  }, [student.id])

  useEffect(() => {
    load()
    pollRef.current = setInterval(() => load(true), 8000)
    return () => clearInterval(pollRef.current)
  }, [load])

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  const handleSend = async () => {
    const body = text.trim()
    if (!body || sending) return
    setSending(true); setText('')
    try {
      const r = await fetch(`/api/komunikasi/private/siswa/${student.id}/messages`, { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ body }) })
      if (r.ok) await load(true)
    } catch {}
    setSending(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderBottom:`1px solid ${C.border}`, background:'rgba(0,0,0,0.2)', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:C.primary, fontSize:20, cursor:'pointer', lineHeight:1 }}>←</button>
        <Avatar name={student.name} size={36} />
        <div>
          <div style={{ fontWeight:700, color:'#fff', fontSize:13 }}>{student.name}</div>
          <div style={{ fontSize:10, color:C.sub }}>{student.kelas || 'Siswa'}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:10, minHeight:0 }}>
        {loading && <div style={{ textAlign:'center', color:C.sub, padding:30, fontSize:12 }}>Memuat pesan…</div>}
        {!loading && messages.length === 0 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, color:C.sub, fontSize:13 }}>
            <span style={{ fontSize:32 }}>💬</span>
            <span>Mulai percakapan dengan {student.name}</span>
          </div>
        )}
        {messages.map((m, i) => {
          const isGuru = m.sender_role === 'guru' || String(m.sender_id) === String(guruId)
          const txt = m.body || m.message || m.content || ''
          return (
            <div key={m.id||i} style={{ display:'flex', flexDirection: isGuru ? 'row-reverse' : 'row', alignItems:'flex-end', gap:8 }}>
              {!isGuru && <Avatar name={student.name} size={28} />}
              <div style={{ maxWidth:'72%' }}>
                <div style={{
                  background: isGuru ? 'linear-gradient(135deg,#f59e0b,#d97706)' : C.white,
                  border: isGuru ? 'none' : `1px solid ${C.border}`,
                  borderRadius: isGuru ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  padding:'10px 13px', color: isGuru ? '#1a0a00' : '#fff',
                  fontSize:13, lineHeight:1.5, wordBreak:'break-word',
                }}>
                  {txt}
                </div>
                <div style={{ fontSize:10, color:C.sub, marginTop:3, textAlign: isGuru ? 'right' : 'left' }}>
                  {fmtTime(m.created_at || m.timestamp)}
                  {isGuru && m.read_at && <span style={{ marginLeft:4, color:'#60a5fa' }}>✓✓</span>}
                  {isGuru && !m.read_at && m.delivered_at && <span style={{ marginLeft:4 }}>✓</span>}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:'10px 12px', borderTop:`1px solid ${C.border}`, background:'rgba(0,0,0,0.2)', display:'flex', gap:8, alignItems:'flex-end', flexShrink:0 }}>
        <textarea
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleSend() } }}
          placeholder={`Pesan ke ${student.name}…`}
          rows={1}
          style={{ ...inp, resize:'none', flex:1, maxHeight:100, overflowY:'auto', lineHeight:1.5 }}
        />
        <button onClick={handleSend} disabled={!text.trim()||sending} style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)', border:'none', borderRadius:10, width:42, height:42, display:'flex', alignItems:'center', justifyContent:'center', cursor: text.trim()&&!sending?'pointer':'not-allowed', opacity: text.trim()&&!sending?1:0.4, flexShrink:0, fontSize:18 }}>
          ➤
        </button>
      </div>
    </div>
  )
}

// ── Conversation List ────────────────────────────────────────────────────────
function ConvList({ contacts, unreadMap, selId, search, onSelect, loading }) {
  const filtered = contacts.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.kelas?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ padding:40, textAlign:'center', color:C.sub, fontSize:13 }}>Memuat daftar siswa…</div>

  if (!filtered.length) return (
    <div style={{ padding:'48px 20px', textAlign:'center' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
      <div style={{ fontWeight:700, color:'#fff', marginBottom:6, fontSize:14 }}>{search ? 'Siswa tidak ditemukan' : 'Belum ada siswa terdaftar'}</div>
      <div style={{ color:C.sub, fontSize:12 }}>{search ? 'Coba kata kunci lain' : 'Siswa di kelasmu akan muncul di sini'}</div>
    </div>
  )

  // Sort: unread first, then alphabetical
  const sorted = [...filtered].sort((a,b) => {
    const ua = unreadMap[`siswa:${a.id}`] || 0
    const ub = unreadMap[`siswa:${b.id}`] || 0
    if (ub !== ua) return ub - ua
    return (a.kelas||'').localeCompare(b.kelas||'') || a.name.localeCompare(b.name)
  })

  // Group by kelas
  const byKelas = {}
  for (const c of sorted) {
    const k = c.kelas || 'Lainnya'
    if (!byKelas[k]) byKelas[k] = []
    byKelas[k].push(c)
  }

  return (
    <div style={{ overflowY:'auto', flex:1 }}>
      {Object.entries(byKelas).map(([kelas, students]) => (
        <div key={kelas}>
          <div style={{ padding:'8px 14px 4px', fontSize:10, fontWeight:800, color:C.sub, letterSpacing:1, textTransform:'uppercase', background:'rgba(0,0,0,0.15)' }}>{kelas}</div>
          {students.map(s => {
            const unread = unreadMap[`siswa:${s.id}`] || 0
            const sel = s.id === selId
            return (
              <button key={s.id} onClick={()=>onSelect(s)} style={{ width:'100%', background: sel ? C.dim : 'transparent', border:'none', borderBottom:`1px solid ${C.border}`, padding:'11px 14px', cursor:'pointer', textAlign:'left', fontFamily:'inherit', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <Avatar name={s.name} size={40} />
                  {unread > 0 && (
                    <div style={{ position:'absolute', top:-3, right:-3, background:'#ef4444', color:'#fff', borderRadius:99, fontSize:9, fontWeight:800, padding:'1px 5px', minWidth:16, textAlign:'center', lineHeight:'14px' }}>{unread}</div>
                  )}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color: sel ? C.primary : '#fff', fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                  {unread > 0 && <div style={{ fontSize:10, color:'#fbbf24', fontWeight:700 }}>{unread} pesan belum dibaca</div>}
                  {unread === 0 && <div style={{ fontSize:10, color:C.sub }}>Tap untuk membuka percakapan</div>}
                </div>
                <span style={{ color:C.border, fontSize:14 }}>›</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function Eob5InboxScreen({ navigate, goBack }) {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [unreadMap, setUnreadMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [selStudent, setSelStudent] = useState(null)
  const [showThread, setShowThread] = useState(false)
  const [search, setSearch] = useState('')

  if (user?.role !== 'guru') return <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:'system-ui' }}>Akses hanya untuk guru.</div>

  const loadAll = useCallback(async () => {
    try {
      const [contactsRes, unreadRes] = await Promise.all([
        fetch('/api/komunikasi/contacts', { credentials:'include' }),
        fetch('/api/komunikasi/unread-detail', { credentials:'include' }),
      ])
      if (contactsRes.ok) {
        const d = await contactsRes.json()
        setContacts((d.contacts || []).filter(c => c.role === 'siswa'))
      }
      if (unreadRes.ok) {
        const d = await unreadRes.json()
        setUnreadMap(d.perContact || {})
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAll()
    const poll = setInterval(loadAll, 12000)
    return () => clearInterval(poll)
  }, [loadAll])

  const totalUnread = Object.values(unreadMap).reduce((s,v)=>s+(v||0), 0)

  const handleSelect = (student) => {
    setSelStudent(student)
    setShowThread(true)
    // Optimistically clear unread
    setUnreadMap(prev => ({ ...prev, [`siswa:${student.id}`]: 0 }))
  }

  const handleBack = () => {
    setShowThread(false)
    loadAll()
  }

  return (
    <div style={{ minHeight:'100vh', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', color:C.text, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.35)', borderBottom:`1px solid ${C.border}`, padding:'14px 16px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
        <button onClick={showThread ? handleBack : goBack} style={{ background:'none', border:'none', color:C.primary, fontSize:22, cursor:'pointer', lineHeight:1 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:C.sub, fontWeight:700, letterSpacing:1.5 }}>GURU</div>
          <div style={{ fontSize:17, fontWeight:800, color:'#fff', display:'flex', alignItems:'center', gap:8 }}>
            {showThread && selStudent ? selStudent.name : 'Pesan Siswa'}
            {!showThread && totalUnread > 0 && <span style={{ background:'#ef4444', color:'#fff', borderRadius:99, fontSize:10, fontWeight:800, padding:'2px 7px' }}>{totalUnread}</span>}
          </div>
        </div>
        {!showThread && <button onClick={loadAll} style={{ background:'transparent', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 10px', color:C.sub, cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>↻</button>}
      </div>

      {/* List or Thread */}
      {showThread && selStudent
        ? (
          <div style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <ChatThread student={selStudent} guruId={user?.id} onBack={handleBack} />
          </div>
        )
        : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Search */}
            <div style={{ padding:'10px 12px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:C.sub, fontSize:14, pointerEvents:'none' }}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama siswa atau kelas…" style={{ ...inp, paddingLeft:32 }} />
              </div>
            </div>
            <ConvList contacts={contacts} unreadMap={unreadMap} selId={selStudent?.id} search={search} onSelect={handleSelect} loading={loading} />
          </div>
        )
      }
    </div>
  )
}
