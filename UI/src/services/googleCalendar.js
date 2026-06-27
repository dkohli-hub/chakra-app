// import { llmAPI } from './api'  // reserved for AI routing (commented out)

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly'
const TIMEZONE = 'America/Chicago'

export const ACCOUNTS = {
  DK_PERSONAL: {
    key: 'dk_personal',
    email: 'dh.kohli@gmail.com',
    calendarId: 'primary',
    label: 'DK Personal',
    icon: '🏠',
  },
  // PICTURIZZE: {             // reserved — enable when Picturizze routing is needed
  //   key: 'picturizze',
  //   email: 'picturizze@gmail.com',
  //   calendarId: 'primary',
  //   label: 'Picturizze',
  //   icon: '📸',
  // },
}

const WEIGHTAGE_DURATION = { W1: 10, W2: 30, W3: 60, W4: 240, W5: 480 }
const W_LABELS = { W1: '5–10 min', W2: '20–30 min', W3: '1 hour', W4: 'Half day', W5: 'Full day' }

// ── Domain keywords (from LogicBook Section 0) ────────────────────────────────
const DOMAIN_KEYWORDS = {
  HOUSE_OF_DK: ['vaani','chakra','dkacademy','house of dk','ink by dk','dk unfiltered',
                 'frames filosofy','brand','book','saarthi'],
  HEALTH:      ['medicine','eye drops','doctor','appointment','stretch','latanoprost',
                 'refresh','pill','walk','dental','lab'],
  CONNECTION:  ['birthday','anniversary','wish','nishkama','jason','relationship','call friends'],
  PERSONAL:    ['family','sonia','dhruv','disha','mila','riya','krishna','sankalpa',
                 'friends','massage','recovery','personal'],
}

const DOMAIN_WINDOWS = {
  HOUSE_OF_DK: { label: 'House of DK', hint: 'Best window: Mon–Thu 6–9 PM', days: [1,2,3,4], start: 18, end: 21 },
  HEALTH:      { label: 'Health',       hint: 'Morning spine or midday',      days: [0,1,2,3,4,5,6], start: 7, end: 13 },
  CONNECTION:  { label: 'Connection',   hint: 'Dawn walk, 11 PM, or Sat 9 PM', days: [0,1,2,3,4,5,6], start: 5, end: 8 },
  PERSONAL:    { label: 'Personal',     hint: 'Before 8 AM or after 5 PM',    days: [0,1,2,3,4,5,6], start: 17, end: 23 },
}

// ── Classify domain from task text ───────────────────────────────────────────
export function classifyDomain(task) {
  const text = ((task.title || '') + ' ' + (task.life_area || '')).toLowerCase()
  let best = null, bestCount = 0
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const count = keywords.filter(k => text.includes(k)).length
    if (count > bestCount) { bestCount = count; best = domain }
  }
  return best || 'PERSONAL'
}

export function getDomainHint(task) {
  const domain = classifyDomain(task)
  return DOMAIN_WINDOWS[domain] || DOMAIN_WINDOWS.PERSONAL
}

// ── Daily spine entries (from LogicBook Section 0) ───────────────────────────
const SPINE = [
  { h: 4,  m: 0,  label: 'Wake' },
  { h: 4,  m: 5,  label: 'Lubricating eye drops' },
  { h: 4,  m: 30, label: 'Desk work' },
  { h: 6,  m: 45, label: 'Lubricating eye drops' },
  { h: 7,  m: 0,  label: 'Dawn walk' },
  { h: 7,  m: 30, label: 'Medicines + snack' },
  { h: 13, m: 0,  label: 'Lubricating eye drops' },
  { h: 17, m: 0,  label: 'Stretches + eye drops' },
  { h: 23, m: 20, label: 'Glaucoma drops + phone charge' },
]

// ── GSI loader ────────────────────────────────────────────────────────────────
let gsiReady = false
function loadGsi() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) { gsiReady = true; resolve(); return }
    if (gsiReady) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.onload = () => { gsiReady = true; resolve() }
    s.onerror = () => reject(new Error('Failed to load Google Sign-In'))
    document.head.appendChild(s)
  })
}

