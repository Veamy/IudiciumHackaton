# Database Models


SQLAlchemy ORM models for the Iudicium application. Uses PostgreSQL with async support via `asyncpg`.

## Entity Relationship

```
Position (1) ──────── (N) CandidateProfile (1) ──────── (N) CandidateFile
```

---

## Position

Represents a job opening or role that candidates are evaluated against.

**Table:** `position`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique identifier |
| `name` | String | - | Position title |
| `parameters` | JSONB | NOT NULL | Requirements and evaluation criteria |

### Parameters JSONB Structure

```json
{
  "requirements": ["List of requirements"],
  "skills": ["Required skills"],
  "experience_level": "Senior/Mid/Junior",
  "department": "Department name"
}
```

### Relationships

- `candidates`: One-to-Many with `CandidateProfile` (lazy="selectin")

---

## CandidateProfile

Stores AI-generated candidate evaluation profiles.

**Table:** `candidate_profile`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique identifier |
| `profile` | JSONB | NOT NULL | AI-generated evaluation data |
| `position_id` | UUID | FK → position.id, SET NULL | Reference to evaluated position |

### Profile JSONB Structure

```json
{
  "candidate": {
    "full_name": "Name",
    "date_of_birth": "YYYY-MM-DD",
    "contacts": {
      "email": "...",
      "phone": "...",
      "location": "..."
    },
    "skills": [],
    "languages": [],
    "certifications": [],
    "education": [],
    "work_experience": [],
    "additional_info": ""
  },
  "evaluation": {
    "overall_profile_index": 0-100,
    "trust_score": 0-100,
    "integrity_score": 0-100,
    "leadership_maturity_score": 0-100,
    "relevance_to_position_score": 0-100
  },
  "position_relevance": {
    "overall_score": 0-100,
    "key_competencies_match": "",
    "experience_relevance": "",
    "responsibility_level_match": ""
  },
  "risk_analysis": {
    "notes": "",
    "competency_mismatch": false,
    "disciplinary_issues": false,
    "conflict_of_interest": false,
    "frequent_job_changes": false
  },
  "summary_conclusion": ""
}
```

### Properties

- `name`: Extracts `candidate.full_name` from profile JSONB, returns "Unknown" if not found

### Relationships

- `position`: Many-to-One with `Position`
- `files`: One-to-Many with `CandidateFile` (cascade="all, delete-orphan", lazy="selectin")

---

## CandidateFile

Metadata for files uploaded for candidate evaluation. Actual file content is stored in MinIO.

**Table:** `candidate_file`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique identifier (also used as MinIO object key) |
| `file_name` | String | - | Original filename |
| `content_type` | String | - | MIME type (e.g., "application/pdf") |
| `file_size` | Integer | - | File size in bytes |
| `candidate_id` | UUID | FK → candidate_profile.id, CASCADE | Reference to owner candidate |

### Relationships

- `candidate`: Many-to-One with `CandidateProfile`

---

## Database Session

The `db/session.py` module provides:

- `Base`: SQLAlchemy declarative base for all models
- `async_session_maker`: Async session factory for database operations
- `get_session`: Dependency injection function for FastAPI

### Configuration

Database connection is configured via environment variables:
- `DB_NAME`: Database name
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password

---

## Cascade Behavior

| Parent | Child | On Delete |
|--------|-------|-----------|
| Position | CandidateProfile | SET NULL (candidate remains, position_id becomes null) |
| CandidateProfile | CandidateFile | CASCADE (files deleted with candidate) |

When deleting a `CandidateProfile`, the service layer also removes associated files from MinIO storage.
