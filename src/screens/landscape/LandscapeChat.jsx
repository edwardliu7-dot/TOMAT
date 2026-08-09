import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../AuthContext'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', purple:'#cecbf6', orange:'#e2653f' }

export default function LandscapeChat({ goBack, initialTarget }) {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [classes, setClasses] = useState([])
  const [activeConvo, setActiveConvo] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/siswa/komunikasi/kontak', { credentials:'include' }).then(r => r.ok?r.json():[]).catch(()=>[]),
      fetch('/api/siswa/komunikasi/kelas', { credentials:'include' }).then(r => r.ok?r.json():[]).catch(()=>[]),
    ]).then(([c, k]) => {
      setContacts(Array.isArray(c)?c:[])
      setClasses(Array.isArray(k)?k:[])
      setLoading(false)
    })
  }, [])

  const allConvos = [
    ...contacts.map(c => ({ ...c, type:'private', displayName:c.name||c.username, sub:'Guru' })),
    ...classes.map(c => ({ ...c, type:'class', displayName:c.name||`Kelas ${c.id}`, sub:'Forum Kelas' })),
  ]

  useEffect(() => {
    if (!activeConvo) return
    const url = activeConvo.type === 'class'
      ? `/api/siswa/komunikasi/kelas/${activeConvo.id}/pesan`
      : `/api/siswa/komunikasi/pesan/${activeConvo.id}`
    fetch(url, { credentials:'include' }).then(r=>r.ok?r.json():[]).then(setMessages).catch(()=>setMessages([]))
  }, [activeConvo?.id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !activeConvo) return
    setSending(true)
    const url = activeConvo.type === 'class'
      ? `/api/siswa/komunikasi/kelas/${activeConvo.id}/pesan`
      : `/api/siswa/komunikasi/pesan/${activeConvo.id}`
    try {
      await fetch(url, { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ content:input }) })
      setMessages(m => [...m, { content:input, sender_id:user?.id, sender_name:user?.name, created_at:new Date().toISOString() }])
      setInput('')
    } finally { setSending(false) }
  }

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px 8px', borderBottom:'0.5px solid #1e2644', flexShrink:0 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
        <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>Komunikasi</span>
      </div>

      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        {/* Konversasi list */}
        <div style={{ width:'30%', borderRight:'0.5px solid #1e2644', display:'flex', flexDirection:'column', overflowY:'auto' }}>
          <div style={{ color:C.sub, fontSize:8, fontWeight:700, letterSpacing:0.8, padding:'8px 12px 4px' }}>PERCAKAPAN</div>
          {loading && <div style={{ color:C.muted, fontSize:10, padding:12 }}>Memuat...</div>}
          {allConvos.map((c,i) => (
            <div key={i} onClick={() => setActiveConvo(c)} style={{ background: activeConvo?.id===c.id?C.card:'transparent', borderBottom:`0.5px solid #1a2240`, padding:'9px 12px', display:'flex', alignItems:'center', gap:9, cursor:'pointer' }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background: c.type==='class'?'linear-gradient(135deg,#3c3489,#2a2470)':'linear-gradient(135deg,#5dcaa5,#3aaa85)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'#fff', fontSize:14, fontWeight:700 }}>{(c.displayName||'?')[0]}</span>
                </div>
                {c.online && <div style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background:C.green, border:'1.5px solid #12172b' }} />}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:C.txt, fontSize:10.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:120 }}>{c.displayName}</span>
                  {c.unread_count > 0 && <div style={{ background:C.orange, borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:7.5, fontWeight:700, flexShrink:0 }}>{c.unread_count}</div>}
                </div>
                <div style={{ color:C.muted, fontSize:8.5, marginTop:1 }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
          {!activeConvo ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontSize:11 }}>Pilih percakapan di kiri</div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding:'8px 14px', borderBottom:'0.5px solid #1e2644', display:'flex', alignItems:'center', gap:9 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#5dcaa5,#3aaa85)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:700 }}>
                  {(activeConvo.displayName||'?')[0]}
                </div>
                <div>
                  <div style={{ color:C.txt, fontSize:11, fontWeight:700 }}>{activeConvo.displayName}</div>
                  <div style={{ color:C.green, fontSize:8.5 }}>{activeConvo.sub}</div>
                </div>
              </div>
              {/* Messages */}
              <div style={{ flex:1, overflowY:'auto', padding:'10px 14px', display:'flex', flexDirection:'column', gap:7 }}>
                {messages.map((m,i) => {
                  const mine = m.sender_id === user?.id
                  return (
                    <div key={i} style={{ display:'flex', justifyContent: mine?'flex-end':'flex-start' }}>
                      <div style={{ maxWidth:'68%', background: mine?'linear-gradient(135deg,#3c3489,#2a2470)':C.card, border: mine?'none':`0.5px solid ${C.border}`, borderRadius: mine?'12px 12px 3px 12px':'12px 12px 12px 3px', padding:'7px 11px' }}>
                        {!mine && <div style={{ color:C.green, fontSize:8, fontWeight:700, marginBottom:2 }}>{m.sender_name||'—'}</div>}
                        <div style={{ color:C.txt, fontSize:10, lineHeight:1.5 }}>{m.content}</div>
                        <div style={{ color: mine?'#8b8acd':C.muted, fontSize:7.5, marginTop:3, textAlign:'right' }}>{m.created_at ? new Date(m.created_at).toLocaleTimeString('id',{hour:'2-digit',minute:'2-digit'}) : ''}</div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              {/* Input */}
              <div style={{ padding:'7px 12px', borderTop:'0.5px solid #1e2644', display:'flex', gap:7, alignItems:'center', flexShrink:0 }}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="Ketik pesan..." style={{ flex:1, background:C.card, border:`0.5px solid ${C.border}`, borderRadius:20, padding:'8px 14px', color:C.txt, fontSize:10, outline:'none' }} />
                <div onClick={sending?null:sendMessage} style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${C.orange},#c94f2d)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, cursor:'pointer', opacity:sending?0.5:1 }}>➤</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
