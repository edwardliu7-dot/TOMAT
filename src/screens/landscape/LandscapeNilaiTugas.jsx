import { useTask } from '../../TaskContext'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', red:'#f0997b', purple:'#cecbf6' }

export default function LandscapeNilaiTugas({ goBack, navigate }) {
  const { tasks = [], grades = [] } = useTask()

  const pending = tasks.filter(t => t.status !== 'completed')
  const done = tasks.filter(t => t.status === 'completed')
  const avgScore = grades.length ? Math.round(grades.reduce((s, g) => s + (g.score || 0), 0) / grades.length) : 0

  const scoreColor = (s) => s >= 90 ? C.green : s >= 70 ? C.purple : C.red
  const scoreBg = (s) => s >= 90 ? 'linear-gradient(135deg,#0d6b55,#085041)' : s >= 70 ? 'linear-gradient(135deg,#3c3489,#2a2470)' : 'linear-gradient(135deg,#712b13,#993c1d)'

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:`0.5px solid #1e2644`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>Nilai & Tugas</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[{ l:'Rata-rata', v: avgScore || '—', c:C.green }, { l:'Selesai', v:done.length, c:C.purple }, { l:'Aktif', v:pending.length, c:C.gold }].map((s,i) => (
            <div key={i} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:8, padding:'4px 10px', textAlign:'center' }}>
              <div style={{ color:s.c, fontSize:13, fontWeight:800 }}>{s.v}</div>
              <div style={{ color:C.muted, fontSize:8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body 2 kolom */}
      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        {/* KIRI: Tugas */}
        <div style={{ width:'48%', borderRight:`0.5px solid #1e2644`, display:'flex', flexDirection:'column', padding:'10px 10px 10px 16px', gap:6, overflowY:'auto' }}>
          <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8, flexShrink:0 }}>TUGAS</div>
          {pending.length === 0 && done.length === 0 && (
            <div style={{ color:C.muted, fontSize:11, marginTop:20, textAlign:'center' }}>Belum ada tugas</div>
          )}
          {[...pending, ...done].map((t, i) => {
            const isDone = t.status === 'completed'
            const dotC = isDone ? C.muted : t.status === 'active' ? C.gold : C.green
            return (
              <div key={i} style={{ background: isDone ? '#161c33' : C.card, border:`0.5px solid ${isDone?'#1e2644':C.border}`, borderRadius:9, padding:'8px 10px', display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:dotC, boxShadow: isDone?'none':`0 0 5px ${dotC}`, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color: isDone?C.muted:C.txt, fontSize:11, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.game_key || t.title || 'Tugas'}</div>
                  <div style={{ color:isDone?C.muted:C.sub, fontSize:8.5, marginTop:2 }}>{isDone ? 'Selesai' : 'Belum selesai'}</div>
                </div>
                {isDone ? <span style={{ fontSize:14 }}>✅</span> : (
                  <div style={{ background:'linear-gradient(135deg,#e2653f,#c94f2d)', borderRadius:6, padding:'4px 8px', color:'#fff', fontSize:8.5, fontWeight:700, cursor:'pointer', flexShrink:0 }} onClick={() => navigate('modeselect')}>Kerjakan</div>
                )}
              </div>
            )
          })}
        </div>

        {/* KANAN: Riwayat nilai */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'10px 16px 10px 10px', gap:6, overflowY:'auto' }}>
          <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8, flexShrink:0 }}>RIWAYAT NILAI</div>
          {grades.length === 0 && (
            <div style={{ color:C.muted, fontSize:11, marginTop:20, textAlign:'center' }}>Belum ada nilai</div>
          )}
          {grades.slice().reverse().slice(0, 8).map((g, i) => (
            <div key={i} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:9, padding:'8px 10px', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:'50%', flexShrink:0, background:scoreBg(g.score||0), display:'flex', alignItems:'center', justifyContent:'center', boxShadow: (g.score||0)>=90?'0 0 10px rgba(93,202,165,0.3)':'none' }}>
                <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>{g.score||0}</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:C.txt, fontSize:10.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.game_key || g.title || 'Game'}</div>
                <div style={{ color:C.muted, fontSize:8, marginTop:2 }}>{g.correct_count||0} benar · {g.question_count||0} soal</div>
              </div>
              <div style={{ width:70, flexShrink:0 }}>
                <div style={{ height:4, background:'#2a3158', borderRadius:3 }}>
                  <div style={{ height:4, width:`${Math.min(g.score||0,100)}%`, background:scoreColor(g.score||0), borderRadius:3 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
