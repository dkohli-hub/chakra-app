# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project: Chakra™ — AI-Powered Mind Organization System

**Product:** Chakra™ — Dashboard: Karma Kshetra™  
**Owner:** DK (Dheeraj Kohli), House of DK / Aux Services LLC, Austin, Texas  
**Philosophy:** Bhagavad Gita — 18 chapters mapped to 18 life arenas  
**Current status:** HTML prototypes (V30+) being converted to a full-stack web app

This directory contains session handoff files and build documentation. The live codebase is deployed separately via GitHub → Render.

---

## Planned Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS + HTML5 (extracted from HTML prototypes) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| File storage | Cloudflare R2 |
| AI agents | LangChain.js + TypeScript |
| AI gateway | LiteLLM (proxies Anthropic / OpenAI / Gemini) |
| Hosting | Render (auto-deploy from GitHub `aux-dk` org) |
| DNS | GoDaddy → Render |

### Planned Directory Layout

```
/chakra-app
├── /public
│   ├── index.html          # login page
│   └── dashboard.html      # Karma Kshetra™ dashboard
├── /js
│   ├── app.js              # frontend logic
│   └── data.js             # GITA_CHAPTERS array and static data
├── /css
│   └── styles.css
├── /server
│   ├── index.js            # Express entry point
│   ├── auth.js             # bcrypt + express-session
│   ├── db.js               # PostgreSQL connection pool
│   └── /routes
│       ├── tasks.js        # Task CRUD API
│       └── claude.js       # LLM proxy (keeps API keys server-side)
├── .env                    # never committed
├── .gitignore
└── package.json
```

### Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'tester',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  bucket VARCHAR(30),
  weightage VARCHAR(5),
  time_horizon VARCHAR(30),
  completed BOOLEAN DEFAULT false,
  entry_timestamp TIMESTAMP DEFAULT NOW()
);
```

### Development Commands (once scaffolded)

```bash
npm install
node server/index.js        # start server
```

---

## LOCKED — Do Not Change

### Trademarked Names (always use exact spelling + ™)

**Phases:** Spandan™ · Vivek™ · Sthapana™ · Kriya™ · Mukt™  
**Buckets:** Karya™ · Dhairya™ · Vishram™ · Manan™ · Manthan™ · Tyaga™ · Prarabdha™  
**Dashboard:** Karma Kshetra™  
**System:** Chakra™  

> Manthan™ is MANUAL only — never auto-assign tasks to it.

### Brand Colors

| Name | Hex |
|------|-----|
| Peacock Gold | `#C9A84C` |
| Peacock Teal | `#1A6B5A` |
| Working Zone Teal | `#00BFA5` |

Working Zone treatment: `4px double border` in `#00BFA5` with subtle background tint. Never use orange for the working zone — it reads too close to red.

### Color / Buffer System (5-band)

| Color | Buffer | Mental State |
|-------|--------|--------------|
| Blue | > 400% | Fully assured |
| Green | 200–400% | Ahead of schedule |
| Amber | 100–200% | Normal operating zone |
| Teal (double border) | 50–100% | Execution mode |
| Red | 0–50% | Act immediately |
| Red ★ | ≤ 0% | Overdue — costs energy daily |

Overdue star: `font-size:16px; font-weight:900` red ★ + "OVERDUE" badge. Must be large and unmissable.

### Auto-Horizon Logic (Option B — locked)

H is always system-assigned. Never ask the user for H.

| Time Frame | H | Buffer days | Score formula |
|---|---|---|---|
| today / thisWeek / nextWeek | H1 | 7 | `(daysUntilDeadline − 7) ÷ 7 × 100` |
| thisMonth | H2 | 14 | `(daysUntilDeadline − 14) ÷ 14 × 100` |
| Q3 / Q4 / thisYear / 1year | H3 | 30 | `(daysUntilDeadline − 30) ÷ 30 × 100` |

Score maps to color bands above. `isOverdue()` = `timeScore() ≤ 0`.

### Weightage Definitions

| Code | Duration |
|------|----------|
| W1 | 5–10 min |
| W2 | 20–30 min |
| W3 | 1 hour |
| W4 | Half day |
| W5 | Full day |

---

## DK's Working Style

- Philosophical depth first, technology second.
- Never say "Created by Claude" in any document.
- Never casually substitute or abbreviate trademarked names.
- Files versioned as `Name_MMDDYY.docx` or `Name_MMDDYY_vN.html`.
- Always verify day-of-week and date accuracy in deliverables.
- Action items flagged with 🗓️ and confirmed with DK before adding to Google Calendar (`dh.kohli@gmail.com`).
- All go-live decisions require DK confirmation — Mayur (developer) does not ship without sign-off.

---

## Development Workflow

1. DK + Claude iterate on HTML prototypes (versioned, stored in Google Drive via `aux-drive`).
2. Mayur extracts and applies changes to the live Render deployment.
3. Claude scaffolds ~80% of project structure from HTML prototypes; Mayur handles ~20% (DB schema, env setup, testing).
4. All subsequent UI changes: DK creates new HTML → Mayur applies incremental updates.

---

## Session Transfer Protocol

When starting a new session, upload the latest `Chakra_TransferFile_*.md` first, then the current `KarmaKshetra_DK_*.html`. The transfer file contains confirmed build lists and open design questions that must be resolved before coding.
