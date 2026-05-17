import { useState } from 'react'
import { computeRajas, computeTamas, computeSattva, computeClutter, gunaLabel, agingDays } from '../../utils/scoring'

function GunaTile({ label, value, color, punchline, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#161B22', border: `1px solid ${color}40`, borderRadius: '8px', overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: '1rem', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            <div style={{ color, fontSize: '38px', fontFamily: 'serif', fontWeight: 300, lineHeight: 1 }}>{value}%</div>
          </div>
          <span style={{ color: '#6e7681', fontSize: '12px', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
        </div>
        <div style={{ marginTop: '8px', height: '5px', background: '#21262D', borderRadius: '2px' }}>
          <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.4s' }} />
        </div>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid #21262D', padding: '0.75rem 1rem' }}>
          <p style={{ color: '#8b949e', fontSize: '11px', fontStyle: 'italic', marginBottom: '0.75rem' }}>{punchline}</p>
          {children}
        </div>
      )}
    </div>
  )
}

function HBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ color: '#8b949e', fontSize: '11px' }}>{label}</span>
        <span style={{ color, fontSize: '11px', fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{ height: '6px', background: '#21262D', borderRadius: '3px' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

export default function BrainTwinTab({ tasks, loading }) {
  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

  const rajas = computeRajas(tasks)
  const tamas = computeTamas(tasks)
  const sattva = computeSattva(tasks)
  const clutter = computeClutter(tasks)
  const narrative = gunaLabel(rajas, tamas, sattva)

  const active = tasks.filter(t => !t.completed)
  const topHeavy = active.filter(t => ['W4', 'W5'].includes(t.weightage)).slice(0, 5)
  const topStagnant = active.filter(t => ['Dhairya', 'Vishram', 'Manan', 'Manthan'].includes(t.bucket) && agingDays(t.entry_timestamp) > 14)
    .sort((a, b) => agingDays(b.entry_timestamp) - agingDays(a.entry_timestamp)).slice(0, 5)
  const topSattvic = active.filter(t => ['Manan', 'Manthan'].includes(t.bucket)).slice(0, 5)

  const nudge = rajas > 60
    ? 'Move at least 2 heavy tasks to Vishram™ or Manthan™. Rest is strategy.'
    : tamas > 60
    ? 'Pick one stagnant task. Move it to Karya™ today. Motion breaks inertia.'
    : sattva > 60
    ? 'Beautiful clarity. Now act on one Manan™ insight before it fades.'
    : 'Your gunas are balanced. Continue with deliberate action.'

  return (
    <div>
      {/* Guna tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <GunaTile label="Rajas — Inertia of Motion" value={rajas} color="#E07A5F"
          punchline="These items are driving most of your mental activity right now.">
          {topHeavy.length
            ? topHeavy.map(t => <div key={t.id} style={{ fontSize: '12px', color: '#e6edf3', padding: '3px 0', borderBottom: '1px solid #21262D' }}>
                <span style={{ color: '#E07A5F', fontSize: '10px', marginRight: '4px' }}>{t.weightage}</span>{t.title}
              </div>)
            : <p style={{ color: '#6e7681', fontSize: '12px' }}>No heavy tasks.</p>}
        </GunaTile>

        <GunaTile label="Tamas — Inertia of Rest" value={tamas} color="#A8A8C8"
          punchline="These items have been waiting. Some may need a decision.">
          {topStagnant.length
            ? topStagnant.map(t => <div key={t.id} style={{ fontSize: '12px', color: '#e6edf3', padding: '3px 0', borderBottom: '1px solid #21262D' }}>
                <span style={{ color: '#A8A8C8', fontSize: '10px', marginRight: '4px' }}>{agingDays(t.entry_timestamp)}d</span>{t.title}
              </div>)
            : <p style={{ color: '#6e7681', fontSize: '12px' }}>No stagnant items.</p>}
        </GunaTile>

        <GunaTile label="Sattva — Clarity of Thought" value={sattva} color="#6BCB77"
          punchline="Items in conscious contemplation — placed deliberately, not by default.">
          {topSattvic.length
            ? topSattvic.map(t => <div key={t.id} style={{ fontSize: '12px', color: '#e6edf3', padding: '3px 0', borderBottom: '1px solid #21262D' }}>
                <span style={{ color: '#6BCB77', fontSize: '10px', marginRight: '4px' }}>{t.bucket}</span>{t.title}
              </div>)
            : <p style={{ color: '#6e7681', fontSize: '12px' }}>No contemplation items.</p>}
        </GunaTile>
      </div>

      {/* Clutter Quality */}
      <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ color: '#C9A84C', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Clutter Quality</div>
        <HBar label="Small irritants (W1–W2)" value={clutter.small} color="#6BCB77" />
        <HBar label="Large tasks (W3–W4)" value={clutter.large} color="#C9A84C" />
        <HBar label="Humongous (W5)" value={clutter.huge} color="#E07A5F" />
      </div>

      {/* Narrative */}
      <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ color: '#C9A84C', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>What Your Mind Is Saying</div>
        <p style={{ color: '#8b949e', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>"{narrative}"</p>
      </div>

      {/* Nudge */}
      <div style={{ background: '#0D2A1A', border: '1px solid #1A6B5A', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ color: '#00BFA5', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>A Gentle Pointer</div>
        <p style={{ color: '#e6edf3', fontSize: '13px', margin: 0 }}>{nudge}</p>
      </div>
    </div>
  )
}
