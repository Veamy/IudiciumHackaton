import json
from typing import List
from uuid import UUID

import httpx
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.prompt import basePrompt, info_prompt
from schemas.ai_schemas import RequestToAI
from models.candidate_profile import CandidateProfile
from schemas.candidate_schemas import CandidateResponse
from schemas.position_schemas import PositionResponse
from services.file_service import read_text
from services.minio_service import upload_files
from services.position_service import get_position_by_id


async def generate_answer(prompt: str, position_id: UUID, files: List[UploadFile], session: AsyncSession):
    full_text, read_files, error_files = await read_text(files)
    position_orm = await get_position_by_id(position_id, session)
    position = PositionResponse.model_validate(position_orm).model_dump()
    final_prompt = basePrompt + info_prompt.format(full_text=full_text, position=position, prompt=prompt)

    async with httpx.AsyncClient(timeout=httpx.Timeout(120)) as client:
        request = RequestToAI(model=settings.AI_MODEL, prompt=final_prompt, stream=False,
                              format="json",
                              options={"temperature": 0.0, "seed": 137})
        response = await client.post(
            f"{settings.OLLAMA_API}/api/generate",
            json=request.model_dump()
        )
        data = json.loads(response.text)
        answer = data["response"]
        profile_data = json.loads(answer)
        if profile_data["candidate"]["full_name"] == "unknown":
            raise HTTPException(status_code=422, detail="No candidate data")
        candidate_files, upload_error_files = await upload_files(read_files)
        error_files.extend(upload_error_files)
        profile = CandidateProfile(profile=profile_data, files=candidate_files, position_id=position_id)
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
    return CandidateResponse(id=profile.id, profile=profile.profile, position_id=profile.position_id,
                             files=profile.files, error_files=error_files)
