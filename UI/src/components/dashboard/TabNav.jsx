const TABS = ['Gather', 'Time', 'Karma', 'Gita', 'Soul', 'Soul Says', 'Brain Twin', 'Kshetra', 'Data', 'Score', 'Profile']

export default function TabNav({ active, onChange }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', borderBottom: '2px solid #C9A84C', minWidth: 'max-content' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              padding: '0.55rem 0.9rem',
              background: active === tab ? '#1A6B5A' : 'transparent',
              color: active === tab ? '#fff' : '#C9A84C',
              border: 'none',
              cursor: 'pointer',
              fontWeight: active === tab ? 700 : 400,
              fontSize: '12px',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
