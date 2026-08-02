import { motion, AnimatePresence } from 'motion/react'
import { X, PenLine, Mic, ListChecks, Clock, ShieldAlert, BookOpenText } from 'lucide-react'

function formatDateTime(iso) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function GuruReviewSubmissionModal({
  activityName,
  submission,
  checklistItems,
  onClose,
}) {
  const expiresAt = submission.reviewedAt
    ? new Date(new Date(submission.reviewedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
    : null

  const icon =
    submission.type === 'audio' ? <Mic size={20} style={{ color: '#059669' }} /> :
    submission.type === 'checklist' ? <ListChecks size={20} style={{ color: '#059669' }} /> :
    <PenLine size={20} style={{ color: '#059669' }} />

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
            maxWidth: 512,
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ padding: 8, background: '#d1fae5', borderRadius: 12 }}>{icon}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: 0 }}>Tugas Dikumpulkan</h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{activityName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ padding: 6, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quran ref */}
            {submission.quranRef && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: 12,
                borderRadius: 12, background: '#f8fafc', fontSize: 14, color: '#475569',
              }}>
                <BookOpenText size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <span>
                  QS. {submission.quranRef.surahName}
                  {submission.quranRef.halaman
                    ? `, Halaman ${submission.quranRef.halaman}`
                    : `, Ayat ${submission.quranRef.ayatFrom}${submission.quranRef.ayatTo !== submission.quranRef.ayatFrom ? `-${submission.quranRef.ayatTo}` : ''}`}
                </span>
              </div>
            )}

            {/* Content area */}
            {submission.expired ? (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16,
                borderRadius: 16, background: '#fffbeb', border: '1px solid #fde68a',
                fontSize: 14, color: '#92400e',
              }}>
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0 }}>Rekaman/berkas ini sudah otomatis dihapus dari server 7 hari setelah pertama kali Anda tinjau, sesuai kebijakan penyimpanan data.</p>
              </div>
            ) : submission.type === 'audio' && submission.content ? (
              <audio src={submission.content} controls style={{ width: '100%' }} />
            ) : submission.type === 'checklist' && checklistItems ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {checklistItems.map(item => {
                  const checked = !!(submission.items?.[item.id])
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: 12, borderRadius: 12, fontSize: 14,
                        background: checked ? '#ecfdf5' : '#f8fafc',
                        border: `1px solid ${checked ? '#6ee7b7' : '#e2e8f0'}`,
                        color: checked ? '#065f46' : '#94a3b8',
                      }}
                    >
                      <span>{checked ? '✓' : '○'}</span>
                      {item.label}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{
                whiteSpace: 'pre-wrap', fontSize: 14, color: '#334155',
                background: '#f8fafc', padding: 16, borderRadius: 16,
                lineHeight: 1.6, margin: 0,
              }}>
                {submission.content || '(Tidak ada isi)'}
              </p>
            )}

            {/* Footer timestamps */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              paddingTop: 12, borderTop: '1px solid #f1f5f9',
              fontSize: 12, color: '#94a3b8',
            }}>
              <Clock size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <p style={{ margin: 0 }}>Dikumpulkan: {formatDateTime(submission.recordedAt)}</p>
                {submission.type === 'audio' && (
                  submission.expired ? (
                    <p style={{ margin: 0 }}>Berkas dihapus otomatis: {formatDateTime(expiresAt?.toISOString())}</p>
                  ) : expiresAt ? (
                    <p style={{ margin: 0 }}>Berkas akan terhapus otomatis pada: {formatDateTime(expiresAt.toISOString())}</p>
                  ) : (
                    <p style={{ margin: 0 }}>Berkas akan otomatis terhapus 7 hari setelah pertama kali ditinjau.</p>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
