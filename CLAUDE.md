# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project: Chakra™ — AI-Powered Mind Organization System

**Product:** Chakra™ — Dashboard: Karma Kshetra™  
**Owner:** DK (Dheeraj Kohli), House of DK / Aux Services LLC, Austin, Texas  
**Philosophy:** Bhagavad Gita — 18 chapters mapped to 18 life arenas  
**Current status:** Full-stack web app — FastAPI backend + React/Vite frontend, deployed on Render

---

## Actual Stack (implemented)

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite (no TypeScript) |
| Backend | FastAPI (Python) + SQLAlchemy + Alembic |
| Database | PostgreSQL (`JSONB` for `state_history`) |
| AI gateway | OpenRouter (proxies Gemini, others) |
| Hosting | Render — `chakra-app-ui.onrender.com` (UI), separate backend service |
| DNS | GoDaddy → Render |

### Repository Layout

```
/Chakra Project
├── Server/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app, CORS, router registration
│   │   ├── config.py       # pydantic-settings (reads .env)
│   │   ├── database.py     # SQLAlchemy engine + get_db dependency
│   │   ├── dependencies.py # JWT bearer → current user_id
│   │   ├── models/         # SQLAlchemy ORM: user.py, task.py
│   │   ├── schemas/        # Pydantic request/response: user.py, task.py
│   │   ├── services/       # auth.py (bcrypt + JWT), openrouter.py
│   │   └── routers/        # auth.py, tasks.py, llm.py
│   ├── requirements.txt
│   └── runtime.txt
└── UI/                     # React/Vite frontend
    ├── src/
    │   ├── App.jsx          # BrowserRouter + AuthProvider + ProtectedRoute
    │   ├── main.jsx
    │   ├── data/gitaChapters.js   # GITA_CHAPTERS array (18 entries)
    │   ├── services/api.js        # axios instance; authAPI, tasksAPI, llmAPI
    │   ├── hooks/useAuth.jsx      # AuthContext, token in localStorage
    │   ├── hooks/useTasks.js      # task state + CRUD wrappers
    │   ├── utils/
    │   │   ├── horizonLogic.js    # autoHorizon, timeScore, isOverdue, deadlineFromTimeFrame
    │   │   ├── colorSystem.js     # score → color band
    │   │   ├── scoring.js
    │   │   └── theme.js
    │   └── components/
    │       ├── auth/LoginPage.jsx
    │       ├── dashboard/KarmaKshetra.jsx   # top-level dashboard shell
    │       ├── dashboard/TabNav.jsx
    │       ├── dashboard/TaskCard.jsx
    │       ├── fab/QuickGatherFAB.jsx
    │       ├── calendar/CalendarModal.jsx
    │       ├── common/ColorBadge.jsx
    │       ├── common/OverdueStar.jsx
    │       ├── smartfetch/SmartFetch.jsx     # image → tasks via vision LLM
    │       └── tabs/                         # one file per dashboard tab
    ├── .env.example         # VITE_API_BASE_URL=http://localhost:8000
    ├── package.json
    └── vite.config.js       # dev proxy: /api + /auth → localhost:8000
```

### Development Commands

**Backend** (from `Server/` directory):
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload        # starts on :8000
```

**Backend `.env`** (required — not committed):
```
DATABASE_URL=postgresql://...
SECRET_KEY=...
OPENROUTER_API_KEY=...
ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend** (from `UI/` directory):
```bash
npm install
npm run dev        # starts on :5173 with proxy to :8000
npm run build
```

In dev mode, Vite proxies `/api/*` and `/auth/*` to `http://localhost:8000`, so no CORS issues locally.

### Database Schema (actual — more fields than original spec)

```sql
-- users: id, username, password_hash, role, created_at
-- tasks: id, user_id, title, bucket, weightage, time_horizon,
--        life_area, ch (int, Gita chapter), multitask (bool),
--        state_history (JSONB), origin_bucket, completed,
--        completed_timestamp, entry_timestamp
```

`state_history` is a JSONB array of `{bucket, timestamp}` snapshots appended on every bucket change.

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
3. All subsequent UI changes: DK creates new HTML → Mayur applies incremental updates to the React components.
4. Backend changes go through Alembic migrations — run `alembic revision --autogenerate -m "desc"` then `alembic upgrade head` before deploying.

---

## Session Transfer Protocol

When starting a new session, upload the latest `Chakra_TransferFile_*.md` first, then the current `KarmaKshetra_DK_*.html`. The transfer file contains confirmed build lists and open design questions that must be resolved before coding.
