import { useState, useEffect } from 'react'
import { useAuth } from '../../AuthContext'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', red:'#f0997b', purple:'#cecbf6' }

export default function LandscapeLeaderboard({ goBack }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const tabs = ['Kelasku', 'Kelas 8', 'Kelas 9']
  const gradeMap = [null, 8, 9]

  useEffect(() => {
    setLoading(true)
    const grade = gradeMap[activeTab]
    const url = grade ? `/api/siswa/papan-peringkat/kelas/${grade}` : '/api/siswa/papan-peringkat'
    fetch(url, { credentials:'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setEntries(Array.isArray(data) ? data : data.entries || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeTab])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3, 11)
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3
  const rankColors = ['#85b7eb','#fac775','#f0997b']
  const heightMap = [90, 120, 70]

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:'0.5px solid #1e2644', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>Papan Peringkat</span>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          {tabs.map((t,i) => (
            <div key={i} onClick={() => setActiveTab(i)} style={{ background: i===activeTab?'#3c3489':C.card, border: i===activeTab?'none':`0.5px solid ${C.border}`, borderRadius:7, padding:'4px 11px', color: i===activeTab?'#eeedfe':C.sub, fontSize:10, fontWeight: i===activeTab?600:400, cursor:'pointer' }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        {/* Podium */}
        <div style={{ width:'42%', borderRight:'0.5px solid #1e2644', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', padding:'8px 14px 14px', gap:8 }}>
          {loading ? <div style={{ color:C.muted, fontSize:10 }}>Memuat...</div> : (
            <>
              <div style={{ color:C.muted, fontSize:8, fontWeight:700, letterSpacing:0.8, alignSelf:'flex-start' }}>TOP 3</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:10, width:'100%' }}>
                {podiumOrder.map((p, i) => {
                  if (!p) return null
                  const isFirst = p.rank === 1
                  return (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                      <div style={{ position:'relative' }}>
                        <div style={{ width:44, height:44, borderRadius:'50%', background:`rgba(255,255,255,0.08)`, border:`2px solid ${rankColors[i]}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ color:C.txt, fontSize:16, fontWeight:700 }}>{(p.name||'?')[0]}</span>
                        </div>
                        {isFirst && <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', fontSize:16 }}>👑</div>}
                      </div>
                      <div style={{ color:C.txt, fontSize:9, fontWeight:600, textAlign:'center', maxWidth:70, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name||'—'}</div>
                      <div style={{ color:C.gold, fontSize:8 }}>🪙 {(p.total_coins||0).toLocaleString('id')}</div>
                      <div style={{ width:'100%', background:rankColors[i], borderRadius:'6px 6px 0 0', height:heightMap[i], display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ color:'#12172b', fontSize:18, fontWeight:900 }}>#{p.rank}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Rank list */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'8px 14px', gap:5, overflowY:'auto' }}>
          <div style={{ color:C.sub, fontSize:8, fontWeight:700, letterSpacing:0.8, flexShrink:0 }}>PERINGKAT BERIKUTNYA</div>
          {rest.map((r, i) => {
            const isMe = r.id === user?.id
            return (
              <div key={i} style={{ background: isMe?'rgba(60,52,137,0.25)':C.card, border: isMe?`0.5px solid #3c3489`:`0.5px solid ${C.border}`, borderRadius:9, padding:'7px 10px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ color: (r.rank||i+4)<=5?C.gold:C.muted, fontSize:13, fontWeight:800, width:24, textAlign:'center' }}>{r.rank||i+4}</div>
                <div style={{ width:30, height:30, borderRadius:'50%', background:'#2a3158', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:C.txt, fontSize:12, fontWeight:700 }}>{(r.name||'?')[0]}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <span style={{ color: isMe?C.purple:C.txt, fontSize:10.5, fontWeight: isMe?700:500 }}>{r.name||'—'}</span>
                  {isMe && <span style={{ marginLeft:6, background:'#3c3489', color:C.purple, fontSize:7, fontWeight:700, padding:'1px 5px', borderRadius:4 }}>KAMU</span>}
                </div>
                <div style={{ color:C.gold, fontSize:10 }}>🪙 {(r.total_coins||0).toLocaleString('id')}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
