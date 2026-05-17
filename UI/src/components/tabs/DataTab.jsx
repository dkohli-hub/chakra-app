import { BUCKET_COLORS, GITA_COLORS, LIFE_AREA_COLORS } from '../../utils/colorSystem'
import { GITA_CHAPTERS } from '../../data/gitaChapters'

const BUCKETS = ['Karya', 'Dhairya', 'Vishram', 'Manan', 'Manthan', 'Tyaga', 'Prarabdha']
const LIFE_AREAS = ['Personal/Family', 'Work/Employment', 'Picturizze', 'Other']

function BarChart({ title, rows }) {
  const max = Math.max(...rows.map(r => r.count), 1)
  return (
    <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
      <div style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{title}</div>
      {rows.map(row => (
        <div key={row.label} style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ color: '#8b949e', fontSize: '11px' }}>{row.label}</span>
            <span style={{ color: row.color, fontSize: '11px', fontWeight: 600 }}>{row.count}</span>
          </div>
          <div style={{ height: '8px', background: '#21262D', borderRadius: '4px' }}>
            <div style={{ width: `${(row.count / max) * 100}%`, height: '100%', background: row.color, borderRadius: '4px', transition: 'width 0.4s' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DataTab({ tasks, loading }) {
  if (loading) return <p style={{ color: '#8b949e' }}>Loading...</p>

  const active = tasks.filter(t => !t.completed)

  const byBucket = BUCKETS.map(b => ({
    label: `${b}™`,
    count: active.filter(t => t.bucket === b).length,
    color: BUCKET_COLORS[b],
  }))

  const byLifeArea = LIFE_AREAS.map(la => ({
    label: la,
    count: active.filter(t => t.life_area === la).length,
    color: LIFE_AREA_COLORS[la] ?? '#8b949e',
  }))

  const byGita = GITA_CHAPTERS
    .map((ch, i) => ({ label: ch.title, count: active.filter(t => t.ch === ch.number).length, color: GITA_COLORS[i] }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return (
    <div>
      <BarChart title="By Bucket" rows={byBucket} />
      <BarChart title="By Life Area" rows={byLifeArea} />
      {byGita.length > 0 && <BarChart title="By Gita Arena (Top 10)" rows={byGita} />}
    </div>
  )
}
