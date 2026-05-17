# Chakra — Session Transfer File
## For: Final V31 Build Session
**Date:** May 16, 2026  ·  **From:** DK + Claude  ·  **Confidential**  ·  House of DK · Aux Services LLC

---

*Jai Shri Krishna 🙏*

---

## WHAT THIS FILE IS

This file is the complete handoff briefing for the next Claude conversation. Upload this file first in the new session. It contains everything needed to understand the current state of Chakra and what must be built in V31.

---

## CURRENT STATE — V30 DELIVERED

**File:** `KarmaKshetra_DK_051626_v30.html`

V30 is the most complete version of the Karma Kshetra™ dashboard. It was built across May 15–16, 2026 in a series of iterative sessions that moved from V1 to V30. The session ended with DK confirming this would be the last session before finalization.

---

## THE SYSTEM — CORE FACTS

**Product:** Chakra — AI-powered mind organization system  
**Dashboard:** Karma Kshetra™  
**Owner:** DK (Dheeraj Kohli), Founder, House of DK / Aux Services LLC, Austin Texas  
**Dedication:** Lord Krishna / Sri Chakradhar Swami  
**Philosophy:** Bhagavad Gita — 18 chapters mapped to 18 life arenas  
**Prototype user:** DK himself — system to be generalized as IP/product  

---

## LOCKED ARCHITECTURE (DO NOT CHANGE)

### Five Phases
1. **Spandan™** (6/Venus) — Surface
2. **Vivek™** (6/Venus) — Discern  
3. **Sthapana™** (8/Saturn) — Place
4. **Kriya™** (1/Sun) — Act
5. **Mukt™** (11/Master Moon) — Release

### Seven Buckets
1. **Karya™** (2/Moon) — Action field
2. **Dhairya™** (3/Jupiter) — Dignified waiting
3. **Vishram™** (9/Mars) — Conscious rest
4. **Manan™** (7/Ketu) — Deep contemplation
5. **Manthan™** (8/Saturn) — Churning (MANUAL only — DK pushes, never auto-assigned)
6. **Tyaga™** (9/Mars) — Conscious release
7. **Prarabdha™** (6/Venus) — Destiny in motion

### Dashboard
**Karma Kshetra™** — The Field of Action

---

## COLOR SYSTEM — LOCKED (V30)

DK's mental-state philosophy. Each color = a mental state, not just a timer.

| Color | Buffer | Mental State |
|-------|--------|--------------|
| 🔵 Blue | > 400% | No anxiety. No stress. Fully assured. Task documented. |
| 🟢 Green | 200–400% | No stress. No anxiety. Ahead of game. Becoming aware. |
| 🟡 Amber | 100–200% | Normal operating zone. DK's ideal state. No stress. |
| ◈ Teal (double border) | 50–100% | Execution mode. In DK's hands. Focused. No stress yet. |
| 🔴 Red | 0–50% | Stress and anxiety present. Act immediately. |
| ★ Red Star | ≤ 0% | Overdue. Costs energy every day unresolved. |

**Working Zone treatment:** `4px double border` in `#00BFA5` with subtle background tint. NOT orange — too close to red. Teal double-border is structurally distinct.

**Overdue star:** `font-size:16px; font-weight:900` red ★ + "OVERDUE" badge. Must be large and unmissable.

---

## AUTO-HORIZON LOGIC — LOCKED (OPTION B)

No user input needed. System assigns effort window automatically.

| Horizon Type | H | Days | Score Formula |
|---|---|---|---|
| today / thisWeek / nextWeek | H1 | 7 | (daysUntilDeadline − 7) ÷ 7 × 100 |
| thisMonth | H2 | 14 | (daysUntilDeadline − 14) ÷ 14 × 100 |
| Q3 / Q4 / thisYear / 1year | H3 | 30 | (daysUntilDeadline − 30) ÷ 30 × 100 |

Score > 400% = Blue. 200–400% = Green. 100–200% = Amber. 50–100% = Teal. 0–50% = Red. ≤ 0% = Overdue.

**Q3 today (May 16):** deadline Sep 30 = 137 days. Score = (137−30)÷30×100 = 357% → **Blue** ✅

---

## WEIGHTAGE DEFINITIONS — LOCKED

| Code | Duration | Description |
|------|----------|-------------|
| W1 | 5–10 minutes | Quick action |
| W2 | 20–30 minutes | Focused micro-session |
| W3 | 1 hour | Full focused work block |
| W4 | Half day | Major effort |
| W5 | Full day | Heaviest items — use sparingly |

---

## V30 — WHAT IS WORKING

