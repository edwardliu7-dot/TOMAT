import React, { useState, useEffect, useCallback } from 'react'
import { TopBar, PlayerHeader } from '../components/shared'
import { useAuth } from '../AuthContext'
import { usePet } from '../PetContext'
import { usePlayer } from '../PlayerContext'
import { KATEGORI_LABELS, PET_SKIN_INFO, PET_FOOD_CATALOG } from '../shopVisuals'
import PetSVG, { PET_CSS, STATE_ANIMS, getPetName } from '../components/PetSVG'

function useIsDesktop() {
  const [v, setV] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const h = () => setV(window.innerWidth >= 1024)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return v
}

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

const TABS = ['bingkai', 'spanduk', 'tema', 'pet_skin']

// ── Rarity helpers ────────────────────────────────────────────────────────────
function getItemRarity(item) {
  const v = item.visual || {}
  if (v.limited) return 'epik'
  if (v.glow)    return 'langka'
  return 'umum'
}
const RARITY_ORDER  = ['umum', 'langka', 'epik']
const RARITY_LABEL  = { umum: 'Umum', langka: 'Langka', epik: 'Epik' }
const RARITY_COLOR  = { umum: '#94A3B8', langka: '#60A5FA', epik: '#C084FC' }
const RARITY_ICON   = { umum: '◆', langka: '◈', epik: '★' }
const RARITY_BADGE_BG = {
  umum:   'rgba(148,163,184,0.12)',
  langka: 'rgba(96,165,250,0.12)',
  epik:   'rgba(192,132,252,0.14)',
}

