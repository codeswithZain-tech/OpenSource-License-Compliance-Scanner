License Scanner

Quick start:

## Backend (Django)
1) Create virtualenv and activate it
- Windows (cmd):
  - python -m venv backend/venv
  - backend\venv\Scripts\activate

2) Environment variables
- Create backend/.env (do not commit it)
- If you don’t have backend/.env.example, create one based on your needs.
- Required:
  - SECRET_KEY
- Optional:
  - GITHUB_TOKEN (recommended for higher GitHub API rate limits)
  - REQUIRE_AUTH (set True to enforce JWT auth)

3) Install dependencies:
- pip install -r backend/requirements.txt

4) Run migrations:
- python backend/manage.py migrate

5) Start server:
- python backend/manage.py runserver

## Frontend (React/Vite)
1) Go to frontend folder:
- cd frontend

2) Install deps:
- npm install

3) Start dev server:
- npm run dev

## CI (GitHub Actions)
- CI runs backend migrations + Django tests on push/PR.

Notes:
- Do NOT commit secrets. Use .env for environment variables.
- .gitignore excludes virtualenvs and node_modules; remove any committed venv directories from the repo history if present.
- To enforce JWT auth in production, set REQUIRE_AUTH=True and configure SECRET_KEY and JWT settings.

