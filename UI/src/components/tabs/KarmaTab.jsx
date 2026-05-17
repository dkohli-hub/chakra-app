import { useState } from 'react'
import TaskCard from '../dashboard/TaskCard'
import { BUCKET_COLORS } from '../../utils/colorSystem'

const BUCKETS = [
  { key: 'Karya',     label: 'Karya™',     sub: 'The action field — your primary execution space' },
  { key: 'Dhairya',   label: 'Dhairya™',   sub: 'Dignified waiting — others hold the key' },
  { key: 'Vishram',   label: 'Vishram™',   sub: 'Conscious rest — placed deliberately' },
  { key: 'Manan',     label: 'Manan™',     sub: 'Deep contemplation — wisdom is forming' },
  { key: 'Manthan',   label: 'Manthan™',   sub: 'Churning — manual only, never auto-assigned' },
  { key: 'Tyaga',     label: 'Tyaga™',     sub: 'Conscious release — letting go with awareness' },
  { key: 'Prarabdha', label: 'Prarabdha™', sub: 'Destiny in motion — trust the process' },
]

function Vessel({ count, total, color }) {
  const pct = total > 0 ? Math.round(count / total * 100) : 0
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '11px', color, fontWeight: 700, marginBottom: '2px' }}>{count}</div>
      <div style={{ width: '28px', height: '42px', border: `2px solid ${color}`, borderRadius: '4px 4px 6px 6px', position: 'relative', overflow: 'hidden', margin: '0 auto' }}>
        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${pct}%`, background: color, opacity: 0.6, transition: 'height 0.4s' }} />
      </div>
    </div>
  )
}

function BucketCol({ bucket, tasks, onUpdate, onDelete }) {
  const [collapsed, setCollapsed] = useState(false)
  const color = BUCKET_COLORS[bucket.key] ?? '#C9A84C'
  const active = tasks.filter(t => !t.completed && t.bucket === bucket.key)

  return (
    <div style={{ marginBottom: '1rem', border: '1px solid #21262D', borderRadius: '8px', overflow: 'hidden' }}>
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', cursor: 'pointer', background: '#161B22', borderLeft: `4px solid ${color}` }}
      >
        <span style={{ color, fontSize: '16px', fontWeight: 700, fontFamily: 'serif', flex: 1 }}>{bucket.label}</span>
        <span style={{ color: '#C9A84C', fontSize: '22px', fontFamily: 'serif', fontWeight: 300 }}>{active.length}</span>
        <span style={{ color: '#6e7681', fontSize: '13px', transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }}>✶</span>
      </div>
      {!collapsed && (
        <div style={{ padding: '0.5rem 0.75rem' }}>
          <p style={{ color: '#6e7681', fontSize: '11px', marginBottom: '0.5rem', fontStyle: 'italic' }}>{bucket.sub}</p>
          {active.length
            ? active.map(t => <TaskCard key={t.id} task={t} onUpdate={onUpdate} onDelete={onDelete} />)
            : <p style={{ color: '#6e7681', fontSize: '12px' }}>Empty</p>}
        </div>
      )}
    </div>
  )
}

export default function KarmaTab({ tasks, loading, updateTask, deleteTask }) {
  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

  const active = tasks.filter(t => !t.completed)
  const total = active.length

  return (
    <div>
      {/* Vessel row */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-around', background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
        {BUCKETS.map(b => (
          <div key={b.key} style={{ textAlign: 'center' }}>
            <Vessel
              count={active.filter(t => t.bucket === b.key).length}
              total={total}
              color={BUCKET_COLORS[b.key]}
            />
            <div style={{ fontSize: '9px', color: '#6e7681', marginTop: '3px', maxWidth: '36px' }}>{b.key}</div>
          </div>
        ))}
      </div>

      {BUCKETS.map(b => (
        <BucketCol key={b.key} bucket={b} tasks={tasks} onUpdate={updateTask} onDelete={deleteTask} />
      ))}
    </div>
  )
}
