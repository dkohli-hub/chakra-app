import { useState } from 'react'
import { computeAQ, computePQ, computeDQ, computeCQ } from '../../utils/scoring'

function QuotientTile({ label, value, color, description, archetype, children }) {
  const [open, setOpen] = useState(false)
  const isLabel = typeof value === 'string'

  return (
    <div style={{ background: '#161B22', border: `1px solid ${color}40`, borderRadius: '8px', overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: '1rem', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            <div style={{ color, fontSize: '38px', fontFamily: 'serif', fontWeight: 300, lineHeight: 1.1 }}>
              {isLabel ? value : `${value}%`}
            </div>
            {archetype && <div style={{ color: '#8b949e', fontSize: '11px', marginTop: '2px' }}>{archetype}</div>}
          </div>
          <span style={{ color: '#6e7681', fontSize: '12px', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
        </div>
        {!isLabel && (
          <div style={{ marginTop: '8px', height: '4px', background: '#21262D', borderRadius: '2px' }}>
            <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.4s' }} />
          </div>
        )}
        <p style={{ color: '#6e7681', fontSize: '11px', marginTop: '6px', marginBottom: 0 }}>{description}</p>
      </div>
      {open && <div style={{ borderTop: '1px solid #21262D', padding: '0.75rem 1rem' }}>{children}</div>}
    </div>
  )
}

export default function SoulTab({ tasks, loading }) {
  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

  const aq = computeAQ(tasks)
  const pq = computePQ(tasks)
  const dq = computeDQ(tasks)
  const cq = computeCQ(tasks)

  const dqArchetype = dq >= 60 ? 'The Deflector' : dq >= 30 ? 'The Wise Mover' : 'The Executor'

  const heavyOpen = tasks.filter(t => !t.completed && ['W4', 'W5'].includes(t.weightage)).slice(0, 5)
  const stagnant = tasks.filter(t => !t.completed && ['Dhairya', 'Vishram', 'Manan', 'Manthan'].includes(t.bucket)).slice(0, 5)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
      <QuotientTile
        label="AQ — Adaptability"
        value={aq}
        color="#4A9CC7"
        description="Items actively in motion ÷ all tasks processed"
      >
        <p style={{ color: '#8b949e', fontSize: '12px' }}>High AQ means your system is fluid — tasks are moving, not stuck.</p>
      </QuotientTile>

      <QuotientTile
        label="PQ — Performance"
        value={pq}
        color="#6BCB77"
        description="Weighted closure rate for heavy tasks (W4–W5)"
      >
        <div>
          <p style={{ color: '#8b949e', fontSize: '12px', marginBottom: '0.5rem' }}>Top open heavy tasks:</p>
          {heavyOpen.length
            ? heavyOpen.map(t => <div key={t.id} style={{ color: '#e6edf3', fontSize: '12px', padding: '3px 0', borderBottom: '1px solid #21262D' }}>{t.title}</div>)
            : <p style={{ color: '#6e7681', fontSize: '12px' }}>None — excellent.</p>}
        </div>
      </QuotientTile>

      <QuotientTile
        label="DQ — Deflection"
        value={dq}
        color="#FFB347"
        description="Tasks moved from Karya™ to holding buckets without closure"
        archetype={dqArchetype}
      >
        <div>
          <p style={{ color: '#8b949e', fontSize: '12px', marginBottom: '0.5rem' }}>Stagnant items:</p>
          {stagnant.length
            ? stagnant.map(t => <div key={t.id} style={{ color: '#e6edf3', fontSize: '12px', padding: '3px 0', borderBottom: '1px solid #21262D' }}>{t.title}</div>)
            : <p style={{ color: '#6e7681', fontSize: '12px' }}>None — all moving well.</p>}
        </div>
      </QuotientTile>

      <QuotientTile
        label="CQ — Clarity"
        value={cq.label}
        color="#c9a0f0"
        description={`Life arenas covered: ${cq.arenas} of 18`}
      >
        <div>
          <div style={{ display: 'flex', gap: '4px', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
            {['Emerging', 'Partial', 'Substantial', 'Full'].map((stage, i) => (
              <div key={stage} style={{
                flex: 1,
                background: i < ['Emerging', 'Partial', 'Substantial', 'Full'].indexOf(cq.label) + 1 ? '#c9a0f0' : '#21262D',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          {['Emerging', 'Partial', 'Substantial', 'Full'].map(s => (
            <span key={s} style={{ fontSize: '10px', color: s === cq.label ? '#c9a0f0' : '#6e7681', marginRight: '8px' }}>{s}</span>
          ))}
          <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '8px' }}>
            Expand coverage by adding tasks across more Gita chapters.
          </p>
        </div>
      </QuotientTile>
    </div>
  )
}