// ── Token store ───────────────────────────────────────────────────────────────
function saveToken(accountKey, resp) {
  const d = { access_token: resp.access_token, expires_at: Date.now() + (resp.expires_in || 3600) * 1000 }
  localStorage.setItem(`chakra_goog_${accountKey}`, JSON.stringify(d))
  return d.access_token
}

export function getToken(accountKey) {
  const raw = localStorage.getItem(`chakra_goog_${accountKey}`)
  if (!raw) return null
  const d = JSON.parse(raw)
  if (Date.now() >= d.expires_at - 60000) { localStorage.removeItem(`chakra_goog_${accountKey}`); return null }
  return d.access_token
}

export function clearToken(accountKey) {
  localStorage.removeItem(`chakra_goog_${accountKey}`)
}

export function requestToken(account) {
  return new Promise(async (resolve, reject) => {
    try {
      await loadGsi()
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        hint: account.email,
        callback: (resp) => {
          if (resp.error) { reject(new Error(resp.error_description || resp.error)); return }
          resolve(saveToken(account.key, resp))
        },
      })
      client.requestAccessToken({ prompt: 'select_account' })
    } catch (err) {
      reject(err)
    }
  })
}

// ── Sunrise API + Rahu Kalam computation ─────────────────────────────────────
const RAHU_KALAM_PART = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 } // Sun=0..Sat=6

function parse12h(str) {
  const [timePart, meridiem] = str.split(' ')
  let [h, m] = timePart.split(':').map(Number)
  if (meridiem === 'PM' && h !== 12) h += 12
  if (meridiem === 'AM' && h === 12) h = 0
  return h * 60 + m // returns total minutes from midnight
}

async function fetchSunTimes(dateStr) {
  try {
    const res = await fetch(
      `https://api.sunrisesunset.io/json?lat=30.2672&lng=-97.7431&date=${dateStr}&timezone=America%2FChicago`
    )
    const json = await res.json()
    if (json.status === 'OK') {
      return {
        sunrise:   parse12h(json.results.sunrise),
        sunset:    parse12h(json.results.sunset),
        solarNoon: parse12h(json.results.solar_noon),
      }
    }
  } catch {}
  // fallback: Austin averages
  return { sunrise: 6 * 60 + 15, sunset: 19 * 60 + 45, solarNoon: 13 * 60 }
}

function computeRahuKalam(sunTimes, dayOfWeek) {
  const { sunrise, sunset } = sunTimes
  const daySpan = sunset - sunrise
  const part = daySpan / 8
  const partNum = RAHU_KALAM_PART[dayOfWeek]
  const rkStart = sunrise + part * (partNum - 1)
  const rkEnd   = rkStart + part
  return { rkStart, rkEnd }
}

