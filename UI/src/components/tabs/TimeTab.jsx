import { useState } from 'react'
import TaskCard from '../dashboard/TaskCard'
import { timeScore, isOverdue, TIME_FRAMES } from '../../utils/horizonLogic'
import { BAND_STYLES, getBand } from '../../utils/colorSystem'

const HORIZON_ORDER = ['today', 'thisWeek', 'nextWeek', 'thisMonth', 'Q3', 'Q4', 'thisYear', '1year', 'parkingLot']

function TimeGroup({ horizon, tasks, onUpdate, onDelete }) {
  const [collapsed, setCollapsed] = useState(false)
  const band = getBand(horizon)
  const style = band ? BAND_STYLES[band] : { color: '#8b949e', bg: '#161B22' }
  const overdueCount = tasks.filter(t => isOverdue(t.time_horizon)).length

  return (
    <div style={{ marginBottom: '0.75rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #21262D' }}>
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 1rem', cursor: 'pointer', background: '#161B22', borderLeft: band === 'teal' ? '4px double #00BFA5' : `3px solid ${style.color}` }}
      >
        <span style={{ color: style.color, fontWeight: 700, fontSize: '13px', flex: 1 }}>{horizon}</span>
        {overdueCount > 0 && (
          <span style={{ fontSize: '11px', background: '#B71C1C', color: '#fff', borderRadius: '3px', padding: '1px 6px', fontWeight: 700 }}>
            ★ {overdueCount} overdue
          </span>
        )}
        <span style={{ color: '#C9A84C', fontSize: '20px', fontFamily: 'serif' }}>{tasks.length}</span>
        <span style={{ color: '#6e7681', fontSize: '13px', transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }}>✶</span>
      </div>
      {!collapsed && (
        <div style={{ padding: '0.5rem 0.75rem' }}>
          {tasks.map(t => <TaskCard key={t.id} task={t} onUpdate={onUpdate} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  )
}

export default function TimeTab({ tasks, loading, updateTask, deleteTask }) {
  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

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

  // Sort within each group by score ascending (most urgent first)
  Object.keys(grouped).forEach(h => {
    if (h !== 'parkingLot' && h !== '(none)') {
      grouped[h].sort((a, b) => timeScore(a.time_horizon) - timeScore(b.time_horizon))
    }
  })

  const allOverdue = active.filter(t => t.time_horizon && isOverdue(t.time_horizon))

  return (
    <div>
      {allOverdue.length > 0 && (
        <div style={{ background: '#1A0A0A', border: '1px solid #B71C1C', borderRadius: '8px', padding: '0.6rem 1rem', marginBottom: '1rem' }}>
          <span style={{ color: '#B71C1C', fontWeight: 700, fontSize: '13px' }}>★ {allOverdue.length} overdue task{allOverdue.length > 1 ? 's' : ''} — costs energy daily</span>
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
