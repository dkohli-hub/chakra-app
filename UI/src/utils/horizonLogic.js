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

// Overdue = the window that was intended at entry time has passed.
// All relative horizons are evaluated against when the task was ENTERED, not today.
export function isOverdue(timeFrame, entryTimestamp = null) {
  if (!timeFrame || timeFrame === 'parkingLot') return false

  const now = new Date()

  if (entryTimestamp) {
    const entry = new Date(entryTimestamp)
    const eY = entry.getFullYear(), eM = entry.getMonth(), eD = entry.getDate()
    const entryMidnight = new Date(eY, eM, eD)
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (timeFrame === 'today') {
      // Overdue if entered on any previous calendar day
      if (entryMidnight < todayMidnight) return true
    } else if (timeFrame === 'thisWeek') {
      // The "this week" that contained entry ends on the Sunday of that week
      const entryWeekSunday = new Date(eY, eM, eD + (7 - entry.getDay()))
      if (entryWeekSunday < now) return true
    } else if (timeFrame === 'nextWeek') {
      // "Next week" from entry = the week after entry's week; ends on Sunday + 7
      const entryNextWeekSunday = new Date(eY, eM, eD + (7 - entry.getDay()) + 7)
      if (entryNextWeekSunday < now) return true
    } else if (timeFrame === 'thisMonth') {
      // End of entry's calendar month
      const entryMonthEnd = new Date(eY, eM + 1, 0)
      if (entryMonthEnd < now) return true
    } else if (timeFrame === 'nextMonth') {
      // End of the month after entry's month
      const entryNextMonthEnd = new Date(eY, eM + 2, 0)
      if (entryNextMonthEnd < now) return true
    }
  }

  // Absolute horizons (Q3, Q4, thisYear, 1year): deadline has passed
  return deadlineFromTimeFrame(timeFrame) < now
}
