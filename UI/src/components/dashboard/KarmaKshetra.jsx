import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import TabNav from './TabNav'
import BatteryTab from '../tabs/BatteryTab'
import GatherTab from '../tabs/GatherTab'
import TimeTab from '../tabs/TimeTab'
import KarmaTab from '../tabs/KarmaTab'
import GitaTab from '../tabs/GitaTab'
import SoulTab from '../tabs/SoulTab'
import SoulSaysTab from '../tabs/SoulSaysTab'
import BrainTwinTab from '../tabs/BrainTwinTab'
import KshetraViewTab from '../tabs/KshetraViewTab'
import DataTab from '../tabs/DataTab'
import ScoreTab from '../tabs/ScoreTab'
import ProfileTab from '../tabs/ProfileTab'
import SmartFetch from '../smartfetch/SmartFetch'

export default function KarmaKshetra() {
  const [activeTab, setActiveTab] = useState('Gather')
  const [showExport, setShowExport] = useState(false)
  const [copyMsg, setCopyMsg] = useState('')
  const { logout } = useAuth()
  const taskProps = useTasks()
  const { tasks, deleteCompleted, importTasks, addedSinceBackup, resetBackupCounter } = taskProps

  const active = tasks.filter(t => !t.completed).length
  const done   = tasks.filter(t => t.completed).length

  function renderTab() {
    switch (activeTab) {
      case 'Battery':    return <BatteryTab tasks={tasks} loading={taskProps.loading} updateTask={taskProps.updateTask} deleteTask={taskProps.deleteTask} />
      case 'Gather':     return <GatherTab {...taskProps} importTasks={importTasks} />
      case 'Time':       return <TimeTab {...taskProps} />
      case 'Karma':      return <KarmaTab {...taskProps} />
      case 'Gita':       return <GitaTab tasks={tasks} updateTask={taskProps.updateTask} deleteTask={taskProps.deleteTask} />
      case 'Soul':       return <SoulTab tasks={tasks} loading={taskProps.loading} />
      case 'Soul Says':  return <SoulSaysTab tasks={tasks} loading={taskProps.loading} updateTask={taskProps.updateTask} deleteTask={taskProps.deleteTask} />
      case 'Brain Twin': return <BrainTwinTab tasks={tasks} loading={taskProps.loading} />
      case 'Kshetra':    return <KshetraViewTab tasks={tasks} loading={taskProps.loading} updateTask={taskProps.updateTask} />
      case 'Data':       return <DataTab tasks={tasks} loading={taskProps.loading} />
      case 'Score':      return <ScoreTab tasks={tasks} loading={taskProps.loading} />
      case 'Profile':    return <ProfileTab tasks={tasks} loading={taskProps.loading} />
      default:           return null
    }
  }

  // ── Export helpers ───────────────────────────────────────
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
    a.download = `karma-kshetra-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setCopyMsg('JSON file downloaded!')
    setTimeout(() => setCopyMsg(''), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', color: '#e6edf3', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #C9A84C', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: '#C9A84C', margin: 0, fontFamily: 'serif', fontSize: '1.3rem', lineHeight: 1 }}>Karma Kshetra™</h1>
          <p style={{ color: '#6e7681', fontSize: '10px', margin: '2px 0 0', letterSpacing: '0.05em' }}>
            ⟳ synced · {tasks.length} tasks
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={statPill('#1A6B5A', '#00BFA5')}>{active} active</span>
          <span style={statPill('#21262D', '#6e7681')}>{done} done</span>

          {addedSinceBackup >= 3 && (
            <span style={statPill('#2A1A00', '#FFB347')} title="You've added tasks — consider exporting a backup">
              💾 backup?
            </span>
          )}

          <button onClick={handleExportOpen} style={headerBtn('export')}>↗ Export</button>
          {done > 0 && (
            <button onClick={handleClearCompleted} style={headerBtn('clear')}>✕ Clear done</button>
          )}
          <button onClick={logout} style={headerBtn('logout')}>Logout</button>
        </div>
      </header>

      {/* Export modal */}
      {showExport && (
        <div style={modalOverlay} onClick={() => setShowExport(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ color: '#C9A84C', fontWeight: 700, fontSize: '14px', letterSpacing: '0.06em' }}>Export / Backup</div>
                <div style={{ color: '#6e7681', fontSize: '10px', marginTop: '2px' }}>{tasks.filter(t=>!t.completed).length} active tasks · {new Date().toLocaleDateString()}</div>
              </div>
              <button onClick={() => setShowExport(false)} style={{ background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>

            {/* Success toast */}
            {copyMsg && (
              <div style={{ background: '#0F2A1A', border: '1px solid #1A6B5A', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', color: '#6BCB77', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✓ {copyMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <ExportRow icon="📋" label="Plain text" desc="Readable list — paste into Notes or Docs" btnLabel="Copy" onAction={() => copyToClipboard(exportAsText(), 'Plain text')} />
              <ExportRow icon="💬" label="WhatsApp" desc="Bold formatted, ready to share" btnLabel="Copy" onAction={() => copyToClipboard(exportAsWhatsApp(), 'WhatsApp text')} />
              <ExportRow icon="✉" label="Email" desc="Opens mail to dh.kohli@gmail.com" btnLabel="Open" onAction={handleEmailExport} />

              {/* JSON row — two buttons */}
              <div style={exportRowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={iconBox}>{ }</span>
                  <div>
                    <div style={{ color: '#e6edf3', fontSize: '12px', fontWeight: 600 }}>Raw JSON</div>
                    <div style={{ color: '#6e7681', fontSize: '10px' }}>Full backup — use for Import / Sync</div>
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

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '1rem' }}>
        <TabNav active={activeTab} onChange={setActiveTab} />
        {renderTab()}
      </main>

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
          <div style={{ color: '#e6edf3', fontSize: '12px', fontWeight: 600 }}>{label}</div>
          <div style={{ color: '#6e7681', fontSize: '10px' }}>{desc}</div>
        </div>
      </div>
      <button onClick={onAction} style={exportBtnPrimary}>{btnLabel}</button>
    </div>
  )
}

const exportRowStyle    = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0D1117', border: '1px solid #21262D', borderRadius: '8px', padding: '10px 12px', gap: '8px' }
const iconBox           = { fontSize: '16px', width: '28px', textAlign: 'center', flexShrink: 0 }
const exportBtnPrimary  = { background: '#1A6B5A', border: '1px solid #00BFA5', color: '#fff', borderRadius: '5px', padding: '5px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }
const exportBtnSecondary = { background: 'transparent', border: '1px solid #30363d', color: '#8b949e', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }

function statPill(bg, color) {
  return { background: bg, color, fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }
}

const BTN_VARIANTS = {
  export:  { background: '#1A6B5A', border: '1px solid #00BFA5', color: '#fff' },
  clear:   { background: 'transparent', border: '1px solid #E07A5F', color: '#E07A5F' },
  logout:  { background: 'transparent', border: '1px solid #30363d', color: '#8b949e' },
}
function headerBtn(variant) {
  return { ...BTN_VARIANTS[variant], padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }
}

const modalOverlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
}

const modalBox = {
  background: '#161B22', border: '1px solid #C9A84C40', borderRadius: '12px',
  padding: '1.25rem', width: '100%', maxWidth: '440px',
}
