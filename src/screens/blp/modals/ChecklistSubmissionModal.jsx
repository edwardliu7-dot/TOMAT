import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ListChecks, Check } from 'lucide-react'

export default function ChecklistSubmissionModal({
  title,
  activityName,
  items,
  initialValues,
  onClose,
  onSubmit,
}) {
  const [checked, setChecked] = useState(() => {
    const initial = {}
    items.forEach(item => {
      initial[item.id] = !!(initialValues?.[item.id])
    })
    return initial
  })

  const checkedCount = items.filter(item => checked[item.id]).length
  const isValid = checkedCount === items.length

  const toggleItem = id => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
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
                  <ListChecks size={20} style={{ color: '#059669' }} />
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

            {/* Checklist items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(item => {
                const isChecked = !!checked[item.id]
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 16, textAlign: 'left',
                      background: isChecked ? '#ecfdf5' : '#f8fafc',
                      border: `1px solid ${isChecked ? '#6ee7b7' : '#e2e8f0'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      flexShrink: 0, width: 24, height: 24, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isChecked ? '#059669' : 'transparent',
                      border: `2px solid ${isChecked ? '#059669' : '#cbd5e1'}`,
                      color: isChecked ? '#fff' : 'transparent',
                      transition: 'all 0.15s',
                    }}>
                      <Check size={14} />
                    </span>
                    <span style={{
                      fontWeight: 500, fontSize: 14,
                      color: isChecked ? '#065f46' : '#334155',
                    }}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Count */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                {checkedCount}/{items.length} sudah disiapkan
              </span>
            </div>

            {/* Submit */}
            <button
              onClick={() => isValid && onSubmit(checked)}
              disabled={!isValid}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: isValid ? '#059669' : '#e2e8f0', color: isValid ? '#fff' : '#94a3b8',
                padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 14,
                border: 'none', cursor: isValid ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
              }}
            >
              <ListChecks size={16} />
              Kirim &amp; Tandai Selesai
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
