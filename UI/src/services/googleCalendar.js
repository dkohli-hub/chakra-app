import { llmAPI } from './api'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly'
const AUSTIN_LAT = 30.2672
const AUSTIN_LNG = -97.7431
const TIMEZONE = 'America/Chicago'

export const ACCOUNTS = {
  DK_PERSONAL: {
    key: 'dk_personal',
    email: 'dh.kohli@gmail.com',
    calendarId: import.meta.env.VITE_GCAL_ID_DK || 'dh.kohli@gmail.com',
    label: 'DK Personal',
    icon: '🏠',
  },
  PICTURIZZE: {
    key: 'picturizze',
    email: 'picturizze@gmail.com',
    calendarId: import.meta.env.VITE_GCAL_ID_PICTURIZZE || 'picturizze@gmail.com',
    label: 'Picturizze',
    icon: '📸',
  },
}

const WEIGHTAGE_DURATION = { W1: 10, W2: 30, W3: 60, W4: 240, W5: 480 }
const W_LABELS = { W1: '5–10 min', W2: '20–30 min', W3: '1 hour', W4: 'Half day', W5: 'Full day' }

// Daily spine: [startH, startM, endH, endM, label, severity]
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

// Rahu Kaal segment (1-indexed, out of 8 equal parts of day) by weekday 0=Sun..6=Sat
const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3]

function toMin(h, m) { return h * 60 + m }
function inRange(slotMin, sh, sm, eh, em) { return slotMin >= toMin(sh, sm) && slotMin < toMin(eh, em) }

function fmtHM(h, m) {
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`
}

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

// ── Sunrise API (Austin TX) ───────────────────────────────────────────────────
async function fetchAstro(date) {
  const dateStr = date.toISOString().split('T')[0]
  try {
    const res = await fetch(
      `https://api.sunrisesunset.io/json?lat=${AUSTIN_LAT}&lng=${AUSTIN_LNG}&date=${dateStr}&timezone=America%2FChicago`
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
  // Austin annual average fallback
  return { sunrise: [6, 15], sunset: [19, 45], solarNoon: [13, 0] }
}

function parse12h(str) {
  const [timePart, meridiem] = str.split(' ')
  let [h, m] = timePart.split(':').map(Number)
  if (meridiem === 'PM' && h !== 12) h += 12
  if (meridiem === 'AM' && h === 12) h = 0
  return [h, m]
}

// ── Astrological computations ─────────────────────────────────────────────────
function brahmaMuhurta([sh, sm]) {
  const sMin = toMin(sh, sm)
  return { sh: Math.floor((sMin - 96) / 60), sm: (sMin - 96) % 60, eh: Math.floor((sMin - 48) / 60), em: (sMin - 48) % 60 }
}

function rahuKaal(dayOfWeek, [rsh, rsm], [ssh, ssm]) {
  const rise = toMin(rsh, rsm), set = toMin(ssh, ssm)
  const part = (set - rise) / 8
  const seg = RAHU_SEG[dayOfWeek] - 1
  const s = rise + seg * part
  const e = s + part
  return { sh: Math.floor(s / 60), sm: Math.round(s % 60), eh: Math.floor(e / 60), em: Math.round(e % 60) }
}

function abhijit([nh, nm]) {
  const n = toMin(nh, nm)
  return { sh: Math.floor((n - 12) / 60), sm: (n - 12) % 60, eh: Math.floor((n + 12) / 60), em: (n + 12) % 60 }
}

// ── Slot validation (rulebook) ────────────────────────────────────────────────
export async function validateSlot(dateTimeISO) {
  const dt = new Date(dateTimeISO)
  const dow = dt.getDay()
  const slotMin = dt.getHours() * 60 + dt.getMinutes()

  const astro = await fetchAstro(dt)
  const bm = brahmaMuhurta(astro.sunrise)
  const rk = rahuKaal(dow, astro.sunrise, astro.sunset)
  const ab = abhijit(astro.solarNoon)

  const flags = []

  // Brahma Muhurta
  if (inRange(slotMin, bm.sh, bm.sm, bm.eh, bm.em)) {
    flags.push({ type: 'sacred', emoji: '🙏', message: `Brahma Muhurta (${fmtHM(bm.sh, bm.sm)}–${fmtHM(bm.eh, bm.em)}) — sacred spiritual window` })
  }

  // Daily spine
  for (const [sh, sm, eh, em, label, sev] of SPINE) {
    if (inRange(slotMin, sh, sm, eh, em)) {
      const emoji = sev === 'health' ? '💊' : sev === 'sacred' ? '🙏' : '🔒'
      flags.push({ type: sev === 'health' ? 'warning' : 'protected', emoji, message: `Daily Spine: ${label} (${fmtHM(sh, sm)}–${fmtHM(eh, em)})` })
    }
  }

  // Rahu Kaal
  if (inRange(slotMin, rk.sh, rk.sm, rk.eh, rk.em)) {
    flags.push({ type: 'warning', emoji: '⚠️', message: `Rahu Kaal: ${fmtHM(rk.sh, rk.sm)}–${fmtHM(rk.eh, rk.em)} — avoid important events during this window` })
  }

  // Abhijit Muhurta
  if (inRange(slotMin, ab.sh, ab.sm, ab.eh, ab.em)) {
    flags.push({ type: 'info', emoji: '✦', message: `Abhijit Muhurta (${fmtHM(ab.sh, ab.sm)}–${fmtHM(ab.eh, ab.em)}) — is this your highest-value action today?` })
  }

  // Weekend Sacred Window (Sat=6, Sun=0) 4:30–10:00 AM
  if ((dow === 6 || dow === 0) && inRange(slotMin, 4, 30, 10, 0)) {
    flags.push({ type: 'warning', emoji: '🌅', message: `Weekend Sacred Window (4:30–10:00 AM) — DK's protected personal time. Proceed only with intention.` })
  }

  const slotLabel = dt.toLocaleString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: TIMEZONE,
  })

  return { flags, slotLabel, astro: { ...astro, brahmaMuhurta: bm, rahuKaal: rk, abhijit: ab } }
}

// ── Calendar routing (AI-assisted for Picturizze) ─────────────────────────────
export async function determineAccount(task) {
  if (!task.life_area?.includes('Picturizze')) return ACCOUNTS.DK_PERSONAL

  const prompt = `You are a calendar routing assistant for Chakra™.

Task: "${task.title}"
Life Area: Picturizze

Determine: CONFIRMED PICTURIZZE SHOOT or LOGISTICS/OTHER.

CONFIRMED SHOOT → picturizze@gmail.com:
- Photo/video sessions with clients: wedding, portrait, event, commercial, headshot, maternity, newborn, family
- Keywords: shoot, session, photoshoot, booking, photography, shoot day, client session

LOGISTICS → dh.kohli@gmail.com (everything else):
- Drive to/from location, prep, gear check, equipment
- iARPAN prep, 3-day prep, 24-hour prep, get ready, 1-week reminder
- Client calls, outreach, follow-up, consultation
- Editing, culling, post-processing, delivery
- Training, admin, planning, marketing, pricing
- Any Picturizze task that is NOT the actual shoot event

Return ONLY valid JSON (no markdown): {"isConfirmedShoot": true, "reason": "brief reason"}`

  try {
    const { data } = await llmAPI.chat([{ role: 'user', content: prompt }])
    const parsed = JSON.parse(data.content)
    return parsed.isConfirmedShoot ? ACCOUNTS.PICTURIZZE : ACCOUNTS.DK_PERSONAL
  } catch {
    return ACCOUNTS.DK_PERSONAL
  }
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
