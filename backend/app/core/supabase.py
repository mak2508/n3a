from supabase import create_client, Client
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from the root directory
env_path = Path(__file__).parent.parent.parent.parent / '.env'
print(f"Loading .env from: {env_path}")
load_dotenv(env_path)

supabase_url = os.getenv("SUPABASE_URL")
supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Debug print (only showing first few characters of the key)
print(f"Supabase URL: {supabase_url}")
print(f"Supabase Anon Key length: {len(supabase_anon_key) if supabase_anon_key else 0}")
print(f"Supabase Service Key length: {len(supabase_service_key) if supabase_service_key else 0}")

if not supabase_url or not supabase_anon_key:
    raise ValueError("Missing Supabase credentials in environment variables")

# Initialize the client with anon key
supabase: Client = create_client(
    supabase_url,
    supabase_anon_key
)
print("Supabase client created successfully")
