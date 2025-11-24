import json
import os
from io import BytesIO
from typing import List

import fitz
import magic
from docx import Document
from fastapi import UploadFile, HTTPException

from models.candidate_file import CandidateFile
from schemas.file_schemas import FileError

ALLOWED_BINARY_TYPES = {
    "application/pdf": ".pdf",
    "application/json": ".json",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx"
}

ALLOWED_TEXT_EXTENSIONS = {".txt", ".csv", ".mermaid", ".mmd", ".md", ".json"}


async def _process_file(file: UploadFile):
    file_extension = await _get_file_extension(file)
    content = await file.read()
    match file_extension:
        case ".txt" | ".csv" | ".mermaid" | ".mmd" | ".md":
            text = content.decode("utf-8")
            return text
        case ".pdf":
            doc = fitz.open(stream=content, filetype="pdf")
            text = "\n".join(page.get_text() for page in doc)
            return text
        case ".json":
            text = json.loads(content)
            return text
        case ".docx":
            doc = Document(BytesIO(content))
            text = "\n".join(p.text for p in doc.paragraphs)
            return text
        case _:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type: {file_extension}"
            )


async def _get_file_extension(file: UploadFile):
    await file.seek(0)
    initial_content = await file.read(2048)
    await file.seek(0)

    real_mime = magic.from_buffer(initial_content, mime=True)
    print(f"Debug: MIME detected: {real_mime}")

    if real_mime == "application/zip":
        filename = file.filename
        if filename.endswith(".docx"):
            return ".docx"

    if real_mime in ALLOWED_BINARY_TYPES:
        return ALLOWED_BINARY_TYPES[real_mime]

    if real_mime.startswith("text/"):
        filename = file.filename
        _, ext = os.path.splitext(filename)
        ext = ext.lower()

        if ext in ALLOWED_TEXT_EXTENSIONS:
            return ext

    raise HTTPException(
        status_code=415,
        detail=f"Unsupported file type: {real_mime}"
    )

def get_file_extension_minio(file: CandidateFile):
    if file.content_type.startswith("text/"):
        filename = file.file_name
        _, ext = os.path.splitext(filename)
        ext = ext.lower()
    else:
        ext = ALLOWED_BINARY_TYPES[file.content_type]
    return ext

async def read_text(files: List[UploadFile]):
    full_text = ""
    read_files = []
    error_files = []

    for i, file in enumerate(files):
        try:
            text = await _process_file(file)
            full_text += f"{i}: {text}\n"

            await file.seek(0)
            read_files.append(file)
        except:
            error_file = FileError(file_name=file.filename, reason="Unreadable text")
            error_files.append(error_file)

    return full_text, read_files, error_files