import { useState } from 'react'
import { getBand, BAND_STYLES, bandBorderStyle } from '../../utils/colorSystem'

const W_LABELS = { W1: '5–10m', W2: '20–30m', W3: '1hr', W4: 'Half day', W5: 'Full day' }

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [checking, setChecking] = useState(false)
  const [removing, setRemoving] = useState(false)
  const band = getBand(task.time_horizon)
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
        borderRadius: '8px',
        background: '#161B22',
        border: '1px solid #21262D',
        marginBottom: '0.4rem',
        ...bandBorderStyle(task.time_horizon),
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
              border: task.completed ? 'none' : '2px solid #30363d',
              background: task.completed ? '#1A6B5A' : 'transparent',
              transition: 'background 0.2s, border 0.2s',
            }}
          >
            {task.completed && <span style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 900 }}>✓</span>}
          </span>
        </label>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: '13px',
            color: task.completed ? '#6e7681' : '#e6edf3',
            textDecoration: task.completed ? 'line-through' : 'none',
            wordBreak: 'break-word',
          }}>
            {task.title}
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '5px', alignItems: 'center' }}>
            {task.weightage && (
              <span style={pill('#30363d', '#8b949e')}>
                {task.weightage} <span style={{ fontSize: '10px', opacity: 0.7 }}>{W_LABELS[task.weightage]}</span>
              </span>
            )}
            {task.time_horizon && bandStyle && (
              <span style={pill(bandStyle.bg, bandStyle.color)}>{task.time_horizon}</span>
            )}
            {task.life_area && (
              <span style={pill('#1A3A4A', '#7ab3d4')}>{task.life_area}</span>
            )}
            {task.multitask && (
              <span style={pill('#1A2A1A', '#6BCB77')} title="Multitaskable">🔀</span>
            )}
            {isOverdue && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#B71C1C' }}>★</span>
                <span style={{ fontSize: '10px', background: '#B71C1C', color: '#fff', borderRadius: '3px', padding: '1px 5px', fontWeight: 700 }}>OVERDUE</span>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleDelete}
          style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0, flexShrink: 0 }}
        >×</button>
      </div>
    </div>
  )
}

function pill(bg, color) {
  return { fontSize: '11px', background: bg, color, borderRadius: '4px', padding: '1px 6px', border: `1px solid ${color}30` }
}
