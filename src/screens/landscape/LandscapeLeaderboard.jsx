import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../AuthContext'
import { UserAvatar } from '../../components/shared'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', red:'#f0997b', purple:'#cecbf6' }

async function apiCall(path) {
  const r = await fetch(path, { credentials:'include' })
  return r.json().catch(()=>({}))
}

function gradeFromKelas(kelas='') {
  if (!kelas) return null
  if (kelas.startsWith('IX')) return 9
  if (kelas.startsWith('VIII')) return 8
  if (kelas.startsWith('VII')) return 7
  return null
}

const MEDALS    = { 1:'🥇', 2:'🥈', 3:'🥉' }
const POD_COLOR = { 1:'#fac775', 2:'#8b9ab5', 3:'#f0997b' }

function openProfile(s) {
  if (!s?.id) return
  window.dispatchEvent(new CustomEvent('tomat:visit-profile', {
    detail: { id:s.id, role:'siswa', name:s.name,
      photoUrl: s.photoUrl ?? s.photo_url ?? null,
      equippedBingkai: s.equippedBingkai ?? s.equipped_bingkai ?? null,
      kelas: s.kelas ?? null }
  }))
}

function inviteDuel(s) {
  if (!s?.id) return
  window.dispatchEvent(new CustomEvent('tomat:invite-duel', {
    detail: { id:s.id, role:'siswa', name:s.name }
  }))
}

