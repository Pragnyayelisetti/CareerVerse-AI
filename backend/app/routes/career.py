"""
/ask endpoint — accepts a user question and returns career guidance
from Claude AI.
"""

from fastapi import APIRouter, HTTPException
from app.schemas import AskRequest, AskResponse
from app.services.claude_service import get_career_guidance

router = APIRouter(prefix="/ask", tags=["Career Guidance"])


@router.post("/", response_model=AskResponse)
async def ask_career_question(payload: AskRequest):
    """
    Send a career-related question to Claude and return the AI response.

    **Request body**
    - `question` (str): The user's career question.

    **Response**
    - `answer` (str): Claude's career guidance reply.
    """
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        answer = await get_career_guidance(payload.question)
        return AskResponse(answer=answer)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
