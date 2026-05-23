// Auto-assigns H and computes time score. H is never shown to or set by the user.

const HORIZON_MAP = {
  today:     { h: 'H1', bufferDays: 7 },
  thisWeek:  { h: 'H1', bufferDays: 7 },
  nextWeek:  { h: 'H1', bufferDays: 7 },
  thisMonth: { h: 'H2', bufferDays: 14 },
  nextMonth: { h: 'H2', bufferDays: 14 },
  Q3:        { h: 'H3', bufferDays: 30 },
  Q4:        { h: 'H3', bufferDays: 30 },
  thisYear:  { h: 'H3', bufferDays: 30 },
  '1year':   { h: 'H3', bufferDays: 30 },
}

export const HORIZON_LABELS = {
  today:      'Today',
  thisWeek:   'This Week',
  nextWeek:   'Next Week',
  thisMonth:  'This Month',
  nextMonth:  'Next Month',
  Q3:         'Q3 2026',
  Q4:         'Q4 2026',
  thisYear:   'This Year',
  '1year':    '1 Year',
  parkingLot: 'Parking Lot',
}

export const TIME_FRAMES = [...Object.keys(HORIZON_MAP), 'parkingLot']

export function autoHorizon(timeFrame) {
  return HORIZON_MAP[timeFrame]?.h ?? 'H2'
}

export function deadlineFromTimeFrame(timeFrame) {
  const now = new Date()
  const y = now.getFullYear()
  switch (timeFrame) {
    case 'today': return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    case 'thisWeek': {
      const day = now.getDay()
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day))
    }
    case 'nextWeek': {
      const day = now.getDay()
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day + 7))
    }
    case 'thisMonth':  return new Date(y, now.getMonth() + 1, 0)
    case 'nextMonth':  return new Date(y, now.getMonth() + 2, 0)
    case 'Q3':         return new Date(y, 8, 30)
    case 'Q4':         return new Date(y, 11, 31)
    case 'thisYear':   return new Date(y, 11, 31)
    case '1year':      return new Date(y + 1, now.getMonth(), now.getDate())
    default:           return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  }
}

export function timeScore(timeFrame) {
  if (!timeFrame || timeFrame === 'parkingLot') return 999
  const { bufferDays } = HORIZON_MAP[timeFrame] ?? { bufferDays: 14 }
  const deadline = deadlineFromTimeFrame(timeFrame)
  const daysUntil = (deadline - new Date()) / (1000 * 60 * 60 * 24)
  return ((daysUntil - bufferDays) / bufferDays) * 100
}

// Overdue = deadline has actually passed, OR 'today' task entered on a previous calendar day
export function isOverdue(timeFrame, entryTimestamp = null) {
  if (!timeFrame || timeFrame === 'parkingLot') return false
  if (timeFrame === 'today' && entryTimestamp) {
    const now = new Date()
    const entry = new Date(entryTimestamp)
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const entryMidnight = new Date(entry.getFullYear(), entry.getMonth(), entry.getDate())
    if (entryMidnight < todayMidnight) return true
  }
  return deadlineFromTimeFrame(timeFrame) < new Date()
}
