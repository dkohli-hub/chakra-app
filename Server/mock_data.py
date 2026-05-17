import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
from app.database import SessionLocal, engine
from app.models.task import Task
from app.models.user import User
from app.database import Base

Base.metadata.create_all(bind=engine)

db = SessionLocal()
dk = db.query(User).filter(User.username == "dk").first()
if not dk:
    print("User 'dk' not found. Run seed.py first.")
    sys.exit(1)

def ago(days):
    return datetime.utcnow() - timedelta(days=days)

TASKS = [
    # Karya - active work
    dict(title="File Q1 tax documents with CA",          bucket="Karya",     weightage="W3", time_horizon="thisWeek",  life_area="Work/Employment",  ch=3,  multitask=False, origin_bucket="Karya", entry_timestamp=ago(5)),
    dict(title="Review Picturizze pricing strategy",     bucket="Karya",     weightage="W3", time_horizon="thisMonth", life_area="Picturizze",       ch=10, multitask=False, origin_bucket="Karya", entry_timestamp=ago(3)),
    dict(title="Call insurance agent about renewal",     bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Personal/Family",  ch=3,  multitask=True,  origin_bucket="Karya", entry_timestamp=ago(2)),
    dict(title="Update LinkedIn profile",                bucket="Karya",     weightage="W2", time_horizon="thisMonth", life_area="Work/Employment",  ch=16, multitask=False, origin_bucket="Karya", entry_timestamp=ago(4)),
    dict(title="Book India flights for December",        bucket="Karya",     weightage="W3", time_horizon="Q3",        life_area="Personal/Family",  ch=8,  multitask=False, origin_bucket="Karya", entry_timestamp=ago(1)),
    dict(title="Send project proposal to Mayur",        bucket="Karya",     weightage="W2", time_horizon="today",     life_area="Work/Employment",  ch=3,  multitask=False, origin_bucket="Karya", entry_timestamp=ago(0)),
    dict(title="Pay HOA dues",                          bucket="Karya",     weightage="W1", time_horizon="thisWeek",  life_area="Personal/Family",  ch=3,  multitask=False, origin_bucket="Karya", entry_timestamp=ago(1)),

    # Dhairya - waiting on others
    dict(title="Waiting for Dhruv to confirm vacation dates",  bucket="Dhairya", weightage="W1", time_horizon="nextWeek",  life_area="Personal/Family",  ch=2,  multitask=False, origin_bucket="Karya", entry_timestamp=ago(7)),
    dict(title="Awaiting client feedback on Picturizze shoot", bucket="Dhairya", weightage="W2", time_horizon="thisWeek",  life_area="Picturizze",       ch=12, multitask=True,  origin_bucket="Karya", entry_timestamp=ago(4)),
    dict(title="Pending bank response on home equity line",    bucket="Dhairya", weightage="W4", time_horizon="thisMonth", life_area="Personal/Family",  ch=9,  multitask=False, origin_bucket="Karya", entry_timestamp=ago(10)),
    dict(title="Neeraj to send signed contract",               bucket="Dhairya", weightage="W3", time_horizon="nextWeek",  life_area="Work/Employment",  ch=12, multitask=False, origin_bucket="Karya", entry_timestamp=ago(3)),

    # Vishram - conscious rest
    dict(title="Redesign home office setup",             bucket="Vishram",   weightage="W3", time_horizon="Q3",        life_area="Personal/Family",  ch=6,  multitask=False, origin_bucket="Karya", entry_timestamp=ago(15)),
    dict(title="Plan Vanaprastha reading list",          bucket="Vishram",   weightage="W2", time_horizon="thisYear",  life_area="Personal/Family",  ch=6,  multitask=True,  origin_bucket="Karya", entry_timestamp=ago(20)),
    dict(title="Explore meditation retreat options",     bucket="Vishram",   weightage="W2", time_horizon="Q3",        life_area="Personal/Family",  ch=6,  multitask=False, origin_bucket="Vishram", entry_timestamp=ago(12)),

    # Manan - deep contemplation
    dict(title="Reflect on ITC exit strategy and timing",      bucket="Manan", weightage="W4", time_horizon="thisYear",  life_area="Work/Employment",  ch=7,  multitask=False, origin_bucket="Manan", entry_timestamp=ago(30)),
    dict(title="What does financial freedom look like at 60?", bucket="Manan", weightage="W3", time_horizon="1year",     life_area="Personal/Family",  ch=7,  multitask=True,  origin_bucket="Manan", entry_timestamp=ago(25)),
    dict(title="Chakra product vision — next 2 years",         bucket="Manan", weightage="W4", time_horizon="Q3",        life_area="Work/Employment",  ch=11, multitask=False, origin_bucket="Manan", entry_timestamp=ago(8)),

    # Manthan - churning (manual only)
    dict(title="Should Picturizze become a studio brand?",     bucket="Manthan", weightage="W5", time_horizon="thisYear", life_area="Picturizze",      ch=14, multitask=False, origin_bucket="Manthan", entry_timestamp=ago(45)),
    dict(title="Rethink daily schedule post-ITC",              bucket="Manthan", weightage="W4", time_horizon="Q3",       life_area="Work/Employment", ch=5,  multitask=False, origin_bucket="Manthan", entry_timestamp=ago(20)),

    # Tyaga - conscious release
    dict(title="Old photography equipment — donate or sell",   bucket="Tyaga",  weightage="W2", time_horizon="thisMonth", life_area="Picturizze",      ch=5,  multitask=False, origin_bucket="Karya", entry_timestamp=ago(18)),
    dict(title="Cancel unused SaaS subscriptions",             bucket="Tyaga",  weightage="W1", time_horizon="thisWeek",  life_area="Work/Employment", ch=5,  multitask=False, origin_bucket="Karya", entry_timestamp=ago(6)),

    # Prarabdha - destiny in motion
    dict(title="Mila's first year milestones",                 bucket="Prarabdha", weightage="W2", time_horizon="thisYear", life_area="Personal/Family", ch=9, multitask=True,  origin_bucket="Prarabdha", entry_timestamp=ago(60)),
    dict(title="DK's health checkup schedule 2026",            bucket="Prarabdha", weightage="W3", time_horizon="Q3",       life_area="Personal/Family", ch=6, multitask=False, origin_bucket="Prarabdha", entry_timestamp=ago(40)),

    # Overdue tasks (to test overdue star)
    dict(title="Submit expense report — March",                bucket="Karya",  weightage="W1", time_horizon="today",     life_area="Work/Employment", ch=3,  multitask=False, origin_bucket="Karya", entry_timestamp=ago(14)),
    dict(title="Renew car registration",                       bucket="Karya",  weightage="W2", time_horizon="today",     life_area="Personal/Family", ch=3,  multitask=False, origin_bucket="Karya", entry_timestamp=ago(8)),

    # Completed tasks (for scoring)
    dict(title="Set up Chakra dev environment",                bucket="Karya",  weightage="W3", time_horizon="thisWeek",  life_area="Work/Employment", ch=3,  multitask=False, origin_bucket="Karya", completed=True, entry_timestamp=ago(10)),
    dict(title="Disha birthday gift ordered",                  bucket="Karya",  weightage="W1", time_horizon="today",     life_area="Personal/Family", ch=12, multitask=False, origin_bucket="Karya", completed=True, entry_timestamp=ago(5)),
    dict(title="Picturizze Instagram post — April batch",      bucket="Karya",  weightage="W2", time_horizon="thisWeek",  life_area="Picturizze",      ch=10, multitask=True,  origin_bucket="Karya", completed=True, entry_timestamp=ago(7)),
    dict(title="Pay quarterly estimated taxes",                bucket="Karya",  weightage="W2", time_horizon="thisMonth", life_area="Work/Employment", ch=3,  multitask=False, origin_bucket="Karya", completed=True, entry_timestamp=ago(12)),
    dict(title="Sonia anniversary dinner reservation",         bucket="Karya",  weightage="W1", time_horizon="today",     life_area="Personal/Family", ch=12, multitask=False, origin_bucket="Karya", completed=True, entry_timestamp=ago(3)),
]

# Remove existing mock tasks for dk to avoid duplicates
existing = db.query(Task).filter(Task.user_id == dk.id).count()
if existing > 0:
    confirm = input(f"  {existing} tasks already exist for dk. Replace them? (y/n): ").strip().lower()
    if confirm == 'y':
        db.query(Task).filter(Task.user_id == dk.id).delete()
        db.commit()
        print("  Cleared existing tasks.")
    else:
        print("  Aborted.")
        db.close()
        sys.exit(0)

for t in TASKS:
    completed = t.pop("completed", False)
    entry_ts = t.pop("entry_timestamp", datetime.utcnow())
    state_history = [{"bucket": t["origin_bucket"], "timestamp": entry_ts.isoformat()}]
    task = Task(
        user_id=dk.id,
        state_history=state_history,
        completed=completed,
        completed_timestamp=datetime.utcnow() if completed else None,
        entry_timestamp=entry_ts,
        **t,
    )
    db.add(task)

db.commit()
db.close()
print(f"  Inserted {len(TASKS)} tasks for dk.")
print("Done.")
