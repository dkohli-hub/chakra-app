import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { T } from '../../utils/theme'
import TabNav from './TabNav'
import QuickGatherFAB from '../fab/QuickGatherFAB'
import BatteryTab from '../tabs/BatteryTab'
import GatherTab from '../tabs/GatherTab'
import TimeTab from '../tabs/TimeTab'
import KarmaTab from '../tabs/KarmaTab'
import GitaTab from '../tabs/GitaTab'
import SoulTab from '../tabs/SoulTab'
import BrainTwinTab from '../tabs/BrainTwinTab'
import DataTab from '../tabs/DataTab'
import ScoreTab from '../tabs/ScoreTab'
import SmartFetch from '../smartfetch/SmartFetch'
import CalendarModal from '../calendar/CalendarModal'

const KRISHNA_VERSES = [
  '"Do your duty without attachment to results." — Gita 3.19',
  '"The soul is never born nor dies at any time." — Gita 2.20',
  '"Let right deeds be thy motive, not the fruit which comes from them." — Gita 2.47',
  '"Yoga is skill in action." — Gita 2.50',
  '"The mind is restless and difficult to restrain, but it is subdued by practice." — Gita 6.35',
  '"A person can rise through the efforts of their own mind." — Gita 6.5',
  '"This is the royal secret. Surrender everything to Me. I will carry you." — Gita 9.34',
  '"Among thousands, barely one seeks Me. Among seekers, barely one knows Me." — Gita 7.3',
  '"Cut the deep-rooted tree of samsara with the axe of detachment." — Gita 15.3',
  '"Whatever occupies your mind at death — that is what you become." — Gita 8.6',
]

