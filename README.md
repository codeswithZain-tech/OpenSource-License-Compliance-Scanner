# OpenSource License Compliance Scanner

A professional full-stack web application that scans GitHub repositories, detects open-source licenses, analyzes compliance risks, and generates detailed PDF reports.

> Deployment: See `README_DEPLOY.md` for GitHub-ready + Vercel setup (rewrites + required env vars).


---

## 🚀 Features

### 🔍 License Detection
- Detects 30+ open-source licenses
- Supports:
  - MIT
  - GPL
  - Apache
  - BSD
  - LGPL
  - AGPL
  - MPL
  - ISC
  - Unlicense
  - CC0
- Custom and proprietary license identification
- Risk level assessment:
  - 🟢 LOW
  - 🟡 MEDIUM
  - 🔴 HIGH
- Smart compliance recommendations

---

### 📄 Reporting
- Professional PDF report export
- Scan history tracking
- Interactive analytics dashboard

---

### 👤 Authentication System
- JWT Authentication
- User Registration & Login
- Protected Routes
- Profile Management

---

### 🎨 User Interface
- Dark / Light Mode
- Glassmorphism UI Design
- Fully Responsive Design
- Smooth Animations
- Animated Sidebar Navigation

---

# 🛠️ Technology Stack

## Backend

| Package | Version | Purpose |
|----------|----------|----------|
| Django | 5.2.14 | Backend Framework |
| Django REST Framework | 3.17.1 | REST API Development |
| django-cors-headers | 4.9.0 | React Integration |
| djangorestframework-simplejwt | 5.5.1 | JWT Authentication |
| PyGithub | 2.9.1 | GitHub API Integration |
| ReportLab | 4.5.0 | PDF Report Generation |
| python-dotenv | 1.2.2 | Environment Variables |
| PyJWT | 2.12.1 | JWT Handling |
| requests | 2.33.1 | HTTP Requests |
| cryptography | 48.0.0 | Security Encryption |
| asgiref | 3.11.1 | ASGI Support |
| sqlparse | 0.5.5 | SQL Parsing |
| tzdata | 2026.2 | Timezone Support |

---

## Frontend

| Package | Version | Purpose |
|----------|----------|----------|
| React | 19.2.5 | Frontend Framework |
| React DOM | 19.2.5 | DOM Rendering |
| React Router DOM | 7.15.0 | Routing |
| Axios | 1.16.0 | API Requests |
| Framer Motion | 12.38.0 | Animations |
| Lucide React | 1.14.0 | Icons |
| Tailwind CSS | 3.4.19 | Styling |
| Vite | 8.0.10 | Build Tool |
| PostCSS | 8.5.14 | CSS Processing |
| Autoprefixer | 10.5.0 | CSS Prefixing |
| ESLint | 10.2.1 | Code Linting |

---

# ⚙️ Quick Setup

## 📌 Prerequisites

| Software | Version |
|-----------|----------|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |

---

# 🔧 Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install django djangorestframework django-cors-headers djangorestframework-simplejwt PyGithub reportlab python-dotenv

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

python manage.py runserver
````

---

# 💻 Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🔐 Environment Configuration

Create a `.env` file inside the backend folder:

```env
GITHUB_TOKEN=ghp_your_token_here
```

Generate GitHub Token:

```text
https://github.com/settings/tokens
```

Select:

* repo
* read:org

---

# 🌐 Application URLs

| Service     | URL                                                        |
| ----------- | ---------------------------------------------------------- |
| Frontend    | [http://localhost:5173](http://localhost:5173)             |
| Backend API | [http://localhost:8000](http://localhost:8000)             |
| Admin Panel | [http://localhost:8000/admin](http://localhost:8000/admin) |

---

# 📡 API Endpoints

| Method | Endpoint              | Description            |
| ------ | --------------------- | ---------------------- |
| POST   | `/api/scan/`          | Scan GitHub Repository |
| GET    | `/api/history/`       | Get Scan History       |
| POST   | `/api/export-pdf/`    | Export PDF Report      |
| POST   | `/api/auth/register/` | User Registration      |
| POST   | `/api/auth/login/`    | User Login             |
| POST   | `/api/auth/logout/`   | User Logout            |
| GET    | `/api/test/`          | Test API Connection    |

---

# 🛡️ License Detection Coverage

| License     | Risk Level | Commercial Use         |
| ----------- | ---------- | ---------------------- |
| MIT         | 🟢 LOW     | ✅ Allowed              |
| Apache 2.0  | 🟢 LOW     | ✅ Allowed              |
| BSD         | 🟢 LOW     | ✅ Allowed              |
| ISC         | 🟢 LOW     | ✅ Allowed              |
| GPL         | 🔴 HIGH    | ⚠️ Must Open Source    |
| AGPL        | 🔴 HIGH    | ⚠️ Network Copyleft    |
| LGPL        | 🟡 MEDIUM  | ✅ Library Usage        |
| MPL         | 🟡 MEDIUM  | ⚠️ File-Level Copyleft |
| Proprietary | 🔴 HIGH    | ❌ Restricted           |
| No License  | 🟡 MEDIUM  | ❌ Default Copyright    |

---

# 🧪 Test Repositories

```text
https://github.com/facebook/react
→ MIT License (LOW Risk)

https://github.com/torvalds/linux
→ GPL License (HIGH Risk)

https://github.com/django/django
→ BSD License (LOW Risk)

https://github.com/tensorflow/tensorflow
→ Apache License (LOW Risk)
```

---

# 📁 Project Structure

```text
license-scanner/
│
├── backend/
│   ├── scanner/
│   │   ├── services/
│   │   │   ├── github_service.py
│   │   │   └── pdf_service.py
│   │   ├── models.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── accounts/
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   ├── license_scanner/
│   │   └── settings.py
│   │
│   ├── manage.py
│   └── db.sqlite3
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx
    │   │
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Scanner.jsx
    │   │   ├── History.jsx
    │   │   └── Login.jsx
    │   │
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    │
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

# 🛠️ Troubleshooting

| Error                    | Solution                            |
| ------------------------ | ----------------------------------- |
| No module named 'django' | Activate virtual environment        |
| CORS Error               | Set `CORS_ALLOW_ALL_ORIGINS = True` |
| 403 Forbidden            | Add `@csrf_exempt`                  |
| Port Already in Use      | Change Port Number                  |
| Invalid GitHub Token     | Regenerate Token                    |

---

# 👨‍💻 Author

**Zain Kashif**

---

# License

This project is licensed under the MIT License.

```
```
