import React, { useMemo, useState } from 'react'
import { TopBar, PlayerHeader, Card, Btn } from '../components/shared'

const DEFAULT_EQUATIONS = {
  a1: '1', b1: '1', c1: '7',
  a2: '2', b2: '3', c2: '17',
}

function numberValue(value) {
  if (value === '' || value === '-' || value === '.') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function cleanNumber(value) {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) < 0.0000001) return '0'
  const rounded = Math.round(value * 1000000) / 1000000
  return Number.isInteger(rounded) ? String(rounded) : String(rounded)
}

function signedTerm(coefficient, symbol) {
  const absolute = Math.abs(coefficient)
  const body = absolute === 1 ? symbol : `${cleanNumber(absolute)}${symbol}`
  return coefficient < 0 ? `− ${body}` : body
}

function equationText(a, b, c) {
  const left = []
  if (a !== 0) left.push(signedTerm(a, 'x'))
  if (b !== 0) {
    const term = signedTerm(b, 'y')
    left.push(left.length && b > 0 ? `+ ${term}` : term)
  }
  return `${left.join(' ') || '0'} = ${cleanNumber(c)}`
}

function coefficientLabel(value, symbol) {
  const absolute = Math.abs(value)
  const prefix = absolute === 1 ? '' : cleanNumber(absolute)
  return `${value < 0 ? '−' : ''}${prefix}${symbol}`
}

function VisualItem({ value, symbol, tone }) {
  if (!value) return null
  return (
    <div className={`balance-tool-item ${tone}${value < 0 ? ' is-negative' : ''}`}>
      <span>{symbol === 'x' ? '▣' : '◉'}</span>
      <b>{coefficientLabel(value, symbol)}</b>
    </div>
  )
}

function BalanceVisual({ title, equation, a, b, c, accent }) {
  return (
    <div className="balance-tool-balance">
      <div className="balance-tool-balance-title">
        <span>{title}</span>
        <i style={{ background: accent }} />
      </div>
      <div className="balance-tool-scale">
        <div className="balance-tool-pan">
          <small>RUAS KIRI</small>
          <div className="balance-tool-items">
            <VisualItem value={a} symbol="x" tone="red" />
            <VisualItem value={b} symbol="y" tone="blue" />
            {!a && !b && <em>0</em>}
          </div>
        </div>
        <div className="balance-tool-center">
          <span>⚖</span>
          <div />
          <b>=</b>
        </div>
        <div className="balance-tool-pan">
          <small>BEBAN ANGKA</small>
          <div className="balance-tool-weight">{cleanNumber(c)} <small>kg</small></div>
        </div>
      </div>
      <div className="balance-tool-equation"><span>Persamaan</span><b>{equation}</b></div>
    </div>
  )
}

function Field({ label, value, onChange, accent = '#38BDF8' }) {
  return (
    <label className="balance-tool-field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={event => onChange(event.target.value)}
        style={{ borderColor: `${accent}55` }}
      />
    </label>
  )
}

function MethodButton({ active, onClick, icon, title, description }) {
  return (
    <button type="button" className={`balance-tool-method${active ? ' is-active' : ''}`} onClick={onClick}>
      <span>{icon}</span>
      <div><b>{title}</b><small>{description}</small></div>
    </button>
  )
}

