import { useRef, useState } from 'react'
import { TIME_FRAMES, HORIZON_LABELS } from '../../utils/horizonLogic'
import { GITA_CHAPTERS } from '../../data/gitaChapters'
import { llmAPI } from '../../services/api'
import TaskCard from '../dashboard/TaskCard'
import { T } from '../../utils/theme'
import ScheduleConfirmModal from '../calendar/ScheduleConfirmModal'

const BUCKETS    = ['Karya', 'Dhairya', 'Vishram', 'Manan', 'Tyaga', 'Prarabdha']
const WEIGHTAGES = ['W1', 'W2', 'W3', 'W4', 'W5']
const W_LABELS   = { W1: '5–10 min', W2: '20–30 min', W3: '1 hour', W4: 'Half day', W5: 'Full day' }
const LIFE_AREAS = ['Picturizze', 'House of DK', 'DK Academy', 'Family & Personal', 'Health & Self', 'Connection', 'Other']
const COLOR_LEGEND = [
  { color: T.blue,        note: '> 400% Blue' },
  { color: T.green,       note: '200–400% Green' },
  { color: T.amber,       note: '100–200% Amber' },
  { color: T.workingZone, note: '50–100% Working Zone' },
  { color: T.red,         note: '0–50% Act Now' },
]

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
  const [taskAdded, setTaskAdded] = useState(false)

  // Google Calendar popup state
  const [showCalendarPrompt, setShowCalendarPrompt] = useState(false)
  const [lastAddedTask, setLastAddedTask]           = useState(null)

  // Image upload state
  const [imgBase64, setImgBase64]     = useState(null)
  const [imgPreview, setImgPreview]   = useState(null)
  const [imgScanning, setImgScanning] = useState(false)
  const [imgError, setImgError]       = useState(null)
  const imgInputRef = useRef(null)

  // Import/sync state
  const [importOpen, setImportOpen]     = useState(false)
  const [importText, setImportText]     = useState('')
  const [importStatus, setImportStatus] = useState(null)
  const [importing, setImporting]       = useState(false)
  const importFileRef = useRef(null)

  // Voice input state
  const [listening, setListening]   = useState(false)
  const [voiceError, setVoiceError] = useState(null)
  const recognitionRef = useRef(null)

  // Research chatbot state
  const [researchOpen, setResearchOpen]       = useState(false)
  const [researchInput, setResearchInput]     = useState('')
  const [researchLoading, setResearchLoading] = useState(false)
  const [researchMessages, setResearchMessages] = useState([])

  function handleTitleChange(e) {
    const val = e.target.value
    setTitle(val)
    const hints = parseKeywords(val)
    if (hints.weightage && !weightage) setWeightage(hints.weightage)
    if (hints.timeFrame && !timeFrame) setTimeFrame(hints.timeFrame)
    if (hints.multitask && !multitask) setMultitask(true)
  }

  function buildTaskData(titleLine) {
    return {
      title: titleLine,
      bucket,
      weightage: weightage || null,
      time_horizon: timeFrame || null,
      life_area: lifeArea || null,
      ch: ch ? parseInt(ch) : null,
      multitask,
    }
  }

  function resetForm() {
    setTitle(''); setWeightage(''); setTimeFrame(''); setLifeArea(''); setCh(''); setMultitask(false)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    const lines = title.split('\n').map(l => l.trim()).filter(Boolean)
    const firstTask = buildTaskData(lines[0])
    for (const line of lines) await addTask(buildTaskData(line))
    resetForm()
    setAdding(false)
    setTaskAdded(true)
    setLastAddedTask(firstTask)
    setTimeout(() => setShowCalendarPrompt(true), 1500)
    setTimeout(() => setTaskAdded(false), 3000)
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
        if (!title) document.getElementById('gatherTextarea')?.focus()
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

  // ── Voice input ───────────────────────────────────────────
  function toggleVoice() {
    setVoiceError(null)
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setVoiceError('Speech recognition not supported in this browser. Use Chrome.'); return }

    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    recognitionRef.current = rec

    rec.onstart  = () => setListening(true)
    rec.onend    = () => setListening(false)
    rec.onerror  = (e) => { setVoiceError(e.error === 'not-allowed' ? 'Microphone access denied.' : `Error: ${e.error}`); setListening(false) }
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim()
      setTitle(prev => {
        const updated = prev ? prev + '\n' + transcript : transcript
        const hints = parseKeywords(transcript)
        if (hints.weightage && !weightage) setWeightage(hints.weightage)
        if (hints.timeFrame && !timeFrame) setTimeFrame(hints.timeFrame)
        return updated
      })
    }

    rec.start()
  }

  // ── Research chatbot ──────────────────────────────────────
  async function handleResearchSend(e) {
    e.preventDefault()
    if (!researchInput.trim() || researchLoading) return
    const question = researchInput.trim()
    setResearchMessages(prev => [...prev, { role: 'user', content: question }])
    setResearchInput('')
    setResearchLoading(true)
    try {
      const { data } = await llmAPI.research(question)
      setResearchMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch (err) {
      setResearchMessages(prev => [...prev, { role: 'assistant', content: '⚠ ' + (err?.response?.data?.detail || err?.message || 'Research failed') }])
    } finally {
      setResearchLoading(false)
    }
  }

  return (
    <div>
      {/* ── Gather form ───────────────────────────────────── */}
      <form onSubmit={handleAdd} style={formStyle}>
        {/* Textarea + mic row */}
        <div style={{ position: 'relative' }}>
          <textarea
            id="gatherTextarea"
            value={title}
            onChange={handleTitleChange}
            placeholder="What is on your mind? One task per line — or paste AI-extracted tasks here"
            rows={imgBase64 ? 3 : 2}
            required
            style={{ ...textareaStyle, paddingRight: '48px' }}
          />
          <MicButton listening={listening} onClick={toggleVoice} style={{ position: 'absolute', top: '8px', right: '8px' }} />
        </div>

        {/* Voice status bar */}
        {(listening || voiceError) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginTop: '6px', padding: '7px 10px', borderRadius: '8px',
            background: voiceError ? T.redBg : T.tealBg,
            border: `1px solid ${voiceError ? T.red : T.teal}30`,
          }}>
            {listening && <span style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: 'inline-block', width: '3px', borderRadius: '2px',
                  background: T.teal, animation: `micBar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                  height: i === 1 ? '14px' : '8px',
                }} />
              ))}
            </span>}
            <span style={{ fontSize: '11px', color: voiceError ? T.red : T.teal, fontWeight: 500 }}>
              {voiceError || 'Listening… speak your task clearly'}
            </span>
            {listening && <span style={{ marginLeft: 'auto', fontSize: '10px', color: T.textMuted }}>tap ⏹ to stop</span>}
          </div>
        )}

        {/* Voice user guide */}
        <VoiceGuide />

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
                <button type="button" onClick={handleScanWithAI} disabled={imgScanning} style={{ ...btnStyle, fontSize: '11px', padding: '5px 10px' }}>
                  {imgScanning ? '⟳ Scanning…' : '✦ Scan with AI'}
                </button>
                <button type="button" onClick={clearImg} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: '12px' }}>
                  ✕ Clear
                </button>
              </>
            )}
          </div>
          {imgPreview && (
            <img src={imgPreview} alt="preview" style={{ maxWidth: '120px', maxHeight: '90px', borderRadius: '6px', border: `1px solid ${T.border}`, marginTop: '8px', display: 'block' }} />
          )}
          {imgError && <div style={{ color: T.red, fontSize: '11px', marginTop: '4px' }}>{imgError}</div>}
          {imgBase64 && !imgScanning && (
            <div style={{ color: T.textMuted, fontSize: '10px', marginTop: '4px', fontStyle: 'italic' }}>
              Image ready — press "Scan with AI" to extract tasks, or type them manually above.
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', marginTop: '0.75rem' }}>

          {/* Weightage */}
          <div style={tileStyle}>
            <div style={tileTitle}>Weightage</div>
            {WEIGHTAGES.map(w => (
              <label key={w} style={radioRow(weightage === w)}>
                <input type="radio" name="w" value={w} checked={weightage === w} onChange={() => setWeightage(w)} style={{ display: 'none' }} />
                <span style={{ color: T.goldText, fontWeight: 700, minWidth: '22px', fontSize: '12px' }}>{w}</span>
                <span style={{ color: T.textMuted, fontSize: '10px' }}>{W_LABELS[w]}</span>
              </label>
            ))}
          </div>

          {/* Color Intelligence */}
          <div style={tileStyle}>
            <div style={tileTitle}>Color Intelligence</div>
            {COLOR_LEGEND.map(c => (
              <div key={c.note} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ color: T.textMuted, fontSize: '10px' }}>{c.note}</span>
              </div>
            ))}
          </div>

          {/* Time Horizon */}
          <div style={tileStyle}>
            <div style={tileTitle}>Time Horizon</div>
            {TIME_FRAMES.map(tf => (
              <label key={tf} style={radioRow(timeFrame === tf)}>
                <input type="radio" name="tf" value={tf} checked={timeFrame === tf} onChange={() => setTimeFrame(tf)} style={{ display: 'none' }} />
                <span style={{ color: timeFrame === tf ? T.goldText : T.textMuted, fontSize: '11px' }}>
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
                <span style={{ color: lifeArea === la ? T.goldText : T.textMuted, fontSize: '11px', wordBreak: 'break-word', minWidth: 0 }}>{la}</span>
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
                background: multitask ? T.tealBg : T.surface2,
                border: `1px solid ${multitask ? T.teal : T.border}`,
                cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s',
              }}
            >
              <div style={{ width: '32px', height: '18px', borderRadius: '9px', background: multitask ? T.teal : T.borderLight, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: '3px', left: multitask ? '16px' : '3px', width: '12px', height: '12px', borderRadius: '50%', background: multitask ? T.gold : T.textMuted, transition: 'left 0.2s' }} />
              </div>
              <span style={{ fontSize: '11px', color: multitask ? T.teal : T.textMuted }}>
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
          <select value={ch} onChange={e => setCh(e.target.value)} style={{ ...selectStyle, flex: 1, minWidth: 0, width: '100%' }}>
            <option value="">Gita Chapter (optional)</option>
            {GITA_CHAPTERS.map(c => <option key={c.number} value={c.number}>Ch {c.number} — {c.title}</option>)}
          </select>
          <button type="submit" disabled={adding} style={{ ...btnStyle, width: '100%' }}>
            {adding ? '⟳ Saving…' : '+ Add to Chakra™'}
          </button>
        </div>

      </form>

      {/* ── Research AI Chatbot ───────────────────────────── */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', marginBottom: '1rem', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setResearchOpen(o => !o)}
          style={{
            width: '100%', background: researchOpen ? T.tealBg : 'none', border: 'none',
            color: researchOpen ? T.teal : T.goldText, cursor: 'pointer',
            padding: '0.65rem 0.85rem', fontSize: '11px', fontWeight: 700,
            textAlign: 'left', letterSpacing: '0.08em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <span style={{ fontSize: '14px' }}>🔍</span>
          {researchOpen ? '▾' : '▸'} Research — Ask Anything
          {researchOpen && <span style={{ marginLeft: 'auto', fontSize: '10px', color: T.teal, fontWeight: 400 }}>Powered by Chakra™ AI</span>}
        </button>

        {researchOpen && (
          <div style={{ padding: '0.75rem', borderTop: `1px solid ${T.border}` }}>
            {/* Chat history */}
            {researchMessages.length > 0 && (
              <div style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {researchMessages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      maxWidth: '85%', padding: '8px 12px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: msg.role === 'user' ? T.teal : T.surface2,
                      color: msg.role === 'user' ? '#fff' : T.text,
                      fontSize: '12px', lineHeight: 1.5,
                      border: msg.role === 'assistant' ? `1px solid ${T.border}` : 'none',
                      fontFamily: msg.role === 'assistant' ? "'Cormorant Garamond', serif" : 'inherit',
                      fontStyle: msg.role === 'assistant' ? 'italic' : 'normal',
                      fontSize: msg.role === 'assistant' ? '13px' : '12px',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {researchLoading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '12px 12px 12px 2px', padding: '8px 14px', color: T.textMuted, fontSize: '12px' }}>
                      ✦ Thinking…
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleResearchSend} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={researchInput}
                onChange={e => setResearchInput(e.target.value)}
                placeholder="Ask anything — productivity, Gita wisdom, life clarity…"
                autoFocus={researchMessages.length === 0}
                disabled={researchLoading}
                style={{
                  flex: 1, background: T.surface2, border: `1px solid ${T.border}`,
                  borderRadius: '6px', color: T.text, fontSize: '12px',
                  padding: '7px 10px', outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={researchLoading || !researchInput.trim()}
                style={{ ...btnStyle, padding: '7px 14px', fontSize: '12px', opacity: researchLoading ? 0.6 : 1 }}
              >
                ✦
              </button>
            </form>

            {researchMessages.length > 0 && (
              <button
                type="button"
                onClick={() => setResearchMessages([])}
                style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: '10px', cursor: 'pointer', marginTop: '6px', padding: 0 }}
              >
                Clear conversation
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Import / Sync panel ───────────────────────────── */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', marginBottom: '1rem', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setImportOpen(o => !o)}
          style={{ width: '100%', background: 'none', border: 'none', color: T.goldText, cursor: 'pointer', padding: '0.65rem 0.85rem', fontSize: '11px', fontWeight: 700, textAlign: 'left', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          {importOpen ? '▾' : '▸'} Import / Saarthi Sync
        </button>

        {importOpen && (
          <div style={{ padding: '0 0.75rem 0.75rem', borderTop: `1px solid ${T.border}` }}>
            <div style={{ color: T.textMuted, fontSize: '10px', marginBottom: '6px', paddingTop: '0.5rem' }}>
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
              <label style={{ ...btnStyle, background: T.surface2, color: T.text2, border: `1px solid ${T.border}`, fontSize: '11px', padding: '5px 10px', cursor: 'pointer' }}>
                <input ref={importFileRef} type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
                📂 Load JSON file
              </label>
              <button type="button" onClick={handleImport} disabled={importing || !importText.trim()} style={{ ...btnStyle, fontSize: '11px', padding: '5px 10px' }}>
                {importing ? '⟳ Importing…' : '⟳ Sync & Import'}
              </button>
            </div>
            {importStatus && (
              <div style={{ fontSize: '11px', marginTop: '6px', color: importStatus.ok ? T.green : T.red }}>
                {importStatus.msg}
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? <p style={{ color: T.textMuted }}>Loading...</p> : (
        tasks.filter(t => !t.completed).slice(0, 20).map(t => (
          <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />
        ))
      )}

      {/* Task Added success popup */}
      {taskAdded && (
        <div style={{
          position: 'fixed', bottom: '170px', left: 0, right: 0, margin: '0 auto',
          width: 'fit-content', zIndex: 1100,
          background: T.teal, color: '#fff',
          padding: '10px 24px', borderRadius: '24px',
          fontSize: '13px', fontWeight: 700,
          boxShadow: '0 4px 20px rgba(26,107,90,0.4)',
          animation: 'fadeSlideIn 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '16px' }}>✓</span> Task Added
        </div>
      )}

      {showCalendarPrompt && lastAddedTask && (
        <ScheduleConfirmModal
          task={lastAddedTask}
          onDone={() => setShowCalendarPrompt(false)}
          onCancel={() => setShowCalendarPrompt(false)}
        />
      )}
    </div>
  )
}

// ── Shared mic button ─────────────────────────────────────────────────────────
export function MicButton({ listening, onClick, style = {} }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={listening ? 'Stop listening' : 'Speak your task'}
      className={listening ? 'mic-pulse' : ''}
      style={{
        width: '36px', height: '36px', borderRadius: '50%', border: 'none',
        background: listening ? T.red : T.teal,
        color: '#fff', cursor: 'pointer', fontSize: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'background 0.2s',
        ...style,
      }}
    >
      {listening
        ? <span style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '16px' }}>
            {[4,10,7].map((h, i) => (
              <span key={i} style={{
                width: '3px', borderRadius: '2px', background: '#fff',
                height: `${h}px`,
                animation: `micBar 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
              }} />
            ))}
          </span>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
            <line x1="8"  y1="22" x2="16" y2="22"/>
          </svg>
      }
    </button>
  )
}

