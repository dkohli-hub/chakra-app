import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine
from app.models.user import User
from app.database import Base
from app.services.auth import hash_password

Base.metadata.create_all(bind=engine)

SEED_USERS = [
    {"username": "dk",      "password": "dk@chakra",      "role": "admin"},
    {"username": "tester1", "password": "tester1@chakra", "role": "tester"},
    {"username": "tester2", "password": "tester2@chakra", "role": "tester"},
    {"username": "tester3", "password": "tester3@chakra", "role": "tester"},
]

db = SessionLocal()
for u in SEED_USERS:
    exists = db.query(User).filter(User.username == u["username"]).first()
    if not exists:
        db.add(User(username=u["username"], password_hash=hash_password(u["password"]), role=u["role"]))
        print(f"  created: {u['username']}")
    else:
        print(f"  skipped: {u['username']} (already exists)")
db.commit()
db.close()
print("Done.")
