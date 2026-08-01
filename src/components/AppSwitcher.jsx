import { useAuth } from '../AuthContext'

const TABS = {
  guru: [
    { key: 'tomat', label: 'TOMAT',   emoji: '🍅', homeScreen: 'guruDashboard' },
    { key: 'blp',   label: 'BLP',     emoji: '📋', homeScreen: 'blp-home' },
    { key: 'eob5',  label: 'GURU',    emoji: '🏫', homeScreen: 'eob5-dashboard' },
  ],
  siswa: [
    { key: 'tomat', label: 'TOMAT',   emoji: '🍅', homeScreen: 'home' },
    { key: 'blp',   label: 'BLP',     emoji: '📋', homeScreen: 'blp-home' },
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
        return (
          <button
            key={tab.key}
            onClick={() => onSwitch(tab)}
            style={{
              background: isActive ? 'rgba(99,102,241,0.35)' : 'transparent',
              border: isActive ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent',
              borderRadius: 8,
              padding: '5px 10px',
              color: isActive ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
              fontSize: 12,
              fontWeight: isActive ? 800 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              letterSpacing: 0.3,
            }}
          >
            {tab.emoji} {tab.label}
          </button>
        )
      })}
    </div>
  )
}
