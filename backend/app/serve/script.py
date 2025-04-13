#!/usr/bin/env python
# File: index_client_transcripts.py
"""
Script to index all meeting transcripts for a specific client in the GraphRAG system.
This retrieves all meetings for a given client ID, extracts their transcripts,
and adds them to the RAG indexing system for future retrieval.
"""

import os
import sys
import tempfile
import argparse
from datetime import datetime
from typing import List, Optional

# Add the parent directory to sys.path to enable absolute imports
# This assumes the script is in the /Users/pac/Documents/n3a/backend/app/serve/ directory
current_dir = os.path.dirname(os.path.abspath(__file__))
app_dir = os.path.abspath(os.path.join(current_dir, '..'))
sys.path.insert(0, app_dir)

# Import with absolute paths considering the app directory as the base
from serve.graphRag import GraphRAGIndexer
from core.supabase import supabase

def get_client_meetings(client_id: str) -> List[dict]:
    """
    Fetches all meetings for a specific client using the Supabase client.
    
    Args:
        client_id (str): The ID of the client
        
    Returns:
        List[dict]: List of meeting data for the client
    """
    try:
        # Fetch meetings for the specific client with client name through foreign key
        meetings_response = supabase.table("meetings") \
            .select("*, clients!inner(name)") \
            .eq("client_id", client_id) \
            .order("date", desc=True) \
            .execute()
        
        meetings = meetings_response.data
        
        # Process the response to match our model
        processed_meetings = []
        for meeting in meetings:
            processed_meeting = {
                **meeting,
                "client_name": meeting["clients"]["name"]
            }
            del processed_meeting["clients"]
            processed_meetings.append(processed_meeting)
        
        print(f"Found {len(processed_meetings)} meetings for client ID {client_id}")
        return processed_meetings
    except Exception as e:
        print(f"Error fetching meetings: {str(e)}")
        return []

def index_client_transcripts(client_id: str) -> None:
    """
    Fetches all meetings for a client, extracts transcripts, and indexes them in the RAG system.
    
    Args:
        client_id (str): The ID of the client
    """
    # Fetch meetings for the client
    meetings = get_client_meetings(client_id)
    
    if not meetings:
        print(f"No meetings found for client ID {client_id}")
        return
    
    # Get the client name from the first meeting
    client_name = meetings[0].get("client_name", "Unknown Client")
    client_description = f"Client named {client_name}"
    
    # Initialize the RAG indexer
    indexer = GraphRAGIndexer(client_id=client_id, client_description=client_description)
    indexer.init_workspace()
    
    # Process each meeting with a transcript
    meetings_with_transcripts = [m for m in meetings if m.get("transcript")]
    if not meetings_with_transcripts:
        print(f"No meetings with transcripts found for client ID {client_id}")
        return
    
    print(f"Processing {len(meetings_with_transcripts)} meetings with transcripts")
    
    for meeting in meetings_with_transcripts:
        meeting_id = meeting["id"]
        # Format date as YYYYMMDD for filename
        date_str = meeting.get("date", "").split("T")[0].replace("-", "")
        transcript = meeting.get("transcript", "")
        
        if not transcript.strip():
            print(f"Skipping meeting {meeting_id} - empty transcript")
            continue
        
        # Create a filename for the transcript
        filename = f"{client_id}_transcript_{date_str}.txt"
        
        # Use a temporary file to store the transcript
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", delete=False, suffix=".txt") as temp_file:
            # Add meeting metadata as headers
            temp_file.write(f"Meeting ID: {meeting_id}\n")
            temp_file.write(f"Meeting Date: {meeting.get('date', 'Unknown')}\n")
            temp_file.write(f"Meeting Type: {meeting.get('meeting_type', 'Unknown')}\n")
            temp_file.write(f"Description: {meeting.get('description', 'None')}\n\n")
            temp_file.write("--- Analyzed Transcript ---\n\n")
            temp_file.write(transcript)
            
            temp_path = temp_file.name
        
        try:
            # Add the transcript to the RAG index input directory
            indexer.add_chat_to_index(temp_path)
            print(f"Added transcript for meeting {meeting_id} to RAG index")
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    # Perform indexing on all files at once
    indexer.perform_indexing()
    print(f"Successfully indexed all transcripts for client {client_name} (ID: {client_id})")

def main():
    # Print some debug info about the current environment
    print(f"Current directory: {os.getcwd()}")
    print(f"Script location: {__file__}")
    print(f"Python path: {sys.path}")
    
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Index client meeting transcripts in the RAG system")
    parser.add_argument("client_id", help="ID of the client to index transcripts for")
    
    args = parser.parse_args()
    
    # Index the client's transcripts
    index_client_transcripts(args.client_id)

if __name__ == "__main__":
    main()