export default function BalanceLabScreen({ goBack }) {
  const [values, setValues] = useState(DEFAULT_EQUATIONS)
  const [method, setMethod] = useState('visual')
  const [calculated, setCalculated] = useState(false)

  const update = (key, value) => {
    setValues(previous => ({ ...previous, [key]: value }))
    setCalculated(false)
  }

  const numbers = useMemo(() => Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, numberValue(value)])
  ), [values])

  const solution = useMemo(() => {
    const { a1, b1, c1, a2, b2, c2 } = numbers
    if ([a1, b1, c1, a2, b2, c2].some(value => value === null)) return { type: 'invalid' }
    const determinant = a1 * b2 - a2 * b1
    if (determinant === 0) {
      const sameLine = a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1
      return { type: sameLine ? 'infinite' : 'none', determinant }
    }
    return {
      type: 'unique',
      determinant,
      x: (c1 * b2 - c2 * b1) / determinant,
      y: (a1 * c2 - a2 * c1) / determinant,
    }
  }, [numbers])

  const equations = useMemo(() => ({
    A: numbers.a1 !== null && numbers.b1 !== null && numbers.c1 !== null
      ? equationText(numbers.a1, numbers.b1, numbers.c1) : 'Lengkapi persamaan',
    B: numbers.a2 !== null && numbers.b2 !== null && numbers.c2 !== null
      ? equationText(numbers.a2, numbers.b2, numbers.c2) : 'Lengkapi persamaan',
  }), [numbers])

  const substitutionStep = useMemo(() => {
    if (solution.type !== 'unique' || numbers.a1 === 0 || numbers.a2 === null) return null
    const xExpression = numbers.a1 === 1
      ? `${cleanNumber(numbers.c1)} − ${numbers.b1 === 1 ? '' : cleanNumber(numbers.b1)}y`
      : `(${cleanNumber(numbers.c1)} − ${numbers.b1 === 1 ? '' : cleanNumber(numbers.b1)}y) / ${cleanNumber(numbers.a1)}`
    return {
      isolate: `x = ${xExpression}`,
      replace: `${cleanNumber(numbers.a2)}(${xExpression}) + ${cleanNumber(numbers.b2)}y = ${cleanNumber(numbers.c2)}`,
      answer: `x = ${cleanNumber(solution.x)},  y = ${cleanNumber(solution.y)}`,
    }
  }, [numbers, solution])

  const eliminationStep = useMemo(() => {
    if (solution.type !== 'unique' || numbers.a1 === 0 || numbers.a2 === 0) return null
    const firstMultiplier = numbers.a2
    const secondMultiplier = numbers.a1
    const yCoefficient = numbers.a2 * numbers.b1 - numbers.a1 * numbers.b2
    const constant = numbers.a2 * numbers.c1 - numbers.a1 * numbers.c2
    return {
      multiply: `Persamaan A ×${cleanNumber(firstMultiplier)} dan Persamaan B ×${cleanNumber(secondMultiplier)}`,
      reduce: `${cleanNumber(yCoefficient)}y = ${cleanNumber(constant)}`,
      answer: `x = ${cleanNumber(solution.x)},  y = ${cleanNumber(solution.y)}`,
    }
  }, [numbers, solution])

  const reset = () => {
    setValues(DEFAULT_EQUATIONS)
    setMethod('visual')
    setCalculated(false)
  }

  const renderResult = () => {
    if (!calculated) {
      return <div className="balance-tool-empty-result">Tekan <b>Hitung SPLDV</b> untuk melihat solusi dan langkah penyelesaiannya.</div>
    }
    if (solution.type === 'invalid') {
      return <div className="balance-tool-result warning"><b>Data belum lengkap</b><span>Isi semua koefisien dengan angka terlebih dahulu.</span></div>
    }
    if (solution.type === 'none') {
      return <div className="balance-tool-result warning"><b>Tidak ada solusi</b><span>Kedua garis sejajar, sehingga tidak memiliki titik potong.</span></div>
    }
    if (solution.type === 'infinite') {
      return <div className="balance-tool-result warning"><b>Tak hingga solusi</b><span>Kedua persamaan ternyata mewakili garis yang sama.</span></div>
    }
    return (
      <div className="balance-tool-result success">
        <div className="balance-tool-result-heading"><span>✓</span><div><small>SOLUSI SPLDV</small><b>Titik potong ditemukan</b></div></div>
        <div className="balance-tool-solution-values"><div><small>Nilai x</small><strong>{cleanNumber(solution.x)}</strong></div><div><small>Nilai y</small><strong>{cleanNumber(solution.y)}</strong></div></div>
        <div className="balance-tool-determinant">Determinan = {cleanNumber(solution.determinant)}</div>
      </div>
    )
  }

  return (
    <div className="balance-tool-screen">
      <PlayerHeader />
      <TopBar title="⚖️ Alat Hitung SPLDV" onBack={goBack} accentColor="#38BDF8" />
      <main className="balance-tool-content">
        <header className="balance-tool-hero">
          <div className="balance-tool-hero-icon">⚖️</div>
          <div><div className="balance-tool-eyebrow">ALAT BANTU MATEMATIKA</div><h1>BalanceLab: SPLDV Visual</h1><p>Masukkan dua persamaan dan lihat cara mencari nilai x dan y melalui timbangan yang tetap seimbang.</p></div>
        </header>

        <Card border="rgba(56,189,248,.28)" style={{ background: 'rgba(15,23,42,.78)' }}>
          <div className="balance-tool-section-heading"><div><span>INPUT PERSAMAAN</span><b>Atur koefisien SPLDV</b></div><button type="button" className="balance-tool-reset" onClick={reset}>↻ Reset</button></div>
          <div className="balance-tool-input-grid">
            <div className="balance-tool-equation-input">
              <div className="balance-tool-equation-label"><i style={{ background: '#38BDF8' }} /> TIMBANGAN A</div>
              <div className="balance-tool-input-row"><Field label="x" value={values.a1} onChange={value => update('a1', value)} /><strong>x +</strong><Field label="y" value={values.b1} onChange={value => update('b1', value)} /><strong>y =</strong><Field label="angka" value={values.c1} onChange={value => update('c1', value)} /></div>
            </div>
            <div className="balance-tool-equation-input">
              <div className="balance-tool-equation-label"><i style={{ background: '#A78BFA' }} /> TIMBANGAN B</div>
              <div className="balance-tool-input-row"><Field label="x" value={values.a2} onChange={value => update('a2', value)} accent="#A78BFA" /><strong>x +</strong><Field label="y" value={values.b2} onChange={value => update('b2', value)} accent="#A78BFA" /><strong>y =</strong><Field label="angka" value={values.c2} onChange={value => update('c2', value)} accent="#A78BFA" /></div>
            </div>
          </div>
          <div className="balance-tool-actions"><Btn onClick={() => { setCalculated(true); setMethod('visual') }} color="#0284C7">Hitung SPLDV</Btn><span>Contoh awal: x + y = 7 dan 2x + 3y = 17</span></div>
        </Card>

        <div className="balance-tool-methods">
          <MethodButton active={method === 'visual'} onClick={() => setMethod('visual')} icon="⚖️" title="Visual" description="Lihat keseimbangan" />
          <MethodButton active={method === 'substitution'} onClick={() => setMethod('substitution')} icon="🔁" title="Substitusi" description="Ganti satu variabel" />
          <MethodButton active={method === 'elimination'} onClick={() => setMethod('elimination')} icon="➖" title="Eliminasi" description="Samakan lalu kurangi" />
        </div>

        <div className="balance-tool-balances">
          <BalanceVisual title="Timbangan A" equation={equations.A} a={numbers.a1} b={numbers.b1} c={numbers.c1} accent="#38BDF8" />
          <div className="balance-tool-link"><span>⇅</span><small>saling terhubung</small></div>
          <BalanceVisual title="Timbangan B" equation={equations.B} a={numbers.a2} b={numbers.b2} c={numbers.c2} accent="#A78BFA" />
        </div>

        <Card border="rgba(125,211,252,.2)" style={{ background: 'rgba(15,23,42,.7)' }}>
          <div className="balance-tool-section-heading"><div><span>{method === 'visual' ? 'RINGKASAN' : method === 'substitution' ? 'LANGKAH SUBSTITUSI' : 'LANGKAH ELIMINASI'}</span><b>{method === 'visual' ? 'Kedua timbangan membentuk satu titik potong' : 'Cara kerja perhitungannya'}</b></div></div>
          {method === 'visual' && <p className="balance-tool-explanation">Setiap kotak merah mewakili <b>x</b>, kantong biru mewakili <b>y</b>, dan beban abu-abu adalah nilai di ruas kanan. Ubah koefisien di atas untuk mencoba sistem persamaan lain.</p>}
          {method === 'substitution' && substitutionStep && <div className="balance-tool-steps"><div><b>1</b><span>Isolasi x dari Timbangan A: <strong>{substitutionStep.isolate}</strong></span></div><div><b>2</b><span>Masukkan ke Timbangan B: <strong>{substitutionStep.replace}</strong></span></div><div><b>3</b><span>Hasil akhir: <strong>{substitutionStep.answer}</strong></span></div></div>}
          {method === 'substitution' && !substitutionStep && <p className="balance-tool-explanation">Koefisien x pada Timbangan A tidak boleh 0 untuk menampilkan langkah isolasi x.</p>}
          {method === 'elimination' && eliminationStep && <div className="balance-tool-steps"><div><b>1</b><span>Samakan koefisien x: <strong>{eliminationStep.multiply}</strong></span></div><div><b>2</b><span>Kurangkan kedua persamaan: <strong>{eliminationStep.reduce}</strong></span></div><div><b>3</b><span>Hasil akhir: <strong>{eliminationStep.answer}</strong></span></div></div>}
          {method === 'elimination' && !eliminationStep && <p className="balance-tool-explanation">Koefisien x pada kedua persamaan tidak boleh 0 untuk menampilkan langkah eliminasi.</p>}
        </Card>

        <div className="balance-tool-result-wrap">{renderResult()}</div>
      </main>
      <style>{`
        .balance-tool-screen{min-height:100vh;color:#F8FAFC;background:radial-gradient(circle at 15% 0%,rgba(14,116,144,.18),transparent 32%),linear-gradient(180deg,#06131F,#071321);font-family:system-ui,sans-serif}
        .balance-tool-content{width:min(calc(100% - 32px),980px);margin:0 auto;padding:18px 0 44px}
        .balance-tool-hero{display:flex;align-items:center;gap:15px;padding:18px 20px;border:1px solid rgba(56,189,248,.25);border-radius:20px;background:linear-gradient(120deg,rgba(14,116,144,.22),rgba(30,41,59,.55));margin-bottom:14px}
        .balance-tool-hero-icon{display:grid;place-items:center;width:52px;height:52px;flex-shrink:0;border-radius:16px;background:rgba(56,189,248,.16);font-size:28px}
        .balance-tool-eyebrow,.balance-tool-section-heading span{color:#7DD3FC;font-size:10px;font-weight:900;letter-spacing:1.5px}.balance-tool-hero h1{margin:3px 0 4px;font-size:20px}.balance-tool-hero p{margin:0;color:#A8BBCB;font-size:12px;line-height:1.5}
        .balance-tool-section-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}.balance-tool-section-heading span,.balance-tool-section-heading b{display:block}.balance-tool-section-heading b{margin-top:3px;font-size:13px}.balance-tool-reset{border:0;background:transparent;color:#7DD3FC;cursor:pointer;font:inherit;font-size:11px}
        .balance-tool-input-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.balance-tool-equation-input{padding:12px;border:1px solid rgba(148,163,184,.15);border-radius:13px;background:rgba(2,6,23,.35)}.balance-tool-equation-label{display:flex;align-items:center;gap:7px;color:#CBD5E1;font-size:10px;font-weight:900;letter-spacing:1px;margin-bottom:11px}.balance-tool-equation-label i{width:7px;height:7px;border-radius:50%}
        .balance-tool-input-row{display:flex;align-items:end;gap:6px}.balance-tool-input-row>strong{padding-bottom:9px;color:#64748B;font-size:12px;white-space:nowrap}.balance-tool-field{display:block;flex:1}.balance-tool-field span{display:block;margin-bottom:4px;color:#64748B;font-size:9px}.balance-tool-field input{width:100%;box-sizing:border-box;padding:9px 7px;border:1px solid;border-radius:8px;background:#0B1627;color:#F8FAFC;text-align:center;font:800 16px ui-monospace,monospace;outline:none}.balance-tool-field input:focus{box-shadow:0 0 0 2px rgba(56,189,248,.16)}
        .balance-tool-actions{display:flex;align-items:center;gap:12px;margin-top:13px}.balance-tool-actions>span{color:#64748B;font-size:10px}
        .balance-tool-methods{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:14px 0}.balance-tool-method{display:flex;align-items:center;gap:9px;padding:11px 12px;border:1px solid rgba(148,163,184,.15);border-radius:13px;background:rgba(15,23,42,.7);color:#94A3B8;cursor:pointer;text-align:left;font:inherit}.balance-tool-method.is-active,.balance-tool-method:hover{border-color:rgba(56,189,248,.6);background:rgba(14,116,144,.16);color:#F8FAFC}.balance-tool-method>span{font-size:21px}.balance-tool-method b,.balance-tool-method small{display:block}.balance-tool-method b{font-size:12px}.balance-tool-method small{margin-top:2px;color:#64748B;font-size:10px}
        .balance-tool-balances{display:flex;flex-direction:column;gap:5px}.balance-tool-balance{padding:14px;border:1px solid rgba(56,189,248,.22);border-radius:17px;background:linear-gradient(135deg,rgba(15,38,58,.92),rgba(15,23,42,.92))}.balance-tool-balance-title{display:flex;align-items:center;gap:8px;margin-bottom:12px;color:#E0F2FE;font-size:12px;font-weight:900}.balance-tool-balance-title i{width:100%;height:2px;border-radius:2px;opacity:.65}.balance-tool-scale{display:grid;grid-template-columns:minmax(0,1fr) 72px minmax(0,1fr);align-items:center;gap:7px}.balance-tool-pan{min-height:84px;padding:9px;border:1px dashed rgba(148,163,184,.25);border-radius:12px;background:rgba(2,6,23,.3)}.balance-tool-pan>small{color:#64748B;font-size:9px;font-weight:900;letter-spacing:1px}.balance-tool-items{display:flex;flex-wrap:wrap;align-items:center;gap:5px;min-height:55px;padding-top:6px}.balance-tool-items em{color:#475569;font-size:11px;font-style:normal}.balance-tool-item{display:flex;align-items:center;gap:5px;padding:7px 9px;border:1px solid;border-radius:9px;color:#fff;box-shadow:0 4px 9px #0004;font-size:10px}.balance-tool-item.red{background:linear-gradient(135deg,#EF4444,#991B1B);border-color:#FCA5A5}.balance-tool-item.blue{background:linear-gradient(135deg,#2563EB,#172554);border-color:#93C5FD}.balance-tool-item.is-negative{opacity:.8}.balance-tool-item>span{font-size:16px}.balance-tool-center{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;color:#7DD3FC}.balance-tool-center span{display:grid;place-items:center;width:27px;height:27px;border:1px solid #7DD3FC77;border-radius:50%;background:#0C4A6E}.balance-tool-center div{width:100%;height:3px;border-radius:99px;background:#38BDF8;box-shadow:0 0 8px #38BDF8AA}.balance-tool-center b{position:absolute;bottom:-17px;color:#94A3B8}.balance-tool-weight{display:grid;place-items:center;min-height:54px;padding-top:5px;color:#E2E8F0;font:900 19px ui-monospace,monospace}.balance-tool-weight small{font:500 10px system-ui;color:#94A3B8}.balance-tool-equation{display:flex;align-items:center;gap:10px;margin-top:9px;padding:9px 11px;border-radius:10px;background:#02061773}.balance-tool-equation span{color:#64748B;font-size:10px}.balance-tool-equation b{color:#E0F2FE;font:800 15px ui-monospace,monospace}.balance-tool-link{display:flex;flex-direction:column;align-items:center;height:29px;color:#38BDF8;line-height:1}.balance-tool-link span{font-size:20px}.balance-tool-link small{color:#64748B;font-size:8px;letter-spacing:1px;text-transform:uppercase}
        .balance-tool-explanation{margin:0;color:#A8BBCB;font-size:12px;line-height:1.6}.balance-tool-explanation b{color:#BAE6FD}.balance-tool-steps{display:flex;flex-direction:column;gap:9px}.balance-tool-steps>div{display:flex;align-items:flex-start;gap:9px;color:#CBD5E1;font-size:12px;line-height:1.5}.balance-tool-steps>div>b{display:grid;place-items:center;width:21px;height:21px;flex-shrink:0;border-radius:50%;background:#0C4A6E;color:#BAE6FD;font-size:10px}.balance-tool-steps strong{display:block;margin-top:2px;color:#A7F3D0;font:800 13px ui-monospace,monospace}
        .balance-tool-result-wrap{margin-top:14px}.balance-tool-empty-result{padding:15px;border:1px dashed rgba(148,163,184,.25);border-radius:14px;color:#94A3B8;text-align:center;font-size:12px}.balance-tool-empty-result b{color:#BAE6FD}.balance-tool-result{padding:15px;border-radius:15px;border:1px solid}.balance-tool-result.success{border-color:#34D39966;background:linear-gradient(135deg,#064e3b66,#0f172ad9)}.balance-tool-result.warning{border-color:#FBBF2466;background:#78350f22}.balance-tool-result.warning b,.balance-tool-result.warning span{display:block}.balance-tool-result.warning b{color:#FCD34D;font-size:14px}.balance-tool-result.warning span{margin-top:4px;color:#CBD5E1;font-size:11px}.balance-tool-result-heading{display:flex;align-items:center;gap:9px}.balance-tool-result-heading>span{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#10B981;color:#052E16;font-weight:900}.balance-tool-result-heading small,.balance-tool-result-heading b{display:block}.balance-tool-result-heading small{color:#6EE7B7;font-size:9px;font-weight:900;letter-spacing:1px}.balance-tool-result-heading b{margin-top:2px;font-size:13px}.balance-tool-solution-values{display:flex;gap:9px;margin-top:14px}.balance-tool-solution-values>div{flex:1;padding:10px;border-radius:10px;background:#02061766;text-align:center}.balance-tool-solution-values small,.balance-tool-solution-values strong{display:block}.balance-tool-solution-values small{color:#94A3B8;font-size:10px}.balance-tool-solution-values strong{margin-top:3px;color:#A7F3D0;font:900 25px ui-monospace,monospace}.balance-tool-determinant{margin-top:10px;color:#64748B;font-size:10px;text-align:right}
        @media(min-width:720px){.balance-tool-balance{display:grid;grid-template-columns:minmax(0,1fr) 245px;gap:15px;align-items:center}.balance-tool-balance-title{grid-column:1/-1;margin-bottom:0}.balance-tool-equation{margin-top:0;min-height:42px;flex-direction:column;align-items:flex-start;justify-content:center}.balance-tool-equation span{display:block}}
        @media(max-width:560px){.balance-tool-content{width:min(calc(100% - 20px),980px)}.balance-tool-hero{padding:15px}.balance-tool-hero h1{font-size:17px}.balance-tool-input-grid,.balance-tool-methods{grid-template-columns:1fr}.balance-tool-input-row{gap:4px}.balance-tool-input-row>strong{font-size:10px}.balance-tool-actions{align-items:stretch;flex-direction:column}.balance-tool-actions>span{text-align:center}.balance-tool-scale{grid-template-columns:minmax(0,1fr) 54px minmax(0,1fr)}.balance-tool-equation{align-items:flex-start;flex-direction:column;gap:4px}.balance-tool-solution-values strong{font-size:21px}}
      `}</style>
    </div>
  )
}