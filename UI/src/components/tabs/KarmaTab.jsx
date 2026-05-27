import { useState } from 'react'
import TaskCard from '../dashboard/TaskCard'
import { BUCKET_COLORS } from '../../utils/colorSystem'
import { T } from '../../utils/theme'

const BUCKETS = [
  { key: 'Karya',     label: 'Karya™',     sub: 'The action field — your primary execution space' },
  { key: 'Dhairya',   label: 'Dhairya™',   sub: 'Dignified waiting — others hold the key' },
  { key: 'Vishram',   label: 'Vishram™',   sub: 'Conscious rest — placed deliberately' },
  { key: 'Manan',     label: 'Manan™',     sub: 'Deep contemplation — wisdom is forming' },
  { key: 'Manthan',   label: 'Manthan™',   sub: 'Churning — manual only, never auto-assigned' },
  { key: 'Tyaga',     label: 'Tyaga™',     sub: 'Conscious release — letting go with awareness' },
  { key: 'Prarabdha', label: 'Prarabdha™', sub: 'Destiny in motion — trust the process' },
]

function Vessel({ count, total, color, label, onClick }) {
  const pct = total > 0 ? Math.min(Math.round(count / total * 200), 95) : 0
  return (
    <div style={{ textAlign: 'center', cursor: 'pointer' }} onClick={onClick}>
      <div style={{ fontSize: '11px', color, fontWeight: 700, marginBottom: '2px' }}>{count}</div>
      <div style={{ width: '28px', height: '42px', border: `2px solid ${color}`, borderRadius: '4px 4px 8px 8px', position: 'relative', overflow: 'hidden', margin: '0 auto' }}>
        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${pct}%`, background: color, opacity: 0.55, transition: 'height 0.4s' }} />
      </div>
      <div style={{ fontSize: '8px', color: T.textMuted, marginTop: '3px', maxWidth: '34px', lineHeight: 1.2 }}>{label}</div>
    </div>
  )
}

function BucketCol({ bucket, tasks, onUpdate, onDelete }) {
  const [collapsed, setCollapsed] = useState(false)
  const color  = BUCKET_COLORS[bucket.key] ?? T.gold
  const active = tasks.filter(t => !t.completed && t.bucket === bucket.key)

  return (
    <div style={{ marginBottom: '1rem', border: `1px solid ${T.border}`, borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', cursor: 'pointer', background: T.surface, borderLeft: `4px solid ${color}` }}
      >
        <span style={{ color, fontSize: '15px', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", flex: 1 }}>{bucket.label}</span>
        <span style={{ color: T.goldText, fontSize: '20px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{active.length}</span>
        <span style={{ color: T.textMuted, fontSize: '13px', transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }}>▶</span>
      </div>
      {!collapsed && (
        <div style={{ padding: '0.5rem 0.75rem', background: T.surface3 }}>
          <p style={{ color: T.text2, fontSize: '11px', marginBottom: '0.5rem', fontStyle: 'italic' }}>{bucket.sub}</p>
          {active.length
            ? active.map(t => <TaskCard key={t.id} task={t} onUpdate={onUpdate} onDelete={onDelete} />)
            : <p style={{ color: T.textMuted, fontSize: '12px' }}>Empty</p>}
        </div>
      )}
    </div>
  )
}

export default function KarmaTab({ tasks, loading, updateTask, deleteTask }) {
  if (loading) return <p style={{ color: T.textMuted }}>Loading...</p>

  const active = tasks.filter(t => !t.completed)
  const total  = active.length

  function scrollToBucket(key) {
    const el = document.getElementById(`bk-${key}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      {/* Vessel row */}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'space-around', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '0.9rem 0.5rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        {BUCKETS.map(b => (
          <Vessel
            key={b.key}
            count={active.filter(t => t.bucket === b.key).length}
            total={total}
            color={BUCKET_COLORS[b.key]}
            label={b.key}
            onClick={() => scrollToBucket(b.key)}
          />
        ))}
      </div>

      {BUCKETS.map(b => (
        <div key={b.key} id={`bk-${b.key}`}>
          <BucketCol bucket={b} tasks={tasks} onUpdate={updateTask} onDelete={deleteTask} />
        </div>
      ))}
    </div>
  )
}
