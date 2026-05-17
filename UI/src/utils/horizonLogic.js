// Auto-assigns H and computes time score. H is never shown to or set by the user.

const HORIZON_MAP = {
  today: { h: 'H1', bufferDays: 7 },
  thisWeek: { h: 'H1', bufferDays: 7 },
  nextWeek: { h: 'H1', bufferDays: 7 },
  thisMonth: { h: 'H2', bufferDays: 14 },
  nextMonth: { h: 'H2', bufferDays: 14 },
  Q3: { h: 'H3', bufferDays: 30 },
  Q4: { h: 'H3', bufferDays: 30 },
  thisYear: { h: 'H3', bufferDays: 30 },
  '1year': { h: 'H3', bufferDays: 30 },
}

export const TIME_FRAMES = Object.keys(HORIZON_MAP)

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
      const toSunday = 7 - day
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + toSunday)
    }
    case 'nextWeek': {
      const day = now.getDay()
      const toNextSunday = 7 - day + 7
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + toNextSunday)
    }
    case 'thisMonth': return new Date(y, now.getMonth() + 1, 0)
    case 'nextMonth': return new Date(y, now.getMonth() + 2, 0)
    case 'Q3': return new Date(y, 8, 30)   // Sep 30
    case 'Q4': return new Date(y, 11, 31)  // Dec 31
    case 'thisYear': return new Date(y, 11, 31)
    case '1year': return new Date(y + 1, now.getMonth(), now.getDate())
    default: return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  }
}

export function timeScore(timeFrame) {
  const { bufferDays } = HORIZON_MAP[timeFrame] ?? { bufferDays: 14 }
  const deadline = deadlineFromTimeFrame(timeFrame)
  const daysUntil = (deadline - new Date()) / (1000 * 60 * 60 * 24)
  return ((daysUntil - bufferDays) / bufferDays) * 100
}

export function isOverdue(timeFrame) {
  return timeScore(timeFrame) <= 0
}
