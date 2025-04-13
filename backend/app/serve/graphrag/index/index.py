# File: graphrag/index/index.py

import os
import json
from openai import OpenAI

# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def init_workspace(root: str):
    """
    Initialize the workspace by ensuring the input directory exists.
    """
    input_dir = os.path.join(root, "input")
    os.makedirs(input_dir, exist_ok=True)
    print(f"Workspace initialized at: {root}")

def perform_indexing(root: str):
    """
    Perform indexing by reading text files from the input folder,
    generating embeddings using OpenAI's API, and storing the result.
    """
    input_dir = os.path.join(root, "input")
    if not os.path.exists(input_dir):
        print(f"Input directory not found at: {input_dir}")
        return

    embeddings = {}
    for filename in os.listdir(input_dir):
        file_path = os.path.join(input_dir, filename)
        if os.path.isfile(file_path) and filename.endswith(".txt"):
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
                try:
                    # Generate an embedding for the text using OpenAI API
                    response = client.embeddings.create(
                        input=text,
                        model="text-embedding-ada-002"  # Or use newer embedding model if available
                    )
                    # Extract the embedding from the API response
                    embedding = response.data[0].embedding
                    embeddings[filename] = embedding
                    print(f"Generated embedding for {filename}")
                except Exception as e:
                    print(f"Failed to generate embedding for {filename}: {e}")

    # Save embeddings to a JSON file in the workspace (for later querying)
    embeddings_path = os.path.join(root, "embeddings.json")
    with open(embeddings_path, "w", encoding="utf-8") as f:
        json.dump(embeddings, f)
    print(f"Saved embeddings to {embeddings_path}")