import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  danger = true,
  onClose,
  onConfirm,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      console.error(err)
      const msg = err instanceof Error && err.message ? err.message : 'Gagal memproses. Silakan coba lagi.'
      setError(msg)
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !isSubmitting && onClose()}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 60,
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
            maxWidth: 384,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{
                padding: 10, borderRadius: 12,
                background: danger ? '#fee2e2' : '#fef3c7',
              }}>
                <AlertTriangle size={20} style={{ color: danger ? '#dc2626' : '#d97706' }} />
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                style={{ padding: 6, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 17, color: '#0f172a', margin: '0 0 4px' }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{message}</p>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 500, margin: 0 }}>{error}</p>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: '#f1f5f9', color: '#334155', border: 'none', cursor: 'pointer',
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: danger ? '#dc2626' : '#059669', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
