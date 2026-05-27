import { useState } from 'react'
import { GITA_CHAPTERS } from '../../data/gitaChapters'
import { GITA_COLORS } from '../../utils/colorSystem'
import { T } from '../../utils/theme'
import TaskCard from '../dashboard/TaskCard'

const TEACHINGS = [
  'The battlefield is not outside — it is within. Clarity comes when you stop running.',
  'You are not this body, not this role. Act fully, grieve nothing.',
  'Do your duty without attachment to outcome. That is the whole of karma yoga.',
  'Knowledge is the fire that burns karma. Seek it relentlessly.',
  'The renunciate acts completely — they just don\'t claim the result.',
  'The mind is your greatest friend and your greatest enemy. You choose.',
  'Among thousands, barely one seeks Me. Among seekers, barely one knows Me.',
  'Whatever occupies your mind at death — that is what you become.',
  'This is the royal secret. Surrender everything to Me. I will carry you.',
  'Every spark of excellence in this world — that is a fragment of My glory.',
  'I am time, the destroyer of worlds. Arise, and do what must be done.',
  'Fix your mind on Me alone. This is the highest and most direct path.',
  'Know the field and know the knower of the field. This is wisdom.',
  'Tamas, rajas, sattva — the three gunas bind the soul. Rise above all three.',
  'Cut the deep-rooted tree of samsara with the axe of detachment.',
  'Divine qualities lead to liberation. Demonic qualities bind. Know which you cultivate.',
  'As is your faith, so are you. Your belief shapes your very nature.',
  'Abandon all forms of dharma and take refuge in Me alone. I will liberate you.',
]

export default function GitaTab({ tasks = [], updateTask, deleteTask }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div>
      <p style={{ color: T.text2, fontSize: '12px', marginBottom: '1rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", fontSize: '14px' }}>
        18 chapters · 18 life arenas · One field of action
      </p>
      {GITA_CHAPTERS.map((ch, i) => {
        const color   = GITA_COLORS[i]
        const chTasks = tasks.filter(t => !t.completed && t.ch === ch.number)
        const isOpen  = expanded === ch.number

        return (
          <div key={ch.number} style={{ marginBottom: '0.4rem', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div
              onClick={() => setExpanded(isOpen ? null : ch.number)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', cursor: 'pointer', background: T.surface, borderLeft: `3px solid ${color}` }}
            >
              <span style={{ color: T.textMuted, fontSize: '9px', textTransform: 'uppercase', minWidth: '18px' }}>{ch.number}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color, fontSize: '13px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{ch.title}</div>
                <div style={{ color: T.text2, fontSize: '10px', fontStyle: 'italic' }}>{ch.arena}</div>
              </div>
              <span style={{ color: T.goldText, fontSize: '18px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{chTasks.length || ''}</span>
              <span style={{ color: T.textMuted, fontSize: '12px', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
            </div>
            {isOpen && (
              <div style={{ padding: '0.6rem 0.85rem', background: T.surface2 }}>
                <blockquote style={{ borderLeft: `3px solid ${color}`, paddingLeft: '0.75rem', margin: '0 0 0.75rem 0', color: T.text2, fontSize: '11px', fontStyle: 'italic', background: `${color}15`, padding: '0.4rem 0.75rem', borderRadius: '0 4px 4px 0' }}>
                  "{TEACHINGS[i]}"
                </blockquote>
                <p style={{ color: T.text2, fontSize: '11px', marginBottom: '0.4rem' }}>
                  <em>Essence: {ch.essence}</em>
                </p>
                {chTasks.length > 0
                  ? chTasks.map(t => <TaskCard key={t.id} task={t} onUpdate={updateTask} onDelete={deleteTask} />)
                  : <p style={{ color: T.textMuted, fontSize: '12px' }}>No tasks in this arena</p>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
