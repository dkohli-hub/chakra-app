import { useState } from 'react'
import { TIME_FRAMES } from '../../utils/horizonLogic'
import { GITA_CHAPTERS } from '../../data/gitaChapters'
import TaskCard from '../dashboard/TaskCard'

const BUCKETS = ['Karya', 'Dhairya', 'Vishram', 'Manan', 'Tyaga', 'Prarabdha']
const WEIGHTAGES = ['W1', 'W2', 'W3', 'W4', 'W5']
const W_LABELS = { W1: '5–10 min', W2: '20–30 min', W3: '1 hour', W4: 'Half day', W5: 'Full day' }
const LIFE_AREAS = ['Personal/Family', 'Work/Employment', 'Picturizze', 'Other']
const COLOR_LEGEND = [
  { color: '#4A9CC7', note: '> 400% Blue' },
  { color: '#6BCB77', note: '200–400% Green' },
  { color: '#FFB347', note: '100–200% Amber' },
  { color: '#00BFA5', note: '50–100% Working Zone' },
  { color: '#E07A5F', note: '0–50% Act Now' },
]

export default function GatherTab({ tasks, loading, addTask, updateTask, deleteTask }) {
  const [title, setTitle]         = useState('')
  const [weightage, setWeightage] = useState('')
  const [timeFrame, setTimeFrame] = useState('')
  const [lifeArea, setLifeArea]   = useState('')
  const [ch, setCh]               = useState('')
  const [multitask, setMultitask] = useState(false)
  const [bucket, setBucket]       = useState('Karya')
  const [adding, setAdding]       = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    await addTask({ title, bucket, weightage: weightage || null, time_horizon: timeFrame || null, life_area: lifeArea || null, ch: ch ? parseInt(ch) : null, multitask })
    setTitle(''); setWeightage(''); setTimeFrame(''); setLifeArea(''); setCh(''); setMultitask(false)
    setAdding(false)
  }

  function handleEmail() {
    const body = tasks.filter(t => !t.completed).map(t =>
      `[${t.bucket ?? '—'}] ${t.title} | ${t.weightage ?? '—'} | ${t.time_horizon ?? '—'} | ${t.life_area ?? '—'}`
    ).join('\n')
    window.location.href = `mailto:dh.kohli@gmail.com?subject=${encodeURIComponent(`Karma Kshetra Export ${new Date().toLocaleDateString()}`)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div>
      <form onSubmit={handleAdd} style={formStyle}>
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What is on your mind?"
          rows={2}
          required
          style={textareaStyle}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginTop: '0.75rem' }}>

          {/* Weightage */}
          <div style={tileStyle}>
            <div style={tileTitle}>Weightage</div>
            {WEIGHTAGES.map(w => (
              <label key={w} style={radioRow(weightage === w)}>
                <input type="radio" name="w" value={w} checked={weightage === w} onChange={() => setWeightage(w)} style={{ display: 'none' }} />
                <span style={{ color: '#C9A84C', fontWeight: 700, minWidth: '22px', fontSize: '12px' }}>{w}</span>
                <span style={{ color: '#8b949e', fontSize: '10px' }}>{W_LABELS[w]}</span>
              </label>
            ))}
          </div>

          {/* Color Intelligence */}
          <div style={tileStyle}>
            <div style={tileTitle}>Color Intelligence</div>
            {COLOR_LEGEND.map(c => (
              <div key={c.note} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ color: '#8b949e', fontSize: '10px' }}>{c.note}</span>
              </div>
            ))}
          </div>

          {/* Time Horizon */}
          <div style={tileStyle}>
            <div style={tileTitle}>Time Horizon</div>
            {TIME_FRAMES.map(tf => (
              <label key={tf} style={radioRow(timeFrame === tf)}>
                <input type="radio" name="tf" value={tf} checked={timeFrame === tf} onChange={() => setTimeFrame(tf)} style={{ display: 'none' }} />
                <span style={{ color: timeFrame === tf ? '#C9A84C' : '#8b949e', fontSize: '11px' }}>{tf}</span>
              </label>
            ))}
          </div>

          {/* Life Area */}
          <div style={tileStyle}>
            <div style={tileTitle}>Life Area</div>
            {LIFE_AREAS.map(la => (
              <label key={la} style={radioRow(lifeArea === la)}>
                <input type="radio" name="la" value={la} checked={lifeArea === la} onChange={() => setLifeArea(la)} style={{ display: 'none' }} />
                <span style={{ color: lifeArea === la ? '#C9A84C' : '#8b949e', fontSize: '11px' }}>{la}</span>
              </label>
            ))}
          </div>

          {/* Multitaskable toggle + Bucket */}
          <div style={tileStyle}>
            <div style={tileTitle}>Multitaskable?</div>
            <div
              onClick={() => setMultitask(m => !m)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 6px', borderRadius: '6px',
                background: multitask ? '#1A3A2A' : '#0D1117',
                border: `1px solid ${multitask ? '#1A6B5A' : '#30363d'}`,
                cursor: 'pointer', marginBottom: '8px',
                transition: 'all 0.2s',
              }}
            >
              {/* Toggle pill */}
              <div style={{
                width: '32px', height: '18px', borderRadius: '9px',
                background: multitask ? '#1A6B5A' : '#30363d',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <div style={{
                  position: 'absolute', top: '3px',
                  left: multitask ? '16px' : '3px',
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: multitask ? '#C9A84C' : '#6e7681',
                  transition: 'left 0.2s',
                }} />
              </div>
              <span style={{ fontSize: '11px', color: multitask ? '#6BCB77' : '#6e7681' }}>
                {multitask ? '🔀 Yes' : 'No'}
              </span>
            </div>

            <div style={tileTitle}>Bucket</div>
            <select value={bucket} onChange={e => setBucket(e.target.value)} style={selectStyle}>
              {BUCKETS.map(b => <option key={b} value={b}>{b}™</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <select value={ch} onChange={e => setCh(e.target.value)} style={{ ...selectStyle, flex: 1, minWidth: '160px' }}>
            <option value="">Gita Chapter (optional)</option>
            {GITA_CHAPTERS.map(c => <option key={c.number} value={c.number}>Ch {c.number} — {c.title}</option>)}
          </select>
          <button type="submit" disabled={adding} style={btnStyle}>
            {adding ? '...' : '+ Add to Chakra™'}
          </button>
          <button type="button" onClick={handleEmail} style={{ ...btnStyle, background: '#21262D' }}>✉ Export</button>
        </div>
      </form>

      {loading ? <p style={{ color: '#8b949e' }}>Loading...</p> : (
        tasks.filter(t => !t.completed).slice(0, 20).map(t => (
          <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
        ))
      )}
    </div>
  )
}

const formStyle  = { background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }
const tileStyle  = { background: '#0D1117', border: '1px solid #21262D', borderRadius: '6px', padding: '0.5rem 0.6rem' }
const tileTitle  = { color: '#C9A84C', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }
const radioRow   = (a) => ({ display: 'flex', gap: '6px', alignItems: 'center', padding: '2px 4px', borderRadius: '3px', cursor: 'pointer', background: a ? '#1A3A2A' : 'transparent' })
const selectStyle = { background: '#0D1117', border: '1px solid #30363d', borderRadius: '4px', color: '#e6edf3', fontSize: '12px', padding: '4px 6px' }
const btnStyle   = { padding: '0.55rem 1rem', background: '#1A6B5A', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }
const textareaStyle = { width: '100%', background: '#0D1117', border: '1px solid #1A6B5A', borderRadius: '6px', color: '#e6edf3', fontSize: '14px', padding: '0.6rem 0.75rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }
