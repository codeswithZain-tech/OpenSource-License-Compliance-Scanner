# OpenSource License Compliance Scanner

A full-stack web application that scans GitHub repositories, detects open-source licenses, analyzes compliance risks, and generates PDF reports.

## Features

- **License Detection** — Identifies 30+ open-source licenses (MIT, GPL, Apache, BSD, AGPL, MPL, etc.) with risk level classification (LOW / MEDIUM / HIGH)
- **License Policy Engine** — Configurable allow/warn/block rules per license with policy enforcement
- **Dependency Scanning** — Extracts and analyzes dependencies from package.json, requirements.txt, and other manifest files
- **Batch Scanning** — Scan multiple repositories at once with CSV export
- **PDF Reports** — Generate professional PDF compliance reports
- **JWT Authentication** — User registration, login, and protected routes
- **Dark UI** — Glassmorphism design with 3D animations, fully responsive

## Tech Stack

| Layer    | Technology                                     |
| -------- | ---------------------------------------------- |
| Frontend | React 19, Vite 8, Tailwind CSS 3, Framer Motion |
| Backend  | Django 4.2, Django REST Framework, SQLite       |
| Auth     | JWT (djangorestframework-simplejwt)             |
| API      | PyGithub (GitHub API v3)                        |
| Reports  | ReportLab                                       |

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment

Create `backend/.env`:

```env
GITHUB_TOKEN=ghp_your_token_here
SECRET_KEY=your-secret-key
```

Generate a GitHub token at https://github.com/settings/tokens with `repo` and `read:org` scopes.

## API Endpoints

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| POST   | `/api/auth/register/` | User registration         |
| POST   | `/api/auth/login/`    | User login                |
| POST   | `/api/scan/`          | Scan a GitHub repository  |
| POST   | `/api/scan/batch/`    | Batch scan repositories   |
| GET    | `/api/history/`       | Get scan history          |
| GET    | `/api/policies/`      | List license policies     |
| POST   | `/api/policies/update/`| Update a license policy  |
| POST   | `/api/export-pdf/`    | Export PDF report         |

## License Detection Coverage

| License       | Risk    | Commercial Use |
| ------------- | ------- | -------------- |
| MIT           | LOW     | Allowed        |
| Apache 2.0    | LOW     | Allowed        |
| BSD           | LOW     | Allowed        |
| ISC           | LOW     | Allowed        |
| LGPL          | MEDIUM  | Library OK     |
| MPL           | MEDIUM  | File-level copyleft |
| GPL           | HIGH    | Must open source |
| AGPL          | HIGH    | Network copyleft |
| Proprietary   | HIGH    | Restricted     |

## Project Structure

```
├── backend/
│   ├── scanner/           # Core scanning logic
│   │   ├── services/      # GitHub API, PDF generation
│   │   ├── models.py      # Scan, LicensePolicy models
│   │   ├── views.py       # API endpoints
│   │   └── urls.py
│   ├── accounts/          # Auth app
│   ├── license_scanner/   # Django settings
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── components/    # GlassCard, ThreeScene, Layout, etc.
    │   ├── pages/         # Dashboard, Scanner, History, Settings, etc.
    │   ├── utils/         # API client
    │   ├── App.jsx
    │   └── index.css
    ├── tailwind.config.js
    └── vite.config.js
```

## License

MIT
