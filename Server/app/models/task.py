from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from ..database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    bucket = Column(String(30))
    weightage = Column(String(5))
    time_horizon = Column(String(30))
    life_area = Column(String(30))
    ch = Column(Integer)
    multitask = Column(Boolean, default=False)
    state_history = Column(JSONB, default=list)
    origin_bucket = Column(String(30))
    completed = Column(Boolean, default=False)
    completed_timestamp = Column(DateTime)
    entry_timestamp = Column(DateTime, server_default=func.now())
