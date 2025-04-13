import os
import tempfile
import sys

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from ..core.supabase import supabase
from ..core.storage import upload_file
from ..models.meeting import Meeting, SentimentEvent, MeetingUpdate
from ..serve.processor import process_audio

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
    # Constants
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    CHUNK_SIZE = 8192  # 8KB chunks
    BUCKET_NAME = "meeting-recordings"

    try:
        # Validate file type
        if not file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only audio files are allowed."
            )

        # Read file in chunks to handle large files
        file_size = 0
        content = bytearray()
        while chunk := await file.read(CHUNK_SIZE):
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail="File too large. Maximum size is 50MB"
                )
            content.extend(chunk)

        # Process audio file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            temp_file.write(bytes(content))
            temp_path = temp_file.name

        try:
            # Process audio and get analysis results
            analysis_results = process_audio(temp_path)
            dos = analysis_results.get("dos", [])
            donts = analysis_results.get("donts", [])

            # Upload to storage and get URL
            file_path = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
            try:
                supabase.storage.from_(BUCKET_NAME).upload(file_path, bytes(content))
                url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)
            except Exception as upload_error:
                print(f"Upload error: {upload_error}")
                url = None

            # Update meeting record
            update_data = {
                "updated_at": datetime.now().isoformat(),
                **({"audio_url": url} if url else {})
            }

            try:
                response = supabase.table("meetings").update(update_data).eq("id", meeting_id).execute()
                if not response.data:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Meeting with ID {meeting_id} not found"
                    )

                return JSONResponse(
                    status_code=200,
                    content={
                        "message": "Audio file processed successfully",
                        "meeting_id": meeting_id,
                        "url": url,
                        "analysis": {"dos": dos, "donts": donts}
                    }
                )
            except Exception as db_error:
                print(f"Database error: {db_error}")
                return JSONResponse(
                    status_code=207,  # Partial success
                    content={
                        "message": "Audio processed but database update failed",
                        "meeting_id": meeting_id,
                        "url": url,
                        "analysis": {"dos": dos, "donts": donts},
                        "error": str(db_error)
                    }
                )

        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    except HTTPException:
        raise  # Re-raise known HTTP exceptions
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )