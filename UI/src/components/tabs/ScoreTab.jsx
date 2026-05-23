import { computeKarmicCompletion } from '../../utils/scoring'
import { isOverdue } from '../../utils/horizonLogic'

export default function ScoreTab({ tasks, loading }) {
  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

  const pct       = computeKarmicCompletion(tasks)
  const total     = tasks.length
  const done      = tasks.filter(t => t.completed).length
  const overdue   = tasks.filter(t => !t.completed && isOverdue(t.time_horizon, t.entry_timestamp)).length
  const active    = total - done
  const mananManthan = tasks.filter(t => !t.completed && ['Manan', 'Manthan'].includes(t.bucket)).length

  const color = pct >= 70 ? '#6BCB77' : pct >= 40 ? '#C9A84C' : '#E07A5F'
  const phrase = pct < 30
    ? 'The field is full. Begin closing what you started.'
    : pct < 70
    ? 'Good momentum. Keep moving through Kriya™.'
    : 'High completion energy. The Kshetra is clear.'

  return (
    <div>
      {/* Big number display */}
      <div style={{ background: '#161B22', border: `1px solid ${color}40`, borderRadius: '12px', padding: '1.5rem', marginBottom: '0.75rem', textAlign: 'center' }}>
        <div style={{ color, fontSize: '72px', fontFamily: 'serif', fontWeight: 300, lineHeight: 1 }}>{pct}%</div>
        <div style={{ color: '#8b949e', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Karmic Completion</div>
        <p style={{ color: color, fontSize: '12px', fontStyle: 'italic', marginTop: '0.75rem', marginBottom: 0 }}>{phrase}</p>
      </div>

      {/* Three stat boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <StatBox label="Total" value={total} color="#C9A84C" />
        <StatBox label="Done" value={done} color="#6BCB77" />
        <StatBox label="Overdue" value={overdue} color={overdue > 0 ? '#B71C1C' : '#6e7681'} />
      </div>

      {/* Surrender capacity */}
      <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Surrender Capacity
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: '#0D1117', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ color: '#8b949e', fontSize: '10px', marginBottom: '4px' }}>Surrendered</div>
            <div style={{ color: '#6BCB77', fontSize: '28px', fontFamily: 'serif', fontWeight: 300 }}>{done}</div>
            <div style={{ color: '#6e7681', fontSize: '10px' }}>Completed</div>
          </div>
          <div style={{ background: '#0D1117', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ color: '#8b949e', fontSize: '10px', marginBottom: '4px' }}>In Reflection</div>
            <div style={{ color: '#c9a0f0', fontSize: '28px', fontFamily: 'serif', fontWeight: 300 }}>{mananManthan}</div>
            <div style={{ color: '#6e7681', fontSize: '10px' }}>Manan™ / Manthan™</div>
          </div>
        </div>
        <p style={{ color: '#6e7681', fontSize: '10px', fontStyle: 'italic', marginTop: '0.75rem', marginBottom: 0 }}>
          True completion is not just closure — it is conscious release.
        </p>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
      <div style={{ color: '#8b949e', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
      <div style={{ color, fontSize: '32px', fontFamily: 'serif', fontWeight: 300, lineHeight: 1 }}>{value}</div>
    </div>
  )
}
