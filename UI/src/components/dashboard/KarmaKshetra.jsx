import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import TabNav from './TabNav'
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
  const { logout } = useAuth()
  const taskProps = useTasks()
  const { tasks } = taskProps

  const active = tasks.filter(t => !t.completed).length
  const done = tasks.filter(t => t.completed).length

  function renderTab() {
    switch (activeTab) {
      case 'Gather':      return <GatherTab {...taskProps} />
      case 'Time':        return <TimeTab {...taskProps} />
      case 'Karma':       return <KarmaTab {...taskProps} />
      case 'Gita':        return <GitaTab tasks={tasks} updateTask={taskProps.updateTask} deleteTask={taskProps.deleteTask} />
      case 'Soul':        return <SoulTab tasks={tasks} loading={taskProps.loading} />
      case 'Soul Says':   return <SoulSaysTab tasks={tasks} loading={taskProps.loading} updateTask={taskProps.updateTask} deleteTask={taskProps.deleteTask} />
      case 'Brain Twin':  return <BrainTwinTab tasks={tasks} loading={taskProps.loading} />
      case 'Kshetra':     return <KshetraViewTab tasks={tasks} loading={taskProps.loading} updateTask={taskProps.updateTask} />
      case 'Data':        return <DataTab tasks={tasks} loading={taskProps.loading} />
      case 'Score':       return <ScoreTab tasks={tasks} loading={taskProps.loading} />
      case 'Profile':     return <ProfileTab tasks={tasks} loading={taskProps.loading} />
      default:            return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1117', color: '#e6edf3', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #C9A84C', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: '#C9A84C', margin: 0, fontFamily: 'serif', fontSize: '1.3rem', lineHeight: 1 }}>Karma Kshetra™</h1>
          <p style={{ color: '#6e7681', fontSize: '10px', margin: '2px 0 0', letterSpacing: '0.05em' }}>
            Your mind, structured
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={statPill('#1A6B5A', '#00BFA5')}>{active} active</span>
          <span style={statPill('#21262D', '#6e7681')}>{done} done</span>
          <button onClick={logout} style={{ background: 'none', border: '1px solid #30363d', color: '#6e7681', padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '1rem' }}>
        <TabNav active={activeTab} onChange={setActiveTab} />
        {renderTab()}
      </main>

      <SmartFetch tasks={tasks} updateTask={taskProps.updateTask} deleteTask={taskProps.deleteTask} />
    </div>
  )
}

function statPill(bg, color) {
  return { background: bg, color, fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }
}
