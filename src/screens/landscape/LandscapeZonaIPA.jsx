import { useState } from 'react'
import { useAuth } from '../../AuthContext'

const C = { bg:'#12172b', card:'#1c2340', border:'#313a5c', txt:'#f2ede3', sub:'#8b8f9e', muted:'#5a6180', green:'#5dcaa5', gold:'#fac775', teal:'#9fe1cb', tealDark:'#085041' }

const GRADE_DATA = {
  7: { babs: [
    { label:'BAB I\nPengukuran', games:5, icon:'📏' },
    { label:'BAB II\nZat & Wujud', games:5, icon:'💧' },
    { label:'BAB III\nSuhu & Kalor', games:6, icon:'🌡' },
    { label:'BAB IV\nEnergi & Gerak', games:5, icon:'⚡' },
  ]},
  8: { babs: [
    { label:'BAB I\nGaya & Gerak', games:7, icon:'🔧' },
    { label:'BAB II\nSel & Organ', games:6, icon:'🔬' },
    { label:'BAB III\nSistem Tubuh', games:7, icon:'🫀' },
  ]},
  9: { babs: [
    { label:'BAB I\nReproduksi', games:4, icon:'🌱' },
    { label:'BAB II\nListrik', games:6, icon:'⚡' },
    { label:'BAB III\nKel. Hidup', games:5, icon:'🌍' },
  ]},
}
const GRADE_ROUTES = { 7:'ipa7', 8:'ipa8', 9:'ipa9' }

export default function LandscapeZonaIPA({ navigate, goBack }) {
  const { user } = useAuth()
  const userGrade = parseInt(user?.kelas?.match(/\d+/)?.[0] || '7')
  const validGrade = [7,8,9].includes(userGrade) ? userGrade : 7
  const [activeGrade, setActiveGrade] = useState(validGrade)

  const { babs } = GRADE_DATA[activeGrade] || GRADE_DATA[7]

  return (
    <div style={{ width:'100vw', height:'100vh', background:C.bg, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 50% 60% at 20% 50%, rgba(8,80,65,0.15) 0%, transparent 65%)' }} />

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px 8px', borderBottom:'0.5px solid #1e2644', flexShrink:0, position:'relative', zIndex:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:C.card, border:`0.5px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9cdd8', fontSize:15, cursor:'pointer' }} onClick={goBack}>‹</div>
          <span style={{ color:C.txt, fontSize:15, fontWeight:700 }}>Zona IPA</span>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', minHeight:0, position:'relative', zIndex:2 }}>
        {/* Grade selector */}
        <div style={{ width:'22%', borderRight:'0.5px solid #1e2644', display:'flex', flexDirection:'column', padding:'10px 8px', gap:7 }}>
          {[7,8,9].map(g => (
            <div key={g} onClick={() => setActiveGrade(g)} style={{ background: g===activeGrade?C.tealDark:C.card, border: g===activeGrade?'none':`0.5px solid ${C.border}`, borderRadius:10, padding:'10px', flex: g===activeGrade?1.5:1, display:'flex', flexDirection:'column', justifyContent:'center', cursor:'pointer' }}>
              <div style={{ color: g===activeGrade?'#e1f5ee':C.sub, fontSize:12, fontWeight: g===activeGrade?700:500 }}>Kelas {g}</div>
              <div style={{ color: g===activeGrade?C.teal:C.muted, fontSize:8.5, marginTop:3 }}>{GRADE_DATA[g].babs.length} BAB</div>
              <div style={{ marginTop:6, height:2.5, background: g===activeGrade?'rgba(255,255,255,0.15)':'#2a3158', borderRadius:2 }}>
                <div style={{ height:2.5, background: g===activeGrade?C.teal:C.tealDark, borderRadius:2, width: g===activeGrade?'35%':'0%' }} />
              </div>
            </div>
          ))}
        </div>

        {/* BAB cards */}
        <div style={{ flex:1, padding:'10px 14px', display:'flex', flexDirection:'column', gap:7 }}>
          <div style={{ color:C.sub, fontSize:8.5, fontWeight:700, letterSpacing:0.8 }}>BAB — KELAS {activeGrade}</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', overflowY:'auto' }}>
            {babs.map((bab, i) => (
              <div key={i} onClick={() => navigate(GRADE_ROUTES[activeGrade])} style={{ background:C.card, border:`0.5px solid ${C.border}`, borderRadius:11, padding:'11px 12px', width:148, flexShrink:0, cursor:'pointer', position:'relative' }}>
                <div style={{ fontSize:22, marginBottom:5 }}>{bab.icon}</div>
                <div style={{ color:C.txt, fontSize:9.5, fontWeight:700, whiteSpace:'pre-line', lineHeight:1.4 }}>{bab.label}</div>
                <div style={{ color:C.muted, fontSize:8, marginTop:5 }}>{bab.games} game</div>
                <div style={{ marginTop:6, height:3, background:'#2a3158', borderRadius:2 }}>
                  <div style={{ height:3, background:C.teal, borderRadius:2, width:'0%' }} />
                </div>
                <div style={{ position:'absolute', top:8, right:8 }}>
                  <div style={{ background:C.tealDark, borderRadius:5, padding:'2px 6px', color:'#e1f5ee', fontSize:8, fontWeight:700 }}>Masuk ▶</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
