import { useRef, useState } from 'react'
import { TIME_FRAMES, HORIZON_LABELS } from '../../utils/horizonLogic'
import { GITA_CHAPTERS } from '../../data/gitaChapters'
import { llmAPI } from '../../services/api'
import TaskCard from '../dashboard/TaskCard'

const BUCKETS    = ['Karya', 'Dhairya', 'Vishram', 'Manan', 'Tyaga', 'Prarabdha']
const WEIGHTAGES = ['W1', 'W2', 'W3', 'W4', 'W5']
const W_LABELS   = { W1: '5–10 min', W2: '20–30 min', W3: '1 hour', W4: 'Half day', W5: 'Full day' }
const LIFE_AREAS = ['Personal/Family', 'Work/Employment', 'Picturizze', 'Other']
const COLOR_LEGEND = [
  { color: '#4A9CC7', note: '> 400% Blue' },
  { color: '#6BCB77', note: '200–400% Green' },
  { color: '#FFB347', note: '100–200% Amber' },
  { color: '#00BFA5', note: '50–100% Working Zone' },
  { color: '#E07A5F', note: '0–50% Act Now' },
]

// Keyword auto-parsers
const W_PATTERN = /\b(W[1-5])\b/i
const HORIZON_KEYWORDS = {
  'today': 'today', 'this week': 'thisWeek', 'next week': 'nextWeek',
  'this month': 'thisMonth', 'next month': 'nextMonth',
  'q3': 'Q3', 'q4': 'Q4', 'this year': 'thisYear',
}

function parseKeywords(text) {
  const hints = {}
  const lower = text.toLowerCase()
  const wMatch = text.match(W_PATTERN)
  if (wMatch) hints.weightage = wMatch[1].toUpperCase()
  for (const [kw, val] of Object.entries(HORIZON_KEYWORDS)) {
    if (lower.includes(kw)) { hints.timeFrame = val; break }
  }
  if (/\b(quick|multi|multitask)\b/i.test(text)) hints.multitask = true
  return hints
}

