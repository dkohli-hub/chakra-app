import { isOverdue } from './horizonLogic'

const W = { W1: 1, W2: 2, W3: 3, W4: 4, W5: 5 }
const HOLDING = ['Dhairya', 'Vishram', 'Manan', 'Manthan', 'Tyaga', 'Prarabdha']

export function agingDays(entryTimestamp) {
  return Math.floor((Date.now() - new Date(entryTimestamp)) / 86400000)
}

export function computeRajas(tasks) {
  const active = tasks.filter(t => !t.completed)
  const total = active.length
  if (!total) return 0
  const vol = Math.min(total / 100, 1)
  const heavy = active.filter(t => ['W4', 'W5'].includes(t.weightage)).length / total
  const intake = Math.min(total / 70, 1)
  return Math.round((vol * 0.3 + intake * 0.4 + heavy * 0.3) * 100)
}

export function computeTamas(tasks) {
  const active = tasks.filter(t => !t.completed)
  const total = active.length
  if (!total) return 0
  const stagnant = active.filter(t => HOLDING.includes(t.bucket) && agingDays(t.entry_timestamp) > 14).length
  const deflected = active.filter(t => (t.state_history?.length ?? 0) > 3).length
  return Math.round((stagnant / total * 0.5 + deflected / total * 0.5) * 100)
}

export function computeSattva(tasks) {
  const active = tasks.filter(t => !t.completed)
  const total = active.length
  if (!total) return 0
  const intent = active.filter(t => ['Manan', 'Manthan'].includes(t.bucket)).length
  const resolved = tasks.filter(t => t.completed && ['Manan', 'Manthan'].includes(t.origin_bucket)).length
  const clean = tasks.filter(t => t.completed && (t.state_history?.length ?? 0) <= 1).length
  return Math.round((
    (intent / total) * 0.3 +
    (intent > 0 ? Math.min(resolved / intent, 1) : 0) * 0.5 +
    (clean / total) * 0.2
  ) * 100)
}

export function computeAQ(tasks) {
  const processed = tasks.length
  if (!processed) return 0
  const inMotion = tasks.filter(t => !t.completed && !HOLDING.includes(t.bucket)).length
  return Math.round(inMotion / processed * 100)
}

export function computePQ(tasks) {
  const heavy = tasks.filter(t => ['W4', 'W5'].includes(t.weightage))
  if (!heavy.length) return 0
  const committed = heavy.reduce((s, t) => s + (W[t.weightage] ?? 0), 0)
  const closed = heavy.filter(t => t.completed).reduce((s, t) => s + (W[t.weightage] ?? 0), 0)
  return Math.round(closed / committed * 100)
}

export function computeDQ(tasks) {
  const startedInKarya = tasks.filter(t => t.origin_bucket === 'Karya')
  if (!startedInKarya.length) return 0
  const deflected = startedInKarya.filter(t => !t.completed && t.bucket !== 'Karya').length
  return Math.round(deflected / startedInKarya.length * 100)
}

export function computeCQ(tasks) {
  const active = tasks.filter(t => !t.completed)
  const total = active.length
  if (!total) return { label: 'Emerging', score: 0, arenas: 0 }
  const arenas = new Set(active.filter(t => t.ch).map(t => t.ch)).size
  const coverage = arenas / 18
  const withHorizon = active.filter(t => t.time_horizon && t.time_horizon !== 'parkingLot').length
  const completeness = withHorizon / total
  const score = Math.round((coverage * 0.5 + completeness * 0.5) * 100)
  const label = score >= 75 ? 'Full' : score >= 50 ? 'Substantial' : score >= 25 ? 'Partial' : 'Emerging'
  return { label, score, arenas }
}

export function computeLoadScore(tasks) {
  const raw = tasks.filter(t => !t.completed).reduce((s, t) => s + (W[t.weightage] ?? 0), 0)
  return Math.min(Math.round(raw / 3), 100)
}

export function computePostChakraScore(tasks) {
  const active = tasks.filter(t => !t.completed)
  const raw = active.reduce((s, t) => s + (W[t.weightage] ?? 0), 0)
  const relief = active.filter(t => HOLDING.includes(t.bucket)).reduce((s, t) => s + (W[t.weightage] ?? 0) * 0.6, 0)
  return Math.min(Math.round((raw - relief) / 3), 100)
}

export function computeKarmicCompletion(tasks) {
  const started = tasks.filter(t => t.origin_bucket === 'Karya')
  if (!started.length) return 0
  return Math.round(started.filter(t => t.completed).length / started.length * 100)
}

export function computeEnergyDrain(tasks) {
  const active = tasks.filter(t => !t.completed)
  if (!active.length) return 0
  const overdue = active.filter(t => t.time_horizon && isOverdue(t.time_horizon)).length
  const heavy = active.filter(t => ['W4', 'W5'].includes(t.weightage)).length
  return Math.min(Math.round((overdue * 2 + heavy) / active.length * 100), 100)
}

export function computeClutter(tasks) {
  const active = tasks.filter(t => !t.completed)
  const total = active.length
  if (!total) return { small: 0, large: 0, huge: 0 }
  return {
    small: Math.round(active.filter(t => ['W1', 'W2'].includes(t.weightage)).length / total * 100),
    large: Math.round(active.filter(t => ['W3', 'W4'].includes(t.weightage)).length / total * 100),
    huge:  Math.round(active.filter(t => t.weightage === 'W5').length / total * 100),
  }
}

export function gunaLabel(rajas, tamas, sattva) {
  const max = Math.max(rajas, tamas, sattva)
  if (max === sattva && sattva > 40) return 'Sattvic — clarity leads. Stay deliberate.'
  if (max === rajas && tamas > 30) return 'Rajas + Tamas — motion and stagnation are competing.'
  if (max === rajas) return 'Rajasic — high motion energy. Guard against overload.'
  if (max === tamas) return 'Tamasic — stagnation is growing. Activate Kriya.'
  return 'Balanced — maintain awareness.'
}

export function loadLabel(score) {
  if (score < 30) return 'Under-occupied'
  if (score < 70) return 'Optimal'
  return 'Overloaded'
}

export function loadColor(score) {
  if (score < 30) return '#6BCB77'
  if (score < 70) return '#FFB347'
  return '#E07A5F'
}
