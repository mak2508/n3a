from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class ClientInsight(BaseModel):
    id: str
    client_id: str
    category: str
    insight: str
    source_meeting_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Client(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    profession: Optional[str] = None
    relationship_type: str
    created_at: datetime
    updated_at: datetime
    insights: List[ClientInsight] = []

    class Config:
        from_attributes = True 