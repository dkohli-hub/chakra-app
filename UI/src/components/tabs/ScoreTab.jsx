import { computeKarmicCompletion } from '../../utils/scoring'

function KarmicArc({ pct }) {
  const color = pct >= 70 ? '#6BCB77' : pct >= 40 ? '#C9A84C' : '#E07A5F'

  // Use a semicircular arc via stroke-dasharray on a circle
  // r=60, circumference = 2*PI*60 = ~376.99
  // We only show the top half = half circumference = ~188.5
  const r = 60
  const circ = 2 * Math.PI * r
  const half = circ / 2
  const filled = (pct / 100) * half

  return (
    <div style={{ position: 'relative', width: '200px', margin: '0 auto 0.5rem' }}>
      <svg viewBox="0 0 160 90" style={{ width: '100%', overflow: 'visible' }}>
        {/* Background semicircle — rotated so flat side is at bottom */}
        <circle
          cx="80" cy="80" r={r}
          fill="none"
          stroke="#21262D"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${half} ${circ}`}
          strokeDashoffset={circ * 0.25}
          transform="rotate(180 80 80)"
        />
        {/* Filled arc */}
        {pct > 0 && (
          <circle
            cx="80" cy="80" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            strokeDashoffset={circ * 0.25}
            transform="rotate(180 80 80)"
            style={{ filter: `drop-shadow(0 0 5px ${color}80)`, transition: 'stroke-dasharray 0.6s ease' }}
          />
        )}
        {/* Percentage */}
        <text x="80" y="68" textAnchor="middle" fill={color} fontSize="26" fontFamily="Georgia, serif" fontWeight="300">
          {pct}%
        </text>
        {/* Label */}
        <text x="80" y="84" textAnchor="middle" fill="#8b949e" fontSize="9.5" fontFamily="system-ui">
          Karmic Completion
        </text>
      </svg>
    </div>
  )
}

export default function ScoreTab({ tasks, loading }) {
  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

  const pct = computeKarmicCompletion(tasks)
  const mananManthan = tasks.filter(t => !t.completed && ['Manan', 'Manthan'].includes(t.bucket)).length
  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length
  const color = pct >= 70 ? '#6BCB77' : pct >= 40 ? '#C9A84C' : '#E07A5F'

  return (
    <div>
      <div style={{ background: '#161B22', border: `1px solid ${color}40`, borderRadius: '12px', padding: '2rem 1.5rem 1.5rem', marginBottom: '0.75rem', textAlign: 'center' }}>
        <KarmicArc pct={pct} />
        <p style={{ color: '#6e7681', fontSize: '12px', marginTop: '0.5rem' }}>
          {completed} of {total} tasks completed through Karya™
        </p>
        {pct < 30 && <p style={{ color: '#E07A5F', fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>The field is full. Begin closing what you started.</p>}
        {pct >= 30 && pct < 70 && <p style={{ color: '#FFB347', fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>Good momentum. Keep moving through Kriya™.</p>}
        {pct >= 70 && <p style={{ color: '#6BCB77', fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}>High completion energy. The Kshetra is clear.</p>}
      </div>

      <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Surrender Capacity
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: '#0D1117', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ color: '#8b949e', fontSize: '10px', marginBottom: '4px' }}>Behavioral</div>
            <div style={{ color: '#6BCB77', fontSize: '28px', fontFamily: 'serif', fontWeight: 300 }}>{completed}</div>
            <div style={{ color: '#6e7681', fontSize: '10px' }}>Surrendered</div>
          </div>
          <div style={{ background: '#0D1117', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ color: '#8b949e', fontSize: '10px', marginBottom: '4px' }}>Spiritual</div>
            <div style={{ color: '#c9a0f0', fontSize: '28px', fontFamily: 'serif', fontWeight: 300 }}>{mananManthan}</div>
            <div style={{ color: '#6e7681', fontSize: '10px' }}>In Manan™ / Manthan™</div>
          </div>
        </div>
        <p style={{ color: '#6e7681', fontSize: '10px', fontStyle: 'italic', marginTop: '0.75rem', marginBottom: 0 }}>
          True completion is not just closure — it is conscious release.
        </p>
      </div>
    </div>
  )
}
