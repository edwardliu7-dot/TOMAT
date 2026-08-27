import React, { useCallback, useMemo, useState } from 'react'
import {
  TopBar,
  PlayerHeader,
  Card,
  Btn,
  FeedbackBanner,
  NumericInput,
  DifficultyBadge,
  SurvivalOverScreen,
} from '../components/shared'
import { byDifficulty, pickFrom, useSurvival } from '../difficulty'
import { usePlayer } from '../PlayerContext'

const ACCENT = '#38BDF8'

const SUBSTITUTION_POOL = [
  { tier: 'easy', k: 2, y: 2 },
  { tier: 'easy', k: 2, y: 3 },
  { tier: 'medium', k: 2, y: 4 },
  { tier: 'medium', k: 3, y: 2 },
  { tier: 'medium', k: 3, y: 3 },
  { tier: 'hard', k: 2, y: 6 },
  { tier: 'hard', k: 3, y: 4 },
  { tier: 'hard', k: 4, y: 3 },
]

const ELIMINATION_POOL = [
  // The first balance is multiplied so the x coefficients match.
  { tier: 'easy', x: 3, y: 2, a1: 1, b1: 1, a2: 2, b2: 3, multiplier: 2, target: 'x' },
  { tier: 'medium', x: 4, y: 3, a1: 1, b1: 1, a2: 2, b2: 3, multiplier: 2, target: 'x' },
  { tier: 'medium', x: 2, y: 4, a1: 1, b1: 2, a2: 3, b2: 2, multiplier: 3, target: 'x' },
  { tier: 'hard', x: 5, y: 2, a1: 2, b1: 1, a2: 3, b2: 2, multiplier: 2, target: 'x' },
  { tier: 'hard', x: 4, y: 2, a1: 1, b1: 1, a2: 2, b2: 3, multiplier: 2, target: 'x' },
]

function makeQuestion(mode, difficulty) {
  if (mode === 'substitution') {
    const picked = pickFrom(SUBSTITUTION_POOL.filter(item => item.tier === difficulty).length
      ? SUBSTITUTION_POOL.filter(item => item.tier === difficulty)
      : SUBSTITUTION_POOL)
    return {
      mode,
      k: picked.k,
      x: picked.k * picked.y,
      y: picked.y,
      total: (picked.k + 1) * picked.y,
    }
  }

  const available = ELIMINATION_POOL.filter(item => item.tier === difficulty)
  const picked = pickFrom(available.length ? available : ELIMINATION_POOL)
  return {
    mode,
    ...picked,
    c1: picked.a1 * picked.x + picked.b1 * picked.y,
    c2: picked.a2 * picked.x + picked.b2 * picked.y,
  }
}

function makeItems(q) {
  if (q.mode === 'substitution') {
    return [
      { id: 'a-x', type: 'x', balance: 'A', side: 'left' },
      { id: 'a-y', type: 'y', balance: 'A', side: 'left' },
      { id: 'a-weight', type: 'weight', value: q.total, balance: 'A', side: 'right' },
      { id: 'b-x', type: 'x', balance: 'B', side: 'left' },
      ...Array.from({ length: q.k }, (_, index) => ({
        id: `b-y-${index}`,
        type: 'y',
        balance: 'B',
        side: 'right',
      })),
    ]
  }
  return [
    ...Array.from({ length: q.a1 }, (_, index) => ({ id: `a-x-${index}`, type: 'x', balance: 'A', side: 'left' })),
    ...Array.from({ length: q.b1 }, (_, index) => ({ id: `a-y-${index}`, type: 'y', balance: 'A', side: 'left' })),
    { id: 'a-weight', type: 'weight', value: q.c1, balance: 'A', side: 'right' },
    ...Array.from({ length: q.a2 }, (_, index) => ({ id: `b-x-${index}`, type: 'x', balance: 'B', side: 'left' })),
    ...Array.from({ length: q.b2 }, (_, index) => ({ id: `b-y-${index}`, type: 'y', balance: 'B', side: 'left' })),
    { id: 'b-weight', type: 'weight', value: q.c2, balance: 'B', side: 'right' },
  ]
}

function termText(count, symbol) {
  if (!count) return ''
  if (count === 1) return symbol
  return `${count}${symbol}`
}

function equationFromItems(items) {
  const xLeft = items.filter(item => item.side === 'left' && item.type === 'x').length
  const yLeft = items.filter(item => item.side === 'left' && item.type === 'y').length
  const xRight = items.filter(item => item.side === 'right' && item.type === 'x').length
  const yRight = items.filter(item => item.side === 'right' && item.type === 'y').length
  const leftWeights = items
    .filter(item => item.side === 'left' && item.type === 'weight')
    .reduce((sum, item) => sum + item.value, 0)
  const rightWeights = items
    .filter(item => item.side === 'right' && item.type === 'weight')
    .reduce((sum, item) => sum + item.value, 0)
  const left = [termText(xLeft, 'x'), termText(yLeft, 'y'), leftWeights || ''].filter(Boolean).join(' + ') || '0'
  const right = [termText(xRight, 'x'), termText(yRight, 'y'), rightWeights || ''].filter(Boolean).join(' + ') || '0'
  return `${left} = ${right}`
}

