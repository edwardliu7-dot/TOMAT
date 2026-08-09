import { useTask, TYPE_LABELS, TYPE_COLORS, TYPE_ICONS } from '../../TaskContext'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', red:'#f0997b', purple:'#cecbf6', orange:'#e2653f' }

function scoreColor(s) {
  return s >= 90 ? '#34D399' : s >= 75 ? '#67E8F9' : s >= 60 ? '#F59E0B' : '#F87171'
}

export default function LandscapeNilaiTugas({ goBack, navigate }) {
  // Same data source as original GradesScreen
  const { grades = [], tasks = [] } = useTask()

  // Same filter logic as original: status === 'active' only
  const pendingTasks = tasks.filter(t => t.status === 'active')

  const completedByType = {
    harian:   grades.filter(g => g.type === 'harian'),
    formatif: grades.filter(g => g.type === 'formatif'),
    sumatif:  grades.filter(g => g.type === 'sumatif'),
  }

  const hasAnyGrade = grades.length > 0
  const avgScore = hasAnyGrade ? Math.round(grades.reduce((s,g) => s + g.score, 0) / grades.length) : null

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:`0.5px solid #1e2644`, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>📊 Nilai & Tugas</span>
        </div>
        {/* Summary stats */}
        <div style={{ display:'flex', gap:8 }}>
          {[
            { l:'Rata-rata', v: avgScore ?? '—', c:C.green },
            { l:'Selesai', v: grades.length, c:C.purple },
            { l:'Aktif', v: pendingTasks.length, c:C.gold },
          ].map((s,i) => (
            <div key={i} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:8, padding:'4px 10px', textAlign:'center', minWidth:52 }}>
              <div style={{ color:s.c, fontSize:13, fontWeight:800 }}>{s.v}</div>
              <div style={{ color:C.muted, fontSize:8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body: 2 kolom */}
      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        {/* KIRI: Tugas Aktif */}
        <div style={{ width:'46%', borderRight:`0.5px solid #1e2644`, display:'flex', flexDirection:'column', padding:'10px 10px 10px 16px', gap:6, overflowY:'auto' }}>
          <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8, flexShrink:0 }}>TUGAS BELUM DIKERJAKAN</div>
          {pendingTasks.length === 0 && (
            <div style={{ color:C.muted, fontSize:10.5, marginTop:20, textAlign:'center' }}>Tidak ada tugas aktif</div>
          )}
          {pendingTasks.map(t => {
            const color = TYPE_COLORS[t.type] || C.gold
            const icon  = TYPE_ICONS[t.type]  || '📋'
            const label = TYPE_LABELS[t.type]  || t.type
            return (
              <div key={t.id} style={{ background:C.card, border:`0.5px solid ${color}44`, borderRadius:9, padding:'8px 10px', display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => navigate?.(t.gameKey, { taskId: t.id })}>
                <div style={{ fontSize:20, flexShrink:0 }}>{t.gameEmoji||'🎮'}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:C.txt, fontSize:10.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.gameName||t.game_key||'Tugas'}</div>
                  <div style={{ display:'flex', gap:5, marginTop:2, flexWrap:'wrap' }}>
                    <span style={{ background:`${color}18`, color, fontSize:8.5, fontWeight:700, padding:'1px 6px', borderRadius:20 }}>{icon} {label}</span>
                    <span style={{ background:'rgba(255,255,255,0.05)', color:C.sub, fontSize:8.5, padding:'1px 6px', borderRadius:20 }}>📚 {t.totalQuestions||t.question_count||0} soal</span>
                  </div>
                </div>
                <div style={{ background:'linear-gradient(135deg,#e2653f,#c94f2d)', borderRadius:6, padding:'5px 10px', color:'#fff', fontSize:9, fontWeight:700, flexShrink:0 }}>▶ Kerjakan</div>
              </div>
            )
          })}
        </div>

        {/* KANAN: Riwayat Nilai */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'10px 16px 10px 10px', gap:6, overflowY:'auto' }}>
          <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8, flexShrink:0 }}>RIWAYAT NILAI</div>
          {grades.length === 0 && (
            <div style={{ color:C.muted, fontSize:10.5, marginTop:20, textAlign:'center' }}>Belum ada nilai</div>
          )}
          {/* Group by type, newest first — same as original */}
          {['harian','formatif','sumatif'].map(type => {
            const list = completedByType[type]
            if (list.length === 0) return null
            const color = TYPE_COLORS[type]
            const icon  = TYPE_ICONS[type]
            const label = TYPE_LABELS[type]
            return (
              <div key={type}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                  <span style={{ fontSize:12 }}>{icon}</span>
                  <span style={{ color, fontSize:9, fontWeight:700 }}>{label}</span>
                  <span style={{ background:`${color}22`, color, fontSize:8, fontWeight:700, padding:'1px 6px', borderRadius:20, marginLeft:'auto' }}>{list.length}</span>
                </div>
                {list.slice().reverse().map((g,i) => {
                  const sc = scoreColor(g.score)
                  const dateStr = g.completedAt ? new Date(g.completedAt).toLocaleDateString('id-ID',{day:'numeric',month:'short'}) : ''
                  return (
                    <div key={g.id||i} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:9, padding:'7px 10px', display:'flex', alignItems:'center', gap:10, marginBottom:5 }}>
                      <div style={{ fontSize:18, flexShrink:0 }}>{g.gameEmoji||'🎮'}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:C.txt, fontSize:10, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.gameName||g.game_key||'Game'}</div>
                        <div style={{ color:C.muted, fontSize:8, marginTop:1 }}>{g.correctCount}/{g.totalQuestions} soal · {dateStr}</div>
                      </div>
                      <div style={{ textAlign:'center', flexShrink:0 }}>
                        <div style={{ fontSize:16, fontWeight:900, color:sc }}>{g.score}</div>
                        <div style={{ height:3, width:50, background:'#2a3158', borderRadius:2, marginTop:3 }}>
                          <div style={{ height:3, width:`${Math.min(g.score,100)}%`, background:sc, borderRadius:2 }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
