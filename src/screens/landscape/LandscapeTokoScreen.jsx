import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../AuthContext'
import { usePet } from '../../PetContext'
import PetSVG, { PET_CSS, STATE_ANIMS, getPetName } from '../../components/PetSVG'
import { getPetBonusDisplay } from '../../petBonuses'
import {
  KATEGORI_LABELS, PET_SKIN_INFO, PET_FOOD_CATALOG,
  BINGKAI_VISUALS, SPANDUK_VISUALS, TEMA_VISUALS,
} from '../../shopVisuals'
import {
  VISIBLE_EVENTS, isEventActive, getEventEndDate,
  formatCountdown, getUpcomingEvents, formatDaysUntil,
} from '../../data/seasonalEvents'

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'event',    icon: '🎉' },
  { id: 'pet_skin', icon: '🐾' },
  { id: 'bingkai',  icon: '🖼️' },
  { id: 'spanduk',  icon: '🏳️' },
  { id: 'tema',     icon: '✨' },
]

// ── Rarity helpers (mirror ShopScreen) ───────────────────────────────────────
function getItemRarity(item) {
  const v = item.visual || {}
  if (v.limited) return 'epik'
  if (v.glow)    return 'langka'
  return 'umum'
}
const RARITY_ORDER    = ['umum', 'langka', 'epik']
const RARITY_LABEL    = { umum: 'Umum', langka: 'Langka', epik: 'Epik' }
const RARITY_COLOR    = { umum: '#94A3B8', langka: '#60A5FA', epik: '#C084FC' }
const RARITY_ICON     = { umum: '◆', langka: '◈', epik: '★' }
const RARITY_BADGE_BG = { umum: 'rgba(148,163,184,0.12)', langka: 'rgba(96,165,250,0.12)', epik: 'rgba(192,132,252,0.14)' }

const REVIVE_COST = 300

// Pet structure (mirrors ShopScreen)
const BASE_PETS = [
  { id: 'golden' },
  { id: 'pet_kelinsay' },
  { id: 'pet_monyong' },
  { id: 'pet_komodih' },
  { id: 'pet_nananaga' },
]
const SKIN_GROUPS = [
  { id: 'tomi',     label: 'Tomi (Marmut)',   icon: '🐹', color: '#F5A623', bg: 'rgba(245,166,35,0.10)',   border: 'rgba(245,166,35,0.22)',   skins: ['pet_skin_silver','pet_skin_cosmic','pet_skin_void'] },
  { id: 'kelinsay', label: 'Kelinsay (Kelinci)', icon: '🐰', color: '#34D399', bg: 'rgba(52,211,153,0.10)',   border: 'rgba(52,211,153,0.22)',   skins: ['pet_kelinsay_senja','pet_kelinsay_malam','pet_kelinsay_merahputih'] },
  { id: 'monyong',  label: 'Monyang (Monyet)', icon: '🐒', color: '#FB923C', bg: 'rgba(251,146,60,0.10)',   border: 'rgba(251,146,60,0.22)',   skins: ['pet_monyong_raja','pet_monyong_kosmik'] },
  { id: 'nananaga', label: 'Nananaga (Naga)',  icon: '🐲', color: '#C084FC', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.25)', skins: ['pet_nananaga_merah','pet_nananaga_es'] },
]

// ── API helper ────────────────────────────────────────────────────────────────
async function apiCall(path, opts = {}) {
  const r = await fetch(path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.error || 'Terjadi kesalahan.')
  return d
}

function playSfx() {} // stub — sfx optional in landscape

// ── Epic sparkle overlay ──────────────────────────────────────────────────────
const SPARKLE_DOTS = [
  { top:'10%', left: '7%', delay:'0.0s', size:3 },
  { top:'22%', right:'9%', delay:'0.6s', size:2 },
  { top:'60%', left:'12%', delay:'1.1s', size:3 },
  { top:'78%', right:'11%', delay:'0.3s', size:4 },
  { top:'88%', left:'45%', delay:'0.8s', size:3 },
]
function EpicSparkle({ color = '#C084FC' }) {
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', borderRadius:'inherit', zIndex:10 }}>
      <style>{`@keyframes ls-sparkle{0%,100%{opacity:0;transform:scale(0.4) rotate(0deg)}50%{opacity:.85;transform:scale(1.1) rotate(45deg)}}`}</style>
      {SPARKLE_DOTS.map((d, i) => (
        <div key={i} style={{ position:'absolute', width:d.size, height:d.size, borderRadius:'50%', background:'#fff', top:d.top, left:d.left, right:d.right, boxShadow:`0 0 4px 1px ${color}, 0 0 9px 2px ${color}88`, animation:`ls-sparkle 2.6s ease-in-out ${d.delay} infinite`, opacity:0 }} />
      ))}
    </div>
  )
}

