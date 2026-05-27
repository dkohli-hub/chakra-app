import { T } from '../../utils/theme'

const TABS = [
  { key: 'Battery',    icon: '🔋', label: 'Battery' },
  { key: 'Gather',     icon: '🔮', label: 'Gather'  },
  { key: 'Time',       icon: '⏱',  label: 'Time'    },
  { key: 'Karma',      icon: '⚡',  label: 'Karma'   },
  { key: 'Gita',       icon: '📖', label: 'Gita'    },
  { key: 'Soul',       icon: '✦',  label: 'Soul'    },
  { key: 'Brain Twin', icon: '🧠', label: 'Brain'   },
  { key: 'Data',       icon: '📊', label: 'Data'    },
  { key: 'Score',      icon: '🏆', label: 'Score'   },
]

export default function TabNav({ active, onChange }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '1.25rem', paddingBottom: '4px' }}>
      <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content', paddingBottom: '2px' }}>
        {TABS.map((tab) => {
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                padding: '8px 12px',
                background: isActive ? T.teal : T.surface,
                border: isActive ? `2px solid ${T.teal}` : `1.5px solid ${T.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.18s',
                minWidth: '54px',
                boxShadow: isActive ? `0 2px 8px ${T.teal}30` : 'none',
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{tab.icon}</span>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                color: isActive ? '#FFFFFF' : T.text2,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
