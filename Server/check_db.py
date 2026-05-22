"""
Run this on Render shell: python check_db.py
Checks DB connection, tables, row counts, and OpenRouter reachability.
"""
import os, sys

# ── 1. Load env ──────────────────────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

print("=" * 55)
print("  Chakra™ — Server Health Check")
print("=" * 55)

# ── 2. Env vars ───────────────────────────────────────────────────────────────
print("\n[1] Environment Variables")
print(f"  DATABASE_URL       : {'SET (' + DATABASE_URL[:30] + '...)' if DATABASE_URL else 'MISSING ❌'}")
print(f"  OPENROUTER_API_KEY : {'SET (sk-or-***)' if OPENROUTER_API_KEY else 'MISSING ❌'}")
print(f"  OPENROUTER_BASE_URL: {OPENROUTER_BASE_URL}")

if not DATABASE_URL:
    print("\n❌ DATABASE_URL is not set. Aborting.")
    sys.exit(1)

# ── 3. DB connection ──────────────────────────────────────────────────────────
print("\n[2] Database Connection")
try:
    from sqlalchemy import create_engine, text
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.fetchone()[0]
    print(f"  ✅ Connected — {version[:60]}")
except Exception as e:
    print(f"  ❌ Connection failed: {e}")
    sys.exit(1)

# ── 4. Tables ─────────────────────────────────────────────────────────────────
print("\n[3] Tables & Row Counts")
TABLES = ["users", "tasks"]
try:
    with engine.connect() as conn:
        for table in TABLES:
            try:
                row = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).fetchone()
                print(f"  ✅ {table:<10} — {row[0]} rows")
            except Exception as e:
                print(f"  ❌ {table:<10} — {e}")
except Exception as e:
    print(f"  ❌ Could not query tables: {e}")

# ── 5. Column check (tasks) ───────────────────────────────────────────────────
print("\n[4] Task Table Columns")
try:
    with engine.connect() as conn:
        rows = conn.execute(text(
            "SELECT column_name, data_type FROM information_schema.columns "
            "WHERE table_name = 'tasks' ORDER BY ordinal_position"
        )).fetchall()
        for col, dtype in rows:
            print(f"  • {col:<25} {dtype}")
except Exception as e:
    print(f"  ❌ {e}")

# ── 6. OpenRouter ping ────────────────────────────────────────────────────────
print("\n[5] OpenRouter API")
if not OPENROUTER_API_KEY:
    print("  ⚠️  Skipped — OPENROUTER_API_KEY not set")
else:
    try:
        import httpx
        resp = httpx.get(
            f"{OPENROUTER_BASE_URL}/models",
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            timeout=10,
        )
        if resp.status_code == 200:
            models = resp.json().get("data", [])
            free = [m["id"] for m in models if m["id"].endswith(":free")][:5]
            print(f"  ✅ Reachable — {len(models)} models available")
            print(f"  Free models (first 5): {free}")
        else:
            print(f"  ❌ HTTP {resp.status_code} — {resp.text[:200]}")
    except Exception as e:
        print(f"  ❌ {e}")

print("\n" + "=" * 55)
print("  Done.")
print("=" * 55)
