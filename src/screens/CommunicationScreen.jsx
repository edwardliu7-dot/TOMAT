import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { PlayerHeader, TopBar } from '../components/shared'
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
    ? {
      type: 'private',
      otherRole: selectedContact.role,
      otherId: selectedContact.id,
    }
    : { type: 'forum', kelas: selectedClass }
  await apiCall('/api/komunikasi/read', { method: 'POST', body })
}

function formatTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function EmptyMessages({ forum }) {
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748B' }}>
      <div style={{ fontSize: 42, marginBottom: 10 }}>{forum ? '💬' : '✉️'}</div>
      <div style={{ color: '#CBD5E1', fontSize: 14, fontWeight: 700 }}>
        {forum ? 'Belum ada diskusi' : 'Belum ada pesan'}
      </div>
      <div style={{ fontSize: 12, marginTop: 5, lineHeight: 1.5 }}>
        Mulai percakapan dengan mengirim pesan pertama.
      </div>
    </div>
  )
}

function MessageList({ messages, user, forum }) {
  if (messages.length === 0) return <EmptyMessages forum={forum} />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {messages.map(message => {
        const own = message.sender_id === user.id && message.sender_role === user.role
        return (
          <div key={message.id} style={{
            display: 'flex', justifyContent: own ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '82%', background: own
                ? 'linear-gradient(135deg, #0E7490, #2563EB)'
                : '#1E293B',
              border: `1px solid ${own ? 'rgba(103,232,249,0.35)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: own ? '15px 15px 4px 15px' : '15px 15px 15px 4px',
              padding: '9px 12px',
            }}>
              {forum && !own && (
                <div style={{
                  color: message.sender_role === 'guru' ? '#C4B5FD' : '#67E8F9',
                  fontSize: 10, fontWeight: 800, marginBottom: 4,
                }}>
                  {message.sender_name || 'Pengguna'} · {message.sender_role === 'guru' ? 'Guru' : 'Siswa'}
                </div>
              )}
              <div style={{ color: '#fff', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {message.body}
              </div>
              <div style={{ color: own ? 'rgba(255,255,255,0.65)' : '#64748B', fontSize: 9, marginTop: 5, textAlign: 'right' }}>
                {formatTime(message.created_at)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ContactList({ contacts, selected, onSelect, loading }) {
  if (loading) return <div style={{ color: '#64748B', fontSize: 12, padding: 12 }}>Memuat kontak…</div>
  if (contacts.length === 0) {
    return <div style={{ color: '#64748B', fontSize: 12, lineHeight: 1.5, padding: 12 }}>Belum ada kontak yang dapat dihubungi.</div>
  }
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 3,
      scrollbarWidth: 'thin',
    }}>
      {contacts.map(contact => {
        const active = selected?.id === contact.id && selected?.role === contact.role
        return (
          <button key={`${contact.role}-${contact.id}`} onClick={() => onSelect(contact)} style={{
            border: `1px solid ${active ? 'rgba(103,232,249,0.45)' : 'rgba(255,255,255,0.07)'}`,
            background: active ? 'rgba(103,232,249,0.12)' : 'rgba(255,255,255,0.035)',
            borderRadius: 12, padding: '10px 11px', color: '#fff', cursor: 'pointer',
            textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 9,
          }}>
            <div style={{
              width: 31, height: 31, borderRadius: 10, background: contact.role === 'guru'
                ? 'rgba(167,139,250,0.18)' : 'rgba(103,232,249,0.14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>{contact.role === 'guru' ? '🎓' : '🧑‍🎓'}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.name}</div>
              <div style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>{contact.kelas || 'Guru'}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default function CommunicationScreen({ goBack, embedded = false }) {
  const { user } = useAuth()
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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingContacts(false)
    }
  }, [])

  useEffect(() => { loadOptions() }, [loadOptions])

  const loadMessages = useCallback(async () => {
    const path = tab === 'private'
      ? (selectedContact
        ? `/api/komunikasi/private/${selectedContact.role}/${encodeURIComponent(selectedContact.id)}/messages`
        : null)
      : (selectedClass ? `/api/komunikasi/forum/${encodeURIComponent(selectedClass)}/messages` : null)
    if (!path) {
      setMessages([])
      return
    }
    setLoadingMessages(true)
    try {
      const data = await apiCall(path)
      setMessages(data.messages)
      markConversationRead({ tab, selectedContact, selectedClass, messages: data.messages }).catch(() => {})
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMessages(false)
    }
  }, [tab, selectedContact, selectedClass])

  useEffect(() => {
    loadMessages()
    const timer = window.setInterval(loadMessages, 5000)
    return () => window.clearInterval(timer)
  }, [loadMessages])

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
    setSending(true)
    setError('')
    try {
      await apiCall(path, { method: 'POST', body: { body: trimmed } })
      setBody('')
      await loadMessages()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const selectTab = nextTab => {
    setTab(nextTab)
    setMessages([])
    setError('')
  }

  const content = (
    <div style={{ padding: embedded ? 0 : '0 16px 32px' }}>
      <div style={{
        display: 'flex', gap: 8, marginBottom: 12,
        background: 'rgba(255,255,255,0.035)', borderRadius: 14, padding: 4,
      }}>
        {[
          { id: 'private', label: '✉️ Chat Pribadi' },
          { id: 'forum', label: '💬 Forum Kelas' },
        ].map(item => (
          <button key={item.id} onClick={() => selectTab(item.id)} style={{
            flex: 1, border: 'none', borderRadius: 10, padding: '10px 8px',
            background: tab === item.id ? 'rgba(103,232,249,0.16)' : 'transparent',
            color: tab === item.id ? '#67E8F9' : '#64748B',
            fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
          }}>{item.label}</button>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(145px, 0.75fr) minmax(0, 1.6fr)',
        gap: 10, height: 'min(430px, calc(100vh - 230px))', minHeight: 360,
      }}>
        <div style={{
          background: '#111827', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: 10, minWidth: 0, minHeight: 0,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ color: '#64748B', fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', padding: '3px 2px 9px' }}>
            {tab === 'private' ? (user.role === 'guru' ? 'Daftar Siswa' : 'Guru Kelas') : 'Kelas Saya'}
          </div>
          {tab === 'private' ? (
            <ContactList contacts={contacts} selected={selectedContact} onSelect={contact => { setSelectedContact(contact); setError('') }} loading={loadingContacts} />
          ) : (
            classes.length === 0
              ? <div style={{ color: '#64748B', fontSize: 12, padding: 12 }}>Belum ada kelas yang tersedia.</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 3, scrollbarWidth: 'thin' }}>
                {classes.map(kelas => (
                  <button key={kelas} onClick={() => { setSelectedClass(kelas); setError('') }} style={{
                    border: `1px solid ${selectedClass === kelas ? 'rgba(103,232,249,0.45)' : 'rgba(255,255,255,0.07)'}`,
                    background: selectedClass === kelas ? 'rgba(103,232,249,0.12)' : 'rgba(255,255,255,0.035)',
                    borderRadius: 12, padding: '11px 10px', color: selectedClass === kelas ? '#67E8F9' : '#CBD5E1',
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 11, fontWeight: 800,
                  }}>🏫 {kelas}</button>
                ))}
              </div>
          )}
        </div>

        <div style={{
          background: '#111827', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ fontSize: 19 }}>{tab === 'forum' ? '💬' : selectedContact?.role === 'guru' ? '🎓' : '🧑‍🎓'}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeTitle}</div>
              <div style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>{tab === 'forum' ? 'Guru dan siswa dapat berdiskusi bersama' : 'Percakapan pribadi'}</div>
            </div>
          </div>
          <div style={{ flex: 1, padding: 12, overflowY: 'auto', minHeight: 300, maxHeight: 430 }}>
            {loadingMessages
              ? <div style={{ color: '#64748B', fontSize: 12, textAlign: 'center', padding: 30 }}>Memuat pesan…</div>
              : <MessageList messages={messages} user={user} forum={tab === 'forum'} />}
          </div>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <textarea
              value={body} onChange={e => setBody(e.target.value.slice(0, 2000))}
              placeholder={tab === 'forum' ? 'Tulis pesan untuk kelas…' : 'Tulis pesan…'}
              rows={2} disabled={!activeTitle || activeTitle === 'Pilih kontak' || activeTitle === 'Pilih kelas'}
              style={{
                flex: 1, resize: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11,
                background: '#0D1117', color: '#fff', padding: '9px 10px', fontFamily: 'inherit',
                fontSize: 12, outline: 'none', boxSizing: 'border-box',
              }}
            />
            <button type="submit" disabled={sending || !body.trim() || !selectedContact && tab === 'private' || !selectedClass && tab === 'forum'} style={{
              width: 62, border: 'none', borderRadius: 11, background: sending ? '#374151' : 'linear-gradient(135deg,#06B6D4,#2563EB)',
              color: '#fff', fontSize: 11, fontWeight: 800, cursor: sending ? 'default' : 'pointer', fontFamily: 'inherit',
            }}>{sending ? '…' : 'Kirim'}</button>
          </form>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 10, color: '#FCA5A5', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 11, padding: '9px 12px', fontSize: 12 }}>
          {error}
        </div>
      )}
    </div>
  )

  if (embedded) return content
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0A2647 0%, #0d1f3c 100%)' }}>
      <PlayerHeader />
      <TopBar title="💬 Komunikasi" onBack={goBack} accentColor="#67E8F9" />
      {content}
    </div>
  )
}