import React, { useEffect, useState } from 'react'
import { TopBar } from '../components/shared'
import { useAuth } from '../AuthContext'

const CATEGORY_OPTIONS = [
  ['Gameplay', 'Game atau soal bermasalah'],
  ['Tampilan', 'Layout, tombol, atau visual'],
  ['Login', 'Masuk atau akun'],
  ['Performa', 'Lambat, macet, atau keluar sendiri'],
  ['Lainnya', 'Masalah lain'],
]

const STATUS_META = {
  baru: { label: 'Baru', color: '#FBBF24', background: 'rgba(251,191,36,0.12)' },
  diproses: { label: 'Sedang ditinjau', color: '#67E8F9', background: 'rgba(103,232,249,0.12)' },
  selesai: { label: 'Selesai', color: '#34D399', background: 'rgba(52,211,153,0.12)' },
  ditolak: { label: 'Tidak dapat diproses', color: '#FCA5A5', background: 'rgba(248,113,113,0.12)' },
}

const SEVERITY_META = {
  rendah: { label: 'Rendah', color: '#94A3B8' },
  sedang: { label: 'Sedang', color: '#FBBF24' },
  tinggi: { label: 'Tinggi', color: '#F87171' },
}

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function FieldLabel({ children, required = false }) {
  return (
    <label style={{
      display: 'block', fontSize: 11, color: '#94A3B8', fontWeight: 800,
      letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 7,
    }}>
      {children} {required && <span style={{ color: '#F87171' }}>*</span>}
    </label>
  )
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', borderRadius: 12,
  border: '1px solid rgba(148,163,184,0.16)', background: '#0D1728',
  color: '#F8FAFC', padding: '12px 13px', font: 'inherit', fontSize: 13,
  outline: 'none',
}

