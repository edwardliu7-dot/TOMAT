import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Settings2, Loader2, Save } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export default function BlpPeriodModal({
  kelasOptions,
  monthDate,
  blpPeriods,
  getPeriodKey,
  onClose,
  onSave,
}) {
  const [kelas, setKelas] = useState(kelasOptions[0] || '')
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const existing = kelas ? blpPeriods[getPeriodKey(kelas, monthDate)] : undefined
  const [startDay, setStartDay] = useState(existing?.startDay ?? 1)
  const [endDay, setEndDay] = useState(existing?.endDay ?? daysInMonth)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleKelasChange = newKelas => {
    setKelas(newKelas)
    const p = blpPeriods[getPeriodKey(newKelas, monthDate)]
    setStartDay(p?.startDay ?? 1)
    setEndDay(p?.endDay ?? daysInMonth)
    setSuccess(false)
  }

  const handleSave = async () => {
    setError(null)
    if (startDay < 1 || endDay > daysInMonth || endDay < startDay) {
      setError(`Rentang tanggal harus antara 1 - ${daysInMonth}, dan tanggal akhir tidak boleh lebih kecil dari tanggal awal.`)
      return
    }
    setIsSaving(true)
    try {
      await onSave(kelas, monthDate.getFullYear(), monthDate.getMonth() + 1, startDay, endDay)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 50,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: '24px 24px 0 0',
            width: '100%',
            maxWidth: 448,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 8, background: '#dbeafe', borderRadius: 12 }}>
                  <Settings2 size={20} style={{ color: '#2563eb' }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: 0 }}>Hari Aktif BLP</h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    {format(monthDate, 'MMMM yyyy', { locale: localeId })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ padding: 6, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Atur rentang tanggal penilaian BLP untuk kelas ini di bulan tersebut. Isian siswa di luar
              rentang ini tetap tersimpan, tapi tidak akan dihitung ke rata-rata nilai/rekap bulanan.
            </p>

            {/* Kelas select */}
            {kelasOptions.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Kelas</label>
                <select
                  value={kelas}
                  onChange={e => handleKelasChange(e.target.value)}
                  style={{
                    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 12, padding: '10px 12px', fontSize: 14, color: '#0f172a',
                  }}
                >
                  {kelasOptions.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            )}

            {/* Date range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Tanggal mulai</label>
                <input
                  type="number"
                  min={1}
                  max={daysInMonth}
                  value={startDay}
                  onChange={e => { setStartDay(Number(e.target.value)); setSuccess(false) }}
                  style={{
                    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 12, padding: '10px 12px', fontSize: 14, color: '#0f172a',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>Tanggal selesai</label>
                <input
                  type="number"
                  min={1}
                  max={daysInMonth}
                  value={endDay}
                  onChange={e => { setEndDay(Number(e.target.value)); setSuccess(false) }}
                  style={{
                    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 12, padding: '10px 12px', fontSize: 14, color: '#0f172a',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {error && <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 500, margin: 0 }}>{error}</p>}
            {success && !error && <p style={{ fontSize: 12, color: '#059669', fontWeight: 500, margin: 0 }}>Tersimpan.</p>}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving || !kelas}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: isSaving || !kelas ? '#93c5fd' : '#2563eb', color: '#fff',
                padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 14,
                border: 'none', cursor: isSaving || !kelas ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
              }}
            >
              {isSaving
                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                : <Save size={18} />}
              Simpan
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
