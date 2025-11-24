# Backend Services



The services layer contains the business logic for the Iudicium application. Each service handles a specific domain of functionality.

## Service Overview

| Service | Description |
|---------|-------------|
| `ai_service.py` | AI-powered candidate evaluation using Ollama |
| `candidate_service.py` | Candidate profile CRUD operations |
| `position_service.py` | Position/job management operations |
| `minio_service.py` | File storage operations with MinIO |
| `file_service.py` | File parsing and text extraction |
| `export_service.py` | Export profiles to multiple formats |
| `youcontrol_service.py` | External background check integration |

---

## ai_service.py

Orchestrates the AI-powered candidate evaluation workflow.

### Functions

#### `generate_answer(prompt, position_id, files, session)`
Main entry point for candidate profile generation.

**Flow:**
1. Extracts text from uploaded files using `file_service`
2. Retrieves position details from database
3. Constructs prompt with extracted text and position requirements
4. Sends prompt to Ollama API (Gemma 3 12B model)
5. Parses AI response as structured JSON profile
6. Uploads original files to MinIO
7. Saves `CandidateProfile` to database

**Returns:** `CandidateResponse` with generated profile and file metadata

---

## candidate_service.py

Handles candidate profile management.

### Functions

#### `get_all_candidates(session)`
Returns all candidate profiles from the database.

#### `get_candidate_by_id(candidate_id, session)`
Retrieves a single candidate by UUID. Raises `404` if not found.

#### `delete_candidate_by_id(candidate_id, session)`
Deletes a candidate and all associated files from both database and MinIO storage.

---

## position_service.py

Manages job positions used for candidate evaluation.

### Functions

#### `get_all_position(session)`
Returns all positions from the database.

#### `get_position_by_id(position_id, session)`
Retrieves a single position by UUID. Raises `404` if not found.

#### `create_position(position_create, session)`
Creates a new position with name and parameters (JSONB).

#### `delete_position_by_id(position_id, session)`
Deletes a position by UUID.

---

## minio_service.py

Handles file storage operations using MinIO (S3-compatible).

### Functions

#### `upload_files(files)`
Batch uploads files to MinIO. Returns tuple of successful uploads and errors.

#### `download_candidate_file(file_id, session)`
Downloads a file from MinIO by ID. Returns `StreamingResponse` with proper content-disposition headers.

#### `upload_candidate_file(candidate_id, file, session)`
Uploads a single file and associates it with an existing candidate.

#### `delete_candidate_file(file_id, session)`
Removes file from both MinIO storage and database.

---

## file_service.py

Handles file parsing and text extraction for AI processing.

### Supported File Types

| Type | Extensions | Processing |
|------|------------|------------|
| Text | `.txt`, `.csv`, `.md`, `.mermaid`, `.mmd` | UTF-8 decode |
| PDF | `.pdf` | PyMuPDF (fitz) text extraction |
| Word | `.docx` | python-docx paragraph extraction |
| JSON | `.json` | JSON parsing |

### Functions

#### `read_text(files)`
Processes multiple files and concatenates text content. Returns:
- `full_text`: Combined text from all files
- `read_files`: Successfully processed files
- `error_files`: Files that failed to process

#### `_get_file_extension(file)`
Detects file type using python-magic (libmagic) for security.

---

## export_service.py

Generates exportable reports from candidate profiles.

### Export Formats

| Format | Function | Output |
|--------|----------|--------|
| JSON | `_export_json()` | Pretty-printed JSON file |
| CSV | `_export_csv()` | Flattened CSV with headers |
| DOCX | `_export_docx()` | Word document from template |
| PDF | `_export_pdf()` | PDF from HTML template (WeasyPrint) |

### Functions

#### `export_candidate(candidate_id, format, session)`
Main export function. Retrieves candidate and delegates to format-specific exporter.

---

## youcontrol_service.py

Integrates with YouScore API for background verification checks.

### Checked Databases

**National Security:**
- SSU Wanted and Traitors
- NACP War and Sanctions
- General Prosecutor Feb 24 Suspects
- Myrotvorets Center
- RNBO Sanctions
- Global Sanctions Lists

**Law & Corruption:**
- Corrupted Persons Registry
- MVS Wanted/Missing Persons
- Lustrated Persons
- Court Cases to be Heard

**Conflict of Interest:**
- Related Persons (Companies & FOP)

### Functions

#### `check_candidate(surname, name, patronymic, birth_date)`
Performs parallel checks across all configured endpoints. Returns list of `CheckResult` objects where matches were found.

**Features:**
- Two-step queries for detailed data
- Birth date filtering to reduce false positives
- Concurrent execution for performance

---

## Dependencies

```
services/
├── ai_service.py      → file_service, minio_service, position_service
├── candidate_service.py → minio_service, file_service
├── export_service.py  → candidate_service
├── position_service.py → (none)
├── minio_service.py   → file_service
├── file_service.py    → (none)
└── youcontrol_service.py → (external API)
```
