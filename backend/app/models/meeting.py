from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SentimentEvent(BaseModel):
    id: str
    meeting_id: str
    sentiment: str
    start_index: int
    end_index: int

class MeetingBase(BaseModel):
    client_name: str
    date: datetime
    meeting_type: str
    description: str
    audio_url: Optional[str] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    sentiment: Optional[int] = None

class MeetingCreate(MeetingBase):
    pass

class Meeting(MeetingBase):
    id: str
    created_at: datetime
    updated_at: datetime
    sentiment_events: List[SentimentEvent] = []

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

# New model for update operations
class MeetingUpdate(BaseModel):
    date: str  # Changed from datetime to str to match frontend
    meeting_type: str
    description: str

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        } 