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

# Edit the .env file with your Supabase credentials
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
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
```

## Running the Application

### Start the Backend
```bash
cd backend
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
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
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core functionality
│   │   ├── models/       # Data models
│   │   └── main.py       # FastAPI application
│   └── requirements.txt  # Python dependencies
│
├── frontend/             # React frontend
│   ├── src/             # Source code
│   ├── public/          # Static files
│   └── package.json     # Node.js dependencies
│
├── supabase/            # Database migrations
└── .env                 # Environment variables
```

## Environment Variables

The application uses the following environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase project anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `SUPABASE_PASSWORD`: Your database password
- `VITE_SUPABASE_URL`: Frontend Supabase URL (same as SUPABASE_URL)
- `VITE_SUPABASE_ANON_KEY`: Frontend Supabase anon key (same as SUPABASE_ANON_KEY)

## Development

- Backend API documentation is available at `http://localhost:8000/docs`
- Frontend hot-reloading is enabled during development
- Database migrations should be applied using Supabase CLI

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

[MIT](LICENSE) 