from fastapi import APIRouter, HTTPException
from ..core.supabase import supabase
from ..models.meeting import Meeting, SentimentEvent, MeetingUpdate
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/meetings", response_model=List[Meeting])
async def get_meetings():
    try:
        # Fetch meetings
        meetings_response = supabase.table("meetings").select("*").order("date", desc=True).execute()
        meetings = meetings_response.data

        print(f"Meetings: {meetings}")
        # Fetch sentiment events
        sentiment_response = supabase.table("sentiment_events").select("*").execute()
        sentiment_events = sentiment_response.data

        print(f"Sentiment events: {sentiment_events}")

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
        print(f"Error in get_meetings: {str(e)}")  # Add debug logging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/meetings/{meeting_id}", response_model=Meeting)
async def get_meeting(meeting_id: str):
    try:
        # Fetch meeting
        meeting_response = supabase.table("meetings").select("*").eq("id", meeting_id).single().execute()
        if not meeting_response.data:
            raise HTTPException(status_code=404, detail="Meeting not found")
        
        meeting = meeting_response.data

        # Fetch sentiment events for this meeting
        sentiment_response = supabase.table("sentiment_events").select("*").eq("meeting_id", meeting_id).execute()
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
        print(f"Error in get_meeting: {str(e)}")  # Add debug logging
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/meetings/{meeting_id}", response_model=Meeting)
async def update_meeting(meeting_id: str, meeting_update: MeetingUpdate):
    try:
        # First check if meeting exists
        meeting_response = supabase.table("meetings").select("*").eq("id", meeting_id).single().execute()
        if not meeting_response.data:
            raise HTTPException(status_code=404, detail="Meeting not found")

        # Parse the date string to ensure it's valid
        try:
            parsed_date = datetime.fromisoformat(meeting_update.date.replace('Z', '+00:00'))
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")

        # Update the meeting
        update_response = supabase.table("meetings").update({
            "date": parsed_date.isoformat(),  # Convert back to ISO string for Supabase
            "meeting_type": meeting_update.meeting_type,
            "description": meeting_update.description,
            "updated_at": "now()"  # Supabase will convert this to the current timestamp
        }).eq("id", meeting_id).execute()

        if not update_response.data:
            raise HTTPException(status_code=500, detail="Failed to update meeting")

        updated_meeting = update_response.data[0]

        # Fetch sentiment events for this meeting to include in response
        sentiment_response = supabase.table("sentiment_events").select("*").eq("meeting_id", meeting_id).execute()
        updated_meeting["sentiment_events"] = [
            SentimentEvent(
                timestamp=event["timestamp"],
                event=event["event"],
                sentiment=event["sentiment"]
            )
            for event in sentiment_response.data
        ]

        return updated_meeting
    except Exception as e:
        print(f"Error in update_meeting: {str(e)}")  # Add debug logging
        raise HTTPException(status_code=500, detail=str(e)) 