from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    bucket: Optional[str] = None
    weightage: Optional[str] = None
    time_horizon: Optional[str] = None
    life_area: Optional[str] = None
    ch: Optional[int] = None
    multitask: Optional[bool] = False


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    bucket: Optional[str] = None
    weightage: Optional[str] = None
    time_horizon: Optional[str] = None
    life_area: Optional[str] = None
    ch: Optional[int] = None
    multitask: Optional[bool] = None
    completed: Optional[bool] = None


class TaskOut(BaseModel):
    id: int
    user_id: int
    title: str
    bucket: Optional[str]
    weightage: Optional[str]
    time_horizon: Optional[str]
    life_area: Optional[str]
    ch: Optional[int]
    multitask: Optional[bool]
    state_history: Optional[List[Any]] = []
    origin_bucket: Optional[str]
    completed: bool
    completed_timestamp: Optional[datetime]
    entry_timestamp: datetime

    model_config = {"from_attributes": True}
