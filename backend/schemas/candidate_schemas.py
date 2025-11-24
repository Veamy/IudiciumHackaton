from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator, Field

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

class ShortCandidateInfo(BaseModel):
    LastName: str
    FirstName: str
    MiddleName: str | None = Field(default=None, alias="MiddleName")
    BirthDate: str | None = Field(default=None, alias="BirthDate")

    @field_validator('*', mode='before')
    @classmethod
    def clean_junk(cls, v):
        junk = ["unknown", "not specified", "не вказано", "невідомо", ""]
        if isinstance(v, str) and v.lower().strip() in junk:
            return None
        return v
