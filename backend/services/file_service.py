import json
import os
from asyncio import to_thread
from io import BytesIO
from typing import List

import fitz
import magic
from docx import Document
from fastapi import UploadFile, HTTPException

from core.config import settings
from models.candidate_file import CandidateFile
from object_storage.minio_client import minio_client
from schemas.file_schemas import FileError

ALLOWED_BINARY_TYPES = {
    "application/pdf": ".pdf",
    "application/json": ".json",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx"
}

ALLOWED_TEXT_EXTENSIONS = {".txt", ".csv", ".mermaid", ".mmd", ".md", ".json"}


async def _process_file(content: bytes, filename: str, content_type = None):
    if content_type is None:
        content_type = _get_real_mime_type(content, filename)
    match content_type:
        case _ if content_type.startswith("text/"):
            text = content.decode("utf-8")
            return text
        case "application/pdf":
            doc = fitz.open(stream=content, filetype="pdf")
            text = "\n".join(page.get_text() for page in doc)
            return text
        case "application/json":
            text = json.loads(content)
            return text
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            doc = Document(BytesIO(content))
            text = "\n".join(p.text for p in doc.paragraphs)
            return text
        case _:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type: {content_type}"
            )


def _get_real_mime_type(content: bytes, filename: str):
    real_mime = magic.from_buffer(content[:2048], mime=True)
    print(f"Debug: MIME detected: {real_mime}")
    if real_mime == "application/zip":
        filename = filename
        if filename.endswith(".docx"):
            real_mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    return real_mime

async def _get_file_extension(content: bytes, filename: str):
    real_mime = _get_real_mime_type(content, filename)

    if real_mime in ALLOWED_BINARY_TYPES:
        return ALLOWED_BINARY_TYPES[real_mime]

    if real_mime.startswith("text/"):
        filename = filename
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


async def read_files(files: List[UploadFile]):
    full_text = ""
    processed_files = []
    error_files = []

    for i, file in enumerate(files):
        try:
            content = await file.read()
            text = await _process_file(content, file.filename)
            full_text += f"{i}: {text}\n"

            await file.seek(0)
            processed_files.append(file)
        except:
            error_file = FileError(file_name=file.filename, reason="Unreadable text")
            error_files.append(error_file)

    return full_text, processed_files, error_files


async def read_files_from_minio(files: List[CandidateFile]):
    full_text = ""
    processed_files = []
    error_files = []

    for i, file in enumerate(files):
        ext = get_file_extension_minio(file)
        minio_file = await to_thread(minio_client.get_object,settings.MINIO_BUCKET, str(file.id) + ext)
        try:
            content = minio_file.read()
            text = await _process_file(content, file.file_name, file.content_type)
            full_text += f"{i}: {text}\n"

            processed_files.append(file)
        except:
            error_file = FileError(file_name=file.file_name, reason="Unreadable text")
            error_files.append(error_file)

    return full_text, processed_files, error_files



