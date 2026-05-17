from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models.task import Task
from ..schemas.task import TaskCreate, TaskOut, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskOut])
def get_tasks(db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    return db.query(Task).filter(Task.user_id == user_id).all()


@router.post("", response_model=TaskOut)
def create_task(data: TaskCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    payload = data.model_dump()
    payload["user_id"] = user_id
    payload["origin_bucket"] = data.bucket
    payload["state_history"] = [{"bucket": data.bucket, "timestamp": datetime.utcnow().isoformat()}] if data.bucket else []
    task = Task(**payload)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    updates = data.model_dump(exclude_none=True)

    if "bucket" in updates and updates["bucket"] != task.bucket:
        history = list(task.state_history or [])
        history.append({"bucket": updates["bucket"], "timestamp": datetime.utcnow().isoformat()})
        task.state_history = history

    if updates.get("completed") is True and not task.completed:
        task.completed_timestamp = datetime.utcnow()
    elif updates.get("completed") is False:
        task.completed_timestamp = None

    for key, val in updates.items():
        if key != "state_history":
            setattr(task, key, val)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"ok": True}
