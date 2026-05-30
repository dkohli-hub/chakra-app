import { useState, useRef, useEffect } from 'react'
import { llmAPI } from '../../services/api'
import TaskCard from '../dashboard/TaskCard'

const PRESETS = [
  { icon: '🚗', label: 'While driving',    query: 'Which tasks can I do while driving or commuting?' },
  { icon: '⚡', label: 'Quick wins',        query: 'Show me quick tasks I can finish in under 10 minutes' },
  { icon: '📅', label: 'Today',            query: 'What should I focus on today?' },
  { icon: '★',  label: 'Overdue',          query: 'Which tasks are overdue or most urgent?' },
  { icon: '📷', label: 'Picturizze',       query: 'Show me all Picturizze photography tasks' },
  { icon: '🚶', label: 'While walking',    query: 'What can I do while walking or exercising?' },
  { icon: '🧠', label: 'Heavy thinking',   query: 'What are my heaviest W4 or W5 tasks that need deep focus?' },
  { icon: '✅', label: 'Close now',        query: 'Which tasks are closest to done and easiest to close?' },
]

function buildPrompt(query, tasks) {
  const active = tasks.filter(t => !t.completed).slice(0, 60)
  const taskList = active.map(t =>
    `ID:${t.id} | "${t.title}" | ${t.bucket ?? '—'} | ${t.weightage ?? '—'} | ${t.time_horizon ?? '—'} | ${t.life_area ?? '—'} | multitask:${t.multitask ? 'yes' : 'no'}`
  ).join('\n')

  return `You are an AI assistant for Chakra™, a mind organization system based on the Bhagavad Gita.

The user has these active tasks:
${taskList}

User query: "${query}"

Return ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "ids": [array of 3 to 8 matching task IDs as numbers],
  "reasoning": "one short sentence explaining why these tasks match"
}`
}

export default function SmartFetch({ tasks, updateTask, deleteTask }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)   // { ids, reasoning }
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  async function runQuery(q) {
    const text = q ?? query
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setResults(null)
    try {
      const prompt = buildPrompt(text, tasks)
      const { data } = await llmAPI.chat([{ role: 'user', content: prompt }])
      const parsed = JSON.parse(data.content)
      setResults(parsed)
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || 'Unknown error'
      setError(`Error: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const matchedTasks = results
    ? tasks.filter(t => results.ids?.includes(t.id))
    : []

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(o => !o); setResults(null); setQuery('') }}
        title="Smart Fetch — AI Task Search"
        style={{
          position: 'fixed', bottom: '88px', right: '1.5rem', zIndex: 1000,
          width: '48px', height: '48px', borderRadius: '50%',
          background: open ? '#1A6B5A' : '#0D1117',
          border: '2px solid #C9A84C',
          color: '#C9A84C', fontSize: '20px', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {open ? '✕' : '✦'}
      </button>

      {/* Slide-up panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '9rem', right: '1rem', zIndex: 999,
          width: 'min(420px, calc(100vw - 2rem))',
          background: '#161B22',
          border: '1px solid #C9A84C40',
          borderRadius: '12px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          animation: 'fadeSlideIn 0.22s ease',
          display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100vh - 8rem)',
        }}>
          {/* Header */}
          <div style={{ padding: '0.9rem 1rem 0.6rem', borderBottom: '1px solid #21262D' }}>
            <div style={{ color: '#C9A84C', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}>✦ Smart Fetch</div>
            <div style={{ color: '#6e7681', fontSize: '10px', marginTop: '2px' }}>Ask AI to find the right tasks for this moment</div>
          </div>

          {/* Presets */}
          <div style={{ padding: '0.6rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '6px', borderBottom: '1px solid #21262D' }}>
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => { setQuery(p.query); runQuery(p.query) }}
                style={{
                  background: '#0D1117', border: '1px solid #30363d', borderRadius: '20px',
                  color: '#8b949e', fontSize: '11px', padding: '3px 10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.color = '#8b949e' }}
              >
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '0.6rem 1rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid #21262D' }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runQuery()}
              placeholder="Ask anything about your tasks..."
              style={{
                flex: 1, background: '#0D1117', border: '1px solid #1A6B5A',
                borderRadius: '6px', color: '#e6edf3', fontSize: '13px',
                padding: '0.5rem 0.75rem', outline: 'none',
              }}
            />
            <button
              onClick={() => runQuery()}
              disabled={loading}
              style={{
                background: '#1A6B5A', border: 'none', borderRadius: '6px',
                color: '#C9A84C', fontWeight: 700, fontSize: '13px',
                padding: '0.5rem 0.9rem', cursor: 'pointer',
              }}
            >
              {loading ? '...' : 'Go'}
            </button>
          </div>

          {/* Results */}
          <div style={{ overflowY: 'auto', padding: '0.75rem 1rem', flex: 1 }}>
            {loading && (
              <p style={{ color: '#8b949e', fontSize: '12px', textAlign: 'center', padding: '1rem 0' }}>
                ✦ AI is thinking...
              </p>
            )}
            {error && <p style={{ color: '#E07A5F', fontSize: '12px' }}>{error}</p>}
            {results && !loading && (
              <>
                {results.reasoning && (
                  <div style={{ background: '#0D1117', border: '1px solid #1A6B5A40', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#1A6B5A', fontSize: '10px', fontWeight: 700 }}>✦ AI matched</span>
                    <p style={{ color: '#8b949e', fontSize: '11px', marginTop: '3px', fontStyle: 'italic' }}>{results.reasoning}</p>
                  </div>
                )}
                {matchedTasks.length > 0
                  ? matchedTasks.map(t => (
                      <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
                    ))
                  : <p style={{ color: '#6e7681', fontSize: '12px' }}>No matching tasks found.</p>
                }
              </>
            )}
            {!loading && !results && !error && (
              <p style={{ color: '#3a4a40', fontSize: '11px', textAlign: 'center', padding: '1rem 0' }}>
                Select a preset or type your question above
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