function ItemVisual({ item }) {
  const luxury = item.visual?.luxury
  // For luxury frames that now have a PNG image, use the shared image-frame renderer
  if ((luxury === 'aurum' || luxury === 'void') && item.visual?.image) {
    const v = item.visual
    const outer = 110
    const sf = v.spread ?? 0.30
    const photoSz = Math.round(outer / (1 + 2 * sf))
    const isEpic = Boolean(v.limited)
    const glowFilter = `drop-shadow(0 0 ${Math.round(outer * 0.16)}px ${v.border}ee) drop-shadow(0 0 ${Math.round(outer * 0.07)}px ${v.border}88)`
    return (
      <div style={{ width: '100%', height: 150, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: luxury === 'aurum' ? 'radial-gradient(circle at 50% 40%,rgba(212,175,55,0.12),transparent 60%),#0a0906' : 'radial-gradient(circle at 50% 40%,rgba(99,102,241,0.14),transparent 60%),#04040a', position: 'relative', overflow: 'hidden' }}>
        {isEpic && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 8, boxShadow: `inset 0 0 40px ${v.border}22`, pointerEvents: 'none' }} />
        )}
        <div style={{ position: 'relative', width: outer, height: outer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isEpic && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `0 0 ${Math.round(outer * 0.25)}px ${v.border}55`, animation: 'tomat-frame-glow-pulse 2.4s ease-in-out infinite', pointerEvents: 'none' }} />
          )}
          <div style={{ width: photoSz, height: photoSz, borderRadius: '50%', background: 'linear-gradient(135deg,#1a1a2e,#0d0d1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(photoSz * 0.45), position: 'relative', zIndex: 1 }}>🧑‍🎓</div>
          <img src={v.image} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', zIndex: 5, mixBlendMode: v.mixBlend ?? 'normal', filter: glowFilter }} />
        </div>
      </div>
    )
  }
  if ((luxury === 'aurum' || luxury === 'void') && !item.visual?.image) {
    const isAurum = luxury === 'aurum'
    return isAurum ? (
      <div style={{ width: '100%', height: 150, borderRadius: 8, padding: 1, background: 'linear-gradient(145deg,#fff5b8,#d4af37 22%,#2a220b 52%,#aa7c11)', boxShadow: '0 12px 26px rgba(212,175,55,0.18)' }}>
        <div style={{ height: '100%', borderRadius: 7, background: 'radial-gradient(circle at 50% 32%,rgba(212,175,55,.28),transparent 45%),#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#e8d08c', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(212,175,55,.45)' }} />
          <div style={{ fontSize: 42, lineHeight: 1, filter: 'drop-shadow(0 0 10px rgba(212,175,55,.5))' }}>♛</div>
          <div style={{ marginTop: 10, fontSize: 9, letterSpacing: 2.2, fontWeight: 800 }}>AURUM SOVEREIGN</div>
        </div>
      </div>
    ) : (
      <div style={{ width: '100%', height: 150, borderRadius: 8, background: 'radial-gradient(circle at 50% 22%,rgba(79,70,229,.24),transparent 46%),#040406', border: '1px solid #2a2a3a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc', boxShadow: '0 12px 30px rgba(49,46,129,.2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 112, height: 112, border: '1px dashed rgba(99,102,241,.35)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', width: 78, height: 78, border: '1px solid rgba(129,140,248,.3)', borderRadius: '50%' }} />
        <div style={{ fontSize: 38, lineHeight: 1, zIndex: 1, filter: 'drop-shadow(0 0 12px rgba(99,102,241,.8))' }}>◈</div>
        <div style={{ marginTop: 12, fontSize: 9, letterSpacing: 2, fontWeight: 800, zIndex: 1 }}>VOID MONARCH</div>
      </div>
    )
  }
  if (luxury === 'celestia' || luxury === 'royal') {
    const celestial = luxury === 'celestia'
    return (
      <div style={{ width: '100%', height: 116, borderRadius: 12, background: celestial ? 'linear-gradient(145deg,#0f172a,#030712 72%)' : 'linear-gradient(145deg,#0d1222,#05070c 72%)', border: `1px solid ${celestial ? 'rgba(96,165,250,.35)' : 'rgba(212,175,55,.3)'}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', position: 'relative', overflow: 'hidden', boxShadow: celestial ? '0 12px 28px rgba(37,99,235,.16)' : '0 12px 28px rgba(212,175,55,.12)' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', flexShrink: 0, border: `1px ${celestial ? 'solid' : 'dashed'} ${celestial ? 'rgba(147,197,253,.55)' : 'rgba(212,175,55,.55)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: celestial ? '#bfdbfe' : '#d4af37', fontSize: 30, boxShadow: celestial ? '0 0 28px rgba(96,165,250,.24)' : '0 0 24px rgba(212,175,55,.2)' }}>{celestial ? '✦' : '◇'}</div>
        <div style={{ minWidth: 0, position: 'relative', zIndex: 1 }}>
          <div style={{ color: celestial ? '#dbeafe' : '#f5e7b2', fontSize: 13, fontWeight: 700, letterSpacing: .5 }}>{celestial ? 'PIJAR BINTANG' : 'DEKRIT MAHAGURU'}</div>
          <div style={{ color: celestial ? '#93c5fd' : '#d4af37', fontSize: 9, letterSpacing: 1.4, marginTop: 6, fontWeight: 800 }}>{celestial ? 'COSMIC RELIC' : 'ACADEMIC ROYALTY'}</div>
        </div>
      </div>
    )
  }
  if (item.kategori === 'bingkai') {
    const v = item.visual || {}
    if (v.image) {
      const outer = 80
      const sf = v.spread ?? 0.45
      const photoSz = Math.round(outer / (1 + 2 * sf))
      return (
        <div style={{ position: 'relative', width: outer, height: outer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: photoSz, height: photoSz, borderRadius: '50%', background: '#1E2128', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(photoSz * 0.45), position: 'relative', zIndex: 1 }}>🧑‍🎓</div>
          <img src={v.image} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', zIndex: 3, mixBlendMode: v.mixBlend ?? 'normal', filter: v.glow ? `drop-shadow(0 0 6px ${v.border}bb)` : 'none' }} />
        </div>
      )
    }
    return (
      <div style={{ width: 76, height: 76, borderRadius: '50%', border: `4px ${v.style || 'solid'} ${v.border || '#67E8F9'}`, boxShadow: v.glow ? `0 0 16px ${v.border}88` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
        <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#1E2128', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🧑‍🎓</div>
      </div>
    )
  }
  if (item.kategori === 'spanduk') {
    const v = item.visual || {}
    return <div style={{ width: '100%', height: 64, borderRadius: 12, background: v.gradient || '#334155', boxShadow: v.glow ? '0 0 20px rgba(212,175,55,0.3)' : 'none', border: v.limited ? '1px solid rgba(212,175,55,0.55)' : 'none' }} />
  }

  if (item.kategori === 'tema') {
    const v = item.visual || {}
    const sw = v.swatches || []
    return (
      <div style={{ width: '100%', height: 80, borderRadius: 12, overflow: 'hidden', position: 'relative', background: v.gradient || '#1A1D27', border: v.limited ? `1px solid ${v.accent}44` : '1px solid rgba(255,255,255,0.08)', boxShadow: v.glow ? `0 0 18px ${v.accent}33` : 'none' }}>
        {/* glow orb */}
        {v.accent && <div style={{ position: 'absolute', width: 70, height: 70, borderRadius: '50%', background: v.accent, filter: 'blur(34px)', opacity: 0.22, top: '-30%', left: '28%', pointerEvents: 'none' }} />}
        {/* dot particles */}
        {[12,28,42,56,72,85].map((x, i) => (
          <div key={i} style={{ position: 'absolute', width: 1.5, height: 1.5, borderRadius: '50%', background: '#fff', opacity: 0.18 + i * 0.04, left: `${x}%`, top: `${10 + i * 12}%` }} />
        ))}
        {/* swatches */}
        <div style={{ position: 'absolute', bottom: 7, left: 10, display: 'flex', gap: 5 }}>
          {sw.map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.18)', flexShrink: 0 }} />)}
        </div>
      </div>
    )
  }

  return <div style={{ width: 76, height: 76, borderRadius: 12, background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>❔</div>
}

const REVIVE_COST = 300

function PetCard({ skinId, data, equippedSkin, busyId, onBuyEquip, wide = false }) {
  const info = PET_SKIN_INFO[skinId]
  if (!info) return null
  const owned = skinId === 'golden' || data.ownedItemIds.includes(skinId)
  const prerequisiteOwned = !info.prerequisitePetId || data.ownedItemIds.includes(info.prerequisitePetId)
  const equipped = equippedSkin === skinId
  const shopItem = data.items.find(it => it.id === skinId)
  const affordable = skinId === 'golden' || (shopItem && data.coins >= shopItem.harga)
  const canBuy = prerequisiteOwned && affordable
  const busy = busyId === skinId
  return (
    <div style={{
      background: info.glow ? `radial-gradient(ellipse at 50% 0%,${info.glow},transparent 65%),#1A1D27` : '#1A1D27',
      border: `1.5px solid ${equipped ? info.tierColor : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 18, padding: wide ? '16px 20px' : '16px 12px',
      display: 'flex', flexDirection: wide ? 'row' : 'column',
      alignItems: 'center', gap: wide ? 16 : 10,
      position: 'relative',
      boxShadow: equipped ? `0 0 24px ${info.glow || 'rgba(245,166,35,0.2)'}` : 'none',
    }}>
      {equipped && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: info.tierColor, color: ['#F59E0B','#34D399'].includes(info.tierColor) ? '#000' : '#fff', fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: '0 16px 0 10px' }}>
          DIPAKAI
        </div>
      )}
      <div style={{ animation: STATE_ANIMS.idle, transformOrigin: 'center bottom', flexShrink: 0 }}>
        <PetSVG state="idle" skinId={skinId} size={wide ? 88 : 80} />
      </div>
      <div style={{ textAlign: wide ? 'left' : 'center', flex: wide ? 1 : undefined, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: info.tierColor, letterSpacing: '0.15em', marginBottom: 2 }}>{info.tier}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{info.nama}</div>
        <div style={{ fontSize: 10, color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>{info.desc}</div>
        {wide && (
          <div style={{ marginTop: 10 }}>
            {equipped ? (
              <div style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: 11, fontWeight: 700, display: 'inline-block' }}>✓ Terpasang</div>
            ) : owned ? (
              <button onClick={() => onBuyEquip(skinId)} disabled={busy} style={{ padding: '8px 20px', borderRadius: 10, background: '#334155', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{busy ? '…' : 'Pakai'}</button>
            ) : (
              <button onClick={() => onBuyEquip(skinId)} disabled={!canBuy || busy} title={!prerequisiteOwned ? `Miliki ${PET_SKIN_INFO[info.prerequisitePetId]?.nama || 'pet dasar'} terlebih dahulu` : undefined} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: canBuy ? 'pointer' : 'not-allowed', fontFamily: 'inherit', background: canBuy ? `linear-gradient(135deg,${info.tierColor},${info.tierColor}cc)` : 'rgba(248,113,113,0.15)', color: canBuy ? (info.tierColor === '#34D399' ? '#000' : '#fff') : '#F87171' }}>
                {busy ? '…' : !prerequisiteOwned ? `🔒 Miliki ${PET_SKIN_INFO[info.prerequisitePetId]?.nama || 'pet dasar'} dulu` : canBuy ? `Beli 🪙 ${shopItem?.harga?.toLocaleString('id-ID')}` : `🔒 🪙 ${shopItem?.harga?.toLocaleString('id-ID')}`}
              </button>
            )}
          </div>
        )}
      </div>
      {!wide && (
        equipped ? (
          <div style={{ width: '100%', padding: '8px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: 11, fontWeight: 700, textAlign: 'center' }}>✓ Terpasang</div>
        ) : owned ? (
          <button onClick={() => onBuyEquip(skinId)} disabled={busy} style={{ width: '100%', padding: '8px', borderRadius: 10, background: '#334155', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{busy ? '…' : 'Pakai'}</button>
        ) : (
          <button onClick={() => onBuyEquip(skinId)} disabled={!canBuy || busy} title={!prerequisiteOwned ? `Miliki ${PET_SKIN_INFO[info.prerequisitePetId]?.nama || 'pet dasar'} terlebih dahulu` : undefined} style={{ width: '100%', padding: '8px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: canBuy ? 'pointer' : 'not-allowed', fontFamily: 'inherit', background: canBuy ? '#6366F1' : 'rgba(248,113,113,0.15)', color: canBuy ? '#fff' : '#F87171' }}>
            {busy ? '…' : !prerequisiteOwned ? `🔒 Miliki ${PET_SKIN_INFO[info.prerequisitePetId]?.nama || 'pet dasar'} dulu` : canBuy ? `Beli 🪙 ${shopItem?.harga?.toLocaleString('id-ID')}` : `🔒 🪙 ${shopItem?.harga?.toLocaleString('id-ID')}`}
          </button>
        )
      )}
    </div>
  )
}

// ── Rarity config for pet grouping ──────────────────────────────────────────
const PET_RARITY_GROUPS = [
  {
    id: 'umum',
    label: 'Umum',
    icon: '◆',
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.10)',
    border: 'rgba(148,163,184,0.22)',
    skins: ['golden', 'pet_skin_silver', 'pet_kelinsay', 'pet_kelinsay_senja'],
  },
  {
    id: 'langka',
    label: 'Langka',
    icon: '◈',
    color: '#FB923C',
    bg: 'rgba(251,146,60,0.10)',
    border: 'rgba(251,146,60,0.22)',
    skins: ['pet_kelinsay_malam', 'pet_skin_void', 'pet_monyong_kosmik', 'pet_nananaga', 'pet_nananaga_merah', 'pet_nananaga_es'],
  },
  {
    id: 'epic',
    label: 'Epic',
    icon: '★',
    color: '#C084FC',
    bg: 'rgba(192,132,252,0.12)',
    border: 'rgba(192,132,252,0.25)',
    skins: ['pet_skin_cosmic', 'pet_monyong', 'pet_monyong_raja'],
  },
]

function PetTokoTab({ data, onRefresh, setError }) {
  const { pet, feedPet, revivePet, refreshPet } = usePet()
  const { refreshMe } = useAuth()
  const [busyId, setBusyId] = useState(null)
  const [localError, setLocalError] = useState('')
  const [feedSuccess, setFeedSuccess] = useState('')

  const equippedSkin  = data.equipped.pet_skin || 'golden'
  const activePetName = getPetName(equippedSkin)

  const buyEquipSkin = async (skinId) => {
    if (skinId === 'golden') return
    const item = data.items.find(it => it.id === skinId)
    if (!item) return
    const owned = data.ownedItemIds.includes(skinId)
    setBusyId(skinId); setLocalError('')
    try {
      if (!owned) await apiCall('/api/siswa/toko/beli', { method: 'POST', body: { itemId: skinId } })
      await apiCall('/api/siswa/toko/pakai', { method: 'POST', body: { itemId: skinId } })
      await onRefresh(); await refreshMe(); refreshPet()
    } catch (err) { setLocalError(err.message) } finally { setBusyId(null) }
  }

  const buyFood = async (foodId) => {
    setBusyId(foodId); setLocalError(''); setFeedSuccess('')
    const result = await feedPet(foodId)
    if (result.ok) { setFeedSuccess(`🐾 ${activePetName} sudah makan!`); await onRefresh(); await refreshMe(); setTimeout(() => setFeedSuccess(''), 3000) }
    else setLocalError(result.error)
    setBusyId(null)
  }

  const doRevive = async () => {
    setBusyId('revive'); setLocalError(''); setFeedSuccess('')
    const result = await revivePet()
    if (result.ok) { setFeedSuccess('🐾 Pet baru sudah diadopsi!'); await onRefresh(); await refreshMe(); setTimeout(() => setFeedSuccess(''), 4000) }
    else setLocalError(result.error)
    setBusyId(null)
  }

  const hungerColor = pet.isDead ? '#EF4444' : pet.hunger < 30 ? '#F59E0B' : '#F5A623'
  const hungerLabel = pet.isDead ? '💀 Mati' : pet.isStarving ? '😩 Lapar sekali' : pet.hunger < 50 ? '😕 Agak lapar' : '😊 Kenyang'

  return (
    <div style={{ paddingBottom: 40 }}>
      <style>{PET_CSS}</style>

      {/* ── Active pet status ── */}
      <div style={{ margin: '0 0 20px', background: 'linear-gradient(160deg,#0d1b2a,#1a0d2e)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20, padding: 20, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        <div style={{ animation: STATE_ANIMS[pet.isDead ? 'dead' : pet.isStarving ? 'hungry' : 'idle'], transformOrigin: 'center bottom' }}>
          <PetSVG state={pet.isDead ? 'dead' : pet.isStarving ? 'hungry' : 'idle'} skinId={equippedSkin} size={96} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#F7C55E', marginBottom: 4 }}>{activePetName}</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 10 }}>{hungerLabel}</div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#64748B' }}>🌾 Kenyang</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: hungerColor }}>{pet.hunger}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ width: `${pet.hunger}%`, height: '100%', borderRadius: 99, background: pet.hunger > 50 ? 'linear-gradient(90deg,#F5A623,#F7C55E)' : pet.hunger > 25 ? 'linear-gradient(90deg,#F59E0B,#EF4444)' : '#EF4444', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </div>
      </div>

      {(localError || feedSuccess) && (
        <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 12, fontSize: 13, background: feedSuccess ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${feedSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: feedSuccess ? '#34D399' : '#F87171' }}>
          {feedSuccess || localError}
        </div>
      )}

      {/* ── Rarity groups ── */}
      {PET_RARITY_GROUPS.map(group => (
        <div key={group.id} style={{ marginBottom: 28 }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: group.bg, border: `1px solid ${group.border}`, borderRadius: 99, padding: '3px 10px' }}>
              <span style={{ fontSize: 10, color: group.color }}>{group.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 900, color: group.color, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{group.label}</span>
            </div>
            <div style={{ flex: 1, height: 1, background: `${group.color}28` }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: group.color + '88' }}>{group.skins.length} skin</span>
          </div>
          {/* Skin cards in 2-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {group.skins.map(skinId => (
              <PetCard key={skinId} skinId={skinId} data={data} equippedSkin={equippedSkin} busyId={busyId} onBuyEquip={buyEquipSkin} />
            ))}
          </div>
        </div>
      ))}

      {/* ── Dead / revive block ── */}
      {pet.isDead && (
        <div style={{ marginBottom: 24, borderRadius: 18, background: 'linear-gradient(145deg,#1a0000,#2d0a0a)', border: '2px solid rgba(239,68,68,0.4)', padding: '20px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>💀</div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#F87171', marginBottom: 6 }}>{activePetName} sudah mati!</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16, lineHeight: 1.6 }}>{activePetName} tidak bisa diberi makan lagi. Kamu perlu mengadopsi pet baru untuk melanjutkan perjalanan!</div>
          <div style={{ fontSize: 13, color: '#FCA5A5', marginBottom: 16 }}>Biaya adopsi: <strong style={{ color: '#F87171', fontSize: 16 }}>🪙 {REVIVE_COST}</strong>{data.coins < REVIVE_COST && <span style={{ color: '#6B7280', fontSize: 11, display: 'block', marginTop: 4 }}>(Kamu punya 🪙 {data.coins} — perlu {REVIVE_COST - data.coins} lagi)</span>}</div>
          <button onClick={doRevive} disabled={data.coins < REVIVE_COST || busyId === 'revive'} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 900, cursor: data.coins >= REVIVE_COST ? 'pointer' : 'not-allowed', fontFamily: 'inherit', background: data.coins >= REVIVE_COST ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'rgba(248,113,113,0.1)', color: data.coins >= REVIVE_COST ? '#fff' : '#F87171', outline: data.coins >= REVIVE_COST ? 'none' : '1px solid rgba(248,113,113,0.2)' }}>
            {busyId === 'revive' ? '…' : data.coins >= REVIVE_COST ? '🐾 Adopsi Pet Baru' : '🔒 Koin tidak cukup'}
          </button>
        </div>
      )}

      {/* ── Food shop ── */}
      <div style={{ fontSize: 11, color: '#34D399', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>🌾 Toko Makanan Pet</div>
      {pet.isDead ? (
        <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(239,68,68,0.07)', border: '1px dashed rgba(239,68,68,0.3)', textAlign: 'center', fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
          🚫 Makanan tidak bisa diberikan ke pet yang sudah mati.<br />Adopsi dulu pet baru di atas!
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>Semakin mahal makanannya, semakin lama {activePetName} kenyang. Memberi makan langsung meningkatkan stamina petmu.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {PET_FOOD_CATALOG.map(food => {
              const affordable = data.coins >= food.harga
              const busy = busyId === food.id
              return (
                <div key={food.id} style={{ background: '#1A1D27', border: `1px solid ${food.color}22`, borderRadius: 16, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 38 }}>{food.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#fff', textAlign: 'center' }}>{food.nama}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>Kenyang {food.dur}</div>
                  <div style={{ fontWeight: 900, fontSize: 14, color: food.color }}>🪙 {food.harga}</div>
                  <button onClick={() => buyFood(food.id)} disabled={!affordable || busy} style={{ width: '100%', padding: '8px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: affordable ? 'pointer' : 'not-allowed', fontFamily: 'inherit', background: affordable ? `${food.color}22` : 'rgba(248,113,113,0.1)', color: affordable ? food.color : '#F87171', outline: `1px solid ${affordable ? food.color + '44' : 'rgba(248,113,113,0.2)'}` }}>
                    {busy ? '…' : affordable ? 'Beri Makan' : '🔒 Koin kurang'}
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ── Deterministic dot positions for tema preview strip ──────────────────────
const TEMA_DOTS = Array.from({ length: 14 }, (_, i) => ({
  left: ((i * 137.5 + 11) % 100).toFixed(1),
  top:  ((i * 83.7  +  7) % 100).toFixed(1),
  size: (1 + (i % 3) * 0.5).toFixed(1),
  op:   (0.18 + (i % 4) * 0.08).toFixed(2),
}))

const DEFAULT_TEMA_ENTRY = {
  id:       null,
  nama:     'Default',
  kategori: 'tema',
  harga:    0,
  visual: {
    gradient:    'linear-gradient(135deg,#071321,#0d1b2e)',
    accent:      '#22d3ee',
    swatches:    ['#071321','#0d1b2e','#22d3ee','#818cf8'],
    description: 'Tema bawaan TOMAT — biru galaksi & cyan.',
    limited:     false,
  },
}

function TemaCard({ tema, isEquipped, owned, affordable, busy, onAction }) {
  const v = tema.visual || {}
  const accent = v.accent || '#22d3ee'
  const isDefault = tema.id === null
  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden', border: `1px solid ${isEquipped ? accent + '55' : 'rgba(255,255,255,0.07)'}`,
      boxShadow: isEquipped ? `0 0 20px ${accent}22` : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      {/* ── Preview strip ── */}
      <div style={{ height: 64, position: 'relative', overflow: 'hidden', background: v.gradient || '#071321' }}>
        {/* Dot particles */}
        {TEMA_DOTS.map((d, i) => (
          <div key={i} style={{ position: 'absolute', borderRadius: '50%', background: '#fff', pointerEvents: 'none',
            left: `${d.left}%`, top: `${d.top}%`, width: `${d.size}px`, height: `${d.size}px`, opacity: d.op }} />
        ))}
        {/* Glow orb */}
        <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: accent,
          filter: 'blur(36px)', opacity: 0.28, top: '-35%', left: '20%', pointerEvents: 'none' }} />
        {/* Swatches */}
        <div style={{ position: 'absolute', bottom: 8, left: 12, display: 'flex', gap: 5 }}>
          {(v.swatches || []).map((c, i) => (
            <div key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: c,
              border: '1px solid rgba(255,255,255,0.22)', flexShrink: 0 }} />
          ))}
        </div>
        {/* Badges */}
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
          {v.limited && !isEquipped && (
            <div style={{ background: 'rgba(234,179,8,0.9)', color: '#422006', fontSize: 9, fontWeight: 900,
              padding: '3px 7px', borderRadius: 99, letterSpacing: 0.5 }}>★ LIMITED</div>
          )}
          {isEquipped && (
            <div style={{ background: accent, color: '#000', fontSize: 9, fontWeight: 900,
              padding: '3px 7px', borderRadius: 99 }}>✓ DIPAKAI</div>
          )}
          {!isEquipped && !isDefault && (
            <div style={{ background: `${accent}22`, border: `1px solid ${accent}44`, color: accent,
              fontSize: 9, fontWeight: 900, padding: '3px 7px', borderRadius: 99 }}>
              🪙 {tema.harga.toLocaleString('id-ID')}
            </div>
          )}
          {isDefault && !isEquipped && (
            <div style={{ background: 'rgba(148,163,184,0.15)', border: '1px solid rgba(148,163,184,0.3)',
              color: '#94A3B8', fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 99 }}>GRATIS</div>
          )}
        </div>
      </div>

      {/* ── Card body ── */}
      <div style={{ background: 'rgba(255,255,255,0.025)', padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tema.nama}
          </div>
          {v.description && (
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 3, lineHeight: 1.4 }}>{v.description}</div>
          )}
        </div>
        <button
          onClick={onAction}
          disabled={busy || isEquipped || (!owned && !affordable)}
          style={{
            flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: 'none',
            fontSize: 11, fontWeight: 900, cursor: (busy || isEquipped || (!owned && !affordable)) ? 'default' : 'pointer',
            fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s',
            ...(isEquipped
              ? { background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }
              : owned || isDefault
              ? { background: '#4F46E5', color: '#fff', boxShadow: '0 0 12px rgba(99,102,241,0.3)' }
              : affordable
              ? { background: '#EAB308', color: '#1a1000', boxShadow: '0 0 12px rgba(234,179,8,0.3)' }
              : { background: 'rgba(255,255,255,0.05)', color: '#475569', cursor: 'not-allowed' })
          }}
        >
          {busy ? '…'
            : isEquipped ? '✓ Aktif'
            : (owned || isDefault) ? 'Pakai'
            : affordable ? `Beli`
            : '🔒 Kurang'}
        </button>
      </div>
    </div>
  )
}

function TemaTokoTab({ data, onBuy, onEquip, busyId, onRefresh, refreshMe, setError }) {
  const [defaultBusy, setDefaultBusy] = useState(false)

  const temaItems  = data.items.filter(it => it.kategori === 'tema')
  const equippedId = data.equipped.tema   // null → default is active
  const allTemas   = [DEFAULT_TEMA_ENTRY, ...temaItems]

  const equipDefault = async () => {
    if (equippedId === null) return
    setDefaultBusy(true); setError('')
    try {
      await apiCall('/api/siswa/toko/pakai', { method: 'POST', body: { itemId: null } })
      await onRefresh(); await refreshMe()
    } catch (err) { setError(err.message) }
    finally { setDefaultBusy(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {allTemas.map(tema => {
        const isDefault = tema.id === null
        const isEquipped = isDefault ? equippedId === null : equippedId === tema.id
        const owned = isDefault || data.ownedItemIds.includes(tema.id)
        const affordable = isDefault || data.coins >= tema.harga
        const busy = isDefault ? defaultBusy : busyId === tema.id

        const onAction = isDefault
          ? equipDefault
          : owned
          ? () => onEquip(tema)
          : () => onBuy(tema)

        return (
          <TemaCard
            key={tema.id ?? 'default'}
            tema={tema}
            isEquipped={isEquipped}
            owned={owned}
            affordable={affordable}
            busy={busy}
            onAction={onAction}
          />
        )
      })}

      {/* Info banner */}
      <div style={{ borderRadius: 16, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)',
        padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 4 }}>
        <span style={{ fontSize: 15, flexShrink: 0 }}>🎨</span>
        <p style={{ fontSize: 11, color: 'rgba(165,180,252,0.75)', lineHeight: 1.6, margin: 0 }}>
          Tema mengubah tampilan <strong style={{ color: '#C4B5FD' }}>layar permainan</strong> — warna latar, efek cahaya, dan partikel. Profil &amp; toko tidak terpengaruh.
        </p>
      </div>
      <div style={{ height: 8 }} />
    </div>
  )
}

function ItemCard({ item, data, onBuy, onEquip, busyId }) {
  const owned = data.ownedItemIds.includes(item.id)
  const equipped = data.equipped[item.kategori] === item.id
  const affordable = data.coins >= item.harga
  const busy = busyId === item.id
  return (
    <div style={{ background: '#1A1D27', borderRadius: 16, padding: 14, border: `1px solid ${equipped ? 'rgba(234,179,8,0.4)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative' }}>
      {equipped && <div style={{ position: 'absolute', top: 0, right: 0, background: '#EAB308', color: '#000', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: '0 14px 0 10px' }}>DIPAKAI</div>}
      {item.visual?.limited && !equipped && <div style={{ position: 'absolute', top: 0, left: 0, background: 'linear-gradient(90deg,#D4AF37,#F8E7A1)', color: '#21180a', fontSize: 9, fontWeight: 900, letterSpacing: 0.7, padding: '4px 7px', borderRadius: '14px 0 10px 0' }}>LIMITED</div>}
      <ItemVisual item={item} />
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center' }}>{item.nama}</div>
      {item.visual?.edition && <div style={{ fontSize: 10, color: '#D4AF37', fontWeight: 800, letterSpacing: 0.8 }}>EDISI {item.visual.edition}</div>}
      {item.visual?.description && <div style={{ fontSize: 10, lineHeight: 1.35, color: '#94A3B8', textAlign: 'center' }}>{item.visual.description}</div>}
      {equipped ? (
        <button disabled style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: 'none', fontSize: 12, fontWeight: 700 }}>✓ Terpasang</button>
      ) : owned ? (
        <button onClick={() => onEquip(item)} disabled={busy} style={{ width: '100%', padding: '9px 0', borderRadius: 10, background: '#334155', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{busy ? '…' : 'Pakai'}</button>
      ) : (
        <button onClick={() => onBuy(item)} disabled={!affordable || busy} style={{ width: '100%', padding: '9px 0', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: affordable ? 'pointer' : 'not-allowed', fontFamily: 'inherit', background: affordable ? '#6366F1' : 'rgba(248,113,113,0.15)', color: affordable ? '#fff' : '#F87171' }}>
          {busy ? '…' : affordable ? `Beli 🪙 ${item.harga.toLocaleString('id-ID')}` : `🔒 🪙 ${item.harga.toLocaleString('id-ID')}`}
        </button>
      )}
    </div>
  )
}

export default function ShopScreen({ goBack, initialTab }) {
  const { refreshMe } = useAuth()
  const isDesktop = useIsDesktop()
  const [tab, setTab] = useState(initialTab || 'bingkai')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const refresh = useCallback(async () => {
    try { setData(await apiCall('/api/siswa/toko')) }
    catch (err) { setError(err.message) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const buy = async (item) => {
    setError(''); setBusyId(item.id)
    try { await apiCall('/api/siswa/toko/beli', { method: 'POST', body: { itemId: item.id } }); await refresh() }
    catch (err) { setError(err.message) } finally { setBusyId(null) }
  }

  const equip = async (item) => {
    setError(''); setBusyId(item.id)
    try { await apiCall('/api/siswa/toko/pakai', { method: 'POST', body: { itemId: item.id } }); await refresh(); await refreshMe() }
    catch (err) { setError(err.message) } finally { setBusyId(null) }
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: '#071321' }}>
        <PlayerHeader />
        <TopBar title="Toko 🛒" onBack={goBack} accentColor="#818CF8" />
        <div style={{ padding: 24, color: '#94A3B8', textAlign: 'center' }}>{error || 'Memuat…'}</div>
      </div>
    )
  }

  const items = data.items.filter(it => it.kategori === tab)

  // ── Coin balance ──
  const CoinBar = () => (
    <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 11, color: '#A5B4FC', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Saldo Koin</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>🪙 {data.coins.toLocaleString('id-ID')}</div>
      </div>
    </div>
  )

  // ── Item grid ──
  const ItemGrid = () => {
    if (tab === 'pet_skin') return <PetTokoTab data={data} onRefresh={refresh} setError={setError} />
    if (tab === 'tema') return <TemaTokoTab data={data} onBuy={buy} onEquip={equip} busyId={busyId} onRefresh={refresh} refreshMe={refreshMe} setError={setError} />
    if (items.length === 0) return (
      <div style={{ textAlign: 'center', padding: '40px 16px', color: '#6B7280' }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
        <div style={{ fontWeight: 700, color: '#94A3B8' }}>Segera Hadir</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>Item baru untuk kategori ini sedang disiapkan.</div>
      </div>
    )

    // Group and sort items by rarity
    const grouped = {}
    for (const r of RARITY_ORDER) grouped[r] = []
    for (const item of items) grouped[getItemRarity(item)].push(item)
    const activeRarities = RARITY_ORDER.filter(r => grouped[r].length > 0)

    const cols = (tab === 'spanduk' || tab === 'tema') ? '1fr' : isDesktop ? 'repeat(3,1fr)' : 'repeat(2,1fr)'

    return (
      <div>
        {activeRarities.map(rarity => (
          <div key={rarity} style={{ marginBottom: 28 }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: RARITY_BADGE_BG[rarity],
                border: `1px solid ${RARITY_COLOR[rarity]}44`,
                borderRadius: 99, padding: '3px 10px',
              }}>
                <span style={{ fontSize: 10, color: RARITY_COLOR[rarity] }}>{RARITY_ICON[rarity]}</span>
                <span style={{ fontSize: 10, fontWeight: 900, color: RARITY_COLOR[rarity], letterSpacing: '0.15em', textTransform: 'uppercase' }}>{RARITY_LABEL[rarity]}</span>
              </div>
              <div style={{ flex: 1, height: 1, background: `${RARITY_COLOR[rarity]}2a` }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: RARITY_COLOR[rarity] + '88' }}>{grouped[rarity].length} item</span>
            </div>
            {/* Item cards */}
            <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12 }}>
              {grouped[rarity].map(item => (
                <ItemCard key={item.id} item={item} data={data} onBuy={buy} onEquip={equip} busyId={busyId} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isDesktop) {
    return (
      <div style={{
        minHeight: '100vh', background: '#071321',
        backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(79,70,229,.12), transparent 34%), radial-gradient(circle at 100% 70%, rgba(6,182,212,.06), transparent 32%)',
      }}>
        <TopBar title="Toko 🛒" onBack={goBack} accentColor="#818CF8" />
        <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: '16px var(--page-pad) 40px' }}>
          <CoinBar />
          {error && <div style={{ marginBottom: 12, color: '#F87171', fontSize: 13 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            {/* Category sidebar */}
             <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, padding: 10, borderRadius: 18, background: 'rgba(10,22,40,.68)', border: '1px solid rgba(99,102,241,.12)' }}>
               <div style={{ fontSize: 10, color: '#58718A', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 10px 8px' }}>Kategori</div>
              {TABS.map(t => (
                 <button key={t} onClick={() => setTab(t)} style={{ width: '100%', padding: '12px 10px', borderRadius: 11, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', background: tab === t ? 'rgba(99,102,241,0.18)' : 'transparent', borderLeft: `3px solid ${tab === t ? '#818CF8' : 'transparent'}`, color: tab === t ? '#C4B5FD' : '#94A3B8', fontSize: 13, fontWeight: 800, transition: 'all 0.15s' }}>
                  {KATEGORI_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Item content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 14 }}>{KATEGORI_LABELS[tab]}</div>
              <ItemGrid />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Mobile layout ──
  return (
     <div style={{ minHeight: '100vh', background: '#071321', backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(79,70,229,.12), transparent 42%)' }}>
      <PlayerHeader />
      <TopBar title="Toko 🛒" onBack={goBack} accentColor="#818CF8" />
      <div style={{ margin: '0 16px 16px' }}>
        <CoinBar />
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: '0 0 auto', padding: '10px 16px', borderRadius: 999, border: tab === t ? '1px solid rgba(129,140,248,.5)' : '1px solid rgba(99,102,241,.12)', cursor: 'pointer', fontSize: 12, fontWeight: 800, fontFamily: 'inherit', whiteSpace: 'nowrap', background: tab === t ? '#6366F1' : '#0E1E35', color: tab === t ? '#fff' : '#94A3B8', boxShadow: tab === t ? '0 4px 16px rgba(99,102,241,.25)' : 'none' }}>{KATEGORI_LABELS[t]}</button>
        ))}
      </div>
      {error && <div style={{ margin: '0 16px 12px', color: '#F87171', fontSize: 13 }}>{error}</div>}
      <div style={{ padding: tab === 'pet_skin' ? '0 16px' : '0 16px 32px', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
        <ItemGrid />
      </div>
    </div>
  )
}
