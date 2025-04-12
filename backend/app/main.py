from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import meetings

app = FastAPI(title="Meeting Analytics API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(meetings.router, prefix="/api", tags=["meetings"]) 