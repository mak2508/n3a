from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SentimentEvent(BaseModel):
    timestamp: str
    event: str
    sentiment: int

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