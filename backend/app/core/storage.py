from fastapi import HTTPException
from ..core.supabase import supabase
from datetime import datetime

async def upload_file(file_content: bytes, filename: str, content_type: str, bucket: str = "meeting-recordings") -> str:
    """
    Upload a file to Supabase storage and return its public URL.
    
    Args:
        file_content: The file content as bytes
        filename: The original filename
        content_type: The MIME type of the file
        bucket: The storage bucket name (default: "meeting-recordings")
        
    Returns:
        str: The public URL of the uploaded file
        
    Raises:
        HTTPException: If the upload fails
    """
    try:
        if not supabase:
            raise HTTPException(
                status_code=500, 
                detail="Storage operations not available - missing service role key"
            )

        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        print(f"Attempting to upload file: {unique_filename}")

        # Upload file to Supabase storage
        response = supabase.storage.from_(bucket).upload(
            path=unique_filename,
            file=file_content,
            file_options={"contentType": content_type}
        )
        print(f"Upload response: {response}")
        
        # Check if the upload was successful
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to upload file to storage. Status code: {response.status_code}"
            )
        
        # Get the public URL of the uploaded file
        url = supabase.storage.from_(bucket).get_public_url(unique_filename)
        print(f"Generated public URL: {url}")
        
        if not url:
            raise HTTPException(status_code=500, detail="Failed to generate public URL")
        
        return url
        
    except Exception as e:
        print(f"Storage error details: {str(e)}")
        if "bucket not found" in str(e).lower():
            raise HTTPException(
                status_code=500,
                detail=f"Storage bucket '{bucket}' not found. Please check Supabase configuration."
            )
        elif "permission denied" in str(e).lower():
            raise HTTPException(
                status_code=500,
                detail="Permission denied. Please check Supabase storage policies."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Storage error: {str(e)}"
            ) 