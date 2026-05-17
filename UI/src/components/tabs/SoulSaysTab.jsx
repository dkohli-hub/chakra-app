import { useState } from 'react'
import { computeEnergyDrain } from '../../utils/scoring'
import { isOverdue } from '../../utils/horizonLogic'
import TaskCard from '../dashboard/TaskCard'

const RELATIONAL_NODES = {
  inner:  [{ name: 'Sonia', angle: 270 }, { name: 'Dhruv', angle: 330 }, { name: 'Disha', angle: 30 }, { name: 'Mila', angle: 90 }, { name: 'Riya', angle: 150 }],
  middle: [{ name: 'Mom', angle: 270 }, { name: 'Neeraj', angle: 30 }, { name: 'Ankita', angle: 150 }],
  outer:  [{ name: 'Sanjeev', angle: 270 }, { name: 'Shruti', angle: 315 }, { name: 'Rajiv', angle: 30 }, { name: 'Priyanka', angle: 150 }],
}

function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function RippleSVG() {
  const cx = 130, cy = 130
  const radii = [22, 60, 100]
  const groups = [RELATIONAL_NODES.inner, RELATIONAL_NODES.middle, RELATIONAL_NODES.outer]

  return (
    <svg viewBox="0 0 260 260" width="100%" style={{ maxWidth: '260px', display: 'block', margin: '0 auto' }}>
      {radii.map(r => <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#21262D" strokeWidth="1" />)}
      <circle cx={cx} cy={cy} r={12} fill="#1A6B5A" />
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#C9A84C" fontSize="11" fontWeight="bold">DK</text>
      {groups.map((group, gi) =>
        group.map(node => {
          const [x, y] = polar(cx, cy, radii[gi], node.angle)
          return (
            <g key={node.name}>
              <circle cx={x} cy={y} r={5} fill="#C9A84C" />
              <text x={x} y={y - 8} textAnchor="middle" fill="#8b949e" fontSize="9">{node.name}</text>
            </g>
          )
        })
      )}
    </svg>
  )
}

function BatterySVG({ drain }) {
  const fill = Math.max(0, 100 - drain)
  const color = drain > 75 ? '#E07A5F' : drain > 50 ? '#FFB347' : drain > 25 ? '#C9A84C' : '#00BFA5'
  const label = drain > 75 ? 'High drain' : drain > 50 ? 'Moderate' : 'Low'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <svg viewBox="0 0 28 54" width="28" height="54">
        <rect x="8" y="0" width="12" height="4" rx="2" fill={color} />
        <rect x="1" y="4" width="26" height="46" rx="3" fill="none" stroke={color} strokeWidth="2" />
        <rect x="3" y={4 + (42 * (1 - fill / 100))} width="22" height={42 * fill / 100} rx="1" fill={color} opacity="0.8" />
      </svg>
      <span style={{ color, fontSize: '11px', fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#6e7681', fontSize: '10px' }}>{drain}%</span>
    </div>
  )
}

function Panel({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', cursor: 'pointer' }}>
        <span style={{ color: '#C9A84C', fontWeight: 600, fontSize: '13px' }}>{title}</span>
        <span style={{ color: '#6e7681', fontSize: '12px', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
      </div>
      {open && <div style={{ borderTop: '1px solid #21262D', padding: '0.75rem 1rem' }}>{children}</div>}
    </div>
  )
}

export default function SoulSaysTab({ tasks, loading, updateTask, deleteTask }) {
  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

  const active = tasks.filter(t => !t.completed)
  const myKarma = active.filter(t => t.bucket !== 'Dhairya')
  const othersKarma = active.filter(t => t.bucket === 'Dhairya')
  const total = active.length || 1
  const drain = computeEnergyDrain(tasks)
  const overdueTasks = active.filter(t => t.time_horizon && isOverdue(t.time_horizon))
  const heavyUnresolved = active.filter(t => ['W4', 'W5'].includes(t.weightage))

  return (
    <div>
      {/* Locus of Control */}
      <Panel title="Locus of Control" defaultOpen>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ flex: 1, background: '#0D1117', borderRadius: '6px', padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ color: '#6BCB77', fontSize: '22px', fontFamily: 'serif' }}>{Math.round(myKarma.length / total * 100)}%</div>
              <div style={{ color: '#6e7681', fontSize: '11px' }}>My Karma</div>
            </div>
            <div style={{ flex: 1, background: '#0D1117', borderRadius: '6px', padding: '0.5rem', textAlign: 'center' }}>
              <div style={{ color: '#7ab3d4', fontSize: '22px', fontFamily: 'serif' }}>{Math.round(othersKarma.length / total * 100)}%</div>
              <div style={{ color: '#6e7681', fontSize: '11px' }}>Others' Karma</div>
            </div>
          </div>
          <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.round(myKarma.length / total * 100)}%`, background: '#6BCB77' }} />
            <div style={{ flex: 1, background: '#7ab3d4' }} />
          </div>
        </div>
        <div>
          <p style={{ color: '#8b949e', fontSize: '11px', marginBottom: '0.5rem' }}>Dhairya™ — waiting on others:</p>
          {othersKarma.length
            ? othersKarma.map(t => <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />)
            : <p style={{ color: '#6e7681', fontSize: '12px' }}>No Dhairya™ tasks. Good.</p>}
        </div>
      </Panel>

      {/* Energy Drain */}
      <Panel title="Energy Drain">
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <BatterySVG drain={drain} />
          <div style={{ flex: 1 }}>
            <p style={{ color: '#8b949e', fontSize: '12px', marginBottom: '0.5rem' }}>
              {overdueTasks.length} overdue · {heavyUnresolved.length} heavy unresolved (W4/W5)
            </p>
            {overdueTasks.slice(0, 5).map(t => (
              <div key={t.id} style={{ fontSize: '12px', color: '#E07A5F', padding: '2px 0', borderBottom: '1px solid #21262D' }}>
                ★ {t.title}
              </div>
            ))}
            {!overdueTasks.length && <p style={{ color: '#6BCB77', fontSize: '12px' }}>No overdue tasks. Energy is clean.</p>}
          </div>
        </div>
      </Panel>

      {/* Relational Load */}
      <Panel title="Relational Load">
        <RippleSVG />
        <p style={{ color: '#6e7681', fontSize: '11px', textAlign: 'center', marginTop: '0.5rem', fontStyle: 'italic' }}>
          Your relational field — those connected to your karma.
        </p>
        <div style={{ marginTop: '0.75rem', background: '#0D1117', borderRadius: '4px', padding: '0.5rem 0.75rem' }}>
          <p style={{ color: '#6e7681', fontSize: '11px' }}>
            ⚠ Role Conflict: Tasks involving multiple relationship rings may create divided attention. Assign each task a primary owner.
          </p>
        </div>
      </Panel>
    </div>
  )
}
