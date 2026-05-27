import { computeKarmicCompletion } from '../../utils/scoring'
import { isOverdue } from '../../utils/horizonLogic'
import { T } from '../../utils/theme'

export default function ScoreTab({ tasks, loading }) {
  if (loading) return <p style={{ color: T.textMuted }}>Loading...</p>

  const pct          = computeKarmicCompletion(tasks)
  const total        = tasks.length
  const done         = tasks.filter(t => t.completed).length
  const overdue      = tasks.filter(t => !t.completed && isOverdue(t.time_horizon, t.entry_timestamp)).length
  const mananManthan = tasks.filter(t => !t.completed && ['Manan', 'Manthan'].includes(t.bucket)).length

  const color  = pct >= 70 ? T.green : pct >= 40 ? T.amber : T.red
  const phrase = pct < 30
    ? 'The field is full. Begin closing what you started.'
    : pct < 70
    ? 'Good momentum. Keep moving through Kriya™.'
    : 'High completion energy. The Kshetra is clear.'

  return (
    <div>
      {/* Big % */}
      <div style={{ background: T.surface, border: `1.5px solid ${color}40`, borderRadius: '14px', padding: '1.5rem', marginBottom: '0.75rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ color: T.textMuted, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>Karmic Completion</div>
        <div style={{ color, fontSize: '72px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, lineHeight: 1 }}>{pct}</div>
        <div style={{ color: T.textMuted, fontSize: '16px', fontFamily: "'Cormorant Garamond', serif", marginTop: '-4px' }}>%</div>
        <p style={{ color, fontSize: '12px', fontStyle: 'italic', marginTop: '0.75rem', marginBottom: 0 }}>{phrase}</p>
      </div>

      {/* Three stat boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <StatBox label="Total"   value={total}   color={T.goldText} />
        <StatBox label="Done"    value={done}    color={T.green} />
        <StatBox label="Overdue" value={overdue} color={overdue > 0 ? T.red : T.textMuted} />
      </div>

      {/* Surrender capacity */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '1rem' }}>
        <div style={{ color: T.goldText, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Surrender Capacity
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: T.greenBg, border: `1px solid ${T.green}30`, borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ color: T.text2, fontSize: '10px', marginBottom: '4px' }}>Surrendered</div>
            <div style={{ color: T.green, fontSize: '28px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{done}</div>
            <div style={{ color: T.textMuted, fontSize: '10px' }}>Completed</div>
          </div>
          <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ color: T.text2, fontSize: '10px', marginBottom: '4px' }}>In Reflection</div>
            <div style={{ color: T.purple, fontSize: '28px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{mananManthan}</div>
            <div style={{ color: T.textMuted, fontSize: '10px' }}>Manan™ / Manthan™</div>
          </div>
        </div>
        <p style={{ color: T.textMuted, fontSize: '10px', fontStyle: 'italic', marginTop: '0.75rem', marginBottom: 0, fontFamily: "'Cormorant Garamond', serif" }}>
          True completion is not just closure — it is conscious release.
        </p>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '9px', padding: '0.75rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ color: T.textMuted, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
      <div style={{ color, fontSize: '32px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, lineHeight: 1 }}>{value}</div>
    </div>
  )
}
