from pydantic import BaseModel


class CheckResult(BaseModel):
    source_name: str
    match_found: bool
    details_count: int
    raw_data: list
