import { useState } from 'react'
import { computeLoadScore, computePostChakraScore, loadLabel, loadColor } from '../../utils/scoring'
import { tasksAPI } from '../../services/api'

const BUCKETS = ['Karya', 'Dhairya', 'Vishram', 'Manan', 'Manthan', 'Tyaga', 'Prarabdha']
const TIME_FRAMES = ['today', 'thisWeek', 'nextWeek', 'thisMonth', 'Q3', 'Q4', 'thisYear', '1year', 'parkingLot']
const W = { W1: 1, W2: 2, W3: 3, W4: 4, W5: 5 }

function ScoreTile({ title, score, note, highlight }) {
  const color = loadColor(score)
  const label = loadLabel(score)
  return (
    <div style={{ background: '#161B22', border: highlight ? '2px solid #C9A84C' : '1px solid #21262D', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
      <div style={{ color: '#6e7681', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{title}</div>
      <div style={{ color, fontSize: '40px', fontFamily: 'serif', fontWeight: 300, lineHeight: 1 }}>{score}</div>
      <div style={{ color, fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>{label}</div>
      <div style={{ height: '6px', background: '#21262D', borderRadius: '3px', marginBottom: '6px' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '3px' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#6e7681' }}>
        <span>Under-occ</span><span>Optimal</span><span>Overloaded</span>
      </div>
      {note && <p style={{ color: '#6e7681', fontSize: '10px', fontStyle: 'italic', marginTop: '6px', marginBottom: 0 }}>{note}</p>}
    </div>
  )
}

export default function KshetraViewTab({ tasks, loading, updateTask }) {
  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

  const rawScore = computeLoadScore(tasks)
  const postChakra = computePostChakraScore(tasks)

  const active = [...tasks.filter(t => !t.completed)]
    .sort((a, b) => (W[b.weightage] ?? 0) - (W[a.weightage] ?? 0))

  async function handleChange(id, field, value) {
    await updateTask(id, { [field]: value || null })
  }

  const [adjTasks, setAdjTasks] = useState(active)
  const adjScore = computeLoadScore(adjTasks.map(t => ({ ...t, completed: false })))
  const diff = rawScore - adjScore

  return (
    <div>
      {/* Score tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <ScoreTile title="Raw Load Score" score={rawScore} note="Before Chakra™ processing" />
        <ScoreTile title="Post-Chakra Score" score={postChakra} note={diff > 0 ? `Chakra's work: ↓${diff} pts` : 'No change yet'} />
        <ScoreTile title="Your Adjusted Score" score={adjScore} note="Changes as you act below" highlight />
      </div>

      {/* All active tasks with inline dropdowns */}
      <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '0.75rem' }}>
        <div style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          All Active Tasks — {active.length} items
        </div>
        {active.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', borderBottom: '1px solid #21262D', flexWrap: 'wrap' }}>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={e => updateTask(t.id, { completed: e.target.checked })}
              style={{ accentColor: '#1A6B5A', cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ flex: 1, color: '#e6edf3', fontSize: '12px', minWidth: '120px' }}>
              {t.title}
              {t.weightage && <span style={{ color: '#C9A84C', fontSize: '10px', marginLeft: '6px' }}>{t.weightage}</span>}
            </span>
            <select
              value={t.time_horizon ?? ''}
              onChange={e => handleChange(t.id, 'time_horizon', e.target.value)}
              style={inlineSelect}
            >
              <option value="">Horizon</option>
              {TIME_FRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
            </select>
            <select
              value={t.bucket ?? ''}
              onChange={e => handleChange(t.id, 'bucket', e.target.value)}
              style={inlineSelect}
            >
              <option value="">Bucket</option>
              {BUCKETS.map(b => <option key={b} value={b}>{b}™</option>)}
            </select>
          </div>
        ))}
        {!active.length && <p style={{ color: '#6e7681', fontSize: '12px' }}>No active tasks.</p>}
      </div>
    </div>
  )
}

const inlineSelect = {
  background: '#0D1117', border: '1px solid #30363d', borderRadius: '3px', color: '#8b949e', fontSize: '11px', padding: '2px 4px',
}
