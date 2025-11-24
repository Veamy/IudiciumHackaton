# Backend API Layer

> **Location:** `backend/api/README.md`

The API layer contains FastAPI routers that expose HTTP endpoints for the Iudicium application.

## Router Overview

| Router | Prefix | Description |
|--------|--------|-------------|
| `ai_api.py` | `/api/v1/ai` | AI candidate evaluation |
| `candidate_api.py` | `/api/v1/candidate` | Candidate CRUD & export |
| `position_api.py` | `/api/v1/position` | Position management |
| `minio_api.py` | `/api/v1/minio` | File upload/download |

---

## ai_api.py

AI-powered candidate profile generation endpoint.

### Endpoints

#### `POST /api/v1/ai/generate`

Generates a candidate evaluation profile using AI.

**Request:**
- `prompt` (form): Optional additional context
- `position_id` (form): UUID of the position to evaluate against
- `files` (form): Multiple file uploads (PDF, DOCX, CSV, TXT, JSON)

**Response:** `CandidateResponse`
```json
{
  "id": "uuid",
  "profile": { /* AI-generated profile data */ },
  "position_id": "uuid",
  "files": [{ "id": "uuid", "file_name": "cv.pdf", ... }],
  "error_files": []
}
```

**Errors:**
- `422`: No candidate data could be extracted

---

## candidate_api.py

Candidate profile management endpoints.

### Endpoints

#### `GET /api/v1/candidate/get-all`

Returns list of all candidate profiles.

**Response:** `CandidateList`

---

#### `GET /api/v1/candidate/get/{candidate_id}`

Retrieves a single candidate profile by ID.

**Parameters:**
- `candidate_id` (path): UUID of the candidate

**Response:** `CandidateResponse`

**Errors:**
- `404`: Candidate not found

---

#### `DELETE /api/v1/candidate/delete/{candidate_id}`

Deletes a candidate and all associated files.

**Parameters:**
- `candidate_id` (path): UUID of the candidate

**Errors:**
- `404`: Candidate not found

---

#### `GET /api/v1/candidate/export/{candidate_id}`

Exports candidate profile to specified format.

**Parameters:**
- `candidate_id` (path): UUID of the candidate
- `format` (query): Export format (json, csv, docx, pdf)

**Response:** File download with appropriate content-type

**Errors:**
- `404`: Candidate not found or invalid format

---

## position_api.py

Position (job opening) management endpoints.

### Endpoints

#### `GET /api/v1/position/get-all`

Returns list of all positions.

**Response:** `PositionList`

---

#### `GET /api/v1/position/get/{position_id}`

Retrieves a single position by ID.

**Parameters:**
- `position_id` (path): UUID of the position

**Response:** `PositionResponse`

**Errors:**
- `404`: Position not found

---

#### `POST /api/v1/position/create`

Creates a new position.

**Request Body:** `PositionCreate`
```json
{
  "name": "Software Engineer",
  "parameters": {
    "requirements": ["3+ years experience", "Python proficiency"],
    "skills": ["Python", "FastAPI", "PostgreSQL"]
  }
}
```

**Response:** `PositionResponse`

---

#### `DELETE /api/v1/position/delete/{position_id}`

Deletes a position.

**Parameters:**
- `position_id` (path): UUID of the position

**Errors:**
- `404`: Position not found

---

## minio_api.py

File storage management endpoints.

### Endpoints

#### `POST /api/v1/minio/upload`

Uploads a file to MinIO storage.

**Request:**
- `file` (form): File to upload
- `candidate_id` (form): UUID of the candidate to associate with

**Response:** `FileResponse`

**Errors:**
- `404`: Candidate not found

---

#### `GET /api/v1/minio/download/{file_id}`

Downloads a file from MinIO storage.

**Parameters:**
- `file_id` (path): UUID of the file

**Response:** File download stream

**Errors:**
- `404`: File not found

---

#### `DELETE /api/v1/minio/delete/{file_id}`

Deletes a file from MinIO storage and database.

**Parameters:**
- `file_id` (path): UUID of the file

**Errors:**
- `404`: File not found

---

## Authentication

Currently, the API does not implement authentication. All endpoints are publicly accessible.

## Error Handling

All endpoints use standard HTTP status codes:
- `200`: Success
- `404`: Resource not found
- `415`: Unsupported media type (file uploads)
- `422`: Validation error or unprocessable entity
- `500`: Internal server error
