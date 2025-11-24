import json
from typing import List
from uuid import UUID

import httpx
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.prompt import basePrompt, info_prompt, short_info_prompt
from schemas.ai_schemas import RequestToAI
from schemas.candidate_schemas import CandidateResponse, ShortCandidateInfo
from schemas.position_schemas import PositionResponse
from services.candidate_service import get_candidate_by_id, create_candidate, update_candidate_profile
from services.file_service import read_files, read_files_from_minio
from services.minio_service import upload_files
from services.position_service import get_position_by_id
from services.youcontrol_service import check_candidate


async def generate_answer(prompt: str, position_id: UUID, files: List[UploadFile], websearch: bool,
                          session: AsyncSession):
    full_text, processed_files, error_files = await read_files(files)

    additional_info = ""
    if websearch:
        additional_info = do_websearch(full_text)

    profile_data = await make_request(full_text, position_id, prompt, additional_info, session)
    if profile_data["candidate"]["full_name"] == "unknown":
        raise HTTPException(status_code=422, detail="No candidate data")
    candidate_files, upload_error_files = await upload_files(processed_files)
    error_files.extend(upload_error_files)
    new_candidate = await create_candidate(profile_data, candidate_files, position_id, session)

    return CandidateResponse(id=new_candidate.id, profile=new_candidate.profile, position_id=new_candidate.position_id,
                             files=new_candidate.files, error_files=error_files)


async def refresh_candidate(candidate_id: UUID, prompt: str, websearch: bool, session: AsyncSession):
    candidate = await get_candidate_by_id(candidate_id, session)
    files = candidate.files
    full_text, processed_files, error_files = await read_files_from_minio(files)

    additional_info = ""
    if websearch:
        additional_info = do_websearch(full_text)

    profile_data = await make_request(full_text, candidate.position_id, prompt, additional_info, session)
    updated_candidate = await update_candidate_profile(candidate_id, profile_data, session)
    return CandidateResponse(id=updated_candidate.id, profile=updated_candidate.profile,
                             position_id=updated_candidate.position_id,
                             files=updated_candidate.files, error_files=error_files)


async def make_request(full_text: str, position_id: UUID, prompt: str, additional_info, session: AsyncSession):
    position_orm = await get_position_by_id(position_id, session)
    position = PositionResponse.model_validate(position_orm).model_dump_json()
    final_prompt = basePrompt + info_prompt.format(full_text=full_text, position=position, prompt=prompt,
                                                   additional_info=additional_info)

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
        return json.loads(answer)


async def get_short_candidate_info(full_text: str):
    final_prompt = short_info_prompt + full_text
    async with httpx.AsyncClient(timeout=httpx.Timeout(120)) as client:
        request = RequestToAI(model=settings.AI_MODEL, prompt=final_prompt, stream=False, format="json",
                              options={"temperature": 0.0, "seed": 137})
        response = await client.post(
            f"{settings.OLLAMA_API}/api/generate",
            json=request.model_dump()
        )
        data = json.loads(response.text)
        answer = data["response"]
        answer = json.loads(answer)
        print(answer)
        candidate_info = ShortCandidateInfo(**answer)

        if not candidate_info.LastName:
            raise HTTPException(status_code=422, detail="No candidate data")

        return candidate_info


async def do_websearch(full_text: str):
    candidate_info = await get_short_candidate_info(full_text)
    youcontrol_info = await check_candidate(candidate_info.LastName, candidate_info.FirstName,
                                            candidate_info.MiddleName, candidate_info.BirthDate)
    return json.dumps(youcontrol_info)
