import { BUCKET_COLORS, LIFE_AREA_COLORS } from '../../utils/colorSystem'

const BUCKETS = ['Karya', 'Dhairya', 'Vishram', 'Manan', 'Manthan', 'Tyaga', 'Prarabdha']
const LIFE_AREAS = ['Personal/Family', 'Work/Employment', 'Picturizze', 'Other']
const W_LABELS = { W1: '5–10 min', W2: '20–30 min', W3: '1 hour', W4: 'Half day', W5: 'Full day' }
const W_COLORS = { W1: '#6BCB77', W2: '#4A9CC7', W3: '#C9A84C', W4: '#FFB347', W5: '#E07A5F' }

function MiniBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round(count / total * 100) : 0
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ color: '#8b949e', fontSize: '11px' }}>{label}</span>
        <span style={{ color, fontSize: '11px' }}>{count}</span>
      </div>
      <div style={{ height: '6px', background: '#21262D', borderRadius: '3px' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

export default function ProfileTab({ tasks, loading }) {
  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

  const active = tasks.filter(t => !t.completed)
  const total = active.length

  return (
    <div>
      {/* Ashram Profile */}
      <div style={{ background: '#161B22', border: '1px solid #C9A84C40', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Ashram Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
          {[
            { stage: 'Brahmacharya', name: 'Mila', note: 'New to life' },
            { stage: 'Grihastha', name: 'Dhruv', note: 'Householder' },
            { stage: 'Vanaprastha', name: 'DK', note: 'Forest stage', highlight: true },
            { stage: 'Sannyasa', name: 'Father', note: 'Full surrender' },
          ].map(a => (
            <div key={a.stage} style={{ background: a.highlight ? '#0D2A1A' : '#0D1117', border: `1px solid ${a.highlight ? '#1A6B5A' : '#21262D'}`, borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
              <div style={{ color: a.highlight ? '#00BFA5' : '#6e7681', fontSize: '10px', fontWeight: 700 }}>{a.stage}</div>
              <div style={{ color: a.highlight ? '#e6edf3' : '#8b949e', fontSize: '13px', fontFamily: 'serif' }}>{a.name}</div>
              <div style={{ color: '#6e7681', fontSize: '10px', fontStyle: 'italic' }}>{a.note}</div>
            </div>
          ))}
        </div>
        <p style={{ color: '#6e7681', fontSize: '11px', fontStyle: 'italic', marginTop: '0.75rem', marginBottom: 0 }}>
          Vanaprastha: The forest dweller stage — withdrawing from attachment, preparing for Sannyasa. Your karma is being processed deliberately.
        </p>
      </div>

      {/* Life Area Distribution */}
      <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Life Area Distribution</div>
        {LIFE_AREAS.map(la => (
          <MiniBar key={la} label={la} count={active.filter(t => t.life_area === la).length} total={total} color={LIFE_AREA_COLORS[la] ?? '#8b949e'} />
        ))}
        <MiniBar label="Unassigned" count={active.filter(t => !t.life_area).length} total={total} color="#6e7681" />
      </div>

      {/* Weightage Distribution */}
      <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Weightage Distribution</div>
        {['W1', 'W2', 'W3', 'W4', 'W5'].map(w => (
          <MiniBar
            key={w}
            label={`${w} — ${W_LABELS[w]}`}
            count={active.filter(t => t.weightage === w).length}
            total={total}
            color={W_COLORS[w]}
          />
        ))}
      </div>
    </div>
  )
}
