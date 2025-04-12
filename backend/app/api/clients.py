from fastapi import APIRouter, HTTPException
from ..core.supabase import supabase
from ..models.client import Client, ClientInsight
from typing import List

router = APIRouter()

@router.get("/clients", response_model=List[Client])
async def get_clients():
    try:
        # Fetch clients
        clients_response = await supabase.table("clients").select("*").execute()
        clients = clients_response.data

        # Fetch insights for all clients
        insights_response = await supabase.table("client_insights").select("*").execute()
        insights = insights_response.data

        # Combine clients with their insights
        for client in clients:
            client["insights"] = [
                ClientInsight(
                    id=insight["id"],
                    client_id=insight["client_id"],
                    category=insight["category"],
                    insight=insight["insight"],
                    source_meeting_id=insight["source_meeting_id"],
                    created_at=insight["created_at"],
                    updated_at=insight["updated_at"]
                )
                for insight in insights
                if insight["client_id"] == client["id"]
            ]

        return clients
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str):
    try:
        # Fetch client
        client_response = await supabase.table("clients").select("*").eq("id", client_id).single().execute()
        if not client_response.data:
            raise HTTPException(status_code=404, detail="Client not found")
        
        client = client_response.data

        # Fetch insights for this client
        insights_response = await supabase.table("client_insights").select("*").eq("client_id", client_id).execute()
        client["insights"] = [
            ClientInsight(
                id=insight["id"],
                client_id=insight["client_id"],
                category=insight["category"],
                insight=insight["insight"],
                source_meeting_id=insight["source_meeting_id"],
                created_at=insight["created_at"],
                updated_at=insight["updated_at"]
            )
            for insight in insights_response.data
        ]

        return client
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 