function BalanceItem({ item, onDragStart, vanishing }) {
  const style = item.type === 'x'
    ? { background: 'linear-gradient(135deg,#EF4444,#991B1B)', borderColor: '#FCA5A5', label: 'x', icon: '▣' }
    : item.type === 'y'
      ? { background: 'linear-gradient(135deg,#2563EB,#172554)', borderColor: '#93C5FD', label: 'y', icon: '◉' }
      : { background: 'linear-gradient(135deg,#64748B,#1E293B)', borderColor: '#CBD5E1', label: `${item.value} kg`, icon: '⚖' }
  return (
    <div
      draggable
      onDragStart={event => onDragStart(event, item)}
      className={`balance-lab-item${vanishing ? ' is-vanishing' : ''}`}
      title="Seret benda ini ke piringan lain"
      style={{ background: style.background, borderColor: style.borderColor }}
    >
      <span style={{ fontSize: item.type === 'weight' ? 13 : 17, lineHeight: 1 }}>{style.icon}</span>
      <b>{style.label}</b>
    </div>
  )
}

function Pan({ balanceId, side, items, onDrop, onDragStart, selected, onSelect, vanishingType }) {
  return (
    <div
      className={`balance-lab-pan ${selected ? 'is-selected' : ''}`}
      onClick={() => onSelect(`${balanceId}-${side}`)}
      onDragOver={event => event.preventDefault()}
      onDrop={event => {
        event.preventDefault()
        onDrop(event, balanceId, side)
      }}
      role="region"
      aria-label={`Piringan ${side === 'left' ? 'kiri' : 'kanan'} timbangan ${balanceId}`}
    >
      <div className="balance-lab-pan-label">{side === 'left' ? 'Benda' : 'Beban tetap'}</div>
      <div className="balance-lab-items">
        {items.length > 0
          ? items.map(item => <BalanceItem key={item.id} item={item} onDragStart={onDragStart} vanishing={vanishingType === item.type} />)
          : <span className="balance-lab-drop-hint">Taruh di sini</span>}
      </div>
    </div>
  )
}

function BalanceCard({
  balanceId,
  title,
  items,
  equation,
  onDrop,
  onDragStart,
  onBalanceDragStart,
  selected,
  onSelect,
  vanishingType,
  relation,
  relationDraggable,
  onRelationDragStart,
}) {
  const left = items.filter(item => item.side === 'left')
  const right = items.filter(item => item.side === 'right')
  return (
    <div
      className="balance-lab-balance"
      onDragOver={event => event.preventDefault()}
      onDrop={event => {
        event.preventDefault()
        onDrop(event, balanceId, null)
      }}
    >
      <div
        draggable
        onDragStart={event => onBalanceDragStart(event, balanceId)}
        className="balance-lab-balance-heading"
      >
        <div>
          <div className="balance-lab-balance-kicker">TIMBANGAN {balanceId}</div>
          <strong>{title}</strong>
        </div>
        <span className="balance-lab-drag">⠿ Seret</span>
      </div>
      <div className="balance-lab-scale">
        <div className="balance-lab-pan-row">
          <Pan balanceId={balanceId} side="left" items={left} onDrop={onDrop} onDragStart={onDragStart} selected={selected === `${balanceId}-left`} onSelect={onSelect} vanishingType={vanishingType} />
          <div className="balance-lab-beam">
            <span className="balance-lab-balance-dot">⚖</span>
            <div className="balance-lab-beam-line" />
            <span className="balance-lab-equality">=</span>
          </div>
          <Pan balanceId={balanceId} side="right" items={right} onDrop={onDrop} onDragStart={onDragStart} selected={selected === `${balanceId}-right`} onSelect={onSelect} vanishingType={vanishingType} />
        </div>
        <div className="balance-lab-scale-foot" />
      </div>
      <div className="balance-lab-equation">
        <span>Notasi otomatis</span>
        <b>{equation}</b>
        {relation && (
          <small
            draggable={relationDraggable}
            onDragStart={relationDraggable ? onRelationDragStart : undefined}
            className={relationDraggable ? 'balance-lab-relation-card' : ''}
          >
            {relationDraggable ? '↕ ' : ''}{relation}
          </small>
        )}
      </div>
    </div>
  )
}

