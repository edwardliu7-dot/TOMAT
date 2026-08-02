import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Send, PenLine } from 'lucide-react'

export default function TextSubmissionModal({
  title,
  activityName,
  placeholder,
  minChars,
  initialValue = '',
  onClose,
  onSubmit,
}) {
  const [text, setText] = useState(initialValue)
  const charCount = text.trim().length
  const isValid = minChars ? charCount >= minChars : text.trim().length > 0

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
                <div style={{ padding: 8, background: '#d1fae5', borderRadius: 12 }}>
                  <PenLine size={20} style={{ color: '#059669' }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: 0 }}>{title}</h3>
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

            {/* Textarea */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={placeholder}
              rows={8}
              autoFocus
              style={{
                width: '100%', padding: 16, border: '1px solid #e2e8f0',
                borderRadius: 16, fontSize: 14, lineHeight: 1.6,
                background: '#f8fafc', color: '#0f172a', resize: 'none',
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />

            {/* Char count */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                {minChars ? `${charCount}/${minChars} karakter` : `${charCount} karakter`}
              </span>
            </div>

            {/* Submit */}
            <button
              onClick={() => isValid && onSubmit(text.trim())}
              disabled={!isValid}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: isValid ? '#059669' : '#e2e8f0', color: isValid ? '#fff' : '#94a3b8',
                padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 14,
                border: 'none', cursor: isValid ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
              }}
            >
              <Send size={16} />
              Kirim &amp; Tandai Selesai
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
