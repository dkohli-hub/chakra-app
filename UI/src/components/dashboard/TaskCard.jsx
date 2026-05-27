import { useState } from 'react'
import { getBand, BAND_STYLES, bandBorderStyle } from '../../utils/colorSystem'
import { T } from '../../utils/theme'

const W_LABELS = { W1: '5–10m', W2: '20–30m', W3: '1hr', W4: 'Half day', W5: 'Full day' }

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [checking, setChecking]   = useState(false)
  const [removing, setRemoving]   = useState(false)
  const band      = getBand(task.time_horizon, task.entry_timestamp)
  const bandStyle = band ? BAND_STYLES[band] : null
  const isOverdue = band === 'overdue'

  async function handleCheck(e) {
    setChecking(true)
    setTimeout(() => setChecking(false), 300)
    await onUpdate(task.id, { completed: e.target.checked })
  }

  function handleDelete() {
    setRemoving(true)
    setTimeout(() => onDelete(task.id), 280)
  }

  return (
    <div
      className={removing ? 'task-done' : 'fade-in'}
      style={{
        padding: '0.6rem 0.75rem',
        borderRadius: '9px',
        background: T.surface,
        border: `1px solid ${T.border}`,
        marginBottom: '0.4rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        ...bandBorderStyle(task.time_horizon, task.entry_timestamp),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
        {/* Circular checkbox */}
        <label style={{ position: 'relative', width: '20px', height: '20px', flexShrink: 0, marginTop: '2px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleCheck}
            style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
          />
          <span
            className={checking ? 'check-pop' : ''}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '20px', height: '20px', borderRadius: '50%',
              border: task.completed ? 'none' : `2px solid ${T.border}`,
              background: task.completed ? T.teal : 'transparent',
              transition: 'background 0.2s, border 0.2s',
            }}
          >
            {task.completed && <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 900 }}>✓</span>}
          </span>
        </label>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: task.completed ? T.textMuted : T.text,
            textDecoration: task.completed ? 'line-through' : 'none',
            wordBreak: 'break-word',
          }}>
            {task.title}
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '5px', alignItems: 'center' }}>
            {task.weightage && (
              <span style={pill(T.surface2, T.text2, T.border)}>
                {task.weightage} <span style={{ fontSize: '10px', opacity: 0.7 }}>{W_LABELS[task.weightage]}</span>
              </span>
            )}
            {task.time_horizon && bandStyle && (
              <span style={pill(bandStyle.bg + '30', bandStyle.color, bandStyle.color + '60')}>{task.time_horizon}</span>
            )}
            {task.life_area && (
              <span style={pill('#EFF6FF', T.blue, '#BFDBFE')}>{task.life_area}</span>
            )}
            {task.multitask && (
              <span style={pill(T.tealBg, T.teal, T.teal + '40')} title="Multitaskable">🔀</span>
            )}
            {isOverdue && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: T.red }}>★</span>
                <span style={{ fontSize: '10px', background: T.red, color: '#fff', borderRadius: '3px', padding: '1px 5px', fontWeight: 700 }}>OVERDUE</span>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleDelete}
          style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0, flexShrink: 0 }}
        >×</button>
      </div>
    </div>
  )
}

function pill(bg, color, border) {
  return { fontSize: '11px', background: bg, color, borderRadius: '4px', padding: '1px 6px', border: `1px solid ${border || color + '30'}` }
}
