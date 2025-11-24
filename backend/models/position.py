from uuid import uuid4

from sqlalchemy import Column, UUID, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from db.session import Base


class Position(Base):
    __tablename__ = 'position'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String)
    parameters = Column(JSONB, nullable=False)
    candidates = relationship("CandidateProfile", back_populates="position", lazy="selectin")