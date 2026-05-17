import { useState } from 'react'
import { TIME_FRAMES } from '../../utils/horizonLogic'
import { GITA_CHAPTERS } from '../../data/gitaChapters'
import TaskCard from '../dashboard/TaskCard'

const BUCKETS = ['Karya', 'Dhairya', 'Vishram', 'Manan', 'Tyaga', 'Prarabdha']
const WEIGHTAGES = ['W1', 'W2', 'W3', 'W4', 'W5']
const W_LABELS = { W1: '5–10 min', W2: '20–30 min', W3: '1 hour', W4: 'Half day', W5: 'Full day' }
const LIFE_AREAS = ['Personal/Family', 'Work/Employment', 'Picturizze', 'Other']

const COLOR_LEGEND = [
  { color: '#4A9CC7', label: 'Blue', note: '> 400%' },
  { color: '#6BCB77', label: 'Green', note: '200–400%' },
  { color: '#FFB347', label: 'Amber', note: '100–200%' },
  { color: '#00BFA5', label: 'Teal', note: '50–100% Working Zone' },
  { color: '#E07A5F', label: 'Red', note: '0–50% Act Now' },
]

export default function GatherTab({ tasks, loading, addTask, updateTask, deleteTask }) {
  const [title, setTitle] = useState('')
  const [weightage, setWeightage] = useState('')
  const [timeFrame, setTimeFrame] = useState('')
  const [lifeArea, setLifeArea] = useState('')
  const [ch, setCh] = useState('')
  const [multitask, setMultitask] = useState(false)
  const [bucket, setBucket] = useState('Karya')

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    await addTask({
      title,
      bucket,
      weightage: weightage || null,
      time_horizon: timeFrame || null,
      life_area: lifeArea || null,
      ch: ch ? parseInt(ch) : null,
      multitask,
    })
    setTitle('')
    setWeightage('')
    setTimeFrame('')
    setLifeArea('')
    setCh('')
    setMultitask(false)
  }

  function handleEmail() {
    const body = tasks.filter(t => !t.completed).map(t =>
      `[${t.bucket ?? '—'}] ${t.title} | ${t.weightage ?? '—'} | ${t.time_horizon ?? '—'} | ${t.life_area ?? '—'}`
    ).join('\n')
    const subject = `Karma Kshetra Export ${new Date().toLocaleDateString()}`
    window.location.href = `mailto:dh.kohli@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div>
      {/* Entry form */}
      <form onSubmit={handleAdd} style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What is on your mind?"
          rows={2}
          required
          style={{ width: '100%', background: '#0D1117', border: '1px solid #1A6B5A', borderRadius: '4px', color: '#e6edf3', fontSize: '14px', padding: '0.5rem 0.75rem', resize: 'vertical', boxSizing: 'border-box' }}
        />

        {/* Reference tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '0.75rem' }}>

          {/* Weightage tile */}
          <div style={tileStyle}>
            <div style={tileTitleStyle}>Weightage</div>
            {WEIGHTAGES.map(w => (
              <label key={w} style={radioRowStyle(weightage === w)}>
                <input type="radio" name="w" value={w} checked={weightage === w} onChange={() => setWeightage(w)} style={{ display: 'none' }} />
                <span style={{ color: '#C9A84C', fontWeight: 600, minWidth: '24px' }}>{w}</span>
                <span style={{ color: '#8b949e', fontSize: '11px' }}>{W_LABELS[w]}</span>
              </label>
            ))}
          </div>

          {/* Color intelligence tile */}
          <div style={tileStyle}>
            <div style={tileTitleStyle}>Color Intelligence</div>
            {COLOR_LEGEND.map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ color: '#8b949e', fontSize: '10px' }}>{c.note}</span>
              </div>
            ))}
          </div>

          {/* Time horizon tile */}
          <div style={tileStyle}>
            <div style={tileTitleStyle}>Time Horizon</div>
            {TIME_FRAMES.map(tf => (
              <label key={tf} style={radioRowStyle(timeFrame === tf)}>
                <input type="radio" name="tf" value={tf} checked={timeFrame === tf} onChange={() => setTimeFrame(tf)} style={{ display: 'none' }} />
                <span style={{ color: timeFrame === tf ? '#C9A84C' : '#8b949e', fontSize: '11px' }}>{tf}</span>
              </label>
            ))}
          </div>

          {/* Life area tile */}
          <div style={tileStyle}>
            <div style={tileTitleStyle}>Life Area</div>
            {LIFE_AREAS.map(la => (
              <label key={la} style={radioRowStyle(lifeArea === la)}>
                <input type="radio" name="la" value={la} checked={lifeArea === la} onChange={() => setLifeArea(la)} style={{ display: 'none' }} />
                <span style={{ color: lifeArea === la ? '#C9A84C' : '#8b949e', fontSize: '11px' }}>{la}</span>
              </label>
            ))}
          </div>

          {/* Multitask tile */}
          <div style={tileStyle}>
            <div style={tileTitleStyle}>Multitaskable?</div>
            {[true, false].map(v => (
              <label key={String(v)} style={radioRowStyle(multitask === v)}>
                <input type="radio" name="mt" checked={multitask === v} onChange={() => setMultitask(v)} style={{ display: 'none' }} />
                <span style={{ color: multitask === v ? '#C9A84C' : '#8b949e', fontSize: '11px' }}>{v ? '🔀 Yes' : 'No'}</span>
              </label>
            ))}
            <div style={{ marginTop: '6px' }}>
              <div style={tileTitleStyle}>Bucket</div>
              <select value={bucket} onChange={e => setBucket(e.target.value)} style={selectStyle}>
                {BUCKETS.map(b => <option key={b} value={b}>{b}™</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center' }}>
          <select value={ch} onChange={e => setCh(e.target.value)} style={{ ...selectStyle, flex: 1 }}>
            <option value="">Gita Chapter (optional)</option>
            {GITA_CHAPTERS.map(c => <option key={c.number} value={c.number}>Ch {c.number} — {c.title}</option>)}
          </select>
          <button type="submit" style={btnStyle}>+ Add to Chakra™</button>
          <button type="button" onClick={handleEmail} style={{ ...btnStyle, background: '#21262D' }}>✉ Export</button>
        </div>
      </form>

      {/* Recent tasks */}
      {loading ? <p style={{ color: '#8b949e' }}>Loading...</p> : (
        tasks.filter(t => !t.completed).slice(0, 20).map(t => (
          <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
        ))
      )}
    </div>
  )
}

const tileStyle = { background: '#0D1117', border: '1px solid #21262D', borderRadius: '6px', padding: '0.5rem 0.6rem' }
const tileTitleStyle = { color: '#C9A84C', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }
const radioRowStyle = (active) => ({ display: 'flex', gap: '6px', alignItems: 'center', padding: '2px 4px', borderRadius: '3px', cursor: 'pointer', background: active ? '#1A3A2A' : 'transparent' })
const selectStyle = { background: '#0D1117', border: '1px solid #30363d', borderRadius: '4px', color: '#e6edf3', fontSize: '12px', padding: '4px 6px' }
const btnStyle = { padding: '0.55rem 1rem', background: '#1A6B5A', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }
