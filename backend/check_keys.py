import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from the root directory
env_path = Path(__file__).parent.parent / '.env'
print(f"Loading .env from: {env_path}")
load_dotenv(env_path)

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("\nVerifying Supabase credentials:")
print(f"URL: {supabase_url}")
print(f"Key length: {len(supabase_key) if supabase_key else 0}")
print(f"Key starts with: {supabase_key[:10] if supabase_key else 'None'}")
print(f"Key ends with: {supabase_key[-10:] if supabase_key else 'None'}")

# Check for common issues
if supabase_key:
    if supabase_key.startswith('"') or supabase_key.endswith('"'):
        print("\nWARNING: Key appears to be wrapped in quotes")
    if supabase_key.startswith("'") or supabase_key.endswith("'"):
        print("\nWARNING: Key appears to be wrapped in single quotes")
    if " " in supabase_key:
        print("\nWARNING: Key contains spaces")
    if "\n" in supabase_key:
        print("\nWARNING: Key contains newlines") 