- ✅ 5-band color system with teal working zone (double border)
- ✅ Time tab — default collapsed with ▶ chevron
- ✅ Karma tab — default collapsed
- ✅ Gather page — Color Intelligence tile + W1-W5 tile (no duplicates)
- ✅ Soul tab — Others' Karma panel (tap to reveal Dhairya tasks)
- ✅ Large ★ overdue star
- ✅ isOverdue() uses timeScore() ≤ 0 (calendar-based)
- ✅ autoHorizon() function baked in
- ✅ Relationship model enlarged (max-width 320px)
- ✅ Mental Horizon bar removed
- ✅ Energy drain includes overdue tasks

---

## V31 — CONFIRMED BUILD LIST

DK confirmed these in the final exchange. Build all in V31.

### Priority 1 — Design decisions pending
1. **Q3 deadline: start of quarter (July 1) or end of quarter (Sep 30)?**  
   DK asked this question directly. Must ask and confirm before building V31.  
   Recommendation: Start of quarter (July 1) — more conservative, warns earlier.

### Priority 2 — Already designed, not yet coded
2. **Three-dimension task entry: W + H + Time Frame**  
   At point of Gather entry, ask: Weightage (W1–W5) + Time Frame (This Month / Next Month / Q3 / etc.)  
   H (horizon) is auto-assigned — do NOT ask user for H.  
   Example: "Book India tickets" → W3 · Q3 2026 (system assigns H3 automatically)

### Priority 3 — UI fixes confirmed
3. **Karma tab radio button** → one click = task closed. No confirmation step.
4. **Time tab: push to Google Calendar** via MCP connection (already connected: dh.kohli@gmail.com). Remove .ics download.
5. **Gita tab — essence lines** for all 18 chapters (5 drafted in V22, 13 remaining). Add one italic essence line per chapter tile, deeper teaching when expanded.
6. **Kshetra View 3rd tile** — confirm slider renders correctly on mobile viewport. If broken, rebuild the tile with explicit min-height.

### Priority 4 — Verify working correctly
7. Energy Drain battery — confirm Critical shows with 10+ overdue tasks (OT1–OT10)
8. Karma tab chevron rotation — CSS selector `.bk-col:not(.col-collapsed) .col-chevron` — verify rotation animates

---

## OPEN DESIGN QUESTIONS FOR V31

1. **W + H + Time Frame entry** — should H be visible to user or always silent? (Current: silent/auto. Consideration: allow override for power users.)
2. **Gita Tab Chapter 18** — currently blank (My Completions). The Gita essence there is the most profound. What should be shown?
3. **Parking Lot** — no color assigned. Should parking lot tasks be grey/neutral?

---

## FILE INVENTORY

Five files to upload at start of V31 session:
1. `KarmaKshetra_DK_051626_v30.html` — current dashboard (V30)
2. `Chakra_BuildNotes_051626.docx` — build history and pending items
3. `Chakra_SystemArchitecture_051626.docx` — locked system design
4. `Chakra_BrandDelta_051626.docx` — brand changes since baseline
5. `Chakra_PhilosophyLog_051626.docx` — the why behind the what
6. `Chakra_TransferFile_V31_051626.md` — this file

---

## HOW TO START THE V31 SESSION

Upload this file first. Then upload v30.html.

**Do NOT say "How can I help you today?"**

Say:

*"DK, I have the transfer file and V30 loaded. The first order of business before building V31 is one confirmed design decision: Q3 deadline — do you want start of quarter (July 1) or end of quarter (September 30)? That locks the color calculation for all Q3/Q4 tasks."*

Wait for DK's answer. Then build V31 with the full confirmed list.

---

## DK'S WORKING STYLE

- Philosophical depth first, technology second
- Controlled drama, not artificial inflation
- All locked names (™) must be respected precisely — never casually substituted
- Documents versioned as: `Name_MMDDYY.docx` or `Name_MMDDYY_vN.html`
- No "Created by Claude" in any document
- Verify day-of-week and date accuracy in all deliverables
- Action items flagged with 🗓️ and confirmed before adding to Google Calendar (dh.kohli@gmail.com)

---

## DK'S PROFILE

- **Name:** DK / Dheeraj / Dheeraj Kohli
- **Location:** 9505 Flatbush Drive, Austin, TX 78744
- **Family:** Wife = Sonia · Son = Dhruv · Daughter = Disha · DIL = Riya · Granddaughter = Mila
- **Ashram stage:** Vanaprastha (DK himself) / Grihastha (Dhruv) / Brahmacharya (Mila) / Sannyasa (DK's father)
- **Philosophy:** Follows Gita and Lord Krishna exclusively
- **Projects:** Chakra (this project) · Picturizze (photography business) · ITC (employment)

---

*Transfer File · May 16, 2026 · Confidential · House of DK · Aux Services LLC · Austin, Texas*

*Jai Shri Krishna 🙏*
