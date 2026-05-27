import { useState } from 'react'
import { isOverdue } from '../../utils/horizonLogic'
import { T } from '../../utils/theme'
import TaskCard from '../dashboard/TaskCard'

const SEGMENTS = [
  { key: 'overdue',  label: '★ Overdue', color: '#C0392B', bg: T.redBg   },
  { key: 'today',    label: 'Today',     color: '#B87800', bg: T.amberBg },
  { key: 'thisWeek', label: 'This Week', color: T.teal,    bg: T.tealBg  },
  { key: 'nextWeek', label: 'Next Week', color: '#2E7D32', bg: T.greenBg },
  { key: 'later',    label: 'Later',     color: '#2980B9', bg: T.blueBg  },
]

function classifyTask(t) {
  if (isOverdue(t.time_horizon, t.entry_timestamp)) return 'overdue'
  if (t.time_horizon === 'today')    return 'today'
  if (t.time_horizon === 'thisWeek') return 'thisWeek'
  if (t.time_horizon === 'nextWeek') return 'nextWeek'
  return 'later'
}

export default function BatteryTab({ tasks, loading, updateTask, deleteTask }) {
  const [selected, setSelected] = useState(null)

  if (loading) return <p style={{ color: T.textMuted }}>Loading...</p>

  const active  = tasks.filter(t => !t.completed)
  const total   = active.length || 1
  const grouped = {}
  SEGMENTS.forEach(s => { grouped[s.key] = [] })
  active.forEach(t => grouped[classifyTask(t)].push(t))

  const overdueCnt  = grouped.overdue.length
  const charge      = Math.round(((total - overdueCnt) / total) * 100)
  const chargeColor = charge >= 70 ? T.green : charge >= 40 ? T.amber : T.red
  const drainLabel  = charge < 25 ? 'Critical drain' : charge < 50 ? 'High drain' : charge < 75 ? 'Moderate drain' : 'Low drain'

  const maxBarH   = 180
  const drillTasks = selected ? grouped[selected] : []

  const dn = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const dateStr = `${dn[now.getDay()].toUpperCase()}, ${mn[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`

  const msg = overdueCnt === 0
    ? 'Clean field. No overdue items draining your battery today.'
    : overdueCnt === 1
    ? 'One item has crossed its time. Clear it and your battery recovers.'
    : `${overdueCnt} items have crossed their time. Each one is a quiet drain. Clear one today.`

  return (
    <div>
      {/* Battery card */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ color: T.textMuted, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px' }}>{dateStr}</div>
        <div style={{ color: T.text2, fontSize: '12px', marginBottom: '1rem', fontStyle: 'italic' }}>{msg}</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ color: T.goldText, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Karma Battery</div>
            <div style={{ color: T.textMuted, fontSize: '10px', marginTop: '2px' }}>{active.length} active tasks</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: chargeColor, fontSize: '28px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, lineHeight: 1 }}>{charge}%</div>
            <div style={{ color: chargeColor, fontSize: '10px' }}>{drainLabel}</div>
          </div>
        </div>

        {/* Battery bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: `${maxBarH + 20}px`, paddingBottom: '20px', position: 'relative' }}>
          {SEGMENTS.map(seg => {
            const cnt    = grouped[seg.key].length
            const pct    = cnt / total
            const barH   = Math.max(pct > 0 ? 20 : 4, Math.round(pct * maxBarH))
            const isAct  = selected === seg.key

            return (
              <div
                key={seg.key}
                onClick={() => setSelected(isAct ? null : seg.key)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '4px' }}
              >
                <div style={{ color: cnt > 0 ? seg.color : T.textMuted, fontSize: '11px', fontWeight: 700 }}>{cnt}</div>
                <div style={{
                  width: '100%',
                  height: `${barH}px`,
                  background: cnt > 0 ? seg.color : T.borderLight,
                  borderRadius: '4px 4px 0 0',
                  opacity: isAct ? 1 : 0.75,
                  border: isAct ? `2px solid ${seg.color}` : '2px solid transparent',
                  transition: 'all 0.2s',
                  boxShadow: isAct ? `0 0 8px ${seg.color}50` : 'none',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  fontSize: '9px',
                  color: isAct ? seg.color : T.textMuted,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  fontWeight: isAct ? 700 : 400,
                }}>
                  {seg.label}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ height: '1px', background: T.border, marginTop: '8px' }} />

        {/* Charge bar */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', color: T.text2 }}>Charge</span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: chargeColor }}>{charge}%</span>
          </div>
          <div style={{ height: '6px', background: T.borderLight, borderRadius: '3px' }}>
            <div style={{ width: `${charge}%`, height: '100%', background: chargeColor, borderRadius: '3px', transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      {/* Pill shortcuts */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {SEGMENTS.filter(s => grouped[s.key].length > 0).map(s => (
          <button
            key={s.key}
            onClick={() => setSelected(selected === s.key ? null : s.key)}
            style={{
              background: selected === s.key ? s.color : T.surface,
              color: selected === s.key ? '#fff' : s.color,
              border: `1px solid ${s.color}`,
              borderRadius: '20px', padding: '4px 12px',
              fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {s.label} {grouped[s.key].length}
          </button>
        ))}
        <button
          onClick={() => setSelected('gather')}
          style={{ background: T.tealBg, color: T.teal, border: `1px solid ${T.teal}`, borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
        >
          ＋ Add Tasks
        </button>
      </div>

      {/* Drill-down */}
      {selected && selected !== 'gather' && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ color: T.goldText, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {SEGMENTS.find(s => s.key === selected)?.label} — {drillTasks.length} tasks
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
          {drillTasks.length === 0
            ? <p style={{ color: T.textMuted, fontSize: '12px' }}>No tasks in this segment.</p>
            : drillTasks.map(t => <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />)
          }
        </div>
      )}

      {!selected && (
        <p style={{ color: T.textMuted, fontSize: '11px', fontStyle: 'italic' }}>
          Tap a segment to drill down into those tasks.
        </p>
      )}
    </div>
  )
}