export default function LandscapeLeaderboard({ goBack }) {
  const { user } = useAuth()
  const myGrade = gradeFromKelas(user?.kelas)

  const gradeTabs = useMemo(() => [7,8,9].map(g => ({
    id: g === myGrade ? 'myclass' : String(g),
    label: g === myGrade ? '🏫 Kelasku' : `Kelas ${g}`,
  })), [myGrade])

  const [activeTab,  setActiveTab]  = useState('myclass')
  const [myClass,    setMyClass]    = useState(null)
  const [gradeCache, setGradeCache] = useState({})
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    apiCall('/api/siswa/papan-peringkat')
      .then(setMyClass).catch(e => setError(e.message))
  }, [])

  useEffect(() => {
    if (activeTab === 'myclass' || gradeCache[activeTab]) return
    setLoading(true); setError('')
    apiCall(`/api/siswa/papan-peringkat/kelas/${activeTab}`)
      .then(d => setGradeCache(p => ({ ...p, [activeTab]: d })))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [activeTab, gradeCache])

  const data        = activeTab === 'myclass' ? myClass : gradeCache[activeTab]
  const leaderboard = data?.leaderboard || []
  const isLoading   = (activeTab === 'myclass' ? !myClass : loading) && !error

  const top3  = leaderboard.filter(s => s.rank <= 3).sort((a,b) => a.rank-b.rank)
  const rest  = leaderboard.filter(s => s.rank > 3)
  const byRnk = Object.fromEntries(top3.map(s=>[s.rank,s]))
  // podium order: 2, 1, 3 (classic layout)
  const podium = [byRnk[2], byRnk[1], byRnk[3]].filter(Boolean)
  const isMe   = s => String(s.id) === String(user?.id)

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* ── Header ───────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:`0.5px solid #1e2644`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div onClick={goBack} style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>🏆 Papan Peringkat</span>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          {gradeTabs.map(t => (
            <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ background: t.id===activeTab?'#3c3489':C.card, border: t.id===activeTab?'none':`0.5px solid ${C.border}`, borderRadius:7, padding:'4px 12px', color: t.id===activeTab?'#eeedfe':C.sub, fontSize:9.5, fontWeight: t.id===activeTab?600:400, cursor:'pointer' }}>{t.label}</div>
          ))}
        </div>
      </div>

      {error && <div style={{ padding:'4px 16px', color:'#f0997b', fontSize:9 }}>{error}</div>}

      {/* ── Scrollable body ───────────────────────────────── */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 16px 20px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* ── Podium ─── */}
        {isLoading ? (
          <div style={{ textAlign:'center', color:C.muted, fontSize:11, padding:'30px 0' }}>Memuat…</div>
        ) : top3.length > 0 && (
          <div>
            <div style={{ color:C.sub, fontSize:8, fontWeight:700, letterSpacing:0.8, marginBottom:10 }}>
              {data?.kelas ? `Kelas ${data.kelas} —` : ''} TOP 3
            </div>
            {/* ── Podium row ── */}
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:10 }}>
              {podium.map(s => {
                const col = POD_COLOR[s.rank] || C.sub
                const isFirst = s.rank === 1
                const me = isMe(s)
                return (
                  <div key={s.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, flex: isFirst ? '0 0 120px' : '0 0 96px' }}>
                    {isFirst && <div style={{ fontSize:18, marginBottom:-4 }}>👑</div>}
                    {/* Avatar */}
                    <div style={{ border:`2.5px solid ${col}`, borderRadius:'50%', padding:2, cursor: me?'default':'pointer' }}
                         onClick={() => !me && openProfile(s)} title={me?'Kamu':`Profil ${s.name}`}>
                      <UserAvatar
                        user={{ ...s, role:'siswa', photoUrl: s.photoUrl ?? s.photo_url, equippedBingkai: s.equippedBingkai ?? s.equipped_bingkai }}
                        size={isFirst ? 52 : 40}
                      />
                    </div>
                    {/* Name */}
                    <div style={{ color: me?C.purple:C.txt, fontSize: isFirst?10:9, fontWeight:700, textAlign:'center', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {s.name || '—'}
                    </div>
                    {/* Duel button */}
                    {!me && (
                      <div onClick={() => inviteDuel(s)} style={{ background:'rgba(42,26,58,0.85)', border:'0.5px solid #6f3cae', borderRadius:5, padding:'2px 9px', fontSize:7.5, color:'#c4a3f0', cursor:'pointer', fontWeight:600 }}>⚔️ Duel</div>
                    )}
                    {/* Coins */}
                    <div style={{ color:C.gold, fontSize:8.5 }}>🪙 {(s.coins||s.total_coins||0).toLocaleString('id-ID')}</div>
                    {/* Pedestal */}
                    <div style={{ width:'100%', background:`linear-gradient(180deg,${col},${col}aa)`, borderRadius:'8px 8px 0 0', height: isFirst?80:60, display:'flex', alignItems:'center', justifyContent:'center', fontSize: isFirst?22:18, fontWeight:900, color:'#12172b', boxShadow:`0 -2px 10px ${col}44` }}>
                      {MEDALS[s.rank]}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Scoring hint ── */}
            <div style={{ marginTop:10, padding:'7px 12px', background:`rgba(28,35,64,0.6)`, border:`0.5px dashed ${C.border}`, borderRadius:9, fontSize:8, color:C.muted, textAlign:'center' }}>
              📊 Skor = Tugas 40% + Level 20% + EXP 10% + Hafalan 30%
            </div>
          </div>
        )}

        {/* ── Daftar Peringkat ─── */}
        {!isLoading && rest.length > 0 && (
          <div>
            <div style={{ color:C.sub, fontSize:8, fontWeight:700, letterSpacing:0.8, marginBottom:8 }}>PERINGKAT SELANJUTNYA</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {rest.map((s, i) => {
                const me = isMe(s)
                return (
                  <div key={s.id||i} style={{ background: me?'rgba(60,52,137,0.22)':C.card, border: me?`0.5px solid #3c3489`:`0.5px solid ${C.border}`, borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ color: s.rank<=5?C.gold:C.muted, fontSize:13, fontWeight:800, width:24, textAlign:'center', flexShrink:0 }}>{s.rank}</div>
                    <div style={{ cursor: me?'default':'pointer' }} onClick={() => !me && openProfile(s)}>
                      <UserAvatar
                        user={{ ...s, role:'siswa', photoUrl: s.photoUrl ?? s.photo_url, equippedBingkai: s.equippedBingkai ?? s.equipped_bingkai }}
                        size={30}
                      />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <span style={{ color: me?C.purple:C.txt, fontSize:11, fontWeight: me?700:500 }}>{s.name||'—'}</span>
                      {me && <span style={{ marginLeft:6, background:'#3c3489', color:C.purple, fontSize:7, fontWeight:700, padding:'1px 5px', borderRadius:4 }}>KAMU</span>}
                    </div>
                    {!me && (
                      <div onClick={() => inviteDuel(s)} style={{ background:'rgba(42,26,58,0.85)', border:'0.5px solid #6f3cae', borderRadius:5, padding:'2px 8px', fontSize:7.5, color:'#c4a3f0', cursor:'pointer', fontWeight:600, flexShrink:0 }}>⚔️</div>
                    )}
                    <div style={{ color:C.gold, fontSize:10, flexShrink:0 }}>🪙 {(s.coins||s.total_coins||0).toLocaleString('id-ID')}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!isLoading && leaderboard.length === 0 && !error && (
          <div style={{ textAlign:'center', color:C.muted, fontSize:11, padding:'30px 0' }}>Belum ada data peringkat</div>
        )}
      </div>
    </div>
  )
}
