from pydantic import BaseModel
from typing import List, Optional

class ParsedResumeSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    experience_years: Optional[float] = 0.0
    summary: str
    