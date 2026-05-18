from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List

from ..dependencies import get_current_user
from ..services.openrouter import chat

router = APIRouter(prefix="/api/llm", tags=["llm"])


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = "meta-llama/llama-3.1-8b-instruct:free"


@router.post("")
async def llm_chat(data: ChatRequest, user_id: int = Depends(get_current_user)):
    try:
        messages = [m.model_dump() for m in data.messages]
        content = await chat(messages, data.model)
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
