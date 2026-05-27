import { useState } from 'react'
import TaskCard from '../dashboard/TaskCard'
import { timeScore, isOverdue, TIME_FRAMES } from '../../utils/horizonLogic'
import { BAND_STYLES, getBand } from '../../utils/colorSystem'
import { T } from '../../utils/theme'

const HORIZON_ORDER = ['today', 'thisWeek', 'nextWeek', 'thisMonth', 'Q3', 'Q4', 'thisYear', '1year', 'parkingLot']

function TimeGroup({ horizon, tasks, onUpdate, onDelete }) {
  const [collapsed, setCollapsed] = useState(false)
  const band    = getBand(horizon)
  const style   = band ? BAND_STYLES[band] : { color: T.textMuted, bg: T.surface2 }
  const overdueCount = tasks.filter(t => isOverdue(t.time_horizon)).length

  return (
    <div style={{ marginBottom: '0.75rem', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', cursor: 'pointer', background: T.surface, borderLeft: band === 'teal' ? `4px double ${T.workingZone}` : `3px solid ${style.color}` }}
      >
        <span style={{ color: style.color, fontWeight: 700, fontSize: '13px', flex: 1 }}>{horizon}</span>
        {overdueCount > 0 && (
          <span style={{ fontSize: '11px', background: T.red, color: '#fff', borderRadius: '3px', padding: '1px 6px', fontWeight: 700 }}>
            ★ {overdueCount} overdue
          </span>
        )}
        <span style={{ color: T.goldText, fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{tasks.length}</span>
        <span style={{ color: T.textMuted, fontSize: '13px', transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }}>▶</span>
      </div>
      {!collapsed && (
        <div style={{ padding: '0.5rem 0.75rem', background: T.surface3 }}>
          {tasks.map(t => <TaskCard key={t.id} task={t} onUpdate={onUpdate} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  )
}

export default function TimeTab({ tasks, loading, updateTask, deleteTask }) {
  if (loading) return <p style={{ color: T.textMuted }}>Loading...</p>

  const active = tasks.filter(t => !t.completed)
  const grouped = {}
  HORIZON_ORDER.forEach(h => { grouped[h] = [] })
  grouped['(none)'] = []

  active.forEach(t => {
    const h = t.time_horizon
    if (h && grouped[h] !== undefined) grouped[h].push(t)
    else if (h) grouped[h] = [...(grouped[h] ?? []), t]
    else grouped['(none)'].push(t)
  })

  Object.keys(grouped).forEach(h => {
    if (h !== 'parkingLot' && h !== '(none)') {
      grouped[h].sort((a, b) => timeScore(a.time_horizon) - timeScore(b.time_horizon))
    }
  })

  const allOverdue = active.filter(t => t.time_horizon && isOverdue(t.time_horizon))

  return (
    <div>
      {allOverdue.length > 0 && (
        <div style={{ background: T.redBg, border: `1px solid ${T.red}40`, borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem' }}>
          <span style={{ color: T.red, fontWeight: 700, fontSize: '13px' }}>★ {allOverdue.length} overdue task{allOverdue.length > 1 ? 's' : ''} — costs energy daily</span>
        </div>
      )}

      {HORIZON_ORDER.map(h => grouped[h]?.length > 0 && (
        <TimeGroup key={h} horizon={h} tasks={grouped[h]} onUpdate={updateTask} onDelete={deleteTask} />
      ))}

      {grouped['(none)'].length > 0 && (
        <TimeGroup horizon="(none)" tasks={grouped['(none)']} onUpdate={updateTask} onDelete={deleteTask} />
      )}
    </div>
  )
}