function ItemTray({ onDragStart, onAdd, selectedPan }) {
  const trayItems = [
    { type: 'x', label: 'Kotak merah', symbol: 'x' },
    { type: 'y', label: 'Kantong biru', symbol: 'y' },
    { type: 'weight', value: 1, label: 'Beban 1 kg', symbol: '1' },
    { type: 'weight', value: 2, label: 'Beban 2 kg', symbol: '2' },
    { type: 'weight', value: 5, label: 'Beban 5 kg', symbol: '5' },
  ]
  return (
    <div className="balance-lab-tray">
      <div className="balance-lab-tray-title">
        <div>
          <b>📦 Kotak Alat</b>
          <span>Seret benda ke piringan</span>
        </div>
        <small>Target: {selectedPan ? `Timbangan ${selectedPan.split('-')[0]} · ${selectedPan.endsWith('left') ? 'kiri' : 'kanan'}` : 'pilih piringan'}</small>
      </div>
      <div className="balance-lab-tray-items">
        {trayItems.map(item => (
          <button
            type="button"
            key={`${item.type}-${item.value || ''}`}
            draggable
            onDragStart={event => onDragStart(event, item)}
            onClick={() => onAdd(item)}
            className={`balance-lab-tray-item tray-${item.type}`}
            title={`Klik untuk menambah ${item.label}`}
          >
            <span>{item.symbol}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

function ModeButton({ active, onClick, icon, title, description }) {
  return (
    <button type="button" onClick={onClick} className={`balance-lab-mode ${active ? 'is-active' : ''}`}>
      <span className="balance-lab-mode-icon">{icon}</span>
      <span><b>{title}</b><small>{description}</small></span>
    </button>
  )
}

export default function BalanceLabSPLDVGame({ goBack, difficulty = 'medium', survival = false }) {
  const { addCoins, addExp, recordWrongAnswer } = usePlayer()
  const survivalState = useSurvival(survival)
  const effectiveDifficulty = survival ? survivalState.difficulty : difficulty
  const [mode, setMode] = useState('substitution')
  const [q, setQ] = useState(() => makeQuestion('substitution', effectiveDifficulty))
  const [items, setItems] = useState(() => makeItems(q))
  const [selectedPan, setSelectedPan] = useState('A-left')
  const [substituted, setSubstituted] = useState(false)
  const [scaleA, setScaleA] = useState(1)
  const [operationResult, setOperationResult] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [notice, setNotice] = useState('')

  const beginQuestion = useCallback((nextMode = mode) => {
    const next = makeQuestion(nextMode, effectiveDifficulty)
    setMode(nextMode)
    setQ(next)
    setItems(makeItems(next))
    setSelectedPan('A-left')
    setSubstituted(false)
    setScaleA(1)
    setOperationResult(null)
    setAnswer('')
    setFeedback(null)
    setNotice('')
  }, [effectiveDifficulty, mode])

  const getDisplayItems = useCallback((balanceId) => {
    let result = items.filter(item => item.balance === balanceId)
    if (q.mode === 'substitution' && substituted && balanceId === 'A') {
      result = result.flatMap(item => item.type === 'x'
        ? Array.from({ length: q.k }, (_, index) => ({ ...item, id: `${item.id}-sub-${index}`, type: 'y' }))
        : [item])
    }
    if (q.mode === 'elimination' && balanceId === 'A' && scaleA > 1) {
      result = Array.from({ length: scaleA }, (_, multiplier) => (
        result.map(item => ({ ...item, id: `${item.id}-scale-${multiplier}` }))
      )).flat()
    }
    return result
  }, [items, q, scaleA, substituted])

  const displayA = getDisplayItems('A')
  const displayB = getDisplayItems('B')
  const equations = useMemo(() => ({
    A: equationFromItems(displayA),
    B: equationFromItems(displayB),
  }), [displayA, displayB])

  const onDragStart = (event, item) => {
    event.dataTransfer.effectAllowed = 'copyMove'
    event.dataTransfer.setData('application/json', JSON.stringify({ source: 'item', item }))
  }

  const onTrayDragStart = (event, item) => {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/json', JSON.stringify({ source: 'tray', item }))
  }

  const onBalanceDragStart = (event, balanceId) => {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/json', JSON.stringify({ source: 'balance', balanceId }))
  }

  const onRelationDragStart = event => {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/json', JSON.stringify({ source: 'substitution' }))
  }

  const readDrop = event => {
    try { return JSON.parse(event.dataTransfer.getData('application/json')) } catch { return null }
  }

  const onDrop = (event, balanceId, side) => {
    const payload = readDrop(event)
    if (!payload) return
    if (payload.source === 'substitution') {
      if (q.mode === 'substitution' && balanceId === 'A') {
        setSubstituted(true)
        setNotice('Kotak x berubah menjadi kantong y sesuai kartu kesetaraan.')
      }
      return
    }
    if (payload.source === 'balance') {
      if (q.mode === 'elimination' && balanceId === 'A') {
        setNotice('Timbangan B siap digabungkan. Pilih operasi di bawah.')
      }
      return
    }
    const targetSide = side || (payload.item.type === 'weight' ? 'right' : 'left')
    if (payload.source === 'tray') {
      const item = payload.item
      setItems(previous => [...previous, {
        ...item,
        id: `custom-${Date.now()}-${previous.length}`,
        balance: balanceId,
        side: targetSide,
      }])
      setNotice('Benda ditambahkan. Perhatikan notasi aljabar yang berubah.')
      return
    }
    if (payload.source === 'item' && payload.item?.id) {
      setItems(previous => previous.map(item => item.id === payload.item.id
        ? { ...item, balance: balanceId, side: targetSide }
        : item))
      setNotice('Benda dipindahkan. Kedua persamaan selalu diperbarui otomatis.')
    }
  }

  const addTrayItem = item => {
    const [balanceId, preferredSide] = selectedPan.split('-')
    const side = preferredSide || (item.type === 'weight' ? 'right' : 'left')
    setItems(previous => [...previous, {
      ...item,
      id: `custom-${Date.now()}-${previous.length}`,
      balance: balanceId || 'A',
      side,
    }])
    setNotice('Benda ditambahkan ke piringan yang dipilih.')
  }

  const performSubstitution = () => {
    if (substituted) return
    setSubstituted(true)
    setNotice('Kotak x terbelah menjadi kantong biru. Persamaan atas ikut berubah.')
  }

  const performElimination = operation => {
    if (q.mode !== 'elimination') return
    if (operation === 'add') {
      setOperationResult({ type: 'sum', equation: `${equations.A} + (${equations.B})` })
      setNotice('Penjumlahan menjaga kedua sisi tetap setara, tetapi belum menghilangkan variabel.')
      return
    }
    const target = q.target
    const aTarget = q[`a1`] * scaleA
    const bTarget = q[`a2`]
    if (aTarget !== bTarget) {
      setNotice(`Koefisien ${target} belum sama. Gandakan Timbangan A dengan tombol x${q.multiplier}.`)
      return
    }
    const other = target === 'x' ? 'y' : 'x'
    const aOther = q[target === 'x' ? 'b1' : 'a1'] * scaleA
    const bOther = q[target === 'x' ? 'b2' : 'a2']
    const coefficient = Math.abs(aOther - bOther)
    const constant = Math.abs(q.c1 * scaleA - q.c2)
    setOperationResult({
      type: 'difference',
      target,
      other,
      coefficient,
      constant,
      equation: `${coefficient === 1 ? '' : coefficient}${other} = ${constant}`,
    })
    setNotice(`Benda ${target} yang sama menyala lalu menghilang. Tinggal cari ${other}.`)
  }

  const confirmAnswer = () => {
    if (feedback !== null || answer === '') return
    const correct = Number(answer) === q.y
    setFeedback(correct)
    survivalState.recordResult(correct)
    if (correct) {
      addCoins(50)
      addExp(100)
    } else {
      recordWrongAnswer()
    }
  }

  if (survival && survivalState.gameOver) {
    return <SurvivalOverScreen streak={survivalState.streak} onRetry={() => { survivalState.reset(); beginQuestion() }} goBack={goBack} />
  }

  const canAnswer = mode === 'substitution' ? substituted : operationResult?.type === 'difference'
  const relationCard = mode === 'substitution' ? `Kesetaraan: x = ${q.k}y` : null
  const visibleVanishing = operationResult?.type === 'difference' ? q.target : null

  return (
    <div className="balance-lab-screen">
      <PlayerHeader />
      <TopBar
        title="⚖️ BalanceLab: SPLDV Visual"
        onBack={goBack}
        accentColor={ACCENT}
        rightElement={<DifficultyBadge difficulty={effectiveDifficulty} survival={survival} streak={survivalState.streak} />}
      />

      <main className="balance-lab-content">
        <div className="balance-lab-hero">
          <div className="balance-lab-hero-icon">⚖️</div>
          <div>
            <div className="balance-lab-eyebrow">LABORATORIUM PERSAMAAN</div>
            <h1>Jaga timbangan tetap seimbang</h1>
            <p>Pindahkan benda, ubah kesetaraan, lalu lihat SPLDV terbentuk secara real-time.</p>
          </div>
        </div>

        <div className="balance-lab-mode-switcher">
          <ModeButton active={mode === 'substitution'} onClick={() => beginQuestion('substitution')} icon="🔁" title="Substitusi" description="Tukar benda setara" />
          <ModeButton active={mode === 'elimination'} onClick={() => beginQuestion('elimination')} icon="➖" title="Eliminasi" description="Gabung & hilangkan" />
        </div>

        <div className="balance-lab-instruction">
          <span>💡</span>
          <div>
            {mode === 'substitution'
              ? <>Seret kartu <b>x = {q.k}y</b> ke Timbangan A, atau tekan tombol transformasi. Kotak merah akan berubah menjadi {q.k} kantong biru.</>
              : <>Samakan koefisien <b>{q.target}</b> dengan penggandaan x2/x3, lalu kurangi Timbangan B dari A agar benda yang sama menghilang.</>}
          </div>
        </div>

        <ItemTray onDragStart={onTrayDragStart} onAdd={addTrayItem} selectedPan={selectedPan} />

        <div className="balance-lab-connected">
          <BalanceCard
            balanceId="A"
            title={mode === 'substitution' ? 'Persamaan utama' : 'Timbangan yang digandakan'}
            items={displayA}
            equation={equations.A}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onBalanceDragStart={onBalanceDragStart}
            selected={selectedPan}
            onSelect={setSelectedPan}
            vanishingType={visibleVanishing}
            relation={mode === 'elimination' && scaleA > 1 ? `Semua benda ×${scaleA}` : null}
          />
          <div className="balance-lab-connector"><span>⇅</span><small>terhubung</small></div>
          <BalanceCard
            balanceId="B"
            title={mode === 'substitution' ? 'Kartu kesetaraan' : 'Timbangan pembanding'}
            items={displayB}
            equation={equations.B}
            onDrop={onDrop}
            onDragStart={onDragStart}
            onBalanceDragStart={onBalanceDragStart}
            selected={selectedPan}
            onSelect={setSelectedPan}
            vanishingType={visibleVanishing}
            relation={relationCard}
            relationDraggable={mode === 'substitution'}
            onRelationDragStart={onRelationDragStart}
          />
        </div>

        {mode === 'substitution' && (
          <div className={`balance-lab-action-card${substituted ? ' is-complete' : ''}`}>
            <div className="balance-lab-action-card-copy">
              <span className="balance-lab-action-icon">🔁</span>
              <div>
                <b>{substituted ? 'Substitusi berhasil!' : 'Tukar benda yang setara'}</b>
                <small>{substituted ? `${q.k}y + y = ${q.total}` : 'Seret kartu kesetaraan dari Timbangan B ke Timbangan A.'}</small>
              </div>
            </div>
            {!substituted && (
              <button type="button" className="balance-lab-primary-button" onClick={performSubstitution}>
                Ubah x → {q.k}y
              </button>
            )}
          </div>
        )}

        {mode === 'elimination' && (
          <Card border="rgba(56,189,248,0.25)" style={{ background: 'rgba(15,23,42,0.78)' }}>
            <div className="balance-lab-elimination-tools">
              <div>
                <div className="balance-lab-section-label">ALAT ELIMINASI</div>
                <b>Samakan koefisien {q.target}</b>
                <small>Gandakan seluruh Timbangan A, bukan hanya satu benda.</small>
              </div>
              <div className="balance-lab-multiply-buttons">
                {[1, 2, 3].map(value => (
                  <button type="button" key={value} className={scaleA === value ? 'is-active' : ''} onClick={() => { setScaleA(value); setOperationResult(null); setNotice(value === 1 ? '' : `Timbangan A digandakan ×${value}.`) }}>
                    ×{value}
                  </button>
                ))}
              </div>
            </div>
            <div className="balance-lab-operation-buttons">
              <button type="button" onClick={() => performElimination('add')}>＋ Gabung (Penjumlahan)</button>
              <button type="button" className="is-subtract" onClick={() => performElimination('subtract')}>− Kurangi Timbangan</button>
            </div>
            {operationResult && (
              <div className={`balance-lab-operation-result ${operationResult.type === 'difference' ? 'is-success' : ''}`}>
                <span>{operationResult.type === 'difference' ? '✨' : '➕'}</span>
                <div>
                  <b>{operationResult.type === 'difference' ? 'Benda yang sama tereliminasi!' : 'Dua timbangan digabungkan.'}</b>
                  <strong>{operationResult.type === 'difference' ? operationResult.equation : operationResult.equation}</strong>
                </div>
              </div>
            )}
          </Card>
        )}

        {notice && <div className="balance-lab-notice" role="status">ⓘ {notice}</div>}

        {canAnswer && feedback === null && (
          <Card border="rgba(52,211,153,0.3)" style={{ background: 'linear-gradient(135deg,rgba(6,78,59,0.38),rgba(15,23,42,0.86))' }}>
            <div className="balance-lab-answer">
              <div>
                <div className="balance-lab-section-label">{mode === 'substitution' ? 'HASIL SUBSTITUSI' : 'HASIL ELIMINASI'}</div>
                <b>{mode === 'substitution' ? `${q.k}y + y = ${q.total}` : `${operationResult.equation}`}</b>
                <small>Masukkan nilai {mode === 'substitution' ? 'y' : operationResult.other} untuk menyelesaikan misi.</small>
              </div>
              <div className="balance-lab-answer-controls">
                <NumericInput value={answer} onChange={setAnswer} onSubmit={confirmAnswer} placeholder="?" disabled={feedback !== null} />
                <Btn onClick={confirmAnswer} color="#10B981">Cek Jawaban</Btn>
              </div>
            </div>
          </Card>
        )}

        {feedback !== null && <FeedbackBanner correct={feedback} answer={q.y} onNext={() => beginQuestion()} />}
        <button type="button" className="balance-lab-reset" onClick={() => beginQuestion()}>↻ Mulai soal baru</button>
      </main>

      <style>{`
        .balance-lab-screen { min-height:100vh; color:#F8FAFC; background:radial-gradient(circle at 20% 0%,rgba(14,116,144,.18),transparent 32%),linear-gradient(180deg,#06131F 0%,#071321 100%); font-family:system-ui,sans-serif; }
        .balance-lab-content { width:min(100% - 32px, 980px); margin:0 auto; padding:18px 0 42px; }
        .balance-lab-hero { display:flex; align-items:center; gap:15px; padding:18px 20px; border:1px solid rgba(56,189,248,.25); border-radius:20px; background:linear-gradient(120deg,rgba(14,116,144,.22),rgba(30,41,59,.55)); }
        .balance-lab-hero-icon { display:grid; place-items:center; width:52px; height:52px; flex-shrink:0; border-radius:16px; background:rgba(56,189,248,.16); font-size:28px; box-shadow:0 0 26px rgba(56,189,248,.15); }
        .balance-lab-eyebrow,.balance-lab-section-label { color:#7DD3FC; font-size:10px; font-weight:900; letter-spacing:1.6px; }
        .balance-lab-hero h1 { margin:3px 0 4px; font-size:20px; letter-spacing:-.3px; }
        .balance-lab-hero p { margin:0; color:#A8BBCB; font-size:12px; line-height:1.5; }
        .balance-lab-mode-switcher { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:14px 0; }
        .balance-lab-mode { display:flex; align-items:center; gap:10px; text-align:left; padding:12px 14px; border:1px solid rgba(148,163,184,.16); border-radius:14px; background:rgba(15,23,42,.7); color:#94A3B8; cursor:pointer; font:inherit; transition:.2s; }
        .balance-lab-mode:hover,.balance-lab-mode.is-active { color:#F8FAFC; border-color:rgba(56,189,248,.6); background:rgba(14,116,144,.18); }
        .balance-lab-mode-icon { font-size:22px; }
        .balance-lab-mode b,.balance-lab-mode small { display:block; }
        .balance-lab-mode b { font-size:13px; }
        .balance-lab-mode small { margin-top:2px; color:#64748B; font-size:10px; }
        .balance-lab-instruction,.balance-lab-notice { display:flex; align-items:flex-start; gap:9px; margin:12px 0; padding:11px 13px; border-radius:12px; background:rgba(251,191,36,.08); border:1px solid rgba(251,191,36,.18); color:#CBD5E1; font-size:12px; line-height:1.5; }
        .balance-lab-instruction b { color:#FCD34D; }
        .balance-lab-tray { padding:13px; border-radius:16px; background:rgba(15,23,42,.75); border:1px solid rgba(148,163,184,.14); }
        .balance-lab-tray-title { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:10px; }
        .balance-lab-tray-title b,.balance-lab-tray-title span,.balance-lab-tray-title small { display:block; }
        .balance-lab-tray-title b { font-size:12px; }
        .balance-lab-tray-title span { margin-top:3px; color:#64748B; font-size:10px; }
        .balance-lab-tray-title small { color:#7DD3FC; font-size:10px; text-align:right; }
        .balance-lab-tray-items { display:flex; flex-wrap:wrap; gap:8px; }
        .balance-lab-tray-item { display:flex; align-items:center; gap:7px; min-width:102px; padding:8px 10px; border:1px solid rgba(148,163,184,.18); border-radius:11px; background:#111C2E; color:#E2E8F0; cursor:grab; font:inherit; text-align:left; }
        .balance-lab-tray-item:active { cursor:grabbing; }
        .balance-lab-tray-item > span { display:grid; place-items:center; width:23px; height:23px; border-radius:7px; font-size:13px; font-weight:900; }
        .balance-lab-tray-item small { font-size:10px; color:#CBD5E1; }
        .tray-x > span { background:#B91C1C; color:#FECACA; }.tray-y > span { background:#1D4ED8; color:#DBEAFE; }.tray-weight > span { background:#475569; color:#F8FAFC; }
        .balance-lab-connected { display:flex; flex-direction:column; gap:5px; margin-top:14px; }
        .balance-lab-balance { position:relative; overflow:hidden; padding:14px; border:1px solid rgba(56,189,248,.22); border-radius:18px; background:linear-gradient(135deg,rgba(15,38,58,.92),rgba(15,23,42,.92)); }
        .balance-lab-balance-heading { display:flex; justify-content:space-between; align-items:center; gap:10px; cursor:grab; }
        .balance-lab-balance-heading:active { cursor:grabbing; }
        .balance-lab-balance-kicker { color:#38BDF8; font-size:9px; font-weight:900; letter-spacing:1.5px; }
        .balance-lab-balance-heading strong { display:block; margin-top:3px; color:#F8FAFC; font-size:13px; }
        .balance-lab-drag { color:#64748B; font-size:10px; }
        .balance-lab-scale { padding:14px 4px 4px; }
        .balance-lab-pan-row { display:grid; grid-template-columns:minmax(0,1fr) 78px minmax(0,1fr); align-items:center; gap:7px; }
        .balance-lab-pan { min-height:94px; padding:8px; border:1px dashed rgba(148,163,184,.25); border-radius:13px; background:rgba(2,6,23,.32); cursor:pointer; transition:.2s; }
        .balance-lab-pan:hover,.balance-lab-pan.is-selected { border-color:#38BDF8; background:rgba(14,116,144,.12); }
        .balance-lab-pan-label { color:#64748B; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:1px; }
        .balance-lab-items { display:flex; flex-wrap:wrap; align-items:center; gap:5px; min-height:57px; padding-top:7px; }
        .balance-lab-drop-hint { color:#475569; font-size:10px; }
        .balance-lab-item { display:flex; align-items:center; gap:4px; padding:7px 8px; border:1px solid; border-radius:9px; color:#fff; box-shadow:0 4px 9px rgba(0,0,0,.25); cursor:grab; font-size:10px; user-select:none; }
        .balance-lab-item:active { cursor:grabbing; }.balance-lab-item.is-vanishing { animation:balance-lab-vanish .65s ease forwards; }
        .balance-lab-beam { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; color:#7DD3FC; }
        .balance-lab-balance-dot { display:grid; place-items:center; width:27px; height:27px; border:1px solid rgba(125,211,252,.45); border-radius:50%; background:#0C4A6E; font-size:14px; }
        .balance-lab-beam-line { width:100%; height:3px; border-radius:99px; background:#38BDF8; box-shadow:0 0 8px rgba(56,189,248,.65); }
        .balance-lab-equality { position:absolute; bottom:-19px; color:#94A3B8; font-size:14px; font-weight:900; }
        .balance-lab-scale-foot { width:38%; height:5px; margin:9px auto 0; border-radius:99px; background:#334155; }
        .balance-lab-equation { display:flex; align-items:center; gap:10px; margin-top:9px; padding:10px 12px; border-radius:10px; background:rgba(2,6,23,.45); }
        .balance-lab-equation span { color:#64748B; font-size:10px; }.balance-lab-equation b { color:#E0F2FE; font-family:ui-monospace,monospace; font-size:16px; }.balance-lab-equation small { margin-left:auto; color:#7DD3FC; font-size:10px; }
        .balance-lab-relation-card { padding:4px 7px; border:1px solid rgba(125,211,252,.35); border-radius:7px; background:rgba(14,116,144,.18); cursor:grab; }.balance-lab-relation-card:active { cursor:grabbing; }
        .balance-lab-connector { display:flex; flex-direction:column; align-items:center; height:29px; color:#38BDF8; line-height:1; }.balance-lab-connector span { font-size:20px; }.balance-lab-connector small { color:#64748B; font-size:8px; letter-spacing:1px; text-transform:uppercase; }
        .balance-lab-action-card { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:13px; padding:13px; border:1px solid rgba(251,191,36,.26); border-radius:15px; background:rgba(120,53,15,.13); }.balance-lab-action-card.is-complete { border-color:rgba(52,211,153,.3); background:rgba(6,78,59,.14); }
        .balance-lab-action-card-copy { display:flex; align-items:center; gap:9px; }.balance-lab-action-icon { font-size:21px; }.balance-lab-action-card-copy b,.balance-lab-action-card-copy small { display:block; }.balance-lab-action-card-copy b { font-size:12px; }.balance-lab-action-card-copy small { margin-top:3px; color:#94A3B8; font-size:10px; }
        .balance-lab-primary-button,.balance-lab-operation-buttons button,.balance-lab-multiply-buttons button { border:1px solid rgba(56,189,248,.32); border-radius:10px; background:rgba(14,116,144,.2); color:#BAE6FD; padding:9px 11px; cursor:pointer; font:inherit; font-size:11px; font-weight:800; white-space:nowrap; }.balance-lab-primary-button:hover,.balance-lab-operation-buttons button:hover { background:rgba(14,116,144,.42); }
        .balance-lab-elimination-tools,.balance-lab-operation-buttons,.balance-lab-answer { display:flex; justify-content:space-between; align-items:center; gap:14px; }.balance-lab-elimination-tools small,.balance-lab-answer small { display:block; margin-top:4px; color:#94A3B8; font-size:10px; }.balance-lab-elimination-tools > div:first-child b { display:block; margin-top:3px; font-size:13px; }
        .balance-lab-multiply-buttons { display:flex; gap:5px; }.balance-lab-multiply-buttons button { min-width:39px; padding:9px 7px; }.balance-lab-multiply-buttons button.is-active { color:#06131F; border-color:#7DD3FC; background:#7DD3FC; }
        .balance-lab-operation-buttons { justify-content:flex-start; margin-top:15px; }.balance-lab-operation-buttons .is-subtract { border-color:rgba(251,191,36,.38); color:#FDE68A; background:rgba(146,64,14,.2); }
        .balance-lab-operation-result { display:flex; align-items:center; gap:9px; margin-top:13px; padding:10px; border-radius:10px; background:rgba(148,163,184,.08); }.balance-lab-operation-result.is-success { background:rgba(52,211,153,.1); }.balance-lab-operation-result > span { font-size:20px; }.balance-lab-operation-result b,.balance-lab-operation-result strong { display:block; }.balance-lab-operation-result b { font-size:11px; color:#CBD5E1; }.balance-lab-operation-result strong { margin-top:3px; color:#6EE7B7; font-family:ui-monospace,monospace; font-size:16px; }
        .balance-lab-notice { margin-top:13px; background:rgba(56,189,248,.08); border-color:rgba(56,189,248,.18); color:#BAE6FD; }
        .balance-lab-answer { align-items:flex-start; }.balance-lab-answer > div:first-child { flex:1; }.balance-lab-answer > div:first-child > b { display:block; margin-top:4px; color:#A7F3D0; font-family:ui-monospace,monospace; font-size:16px; }.balance-lab-answer-controls { display:flex; align-items:center; gap:8px; }.balance-lab-answer-controls > div { min-width:78px; }.balance-lab-answer-controls input { padding:9px 10px !important; font-size:21px !important; }
        .balance-lab-reset { display:block; margin:16px auto 0; border:0; background:transparent; color:#64748B; cursor:pointer; font:inherit; font-size:11px; }.balance-lab-reset:hover { color:#BAE6FD; }
        @keyframes balance-lab-vanish { 0% { transform:scale(1); opacity:1; filter:brightness(1) } 45% { transform:scale(1.18); opacity:1; filter:brightness(2) } 100% { transform:scale(.1) translateY(-18px); opacity:0; } }
        @media (min-width:720px) { .balance-lab-balance { display:grid; grid-template-columns:minmax(0,1fr) 245px; gap:15px; align-items:center; }.balance-lab-balance-heading { grid-column:1 / -1; }.balance-lab-scale { padding-top:0; }.balance-lab-equation { margin-top:0; min-height:44px; flex-direction:column; align-items:flex-start; justify-content:center; }.balance-lab-equation small { margin-left:0; }.balance-lab-connected { gap:7px; } }
        @media (max-width:560px) { .balance-lab-content { width:min(100% - 20px, 980px); }.balance-lab-hero { padding:15px; }.balance-lab-hero h1 { font-size:17px; }.balance-lab-pan-row { grid-template-columns:minmax(0,1fr) 55px minmax(0,1fr); }.balance-lab-pan { min-height:91px; }.balance-lab-equation { align-items:flex-start; flex-direction:column; gap:4px; }.balance-lab-equation small { margin-left:0; }.balance-lab-tray-title { align-items:flex-start; flex-direction:column; }.balance-lab-tray-title small { text-align:left; }.balance-lab-tray-item { min-width:calc(50% - 4px); }.balance-lab-action-card,.balance-lab-elimination-tools,.balance-lab-operation-buttons,.balance-lab-answer { align-items:stretch; flex-direction:column; }.balance-lab-primary-button { width:100%; }.balance-lab-operation-buttons button { width:100%; }.balance-lab-answer-controls { flex-direction:column; }.balance-lab-answer-controls > div,.balance-lab-answer-controls button { width:100%; }.balance-lab-answer-controls input { width:100%; }.balance-lab-multiply-buttons { width:100%; }.balance-lab-multiply-buttons button { flex:1; } }
      `}</style>
    </div>
  )
}