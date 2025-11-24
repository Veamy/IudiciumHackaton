import csv
import json
from io import BytesIO, StringIO
from urllib.parse import quote
from uuid import UUID

from docxtpl import DocxTemplate
from fastapi import HTTPException
from jinja2 import Template
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import StreamingResponse
from weasyprint import HTML

from models.candidate_profile import CandidateProfile
from schemas.candidate_schemas import CandidateResponse
from schemas.export_format import ExportFormat
from services.candidate_service import get_candidate_by_id


async def export_candidate(candidate_id: UUID, format: ExportFormat, session: AsyncSession):
    candidate = await get_candidate_by_id(candidate_id, session)
    match format:
        case ExportFormat.JSON:
            return _export_json(candidate)
        case ExportFormat.CSV:
            return _export_csv(candidate)
        case ExportFormat.DOCX:
            return _export_docx(candidate)
        case ExportFormat.PDF:
            return _export_pdf(candidate)
        case _:
            raise HTTPException(status_code=404, detail="Invalid export format")


def _export_json(candidate: CandidateProfile):
    candidate_response = CandidateResponse.model_validate(candidate)
    profile_json = json.dumps(candidate_response.profile, indent=4, ensure_ascii=False)
    file_stream = BytesIO(profile_json.encode("utf-8"))

    try:
        full_name = candidate.profile.get("candidate", {}).get("full_name", "candidate")
    except AttributeError:
        full_name = "candidate"

    filename = f"{full_name.replace(' ', '_')}.json"
    content_type = "application/json"

    return _create_file_response(file_stream, filename, content_type)


def _export_csv(candidate: CandidateProfile):
    candidate = CandidateResponse.model_validate(candidate).model_dump()

    flat_data = _flatten_json_for_csv(candidate["profile"])

    text_buffer = StringIO()
    writer = csv.DictWriter(text_buffer, fieldnames=flat_data.keys())
    writer.writeheader()
    writer.writerow(flat_data)

    byte_content = text_buffer.getvalue().encode("utf-8-sig")
    file_stream = BytesIO(byte_content)
    full_name = candidate['profile'].get("candidate", {}).get("full_name", "candidate")
    filename = f"{full_name.replace(' ', '_')}.csv"
    content_type = "text/csv"
    return _create_file_response(file_stream, filename, content_type)


def _export_docx(candidate: CandidateProfile):
    candidate = CandidateResponse.model_validate(candidate).model_dump()

    context = _prepare_full_context(candidate)

    template_path = "template/candidate_template_docx.docx"
    doc = DocxTemplate(template_path)

    doc.render(context)

    file_stream = BytesIO()
    doc.save(file_stream)

    filename = f"{context["candidate"]["full_name"].replace(' ', '_')}.docx"
    content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    return _create_file_response(file_stream, filename, content_type)


def _export_pdf(candidate: CandidateProfile):
    candidate = CandidateResponse.model_validate(candidate).model_dump()
    context = _prepare_full_context(candidate)

    with open("template/candidate_template_pdf.html", "r", encoding="utf-8") as f:
        template_content = f.read()

    template = Template(template_content)
    html_rendered = template.render(context)

    file_stream = BytesIO()
    HTML(string=html_rendered).write_pdf(file_stream)

    filename = f"{context["candidate"]["full_name"].replace(' ', '_')}.pdf"
    content_type = "application/pdf"

    return _create_file_response(file_stream, filename, content_type)


def _flatten_json_for_csv(data: dict, parent_key: str = '', sep: str = '_') -> dict:
    items = []
    for k, v in data.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k

        if isinstance(v, dict):
            items.extend(_flatten_json_for_csv(v, new_key, sep=sep).items())


        elif isinstance(v, list):

            if v and isinstance(v[0], dict):
                formatted_items = []

                for item in v:
                    if "company" in item:

                        formatted_items.append(f"{item.get('company')} ({item.get('position')})")
                    elif "institution" in item:

                        formatted_items.append(f"{item.get('institution')} - {item.get('degree')}")

                    elif "file_name" in item:

                        formatted_items.append(item.get("file_name"))
                    else:

                        formatted_items.append(" ".join(str(x) for x in item.values()))

                items.append((new_key, "; ".join(formatted_items)))

            else:
                items.append((new_key, ", ".join(map(str, v))))

        else:
            items.append((new_key, v))

    return dict(items)


def _prepare_full_context(candidate_data: dict) -> dict:
    src = candidate_data.get("profile", {})

    cand_src = src.get("candidate", {})
    contacts_src = cand_src.get("contacts", {})

    context = {
        "candidate": {
            "full_name": cand_src.get("full_name", "Невідомий кандидат"),
            "date_of_birth": cand_src.get("date_of_birth", "-"),

            "contacts": {
                "email": contacts_src.get("email", "-"),
                "phone": contacts_src.get("phone", "-"),
                "location": contacts_src.get("location", "-"),
            },

            "skills": cand_src.get("skills", []),
            "languages": cand_src.get("languages", []),
            "certifications": cand_src.get("certifications", []),

            "additional_info": cand_src.get("additional_info", ""),

            "education": cand_src.get("education", []),
            "work_experience": cand_src.get("work_experience", []),
        },

        "evaluation": {
            "overall_profile_index": src.get("evaluation", {}).get("overall_profile_index", 0),
            "trust_score": src.get("evaluation", {}).get("trust_score", 0),
            "integrity_score": src.get("evaluation", {}).get("integrity_score", 0),
            "leadership_maturity_score": src.get("evaluation", {}).get("leadership_maturity_score", 0),
            "relevance_to_position_score": src.get("evaluation", {}).get("relevance_to_position_score", 0),
        },

        "position_relevance": {
            "overall_score": src.get("position_relevance", {}).get("overall_score", 0),
            "key_competencies_match": src.get("position_relevance", {}).get("key_competencies_match", ""),
            "experience_relevance": src.get("position_relevance", {}).get("experience_relevance", ""),
            "responsibility_level_match": src.get("position_relevance", {}).get("responsibility_level_match", ""),
        },

        "risk_analysis": {
            "notes": src.get("risk_analysis", {}).get("notes", ""),
            "competency_mismatch": src.get("risk_analysis", {}).get("competency_mismatch", False),
            "disciplinary_issues": src.get("risk_analysis", {}).get("disciplinary_issues", False),
            "conflict_of_interest": src.get("risk_analysis", {}).get("conflict_of_interest", False),
            "frequent_job_changes": src.get("risk_analysis", {}).get("frequent_job_changes", False),
        },

        "summary_conclusion": src.get("summary_conclusion", "")
    }

    return context


def _create_file_response(file_stream: BytesIO, filename: str, media_type: str) -> StreamingResponse:
    file_stream.seek(0)
    filename_encoded = quote(filename)
    return StreamingResponse(file_stream, media_type=media_type,
                             headers={"Content-Disposition": f"attachment; filename*=utf-8''{filename_encoded}"})
