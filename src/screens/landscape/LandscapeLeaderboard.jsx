import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../AuthContext'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', red:'#f0997b', purple:'#cecbf6' }

async function apiCall(path) {
  const r = await fetch(path, { credentials:'include' })
  const d = await r.json().catch(()=>({}))
  if (!r.ok) throw new Error(d.error||'Gagal memuat')
  return d
}

// Same grade-tab logic as original LeaderboardScreen
function gradeFromKelas(kelas='') {
  if (!kelas) return null
  if (kelas.startsWith('IX')) return 9
  if (kelas.startsWith('VIII')) return 8
  if (kelas.startsWith('VII')) return 7
  return null
}

const MEDALS = { 1:'🥇', 2:'🥈', 3:'🥉' }
const PODIUM_COLOR = { 1:'#fac775', 2:'#8b9ab5', 3:'#f0997b' }
const PODIUM_H = { 1:100, 2:75, 3:60 }

export default function LandscapeLeaderboard({ goBack }) {
  const { user } = useAuth()
  const myGrade = gradeFromKelas(user?.kelas)

  // Build tabs same as original: [myclass, then grades 7/8/9 excluding own]
  const gradeTabs = useMemo(() => {
    return [7,8,9].map(g => ({
      id: g === myGrade ? 'myclass' : String(g),
      label: g === myGrade ? '🏫 Kelasku' : `Kelas ${g}`,
      grade: g,
    }))
  }, [myGrade])

  const [activeTab, setActiveTab] = useState('myclass')
  const [myClassData, setMyClassData] = useState(null)
  const [gradeCache, setGradeCache] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch my class leaderboard on mount
  useEffect(() => {
    apiCall('/api/siswa/papan-peringkat')
      .then(setMyClassData)
      .catch(e => setError(e.message))
  }, [])

  // Fetch grade tab leaderboard on demand (cached)
  useEffect(() => {
    if (activeTab === 'myclass') return
    if (gradeCache[activeTab]) return
    setLoading(true)
    setError('')
    apiCall(`/api/siswa/papan-peringkat/kelas/${activeTab}`)
      .then(d => setGradeCache(prev => ({ ...prev, [activeTab]: d })))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [activeTab, gradeCache])

  const currentData = activeTab === 'myclass' ? myClassData : gradeCache[activeTab]
  const leaderboard = currentData?.leaderboard || []
  const isLoading = (activeTab === 'myclass' ? !myClassData : loading) && !error

  const top3 = leaderboard.filter(s => s.rank <= 3).sort((a,b) => a.rank - b.rank)
  const rest = leaderboard.filter(s => s.rank > 3)

  // Podium order: 2nd, 1st, 3rd
  const byRank = Object.fromEntries(top3.map(s=>[s.rank,s]))
  const podiumOrder = [byRank[2], byRank[1], byRank[3]].filter(Boolean)

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:`0.5px solid #1e2644`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>🏆 Papan Peringkat</span>
        </div>
        <div style={{ display:'flex', gap:5 }}>
          {gradeTabs.map(t => (
            <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ background: t.id===activeTab?'#3c3489':C.card, border: t.id===activeTab?'none':`0.5px solid ${C.border}`, borderRadius:7, padding:'4px 11px', color: t.id===activeTab?'#eeedfe':C.sub, fontSize:10, fontWeight: t.id===activeTab?600:400, cursor:'pointer' }}>{t.label}</div>
          ))}
        </div>
      </div>

      {error && <div style={{ padding:'6px 16px', color:'#f0997b', fontSize:10 }}>{error}</div>}

      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        {/* Podium kiri */}
        <div style={{ width:'42%', borderRight:`0.5px solid #1e2644`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', padding:'8px 14px 14px', gap:8 }}>
          {isLoading ? (
            <div style={{ color:C.muted, fontSize:10 }}>Memuat...</div>
          ) : top3.length === 0 ? (
            <div style={{ color:C.muted, fontSize:10 }}>Belum ada data</div>
          ) : (
            <>
              <div style={{ color:C.muted, fontSize:8, fontWeight:700, letterSpacing:0.8, alignSelf:'flex-start' }}>TOP 3</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:10, width:'100%' }}>
                {podiumOrder.map((s, i) => {
                  const isFirst = s.rank === 1
                  const color = PODIUM_COLOR[s.rank] || C.sub
                  return (
                    <div key={s.id||i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <div style={{ position:'relative' }}>
                        {isFirst && <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', fontSize:14 }}>👑</div>}
                        <div style={{ width:42, height:42, borderRadius:'50%', background:`rgba(255,255,255,0.08)`, border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>{(s.name||'?')[0].toUpperCase()}</span>
                        </div>
                      </div>
                      <div style={{ color:C.txt, fontSize:8.5, fontWeight:600, textAlign:'center', maxWidth:70, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name||'—'}</div>
                      <div style={{ color:C.gold, fontSize:8 }}>🪙 {(s.coins||s.total_coins||0).toLocaleString('id-ID')}</div>
                      <div style={{ width:'100%', background:color, borderRadius:'6px 6px 0 0', height:PODIUM_H[s.rank]||60, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ color:'#12172b', fontSize:16, fontWeight:900 }}>{MEDALS[s.rank]||`#${s.rank}`}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Daftar kanan */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'8px 14px', gap:5, overflowY:'auto' }}>
          <div style={{ color:C.sub, fontSize:8, fontWeight:700, letterSpacing:0.8, flexShrink:0 }}>
            {activeTab === 'myclass' && currentData?.kelas ? `Kelas ${currentData.kelas}` : activeTab !== 'myclass' ? `Kelas ${activeTab}` : 'Peringkat'}
          </div>
          {isLoading && <div style={{ color:C.muted, fontSize:10, marginTop:20, textAlign:'center' }}>Memuat...</div>}
          {rest.map((s, i) => {
            const isMe = s.id === user?.id
            return (
              <div key={s.id||i} style={{ background: isMe?'rgba(60,52,137,0.25)':C.card, border: isMe?`0.5px solid #3c3489`:`0.5px solid ${C.border}`, borderRadius:9, padding:'7px 10px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ color: s.rank<=5?C.gold:C.muted, fontSize:12, fontWeight:800, width:24, textAlign:'center' }}>{s.rank}</div>
                <div style={{ width:30, height:30, borderRadius:'50%', background:'#2a3158', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ color:C.txt, fontSize:12, fontWeight:700 }}>{(s.name||'?')[0].toUpperCase()}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <span style={{ color: isMe?C.purple:C.txt, fontSize:10.5, fontWeight: isMe?700:500 }}>{s.name||'—'}</span>
                  {isMe && <span style={{ marginLeft:6, background:'#3c3489', color:C.purple, fontSize:7, fontWeight:700, padding:'1px 5px', borderRadius:4 }}>KAMU</span>}
                </div>
                <div style={{ color:C.gold, fontSize:10 }}>🪙 {(s.coins||s.total_coins||0).toLocaleString('id-ID')}</div>
              </div>
            )
          })}
          {!isLoading && leaderboard.length === 0 && !error && (
            <div style={{ color:C.muted, fontSize:10, marginTop:20, textAlign:'center' }}>Belum ada data peringkat</div>
          )}
          <div style={{ marginTop:8, padding:'8px 10px', borderRadius:9, border:`0.5px dashed ${C.border}`, fontSize:8.5, color:C.muted, lineHeight:1.7 }}>
            📊 Poin = Tugas 40% + Level 20% + EXP 10% + Hafalan 30%
          </div>
        </div>
      </div>
    </div>
  )
}
