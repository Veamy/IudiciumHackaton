# Iudicium Architecture Documentation

> **Location:** `docs/ARCHITECTURE.md`

This document provides a comprehensive overview of the Iudicium system architecture, including database schema, component relationships, and data flow diagrams.

## Table of Contents

- [Database ERD](#database-erd)
- [System Architecture](#system-architecture)
- [Backend Component Diagram](#backend-component-diagram)
- [Frontend Component Diagram](#frontend-component-diagram)
- [Data Flow Diagram](#data-flow-diagram)
- [API Architecture](#api-architecture)

---

## Database ERD

```mermaid
erDiagram
    Position ||--o{ CandidateProfile : "has many"
    CandidateProfile ||--o{ CandidateFile : "has many"

    Position {
        UUID id PK "Primary key, auto-generated"
        String name "Position/job title"
        JSONB parameters "Position requirements and criteria"
    }

    CandidateProfile {
        UUID id PK "Primary key, auto-generated"
        JSONB profile "AI-generated candidate evaluation"
        UUID position_id FK "Reference to Position (SET NULL on delete)"
    }

    CandidateFile {
        UUID id PK "Primary key, auto-generated"
        String file_name "Original filename"
        String content_type "MIME type"
        Integer file_size "Size in bytes"
        UUID candidate_id FK "Reference to CandidateProfile (CASCADE on delete)"
    }
```

### Profile JSONB Structure

The `profile` field in `CandidateProfile` contains a structured JSON document:

```mermaid
classDiagram
    class CandidateProfileJSON {
        +Candidate candidate
        +Education education
        +Experience experience
        +Evaluation evaluation
        +RiskAnalysis risk_analysis
        +String conclusion
    }

    class Candidate {
        +String full_name
        +String date_of_birth
        +String contact_info
    }

    class Education {
        +List~Degree~ degrees
        +List~String~ certifications
    }

    class Experience {
        +List~Job~ work_history
        +Integer total_years
    }

    class Evaluation {
        +Float trust_score
        +Float integrity_score
        +Float leadership_score
        +Float position_relevance
    }

    class RiskAnalysis {
        +List~String~ conflicts_of_interest
        +List~String~ competency_gaps
        +List~String~ red_flags
    }

    CandidateProfileJSON --> Candidate
    CandidateProfileJSON --> Education
    CandidateProfileJSON --> Experience
    CandidateProfileJSON --> Evaluation
    CandidateProfileJSON --> RiskAnalysis
```

### Position Parameters JSONB Structure

```mermaid
classDiagram
    class PositionParameters {
        +List~Requirement~ requirements
        +List~String~ skills
        +String experience_level
        +String department
    }

    class Requirement {
        +String name
        +String description
        +Boolean mandatory
    }

    PositionParameters --> Requirement
```

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Web Browser"]
    end

    subgraph Frontend["Frontend (React + Vite)"]
        ReactApp["React Application"]
        Router["React Router"]
        I18n["i18next"]
        AxiosClient["Axios HTTP Client"]
    end

    subgraph Backend["Backend (FastAPI)"]
        API["API Layer"]
        Services["Service Layer"]
        Models["ORM Models"]
    end

    subgraph External["External Services"]
        Ollama["Ollama API\n(Gemma 3 12B)"]
        YouScore["YouScore API\n(Background Checks)"]
    end

    subgraph Storage["Data Storage"]
        PostgreSQL["PostgreSQL 17\n(Database)"]
        MinIO["MinIO\n(Object Storage)"]
    end

    Browser <--> ReactApp
    ReactApp --> Router
    ReactApp --> I18n
    ReactApp <--> AxiosClient
    AxiosClient <--> API
    API <--> Services
    Services <--> Models
    Models <--> PostgreSQL
    Services <--> MinIO
    Services <--> Ollama
    Services <--> YouScore

    style Client fill:#e1f5fe
    style Frontend fill:#fff3e0
    style Backend fill:#e8f5e9
    style External fill:#fce4ec
    style Storage fill:#f3e5f5
```

---

## Backend Component Diagram

```mermaid
flowchart TB
    subgraph API["API Layer (Routers)"]
        AIApi["ai_api.py\n/api/v1/ai/*"]
        CandidateApi["candidate_api.py\n/api/v1/candidate/*"]
        PositionApi["position_api.py\n/api/v1/position/*"]
        MinioApi["minio_api.py\n/api/v1/minio/*"]
    end

    subgraph Services["Service Layer"]
        AIService["ai_service.py"]
        CandidateService["candidate_service.py"]
        PositionService["position_service.py"]
        MinioService["minio_service.py"]
        FileService["file_service.py"]
        ExportService["export_service.py"]
        YouControlService["youcontrol_service.py"]
    end

    subgraph Models["Data Models"]
        Position["Position"]
        CandidateProfile["CandidateProfile"]
        CandidateFile["CandidateFile"]
    end

    subgraph Core["Core Configuration"]
        Config["config.py"]
        CORS["cors.py"]
        Lifespan["lifespan.py"]
        Prompt["prompt.py"]
    end

    subgraph Schemas["Pydantic Schemas"]
        AISchemas["ai_schemas.py"]
        CandidateSchemas["candidate_schemas.py"]
        PositionSchemas["position_schemas.py"]
        FileSchemas["file_schemas.py"]
        ExportFormat["export_format.py"]
    end

    AIApi --> AIService
    CandidateApi --> CandidateService
    PositionApi --> PositionService
    MinioApi --> MinioService

    AIService --> FileService
    AIService --> MinioService
    AIService --> PositionService
    CandidateService --> MinioService
    CandidateService --> ExportService

    AIService --> CandidateProfile
    CandidateService --> CandidateProfile
    CandidateService --> CandidateFile
    PositionService --> Position
    MinioService --> CandidateFile

    Services --> Core
    API --> Schemas
    Services --> Schemas
```

---

## Frontend Component Diagram

```mermaid
flowchart TB
    subgraph App["Application Root"]
        Main["main.tsx"]
        AppComponent["App.tsx"]
        AppRoutes["AppRoutes.tsx"]
    end

    subgraph Pages["Pages"]
        HomePage["HomePage"]
        InfoPage["InfoPage"]
    end

    subgraph InfoPageViews["InfoPage Views"]
        LeftBar["LeftBar"]
        ProfileView["ProfileView"]
        PositionView["PositionView"]
        NewProfileCreateView["NewProfileCreateView"]
        NewPositionCreateView["NewPositionCreateView"]
    end

    subgraph Components["Reusable Components"]
        subgraph Buttons["Buttons"]
            ButtonC1["ButtonC1"]
            ButtonC2["ButtonC2"]
            ButtonDownloadFile["ButtonDownloadFile"]
        end
        subgraph Forms["Form Components"]
            InputBlock["InputBlock"]
            UploadFileButton["UploadFileButton"]
            PositionParameterFormView["PositionParameterFormView"]
        end
        subgraph Display["Display Components"]
            ItemList["ItemList"]
            ItemLink["ItemLink"]
            UploadedFileListView["UploadedFileListView"]
            PositionChoiseListView["PositionChoiseListView"]
            SectionHeader["SectionHeader"]
        end
        subgraph Navigation["Navigation"]
            LanguageSwitcher["LanguageSwitcher"]
            CustomNavbar["CustomNavbar"]
        end
    end

    subgraph Utilities["Utilities"]
        Client["client.ts\n(Axios)"]
        I18n["i18n/index.tsx"]
        Types["types/*"]
        Env["env.ts"]
    end

    Main --> AppComponent
    AppComponent --> AppRoutes
    AppComponent --> CustomNavbar
    AppRoutes --> HomePage
    AppRoutes --> InfoPage

    InfoPage --> LeftBar
    InfoPage --> ProfileView
    InfoPage --> PositionView
    InfoPage --> NewProfileCreateView
    InfoPage --> NewPositionCreateView

    LeftBar --> ItemList
    LeftBar --> ButtonC1

    ProfileView --> ButtonDownloadFile
    ProfileView --> SectionHeader

    NewProfileCreateView --> UploadFileButton
    NewProfileCreateView --> PositionChoiseListView
    NewProfileCreateView --> UploadedFileListView
    NewProfileCreateView --> ButtonC1

    NewPositionCreateView --> PositionParameterFormView
    NewPositionCreateView --> InputBlock
    NewPositionCreateView --> ButtonC1

    ItemList --> ItemLink

    CustomNavbar --> LanguageSwitcher
```

---

## Data Flow Diagram

### Candidate Evaluation Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend
    participant API as FastAPI
    participant AI as AI Service
    participant FS as File Service
    participant MS as MinIO Service
    participant OL as Ollama API
    participant DB as PostgreSQL
    participant S3 as MinIO Storage

    U->>FE: Upload files + Select position
    FE->>API: POST /api/v1/ai/generate
    API->>AI: generate_answer()
    AI->>FS: read_text(files)
    FS-->>AI: Extracted text content
    AI->>DB: Get position details
    DB-->>AI: Position with parameters
    AI->>OL: POST /api/generate (prompt)
    OL-->>AI: AI-generated profile JSON
    AI->>MS: upload_files()
    MS->>S3: Store files
    S3-->>MS: File URLs
    MS-->>AI: CandidateFile objects
    AI->>DB: Save CandidateProfile
    DB-->>AI: Saved profile
    AI-->>API: CandidateResponse
    API-->>FE: JSON response
    FE-->>U: Display profile
```

### Position Creation Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend
    participant API as FastAPI
    participant PS as Position Service
    participant DB as PostgreSQL

    U->>FE: Fill position form
    FE->>API: POST /api/v1/position/create
    API->>PS: create_position()
    PS->>DB: INSERT Position
    DB-->>PS: Created Position
    PS-->>API: PositionResponse
    API-->>FE: JSON response
    FE-->>U: Navigate to position view
```

### Export Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant FE as Frontend
    participant API as FastAPI
    participant CS as Candidate Service
    participant ES as Export Service
    participant DB as PostgreSQL

    U->>FE: Click export button
    FE->>API: GET /api/v1/candidate/export/{id}?format=pdf
    API->>CS: export_candidate()
    CS->>DB: Get CandidateProfile
    DB-->>CS: Profile data
    CS->>ES: export_to_format()
    ES-->>CS: Generated file (PDF/DOCX/CSV/JSON)
    CS-->>API: StreamingResponse
    API-->>FE: File download
    FE-->>U: Save file
```

---

## API Architecture

```mermaid
flowchart LR
    subgraph Endpoints["API Endpoints"]
        subgraph AI["/api/v1/ai"]
            AIGenerate["POST /generate"]
        end

        subgraph Candidate["/api/v1/candidate"]
            CandGetAll["GET /get-all"]
            CandGet["GET /get/{id}"]
            CandDelete["DELETE /delete/{id}"]
            CandExport["GET /export/{id}"]
        end

        subgraph Position["/api/v1/position"]
            PosGetAll["GET /get-all"]
            PosGet["GET /get/{id}"]
            PosCreate["POST /create"]
            PosDelete["DELETE /delete/{id}"]
        end

        subgraph MinIO["/api/v1/minio"]
            FileUpload["POST /upload"]
            FileDownload["GET /download/{id}"]
            FileDelete["DELETE /delete/{id}"]
        end
    end

    AIGenerate --> |"Files + Position"| CandidateProfile
    CandExport --> |"format param"| ExportFormats

    subgraph ExportFormats["Export Formats"]
        JSON["JSON"]
        CSV["CSV"]
        DOCX["DOCX"]
        PDF["PDF"]
    end

    subgraph CandidateProfile["Response"]
        Profile["CandidateResponse"]
    end
```

---

## Technology Stack

```mermaid
mindmap
    root((Iudicium))
        Frontend
            React 19
            TypeScript
            Vite
            Bootstrap 5
            i18next
            Axios
        Backend
            Python
            FastAPI
            SQLAlchemy
            Pydantic
            httpx
        Database
            PostgreSQL 17
            JSONB
        Storage
            MinIO
            S3-compatible
        AI
            Ollama
            Gemma 3 12B
        External
            YouScore API
        DevOps
            Docker
            Docker Compose
            Nginx
```

---

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Docker["Docker Compose Environment"]
        subgraph FrontendContainer["Frontend Container"]
            Nginx["Nginx"]
            ReactBuild["React Build"]
        end

        subgraph BackendContainer["Backend Container"]
            Uvicorn["Uvicorn"]
            FastAPIApp["FastAPI App"]
        end

        subgraph DBContainer["Database Container"]
            PG["PostgreSQL 17"]
        end

        subgraph StorageContainer["Storage Container"]
            MinIOServer["MinIO Server"]
        end
    end

    subgraph External["External Services"]
        OllamaServer["Ollama Server\n(localhost:1234)"]
        YouScoreAPI["YouScore API\n(api.youscore.com.ua)"]
    end

    Client["Browser"] --> Nginx
    Nginx --> |"API Proxy"| Uvicorn
    Nginx --> |"Static Files"| ReactBuild
    Uvicorn --> PG
    Uvicorn --> MinIOServer
    Uvicorn --> OllamaServer
    Uvicorn --> YouScoreAPI

    Nginx -.-> |"Port 3000"| Client
    Uvicorn -.-> |"Port 8000"| Nginx
    PG -.-> |"Port 5432"| Uvicorn
    MinIOServer -.-> |"Port 9000"| Uvicorn
```
