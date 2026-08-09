/**
 * LandscapeChat — wraps original CommunicationScreen API contract exactly.
 * Endpoints:
 *   GET  /api/komunikasi/contacts              → { contacts: [{id,name,role,unread},...] }
 *   GET  /api/komunikasi/classes               → { classes: ['VII A',...] }
 *   GET  /api/komunikasi/private/:role/:id/messages  → { messages: [...] }
 *   GET  /api/komunikasi/forum/:kelas/messages → { messages: [...] }
 *   POST same paths                            → body: { body: text }
 *   POST /api/komunikasi/read                  → body: { type, otherRole?, otherId?, kelas? }
 *   GET  /api/komunikasi/unread-detail         → { perContact:{}, perForum:{} }
 *   GET  /api/komunikasi/global/messages       → { messages: [...] }
 *   POST /api/komunikasi/global/messages       → body: { body: text }
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../AuthContext'
import { UserAvatar } from '../../components/shared'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', purple:'#cecbf6', orange:'#e2653f', teal:'#22c4a5' }

function openProfile(target) {
  if (!target?.id) return
  window.dispatchEvent(new CustomEvent('tomat:visit-profile', {
    detail: {
      id: target.id,
      role: target.role || 'siswa',
      name: target.name || target.username || '',
      photoUrl: target.photoUrl ?? target.photo_url ?? null,
      equippedBingkai: target.equippedBingkai ?? target.equipped_bingkai ?? null,
      kelas: target.kelas ?? null,
    }
  }))
}

function inviteDuel(target) {
  if (!target?.id) return
  window.dispatchEvent(new CustomEvent('tomat:invite-duel', {
    detail: { id: target.id, role: target.role || 'siswa', name: target.name || '' }
  }))
}

const STICKER_PREFIX = '[sticker]'

async function apiCall(path, opts = {}) {
  const r = await fetch(path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const d = await r.json().catch(()=>({}))
  if (!r.ok) throw new Error(d.error || 'Terjadi kesalahan.')
  return d
}

async function markRead({ tab, selectedContact, selectedClass, messages }) {
  if (messages.length === 0 || tab === 'global') return
  const body = tab === 'private'
    ? { type:'private', otherRole: selectedContact.role, otherId: selectedContact.id }
    : { type:'forum', kelas: selectedClass }
  await apiCall('/api/komunikasi/read', { method:'POST', body }).catch(()=>{})
}

function formatTime(v) {
  if (!v) return ''
  return new Date(v).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })
}

function isSticker(body) { return typeof body === 'string' && body.startsWith(STICKER_PREFIX) }

export default function LandscapeChat({ goBack, initialTarget, initialTab: initialTabProp }) {
  const { user } = useAuth()
  const [tab, setTab]                     = useState(initialTabProp || 'private')
  const [contacts, setContacts]           = useState([])
  const [classes, setClasses]             = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [selectedClass, setSelectedClass] = useState('')
  const [messages, setMessages]           = useState([])
  const [body, setBody]                   = useState('')
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [sending, setSending]             = useState(false)
  const [error, setError]                 = useState('')
  const [unread, setUnread]               = useState({ perContact:{}, perForum:{} })
  const bottomRef  = useRef(null)
  const initApplied = useRef(null)

  // Load contacts + classes
  const loadOptions = useCallback(async () => {
    setLoadingContacts(true)
    try {
      const [{ contacts: cs }, { classes: kls }] = await Promise.all([
        apiCall('/api/komunikasi/contacts'),
        apiCall('/api/komunikasi/classes'),
      ])
      setContacts(cs || [])
      setClasses(kls || [])
      setSelectedContact(cur => cur || cs?.[0] || null)
      setSelectedClass(cur => cur || kls?.[0] || '')
    } catch(e) { setError(e.message) }
    finally { setLoadingContacts(false) }
  }, [])

  useEffect(() => { loadOptions() }, [loadOptions])

  // Handle initialTarget (same logic as original)
  useEffect(() => {
    if (!initialTarget || initApplied.current === initialTarget || loadingContacts) return
    const { conversationType, senderId, senderRole, kelas } = initialTarget
    if (conversationType === 'private' && senderId && senderRole) {
      const contact = contacts.find(c => c.id === senderId && c.role === senderRole)
      if (contact) { initApplied.current = initialTarget; setTab('private'); setSelectedContact(contact); setMessages([]) }
    } else if (conversationType === 'forum' && kelas) {
      initApplied.current = initialTarget; setTab('forum'); setSelectedClass(kelas); setMessages([])
    }
  }, [initialTarget, contacts, classes, loadingContacts])

  // Unread polling
  const loadUnread = useCallback(async () => {
    try {
      const d = await apiCall('/api/komunikasi/unread-detail')
      setUnread({ perContact: d.perContact||{}, perForum: d.perForum||{} })
    } catch {}
  }, [])
  useEffect(() => { loadUnread(); const t = setInterval(loadUnread, 6000); return () => clearInterval(t) }, [loadUnread])

  // Load messages (private/forum/global)
  const loadMessages = useCallback(async () => {
    let path
    if (tab === 'global') {
      path = '/api/komunikasi/global/messages'
    } else if (tab === 'private') {
      path = selectedContact ? `/api/komunikasi/private/${selectedContact.role}/${encodeURIComponent(selectedContact.id)}/messages` : null
    } else {
      path = selectedClass ? `/api/komunikasi/forum/${encodeURIComponent(selectedClass)}/messages` : null
    }
    if (!path) { setMessages([]); return }
    try {
      const d = await apiCall(path)
      const msgs = d.messages || []
      setMessages(msgs)
      await markRead({ tab, selectedContact, selectedClass, messages: msgs })
      if (tab !== 'global') loadUnread()
      setError('')
    } catch(e) { setError(e.message) }
  }, [tab, selectedContact, selectedClass, loadUnread])

  useEffect(() => {
    loadMessages()
    const t = setInterval(loadMessages, 5000)
    return () => clearInterval(t)
  }, [loadMessages])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const sendMessage = async () => {
    const trimmed = body.trim()
    if (!trimmed || sending) return
    let path
    if (tab === 'global') {
      path = '/api/komunikasi/global/messages'
    } else if (tab === 'private') {
      path = `/api/komunikasi/private/${selectedContact.role}/${encodeURIComponent(selectedContact.id)}/messages`
    } else {
      path = `/api/komunikasi/forum/${encodeURIComponent(selectedClass)}/messages`
    }
    setSending(true); setError('')
    try {
      await apiCall(path, { method:'POST', body:{ body: trimmed } })
      setBody('')
      await loadMessages()
    } catch(e) { setError(e.message) }
    finally { setSending(false) }
  }

  const activeTitle = tab === 'global'
    ? 'Chat Global'
    : tab === 'forum'
      ? (selectedClass ? `Forum ${selectedClass}` : 'Pilih kelas')
      : (selectedContact?.name || 'Pilih kontak')

  const unreadCount = (contact) => {
    if (!contact) return 0
    const key = `${contact.role}:${contact.id}`
    return unread.perContact[key] || 0
  }
  const forumUnread = (kls) => unread.perForum[kls] || 0

  // ── Tab display config ─────────────────────────────────────────────────────
  const TAB_CONFIG = [
    { id: 'private', label: '💬 Guru' },
    { id: 'forum',   label: '🏫 Forum' },
    { id: 'global',  label: '🌐 Global' },
  ]

  // ── Render message bubbles (reused across all tabs) ────────────────────────
  const renderMessages = () => messages.map((m, i) => {
    const mine = m.sender_id === user?.id
    const stick = isSticker(m.body || m.content)
    const text = stick ? (m.body || m.content).replace(STICKER_PREFIX, '') : (m.body || m.content || '')
    const senderUser = {
      id: m.sender_id,
      role: m.sender_role || (tab === 'private' ? selectedContact?.role : 'siswa'),
      name: m.sender_name || m.name,
      photoUrl: m.sender_photo_url || null,
      equippedBingkai: m.sender_equipped_bingkai || null,
    }
    return (
      <div key={m.id || i} style={{ display:'flex', justifyContent: mine ? 'flex-end' : 'flex-start', gap:6, alignItems:'flex-end' }}>
        {!mine && (
          <UserAvatar
            user={senderUser}
            size={26}
            onClick={() => openProfile(senderUser)}
            title={`Lihat profil ${senderUser.name}`}
          />
        )}
        <div style={{ maxWidth:'65%', background: mine ? 'linear-gradient(135deg,#3c3489,#2a2470)' : C.card, border: mine ? 'none' : `0.5px solid ${C.border}`, borderRadius: mine ? '12px 12px 3px 12px' : '12px 12px 12px 3px', padding: stick ? '4px 8px' : '7px 11px' }}>
          {!mine && (
            <div
              onClick={() => openProfile(senderUser)}
              style={{ color: tab === 'global' ? C.teal : C.green, fontSize:8, fontWeight:700, marginBottom:2, cursor:'pointer' }}
            >
              {senderUser.name || '—'}
              {tab !== 'private' && senderUser.role === 'siswa' && (
                <span
                  onClick={e => { e.stopPropagation(); inviteDuel(senderUser) }}
                  style={{ marginLeft:5, background:'#2a1a3a', border:'0.5px solid #6f3cae', borderRadius:4, padding:'0px 4px', fontSize:7, color:'#c4a3f0', cursor:'pointer', fontWeight:600 }}
                >⚔️</span>
              )}
            </div>
          )}
          {stick ? (
            <div style={{ fontSize:26 }}>{text}</div>
          ) : (
            <div style={{ color:C.txt, fontSize:10, lineHeight:1.5 }}>{text}</div>
          )}
          <div style={{ color: mine ? '#8b8acd' : C.muted, fontSize:7.5, marginTop:3, textAlign:'right' }}>{formatTime(m.created_at || m.sentAt)}</div>
        </div>
      </div>
    )
  })

  // ── Chat input (shared) ────────────────────────────────────────────────────
  const renderInput = (disabled = false) => (
    <div style={{ padding:'7px 12px', borderTop:`0.5px solid #1e2644`, display:'flex', gap:7, alignItems:'center', flexShrink:0 }}>
      <input
        value={body}
        onChange={e => setBody(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
        placeholder="Ketik pesan..."
        disabled={disabled}
        style={{ flex:1, background:C.card, border:`0.5px solid ${C.border}`, borderRadius:20, padding:'8px 14px', color:C.txt, fontSize:10, outline:'none', fontFamily:'inherit', opacity: disabled ? 0.5 : 1 }}
      />
      <div onClick={(sending || disabled) ? null : sendMessage} style={{ width:34, height:34, borderRadius:'50%', background:`rgba(226,101,63,0.72)`, border:`1px solid rgba(226,101,63,0.5)`, backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, cursor: (sending || disabled) ? 'not-allowed' : 'pointer', opacity: (sending || disabled) ? 0.5 : 1, flexShrink:0 }}>➤</div>
    </div>
  )

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px 8px', borderBottom:`0.5px solid #1e2644`, flexShrink:0, background:'rgba(18,23,43,0.75)', backdropFilter:'blur(10px)' }}>
        <div style={{ width:30, height:30, borderRadius:8, background:'rgba(28,35,64,0.7)', border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer', flexShrink:0 }} onClick={goBack}>‹</div>
        <span style={{ color:C.txt, fontSize:15, fontWeight:700, flexShrink:0 }}>💬 Komunikasi</span>
        {/* Tab switch */}
        <div style={{ marginLeft:'auto', display:'flex', gap:5, flexWrap:'wrap', justifyContent:'flex-end' }}>
          {TAB_CONFIG.map(tc => (
            <div key={tc.id} onClick={() => { setTab(tc.id); setMessages([]) }} style={{ background: tc.id === tab ? (tc.id === 'global' ? 'rgba(8,80,65,0.8)' : 'rgba(60,52,137,0.8)') : 'rgba(28,35,64,0.7)', border: tc.id === tab ? 'none' : `0.5px solid rgba(49,58,92,0.6)`, borderRadius:7, padding:'4px 11px', color: tc.id === tab ? (tc.id === 'global' ? '#e1f5ee' : '#eeedfe') : C.sub, fontSize:9.5, fontWeight: tc.id === tab ? 600 : 400, cursor:'pointer', transition:'all 0.15s', backdropFilter:'blur(6px)' }}>
              {tc.label}
            </div>
          ))}
        </div>
      </div>

      {error && <div style={{ padding:'4px 16px', color:'#f0997b', fontSize:9 }}>{error}</div>}

      {/* ── GLOBAL TAB — full-width no sidebar ─────────────────────────────── */}
      {tab === 'global' && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', minHeight:0 }}>
          {/* Chat header */}
          <div style={{ padding:'8px 14px', borderBottom:`0.5px solid #1e2644`, display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#085041,#0d6e55)', display:'flex', alignItems:'center', justifyContent:'center', color:'#e1f5ee', fontSize:14 }}>🌐</div>
            <div>
              <div style={{ color:C.txt, fontSize:11, fontWeight:700 }}>Chat Global</div>
              <div style={{ color:C.teal, fontSize:8.5 }}>Semua pengguna TOMAT</div>
            </div>
          </div>
          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'10px 14px', display:'flex', flexDirection:'column', gap:7 }}>
            {messages.length === 0 && (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:10 }}>Belum ada pesan. Jadilah yang pertama! 🌐</div>
            )}
            {renderMessages()}
            <div ref={bottomRef} />
          </div>
          {renderInput()}
        </div>
      )}

      {/* ── PRIVATE / FORUM TABS — with sidebar ───────────────────────────── */}
      {tab !== 'global' && (
        <div style={{ flex:1, display:'flex', minHeight:0 }}>
          {/* Sidebar kontak/kelas */}
          <div style={{ width:'28%', borderRight:`0.5px solid #1e2644`, display:'flex', flexDirection:'column', overflowY:'auto' }}>
            <div style={{ color:C.sub, fontSize:8, fontWeight:700, letterSpacing:0.8, padding:'8px 12px 4px' }}>
              {tab === 'private' ? 'GURU' : 'KELAS'}
            </div>
            {loadingContacts && <div style={{ color:C.muted, fontSize:9.5, padding:12 }}>Memuat...</div>}

            {tab === 'private' && contacts.map((c, i) => {
              const uc = unreadCount(c)
              const active = selectedContact?.id === c.id && selectedContact?.role === c.role
              return (
                <div key={i} onClick={() => { setSelectedContact(c); setMessages([]) }} style={{ background: active ? C.card : 'transparent', borderBottom:`0.5px solid #1a2240`, padding:'9px 12px', display:'flex', alignItems:'center', gap:9, cursor:'pointer' }}>
                  <UserAvatar
                    user={{ ...c, photoUrl: c.photo_url, equippedBingkai: c.equipped_bingkai }}
                    size={36}
                    onClick={e => { e.stopPropagation(); openProfile({ ...c, photoUrl: c.photo_url, equippedBingkai: c.equipped_bingkai }) }}
                    title={`Lihat profil ${c.name}`}
                  />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:C.txt, fontSize:10.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name || c.username || '—'}</div>
                    <div style={{ color:C.muted, fontSize:8.5 }}>{c.role === 'guru' ? 'Guru' : 'Siswa'}</div>
                  </div>
                  {uc > 0 && <div style={{ background:'#6366f1', borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:8, fontWeight:700, flexShrink:0 }}>{uc}</div>}
                  {c.role === 'siswa' && (
                    <div onClick={e => { e.stopPropagation(); inviteDuel(c) }} style={{ background:'#2a1a3a', border:'0.5px solid #6f3cae', borderRadius:5, padding:'2px 6px', fontSize:7.5, color:'#c4a3f0', cursor:'pointer', fontWeight:600, flexShrink:0 }}>⚔️</div>
                  )}
                </div>
              )
            })}

            {tab === 'forum' && classes.map((kls, i) => {
              const uc = forumUnread(kls)
              const active = selectedClass === kls
              return (
                <div key={i} onClick={() => { setSelectedClass(kls); setMessages([]) }} style={{ background: active ? C.card : 'transparent', borderBottom:`0.5px solid #1a2240`, padding:'9px 12px', display:'flex', alignItems:'center', gap:9, cursor:'pointer' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#3c3489,#2a2470)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ color:'#fff', fontSize:13, fontWeight:700 }}>{(kls || '?')[0]}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:C.txt, fontSize:10.5, fontWeight:600 }}>{kls}</div>
                    <div style={{ color:C.muted, fontSize:8.5 }}>Forum Kelas</div>
                  </div>
                  {uc > 0 && <div style={{ background:'#6366f1', borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:8, fontWeight:700, flexShrink:0 }}>{uc}</div>}
                </div>
              )
            })}
          </div>

          {/* Area chat */}
          <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
            {(tab === 'private' && !selectedContact) || (tab === 'forum' && !selectedClass) ? (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:11 }}>Pilih {tab === 'private' ? 'kontak' : 'kelas'} di kiri</div>
            ) : (
              <>
                {/* Chat header */}
                <div style={{ padding:'8px 14px', borderBottom:`0.5px solid #1e2644`, display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background: tab === 'forum' ? 'linear-gradient(135deg,#3c3489,#2a2470)' : 'linear-gradient(135deg,#5dcaa5,#3aaa85)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700 }}>
                    {(activeTitle || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color:C.txt, fontSize:11, fontWeight:700 }}>{activeTitle}</div>
                    <div style={{ color: tab === 'forum' ? C.purple : C.green, fontSize:8.5 }}>{tab === 'forum' ? 'Forum Kelas' : 'Guru'}</div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex:1, overflowY:'auto', padding:'10px 14px', display:'flex', flexDirection:'column', gap:7 }}>
                  {renderMessages()}
                  <div ref={bottomRef} />
                </div>

                {renderInput()}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
