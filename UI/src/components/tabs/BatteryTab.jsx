import { useState } from 'react'
import { isOverdue } from '../../utils/horizonLogic'
import TaskCard from '../dashboard/TaskCard'

const SEGMENTS = [
  { key: 'overdue',   label: '★ Overdue',  color: '#B71C1C', bg: '#3A0000' },
  { key: 'today',     label: 'Today',      color: '#FFB347', bg: '#2A1A00' },
  { key: 'thisWeek',  label: 'This Week',  color: '#00BFA5', bg: '#001A18' },
  { key: 'nextWeek',  label: 'Next Week',  color: '#6BCB77', bg: '#0A1F0A' },
  { key: 'later',     label: 'Later',      color: '#4A9CC7', bg: '#001525' },
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

  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

  const active = tasks.filter(t => !t.completed)
  const total  = active.length || 1

  const grouped = {}
  SEGMENTS.forEach(s => { grouped[s.key] = [] })
  active.forEach(t => grouped[classifyTask(t)].push(t))

  const overdueCnt = grouped.overdue.length
  const charge     = Math.round(((total - overdueCnt) / total) * 100)
  const chargeColor = charge >= 70 ? '#6BCB77' : charge >= 40 ? '#FFB347' : '#E07A5F'

  const maxBarH = 180
  const drillTasks = selected ? grouped[selected] : []

  return (
    <div>
      {/* Battery visual */}
      <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Karma Battery</div>
            <div style={{ color: '#6e7681', fontSize: '10px', marginTop: '2px' }}>{active.length} active tasks</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: chargeColor, fontSize: '28px', fontFamily: 'serif', fontWeight: 300, lineHeight: 1 }}>{charge}%</div>
            <div style={{ color: '#6e7681', fontSize: '10px' }}>charged</div>
            {overdueCnt > 0 && (
              <div style={{ color: '#B71C1C', fontSize: '10px', marginTop: '2px' }}>▼ {overdueCnt} draining</div>
            )}
          </div>
        </div>

        {/* Battery bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: `${maxBarH + 20}px`, paddingBottom: '20px', position: 'relative' }}>
          {SEGMENTS.map(seg => {
            const cnt   = grouped[seg.key].length
            const pct   = cnt / total
            const barH  = Math.max(pct > 0 ? 20 : 4, Math.round(pct * maxBarH))
            const isActive = selected === seg.key

            return (
              <div
                key={seg.key}
                onClick={() => setSelected(isActive ? null : seg.key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: '4px',
                }}
              >
                {/* Count label */}
                <div style={{ color: cnt > 0 ? seg.color : '#30363d', fontSize: '11px', fontWeight: 700 }}>{cnt}</div>

                {/* Bar */}
                <div
                  style={{
                    width: '100%',
                    height: `${barH}px`,
                    background: cnt > 0 ? seg.color : '#21262D',
                    borderRadius: '4px 4px 0 0',
                    opacity: isActive ? 1 : 0.75,
                    border: isActive ? `2px solid ${seg.color}` : '2px solid transparent',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? `0 0 8px ${seg.color}60` : 'none',
                  }}
                />

                {/* Label */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  fontSize: '9px',
                  color: isActive ? seg.color : '#6e7681',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  fontWeight: isActive ? 700 : 400,
                  transform: 'translateX(0)',
                }}>
                  {seg.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Baseline */}
        <div style={{ height: '1px', background: '#30363d', marginTop: '8px' }} />
      </div>

      {/* Drill-down */}
      {selected && (
        <div>
          <div style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            {SEGMENTS.find(s => s.key === selected)?.label} — {drillTasks.length} tasks
          </div>
          {drillTasks.length === 0
            ? <p style={{ color: '#6e7681', fontSize: '12px' }}>No tasks in this segment.</p>
            : drillTasks.map(t => (
                <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
              ))
          }
        </div>
      )}

      {!selected && (
        <p style={{ color: '#6e7681', fontSize: '11px', fontStyle: 'italic' }}>
          Tap a segment to drill down into those tasks.
        </p>
      )}
    </div>
  )
}
