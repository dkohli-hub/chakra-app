// import { llmAPI } from './api'  // reserved for AI routing (commented out)

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly'
// const AUSTIN_LAT = 30.2672   // reserved for astrological validation
// const AUSTIN_LNG = -97.7431
const TIMEZONE = 'America/Chicago'

export const ACCOUNTS = {
  DK_PERSONAL: {
    key: 'dk_personal',
    email: 'dh.kohli@gmail.com',
    calendarId: 'primary',   // 'primary' always resolves to the logged-in account's calendar
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

// ── Build Google Calendar event object ────────────────────────────────────────
export function buildEvent(task, dateTimeISO) {
  const durationMin = WEIGHTAGE_DURATION[task.weightage] || 60
  const start = new Date(dateTimeISO)
  const end   = new Date(start.getTime() + durationMin * 60000)

  const desc = [
    'Chakra™ Task',
    `Life Area: ${task.life_area || 'General'}`,
    `Bucket: ${task.bucket || 'Karya'}™`,
    `Weightage: ${task.weightage || '—'}${task.weightage ? ` (${W_LABELS[task.weightage]})` : ''}`,
    task.multitask ? 'Multitaskable: Yes' : null,
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

// ── RESERVED: Rulebook validation (commented out — enable when needed) ────────
// export async function validateSlot(dateTimeISO) { ... }

// ── RESERVED: AI calendar routing (commented out — enable when needed) ────────
// export async function determineAccount(task) { ... }

/*
FULL RULEBOOK VALIDATION CODE — preserved for future use

const SPINE = [
  [4,0,5,0,'Brahma Muhurta','sacred'],
  [5,0,6,0,'Dawn Walk','protected'],
  [6,0,7,0,'Morning Transition','soft'],
  [7,15,7,45,'Medicines & Snack','health'],
  [17,0,17,15,'iKAVACH Stretches','health'],
  [17,15,17,30,'Refresh Plus Eye Drops','health'],
  [17,30,18,0,'Transition / Debrief','soft'],
  [22,0,22,5,'Night Before 5-Min Decision','soft'],
  [23,0,23,20,'Walk 3 – India Call','protected'],
  [23,20,24,0,'Night Routine','health'],
]
const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3]
function toMin(h, m) { return h * 60 + m }
function inRange(slotMin, sh, sm, eh, em) { return slotMin >= toMin(sh, sm) && slotMin < toMin(eh, em) }
function fmtHM(h, m) {
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`
}
async function fetchAstro(date) {
  const dateStr = date.toISOString().split('T')[0]
  try {
    const res = await fetch(`https://api.sunrisesunset.io/json?lat=30.2672&lng=-97.7431&date=${dateStr}&timezone=America%2FChicago`)
    const json = await res.json()
    if (json.status === 'OK') {
      return { sunrise: parse12h(json.results.sunrise), sunset: parse12h(json.results.sunset), solarNoon: parse12h(json.results.solar_noon) }
    }
  } catch {}
  return { sunrise: [6, 15], sunset: [19, 45], solarNoon: [13, 0] }
}
function parse12h(str) {
  const [timePart, meridiem] = str.split(' ')
  let [h, m] = timePart.split(':').map(Number)
  if (meridiem === 'PM' && h !== 12) h += 12
  if (meridiem === 'AM' && h === 12) h = 0
  return [h, m]
}
*/
