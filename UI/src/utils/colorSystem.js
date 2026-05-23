import { timeScore, isOverdue } from './horizonLogic'

export const COLORS = {
  peacockGold: '#C9A84C',
  peacockTeal: '#1A6B5A',
  workingZoneTeal: '#00BFA5',
}

export const BUCKET_COLORS = {
  Karya:     '#C9A84C',
  Dhairya:   '#7ab3d4',
  Vishram:   '#6BCB77',
  Manan:     '#9b59b6',
  Manthan:   '#1A6B5A',
  Tyaga:     '#E07A5F',
  Prarabdha: '#FFB347',
}

export const GITA_COLORS = [
  '#E07A5F','#FFD966','#4ECDC4','#8DC99A','#C9A84C',
  '#1A6B5A','#7ab3d4','#A8A8C8','#c9a0f0','#D4AF37',
  '#6BCB77','#FFB347','#E07A5F','#4ECDC4','#8DC99A',
  '#C9A84C','#1A6B5A','#C9A84C',
]

export const LIFE_AREA_COLORS = {
  'Personal/Family':   '#7ab3d4',
  'Work/Employment':   '#C9A84C',
  'Picturizze':        '#6BCB77',
  'Other':             '#A8A8C8',
}

export function getBand(timeFrame, entryTimestamp = null) {
  if (!timeFrame || timeFrame === 'parkingLot') return null
  if (isOverdue(timeFrame, entryTimestamp)) return 'overdue'
  const score = timeScore(timeFrame)
  if (score > 400) return 'blue'
  if (score > 200) return 'green'
  if (score > 100) return 'amber'
  if (score > 50)  return 'teal'
  return 'red'
}

export const BAND_STYLES = {
  blue:    { color: '#4A9CC7', bg: '#E3F2FD', label: 'Blue',         border: '' },
  green:   { color: '#6BCB77', bg: '#E8F5E9', label: 'Green',        border: '' },
  amber:   { color: '#FFB347', bg: '#FFF8E1', label: 'Amber',        border: '' },
  teal:    { color: '#00BFA5', bg: '#E0F2F1', label: 'Working Zone', border: `4px double #00BFA5` },
  red:     { color: '#E07A5F', bg: '#FFEBEE', label: 'Due Soon',     border: '' },
  overdue: { color: '#B71C1C', bg: '#FFCDD2', label: 'OVERDUE',      border: '' },
}

export function bandBorderStyle(timeFrame, entryTimestamp = null) {
  const band = getBand(timeFrame, entryTimestamp)
  if (!band) return {}
  const s = BAND_STYLES[band]
  return s.border
    ? { borderLeft: s.border }
    : { borderLeft: `3px solid ${s.color}` }
}
