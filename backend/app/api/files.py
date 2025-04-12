from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from ..core.supabase import supabase
import os
from datetime import datetime

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        
        # Upload file to Supabase storage
        file_content = await file.read()
        response = await supabase.storage.from_("meetings").upload(filename, file_content)
        
        # Get the public URL of the uploaded file
        url = supabase.storage.from_("meetings").get_public_url(filename)
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "File uploaded successfully",
                "filename": filename,
                "url": url
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 