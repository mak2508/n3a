from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from ..core.supabase import supabase
from ..core.storage import upload_file
from ..models.meeting import Meeting, SentimentEvent, MeetingUpdate
from typing import List, Optional
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

@router.post("/meetings/{meeting_id}/upload-audio")
async def upload_meeting_audio(meeting_id: str, file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only audio files are allowed."
            )

        # Validate file size (50MB limit)
        file_size = 0
        content = bytearray()
        
        # Read the file in chunks to handle large files
        while chunk := await file.read(8192):  # 8KB chunks
            file_size += len(chunk)
            content.extend(chunk)
            if file_size > 50 * 1024 * 1024:  # 50MB
                raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB")

        # Upload the audio file
        url = await upload_file(
            file_content=bytes(content),
            filename=file.filename,
            content_type=file.content_type
        )

        response = supabase.table("meetings").update({
            "audio_url": url,
            "updated_at": datetime.now().isoformat()
        }).eq("id", meeting_id).execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail=f"Meeting with ID {meeting_id} not found"
            )

        return JSONResponse(
            status_code=200,
            content={
                "message": "Audio file uploaded and meeting updated successfully",
                "meeting_id": meeting_id,
                "url": url
            }
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")