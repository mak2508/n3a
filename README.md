# Meeting Analytics Platform

A full-stack application for analyzing and visualizing meeting data with sentiment analysis.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Yarn](https://yarnpkg.com/) (v4 or later)
- [Python](https://www.python.org/) (v3.10 or later)
- [UV](https://github.com/astral-sh/uv) (Python package manager)

## Installation

### 1. Install Yarn (if not already installed)

```bash
# Install Yarn using npm
npm install -g yarn
# Initialize Yarn
yarn set version stable
```

### 2. Install UV (if not already installed)

```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 3. Clone the repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 4. Set up environment variables

```bash
# Copy the example environment file
cp .env.example .env
# Edit the .env file with your credentials
```

### 5. Install frontend dependencies

```bash
cd frontend
yarn install
```

### 6. Set up Python environment and install backend dependencies

```bash
cd backend
uv venv
source .venv/bin/activate # On Windows: .venv\Scripts\activate
uv pip install -r pyproject.toml
```

## Running the Application

### Start the Backend

```bash
cd backend
source .venv/bin/activate # On Windows: .venv\Scripts\activate
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

### Start the Frontend

```bash
cd frontend
yarn dev
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
.
├── backend/ # FastAPI backend
│ ├── app/
│ │ ├── api/ # API routes
│ │ ├── core/ # Core functionality
│ │ ├── models/ # Data models
│ │ └── main.py # FastAPI application
│ └── requirements.txt # Python dependencies
│
├── frontend/ # React frontend
│ ├── src/ # Source code
│ ├── public/ # Static files
│ └── package.json # Node.js dependencies
│
├── supabase/ # Database migrations
└── .env # Environment variables
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Azure
AZURE_API_KEY=your_azure_api_key
AZURE_ENDPOINT=your_azure_endpoint

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

You can get these values from your Supabase project settings and respective service providers.

## Development

- Backend API documentation is available at `