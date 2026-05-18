import { computeKarmicCompletion } from '../../utils/scoring'

function KarmicArc({ pct }) {
  const r = 80
  const cx = 110, cy = 110
  const color = pct >= 70 ? '#6BCB77' : pct >= 40 ? '#C9A84C' : '#E07A5F'

  const toRad = deg => (deg - 90) * Math.PI / 180
  function arcPath(startDeg, endDeg) {
    const x1 = cx + r * Math.cos(toRad(startDeg))
    const y1 = cy + r * Math.sin(toRad(startDeg))
    const x2 = cx + r * Math.cos(toRad(endDeg))
    const y2 = cy + r * Math.sin(toRad(endDeg))
    const large = endDeg - startDeg > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  // Full semicircle from 180° to 360° (left to right across the top)
  const endDeg = 180 + (pct / 100) * 180

  return (
    <svg viewBox="0 0 220 130" style={{ width: '100%', maxWidth: '300px', display: 'block', margin: '0 auto', overflow: 'visible' }}>
      {/* Background arc */}
      <path d={arcPath(180, 360)} fill="none" stroke="#21262D" strokeWidth="12" strokeLinecap="round" />
      {/* Filled arc */}
      {pct > 0 && (
        <path
          d={arcPath(180, Math.min(endDeg, 360))}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      )}
      {/* Center % */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill={color} fontSize="36" fontFamily="Georgia, serif" fontWeight="300">
        {pct}%
      </text>
      {/* Label */}
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#6e7681" fontSize="11" fontFamily="system-ui">
        Karmic Completion
      </text>
    </svg>
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
      <div style={{ background: '#161B22', border: `1px solid ${color}50`, borderRadius: '12px', padding: '2rem 1.5rem 1.5rem', marginBottom: '0.75rem', textAlign: 'center' }}>
        <KarmicArc pct={pct} />
        <p style={{ color: '#6e7681', fontSize: '12px', marginTop: '1rem' }}>
          {completed} of {total} tasks completed through Karya™
        </p>
        {pct < 30 && (
          <p style={{ color: '#E07A5F', fontSize: '12px', fontStyle: 'italic', marginTop: '0.25rem' }}>
            The field is full. Begin closing what you started.
          </p>
        )}
        {pct >= 30 && pct < 70 && (
          <p style={{ color: '#FFB347', fontSize: '12px', fontStyle: 'italic', marginTop: '0.25rem' }}>
            Good momentum. Keep moving through Kriya™.
          </p>
        )}
        {pct >= 70 && (
          <p style={{ color: '#6BCB77', fontSize: '12px', fontStyle: 'italic', marginTop: '0.25rem' }}>
            High completion energy. The Kshetra is clear.
          </p>
        )}
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
