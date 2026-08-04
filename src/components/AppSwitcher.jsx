import { useAuth } from '../AuthContext'

const GURU_URL = 'https://sfptjjfqgqidt4736qzont0l.157.10.161.229.sslip.io'
const BLP_URL  = 'https://nswzqjz1jnr821kuh3s9aji1.157.10.161.229.sslip.io'

// Active highlight colors per module tab
const TAB_COLORS = {
  tomat: {
    bg:     'rgba(99,102,241,0.35)',
    border: 'rgba(99,102,241,0.5)',
    text:   '#c4b5fd',
  },
  blp: {
    bg:     'rgba(16,185,129,0.28)',
    border: 'rgba(16,185,129,0.55)',
    text:   '#6ee7b7',
  },
  eob5: {
    bg:     'rgba(245,158,11,0.28)',
    border: 'rgba(245,158,11,0.55)',
    text:   '#fcd34d',
  },
}

const TABS = {
  guru: [
    { key: 'eob5',  label: 'GURU',  externalUrl: GURU_URL },
    { key: 'tomat', label: 'TOMAT', homeScreen: 'guruDashboard' },
    { key: 'blp',   label: 'BLP',   externalUrl: BLP_URL },
  ],
  siswa: [
    { key: 'tomat', label: 'TOMAT', homeScreen: 'home' },
    { key: 'blp',   label: 'BLP',   externalUrl: BLP_URL },
  ],
}

export default function AppSwitcher({ activeModule, onSwitch }) {
  const { user } = useAuth()
  if (!user) return null
  const tabs = TABS[user?.role] || TABS.siswa

  return (
    <div style={{
      display: 'flex', gap: 4, alignItems: 'center',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: 10, padding: '3px 4px',
    }}>
      {tabs.map(tab => {
        const isActive = activeModule === tab.key
        const colors = TAB_COLORS[tab.key] || TAB_COLORS.tomat
        return (
          <button
            key={tab.key}
            onClick={() => tab.externalUrl
              ? window.open(tab.externalUrl, '_blank', 'noopener,noreferrer')
              : onSwitch(tab)
            }
            title={tab.externalUrl ? `Buka ${tab.label} (tab baru)` : undefined}
            style={{
              background: isActive ? colors.bg : 'transparent',
              border: isActive ? `1px solid ${colors.border}` : '1px solid transparent',
              borderRadius: 8,
              padding: '5px 10px',
              color: isActive ? colors.text : 'rgba(255,255,255,0.5)',
              fontSize: 12,
              fontWeight: isActive ? 800 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              letterSpacing: 0.3,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {tab.label}
            {tab.externalUrl && (
              <span style={{ fontSize: 9, opacity: 0.6 }}>↗</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
