from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from schemas.candidate_schemas import CandidateList


class PositionCreate(BaseModel):
    name: str
    parameters: List[dict]


class PositionResponse(PositionCreate):
    id: UUID
    candidates: List[CandidateList]
    model_config = ConfigDict(from_attributes=True)
