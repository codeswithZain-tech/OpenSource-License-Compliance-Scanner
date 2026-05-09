# OpenSource License Compliance Scanner

A professional full-stack application that scans GitHub repositories, detects open-source licenses, assesses compliance risks, and generates detailed PDF reports.

---

## Features

**License Detection**
- Detects 30+ open-source licenses (MIT, GPL, Apache, BSD, LGPL, AGPL, MPL, ISC, Unlicense, CC0)
- Custom and proprietary license identification
- Risk level assessment (LOW / MEDIUM / HIGH)
- Smart compliance recommendations

**Reporting**
- Professional PDF report export
- Scan history tracking
- Interactive dashboard with analytics

**User System**
- JWT authentication (Login / Signup)
- User profile management
- Protected routes

**User Interface**
- Dark / Light mode toggle
- Glassmorphism design with animations
- Fully responsive (desktop + mobile)
- Animated sidebar with hover effects

---

## Technology Stack

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| Django | 5.2.14 | Web framework |
| Django REST Framework | 3.17.1 | REST API development |
| django-cors-headers | 4.9.0 | React connection |
| djangorestframework-simplejwt | 5.5.1 | JWT authentication |
| PyGithub | 2.9.1 | GitHub API integration |
| ReportLab | 4.5.0 | PDF report generation |
| python-dotenv | 1.2.2 | Environment variables |
| PyJWT | 2.12.1 | JSON Web Token handling |
| requests | 2.33.1 | HTTP requests |
| cryptography | 48.0.0 | Security encryption |
| asgiref | 3.11.1 | ASGI server support |
| sqlparse | 0.5.5 | SQL parsing |
| tzdata | 2026.2 | Timezone data |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.2.5 | UI framework |
| React DOM | 19.2.5 | DOM rendering |
| React Router DOM | 7.15.0 | Navigation |
| Axios | 1.16.0 | API calls |
| Framer Motion | 12.38.0 | Animations |
| Lucide React | 1.14.0 | Icons |
| Tailwind CSS | 3.4.19 | Styling |
| Vite | 8.0.10 | Build tool |
| PostCSS | 8.5.14 | CSS processing |
| Autoprefixer | 10.5.0 | CSS vendor prefixes |
| ESLint | 10.2.1 | Code linting |

---

## Quick Setup

### Prerequisites

| Software | Version |
|----------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux

pip install django djangorestframework django-cors-headers djangorestframework-simplejwt PyGithub reportlab python-dotenv

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver


### Frontend Setup
---bash
cd frontend
npm install
npm run dev

###Environment Configuration
Create .env file in backend folder:
---bash
GITHUB_TOKEN=ghp_your_token_here
Get GitHub Token: github.com/settings/tokens → Generate new token → Select repo and read:org scopes

###Access Application
Service	URL
Frontend	http://localhost:5173
Backend API	http://localhost:8000
Admin Panel	http://localhost:8000/admin

###API Endpoints
Method	Endpoint	Description
POST	/api/scan/	Scan GitHub repository
GET	/api/history/	Get scan history
POST	/api/export-pdf/	Export PDF report
POST	/api/auth/register/	User registration
POST	/api/auth/login/	User login
POST	/api/auth/logout/	User logout
GET	/api/test/	Test API connection

### License Detection Coverage
License	Risk	Commercial Use
MIT	🟢 LOW	✅ Allowed
Apache 2.0	🟢 LOW	✅ Allowed
BSD	🟢 LOW	✅ Allowed
ISC	🟢 LOW	✅ Allowed
GPL	🔴 HIGH	⚠️ Must open source
AGPL	🔴 HIGH	⚠️ Network copyleft
LGPL	🟡 MEDIUM	✅ As library
MPL	🟡 MEDIUM	⚠️ File-level copyleft
Proprietary	🔴 HIGH	❌ Contact owner
No License	🟡 MEDIUM	❌ Default copyright

###Test URLs
text
https://github.com/facebook/react          → MIT (LOW Risk)
https://github.com/torvalds/linux          → GPL (HIGH Risk)
https://github.com/django/django           → BSD (LOW Risk)
https://github.com/tensorflow/tensorflow   → Apache (LOW Risk)

###Project Structure
license-scanner/
├── backend/
│   ├── scanner/
│   │   ├── services/
│   │   │   ├── github_service.py
│   │   │   └── pdf_service.py
│   │   ├── models.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── accounts/
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── license_scanner/
│   │   └── settings.py
│   ├── manage.py
│   └── db.sqlite3
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Scanner.jsx
    │   │   ├── History.jsx
    │   │   └── Login.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js

###Troubleshooting
Error	|Solution
No module named 'django'|	Activate virtual environment
CORS error	| Set CORS_ALLOW_ALL_ORIGINS = True
403 Forbidden	| Add @csrf_exempt to view
Port already in use |	Change port number
GitHub token invalid	| Regenerate token with correct scopes

###Author
Zain Kashif

###License
MIT License
