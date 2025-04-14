from supabase import create_client
import os
from dotenv import load_dotenv
import re
from datetime import datetime
import json

from backend.app.serve.models.azure_models import ModelAzure

# Load environment variables
load_dotenv(".env")
load_dotenv("./example-flow/.env")

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(supabase_url, supabase_key)

def process_transcripts():
    # Path to transcripts directory
    transcripts_dir = "./example-flow/generated-transcripts-unannotated"

    with open("./example-flow/meeting_info.json", "r") as file:
        # Load client info from JSON file
        meeting_info = json.load(file)

    all_meeting_info = sum(meeting_info.values(), [])

    # Process each transcript file
    for filename in os.listdir(transcripts_dir):
        if not filename.endswith(".txt"):
            continue

        basename = os.path.basename(filename)
        annotated_filename = f"./example-flow/generated-transcripts-annotated/{basename}"

        with open(os.path.join(transcripts_dir, filename), 'r') as file:
            transcript = file.read()
        with open(os.path.join(annotated_filename), 'r') as file:
            annotated_transcript = file.read()

        try:
            this_meeting_info = [meeting for meeting in all_meeting_info if meeting["transcript"].strip() == transcript.strip()][0]
        except IndexError:
            print(transcript)
            print(all_meeting_info)
            for i in [10, 20, 30, 40, 50, 60, 70, 80, 90]:
                print(i)
                matches = [meeting for meeting in all_meeting_info if meeting["transcript"].strip()[:i] == transcript.strip()[:i]]
                if len(matches) == 1:
                    this_meeting_info = matches[0]
                    break

        meeting_id = this_meeting_info["id"]

        for senti_info in genearate_senti_info(annotated_transcript, transcript):
            senti_info["meeting_id"] = meeting_id
            result = push_senti_to_supabase(senti_info)


def genearate_senti_info(annotated_transcript, transcript):
    """
    transcript and annotated_transcript must be the same if annotations are removed
    from annotated_transcript. The annotations are made by designating a span with [] and then annotating the sentiment with () right after. Within the brackets, the higher level and lower level sentiments are separated by a comma.

    This function yield dictionaries with the following keys:
     - start_index
     - end_index
     - sentiment
    """
    current_char_index = 0
    in_span = False
    in_annotation = False
    current_span = ""
    start_index = 0
    end_index = 0
    buffer = ""
    for char in annotated_transcript:
        buffer += char
        if char == "[" and not in_span:
            in_span = True
            start_index = current_char_index
            buffer = ""
        elif char == "]" and in_span:
            in_span = False
            current_span = buffer[:-1]
            end_index = current_char_index
        elif char == "(" and not in_annotation:
            in_annotation = True
            buffer = ""
        elif char == ")" and in_annotation:
            in_annotation = False
            sentiment = buffer[:-1].strip()
            assert "," in sentiment
            sentiment = sentiment.split(",")[0].strip()
            if transcript[start_index:end_index] != current_span:
                if transcript[start_index-1:end_index] == current_span:
                    start_index -= 1
                elif transcript[start_index:end_index+1] == current_span:
                    end_index += 1
                elif transcript[start_index-1:end_index+1] == current_span:
                    start_index -= 1
                    end_index += 1
                elif transcript[start_index:end_index-1] == current_span:
                    end_index -= 1
                elif transcript[start_index+1:end_index] == current_span:
                    start_index += 1
                elif transcript[start_index+1:end_index+1] == current_span:
                    start_index += 1
                    end_index += 1
                elif transcript[start_index-1:end_index-1] == current_span:
                    start_index -= 1
                    end_index -= 1

            if transcript[start_index:end_index] != current_span:
                start_index = transcript.find(current_span)
                end_index = start_index + len(current_span)
            if start_index == -1 or end_index == -1:
                print(f"Transcript: {transcript}")
                print(f"Current Span: {current_span}")
                print(f"Start Index: {start_index}")
                print(f"End Index: {end_index}")
                print(f"Current Char Index: {current_char_index}")
                raise ValueError("Span not found in transcript")

            assert transcript[start_index:end_index] == current_span, f"Transcript: {transcript[start_index:end_index]} != {current_span}, start_index: {start_index}, end_index: {end_index}, current_char_index: {current_char_index}"
            yield {
                "start_index": start_index,
                "end_index": end_index,
                "sentiment": sentiment
            }

        if char not in "()[]" and not in_annotation:
            current_char_index += 1


def push_senti_to_supabase(senti_info):
    # Insert new client into Supabase
    print(senti_info)
    try:
        result = supabase.table("sentiment_events").insert(senti_info).execute()
        return result
    except Exception as e:
        print(f"Error inserting senti into Supabase: {e}")



if __name__ == "__main__":
    #print(supabase.table("sentiment_events").select("*").execute())
    process_transcripts()

