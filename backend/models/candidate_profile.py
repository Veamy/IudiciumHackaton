from uuid import uuid4

from sqlalchemy import Column, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from db.session import Base


class CandidateProfile(Base):
    __tablename__ = 'candidate_profile'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    profile = Column(JSONB, nullable=False)
    position_id = Column(UUID(as_uuid=True), ForeignKey('position.id', ondelete="SET NULL"), nullable=True)
    position = relationship("Position", back_populates="candidates")
    files = relationship("CandidateFile", back_populates="candidate", cascade="all, delete-orphan",lazy="selectin")

    @property
    def name(self) -> str:
        try:
            return self.profile.get("candidate", {}).get("full_name", "Unknown")
        except (AttributeError, TypeError):
            return "Unknown"