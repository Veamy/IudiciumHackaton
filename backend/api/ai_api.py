from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_db
from schemas.ai_schemas import RefreshRequest
from schemas.candidate_schemas import CandidateResponse
from services.ai_service import generate_answer, refresh_candidate

router = APIRouter(tags=["AI"])


@router.post("/generate", response_model=CandidateResponse)
async def generate(prompt: str | None = Form(None), position_id: UUID = Form(...), files: List[UploadFile] = File(...),
                   websearch: bool = False,
                   session: AsyncSession = Depends(get_db)):
    return await generate_answer(prompt, position_id, files, websearch, session)


@router.post("/refresh/{candidate_id}", response_model=CandidateResponse)
async def refresh(candidate_id: UUID, body: RefreshRequest | None = None, websearch: bool = False,
                  session: AsyncSession = Depends(get_db)):
    return await refresh_candidate(candidate_id, body.prompt if body else None, websearch, session)
