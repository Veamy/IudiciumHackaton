from uuid import UUID

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.params import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from db.session import get_db
from schemas.file_schemas import FileResponse
from services.minio_service import delete_candidate_file, download_candidate_file, upload_candidate_file

router = APIRouter(tags=["Minio"])

@router.get("/download/{file_id}")
async def download_file(file_id: UUID, session: AsyncSession = Depends(get_db)):
    return await download_candidate_file(file_id, session)

@router.post("/upload", response_model=FileResponse)
async def upload_file(candidate_id: UUID = Form(...), file: UploadFile = File(...), session: AsyncSession = Depends(get_db)):
    return await upload_candidate_file(candidate_id, file, session)

@router.delete("/delete/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_by_id(file_id: UUID, session: AsyncSession = Depends(get_db)):
    await delete_candidate_file(file_id, session)
    return None