export default function BugReportScreen({ goBack }) {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState({
    category: 'Gameplay',
    title: '',
    description: '',
    screen: '',
    severity: 'sedang',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const loadReports = async () => {
    setLoadError('')
    try {
      const response = await fetch('/api/bug-reports', { credentials: 'include' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Gagal memuat riwayat laporan.')
      setReports(data.reports || [])
    } catch (error) {
      setLoadError(error.message || 'Gagal memuat riwayat laporan.')
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => { loadReports() }, [])

  const updateField = (key, value) => {
    setForm(previous => ({ ...previous, [key]: value }))
    setSubmitError('')
    setSubmitSuccess(false)
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setSubmitError('')
    setSubmitSuccess(false)
    setSubmitting(true)
    try {
      const response = await fetch('/api/bug-reports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          deviceInfo: window.Capacitor ? 'Aplikasi Android' : 'Web',
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Gagal mengirim laporan.')
      setReports(previous => [data.report, ...previous])
      setForm(previous => ({ ...previous, title: '', description: '', screen: '' }))
      setSubmitSuccess(true)
    } catch (error) {
      setSubmitError(error.message || 'Gagal mengirim laporan.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg,#071321 0%,#0A1424 100%)',
      color: '#fff', fontFamily: 'system-ui, sans-serif',
    }}>
      <TopBar title="Laporkan Bug 🐞" onBack={goBack} accentColor="#F97316" />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '18px 16px 64px' }}>
        <section style={{
          borderRadius: 20, padding: '20px 18px', marginBottom: 18,
          background: 'linear-gradient(135deg,rgba(249,115,22,0.14),rgba(99,102,241,0.08))',
          border: '1px solid rgba(249,115,22,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
            <div style={{
              width: 44, height: 44, flexShrink: 0, borderRadius: 14,
              display: 'grid', placeItems: 'center', fontSize: 23,
              background: 'rgba(249,115,22,0.16)',
            }}>🐞</div>
            <div>
              <h1 style={{ margin: '0 0 5px', fontSize: 18, fontWeight: 900 }}>Ada masalah di SMARTISA?</h1>
              <p style={{ margin: 0, color: '#CBD5E1', fontSize: 13, lineHeight: 1.6 }}>
                Ceritakan apa yang terjadi. Laporanmu akan membantu kami memperbaiki pengalaman belajar.
              </p>
            </div>
          </div>
        </section>

        <section style={{
          background: '#111C2E', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, overflow: 'hidden', marginBottom: 26,
        }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg,#F97316,#FBBF24)' }} />
          <form onSubmit={handleSubmit} style={{ padding: 18 }}>
            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>Kategori</FieldLabel>
              <select value={form.category} onChange={event => updateField('category', event.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
                {CATEGORY_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>Judul singkat</FieldLabel>
              <input
                value={form.title}
                onChange={event => updateField('title', event.target.value.slice(0, 120))}
                placeholder="Contoh: Jawaban benar tidak mendapat koin"
                maxLength={120}
                required
                style={inputStyle}
              />
              <div style={{ textAlign: 'right', color: '#475569', fontSize: 10, marginTop: 5 }}>{form.title.length}/120</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>Apa yang terjadi?</FieldLabel>
              <textarea
                value={form.description}
                onChange={event => updateField('description', event.target.value.slice(0, 2000))}
                placeholder="Jelaskan langkah yang kamu lakukan dan hasil yang muncul..."
                maxLength={2000}
                required
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 118, lineHeight: 1.55 }}
              />
              <div style={{ textAlign: 'right', color: '#475569', fontSize: 10, marginTop: 5 }}>{form.description.length}/2000</div>
            </div>

            <div className="tomat-bug-report-screen-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12, marginBottom: 18 }}>
              <div>
                <FieldLabel>Terjadi di halaman</FieldLabel>
                <input
                  value={form.screen}
                  onChange={event => updateField('screen', event.target.value.slice(0, 120))}
                  placeholder="Contoh: Zona Kelas 8"
                  maxLength={120}
                  style={inputStyle}
                />
              </div>
              <div>
                <FieldLabel>Tingkat dampak</FieldLabel>
                <select value={form.severity} onChange={event => updateField('severity', event.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
                  <option value="rendah">Rendah — masih bisa digunakan</option>
                  <option value="sedang">Sedang — mengganggu</option>
                  <option value="tinggi">Tinggi — tidak bisa digunakan</option>
                </select>
              </div>
            </div>

            {submitError && <div role="alert" style={{ marginBottom: 12, borderRadius: 11, padding: '10px 12px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.35)', color: '#FCA5A5', fontSize: 12 }}>{submitError}</div>}
            {submitSuccess && <div role="status" style={{ marginBottom: 12, borderRadius: 11, padding: '10px 12px', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.35)', color: '#6EE7B7', fontSize: 12 }}>Laporan berhasil dikirim. Terima kasih sudah membantu!</div>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', border: 0, borderRadius: 13, padding: '13px 16px',
                background: submitting ? '#475569' : 'linear-gradient(135deg,#F97316,#EA580C)',
                color: '#fff', font: 'inherit', fontSize: 13, fontWeight: 900,
                cursor: submitting ? 'wait' : 'pointer', boxShadow: submitting ? 'none' : '0 8px 22px rgba(249,115,22,0.22)',
              }}
            >
              {submitting ? 'Mengirim laporan...' : 'Kirim Laporan'}
            </button>
            <div style={{ marginTop: 10, color: '#64748B', textAlign: 'center', fontSize: 11 }}>
              Dilaporkan sebagai {user?.name || user?.username || 'pengguna'} · {window.Capacitor ? 'Aplikasi Android' : 'Web'}
            </div>
          </form>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 11 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900 }}>Laporan Saya</h2>
              <div style={{ color: '#64748B', fontSize: 11, marginTop: 3 }}>Pantau perkembangan aduan yang pernah dikirim</div>
            </div>
            {reports.length > 0 && <span style={{ color: '#94A3B8', fontSize: 11 }}>{reports.length} laporan</span>}
          </div>

          {loadingReports && <div style={{ padding: 22, color: '#64748B', textAlign: 'center', fontSize: 12 }}>Memuat laporan...</div>}
          {loadError && <div style={{ padding: 14, borderRadius: 12, background: 'rgba(248,113,113,0.1)', color: '#FCA5A5', fontSize: 12 }}>{loadError}</div>}
          {!loadingReports && !loadError && reports.length === 0 && (
            <div style={{ padding: '28px 18px', textAlign: 'center', borderRadius: 16, border: '1px dashed rgba(148,163,184,0.2)', color: '#64748B' }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>📭</div>
              <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 700 }}>Belum ada laporan</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Riwayat laporanmu akan muncul di sini.</div>
            </div>
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {reports.map(report => {
              const status = STATUS_META[report.status] || STATUS_META.baru
              const severity = SEVERITY_META[report.severity] || SEVERITY_META.sedang
              return (
                <article key={report.id} style={{
                  background: '#111C2E', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: 15,
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#F8FAFC', fontSize: 13, fontWeight: 800, lineHeight: 1.4 }}>{report.title}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7, alignItems: 'center' }}>
                        <span style={{ color: '#C4B5FD', fontSize: 10, fontWeight: 700 }}>{report.category}</span>
                        <span style={{ color: '#475569' }}>·</span>
                        <span style={{ color: severity.color, fontSize: 10, fontWeight: 700 }}>Dampak {severity.label}</span>
                        <span style={{ color: '#475569' }}>·</span>
                        <span style={{ color: '#64748B', fontSize: 10 }}>{formatDate(report.created_at)}</span>
                      </div>
                    </div>
                    <span style={{ flexShrink: 0, padding: '5px 8px', borderRadius: 8, color: status.color, background: status.background, fontSize: 10, fontWeight: 800 }}>
                      {status.label}
                    </span>
                  </div>
                  <p style={{ margin: '11px 0 0', color: '#94A3B8', fontSize: 12, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{report.description}</p>
                  {report.screen && <div style={{ marginTop: 9, color: '#64748B', fontSize: 10 }}>Lokasi: {report.screen}</div>}
                  {report.admin_note && <div style={{ marginTop: 11, padding: '9px 10px', borderRadius: 9, background: 'rgba(99,102,241,0.1)', color: '#C4B5FD', fontSize: 11, lineHeight: 1.5 }}>Catatan tim: {report.admin_note}</div>}
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <style>{`
        input:focus, textarea:focus, select:focus { border-color: rgba(249,115,22,.7) !important; box-shadow: 0 0 0 3px rgba(249,115,22,.1); }
        @media (max-width: 520px) {
          .tomat-bug-report-screen-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}