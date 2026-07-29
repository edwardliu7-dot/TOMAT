import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  PlayerHeader, TopBar, PublicProfileModal, UserAvatar, fetchPublicProfile, normalizeProfileTarget,
} from '../components/shared'
import { useAuth } from '../AuthContext'

async function apiCall(path, options = {}) {
  const res = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.')
  return data
}

async function markConversationRead({ tab, selectedContact, selectedClass, messages }) {
  if (messages.length === 0) return
  const body = tab === 'private'
    ? { type: 'private', otherRole: selectedContact.role, otherId: selectedContact.id }
    : { type: 'forum', kelas: selectedClass }
  await apiCall('/api/komunikasi/read', { method: 'POST', body })
}

function formatTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = e => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

function UnreadBadge({ count }) {
  if (!count) return null
  return (
    <span style={{ minWidth: 18, height: 18, padding: '0 4px', borderRadius: 99, background: '#6366F1', color: '#fff', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #0E1E35' }}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

function MessageStatus({ message }) {
  if (message.sender_role === undefined) return null
  const read = Boolean(message.read_at)
  const delivered = Boolean(message.delivered_at)
  const label = read ? 'Dibaca' : delivered ? 'Tersampaikan' : 'Terkirim'
  return (
    <span title={label} aria-label={label} style={{ color: read ? '#67E8F9' : 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: 900, letterSpacing: -2, marginLeft: 4 }}>
      {read || delivered ? '✓✓' : '✓'}
    </span>
  )
}

function EmptyMessages({ forum }) {
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748B' }}>
      <div style={{ fontSize: 42, marginBottom: 10 }}>{forum ? '💬' : '✉️'}</div>
      <div style={{ color: '#CBD5E1', fontSize: 14, fontWeight: 700 }}>{forum ? 'Belum ada diskusi' : 'Belum ada pesan'}</div>
      <div style={{ fontSize: 12, marginTop: 5, lineHeight: 1.5 }}>Mulai percakapan dengan mengirim pesan pertama.</div>
    </div>
  )
}

function MessageList({ messages, user, forum, onProfileClick }) {
  if (messages.length === 0) return <EmptyMessages forum={forum} />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {messages.map(message => {
        const own = message.sender_id === user.id && message.sender_role === user.role
        return (
            <div key={message.id} style={{ display: 'flex', justifyContent: own ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '82%', background: own ? 'linear-gradient(135deg, #6366F1, #7C3AED)' : '#0E1E35', border: `1px solid ${own ? 'rgba(165,180,252,0.35)' : 'rgba(99,102,241,0.12)'}`, borderRadius: own ? '15px 15px 4px 15px' : '15px 15px 15px 4px', padding: '9px 12px' }}>
              {forum && !own && (
                <button onClick={() => onProfileClick?.({ id: message.sender_id, role: message.sender_role, name: message.sender_name })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#fff', marginBottom: 5 }} title="Lihat profil">
                  <UserAvatar user={{ name: message.sender_name, role: message.sender_role, photoUrl: message.sender_photo_url, equippedBingkai: message.sender_equipped_bingkai }} size={24} />
                  <span style={{ color: message.sender_role === 'guru' ? '#C4B5FD' : '#67E8F9', fontSize: 10, fontWeight: 800 }}>
                    {message.sender_name || 'Pengguna'} · {message.sender_role === 'guru' ? 'Guru' : 'Siswa'}
                  </span>
                </button>
              )}
              <div style={{ color: '#fff', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{message.body}</div>
              <div style={{ color: own ? 'rgba(255,255,255,0.65)' : '#64748B', fontSize: 9, marginTop: 5, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {formatTime(message.created_at)}
                {own && !forum && <MessageStatus message={message} />}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ContactList({ contacts, selected, onSelect, onProfileClick, loading, unreadCounts }) {
  if (loading) return <div style={{ color: '#64748B', fontSize: 12, padding: 12 }}>Memuat kontak…</div>
  if (contacts.length === 0) return <div style={{ color: '#64748B', fontSize: 12, lineHeight: 1.5, padding: 12 }}>Belum ada kontak yang dapat dihubungi.</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 3, scrollbarWidth: 'thin' }}>
      {contacts.map(contact => {
        const active = selected?.id === contact.id && selected?.role === contact.role
        const unread = unreadCounts?.[`${contact.role}:${contact.id}`] || 0
        return (
            <div key={`${contact.role}-${contact.id}`} onClick={() => onSelect(contact)} role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onSelect(contact) }} title={contact.name} style={{ border: `1px solid ${active ? 'rgba(129,140,248,0.45)' : unread ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`, background: active ? 'rgba(99,102,241,0.12)' : unread ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.035)', borderRadius: 12, padding: '9px 8px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <button onClick={e => { e.stopPropagation(); onProfileClick?.(contact) }} aria-label={`Lihat profil ${contact.name}`} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
              <UserAvatar user={contact} size={31} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
                {contact.name}{contact.is_test_account && <span style={{ color: '#FBBF24', fontSize: 9, marginLeft: 5 }}>DEMO</span>}
              </div>
              <div style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>{contact.kelas || 'Guru'}</div>
            </div>
            <UnreadBadge count={unread} />
          </div>
        )
      })}
    </div>
  )
}

export default function CommunicationScreen({ goBack, embedded = false, initialTarget = null }) {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()
  const [tab, setTab] = useState('private')
  const [contacts, setContacts] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [selectedClass, setSelectedClass] = useState('')
  const [messages, setMessages] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [viewedProfile, setViewedProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  // On desktop, sidebar is always open; on mobile it toggles
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [unreadDetail, setUnreadDetail] = useState({ perContact: {}, perForum: {} })
  const messageScrollRef = useRef(null)
  const shouldScrollToBottomRef = useRef(true)
  const previousLatestMessageIdRef = useRef(null)
  const initialTargetAppliedRef = useRef(null)

  const isNearBottom = useCallback(() => {
    const element = messageScrollRef.current
    if (!element) return true
    return element.scrollHeight - element.scrollTop - element.clientHeight < 90
  }, [])

  const scrollToBottom = useCallback((behavior = 'auto') => {
    const element = messageScrollRef.current
    if (!element) return
    element.scrollTo({ top: element.scrollHeight, behavior })
  }, [])

  const loadUnreadDetail = useCallback(async () => {
    try {
      const data = await apiCall('/api/komunikasi/unread-detail')
      setUnreadDetail({ perContact: data.perContact || {}, perForum: data.perForum || {} })
    } catch { /* non-critical */ }
  }, [])

  useEffect(() => {
    loadUnreadDetail()
    const timer = window.setInterval(loadUnreadDetail, 6000)
    return () => window.clearInterval(timer)
  }, [loadUnreadDetail])

  const loadOptions = useCallback(async () => {
    setLoadingContacts(true)
    try {
      const [{ contacts: loadedContacts }, { classes: loadedClasses }] = await Promise.all([
        apiCall('/api/komunikasi/contacts'),
        apiCall('/api/komunikasi/classes'),
      ])
      setContacts(loadedContacts)
      setClasses(loadedClasses)
      setSelectedContact(current => current || loadedContacts[0] || null)
      setSelectedClass(current => current || loadedClasses[0] || '')
    } catch (err) { setError(err.message) }
    finally { setLoadingContacts(false) }
  }, [])

  useEffect(() => { loadOptions() }, [loadOptions])

  useEffect(() => {
    if (initialTargetAppliedRef.current === initialTarget || !initialTarget || loadingContacts) return
    const { conversationType, senderId, senderRole, kelas } = initialTarget
    if (conversationType === 'private' && senderId && senderRole) {
      const contact = contacts.find(c => c.id === senderId && c.role === senderRole)
      if (contact) {
        initialTargetAppliedRef.current = initialTarget
        setTab('private'); setSelectedContact(contact); setMessages([])
        previousLatestMessageIdRef.current = null; shouldScrollToBottomRef.current = true; setError('')
        if (isMobile) setSidebarOpen(false)
      }
    } else if (conversationType === 'forum' && kelas) {
      initialTargetAppliedRef.current = initialTarget
      setTab('forum'); setSelectedClass(kelas); setMessages([])
      previousLatestMessageIdRef.current = null; shouldScrollToBottomRef.current = true; setError('')
      if (isMobile) setSidebarOpen(false)
    }
  }, [initialTarget, contacts, classes, loadingContacts, isMobile])

  const openProfile = useCallback(async target => {
    let normalizedTarget
    try { normalizedTarget = normalizeProfileTarget(target) } catch { return }
    setViewedProfile(null); setProfileError(''); setProfileLoading(true)
    try {
      setViewedProfile(await fetchPublicProfile(normalizedTarget))
    } catch (err) { setProfileError(err.message) }
    finally { setProfileLoading(false) }
  }, [])

  const closeProfile = () => { setViewedProfile(null); setProfileError(''); setProfileLoading(false) }

  const loadMessages = useCallback(async () => {
    const path = tab === 'private'
      ? (selectedContact ? `/api/komunikasi/private/${selectedContact.role}/${encodeURIComponent(selectedContact.id)}/messages` : null)
      : (selectedClass ? `/api/komunikasi/forum/${encodeURIComponent(selectedClass)}/messages` : null)
    if (!path) { setMessages([]); previousLatestMessageIdRef.current = null; return }
    const keepAtBottom = isNearBottom()
    setLoadingMessages(true)
    try {
      const data = await apiCall(path)
      const nextMessages = data.messages || []
      const latestMessageId = nextMessages[nextMessages.length - 1]?.id ?? null
      const latestChanged = latestMessageId !== previousLatestMessageIdRef.current
      shouldScrollToBottomRef.current = shouldScrollToBottomRef.current || (keepAtBottom && latestChanged)
      previousLatestMessageIdRef.current = latestMessageId
      setMessages(nextMessages)
      await markConversationRead({ tab, selectedContact, selectedClass, messages: nextMessages }).catch(() => {})
      loadUnreadDetail()
      setError('')
    } catch (err) { setError(err.message) }
    finally { setLoadingMessages(false) }
  }, [tab, selectedContact, selectedClass, loadUnreadDetail])

  useEffect(() => {
    loadMessages()
    const timer = window.setInterval(loadMessages, 5000)
    return () => window.clearInterval(timer)
  }, [loadMessages])

  useEffect(() => {
    if (loadingMessages || !shouldScrollToBottomRef.current) return
    const frame = window.requestAnimationFrame(() => { scrollToBottom(); shouldScrollToBottomRef.current = false })
    return () => window.cancelAnimationFrame(frame)
  }, [messages, loadingMessages, scrollToBottom])

  const activeTitle = useMemo(() => {
    if (tab === 'forum') return selectedClass ? `Forum ${selectedClass}` : 'Pilih kelas'
    return selectedContact?.name || 'Pilih kontak'
  }, [tab, selectedClass, selectedContact])

  const sendMessage = async e => {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed || sending) return
    const path = tab === 'private'
      ? `/api/komunikasi/private/${selectedContact.role}/${encodeURIComponent(selectedContact.id)}/messages`
      : `/api/komunikasi/forum/${encodeURIComponent(selectedClass)}/messages`
    setSending(true); setError('')
    try {
      await apiCall(path, { method: 'POST', body: { body: trimmed } })
      setBody(''); shouldScrollToBottomRef.current = true; await loadMessages()
    } catch (err) { setError(err.message) }
    finally { setSending(false) }
  }

  const selectTab = nextTab => {
    setTab(nextTab); setMessages([]); previousLatestMessageIdRef.current = null
    shouldScrollToBottomRef.current = true; setError('')
    if (isMobile) setSidebarOpen(true)
  }

  const selectContact = contact => {
    setSelectedContact(contact); setMessages([]); previousLatestMessageIdRef.current = null
    shouldScrollToBottomRef.current = true; setError('')
    if (isMobile) setSidebarOpen(false)
  }

  const selectClass = kelas => {
    setSelectedClass(kelas); setMessages([]); previousLatestMessageIdRef.current = null
    shouldScrollToBottomRef.current = true; setError('')
    if (isMobile) setSidebarOpen(false)
  }

  // Desktop dimensions: sidebar 280px fixed, chat takes remaining space
  // Height: fills viewport minus header/tabs on desktop; compact on mobile
  const chatHeight = isDesktop
    ? (embedded ? 'calc(100vh - 260px)' : 'calc(100vh - 180px)')
    : (embedded ? 'min(380px, calc(100vh - 300px))' : 'min(430px, calc(100vh - 230px))')
  const sidebarWidth = isDesktop ? '280px' : 'minmax(145px, 0.75fr)'
  const gridCols = isDesktop
    ? (sidebarOpen || isDesktop ? `${sidebarWidth} minmax(0, 1fr)` : '0 1fr')
    : (sidebarOpen ? `${sidebarWidth} minmax(0, 1.6fr)` : '0 1fr')

  const content = (
    <div style={{ padding: embedded ? 0 : '0 var(--page-pad) 32px', maxWidth: embedded ? undefined : 'var(--content-max)', margin: embedded ? undefined : '0 auto' }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, background: '#0A1628', border: '1px solid rgba(99,102,241,0.08)', borderRadius: 14, padding: 4 }}>
        {[{ id: 'private', label: '✉️ Chat Pribadi' }, { id: 'forum', label: '💬 Forum Kelas' }].map(item => (
          <button key={item.id} onClick={() => selectTab(item.id)} style={{ flex: 1, border: tab === item.id ? '1px solid rgba(99,102,241,0.12)' : '1px solid transparent', borderRadius: 10, padding: '10px 8px', background: tab === item.id ? '#0E1E35' : 'transparent', color: tab === item.id ? '#fff' : '#58718A', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>{item.label}</button>
        ))}
      </div>

      {/* Two-panel grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap: sidebarOpen || isDesktop ? (isDesktop ? 12 : 10) : 0,
        height: chatHeight,
        minHeight: isDesktop ? 500 : 360,
        transition: 'grid-template-columns 0.2s ease',
      }}>
        {/* Sidebar — always open on desktop */}
        <div style={{
           background: '#0A1628',
          border: (sidebarOpen || isDesktop) ? '1px solid rgba(255,255,255,0.08)' : 'none',
          borderRadius: 16, padding: (sidebarOpen || isDesktop) ? 10 : 0,
          minWidth: 0, minHeight: 0,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ color: '#64748B', fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', padding: '3px 2px 9px' }}>
            {tab === 'private' ? (user.role === 'guru' ? 'Daftar Siswa' : 'Guru Kelas') : 'Kelas Saya'}
          </div>
          {tab === 'private' ? (
            <ContactList contacts={contacts} selected={selectedContact} onSelect={selectContact} onProfileClick={openProfile} loading={loadingContacts} unreadCounts={unreadDetail.perContact} />
          ) : (
            classes.length === 0
              ? <div style={{ color: '#64748B', fontSize: 12, padding: 12 }}>Belum ada kelas yang tersedia.</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 3, scrollbarWidth: 'thin' }}>
                  {classes.map(kelas => {
                  const forumUnread = unreadDetail.perForum?.[kelas] || 0
                  return (
                   <button key={kelas} onClick={() => selectClass(kelas)} style={{ border: `1px solid ${selectedClass === kelas ? 'rgba(129,140,248,0.45)' : forumUnread ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`, background: selectedClass === kelas ? 'rgba(99,102,241,0.12)' : forumUnread ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.035)', borderRadius: 12, padding: '11px 10px', color: selectedClass === kelas ? '#C4B5FD' : '#CBD5E1', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span>🏫 {kelas}</span>
                      <UnreadBadge count={forumUnread} />
                    </button>
                  )
                })}
              </div>
          )}
        </div>

        {/* Chat panel */}
         <div style={{ background: 'rgba(7,19,33,.82)', border: '1px solid rgba(99,102,241,0.10)', borderRadius: 16, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Mobile-only: back to list */}
            {isMobile && !sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} title="Kembali ke daftar" aria-label="Kembali ke daftar" style={{ border: 'none', background: 'rgba(255,255,255,0.07)', borderRadius: 8, color: '#94A3B8', cursor: 'pointer', fontSize: 13, padding: '4px 8px', fontFamily: 'inherit', fontWeight: 700, flexShrink: 0 }}>← Daftar</button>
            )}
            <button onClick={() => tab === 'private' && openProfile(selectedContact)} disabled={tab !== 'private' || !selectedContact} aria-label="Lihat profil" style={{ border: 'none', background: 'none', padding: 0, cursor: tab === 'private' ? 'pointer' : 'default', flexShrink: 0 }}>
              {tab === 'forum' ? <div style={{ fontSize: 19 }}>💬</div> : <UserAvatar user={selectedContact} size={31} />}
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeTitle}</div>
              <div style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>{tab === 'forum' ? 'Guru dan siswa dapat berdiskusi bersama' : 'Percakapan pribadi'}</div>
            </div>
          </div>
          <div ref={messageScrollRef} style={{ flex: 1, minHeight: 0, padding: 12, overflowY: 'auto' }}>
            {loadingMessages && messages.length === 0
              ? <div style={{ color: '#64748B', fontSize: 12, textAlign: 'center', padding: 30 }}>Memuat pesan…</div>
              : <MessageList messages={messages} user={user} forum={tab === 'forum'} onProfileClick={openProfile} />}
          </div>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
             <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 2000))} placeholder={tab === 'forum' ? 'Tulis pesan untuk kelas…' : 'Tulis pesan…'} rows={isDesktop ? 2 : 2} disabled={!activeTitle || activeTitle === 'Pilih kontak' || activeTitle === 'Pilih kelas'} style={{ flex: 1, resize: 'none', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 11, background: '#0E1E35', color: '#fff', padding: '9px 10px', fontFamily: 'inherit', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
             <button type="submit" disabled={sending || !body.trim() || (!selectedContact && tab === 'private') || (!selectedClass && tab === 'forum')} style={{ width: 62, border: 'none', borderRadius: 11, background: sending ? '#374151' : 'linear-gradient(135deg,#6366F1,#7C3AED)', color: '#fff', fontSize: 11, fontWeight: 800, cursor: sending ? 'default' : 'pointer', fontFamily: 'inherit', boxShadow: sending ? 'none' : '0 4px 18px rgba(99,102,241,.28)' }}>
              {sending ? '…' : 'Kirim'}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 10, color: '#FCA5A5', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 11, padding: '9px 12px', fontSize: 12 }}>{error}</div>
      )}
      <PublicProfileModal profile={viewedProfile} loading={profileLoading} error={profileError} onClose={closeProfile} />
    </div>
  )

  if (embedded) return content
  return (
    <div style={{ minHeight: '100vh', background: '#071321', backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(79,70,229,.12), transparent 36%), radial-gradient(circle at 100% 50%, rgba(124,58,237,.06), transparent 34%)' }}>
      <PlayerHeader />
      <TopBar title="Chat & Forum 💬" onBack={goBack} accentColor="#818CF8" />
      {content}
    </div>
  )
}