// ── PetCard (mirrors ShopScreen) ──────────────────────────────────────────────
function PetCard({ skinId, data, equippedSkin, busyId, onBuyEquip }) {
  const info = PET_SKIN_INFO[skinId]
  if (!info) return null
  const bonus = getPetBonusDisplay(skinId)
  const owned = skinId === 'golden' || data.ownedItemIds.includes(skinId)
  const prerequisiteOwned = !info.prerequisitePetId || data.ownedItemIds.includes(info.prerequisitePetId)
  const equipped = equippedSkin === skinId
  const shopItem = data.items.find(it => it.id === skinId)
  const affordable = skinId === 'golden' || (shopItem && data.coins >= shopItem.harga)
  const canBuy = prerequisiteOwned && affordable
  const busy = busyId === skinId
  const isEpic = info.rarity === 'epic'
  return (
    <div style={{
      background: info.glow ? `radial-gradient(ellipse at 50% 0%,${info.glow},transparent 65%),#1A1D27` : '#1A1D27',
      border: `1.5px solid ${equipped ? info.tierColor : isEpic ? `${info.tierColor}44` : 'rgba(255,255,255,0.07)'}`,
      borderRadius:18, padding:'14px 10px',
      display:'flex', flexDirection:'column', alignItems:'center', gap:8,
      position:'relative', overflow:'hidden',
      boxShadow: equipped ? `0 0 24px ${info.glow||'rgba(245,166,35,0.2)'}` : isEpic ? `0 0 14px ${info.glow||'rgba(192,132,252,0.15)'}` : 'none',
    }}>
      {isEpic && <EpicSparkle color={info.tierColor} />}
      {equipped && <div style={{ position:'absolute', top:0, right:0, background:info.tierColor, color:['#F59E0B','#34D399'].includes(info.tierColor)?'#000':'#fff', fontSize:8, fontWeight:900, padding:'3px 7px', borderRadius:'0 16px 0 9px' }}>DIPAKAI</div>}
      <div style={{ animation:STATE_ANIMS.idle, transformOrigin:'center bottom' }}>
        <PetSVG state="idle" skinId={skinId} size={72} />
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:9, fontWeight:800, color:info.tierColor, letterSpacing:'0.15em', marginBottom:2 }}>{info.tier}</div>
        <div style={{ fontSize:12, fontWeight:800, color:'#fff' }}>{info.nama}</div>
        {bonus.label && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:3, marginTop:4, background:`${bonus.color}1a`, border:`1px solid ${bonus.color}44`, borderRadius:20, padding:'2px 7px' }}>
            <span style={{ fontSize:10 }}>{bonus.icon}</span>
            <span style={{ fontSize:9, fontWeight:800, color:bonus.color }}>{bonus.label}</span>
          </div>
        )}
      </div>
      {equipped ? (
        <div style={{ width:'100%', padding:'7px', borderRadius:9, background:'rgba(255,255,255,0.05)', color:'#94A3B8', fontSize:10, fontWeight:700, textAlign:'center' }}>✓ Terpasang</div>
      ) : owned ? (
        <button onClick={() => onBuyEquip(skinId)} disabled={busy} style={{ width:'100%', padding:'7px', borderRadius:9, background:'#334155', color:'#fff', border:'none', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{busy?'…':'Pakai'}</button>
      ) : (
        <button onClick={() => onBuyEquip(skinId)} disabled={!canBuy||busy} title={!prerequisiteOwned?`Miliki ${PET_SKIN_INFO[info.prerequisitePetId]?.nama||'pet dasar'} dulu`:undefined} style={{ width:'100%', padding:'7px', borderRadius:9, border:'none', fontSize:10, fontWeight:700, cursor:canBuy?'pointer':'not-allowed', fontFamily:'inherit', background:canBuy?'#6366F1':'rgba(248,113,113,0.15)', color:canBuy?'#fff':'#F87171' }}>
          {busy?'…':!prerequisiteOwned?'🔒 Miliki pet dulu':canBuy?`Beli 🪙 ${shopItem?.harga?.toLocaleString('id-ID')}`:`🔒 🪙 ${shopItem?.harga?.toLocaleString('id-ID')}`}
        </button>
      )}
    </div>
  )
}

