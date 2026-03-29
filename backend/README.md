# VyapaarSathi AI Backend

This backend serves a multilingual AI endpoint for the React frontend.

## Setup

1. Create a Python environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

## Endpoint

- `POST /api/ask`
  - body: `{ "question": "...", "language": "English" }`
  - returns: `{ "answer": "..." }`
