# 🎓 Smart Campus Event Management System

A **production-level, full-stack web application** for managing all campus events — technical, cultural, sports, NSS, workshops, and fests — in one intelligent platform.

---

## ✨ Features

### 🎯 Core
- **Smart Event Management** — Create, edit, delete events with categories
- **Interactive Calendar** — Monthly view with dot indicators per category
- **Venue Conflict Detection** — Alerts when two events share same venue/date/time
- **Role-Based Access** — Student, Organizer, Admin with separate dashboards
- **AI Recommendations** — Personalized events based on interests and history
- **QR Code Check-in** — Auto-generated QR after registration
- **Real-time Notifications** — In-app animated notification center
- **Bookmarks** — Save favourite events
- **Leaderboard** — Most active students by points
- **Analytics Dashboard** — Charts for trends, category breakdown

### 🎨 UI/UX
- Glassmorphism design with blur/transparency
- Dark mode (default) + Light mode toggle
- Framer Motion page & card animations
- Responsive for mobile, tablet, desktop
- Loading skeletons & micro-interactions

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Tailwind CSS, Framer Motion |
| Backend    | Flask (Python 3.10+)                |
| Database   | MySQL 8+                            |
| Auth       | JWT (Flask-JWT-Extended)            |
| Charts     | Recharts                            |
| QR Code    | qrcode.react                        |

---

## 📁 Project Structure

```
smart-campus/
├── frontend/                  # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Sidebar, Topbar, DashboardLayout
│   │   │   └── events/        # EventCard
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── pages/             # All page components
│   │   └── utils/             # api.js (Axios)
│   ├── public/
│   ├── tailwind.config.js
│   └── package.json
├── backend/                   # Flask API
│   ├── routes/
│   │   ├── auth.py            # Login, register, profile
│   │   ├── events.py          # CRUD + register + bookmark + recommend
│   │   ├── admin.py           # User management
│   │   ├── notifications.py   # Notification system
│   │   ├── analytics.py       # Dashboard stats + charts
│   │   └── venues.py          # Venue management + conflict check
│   ├── models/
│   │   └── user.py            # SQLAlchemy models
│   ├── app.py                 # Flask factory + seeder
│   ├── requirements.txt
│   └── .env.example
└── database/
    └── schema.sql             # Full MySQL schema + seed data
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL 8+

---

### 1️⃣ Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
source /path/to/smart-campus/database/schema.sql
```

Or import via MySQL Workbench / phpMyAdmin.

---

### 2️⃣ Backend Setup

```bash
cd smart-campus/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your DB credentials:
# DB_USER=root
# DB_PASS=yourpassword
# DB_NAME=smart_campus

# Start Flask server
python app.py
# ✅ Running on http://localhost:5000
```

---

### 3️⃣ Frontend Setup

```bash
cd smart-campus/frontend

# Install dependencies
npm install

# Start dev server
npm start
# ✅ Running on http://localhost:3000
```

---

## 🔑 Demo Accounts

| Role       | Email                  | Password |
|------------|------------------------|----------|
| Student    | student@demo.com       | demo123  |
| Organizer  | organizer@demo.com     | demo123  |
| Admin      | admin@demo.com         | demo123  |

> Click the quick demo buttons on the Login page for instant access.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | /api/auth/register    | Register user        |
| POST   | /api/auth/login       | Login                |
| GET    | /api/auth/profile     | Get profile          |
| PUT    | /api/auth/profile     | Update profile       |

### Events
| Method | Endpoint                        | Description               |
|--------|---------------------------------|---------------------------|
| GET    | /api/events                     | List events (with filters)|
| POST   | /api/events                     | Create event              |
| GET    | /api/events/:id                 | Get event detail          |
| PUT    | /api/events/:id                 | Update event              |
| DELETE | /api/events/:id                 | Delete event              |
| POST   | /api/events/:id/register        | Register for event        |
| DELETE | /api/events/:id/register        | Unregister               |
| POST   | /api/events/:id/bookmark        | Toggle bookmark           |
| GET    | /api/events/bookmarks           | Get bookmarks             |
| GET    | /api/events/recommended         | AI recommendations        |

### Admin
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | /api/admin/users      | List all users     |
| PUT    | /api/admin/users/:id  | Update user/role   |
| DELETE | /api/admin/users/:id  | Delete user        |

### Notifications
| Method | Endpoint                       | Description         |
|--------|--------------------------------|---------------------|
| GET    | /api/notifications             | Get notifications   |
| PUT    | /api/notifications/:id/read    | Mark read           |
| PUT    | /api/notifications/read-all    | Mark all read       |

### Venues
| Method | Endpoint                      | Description          |
|--------|-------------------------------|----------------------|
| GET    | /api/venues                   | List venues          |
| POST   | /api/venues                   | Create venue (admin) |
| POST   | /api/venues/check-conflict    | Check venue conflict |

### Analytics
| Method | Endpoint                   | Description          |
|--------|----------------------------|----------------------|
| GET    | /api/analytics/dashboard   | Dashboard stats      |

---

## 🤖 AI Recommendation Logic

The recommendation engine scores events by:
1. **Category match** (+50 pts) if event category is in student's interests
2. **Tag match** (+20 pts per matching tag)
3. **Popularity score** (0–100, increments on each registration)
4. Excludes events the student is already registered for

---

## 🔔 Notification Triggers

| Event                       | Who Gets Notified          |
|-----------------------------|----------------------------|
| New event submitted         | All admins                 |
| Event approved              | All students               |
| Student registers for event | That student               |

---

## 🎨 Customization

- **Colors**: Edit `tailwind.config.js` → `colors.primary`
- **Fonts**: Change Google Fonts import in `index.css`
- **Categories**: Update `CATEGORIES` array in `CreateEventPage.jsx` and backend `Enum`
- **Recommendation logic**: Modify `get_recommended()` in `routes/events.py`

---

## 📦 Build for Production

```bash
# Frontend
cd frontend
npm run build
# Output in /build folder — deploy to Netlify, Vercel, or serve with Nginx

# Backend
# Use gunicorn for production:
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

---

## 🙌 Credits

Built with ❤️ using React, Flask, and MySQL.

---

*© 2025 Smart Campus Event Management System*
