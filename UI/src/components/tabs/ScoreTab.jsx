import { computeKarmicCompletion } from '../../utils/scoring'

function KarmicArc({ pct }) {
  const r = 70
  const cx = 90, cy = 90
  const circumference = Math.PI * r
  const filled = (pct / 100) * circumference
  const color = pct >= 70 ? '#6BCB77' : pct >= 40 ? '#C9A84C' : '#E07A5F'

  function arcPath(startDeg, endDeg) {
    const toRad = d => (d - 90) * Math.PI / 180
    const x1 = cx + r * Math.cos(toRad(startDeg))
    const y1 = cy + r * Math.sin(toRad(startDeg))
    const x2 = cx + r * Math.cos(toRad(endDeg))
    const y2 = cy + r * Math.sin(toRad(endDeg))
    const large = endDeg - startDeg > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
  }

  const endDeg = 180 + pct * 1.8

  return (
    <svg viewBox="0 0 180 100" style={{ width: '100%', maxWidth: '260px', display: 'block', margin: '0 auto' }}>
      <path d={arcPath(180, 360)} fill="none" stroke="#21262D" strokeWidth="10" strokeLinecap="round" />
      {pct > 0 && (
        <path d={arcPath(180, Math.min(endDeg, 360))} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
      )}
      <text x={cx} y={cy - 10} textAnchor="middle" fill={color} fontSize="28" fontFamily="serif">{pct}%</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6e7681" fontSize="10">Karmic Completion</text>
    </svg>
  )
}

export default function ScoreTab({ tasks, loading }) {
  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

  const pct = computeKarmicCompletion(tasks)
  const mananManthan = tasks.filter(t => !t.completed && ['Manan', 'Manthan'].includes(t.bucket)).length
  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length

  return (
    <div>
      <div style={{ background: '#161B22', border: '1px solid #C9A84C40', borderRadius: '8px', padding: '1.5rem', marginBottom: '0.75rem', textAlign: 'center' }}>
        <KarmicArc pct={pct} />
        <p style={{ color: '#6e7681', fontSize: '12px', marginTop: '0.5rem' }}>
          {completed} of {total} tasks completed through Karya™
        </p>
        {pct < 30 && <p style={{ color: '#E07A5F', fontSize: '12px', fontStyle: 'italic' }}>The field is full. Begin closing what you started.</p>}
        {pct >= 30 && pct < 70 && <p style={{ color: '#FFB347', fontSize: '12px', fontStyle: 'italic' }}>Good momentum. Keep moving through Kriya™.</p>}
        {pct >= 70 && <p style={{ color: '#6BCB77', fontSize: '12px', fontStyle: 'italic' }}>High completion energy. The Kshetra is clear.</p>}
      </div>

      <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '1rem' }}>
        <div style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Surrender Capacity</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: '#0D1117', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ color: '#8b949e', fontSize: '10px', marginBottom: '4px' }}>Behavioral</div>
            <div style={{ color: '#6BCB77', fontSize: '22px', fontFamily: 'serif' }}>{completed}</div>
            <div style={{ color: '#6e7681', fontSize: '10px' }}>Surrendered</div>
          </div>
          <div style={{ background: '#0D1117', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ color: '#8b949e', fontSize: '10px', marginBottom: '4px' }}>Spiritual</div>
            <div style={{ color: '#c9a0f0', fontSize: '22px', fontFamily: 'serif' }}>{mananManthan}</div>
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
