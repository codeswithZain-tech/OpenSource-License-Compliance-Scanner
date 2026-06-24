# Deployment Guide (GitHub-ready + Vercel)

This project = Frontend (Vite/React) + Backend (Django/DRF).

## 1) GitHub push
- `.env` files **do not** commit.
- Keep `backend/.env.example` and `frontend/.env.example` committed.

## 2) Backend setup
### Required secrets
Create `backend/.env`:
- `SECRET_KEY`
- `GITHUB_TOKEN`

Example:
- Copy `backend/.env.example` → `backend/.env`

### Production environment variables
- `DEBUG=False`
- `REQUIRE_AUTH=True`
- `ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com`

## 3) Deploy Backend (separate service)
This repo is configured for **Vercel frontend + separate backend host**.

Deploy Django backend to any host that can serve:
- `POST /api/scan/`
- `GET /api/history/`
- `POST /api/export-pdf/`
- `POST /api/auth/login/`

## 4) Deploy Frontend on Vercel
In Vercel project, set the environment variable that points to your backend host.

Update `vercel.json` before deploying:
- `destination` currently uses `https://YOUR_BACKEND_HOST/api/$1`
- Replace `YOUR_BACKEND_HOST` with your backend domain (no trailing slash)

Example:
- `https://api.example.com/api/$1`

Vercel will route all frontend calls to `/api/*` → backend.

## 5) Frontend `.env` (optional)
If you are not using rewrites, set:
- `frontend/.env`:
  - `VITE_API_BASE_URL=https://api.example.com`

## 6) Quick smoke test
After both deployments:
1. Open frontend URL
2. Try Scan with a public repo, e.g.:
   - https://github.com/facebook/react

Expected:
- UI shows license + risk
- PDF download works

