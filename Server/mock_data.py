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
    dict(title="Find & deliver Apsara clips — Dr. Nisha",         bucket="Dhairya",   weightage="W5", time_horizon="Q3",        life_area="Picturizze",      ch=3,  multitask=None,  origin_bucket="Dhairya",   entry_timestamp=ago(5)),
    dict(title="Eye drops — not regular",                          bucket="Karya",     weightage="W1", time_horizon="today",     life_area="Personal/Family", ch=6,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Return mom's call",                                bucket="Karya",     weightage="W2", time_horizon="thisWeek",  life_area="Personal/Family", ch=12, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Pay Sudhir + reconciliation sheet",                bucket="Karya",     weightage="W3", time_horizon="today",     life_area="Personal/Family", ch=17, multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Sonia — check kids availability today",            bucket="Karya",     weightage="W1", time_horizon="today",     life_area="Personal/Family", ch=12, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(0)),
    dict(title="Aromatherapy bowl — turn on today",                bucket="Karya",     weightage="W1", time_horizon="today",     life_area="Personal/Family", ch=13, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(0)),
    dict(title="Get fruits for guests",                            bucket="Karya",     weightage="W4", time_horizon="today",     life_area="Personal/Family", ch=13, multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(0), completed=True),
    dict(title="Cold drinks — load fridge today",                  bucket="Karya",     weightage="W2", time_horizon="today",     life_area="Personal/Family", ch=13, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(0)),
    dict(title="Mounjaro and other shots — tonight",               bucket="Karya",     weightage="W2", time_horizon="today",     life_area="Personal/Family", ch=6,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(0)),
    dict(title="Reset Sonos password",                             bucket="Karya",     weightage="W2", time_horizon="today",     life_area="Personal/Family", ch=13, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Recheck Picturizze inventory — before Sunday",     bucket="Karya",     weightage="W5", time_horizon="thisWeek",  life_area="Picturizze",      ch=3,  multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="iDeploy v1 — first version for Saturday",          bucket="Karya",     weightage="W4", time_horizon="thisWeek",  life_area="Picturizze",      ch=3,  multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Follow up payment — Hasta Punjab",                 bucket="Karya",     weightage="W1", time_horizon="today",     life_area="Picturizze",      ch=17, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Dallas event — find photographer",                 bucket="Karya",     weightage="W2", time_horizon="today",     life_area="Picturizze",      ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Tesla — draft and send intro letter",              bucket="Dhairya",   weightage="W2", time_horizon="today",     life_area="Picturizze",      ch=3,  multitask=False, origin_bucket="Dhairya",   entry_timestamp=ago(3)),
    dict(title="Mark — can I trust him fully?",                    bucket="Manan",     weightage="W2", time_horizon="thisMonth", life_area="Work/Employment", ch=12, multitask=False, origin_bucket="Manan",     entry_timestamp=ago(4)),
    dict(title="Su — client relationship doesn't click",           bucket="Manan",     weightage="W2", time_horizon="thisWeek",  life_area="Work/Employment", ch=12, multitask=False, origin_bucket="Manan",     entry_timestamp=ago(3)),
    dict(title="Calendar printout — all calendars, 3 months",      bucket="Karya",     weightage="W1", time_horizon="today",     life_area="Work/Employment", ch=11, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(0)),
    dict(title="Text Katie for July 11 photo shoot",               bucket="Karya",     weightage="W1", time_horizon="thisWeek",  life_area="Picturizze",      ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Book Milwaukee trip — Larry, Jason, Kendi",        bucket="Dhairya",   weightage="W3", time_horizon="thisWeek",  life_area="Work/Employment", ch=3,  multitask=None,  origin_bucket="Dhairya",   entry_timestamp=ago(2)),
    dict(title="Email Kumud — Harish demo",                        bucket="Karya",     weightage="W1", time_horizon="thisWeek",  life_area="Work/Employment", ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Message Dhruv & Priya for Mila birthday film",     bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Personal/Family", ch=12, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Drive back May 23 — record book content",          bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Personal/Family", ch=16, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="I do not like working for anyone",                  bucket="Manan",     weightage="W2", time_horizon="thisYear",  life_area="Personal/Family", ch=3,  multitask=False, origin_bucket="Manan",     entry_timestamp=ago(10)),
    dict(title="Legal disclaimer — Chakra app",                    bucket="Karya",     weightage="W1", time_horizon="thisWeek",  life_area="Personal/Family", ch=17, multitask=False, origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Car wash — after new paint job",                   bucket="Vishram",   weightage="W4", time_horizon="nextWeek",  life_area="Personal/Family", ch=16, multitask=None,  origin_bucket="Vishram",   entry_timestamp=ago(5)),
    dict(title="Review all Claude deliverables",                   bucket="Manthan",   weightage="W4", time_horizon="thisMonth", life_area="Personal/Family", ch=4,  multitask=None,  origin_bucket="Manthan",   entry_timestamp=ago(3)),
    dict(title="Boss misread email — nervous",                     bucket="Dhairya",   weightage="W1", time_horizon="thisMonth", life_area="Work/Employment", ch=1,  multitask=False, origin_bucket="Dhairya",   entry_timestamp=ago(6)),
    dict(title="Kumud — politically savvy, on hold",               bucket="Dhairya",   weightage="W2", time_horizon="thisMonth", life_area="Work/Employment", ch=12, multitask=False, origin_bucket="Dhairya",   entry_timestamp=ago(4)),
    dict(title="Open new fan — tomorrow for guests",               bucket="Karya",     weightage="W2", time_horizon="today",     life_area="Personal/Family", ch=13, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(0)),
    dict(title="Insurance policy — watch market to cash",          bucket="Prarabdha", weightage="W2", time_horizon="thisYear",  life_area="Personal/Family", ch=16, multitask=True,  origin_bucket="Prarabdha", entry_timestamp=ago(20)),
    dict(title="Clean office — Sanjeev coming",                    bucket="Karya",     weightage="W2", time_horizon="thisWeek",  life_area="Personal/Family", ch=13, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Message Bhavya — AI workshop",                     bucket="Karya",     weightage="W1", time_horizon="thisWeek",  life_area="Work/Employment", ch=3,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Politely decline Sameer — insurance policy",       bucket="Karya",     weightage="W1", time_horizon="thisWeek",  life_area="Personal/Family", ch=16, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Pay Rania — 3 hours Picturizze",                   bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=17, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Pay Kavya $100 — Picturizze Flatbush",             bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=17, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Pay Vinod — Picturizze assistance",                bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=17, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Pay Sai — Picturizze assistance",                  bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Picturizze",      ch=17, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Pay Shruti — Picturizze assistance",               bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Picturizze",      ch=17, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Send Larry's resume to Visteon",                   bucket="Karya",     weightage="W2", time_horizon="thisWeek",  life_area="Personal/Family", ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="B-12 shots — this Sunday recurring",               bucket="Karya",     weightage="W2", time_horizon="today",     life_area="Personal/Family", ch=6,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(0)),
    dict(title="Carry Rajiv's USB to Dallas — May 16",             bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Order Alka-Seltzer from Costco",                   bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Personal/Family", ch=6,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Reschedule Mark Gellings meeting — ITC",           bucket="Karya",     weightage="W1", time_horizon="thisWeek",  life_area="Work/Employment", ch=3,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Book India tickets — Jan 30-31 2027",              bucket="Vishram",   weightage="W3", time_horizon="thisMonth", life_area="Picturizze",      ch=11, multitask=None,  origin_bucket="Vishram",   entry_timestamp=ago(7)),
    dict(title="Plan wildlife visit — January India trip",         bucket="Vishram",   weightage="W3", time_horizon="thisMonth", life_area="Picturizze",      ch=11, multitask=None,  origin_bucket="Vishram",   entry_timestamp=ago(7)),
    dict(title="Ask Manisha to pay Sudhir — next week",            bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Personal/Family", ch=17, multitask=False, origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Email Underwriter Laboratories — ITC",             bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Work/Employment", ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Plan hardware, share with Julio — ITC",            bucket="Karya",     weightage="W3", time_horizon="thisMonth", life_area="Work/Employment", ch=3,  multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(3)),
    dict(title="Connect Ankita with Disha in Houston",             bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Personal/Family", ch=12, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Get DK medical records from Dr. Neeraj — May 30",  bucket="Karya",     weightage="W1", time_horizon="thisMonth", life_area="Personal/Family", ch=6,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(3)),
    dict(title="Send Godiva chocolates to Dr. Neeraj — May 30",    bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Personal/Family", ch=12, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Plan next Milwaukee trip",                         bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Work/Employment", ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Plan meeting with Livy — June 15",                 bucket="Karya",     weightage="W1", time_horizon="thisMonth", life_area="Picturizze",      ch=3,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(3)),
    dict(title="Update Livy location schedule in calendar",        bucket="Karya",     weightage="W1", time_horizon="thisWeek",  life_area="Picturizze",      ch=3,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Follow up Vikram — ZTV registration",              bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Follow up Gayatri TV Asia — Picturizze",           bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Send voice note to Rohit Verma — Times",           bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Follow up Rohit Verma — close Times Sports deal",  bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Find sports editor from Mumbai phone — F1 connect", bucket="Karya",    weightage="W2", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(3)),
    dict(title="Connect Zee Nitya — Picturizze media companies",   bucket="Karya",     weightage="W1", time_horizon="thisMonth", life_area="Picturizze",      ch=3,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(4)),
    dict(title="Assign projects to interns",                       bucket="Karya",     weightage="W2", time_horizon="thisWeek",  life_area="Picturizze",      ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Decide Mayur monthly pay — retain Picturizze",     bucket="Dhairya",   weightage="W2", time_horizon="nextWeek",  life_area="Picturizze",      ch=16, multitask=False, origin_bucket="Dhairya",   entry_timestamp=ago(3)),
    dict(title="Find social media person for Picturizze — May end", bucket="Karya",    weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Take passwords from Ishika — hand over Picturizze", bucket="Karya",    weightage="W2", time_horizon="thisWeek",  life_area="Picturizze",      ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Redo all passwords into proper file",              bucket="Vishram",   weightage="W2", time_horizon="thisMonth", life_area="Personal/Family", ch=9,  multitask=False, origin_bucket="Vishram",   entry_timestamp=ago(5)),
    dict(title="Plan DK contacts migration to better database",    bucket="Vishram",   weightage="W4", time_horizon="Q3",        life_area="Personal/Family", ch=11, multitask=None,  origin_bucket="Vishram",   entry_timestamp=ago(10)),
    dict(title="DK2Learn — tethering with Sony cameras by June 15", bucket="Vishram",  weightage="W4", time_horizon="thisMonth", life_area="Picturizze",      ch=4,  multitask=None,  origin_bucket="Vishram",   entry_timestamp=ago(6)),
    dict(title="Review poses document for Katie shoot — June 15",  bucket="Karya",     weightage="W4", time_horizon="thisMonth", life_area="Picturizze",      ch=3,  multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(3)),
    dict(title="Brief Shruti on June 11 photoshoot",               bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Leave one camera set with Shruti — Dallas May 23", bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Send IANT pictures to India Bazaar",               bucket="Karya",     weightage="W3", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Tell Rajiv — India Bazaar as corporate client",    bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Order 200W anchor charger for travel",             bucket="Karya",     weightage="W2", time_horizon="thisWeek",  life_area="Personal/Family", ch=13, multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Complete Picturizze inventory",                    bucket="Karya",     weightage="W4", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Check iDeploy status",                             bucket="Karya",     weightage="W3", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Get North Annuity login with Sonia",               bucket="Vishram",   weightage="W2", time_horizon="thisMonth", life_area="Personal/Family", ch=16, multitask=False, origin_bucket="Vishram",   entry_timestamp=ago(8)),
    dict(title="Send Sudhir about stocks and money",               bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Personal/Family", ch=17, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Prepare Aux Services P&L in Claude",               bucket="Karya",     weightage="W3", time_horizon="nextWeek",  life_area="Personal/Family", ch=11, multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(3)),

    # Tasks 80–98
    dict(title="Prepare F-Bar for tax returns with Sonia",          bucket="Karya",     weightage="W3", time_horizon="thisMonth", life_area="Personal/Family", ch=17, multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(4)),
    dict(title="Decide which MacBook to keep — four weeks",         bucket="Manthan",   weightage="W2", time_horizon="thisMonth", life_area="Personal/Family", ch=16, multitask=False, origin_bucket="Manthan",   entry_timestamp=ago(5)),
    dict(title="Send follow-up email to Discover",                  bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Personal/Family", ch=17, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Activate HSA 2026 — ITC",                           bucket="Karya",     weightage="W3", time_horizon="thisMonth", life_area="Personal/Family", ch=17, multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(3)),
    dict(title="Consolidate all HSA accounts",                      bucket="Vishram",   weightage="W3", time_horizon="thisMonth", life_area="Personal/Family", ch=16, multitask=None,  origin_bucket="Vishram",   entry_timestamp=ago(6)),
    dict(title="Decide HCL 401k merge with ITC 401k",               bucket="Manthan",   weightage="W3", time_horizon="Q3",        life_area="Work/Employment", ch=16, multitask=None,  origin_bucket="Manthan",   entry_timestamp=ago(8)),
    dict(title="Deepankar appraisal — ITC next week",               bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Work/Employment", ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Follow up Sanjeev Edward — GMR think tank",         bucket="Vishram",   weightage="W2", time_horizon="thisMonth", life_area="Personal/Family", ch=3,  multitask=False, origin_bucket="Vishram",   entry_timestamp=ago(9)),
    dict(title="Send money with Sanjeev — May 17",                  bucket="Karya",     weightage="W2", time_horizon="thisWeek",  life_area="Personal/Family", ch=17, multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Find ENT doctor for DK right ear",                  bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Personal/Family", ch=6,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(3)),
    dict(title="Reschedule Dr. V Baylor Scott — this Monday",       bucket="Karya",     weightage="W1", time_horizon="thisWeek",  life_area="Personal/Family", ch=6,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Order Dexcom for DK — next week",                   bucket="Karya",     weightage="W2", time_horizon="nextWeek",  life_area="Personal/Family", ch=6,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(2)),
    dict(title="Pending payment from Sameera — $500 May 23",        bucket="Dhairya",   weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=17, multitask=False, origin_bucket="Dhairya",   entry_timestamp=ago(3)),
    dict(title="Tell Priyanka — check Katie shoot inspiration pics", bucket="Karya",     weightage="W1", time_horizon="nextWeek",  life_area="Picturizze",      ch=3,  multitask=False, origin_bucket="Karya",     entry_timestamp=ago(1)),
    dict(title="Confirm Pugs Rescue Austin dates for July",         bucket="Karya",     weightage="W1", time_horizon="thisMonth", life_area="Picturizze",      ch=3,  multitask=True,  origin_bucket="Karya",     entry_timestamp=ago(4)),
    dict(title="Start monthly cloud P&L with auto alarms — June 1", bucket="Karya",     weightage="W4", time_horizon="nextWeek",  life_area="Personal/Family", ch=11, multitask=None,  origin_bucket="Karya",     entry_timestamp=ago(3)),
    dict(title="Find Lakme Fashion Week dates — align India trip",  bucket="Vishram",   weightage="W1", time_horizon="thisMonth", life_area="Picturizze",      ch=11, multitask=True,  origin_bucket="Vishram",   entry_timestamp=ago(7)),
    dict(title="Plan Tirth (puja) in India — next year trip",       bucket="Manan",     weightage="W2", time_horizon="thisMonth", life_area="Picturizze",      ch=7,  multitask=False, origin_bucket="Manan",     entry_timestamp=ago(8)),
    dict(title="Book India tickets — by June end",                  bucket="Vishram",   weightage="W3", time_horizon="thisMonth", life_area="Picturizze",      ch=11, multitask=None,  origin_bucket="Vishram",   entry_timestamp=ago(6)),
]

# Get existing titles to avoid duplicates
existing_titles = {t.title for t in db.query(Task.title).filter(Task.user_id == dk.id).all()}

new_tasks = [t for t in TASKS if t["title"] not in existing_titles]
skipped = len(TASKS) - len(new_tasks)

for t in new_tasks:
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
print(f"  Inserted {len(new_tasks)} new tasks. Skipped {skipped} duplicates.")
print("Done.")
