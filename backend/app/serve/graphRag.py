# File: graphRag.py

import os
import shutil
import sys
import json
import numpy as np
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Functions previously imported from graphrag.index
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

class GraphRAGIndexer:
    def __init__(self, client_id="test_client", client_description=""):
        self.root_dir = f"./graphRAG/{client_id}"
        self.client_id = client_id
        self.embeddings_path = os.path.join(self.root_dir, "embeddings.json")
        self.input_dir = os.path.join(self.root_dir, "input")

    def init_workspace(self):
        """
        Initializes the workspace by creating the required configuration files and folders.
        """
        os.makedirs(self.input_dir, exist_ok=True)
        # Call the initialization function defined above
        init_workspace(self.root_dir)

    def perform_indexing(self):
        """
        Performs indexing using the GraphRAG indexing functions.
        """
        perform_indexing(self.root_dir)

    def add_chat_to_index(self, file_path, client=None):
        """
        Adds a chat file to the input folder for indexing.
        Args:
            file_path (str): Path to the chat file to be added.
            client (str, optional): Specific client folder to add the file to.
        """
        input_folder = os.path.join(self.root_dir, "input", client) if client else self.input_dir
        os.makedirs(input_folder, exist_ok=True)
        try:
            shutil.copy(file_path, input_folder)
            print(f"Chat file {file_path} added to {input_folder}.")
        except Exception as e:
            print(f"Failed to add chat file: {e}", file=sys.stderr)

    def update_index(self, file_path, client=None):
        """
        Updates the index by adding a new file to the input folder and re-indexing.
        Args:
            file_path (str): Path to the new .txt file to be indexed.
            client (str, optional): Specific client folder to add the file to.
        """
        input_folder = os.path.join(self.root_dir, "input", client) if client else self.input_dir
        os.makedirs(input_folder, exist_ok=True)
        try:
            shutil.copy(file_path, input_folder)
            print(f"Copied {file_path} to {input_folder}.")
        except Exception as e:
            print(f"Failed to copy file: {e}", file=sys.stderr)
            return

        self.perform_indexing()

    def query_index(self, query, top_k=3, threshold=0.70):
        """
        Queries the index using semantic search.
        
        Args:
            query (str): The query string.
            top_k (int): Number of top results to return.
            threshold (float): Similarity threshold for relevance.
            
        Returns:
            List of search results with source info and content.
        """
        # Check if embeddings exist
        if not os.path.exists(self.embeddings_path):
            print(f"No embeddings found at {self.embeddings_path}")
            return []
            
        # Load stored embeddings
        with open(self.embeddings_path, "r", encoding="utf-8") as f:
            stored_embeddings = json.load(f)
        
        if not stored_embeddings:
            return []
        
        try:
            # Generate embedding for the query
            query_response = client.embeddings.create(
                input=query,
                model="text-embedding-ada-002"
            )
            query_embedding = query_response.data[0].embedding
            
            # Calculate cosine similarity between query and stored embeddings
            similarities = {}
            for filename, embedding in stored_embeddings.items():
                # Convert to numpy arrays for efficient calculation
                query_array = np.array(query_embedding)
                stored_array = np.array(embedding)
                
                # Calculate cosine similarity
                dot_product = np.dot(query_array, stored_array)
                query_norm = np.linalg.norm(query_array)
                stored_norm = np.linalg.norm(stored_array)
                similarity = dot_product / (query_norm * stored_norm)
                
                similarities[filename] = similarity
            
            # Sort by similarity (highest first)
            sorted_files = sorted(similarities.items(), key=lambda x: x[1], reverse=True)
            
            # Take top k results
            top_results = sorted_files[:top_k]
            
            # Prepare results
            results = []
            
            for filename, similarity_score in top_results:
                # Skip files with low similarity
                if similarity_score < threshold:
                    continue
                    
                file_path = os.path.join(self.input_dir, filename)
                if os.path.exists(file_path):
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        
                        # Create file info based on filename
                        file_info = {
                            "source": "transcript",
                            "context": f"From meeting transcript:",
                            "content": self.extract_relevant_context(content, query),
                            "relevance": round(float(similarity_score) * 100)
                        }
                        
                        # Add meeting date if available in the filename
                        if "_transcript_" in filename:
                            date_str = filename.split("_transcript_")[1].split(".")[0]
                            if date_str and len(date_str) >= 8:  # Simple validation
                                file_info["date"] = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:8]}"
                        results.append(file_info)
            
            return results
        except Exception as e:
            print(f"Error in GraphRAG query: {e}")
            raise

    def extract_relevant_context(self, text, query, max_length=300):
        """
        Extract the most relevant part of text for the given query.
        
        Args:
            text: Full text content
            query: Search query
            max_length: Maximum length of the context to return
            
        Returns:
            Relevant excerpt from the text
        """
        # Check if there's an analysis section in the text
        parts = text.split("--- Analyzed Transcript ---")
        if len(parts) > 1:
            # Prioritize the analyzed transcript if available
            text = parts[1].strip()
        
        # Simple approach: Find the first occurrence of query terms
        query_terms = query.lower().split()
        
        # Find the best paragraph containing query terms
        paragraphs = text.split("\n\n")
        best_paragraph = None
        best_score = 0
        
        for paragraph in paragraphs:
            if not paragraph.strip():
                continue
                
            paragraph_lower = paragraph.lower()
            score = sum(1 for term in query_terms if term in paragraph_lower)
            
            if score > best_score:
                best_score = score
                best_paragraph = paragraph
        
        if best_paragraph and best_score > 0:
            if len(best_paragraph) <= max_length:
                return best_paragraph
            
            # If paragraph is too long, extract a window around the first match
            paragraph_lower = best_paragraph.lower()
            first_term_pos = min(
                (paragraph_lower.find(term) for term in query_terms if term in paragraph_lower), 
                key=lambda x: x if x >= 0 else float('inf')
            )
            
            if first_term_pos >= 0:
                start = max(0, first_term_pos - max_length // 2)
                end = min(len(best_paragraph), start + max_length)
                
                # Adjust to avoid cutting words
                while start > 0 and best_paragraph[start] != ' ':
                    start -= 1
                while end < len(best_paragraph) and best_paragraph[end] != ' ':
                    end += 1
                    
                excerpt = best_paragraph[start:end].strip()
                if start > 0:
                    excerpt = "..." + excerpt
                if end < len(best_paragraph):
                    excerpt = excerpt + "..."
                    
                return excerpt
        
        # If no good match found, return the beginning of the text
        return text[:max_length] + "..." if len(text) > max_length else text