export default function GatherTab({ tasks, loading, addTask, updateTask, deleteTask, importTasks }) {
  const [title, setTitle]         = useState('')
  const [weightage, setWeightage] = useState('')
  const [timeFrame, setTimeFrame] = useState('')
  const [lifeArea, setLifeArea]   = useState('')
  const [ch, setCh]               = useState('')
  const [multitask, setMultitask] = useState(false)
  const [bucket, setBucket]       = useState('Karya')
  const [adding, setAdding]       = useState(false)

  // Image upload state
  const [imgBase64, setImgBase64]   = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [imgScanning, setImgScanning] = useState(false)
  const [imgError, setImgError]     = useState(null)
  const imgInputRef = useRef(null)

  // Import/sync state
  const [importOpen, setImportOpen]   = useState(false)
  const [importText, setImportText]   = useState('')
  const [importStatus, setImportStatus] = useState(null)
  const [importing, setImporting]     = useState(false)
  const importFileRef = useRef(null)

  function handleTitleChange(e) {
    const val = e.target.value
    setTitle(val)
    // Auto-fill empty fields from keywords
    const hints = parseKeywords(val)
    if (hints.weightage && !weightage) setWeightage(hints.weightage)
    if (hints.timeFrame && !timeFrame) setTimeFrame(hints.timeFrame)
    if (hints.multitask && !multitask) setMultitask(true)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    // Add one task per non-empty line
    const lines = title.split('\n').map(l => l.trim()).filter(Boolean)
    for (const line of lines) {
      await addTask({
        title: line,
        bucket,
        weightage: weightage || null,
        time_horizon: timeFrame || null,
        life_area: lifeArea || null,
        ch: ch ? parseInt(ch) : null,
        multitask,
      })
    }
    setTitle(''); setWeightage(''); setTimeFrame(''); setLifeArea(''); setCh(''); setMultitask(false)
    setAdding(false)
  }

  // ── Image handling ───────────────────────────────────────
  function handleImgSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgError(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const mW = 800
        const scale = img.width > mW ? mW / img.width : 1
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const cv = document.createElement('canvas')
        cv.width = w; cv.height = h
        cv.getContext('2d').drawImage(img, 0, 0, w, h)
        const compressed = cv.toDataURL('image/jpeg', 0.72)
        const b64 = compressed.split(',')[1]
        setImgBase64(b64)
        setImgPreview(compressed)
        if (!title) {
          document.getElementById('gatherTextarea')?.focus()
        }
      }
      img.onerror = () => setImgError('Could not load image.')
      img.src = ev.target.result
    }
    reader.onerror = () => setImgError('Could not read file.')
    reader.readAsDataURL(file)
  }

  async function handleScanWithAI() {
    if (!imgBase64) return
    setImgScanning(true)
    setImgError(null)
    try {
      const prompt = 'Extract all action tasks from this image. Return ONLY a plain list of clear task titles, one per line, no numbering, no explanations.'
      const { data } = await llmAPI.chatVision([{ role: 'user', content: prompt }], imgBase64)
      const lines = data.content.split('\n').map(l => l.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean)
      setTitle(prev => prev ? prev + '\n' + lines.join('\n') : lines.join('\n'))
    } catch (err) {
      setImgError(err?.response?.data?.detail || err?.message || 'Scan failed')
    } finally {
      setImgScanning(false)
    }
  }

  function clearImg() {
    setImgBase64(null); setImgPreview(null); setImgError(null)
    if (imgInputRef.current) imgInputRef.current.value = ''
  }

  // ── Import / Sync ────────────────────────────────────────
  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImportText(ev.target.result)
    reader.readAsText(file)
  }

  async function handleImport() {
    setImportStatus(null)
    let parsed
    try {
      parsed = JSON.parse(importText)
      if (!Array.isArray(parsed)) throw new Error('Expected a JSON array')
    } catch (err) {
      setImportStatus({ ok: false, msg: `Invalid JSON: ${err.message}` })
      return
    }
    setImporting(true)
    try {
      const added = await importTasks(parsed)
      setImportStatus({ ok: true, msg: `Added ${added} new tasks. Skipped duplicates.` })
      setImportText('')
    } catch (err) {
      setImportStatus({ ok: false, msg: err?.message || 'Import failed' })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleAdd} style={formStyle}>
        <textarea
          id="gatherTextarea"
          value={title}
          onChange={handleTitleChange}
          placeholder="What is on your mind? One task per line — or paste AI-extracted tasks here"
          rows={imgBase64 ? 3 : 2}
          required
          style={textareaStyle}
        />

        {/* Image upload section */}
        <div style={imgSectionStyle}>
          <div style={sectionLbl}>📷 Upload photo or screenshot</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={imgUploadBtn}>
              <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImgSelect} style={{ display: 'none' }} />
              📷 Choose image
            </label>
            {imgBase64 && (
              <>
                <button type="button" onClick={handleScanWithAI} disabled={imgScanning} style={{ ...btnStyle, fontSize: '11px', padding: '5px 10px', background: '#1A3A5A' }}>
                  {imgScanning ? '⟳ Scanning…' : '✦ Scan with AI'}
                </button>
                <button type="button" onClick={clearImg} style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: '12px' }}>
                  ✕ Clear
                </button>
              </>
            )}
          </div>
          {imgPreview && (
            <img src={imgPreview} alt="preview" style={{ maxWidth: '120px', maxHeight: '90px', borderRadius: '6px', border: '1px solid #30363d', marginTop: '8px', display: 'block' }} />
          )}
          {imgError && <div style={{ color: '#E07A5F', fontSize: '11px', marginTop: '4px' }}>{imgError}</div>}
          {imgBase64 && !imgScanning && (
            <div style={{ color: '#6e7681', fontSize: '10px', marginTop: '4px', fontStyle: 'italic' }}>
              Image ready — press "Scan with AI" to extract tasks, or type them manually above.
            </div>
          )}
        </div>

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
                <span style={{ color: timeFrame === tf ? '#C9A84C' : '#8b949e', fontSize: '11px' }}>
                  {HORIZON_LABELS[tf] ?? tf}
                </span>
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

          {/* Multitaskable + Bucket */}
          <div style={tileStyle}>
            <div style={tileTitle}>Multitaskable?</div>
            <div
              onClick={() => setMultitask(m => !m)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 6px', borderRadius: '6px',
                background: multitask ? '#1A3A2A' : '#0D1117',
                border: `1px solid ${multitask ? '#1A6B5A' : '#30363d'}`,
                cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s',
              }}
            >
              <div style={{ width: '32px', height: '18px', borderRadius: '9px', background: multitask ? '#1A6B5A' : '#30363d', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: '3px', left: multitask ? '16px' : '3px', width: '12px', height: '12px', borderRadius: '50%', background: multitask ? '#C9A84C' : '#6e7681', transition: 'left 0.2s' }} />
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
        </div>
      </form>

      {/* Import / Sync panel */}
      <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setImportOpen(o => !o)}
          style={{ width: '100%', background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', padding: '0.6rem 0.75rem', fontSize: '11px', fontWeight: 700, textAlign: 'left', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          {importOpen ? '▾' : '▸'} Import / Saarthi Sync
        </button>

        {importOpen && (
          <div style={{ padding: '0 0.75rem 0.75rem' }}>
            <div style={{ color: '#6e7681', fontSize: '10px', marginBottom: '6px' }}>
              Paste a JSON task array, or choose a backup file. New tasks (by title) will be added; duplicates skipped.
            </div>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder='[{"title":"...", "bucket":"Karya", ...}, ...]'
              rows={4}
              style={{ ...textareaStyle, fontSize: '11px', marginBottom: '6px' }}
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ ...btnStyle, background: '#21262D', fontSize: '11px', padding: '5px 10px', cursor: 'pointer' }}>
                <input ref={importFileRef} type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
                📂 Load JSON file
              </label>
              <button type="button" onClick={handleImport} disabled={importing || !importText.trim()} style={{ ...btnStyle, fontSize: '11px', padding: '5px 10px' }}>
                {importing ? '⟳ Importing…' : '⟳ Sync & Import'}
              </button>
            </div>
            {importStatus && (
              <div style={{ fontSize: '11px', marginTop: '6px', color: importStatus.ok ? '#6BCB77' : '#E07A5F' }}>
                {importStatus.msg}
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? <p style={{ color: '#8b949e' }}>Loading...</p> : (
        tasks.filter(t => !t.completed).slice(0, 20).map(t => (
          <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
        ))
      )}
    </div>
  )
}

const formStyle     = { background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }
const tileStyle     = { background: '#0D1117', border: '1px solid #21262D', borderRadius: '6px', padding: '0.5rem 0.6rem' }
const tileTitle     = { color: '#C9A84C', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }
const radioRow      = (a) => ({ display: 'flex', gap: '6px', alignItems: 'center', padding: '2px 4px', borderRadius: '3px', cursor: 'pointer', background: a ? '#1A3A2A' : 'transparent' })
const selectStyle   = { background: '#0D1117', border: '1px solid #30363d', borderRadius: '4px', color: '#e6edf3', fontSize: '12px', padding: '4px 6px' }
const btnStyle      = { padding: '0.55rem 1rem', background: '#1A6B5A', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }
const textareaStyle = { width: '100%', background: '#0D1117', border: '1px solid #1A6B5A', borderRadius: '6px', color: '#e6edf3', fontSize: '14px', padding: '0.6rem 0.75rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }
const imgSectionStyle = { background: 'rgba(26,107,90,.05)', border: '1.5px solid rgba(26,107,90,.2)', borderRadius: '8px', padding: '10px 12px', marginTop: '10px' }
const sectionLbl    = { color: '#00BFA5', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }
const imgUploadBtn  = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1.5px dashed rgba(26,107,90,.4)', background: 'rgba(26,107,90,.04)', color: '#00BFA5', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }
