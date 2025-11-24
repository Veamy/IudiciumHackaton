import urllib
from urllib.parse import quote
from uuid import UUID, uuid4
from asyncio import to_thread, gather
from typing import List

from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import StreamingResponse

from core.config import settings
from models.candidate_profile import CandidateProfile
from object_storage.minio_client import minio_client
from models.candidate_file import CandidateFile
from schemas.file_schemas import FileError
from services.file_service import _get_file_extension, get_file_extension_minio


async def _upload_file(file: UploadFile):
    await file.seek(0)
    file_id = uuid4()
    file_id = str(file_id)
    file_extension = await _get_file_extension(file)
    await to_thread(
        minio_client.put_object, settings.MINIO_BUCKET, file_id + file_extension, file.file, file.size,
        file.content_type)
    return CandidateFile(id=file_id, file_name=file.filename, content_type=file.content_type, file_size=file.size)


async def upload_files(files: List[UploadFile]):
    upload_files = []
    error_files = []

    tasks = [_upload_file(file) for file in files]
    results = await gather(*tasks, return_exceptions=True)

    for i, candidate_file in enumerate(results):
        if isinstance(candidate_file, Exception):
            error_file = FileError(file_name=files[i].filename, reason="Can't download file")
            error_files.append(error_file)
        else:
            upload_files.append(candidate_file)

    return upload_files, error_files


async def download_candidate_file(file_id: UUID, session: AsyncSession):
    candidate_file = await session.get(CandidateFile, file_id)
    if not candidate_file:
        raise HTTPException(status_code=404, detail="File not found")
    ext = get_file_extension_minio(candidate_file)
    minio_response = minio_client.get_object(settings.MINIO_BUCKET, str(candidate_file.id) + ext)

    def iter_file():
        try:
            for chunk in minio_response.stream(32 * 1024):
                yield chunk
        finally:
            minio_response.close()
            minio_response.release_conn()

    file_name_encoded = quote(candidate_file.file_name)

    return StreamingResponse(iter_file(), media_type=candidate_file.content_type,
                             headers={"Content-Disposition": f"attachment; filename*=utf-8''{file_name_encoded}"})


async def upload_candidate_file(candidate_id: UUID, file: UploadFile, session: AsyncSession):
    candidate = await session.get(CandidateProfile, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate_file = await _upload_file(file)

    candidate.files.append(candidate_file)
    session.add(candidate)
    await session.commit()
    return candidate_file



async def delete_candidate_file(file_id: UUID, session: AsyncSession):
    candidate_file = await session.get(CandidateFile, file_id)
    if candidate_file is None:
        raise HTTPException(status_code=404, detail="File not found")
    ext = get_file_extension_minio(candidate_file)
    await to_thread(minio_client.remove_object, settings.MINIO_BUCKET, str(candidate_file.id) + ext)
    await session.delete(candidate_file)
    await session.commit()
