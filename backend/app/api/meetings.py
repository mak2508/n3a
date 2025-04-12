from fastapi import APIRouter, HTTPException
from ..core.supabase import supabase
from ..models.meeting import Meeting, SentimentEvent
from typing import List

router = APIRouter()

@router.get("/meetings", response_model=List[Meeting])
async def get_meetings():
    try:
        # Fetch meetings
        meetings_response = await supabase.table("meetings").select("*").order("date", desc=True).execute()
        meetings = meetings_response.data

        # Fetch sentiment events
        sentiment_response = await supabase.table("sentiment_events").select("*").execute()
        sentiment_events = sentiment_response.data

        # Combine meetings with their sentiment events
        for meeting in meetings:
            meeting["sentiment_events"] = [
                SentimentEvent(
                    timestamp=event["timestamp"],
                    event=event["event"],
                    sentiment=event["sentiment"]
                )
                for event in sentiment_events
                if event["meeting_id"] == meeting["id"]
            ]

        return meetings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/meetings/{meeting_id}", response_model=Meeting)
async def get_meeting(meeting_id: str):
    try:
        # Fetch meeting
        meeting_response = await supabase.table("meetings").select("*").eq("id", meeting_id).single().execute()
        if not meeting_response.data:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        meeting = meeting_response.data

        # Fetch sentiment events for this meeting
        sentiment_response = await supabase.table("sentiment_events").select("*").eq("meeting_id", meeting_id).execute()
        meeting["sentiment_events"] = [
            SentimentEvent(
                timestamp=event["timestamp"],
                event=event["event"],
                sentiment=event["sentiment"]
            )
            for event in sentiment_response.data
        ]

        return meeting
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 