// ── Voice user guide ──────────────────────────────────────────────────────────
export function VoiceGuide() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginTop: '8px' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', color: T.textMuted, fontSize: '10px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        How to use voice input {open ? '▴' : '▾'}
      </button>
      {open && (
        <div style={{
          marginTop: '8px', padding: '10px 12px', borderRadius: '10px',
          background: T.surface2, border: `1px solid ${T.border}`, fontSize: '11px', color: T.text2, lineHeight: 1.8,
        }}>
          <div style={{ color: T.goldText, fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>🎙 Voice Input Guide</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 10px' }}>
            <span style={{ color: T.teal, fontWeight: 700 }}>1.</span><span>Tap the <strong>mic button</strong> — allow microphone access when prompted</span>
            <span style={{ color: T.teal, fontWeight: 700 }}>2.</span><span>Speak your task clearly — it transcribes automatically</span>
            <span style={{ color: T.teal, fontWeight: 700 }}>3.</span><span>Tap again or pause to stop — transcript appears in the text field</span>
            <span style={{ color: T.teal, fontWeight: 700 }}>4.</span><span>Say keywords like <em>"this week"</em>, <em>"W3"</em>, <em>"today"</em> — fields auto-fill</span>
          </div>
          <div style={{ marginTop: '8px', padding: '6px 8px', background: T.amberBg, borderRadius: '6px', color: T.amber, fontSize: '10px' }}>
            Works best on <strong>Chrome</strong> or <strong>Edge</strong>. Not supported on Firefox or Safari iOS.
          </div>
        </div>
      )}
    </div>
  )
}

const formStyle     = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }
const tileStyle     = { background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '0.4rem 0.5rem', minWidth: 0, overflow: 'hidden' }
const tileTitle     = { color: T.goldText, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }
const radioRow      = (a) => ({ display: 'flex', gap: '6px', alignItems: 'center', padding: '2px 4px', borderRadius: '3px', cursor: 'pointer', background: a ? T.tealBg : 'transparent', overflow: 'hidden' })
const selectStyle   = { background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '6px', color: T.text, fontSize: '12px', padding: '5px 8px' }
const btnStyle      = { padding: '0.55rem 1rem', background: T.teal, color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }
const textareaStyle = { width: '100%', background: T.surface2, border: `1.5px solid ${T.teal}`, borderRadius: '8px', color: T.text, fontSize: '14px', padding: '0.65rem 0.85rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }
const imgSectionStyle = { background: T.tealBg, border: `1.5px solid ${T.teal}30`, borderRadius: '8px', padding: '10px 12px', marginTop: '10px' }
const sectionLbl    = { color: T.teal, fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }
const imgUploadBtn  = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: `1.5px dashed ${T.teal}60`, background: 'rgba(26,107,90,0.04)', color: T.teal, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }
