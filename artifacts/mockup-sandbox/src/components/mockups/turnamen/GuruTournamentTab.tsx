import { useState } from 'react'

const GAMES = [
  { key: 'katak', label: '🐸 Katak Pelompat' },
  { key: 'termometer', label: '🌡️ Termometer' },
  { key: 'pabrikrobot', label: '🤖 Pabrik Robot' },
  { key: 'gembok', label: '🔒 Gembok Roda Gigi' },
  { key: 'mercusuar', label: '🏮 Mercusuar' },
]

const mockTournament = {
  id: 't1', kelas: 'VII A', gameKey: 'katak', status: 'in-progress', currentRound: 2,
  rounds: [
    {
      label: 'Ronde 1',
      matches: [
        { id: 'm1', p1: 'Andi S.', p2: 'Budi K.', winner: 'Andi S.', status: 'finished', scores: { 'Andi S.': 5, 'Budi K.': 3 } },
        { id: 'm2', p1: 'Cika R.', p2: 'Dian P.', winner: 'Cika R.', status: 'finished', scores: { 'Cika R.': 4, 'Dian P.': 2 } },
        { id: 'm3', p1: 'Eka M.', p2: 'Fajar L.', winner: 'Fajar L.', status: 'finished', scores: { 'Eka M.': 3, 'Fajar L.': 5 } },
        { id: 'm4', p1: 'Gita N.', p2: 'Hani W.', winner: null, status: 'in-progress', scores: { 'Gita N.': 2, 'Hani W.': 3 } },
      ]
    },
    {
      label: 'Ronde 2',
      matches: [
        { id: 'm5', p1: 'Andi S.', p2: 'Cika R.', winner: null, status: 'waiting', scores: {} },
        { id: 'm6', p1: 'Fajar L.', p2: '?', winner: null, status: 'pending', scores: {} },
      ]
    }
  ]
}

function MatchCard({ match, onClick, active }: { match: any, onClick: () => void, active: boolean }) {
  const statusMap: Record<string, { bg: string, color: string, label: string }> = {
    finished:    { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: '✅ Selesai' },
    'in-progress':{ bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: '⚡ Berlangsung' },
    waiting:     { bg: 'rgba(103,232,249,0.12)', color: '#67E8F9', label: '⏳ Segera' },
    pending:     { bg: 'rgba(255,255,255,0.06)', color: '#475569', label: '🔒 Menunggu' },
  }
  const badge = statusMap[match.status] || statusMap.pending

  return (
    <div onClick={onClick} style={{
      background: active ? 'rgba(103,232,249,0.08)' : '#1A1D27',
      border: `1.5px solid ${active ? 'rgba(103,232,249,0.5)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 14, padding: '11px 13px', cursor: 'pointer', transition: 'all 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: match.winner === match.p1 ? 800 : 600, color: match.winner === match.p1 ? '#fff' : match.winner ? '#475569' : '#94A3B8' }}>{match.p1}</span>
            {match.status !== 'pending' && match.status !== 'waiting' && (
              <span style={{ fontSize: 12, fontWeight: 800, color: '#67E8F9' }}>{match.scores[match.p1] ?? '-'}</span>
            )}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '5px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: match.winner === match.p2 ? 800 : 600, color: match.winner === match.p2 ? '#fff' : match.winner ? '#475569' : '#94A3B8' }}>{match.p2}</span>
            {match.status !== 'pending' && match.status !== 'waiting' && (
              <span style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b' }}>{match.scores[match.p2] ?? '-'}</span>
            )}
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, display: 'block', marginBottom: match.winner ? 4 : 0 }}>{badge.label}</span>
          {match.winner && <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>🏅 {match.winner}</div>}
          {match.status === 'in-progress' && <div style={{ fontSize: 10, color: '#67E8F9', marginTop: 4 }}>👁 Lihat</div>}
        </div>
      </div>
    </div>
  )
}

function SpectatorPanel({ match, onClose }: { match: any, onClose: () => void }) {
  const [sliders] = useState({ [match.p1]: 3, [match.p2]: 7 })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-end', padding: '0' }}>
      <div style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(103,232,249,0.2)', borderRadius: '20px 20px 0 0', padding: '20px 16px 32px', maxHeight: '70vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#67E8F9', fontWeight: 700, letterSpacing: 1 }}>👁 SPECTATOR MODE</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>{match.p1} vs {match.p2}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>✕ Tutup</button>
        </div>

        {/* Live score */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {[match.p1, match.p2].map((name, i) => (
            <div key={name} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${i === 0 ? 'rgba(103,232,249,0.2)' : 'rgba(245,158,11,0.2)'}`, borderRadius: 14, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: i === 0 ? '#67E8F9' : '#f59e0b', fontWeight: 700, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: i === 0 ? '#67E8F9' : '#f59e0b' }}>{match.scores[name] ?? 0}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>soal benar</div>
              {/* Slider position */}
              <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 10px' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>Slider saat ini</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: i === 0 ? '#67E8F9' : '#f59e0b' }}>{sliders[name]}</div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${((sliders[name] + 20) / 40) * 100}%`, background: i === 0 ? '#67E8F9' : '#f59e0b', borderRadius: 4 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Round indicator */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Soal saat ini</span>
          <div style={{ display: 'flex', gap: 5 }}>
            {Array.from({length:7},(_,i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < 3 ? '#10b981' : i === 3 ? '#67E8F9' : 'rgba(255,255,255,0.12)' }} />
            ))}
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#67E8F9' }}>4/7</span>
        </div>

        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>ℹ️ Soal saat ini: Katak di -3, maju 5 langkah → ?</div>
        </div>
      </div>
    </div>
  )
}