// ── PetTokoTab ────────────────────────────────────────────────────────────────
function PetTokoTab({ data, onRefresh }) {
  const { pet, feedPet, revivePet, refreshPet } = usePet()
  const { refreshMe } = useAuth()
  const [busyId, setBusyId]       = useState(null)
  const [localError, setLocalError] = useState('')
  const [feedSuccess, setFeedSuccess] = useState('')
  const [subTab, setSubTab]       = useState('pet')

  const equippedSkin  = data.equipped.pet_skin || 'golden'
  const activePetName = getPetName(equippedSkin)

  const buyEquipSkin = async (skinId) => {
    const isGolden = skinId === 'golden'
    const item = !isGolden ? data.items.find(it => it.id === skinId) : null
    if (!isGolden && !item) return
    const owned = isGolden || data.ownedItemIds.includes(skinId)
    setBusyId(skinId); setLocalError('')
    try {
      if (!owned) await apiCall('/api/siswa/toko/beli', { method:'POST', body:{ itemId:skinId } })
      await apiCall('/api/siswa/toko/pakai', { method:'POST', body:{ itemId:skinId } })
      await onRefresh(); await refreshMe(); refreshPet()
    } catch (err) { setLocalError(err.message) } finally { setBusyId(null) }
  }

  const buyFood = async (foodId) => {
    setBusyId(foodId); setLocalError(''); setFeedSuccess('')
    const result = await feedPet(foodId)
    if (result.ok) { setFeedSuccess(`🐾 ${activePetName} sudah makan!`); await onRefresh(); await refreshMe(); setTimeout(()=>setFeedSuccess(''),3000) }
    else setLocalError(result.error)
    setBusyId(null)
  }

  const doRevive = async () => {
    setBusyId('revive'); setLocalError(''); setFeedSuccess('')
    const result = await revivePet()
    if (result.ok) { setFeedSuccess('🐾 Pet baru sudah diadopsi!'); await onRefresh(); await refreshMe(); setTimeout(()=>setFeedSuccess(''),4000) }
    else setLocalError(result.error)
    setBusyId(null)
  }

  const hungerColor = pet.isDead ? '#EF4444' : pet.hunger < 30 ? '#F59E0B' : '#F5A623'
  const hungerLabel = pet.isDead ? '💀 Mati' : pet.isStarving ? '😩 Lapar sekali' : pet.hunger < 50 ? '😕 Agak lapar' : '😊 Kenyang'

  const subTabSty = (active) => ({
    flex:1, padding:'8px 0', borderRadius:10, border:'none', cursor:'pointer',
    fontSize:10, fontWeight:800, fontFamily:'inherit', transition:'all .15s',
    background: active ? '#6366F1' : 'rgba(255,255,255,0.05)',
    color: active ? '#fff' : '#64748B',
    boxShadow: active ? '0 2px 12px rgba(99,102,241,0.3)' : 'none',
  })

  return (
    <div style={{ paddingBottom:24 }}>
      <style>{PET_CSS}</style>

      {/* Active pet status card */}
      <div style={{ marginBottom:14, background:'linear-gradient(160deg,#0d1b2a,#1a0d2e)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:16, padding:'14px 16px', display:'flex', alignItems:'flex-end', gap:12 }}>
        <div style={{ animation:STATE_ANIMS[pet.isDead?'dead':pet.isStarving?'hungry':'idle'], transformOrigin:'center bottom' }}>
          <PetSVG state={pet.isDead?'dead':pet.isStarving?'hungry':'idle'} skinId={equippedSkin} size={80} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:900, color:'#F7C55E', marginBottom:2 }}>{activePetName}</div>
          <div style={{ fontSize:10, color:'#94A3B8', marginBottom:8 }}>{hungerLabel}</div>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
              <span style={{ fontSize:9, color:'#64748B' }}>🌾 Kenyang</span>
              <span style={{ fontSize:9, fontWeight:700, color:hungerColor }}>{pet.hunger}%</span>
            </div>
            <div style={{ height:6, borderRadius:99, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
              <div style={{ width:`${pet.hunger}%`, height:'100%', borderRadius:99, background:pet.hunger>50?'linear-gradient(90deg,#F5A623,#F7C55E)':pet.hunger>25?'linear-gradient(90deg,#F59E0B,#EF4444)':'#EF4444', transition:'width 0.6s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        <button onClick={()=>setSubTab('pet')}     style={subTabSty(subTab==='pet')}>🐾 Pet</button>
        <button onClick={()=>setSubTab('skin')}    style={subTabSty(subTab==='skin')}>✨ Skin</button>
        <button onClick={()=>setSubTab('makanan')} style={subTabSty(subTab==='makanan')}>🍖 Makanan</button>
      </div>

      {/* Feedback */}
      {(localError||feedSuccess) && (
        <div style={{ marginBottom:12, padding:'8px 12px', borderRadius:10, fontSize:11, background:feedSuccess?'rgba(16,185,129,0.15)':'rgba(239,68,68,0.15)', border:`1px solid ${feedSuccess?'rgba(16,185,129,0.3)':'rgba(239,68,68,0.3)'}`, color:feedSuccess?'#34D399':'#F87171' }}>
          {feedSuccess||localError}
        </div>
      )}

      {/* ── SUB-TAB: PET ── */}
      {subTab === 'pet' && (
        <>
          {pet.isDead && (
            <div style={{ marginBottom:20, borderRadius:16, background:'linear-gradient(145deg,#1a0000,#2d0a0a)', border:'2px solid rgba(239,68,68,0.4)', padding:'16px 14px', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:8 }}>💀</div>
              <div style={{ fontSize:14, fontWeight:900, color:'#F87171', marginBottom:4 }}>{activePetName} sudah mati!</div>
              <div style={{ fontSize:11, color:'#94A3B8', marginBottom:12, lineHeight:1.6 }}>Kamu perlu mengadopsi pet baru untuk melanjutkan perjalanan!</div>
              <div style={{ fontSize:11, color:'#FCA5A5', marginBottom:12 }}>Biaya adopsi: <strong style={{ color:'#F87171' }}>🪙 {REVIVE_COST}</strong>{data.coins < REVIVE_COST && <span style={{ color:'#6B7280', fontSize:10, display:'block', marginTop:3 }}>(Kamu punya 🪙 {data.coins})</span>}</div>
              <button onClick={doRevive} disabled={data.coins < REVIVE_COST || busyId==='revive'} style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', fontSize:12, fontWeight:900, cursor:data.coins>=REVIVE_COST?'pointer':'not-allowed', fontFamily:'inherit', background:data.coins>=REVIVE_COST?'linear-gradient(135deg,#dc2626,#b91c1c)':'rgba(248,113,113,0.1)', color:data.coins>=REVIVE_COST?'#fff':'#F87171' }}>
                {busyId==='revive'?'…':data.coins>=REVIVE_COST?'🐾 Adopsi Pet Baru':'🔒 Koin tidak cukup'}
              </button>
            </div>
          )}
          <div style={{ fontSize:10, color:'#94A3B8', fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:10 }}>🐾 Koleksi Pet</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
            {BASE_PETS.map(({ id }) => (
              <PetCard key={id} skinId={id} data={data} equippedSkin={equippedSkin} busyId={busyId} onBuyEquip={buyEquipSkin} />
            ))}
          </div>
        </>
      )}

      {/* ── SUB-TAB: SKIN ── */}
      {subTab === 'skin' && (
        <>
          {SKIN_GROUPS.map(group => (
            <div key={group.id} style={{ marginBottom:22 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:4, background:group.bg, border:`1px solid ${group.border}`, borderRadius:99, padding:'3px 9px' }}>
                  <span style={{ fontSize:11 }}>{group.icon}</span>
                  <span style={{ fontSize:9, fontWeight:900, color:group.color, letterSpacing:'0.12em', textTransform:'uppercase' }}>{group.label}</span>
                </div>
                <div style={{ flex:1, height:1, background:`${group.color}28` }} />
                <span style={{ fontSize:9, fontWeight:700, color:`${group.color}88` }}>{group.skins.length} skin</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                {group.skins.map(skinId => (
                  <PetCard key={skinId} skinId={skinId} data={data} equippedSkin={equippedSkin} busyId={busyId} onBuyEquip={buyEquipSkin} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── SUB-TAB: MAKANAN ── */}
      {subTab === 'makanan' && (
        <>
          <div style={{ fontSize:10, color:'#34D399', fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:10 }}>🌾 Toko Makanan Pet</div>
          {pet.isDead ? (
            <div style={{ padding:'16px', borderRadius:14, background:'rgba(239,68,68,0.07)', border:'1px dashed rgba(239,68,68,0.3)', textAlign:'center', fontSize:11, color:'#6B7280', lineHeight:1.7 }}>
              🚫 Makanan tidak bisa diberikan ke pet yang sudah mati.<br />
              <span style={{ fontSize:10 }}>Adopsi pet baru dulu di tab <strong style={{ color:'#94A3B8' }}>🐾 Pet</strong></span>
            </div>
          ) : (
            <>
              <div style={{ fontSize:10, color:'#64748B', marginBottom:12, lineHeight:1.5 }}>Semakin mahal makanannya, semakin lama <strong style={{ color:'#94A3B8' }}>{activePetName}</strong> kenyang.</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                {PET_FOOD_CATALOG.map(food => {
                  const affordable = data.coins >= food.harga
                  const busy = busyId === food.id
                  return (
                    <div key={food.id} style={{ background:'#1A1D27', border:`1px solid ${food.color}22`, borderRadius:14, padding:'14px 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:7 }}>
                      <div style={{ fontSize:32 }}>{food.emoji}</div>
                      <div style={{ fontWeight:800, fontSize:11, color:'#fff', textAlign:'center' }}>{food.nama}</div>
                      <div style={{ fontSize:9, color:'#64748B' }}>Kenyang {food.dur}</div>
                      <div style={{ fontWeight:900, fontSize:12, color:food.color }}>🪙 {food.harga}</div>
                      <button onClick={()=>buyFood(food.id)} disabled={!affordable||busy} style={{ width:'100%', padding:'7px', borderRadius:9, border:'none', fontSize:10, fontWeight:700, cursor:affordable?'pointer':'not-allowed', fontFamily:'inherit', background:affordable?`${food.color}22`:'rgba(248,113,113,0.1)', color:affordable?food.color:'#F87171', outline:`1px solid ${affordable?food.color+'44':'rgba(248,113,113,0.2)'}` }}>
                        {busy?'…':affordable?'Beri Makan':'🔒 Koin kurang'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── MissionPanel ──────────────────────────────────────────────────────────────
function MissionPanel({ ev, missions, onClaim, claimingId, claimError }) {
  if (!missions || missions.length === 0) return null
  return (
    <div style={{ background:'rgba(10,16,26,0.85)', padding:'12px 12px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
        <span style={{ fontSize:8, fontWeight:900, letterSpacing:2, color:ev.accent, background:`${ev.accent}18`, borderRadius:6, padding:'2px 7px', textTransform:'uppercase' }}>🎖️ Misi Event</span>
        <div style={{ flex:1, height:1, background:`${ev.accent}28` }} />
      </div>
      {claimError && <div style={{ marginBottom:8, padding:'6px 10px', borderRadius:8, fontSize:10, background:'rgba(239,68,68,0.14)', border:'1px solid rgba(239,68,68,0.25)', color:'#F87171' }}>{claimError}</div>}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
        {missions.map((m, idx) => {
          const isAutoMission = m.requires?.length > 0
          const pct = Math.min(100, Math.round((m.progress/m.goal)*100))
          const isBusy = claimingId === m.id
          return (
            <div key={m.id} style={{ borderRadius:12, border:`1px solid ${m.completed ? m.accent+'55':'rgba(255,255,255,0.07)'}`, background:m.completed?`linear-gradient(135deg,${m.accent}0d,rgba(10,16,26,0.9))`:'rgba(255,255,255,0.025)', padding:'10px 12px', opacity:(!m.completed&&isAutoMission)?0.6:1 }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                <div style={{ width:34, height:34, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, background:m.completed?`${m.accent}22`:'rgba(255,255,255,0.06)', border:`1px solid ${m.completed?m.accent+'44':'rgba(255,255,255,0.08)'}` }}>{m.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                    <span style={{ fontSize:11, fontWeight:800, color:m.completed?'#fff':'#CBD5E1' }}>Misi {idx+1}: {m.nama}</span>
                    {m.claimed && <span style={{ fontSize:8, fontWeight:900, background:'rgba(52,211,153,0.15)', color:'#34D399', borderRadius:4, padding:'1px 4px' }}>✓ CLAIMED</span>}
                    {m.completed && !m.claimed && <span style={{ fontSize:8, fontWeight:900, background:`${m.accent}22`, color:m.accent, borderRadius:4, padding:'1px 4px' }}>SELESAI!</span>}
                  </div>
                  <div style={{ fontSize:10, color:'#64748B', marginBottom:6, lineHeight:1.4 }}>{m.deskripsi}</div>
                  {isAutoMission ? (
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {m.requires.map(reqId => {
                        const reqMission = missions.find(x=>x.id===reqId)
                        const done = reqMission?.completed
                        return <span key={reqId} style={{ fontSize:9, fontWeight:700, borderRadius:5, padding:'1px 6px', background:done?'rgba(52,211,153,0.12)':'rgba(255,255,255,0.06)', color:done?'#34D399':'#64748B', border:`1px solid ${done?'rgba(52,211,153,0.25)':'rgba(255,255,255,0.08)'}` }}>{done?'✓':'○'} {reqMission?.nama||reqId}</span>
                      })}
                    </div>
                  ) : (
                    <>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:9, color:'#475569' }}>{m.unit}</span>
                        <span style={{ fontSize:9, fontWeight:800, color:m.completed?m.accent:'#94A3B8' }}>{m.progress}/{m.goal}</span>
                      </div>
                      <div style={{ height:5, borderRadius:99, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:99, width:`${pct}%`, background:m.completed?`linear-gradient(90deg,${m.accent},${m.accent}cc)`:`linear-gradient(90deg,${ev.accent}88,${ev.accent}44)`, boxShadow:m.completed?`0 0 8px ${m.accent}66`:'none', transition:'width 0.5s ease' }} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              {m.completed && !m.claimed && (
                <button onClick={()=>onClaim(m.id)} disabled={isBusy} style={{ marginTop:10, width:'100%', padding:'8px', borderRadius:9, border:'none', cursor:isBusy?'default':'pointer', fontFamily:'inherit', fontSize:11, fontWeight:900, background:`linear-gradient(135deg,${m.accent},${m.accent}cc)`, color:'#fff', boxShadow:`0 4px 14px ${m.accent}44` }}>
                  {isBusy?'…':'🎁 Ambil Hadiah'}
                </button>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
        <span style={{ fontSize:8, fontWeight:900, letterSpacing:2, color:'#64748B', textTransform:'uppercase' }}>🛍️ Item Eksklusif</span>
        <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  )
}

// ── ItemCard (mirrors ShopScreen) ─────────────────────────────────────────────
function ItemCard({ item, data, onBuy, onEquip, busyId }) {
  const owned    = data.ownedItemIds.includes(item.id)
  const equipped = data.equipped[item.kategori] === item.id
  const affordable = data.coins >= item.harga
  const busy     = busyId === item.id

  const visual = (() => {
    const v = item.visual || {}
    if (item.kategori === 'bingkai') {
      if (v.image) {
        const outer=70, sf=v.spread??0.45, photoSz=Math.round(outer/(1+2*sf))
        return (
          <div style={{ position:'relative', width:outer, height:outer, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <div style={{ width:photoSz, height:photoSz, borderRadius:'50%', background:'#1E2128', display:'flex', alignItems:'center', justifyContent:'center', fontSize:Math.round(photoSz*0.45), zIndex:1 }}>🧑‍🎓</div>
            <img src={v.image} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', zIndex:3, mixBlendMode:v.mixBlend??'normal', filter:v.glow?`drop-shadow(0 0 5px ${v.border}bb)`:'none' }} />
          </div>
        )
      }
      return <div style={{ width:66, height:66, borderRadius:'50%', border:`4px ${v.style||'solid'} ${v.border||'#67E8F9'}`, boxShadow:v.glow?`0 0 14px ${v.border}88`:'none', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.3)' }}><div style={{ width:50, height:50, borderRadius:'50%', background:'#1E2128', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🧑‍🎓</div></div>
    }
    if (item.kategori === 'spanduk') {
      const bg = v.image ? `url(${v.image}) center/cover no-repeat,${v.gradient||'#334155'}` : v.gradient||'#334155'
      return <div style={{ width:'100%', height:52, borderRadius:10, background:bg, boxShadow:v.glow?'0 0 16px rgba(212,175,55,0.3)':'none' }} />
    }
    if (item.kategori === 'tema') {
      return (
        <div style={{ width:'100%', height:60, borderRadius:10, overflow:'hidden', position:'relative', background:v.gradient||'#1A1D27', border:v.limited?`1px solid ${v.accent}44`:'1px solid rgba(255,255,255,0.08)' }}>
          {v.accent && <div style={{ position:'absolute', width:60, height:60, borderRadius:'50%', background:v.accent, filter:'blur(28px)', opacity:0.22, top:'-30%', left:'28%' }} />}
          <div style={{ position:'absolute', bottom:6, left:8, display:'flex', gap:4 }}>
            {(v.swatches||[]).map((c,i)=><div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c, border:'1px solid rgba(255,255,255,0.18)' }} />)}
          </div>
        </div>
      )
    }
    return <div style={{ width:52, height:52, borderRadius:10, background:'#334155', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>❔</div>
  })()

  const isList = item.kategori === 'spanduk' || item.kategori === 'tema'

  if (isList) {
    return (
      <div style={{ background:'#1A1D27', borderRadius:14, padding:'10px 12px', border:`1px solid ${equipped?'rgba(234,179,8,0.4)':'rgba(255,255,255,0.06)'}`, display:'flex', alignItems:'center', gap:12, position:'relative' }}>
        {equipped && <div style={{ position:'absolute', top:0, right:0, background:'#EAB308', color:'#000', fontSize:8, fontWeight:800, padding:'2px 7px', borderRadius:'0 12px 0 9px' }}>DIPAKAI</div>}
        {item.visual?.limited && !equipped && <div style={{ position:'absolute', top:0, left:0, background:'linear-gradient(90deg,#D4AF37,#F8E7A1)', color:'#21180a', fontSize:8, fontWeight:900, padding:'2px 6px', borderRadius:'12px 0 9px 0' }}>LIMITED</div>}
        <div style={{ flexShrink:0, width: item.kategori==='bingkai'?70:'100%', maxWidth: item.kategori!=='bingkai'?140:undefined }}>
          {visual}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#fff', marginBottom:3 }}>{item.nama}</div>
          {item.visual?.description && <div style={{ fontSize:9, color:'#94A3B8', lineHeight:1.4 }}>{item.visual.description}</div>}
        </div>
        <ActionButton item={item} owned={owned} equipped={equipped} affordable={affordable} busy={busy} onBuy={onBuy} onEquip={onEquip} />
      </div>
    )
  }

  return (
    <div style={{ background:'#1A1D27', borderRadius:14, padding:12, border:`1px solid ${equipped?'rgba(234,179,8,0.4)':'rgba(255,255,255,0.06)'}`, display:'flex', flexDirection:'column', alignItems:'center', gap:8, position:'relative' }}>
      {equipped && <div style={{ position:'absolute', top:0, right:0, background:'#EAB308', color:'#000', fontSize:8, fontWeight:800, padding:'2px 7px', borderRadius:'0 12px 0 9px' }}>DIPAKAI</div>}
      {item.visual?.limited && !equipped && <div style={{ position:'absolute', top:0, left:0, background:'linear-gradient(90deg,#D4AF37,#F8E7A1)', color:'#21180a', fontSize:8, fontWeight:900, padding:'2px 6px', borderRadius:'12px 0 9px 0' }}>LIMITED</div>}
      {visual}
      <div style={{ fontSize:11, fontWeight:700, color:'#fff', textAlign:'center' }}>{item.nama}</div>
      {item.visual?.edition && <div style={{ fontSize:9, color:'#D4AF37', fontWeight:800 }}>EDISI {item.visual.edition}</div>}
      <ActionButton item={item} owned={owned} equipped={equipped} affordable={affordable} busy={busy} onBuy={onBuy} onEquip={onEquip} wide />
    </div>
  )
}

function ActionButton({ item, owned, equipped, affordable, busy, onBuy, onEquip, wide }) {
  const btn = { borderRadius:9, border:'none', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:'inherit', padding: wide?'7px 0':'6px 12px', width: wide?'100%':undefined }
  if (equipped) return <div style={{ ...btn, background:'rgba(255,255,255,0.05)', color:'#94A3B8', cursor:'default', textAlign:'center' }}>✓ Terpasang</div>
  if (owned)    return <button style={{ ...btn, background:'#334155', color:'#fff' }} onClick={()=>onEquip(item)}>{busy?'…':'Pakai'}</button>
  if (!affordable) return <div style={{ ...btn, background:'rgba(248,113,113,0.1)', color:'#F87171', cursor:'not-allowed', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}>🔒 🪙 {item.harga?.toLocaleString('id-ID')}</div>
  return <button style={{ ...btn, background:busy?'rgba(99,102,241,0.5)':'#6366F1', color:'#fff' }} onClick={()=>onBuy(item)} disabled={busy}>{busy?'…':`Beli 🪙 ${item.harga?.toLocaleString('id-ID')}`}</button>
}

// ── Rarity-grouped item list ──────────────────────────────────────────────────
function RarityItemList({ items, data, onBuy, onEquip, busyId, single = false }) {
  const grouped = {}
  for (const r of RARITY_ORDER) grouped[r] = []
  for (const item of items) grouped[getItemRarity(item)].push(item)
  const active = RARITY_ORDER.filter(r => grouped[r].length > 0)

  if (active.length === 0) {
    return <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:120, color:'#4a5280', gap:8 }}><div style={{ fontSize:24 }}>✨</div><div style={{ fontSize:11, color:'#8b8f9e' }}>Segera Hadir</div></div>
  }

  return (
    <div>
      {active.map(rarity => (
        <div key={rarity} style={{ marginBottom:22 }}>
          {/* Section header */}
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:4, background:RARITY_BADGE_BG[rarity], border:`1px solid ${RARITY_COLOR[rarity]}44`, borderRadius:99, padding:'3px 9px' }}>
              <span style={{ fontSize:9, color:RARITY_COLOR[rarity] }}>{RARITY_ICON[rarity]}</span>
              <span style={{ fontSize:9, fontWeight:900, color:RARITY_COLOR[rarity], letterSpacing:'0.15em', textTransform:'uppercase' }}>{RARITY_LABEL[rarity]}</span>
            </div>
            <div style={{ flex:1, height:1, background:`${RARITY_COLOR[rarity]}2a` }} />
            <span style={{ fontSize:9, fontWeight:700, color:`${RARITY_COLOR[rarity]}88` }}>{grouped[rarity].length} item</span>
          </div>
          {/* Items */}
          <div style={{ display: single ? 'flex' : 'grid', flexDirection: single ? 'column' : undefined, gridTemplateColumns: single ? undefined : 'repeat(2,1fr)', gap:10 }}>
            {grouped[rarity].map(item => (
              <ItemCard key={item.id} item={item} data={data} onBuy={onBuy} onEquip={onEquip} busyId={busyId} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── EventTokoTab ──────────────────────────────────────────────────────────────
function EventTokoTab({ data, onBuy, onEquip, busyId, onRefresh }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = setInterval(()=>setNow(new Date()), 1000); return ()=>clearInterval(t) }, [])

  const [missionData, setMissionData] = useState({})
  const [claimingId, setClaimingId]   = useState(null)
  const [claimError, setClaimError]   = useState('')

  const loadMissions = useCallback(async () => {
    try {
      const res = await apiCall('/api/siswa/event-missions')
      const map = {}
      for (const ev of res.events || []) map[ev.eventSlug] = ev.missions
      setMissionData(map)
    } catch { /* non-fatal */ }
  }, [])

  useEffect(() => { loadMissions() }, [loadMissions])

  const claimMission = async (missionId) => {
    setClaimingId(missionId); setClaimError('')
    try {
      await apiCall(`/api/siswa/event-missions/${missionId}/claim`, { method:'POST' })
      await loadMissions(); await onRefresh()
    } catch (err) { setClaimError(err.message) } finally { setClaimingId(null) }
  }

  const { refreshMe } = useAuth()
  const { refreshPet } = usePet()
  const [petBusy, setPetBusy] = useState(null)
  const [petError, setPetError] = useState('')

  const makeBuyEquipSkin = (skinId) => async () => {
    const owned = data.ownedItemIds.includes(skinId)
    setPetBusy(skinId); setPetError('')
    try {
      if (!owned) await apiCall('/api/siswa/toko/beli', { method:'POST', body:{ itemId:skinId } })
      await apiCall('/api/siswa/toko/pakai', { method:'POST', body:{ itemId:skinId } })
      await onRefresh(); await refreshMe(); refreshPet()
    } catch (err) { setPetError(err.message) } finally { setPetBusy(null) }
  }

  const activeEventSlugs = new Set(data.activeEvents || [])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22, paddingBottom:24 }}>
      {petError && <div style={{ padding:'8px 12px', borderRadius:10, fontSize:11, background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#F87171' }}>{petError}</div>}
      {VISIBLE_EVENTS.map(ev => {
        const isActive = activeEventSlugs.has(ev.slug)
        const endDate  = isActive ? getEventEndDate(ev, now) : null
        const msLeft   = endDate ? endDate - now : 0
        const upcoming = !isActive ? getUpcomingEvents(now).find(u => u.slug === ev.slug) : null
        const eventItems = data.items.filter(it => it.visual?.eventSlug === ev.slug)
        const missions   = missionData[ev.slug] || []

        return (
          <div key={ev.slug} style={{ borderRadius:16, overflow:'hidden', border:`1px solid ${isActive?ev.accent+'44':'rgba(255,255,255,0.06)'}`, boxShadow:isActive?`0 0 20px ${ev.accent}18`:'none' }}>
            {/* Event header */}
            <div style={{ background:ev.bgGradient, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ fontSize:34, lineHeight:1 }}>{ev.emoji}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:900, color:'#fff', marginBottom:2 }}>{ev.name}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', lineHeight:1.4 }}>{ev.description}</div>
              </div>
              <div style={{ flexShrink:0, textAlign:'right' }}>
                {isActive ? (
                  <>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:`${ev.accent}22`, border:`1px solid ${ev.accent}55`, borderRadius:99, padding:'2px 8px', marginBottom:3 }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:ev.accent, boxShadow:`0 0 6px ${ev.accent}` }} />
                      <span style={{ fontSize:9, fontWeight:900, color:ev.accent, letterSpacing:'0.1em' }}>AKTIF</span>
                    </div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', display:'block' }}>{formatCountdown(msLeft)}</div>
                  </>
                ) : (
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>
                    {upcoming ? `Mulai ${upcoming.nextStart.toLocaleDateString('id-ID',{day:'numeric',month:'short'})}` : 'Tidak aktif'}
                    {upcoming && <div style={{ color:'rgba(255,255,255,0.3)', marginTop:2 }}>{formatDaysUntil(upcoming.nextStart, now)}</div>}
                  </div>
                )}
              </div>
            </div>

            {/* Mission panel (active only) */}
            {isActive && missions.length > 0 && (
              <MissionPanel ev={ev} missions={missions} onClaim={claimMission} claimingId={claimingId} claimError={claimError} />
            )}

            {/* Event items */}
            <div style={{ background:'rgba(10,16,26,0.85)', padding:eventItems.length?'12px 12px':'8px 12px' }}>
              {!isActive && missions.length === 0 && eventItems.length === 0 ? (
                <div style={{ textAlign:'center', padding:'12px 0', color:'#6B7280', fontSize:11 }}>Belum ada item untuk event ini.</div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                  {eventItems.map(item => {
                    const isMissionOnly = item.visual?.missionOnly
                    const owned = data.ownedItemIds.includes(item.id)

                    if (item.kategori === 'pet_skin') {
                      const equippedSkin = data.equipped.pet_skin || 'golden'
                      const skinBusy = petBusy === item.id || busyId === item.id
                      if (!PET_SKIN_INFO[item.id]) return null
                      return (
                        <div key={item.id} style={{ position:'relative' }}>
                          <PetCard skinId={item.id} data={data} equippedSkin={equippedSkin} busyId={skinBusy?item.id:null} onBuyEquip={makeBuyEquipSkin(item.id)} />
                          {isMissionOnly && !owned && (
                            <div style={{ position:'absolute', bottom:8, left:8, right:8, borderRadius:7, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'4px 7px', backdropFilter:'blur(4px)' }}>
                              <span style={{ fontSize:9, fontWeight:900, color:'#F59E0B' }}>🎖️ Hanya via Misi</span>
                            </div>
                          )}
                          {!isActive && <div style={{ position:'absolute', inset:0, borderRadius:16, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'#94A3B8' }}>⏳ Belum dimulai</div>}
                        </div>
                      )
                    }

                    if (!isActive) {
                      return (
                        <div key={item.id} style={{ position:'relative' }}>
                          <ItemCard item={item} data={data} onBuy={()=>{}} onEquip={onEquip} busyId={busyId} />
                          <div style={{ position:'absolute', inset:0, borderRadius:14, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'#94A3B8' }}>⏳ Belum dimulai</div>
                        </div>
                      )
                    }

                    if (isMissionOnly) {
                      return (
                        <div key={item.id} style={{ background:'#1A1D27', borderRadius:14, padding:10, border:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', gap:7 }}>
                          <ItemCard item={item} data={data} onBuy={()=>{}} onEquip={onEquip} busyId={busyId} />
                          {!owned && <div style={{ padding:'6px', borderRadius:8, background:'rgba(245,158,11,0.10)', border:'1px solid rgba(245,158,11,0.22)', textAlign:'center', fontSize:10, fontWeight:800, color:'#F59E0B' }}>🎖️ Selesaikan Misi untuk mendapatkan</div>}
                        </div>
                      )
                    }

                    return <ItemCard key={item.id} item={item} data={data} onBuy={onBuy} onEquip={onEquip} busyId={busyId} />
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LandscapeTokoScreen({ goBack, initialTab }) {
  const { refreshMe } = useAuth()
  const [activeTab, setActiveTab] = useState(initialTab || 'event')
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [busyId, setBusyId]       = useState(null)
  const [notice, setNotice]       = useState(null)

  const toast = (msg, ok = true) => {
    setNotice({ msg, ok })
    setTimeout(() => setNotice(null), 2500)
  }

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const d = await apiCall('/api/siswa/toko')
      setData(d)
    } catch (e) { toast(e.message, false) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const buy = async (item) => {
    if (busyId) return
    setBusyId(item.id)
    try {
      await apiCall('/api/siswa/toko/beli', { method:'POST', body:{ itemId:item.id } })
      toast(`${item.nama} dibeli! 🎉`)
      await refresh()
    } catch (e) { toast(e.message, false) }
    finally { setBusyId(null) }
  }

  const equip = async (item) => {
    if (busyId) return
    setBusyId(item.id)
    try {
      const body = item.id === null ? { itemId:null, kategori:item.kategori } : { itemId:item.id }
      await apiCall('/api/siswa/toko/pakai', { method:'POST', body })
      toast(`${item.nama} dipakai! ✨`)
      await refresh(); await refreshMe()
    } catch (e) { toast(e.message, false) }
    finally { setBusyId(null) }
  }

  const coins = data?.coins ?? 0

  // Render content for right panel
  const renderContent = () => {
    if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#4a5280', fontSize:11 }}>Memuat…</div>
    if (!data)   return null

    if (activeTab === 'pet_skin') return <PetTokoTab data={data} onRefresh={refresh} />
    if (activeTab === 'event')    return <EventTokoTab data={data} onBuy={buy} onEquip={equip} busyId={busyId} onRefresh={refresh} />

    const items = data.items.filter(it => it.kategori === activeTab)
    const isSingle = activeTab === 'spanduk' || activeTab === 'tema'
    return <RarityItemList items={items} data={data} onBuy={buy} onEquip={equip} busyId={busyId} single={isSingle} />
  }

  // Item count in header
  const headerCount = (() => {
    if (!data) return 0
    if (activeTab === 'pet_skin') return null // sub-tabs, no single count
    if (activeTab === 'event') return data.items.filter(it=>it.visual?.eventSlug).length
    return data.items.filter(it=>it.kategori===activeTab).length
  })()

  return (
    <div style={{ width:'100vw', height:'100vh', background:'#0d1117', fontFamily:'system-ui,sans-serif', display:'flex', overflow:'hidden', position:'relative', color:'#f2ede3' }}>

      {/* Toast */}
      {notice && (
        <div style={{ position:'fixed', top:12, left:'50%', transform:'translateX(-50%)', background:notice.ok?'#1c3d29':'#3a1c1c', border:`0.5px solid ${notice.ok?'#5dcaa5':'#e2653f'}`, borderRadius:10, padding:'7px 18px', fontSize:10.5, fontWeight:600, zIndex:200, whiteSpace:'nowrap', color:notice.ok?'#5dcaa5':'#f5c4b3' }}>
          {notice.msg}
        </div>
      )}

      {/* ── PANEL KIRI (nav) ── */}
      <div style={{ width:'min(22%, 200px)', borderRight:'0.5px solid #252f4a', display:'flex', flexDirection:'column', padding:'10px 8px', gap:6, background:'#161b27', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:'#1c2340', border:'0.5px solid #252f4a', display:'flex', alignItems:'center', justifyContent:'center', color:'#8b8f9e', fontSize:13, cursor:'pointer' }} onClick={goBack}>‹</div>
            <span style={{ color:'#f2ede3', fontSize:13, fontWeight:700 }}>Toko</span>
          </div>
          <div style={{ background:'#1c2340', border:'0.5px solid #252f4a', borderRadius:7, padding:'3px 8px', display:'flex', alignItems:'center', gap:3, color:'#fac775', fontSize:10, fontWeight:700 }}>
            🪙 {coins.toLocaleString('id-ID')}
          </div>
        </div>

        {TABS.map(t => {
          const active = t.id === activeTab
          return (
            <div key={t.id} onClick={()=>setActiveTab(t.id)} style={{ borderRadius:8, padding:'7px 10px', display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:10.5, fontWeight:active?700:400, background:active?'rgba(99,102,241,0.18)':'transparent', borderLeft:`3px solid ${active?'#6366f1':'transparent'}`, color:active?'#c4b5fd':'#8b8f9e', transition:'all .15s' }}>
              <span style={{ fontSize:13 }}>{t.icon}</span>
              {KATEGORI_LABELS[t.id] || t.id}
            </div>
          )
        })}

        <div style={{ marginTop:'auto', background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.08))', border:'0.5px solid #252f4a', borderRadius:9, padding:'8px 10px' }}>
          <div style={{ color:'#a5b4fc', fontSize:7.5, fontWeight:700, letterSpacing:0.8, marginBottom:3 }}>SALDO KOIN</div>
          <div style={{ color:'#fac775', fontSize:14, fontWeight:700 }}>🪙 {coins.toLocaleString('id-ID')}</div>
        </div>
      </div>

      {/* ── PANEL KANAN (content) ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px 7px', borderBottom:'0.5px solid #252f4a', flexShrink:0 }}>
          <span style={{ color:'#8b8f9e', fontSize:11, fontWeight:700 }}>{KATEGORI_LABELS[activeTab]}</span>
          {headerCount !== null && <span style={{ color:'#4a5280', fontSize:9 }}>{headerCount} item</span>}
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'12px 14px 16px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