function minsToLabel(totalMins) {
  const h = Math.floor(totalMins / 60)
  const m = Math.round(totalMins % 60)
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`
}

// ── Slot validation (LogicBook Section 4) ────────────────────────────────────
// Returns { ok, hardBlock, warnings: [], astro: { verdict, note, rkStart, rkEnd } }
export async function validateSlot(dateTimeISO, task) {
  const dt     = new Date(dateTimeISO)
  const hour   = dt.getHours()
  const minute = dt.getMinutes()
  const slotMin = hour * 60 + minute
  const dow    = dt.getDay() // 0=Sun, 1=Mon … 6=Sat
  const dateStr = dateTimeISO.split('T')[0]

  const warnings = []
  let hardBlock = null

  // SC1 — ITC hard block (Mon–Fri 08:00–17:00)
  if (dow >= 1 && dow <= 5 && hour >= 8 && hour < 17) {
    hardBlock = {
      type: 'ITC',
      message: '⚠️ Chakra cannot schedule inside ITC hours (8 AM–5 PM, Mon–Fri).',
      suggestion: 'Next personal slot starts after 5 PM.',
    }
    return { ok: false, hardBlock, warnings, astro: null }
  }

  // SC0 — Spine clash (±15 min window)
  for (const s of SPINE) {
    const spineMin = s.h * 60 + s.m
    if (Math.abs(slotMin - spineMin) <= 15) {
      warnings.push({
        type: 'SPINE',
        message: `${hour}:${String(minute).padStart(2,'0')} is close to "${s.label}" in your daily spine.`,
        suggestion: 'You can proceed or pick a different time.',
      })
      break
    }
  }

  // SC2 — Domain window check
  const domain = classifyDomain(task)
  const dw = DOMAIN_WINDOWS[domain]
  if (domain === 'HOUSE_OF_DK') {
    if (!dw.days.includes(dow) || hour < dw.start || hour >= dw.end) {
      warnings.push({
        type: 'DOMAIN',
        message: `House of DK tasks work best Mon–Thu 6–9 PM.`,
        suggestion: 'This slot is outside that window. Proceed anyway?',
      })
    }
  }

  // SC3 — Rahu Kalam (soft warning)
  const sunTimes = await fetchSunTimes(dateStr)
  const { rkStart, rkEnd } = computeRahuKalam(sunTimes, dow)
  let rahuFlag = false
  if (slotMin >= rkStart && slotMin < rkEnd) {
    rahuFlag = true
    warnings.push({
      type: 'RAHU',
      message: `⚠️ This slot falls in Rahu Kalam (${minsToLabel(rkStart)}–${minsToLabel(rkEnd)}).`,
      suggestion: `Avoid starting new things now. Consider ${minsToLabel(rkEnd + 5)} instead.`,
    })
  }

  // Astro verdict
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const bestDays = [1, 4, 5] // Monday, Thursday, Friday
  const cautionDays = [6, 2] // Saturday, Tuesday
  let verdict, astroNote

  if (rahuFlag) {
    verdict = '⚠️'
    astroNote = `Rahu Kalam active. Consider ${minsToLabel(rkEnd + 5)}.`
  } else if (bestDays.includes(dow)) {
    verdict = '✅'
    astroNote = `${dayNames[dow]} — one of your best days. Rahu Kalam clear.`
  } else if (cautionDays.includes(dow)) {
    verdict = '⚡'
    astroNote = `${dayNames[dow]} — proceed with awareness.`
  } else {
    verdict = '⚡'
    astroNote = `Rahu Kalam clear. ${dayNames[dow]}.`
  }

  return {
    ok: true,
    hardBlock: null,
    warnings,
    astro: { verdict, note: astroNote, rkStart, rkEnd },
  }
}

// ── Build Google Calendar event object ────────────────────────────────────────
export function buildEvent(task, dateTimeISO, astroNote) {
  const durationMin = WEIGHTAGE_DURATION[task.weightage] || 15
  const start = new Date(dateTimeISO)
  const end   = new Date(start.getTime() + durationMin * 60000)
  const domain = classifyDomain(task)
  const domainLabel = DOMAIN_WINDOWS[domain]?.label || 'Personal'

  const desc = [
    'Chakra™ Task',
    `Bucket: ${task.bucket || 'Karya'}™`,
    `Domain: ${domainLabel}`,
    `Life Area: ${task.life_area || 'General'}`,
    `Weightage: ${task.weightage || '—'}${task.weightage ? ` (${W_LABELS[task.weightage]})` : ''}`,
    task.multitask ? 'Multitaskable: Yes' : null,
    astroNote ? `Astro: ${astroNote}` : null,
    `Original: ${task.title}`,
  ].filter(Boolean).join('\n')

  return {
    summary: task.title,
    description: desc,
    start: { dateTime: start.toISOString(), timeZone: TIMEZONE },
    end:   { dateTime: end.toISOString(),   timeZone: TIMEZONE },
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 15 }] },
  }
}

// ── Write event to Google Calendar API ───────────────────────────────────────
export async function writeEvent(accessToken, calendarId, eventData) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Calendar API error ${res.status}`)
  }
  return res.json()
}
