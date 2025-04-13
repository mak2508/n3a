from fastapi import APIRouter, HTTPException, Query
from ..core.supabase import supabase
from ..models.client import Client, ClientInsight
from typing import List, Dict, Any
import os

# Import GraphRAG components
from ..serve.graphRag import GraphRAGIndexer

router = APIRouter()

@router.get("/clients", response_model=List[Client])
async def get_clients():
    try:
        # Fetch clients
        try:
            clients_response = supabase.table("clients").select("*").execute()
            if not clients_response:
                raise HTTPException(status_code=500, detail="Failed to fetch clients from Supabase")
            clients = clients_response.data
        except Exception as e:
            print(f"Error fetching clients: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        print(f"Clients: {clients}")

        # Fetch insights for all clients
        insights_response = supabase.table("client_insights").select("*").execute()
        insights = insights_response.data

        # Combine clients with their insights
        for client in clients:
            client["insights"] = [
                ClientInsight(
                    id=insight["id"],
                    client_id=insight["client_id"],
                    category=insight["category"],
                    insight=insight["insight"],
                    meeting_id=insight["meeting_id"],
                    created_at=insight["created_at"],
                    updated_at=insight["updated_at"]
                )
                for insight in insights
                if insight["client_id"] == client["id"]
            ]

        return clients
    except Exception as e:
        print(f"Error in get_clients: {str(e)}")  # Add debug logging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str):
    try:
        # Fetch client
        client_response = supabase.table("clients").select("*").eq("id", client_id).single().execute()
        if not client_response.data:
            raise HTTPException(status_code=404, detail="Client not found")
        
        client = client_response.data

        # Fetch insights for this client
        insights_response = supabase.table("client_insights").select("*").eq("client_id", client_id).execute()
        client["insights"] = [
            ClientInsight(
                id=insight["id"],
                client_id=insight["client_id"],
                category=insight["category"],
                insight=insight["insight"],
                meeting_id=insight["meeting_id"],
                created_at=insight["created_at"],
                updated_at=insight["updated_at"]
            )
            for insight in insights_response.data
        ]

        return client
    except Exception as e:
        print(f"Error in get_client: {str(e)}")  # Add debug logging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clients/{client_id}/query")
async def query_client(client_id: str, q: str = Query(..., description="Search query")):
    """
    Search for information about a client using GraphRAG for semantic search.
    The function queries meeting transcripts, summaries, and client insights
    to find the most relevant content related to the query.
    """
    try:
        # Verify the client exists
        client_response = supabase.table("clients").select("*").eq("id", client_id).single().execute()
        if not client_response.data:
            raise HTTPException(status_code=404, detail="Client not found")
        
        client = client_response.data
        
        # Initialize the GraphRAG indexer
        indexer = GraphRAGIndexer(client_id=client_id)
        
        # Check if GraphRAG index exists for this client
        graph_rag_path = f"./graphRAG/{client_id}"
        embeddings_path = os.path.join(graph_rag_path, "embeddings.json")
        
        if not os.path.exists(graph_rag_path) or not os.path.exists(embeddings_path):
            # Fall back to traditional search if no GraphRAG index
            print(f"No GraphRAG index found for client {client_id}. Using traditional search.")
            return traditional_search(client_id, q, client)
        
        # Use GraphRAG to find relevant information
        try:
            # Call the query_index method from GraphRAGIndexer
            results = indexer.query_index(q)
            
            # Format response with client name
            response = {
                "query": q,
                "client_name": client.get("name", "Client"),
                "results": results,
                "search_type": "graphrag"
            }
            
            # If no results, add a message
            if not results:
                response["message"] = f"No relevant information found about '{q}' for this client."
            
            return response
            
        except Exception as rag_error:
            print(f"GraphRAG search error: {rag_error}")
            # Fall back to traditional search if GraphRAG fails
            print("Falling back to traditional search.")
            return traditional_search(client_id, q, client)
    
    except Exception as e:
        print(f"Error in query_client: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def traditional_search(client_id: str, query: str, client: Dict[str, Any]):
    """Fall back to traditional keyword search if GraphRAG is not available."""
    # Get all meetings for this client
    meetings_response = supabase.table("meetings").select("*").eq("client_id", client_id).execute()
    meetings = meetings_response.data
    
    # Get client insights
    insights_response = supabase.table("client_insights").select("*").eq("client_id", client_id).execute()
    insights = insights_response.data
    
    # Initialize results
    results = []
    
    # Simple search function to find query in text
    def search_text(text, query, context_chars=100):
        if not text or not query:
            return None
            
        text_lower = text.lower()
        query_lower = query.lower()
        
        if query_lower not in text_lower:
            return None
        
        # Find the position of the query
        pos = text_lower.find(query_lower)
        
        # Get context around the match
        start = max(0, pos - context_chars)
        end = min(len(text), pos + len(query) + context_chars)
        
        # Try to start and end at word boundaries
        if start > 0:
            while start > 0 and text[start] != ' ':
                start -= 1
        
        if end < len(text):
            while end < len(text) and text[end] != ' ':
                end += 1
        
        # Extract the context
        context = text[start:end].strip()
        
        # Add ellipsis if trimmed
        prefix = "..." if start > 0 else ""
        suffix = "..." if end < len(text) else ""
        
        return f"{prefix}{context}{suffix}"
    
    # Search through meeting transcripts and summaries
    for meeting in meetings:
        meeting_date = meeting.get("date", "Unknown date")
        meeting_type = meeting.get("meeting_type", "meeting")
        
        for field in ["transcript", "summary", "description"]:
            if meeting.get(field):
                match = search_text(meeting[field], query)
                if match:
                    results.append({
                        "source": field,
                        "meeting_id": meeting["id"],
                        "date": meeting_date,
                        "type": meeting_type,
                        "context": f"From {meeting_type} {field} ({meeting_date}):",
                        "content": match
                    })
    
    # Search through insights
    for insight in insights:
        if insight.get("insight"):
            match = search_text(insight["insight"], query)
            if match:
                results.append({
                    "source": "insight",
                    "insight_id": insight["id"],
                    "category": insight.get("category", "Insight"),
                    "context": f"From {insight.get('category', 'client insight')}:",
                    "content": match
                })
    
    # Prepare response
    response = {
        "query": query,
        "client_name": client.get("name", "Client"),
        "results": results,
        "search_type": "traditional"  # Indicate this was a fallback search
    }
    
    # If no results, add a message
    if not results:
        response["message"] = f"No information found about '{query}' for this client."
    
    return response