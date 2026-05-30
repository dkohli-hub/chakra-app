import { useState } from 'react'
import { isOverdue } from '../../utils/horizonLogic'
import { T } from '../../utils/theme'
import TaskCard from '../dashboard/TaskCard'

const GOLD = '#8A7040'
const BAT_H = 320

const SEGMENTS = [
  { key: 'later',    label: 'Later',     color: '#2A5F8A' },
  { key: 'nextWeek', label: 'Next Week', color: '#1A5F52' },
  { key: 'thisWeek', label: 'This Week', color: '#7A5200' },
  { key: 'today',    label: 'Today',     color: '#1A6B20' },
  { key: 'overdue',  label: '★ Overdue', color: '#8B1A1A' },
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

  if (loading) return <p style={{ color: T.textMuted, padding: '1rem' }}>Loading...</p>

  const active = tasks.filter(t => !t.completed)
  const total  = active.length || 1

  const grouped = { overdue: [], today: [], thisWeek: [], nextWeek: [], later: [] }
  active.forEach(t => grouped[classifyTask(t)].push(t))

  const overdueCnt  = grouped.overdue.length
  const charge      = Math.max(0, Math.round(((total - overdueCnt) / total) * 100))
  const chCol       = charge > 70 ? '#2E7D32' : charge > 40 ? '#B87800' : charge > 20 ? '#8B5A00' : '#8B1A1A'
  const drainLabel  = charge > 75 ? 'Low drain' : charge > 50 ? 'Moderate drain' : charge > 25 ? 'High drain' : 'Critical drain'

  const dn  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const mn  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const dateStr = `${dn[now.getDay()].toUpperCase()}, ${mn[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`

  const msg = overdueCnt === 0
    ? 'Clean field. No overdue items draining your battery today.'
    : overdueCnt === 1
    ? 'One item has crossed its time. Clear it and your battery recovers.'
    : `${overdueCnt} items have crossed their time. Each one is a quiet drain. Clear one today.`

  const drillTasks = selected ? (selected === 'all' ? active : grouped[selected]) : []
  const drillSeg   = SEGMENTS.find(s => s.key === selected)

  function segHeight(count) {
    return Math.max(52, Math.round((count / total) * BAT_H))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 14px 80px' }}>

      {/* Date + message */}
      <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: T.textMuted, margin: '12px 0 3px', textAlign: 'center' }}>
        {dateStr}
      </div>
      <div style={{ fontSize: '11px', fontStyle: 'italic', color: T.textMuted, textAlign: 'center', marginBottom: '14px', lineHeight: 1.6, padding: '0 10px' }}>
        {msg}
      </div>

      {/* Battery nub (terminal on top) */}
      <div style={{ width: '48px', height: '12px', borderRadius: '5px 5px 0 0', background: GOLD, margin: '0 auto' }} />

      {/* Battery outer shell */}
      <div style={{
        width: '190px', border: `3px solid ${GOLD}`, borderRadius: '14px',
        overflow: 'hidden', margin: '0 auto', background: T.surface2,
      }}>
        {active.length === 0
          ? <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '11px', fontStyle: 'italic', color: T.textMuted }}>
              Empty field — add tasks in Gather
            </div>
          : SEGMENTS.map(seg => {
              const cnt = grouped[seg.key].length
              if (cnt === 0) return null
              const h   = segHeight(cnt)
              const isAct = selected === seg.key
              return (
                <div
                  key={seg.key}
                  onClick={() => setSelected(isAct ? null : seg.key)}
                  style={{
                    width: '100%', height: `${h}px`,
                    background: seg.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    filter: isAct ? 'brightness(1.15)' : 'none',
                    outline: isAct ? '3px solid rgba(255,255,255,0.5)' : 'none',
                    outlineOffset: '-3px',
                    transition: 'filter 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px', pointerEvents: 'none' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 700, lineHeight: 1, color: '#fff', textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
                      {cnt}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', marginTop: '3px', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>
                      {seg.label}
                    </div>
                  </div>
                </div>
              )
            })
        }
      </div>

      {/* Charge bar */}
      <div style={{ width: '190px', margin: '10px auto 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: T.textMuted, marginBottom: '3px' }}>
          <span>Charge</span>
          <span style={{ fontWeight: 700, color: chCol }}>{charge}%</span>
        </div>
        <div style={{ height: '5px', background: T.surface2, borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${charge}%`, height: '100%', background: chCol, borderRadius: '3px', transition: 'width 0.5s' }} />
        </div>
        <div style={{ fontSize: '9px', textAlign: 'right', marginTop: '3px', color: charge < 50 ? T.red : T.textMuted }}>
          {drainLabel}
        </div>
      </div>

      {/* Total circle */}
      <div
        onClick={() => setSelected(selected === 'all' ? null : 'all')}
        style={{
          width: '80px', height: '80px', borderRadius: '50%',
          border: `3px solid ${selected === 'all' ? GOLD : 'rgba(160,120,40,0.35)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          margin: '14px auto 4px', cursor: 'pointer', transition: 'border-color 0.2s',
        }}
      >
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 600, color: GOLD, lineHeight: 1 }}>
          {active.length}
        </div>
        <div style={{ fontSize: '8px', color: T.textMuted, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>
          active
        </div>
      </div>

      {/* Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', margin: '10px 0 12px' }}>
        {SEGMENTS.filter(s => grouped[s.key]?.length > 0).map(s => (
          <button
            key={s.key}
            onClick={() => setSelected(selected === s.key ? null : s.key)}
            style={{
              background: selected === s.key ? s.color : 'transparent',
              color: selected === s.key ? '#fff' : s.color,
              border: `1px solid ${s.color}`,
              borderRadius: '20px', padding: '5px 14px',
              fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {s.label} {grouped[s.key].length}
          </button>
        ))}
        <button
          onClick={() => setSelected(selected === 'all' ? null : 'all')}
          style={{ background: T.tealBg, color: T.teal, border: `1px solid ${T.teal}`, borderRadius: '20px', padding: '5px 14px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
        >
          All {active.length}
        </button>
      </div>

      {/* Drill-down */}
      {selected && drillTasks.length > 0 && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '12px', width: '100%', maxWidth: '520px', marginTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontWeight: 600, color: drillSeg?.color || T.forest }}>
              {selected === 'all' ? 'All Active' : drillSeg?.label} ({drillTasks.length})
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: 0 }}>×</button>
          </div>
          {drillTasks.map(t => <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />)}
        </div>
      )}

      {!selected && (
        <p style={{ color: T.textMuted, fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
          Tap a segment to drill down into those tasks.
        </p>
      )}
    </div>
  )
}