export default function KarmaKshetra() {
  const [activeTab, setActiveTab]       = useState('Gather')
  const [showExport, setShowExport]     = useState(false)
  const [copyMsg, setCopyMsg]           = useState('')
  const [krishnaOn, setKrishnaOn]       = useState(false)
  const [krishnaVerse, setKrishnaVerse] = useState('')
  const [showVerse, setShowVerse]       = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const { logout } = useAuth()
  const taskProps = useTasks()
  const { tasks, deleteCompleted, importTasks, addedSinceBackup, resetBackupCounter } = taskProps

  const active = tasks.filter(t => !t.completed).length
  const done   = tasks.filter(t => t.completed).length

  function toggleKrishna() {
    if (!krishnaOn) {
      const verse = KRISHNA_VERSES[Math.floor(Math.random() * KRISHNA_VERSES.length)]
      setKrishnaVerse(verse)
      setShowVerse(true)
      setTimeout(() => setShowVerse(false), 5000)
    }
    setKrishnaOn(o => !o)
  }

  function renderTab() {
    switch (activeTab) {
      case 'Battery':    return <BatteryTab tasks={tasks} loading={taskProps.loading} updateTask={taskProps.updateTask} deleteTask={taskProps.deleteTask} />
      case 'Gather':     return <GatherTab {...taskProps} importTasks={importTasks} />
      case 'Time':       return <TimeTab {...taskProps} />
      case 'Karma':      return <KarmaTab {...taskProps} />
      case 'Gita':       return <GitaTab tasks={tasks} updateTask={taskProps.updateTask} deleteTask={taskProps.deleteTask} />
      case 'Soul':       return <SoulTab tasks={tasks} loading={taskProps.loading} />
      case 'Brain Twin': return <BrainTwinTab tasks={tasks} loading={taskProps.loading} />
      case 'Data':       return <DataTab tasks={tasks} loading={taskProps.loading} />
      case 'Score':      return <ScoreTab tasks={tasks} loading={taskProps.loading} />
      default:           return null
    }
  }

  function exportAsText() {
    return tasks.filter(t => !t.completed).map((t, i) =>
      `${i + 1}. [${t.bucket ?? '—'}] ${t.title} | ${t.weightage ?? '—'} | ${t.time_horizon ?? '—'} | ${t.life_area ?? '—'}`
    ).join('\n')
  }

  function exportAsWhatsApp() {
    const lines = tasks.filter(t => !t.completed).map(t =>
      `• *${t.title}* (${t.bucket ?? '—'}, ${t.time_horizon ?? '—'})`
    )
    return `*Karma Kshetra™ — Active Tasks*\n${new Date().toLocaleDateString()}\n\n${lines.join('\n')}`
  }

  function exportAsJSON() {
    return JSON.stringify(tasks.map(({ id, user_id, ...rest }) => rest), null, 2)
  }

  async function copyToClipboard(text, label) {
    try {
      await navigator.clipboard.writeText(text)
      setCopyMsg(`${label} copied!`)
      setTimeout(() => setCopyMsg(''), 2000)
    } catch {
      setCopyMsg('Copy failed — use Ctrl+C')
      setTimeout(() => setCopyMsg(''), 2000)
    }
  }

  function handleEmailExport() {
    const body = exportAsText()
    window.location.href = `mailto:dh.kohli@gmail.com?subject=${encodeURIComponent(`Karma Kshetra Export ${new Date().toLocaleDateString()}`)}&body=${encodeURIComponent(body)}`
  }

  function handleClearCompleted() {
    if (done === 0) return
    if (window.confirm(`Remove all ${done} completed tasks? This cannot be undone.`)) {
      deleteCompleted()
    }
  }

  function handleExportOpen() {
    setShowExport(true)
    resetBackupCounter()
  }

  function downloadJSON() {
    const json = exportAsJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `karma-kshetra-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setCopyMsg('JSON file downloaded!')
    setTimeout(() => setCopyMsg(''), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: T.pageBg, color: T.text, fontFamily: "'Montserrat', system-ui, sans-serif", paddingBottom: '90px' }}>

      {/* Krishna verse toast */}
      {showVerse && (
        <div
          className="krishna-verse"
          style={{
            position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)',
            background: T.goldBg, border: `1px solid ${T.gold}`,
            color: T.forest, padding: '12px 18px', borderRadius: '12px',
            fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', fontStyle: 'italic',
            zIndex: 999, maxWidth: '340px', width: 'calc(100% - 32px)',
            textAlign: 'center', lineHeight: 1.6,
            boxShadow: `0 4px 20px ${T.gold}40`,
          }}
        >
          {krishnaVerse}
        </div>
      )}

      {/* Header */}
      <header style={{
        padding: '0.6rem 1rem',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: T.surface,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 100,
        minWidth: 0,
      }}>
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <img src="/logo.png" alt="Chakra" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${T.gold}` }} />
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: T.forest, margin: 0, fontSize: '1.15rem', lineHeight: 1, fontWeight: 700, letterSpacing: '3px' }}>CHAKRA</h1>
            <p style={{ color: T.goldText, fontSize: '8px', margin: '1px 0 0', letterSpacing: '1px', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {tasks.length} tasks
            </p>
          </div>
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
          <span style={statPill(T.tealBg, T.teal)}>{active}</span>
          <span style={statPill(T.surface2, T.textMuted)}>{done}✓</span>
          {addedSinceBackup >= 3 && <span style={statPill(T.amberBg, T.amber)}>💾</span>}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action buttons — scrollable row on mobile */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto', flexShrink: 1, minWidth: 0, paddingBottom: '2px' }}>
          <button
            onClick={() => setShowCalendar(true)}
            title="Kriya™ — Google Calendar"
            style={{ ...hBtn, background: T.surface2, border: `1px solid ${T.border}`, color: T.text2, flexShrink: 0 }}
          >
            📅
          </button>

          <button
            onClick={toggleKrishna}
            title="Krishna Mode"
            style={{
              ...hBtn, flexShrink: 0,
              background: krishnaOn ? T.goldBg : T.surface2,
              border: `1px solid ${krishnaOn ? T.gold : T.border}`,
              color: krishnaOn ? T.goldText : T.text2,
            }}
          >
            🙏
          </button>

          <button onClick={handleExportOpen} title="Export" style={{ ...hBtn, background: T.teal, border: `1px solid ${T.teal}`, color: '#fff', flexShrink: 0 }}>↗</button>
          {done > 0 && (
            <button onClick={handleClearCompleted} title="Clear Completed" style={{ ...hBtn, background: T.surface, border: `1px solid ${T.red}`, color: T.red, flexShrink: 0 }}>✕</button>
          )}
          <button onClick={logout} title="Logout" style={{ ...hBtn, background: T.surface, border: `1px solid ${T.border}`, color: T.text2, flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5z"/>
              <path d="M4 5h8V3H4C2.9 3 2 3.9 2 5v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Export modal */}
      {showExport && (
        <div style={modalOverlay} onClick={() => setShowExport(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", color: T.goldText, fontWeight: 700, fontSize: '18px' }}>Export / Backup</div>
                <div style={{ color: T.textMuted, fontSize: '10px', marginTop: '2px' }}>{tasks.filter(t => !t.completed).length} active tasks · {new Date().toLocaleDateString()}</div>
              </div>
              <button onClick={() => setShowExport(false)} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>

            {copyMsg && (
              <div style={{ background: T.greenBg, border: `1px solid ${T.green}`, borderRadius: '6px', padding: '6px 10px', fontSize: '11px', color: T.green, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✓ {copyMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <ExportRow icon="📋" label="Plain text" desc="Readable list — paste into Notes or Docs" btnLabel="Copy" onAction={() => copyToClipboard(exportAsText(), 'Plain text')} />
              <ExportRow icon="💬" label="WhatsApp" desc="Bold formatted, ready to share" btnLabel="Copy" onAction={() => copyToClipboard(exportAsWhatsApp(), 'WhatsApp text')} />
              <ExportRow icon="✉" label="Email" desc="Opens mail to dh.kohli@gmail.com" btnLabel="Open" onAction={handleEmailExport} />
              <div style={exportRowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={iconBox}>{ }</span>
                  <div>
                    <div style={{ color: T.text, fontSize: '12px', fontWeight: 600 }}>Raw JSON</div>
                    <div style={{ color: T.textMuted, fontSize: '10px' }}>Full backup — use for Import / Sync</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => copyToClipboard(exportAsJSON(), 'JSON')} style={exportBtnSecondary}>Copy</button>
                  <button onClick={downloadJSON} style={exportBtnPrimary}>⬇ Download</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '0.75rem', minWidth: 0, overflow: 'hidden' }}>
        <TabNav active={activeTab} onChange={setActiveTab} />
        {renderTab()}
      </main>

      <QuickGatherFAB onAdd={taskProps.addTask} />

      {showCalendar && <CalendarModal onClose={() => setShowCalendar(false)} />}

      <SmartFetch tasks={tasks} updateTask={taskProps.updateTask} deleteTask={taskProps.deleteTask} />
    </div>
  )
}

function ExportRow({ icon, label, desc, btnLabel, onAction }) {
  return (
    <div style={exportRowStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={iconBox}>{icon}</span>
        <div>
          <div style={{ color: T.text, fontSize: '12px', fontWeight: 600 }}>{label}</div>
          <div style={{ color: T.textMuted, fontSize: '10px' }}>{desc}</div>
        </div>
      </div>
      <button onClick={onAction} style={exportBtnPrimary}>{btnLabel}</button>
    </div>
  )
}

const exportRowStyle     = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: '8px', padding: '10px 12px', gap: '8px' }
const iconBox            = { fontSize: '16px', width: '28px', textAlign: 'center', flexShrink: 0 }
const exportBtnPrimary   = { background: T.teal, border: 'none', color: '#fff', borderRadius: '5px', padding: '5px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }
const exportBtnSecondary = { background: 'transparent', border: `1px solid ${T.border}`, color: T.text2, borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }

function statPill(bg, color) {
  return { background: bg, color, fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }
}

const hBtn = { padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', fontFamily: "'Montserrat', system-ui, sans-serif" }

const modalOverlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
}

const modalBox = {
  background: T.surface, border: `1px solid ${T.border}`, borderRadius: '14px',
  padding: '1.25rem', width: '100%', maxWidth: '440px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
}
