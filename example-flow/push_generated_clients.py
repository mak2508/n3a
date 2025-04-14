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
    transcripts_dir = "./example-flow/generated-transcripts-annotated"

    # Set to keep track of unique clients
    unique_clients = set()

    # Process each transcript file
    for filename in os.listdir(transcripts_dir):
        if filename.endswith(".txt"):
            with open(os.path.join(transcripts_dir, filename), 'r') as file:
                first_line = file.readline()
                client_info = extract_client_name(first_line)
                if client_info:
                    unique_clients.add(client_info)

    print(f"Unique clients found: {len(unique_clients)}")
    print("Clients:", unique_clients)

    client_info_dict = {}
    for client in unique_clients:
        client_name = f"{client[0]}. {client[1]}"
        # Generate fake data for each unique client
        client_info_dict[client_name] = generate_fake_info(client_name)
        # Push client to Supabase
        result = push_clients_to_supabase(client_info_dict[client_name])
        client_info_dict[client_name] = result.data
        print(result)


    print(client_info_dict)
    # Save client_info_dict to a JSON file
    with open("client_info.json", "w") as json_file:
        json.dump(client_info_dict, json_file, indent=4)



def generate_fake_info(client_name):
    """
    client_name: str ("Mrs. Smith")

    Returns dict with following fields populated with fake data:
        name: str
        email: str
        phone: str
        date_of_birth: date
        profession: str
        relationship_type: str ("Business", "Standard", "Premium")
    """
    azure_model = ModelAzure()
    prompt = f"{client_name} is an important client for a bank. Generate the following fake data for {client_name}: name (this should be full name), email, phone, date of birth, profession, relationship type (Business, Standard, or Premium). Output only these fields in JSON format."
    dict_output = {}
    exact_keys = ["name", "email", "phone", "date_of_birth", "profession", "relationship_type"]
    # While the keys of dict_output are not the same as exact_keys, keep generating
    while set(dict_output.keys()) != set(exact_keys):
        response = azure_model.gpt4(prompt)
        filtered_response = "\n".join([line for line in response.split("\n") if line.strip() and not line.startswith("```")])
        dict_output = json.loads(filtered_response)
        print(dict_output)
        return dict_output



def push_clients_to_supabase(client_info):
    # Insert unique clients into Supabase if they don't already exist
    # Check if client already exists in Supabase
    existing_client = supabase.table("clients").select("*").eq("name", client_info["name"]).execute()
    if existing_client.data:
        print(f"Client {client_info['name']} already exists in Supabase.")
        return

    # Insert new client into Supabase
    try:
        result = supabase.table("clients").insert(client_info).execute()
        return result
    except Exception as e:
        print(f"Error inserting client {client_info['name']}: {e}")



if __name__ == "__main__":
    process_transcripts()

