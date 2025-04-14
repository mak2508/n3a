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

def extract_client_name(text):
    # Look for patterns like "Mrs. Smith", "Mr. Jones", "Ms. Carter"
    pattern = r"(?:Mrs\.|Mr\.|Ms\.) [A-Z][a-z]+"
    match = re.search(pattern, text)
    if match:
        full_name = match.group(0)
        # Split title and last name
        parts = full_name.split(". ")
        title = parts[0]
        last_name = parts[1]
        return title,last_name
    return None

def process_transcripts():
    # Path to transcripts directory
    transcripts_dir = "./example-flow/generated-transcripts-unannotated"

    with open("./example-flow/client_info.json", "r") as file:
        # Load client info from JSON file
        client_info = json.load(file)

    meeting_info_dict = {}

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


        first_line = transcript.split("\n")[0]
        client_name = extract_client_name(first_line)

        if not client_name:
            continue

        this_client_info = client_info[f"{client_name[0]}. {client_name[1]}"][0]
        client_id = this_client_info["id"]
        meeting_info = generate_fake_meeting_info(this_client_info, annotated_transcript)
        meeting_info["client_id"] = client_id
        meeting_info["transcript"] = transcript
        result = push_meetings_to_supabase(meeting_info)
        if result:
            meeting_info_dict[client_id] = result.data

    # Save the meeting info to a JSON file
    with open("meeting_info.json", "w") as json_file:
        json.dump(meeting_info_dict, json_file, indent=4)




def generate_fake_meeting_info(client_info, transcript):
    """
    Returns dict with following fields populated with fake data:
        date: datetime (e.g. 2023-10-01)
        meeting_type: str
        description: str (Anything the agent might write about the meeting)
        summary: str (Summary of the transcript)
        sentiment: int (A value between 0 and 100)

    Meeting type is one of:
     'Initial Consultation',
      'Follow-up',
      'Review',
      'Retirement Planning',
      'Investment Review',
      'Mortgage Consultation',
      'Wealth Management',
      'Tax Planning',
      'Estate Planning',
      'Insurance Review',
      'General Consultation',
      'Strategy Session',
      'Other'
    """
    azure_model = ModelAzure()
    prompt = (
        "The following is a transcript of a meeting between a bank agent and a client. It is annotated with "
        "sentiments. We need the following fake data to be generated about the meeting on top of the available "
        "annotated transcript: date, meeting_type, description, summary, and sentiment.\n"
        "The meeting type is one of the following: 'Initial Consultation', 'Follow-up', 'Review', "
        "'Retirement Planning', 'Investment Review', 'Mortgage Consultation', 'Wealth Management', "
        "'Tax Planning', 'Estate Planning', 'Insurance Review', 'General Consultation', 'Strategy Session', "
        "'Other'.\n"
        "The date should be in the format YYYY-MM-DD.\n"
        "The description should be a brief overview of the meeting; something the agent might write about the meeting.\n"
        "The summary should be a summary of the transcript.\n"
        "The sentiment should be a value between 0 and 100 indicating the overall sentiment of the meeting, with 0 being very negative and 100 being very positive.\n"
        f"The client information is as follows: {client_info}.\n"
        f"The transcript is as follows: {transcript}\n"
        "Please provide the output in JSON format with the following keys: date, meeting_type, description, summary, sentiment."
    )

    dict_output = {}
    exact_keys = ["date", "meeting_type", "description", "summary", "sentiment"]
    # While the keys of dict_output are not the same as exact_keys, keep generating
    while set(dict_output.keys()) != set(exact_keys):
        response = azure_model.gpt4(prompt)
        filtered_response = "\n".join([line for line in response.split("\n") if line.strip() and not line.startswith("```")])
        dict_output = json.loads(filtered_response)
        print(dict_output)
        return dict_output



def push_meetings_to_supabase(meeting_info):
    # Insert unique meetings into Supabase if they don't already exist
    # Check if client already exists in Supabase
    existing_meeting = supabase.table("meetings").select("*").eq("transcript", meeting_info["transcript"]).execute()
    if existing_meeting.data:
        print(f"Meeting with transcript already exists for client {meeting_info['client_id']}.")
        print(existing_meeting)
        print(meeting_info["transcript"])
        return

    # Insert new client into Supabase
    try:
        result = supabase.table("meetings").insert(meeting_info).execute()
        return result
    except Exception as e:
        print(f"Error inserting meeting into Supabase: {e}")



if __name__ == "__main__":
    # print(supabase.table("meetings").select("*").execute())
    process_transcripts()

