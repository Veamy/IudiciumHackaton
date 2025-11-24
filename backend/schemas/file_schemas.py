from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FileResponse(BaseModel):
    id: UUID
    file_name: str
    content_type: str
    file_size: int
    candidate_id: UUID
    model_config = ConfigDict(from_attributes=True)

class FileError(BaseModel):
    file_name: str
    reason: str
