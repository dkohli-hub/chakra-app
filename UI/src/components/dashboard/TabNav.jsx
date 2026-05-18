const TABS = [
  { key: 'Gather',     icon: '✦' },
  { key: 'Time',       icon: '◷' },
  { key: 'Karma',      icon: '☯' },
  { key: 'Gita',       icon: 'ॐ' },
  { key: 'Soul',       icon: '◈' },
  { key: 'Soul Says',  icon: '♡' },
  { key: 'Brain Twin', icon: '⌬' },
  { key: 'Kshetra',    icon: '▦' },
  { key: 'Data',       icon: '▣' },
  { key: 'Score',      icon: '✪' },
  { key: 'Profile',    icon: '❋' },
]

export default function TabNav({ active, onChange }) {
  return (
    <>
      <style>{`
        .tab-circle {
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .tab-circle:hover {
          transform: scale(1.08);
        }
        .tab-circle.active-tab {
          animation: tabPop 0.2s ease;
        }
        @keyframes tabPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div style={{ overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content', padding: '0.25rem 0.1rem' }}>
          {TABS.map((tab) => {
            const isActive = active === tab.key
            return (
              <div key={tab.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <button
                  className={`tab-circle${isActive ? ' active-tab' : ''}`}
                  onClick={() => onChange(tab.key)}
                  title={tab.key}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: isActive ? '2px solid #C9A84C' : '2px solid #21262D',
                    background: isActive ? '#1A6B5A' : '#161B22',
                    color: isActive ? '#C9A84C' : '#6e7681',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isActive ? '0 0 10px rgba(201,168,76,0.25)' : 'none',
                    padding: 0,
                  }}
                >
                  {tab.icon}
                </button>
                <span style={{
                  fontSize: '9px',
                  color: isActive ? '#C9A84C' : '#3a4a40',
                  letterSpacing: '0.03em',
                  maxWidth: '44px',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}>
                  {tab.key}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