export function GuruTournamentTab() {
  const [view, setView] = useState<'setup' | 'bracket'>('bracket')
  const [form, setForm] = useState({ kelas: 'VII A', gameKey: 'katak' })
  const [activeMatch, setActiveMatch] = useState<any>(null)

  const kelasList = ['VII A', 'VII B', 'VIII A', 'VIII B']

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {/* Guru header */}
      <div style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', border: '2px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👨‍🏫</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Pak Budi</div>
            <div style={{ fontSize: 11, color: '#a855f7' }}>Guru • VII A, VII B</div>
          </div>
        </div>
      </div>

      {/* Tabs row */}
      <div style={{ display: 'flex', gap: 0, background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
        {['📋 Tugas','🧮 Hafalan','📊 Nilai','💬 Chat','👥 Siswa','🔒 Kunci','⚔️ Boss','🏆 Turnamen'].map((t, i) => (
          <button key={t} style={{ background: i === 7 ? 'rgba(245,158,11,0.12)' : 'transparent', border: 'none', borderBottom: i === 7 ? '2px solid #f59e0b' : '2px solid transparent', padding: '10px 12px', color: i === 7 ? '#f59e0b' : '#475569', fontSize: 11, fontWeight: i === 7 ? 800 : 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: '16px 16px 40px' }}>
        {/* Sub-toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['setup','bracket'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ flex: 1, background: view === v ? (v === 'bracket' ? 'rgba(245,158,11,0.15)' : 'rgba(103,232,249,0.12)') : 'rgba(255,255,255,0.04)', border: `1.5px solid ${view === v ? (v === 'bracket' ? 'rgba(245,158,11,0.5)' : 'rgba(103,232,249,0.4)') : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '10px', color: view === v ? (v === 'bracket' ? '#f59e0b' : '#67E8F9') : '#94A3B8', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {v === 'setup' ? '⚙️ Setup Baru' : '🏆 Bracket Live'}
            </button>
          ))}
        </div>

        {/* SETUP VIEW */}
        {view === 'setup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#111827', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: 2, background: 'linear-gradient(90deg,#f59e0b,#ef4444)' }} />
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>🏆 Mulai Turnamen Baru</div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Kelas</label>
                  <select value={form.kelas} onChange={e => setForm(f => ({...f, kelas: e.target.value}))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
                    {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: 6 }}>Game</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {GAMES.map(g => (
                      <label key={g.key} style={{ display: 'flex', alignItems: 'center', gap: 10, background: form.gameKey === g.key ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${form.gameKey === g.key ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>
                        <input type="radio" name="game" value={g.key} checked={form.gameKey === g.key} onChange={() => setForm(f => ({...f, gameKey: g.key}))} style={{ accentColor: '#f59e0b' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: form.gameKey === g.key ? '#f59e0b' : '#94A3B8' }}>{g.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#94A3B8' }}>
                  ℹ️ Minimal 2 siswa diperlukan. Siswa akan di-acak dan dibuat bracket otomatis.
                </div>

                <button onClick={() => setView('bracket')} style={{ width: '100%', background: 'linear-gradient(90deg,#f59e0b,#ef4444)', border: 'none', borderRadius: 12, padding: '14px', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                  🏆 Mulai Turnamen!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BRACKET VIEW */}
        {view === 'bracket' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Tournament info */}
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 2 }}>TURNAMEN AKTIF • VII A</div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>🐸 Katak Pelompat — Ronde 2</div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>8 peserta • 3 match aktif</div>
              </div>
              <button style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '8px 12px', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Batalkan</button>
            </div>

            {/* Bracket */}
            {mockTournament.rounds.map((round, ri) => (
              <div key={ri}>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{round.label.toUpperCase()}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {round.matches.map((m) => (
                    <MatchCard key={m.id} match={m} active={activeMatch?.id === m.id} onClick={() => setActiveMatch(activeMatch?.id === m.id ? null : m)} />
                  ))}
                </div>
              </div>
            ))}

            <div style={{ textAlign: 'center', fontSize: 11, color: '#475569', padding: '8px 0' }}>
              Tap match untuk lihat detail atau spectate live
            </div>
          </div>
        )}
      </div>

      {/* Spectator panel */}
      {activeMatch && activeMatch.status === 'in-progress' && (
        <SpectatorPanel match={activeMatch} onClose={() => setActiveMatch(null)} />
      )}
    </div>
  )
}
