from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from schemas.file_schemas import FileResponse, FileError


class CandidateBase(BaseModel):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class CandidateResponse(CandidateBase):
    profile: dict
    position_id: UUID | None = None
    files: List[FileResponse] = []
    error_files: List[FileError] = []


class CandidateList(CandidateBase):
    name: str
