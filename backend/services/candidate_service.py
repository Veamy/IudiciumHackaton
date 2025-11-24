from asyncio import to_thread, gather
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from models.candidate_profile import CandidateProfile
from object_storage.minio_client import minio_client
from services.file_service import get_file_extension_minio


async def get_all_candidates(session: AsyncSession):
    result = await session.execute(select(CandidateProfile))
    return result.scalars().all()


async def get_candidate_by_id(candidate_id: UUID, session: AsyncSession):
    candidate = await session.get(CandidateProfile, candidate_id)

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return candidate


async def delete_candidate_by_id(candidate_id: UUID, session: AsyncSession):
    candidate = await session.get(CandidateProfile, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    minio_tasks = []

    for file in candidate.files:
        ext = get_file_extension_minio(file)
        task = to_thread(minio_client.remove_object, settings.MINIO_BUCKET, str(file.id) + ext)
        minio_tasks.append(task)

    if minio_tasks:
        await gather(*minio_tasks, return_exceptions=True)

    await session.delete(candidate)
    await session.commit()
