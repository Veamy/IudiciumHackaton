from uuid import uuid4

from sqlalchemy import Column, UUID, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from db.session import Base


class CandidateFile(Base):
    __tablename__ = 'candidate_file'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    file_name = Column(String)
    content_type = Column(String)
    file_size = Column(Integer)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidate_profile.id', ondelete="CASCADE"), nullable=True)
    candidate = relationship("CandidateProfile", back_populates="files")