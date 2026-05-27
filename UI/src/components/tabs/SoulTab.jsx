import { useState } from 'react'
import { computeAQ, computePQ, computeCQ } from '../../utils/scoring'
import { T } from '../../utils/theme'

function QuotientTile({ label, value, color, description, children }) {
  const [open, setOpen] = useState(false)
  const isLabel = typeof value === 'string'

  return (
    <div style={{ background: T.surface, border: `1.5px solid ${color}40`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: '1rem', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
            <div style={{ color, fontSize: '38px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, lineHeight: 1.1 }}>
              {isLabel ? value : `${value}%`}
            </div>
          </div>
          <span style={{ color: T.textMuted, fontSize: '12px', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginTop: '4px' }}>▶</span>
        </div>
        {!isLabel && (
          <div style={{ marginTop: '8px', height: '4px', background: T.borderLight, borderRadius: '2px' }}>
            <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.4s' }} />
          </div>
        )}
        <p style={{ color: T.text2, fontSize: '11px', marginTop: '6px', marginBottom: 0 }}>{description}</p>
      </div>
      {open && <div style={{ borderTop: `1px solid ${T.border}`, padding: '0.75rem 1rem', background: T.surface2 }}>{children}</div>}
    </div>
  )
}

export default function SoulTab({ tasks, loading }) {
  if (loading) return <p style={{ color: T.textMuted }}>Loading...</p>

  const aq = computeAQ(tasks)
  const pq = computePQ(tasks)
  const cq = computeCQ(tasks)

  return (
    <div>
      {/* Jim Rohn quote */}
      <div style={{ background: T.goldBg, border: `1px solid ${T.gold}40`, borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '14px',
          fontStyle: 'italic',
          color: T.forest,
          lineHeight: 1.7,
          margin: 0,
        }}>
          "The greatest gift you can give someone is your own personal development. I used to say, if you will take care of me, I will take care of you. Now I say, I will take care of me for you, if you will take care of you for me."
        </p>
        <div style={{ color: T.goldText, fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>— Jim Rohn</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
        <QuotientTile
          label="AQ — Adversity Quotient"
          value={aq}
          color="#2980B9"
          description="Actionable items / total active. High AQ means most tasks are in your hands."
        >
          <p style={{ color: T.text2, fontSize: '12px' }}>High AQ means your system is fluid — tasks are moving, not stuck.</p>
        </QuotientTile>

        <QuotientTile
          label="PQ — Purpose Quotient"
          value={pq}
          color="#2E7D32"
          description="Weighted Karya™ completion rate. Alignment of attention with meaningful work."
        >
          <p style={{ color: T.text2, fontSize: '12px' }}>High PQ means you are completing purposeful, weighted work — not just easy wins.</p>
        </QuotientTile>

        <QuotientTile
          label="CQ — Clarity Quotient"
          value={cq.label}
          color="#6A3A8A"
          description={`Life arenas covered: ${cq.arenas} of 18 Gita chapters have tasks.`}
        >
          <div>
            <div style={{ display: 'flex', gap: '4px', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              {['Emerging', 'Partial', 'Substantial', 'Full'].map((stage, i) => (
                <div key={stage} style={{
                  flex: 1,
                  background: i < ['Emerging', 'Partial', 'Substantial', 'Full'].indexOf(cq.label) + 1 ? '#6A3A8A' : T.borderLight,
                }} />
              ))}
            </div>
            <p style={{ color: T.text2, fontSize: '11px', marginTop: '8px' }}>
              Expand coverage by adding tasks across more Gita chapters.
            </p>
          </div>
        </QuotientTile>
      </div>
    </div>
  )
}
