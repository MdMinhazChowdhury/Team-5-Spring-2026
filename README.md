# FinanceTracker — Team 5, Spring 2026

A full-stack personal finance tracking web application that allows users to manage bank accounts, track transactions, monitor spending by category, and view financial summaries — all behind a secure, authenticated experience.

---

## Team Members

| Name | Role |
|------|------|
| Nyisaiah Hall | Frontend & Backend |
| Ayden Beach | Backend |
| Milton Boyd | Frontend |
| Khaleel Theophile | Frontend |
| Jack Nixon | Database |

---

## Tech Stack
<<<<<<< HEAD
- Frontend: Milton Boyd, Khaleel Theophile, Nyisaiah Hall
- Backend: Ayden Beach, Nyisaiah Hall
- Database: Jack Nixon
=======
>>>>>>> 1028edbfcc14fc618b81e645f5a3675c785ba6f8

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router, Recharts |
| Backend | FastAPI (Python 3.14+) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Styling | Inline JavaScript styles, Optima serif font |
| Testing | Vitest + React Testing Library (frontend), Pytest (backend) |

---

## Features

### Authentication
- User registration with first name, last name, email, and password
- Secure login via Supabase JWT authentication
- Auto-login after signup — no second login required
- All protected routes require a valid Bearer token

### Dashboard
- Personalized welcome message using the logged-in user's real name
- Horizontally scrollable row of account cards showing each linked account's type (Checking/Savings) and current balance
- Total Balance card summing all linked accounts
- Monthly Income and Monthly Expenses wired to real transaction data
- Spending by Category donut chart
- Income vs. Expenses 6-month bar chart
- Recent Transactions list
- Budget Alerts with progress bars
- `USE_MOCK_DATA` flag in `Dashboard.jsx` for toggling between live API data and hardcoded test data during development

### Account Management
- Users can link multiple bank accounts (Checking or Savings)
- Accounts are created, listed, and deleted from the Edit Profile modal
- Dashboard automatically reflects all linked accounts

### Profile Editing
- Clickable user section in the sidebar opens an Edit Profile modal
- Users can update first name, last name, email, and password
- Sidebar displays real name and email fetched from Supabase on load

---

## Project Structure

```
Team-5-Spring-2026/
├── backend/
│   ├── main.py                  # FastAPI app entry point, router registration
│   ├── auth.py                  # JWT token verification dependency
│   ├── supabase_client.py       # Supabase client singleton
│   ├── requirements.txt
│   ├── .env                     # SUPABASE_URL, SUPABASE_KEY (not committed)
│   ├── Routes/
│   │   ├── Login.py             # POST /login
│   │   ├── Signup.py            # POST /signup
│   │   ├── User.py              # GET /user, PUT /user
│   │   ├── Accounts.py          # GET/POST/DELETE /accounts
│   │   ├── Transactions.py      # Full CRUD + reporting endpoints
│   │   └── Dashboard.py         # GET /dashboard/summary
│   └── services/
│       └── transaction_service.py  # Supabase RPC wrappers
└── frontend/
    ├── index.html
    ├── src/
    │   ├── App.jsx              # Router, layout, protected route wrapper
    │   ├── main.jsx
    │   ├── index.css            # Global styles, font stack
    │   ├── services/
    │   │   └── api.js           # All fetch calls (authApi, userApi, accountsApi, transactionApi)
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Main dashboard view
    │   │   ├── Login.jsx        # Login + signup toggle
    │   │   └── Transactions.jsx
    │   └── components/
    │       ├── Navbar.jsx           # Sidebar navigation + user section
    │       ├── EditProfileModal.jsx # Profile edit + linked accounts modal
    │       └── SpendingChart.jsx    # Recharts donut chart component
    └── vite.config.js
```

---

## Running the App

### Prerequisites
- Python 3.14+
- Node.js 18+
- A Supabase project with the required tables and RPC functions

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Create backend/.env with your Supabase credentials:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-anon-key

uvicorn main:app --reload
# Runs on http://localhost:8000
# Interactive API docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Environment Variables

### `backend/.env`
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

> The `.env` file is gitignored and must be created manually. Never commit credentials.

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/login` | No | Authenticate and receive a JWT |
| POST | `/signup` | No | Register a new user, returns JWT |
| GET | `/user` | Yes | Get current user's profile and metadata |
| PUT | `/user` | Yes | Update name, email, or password |
| GET | `/accounts` | Yes | List all linked accounts |
| POST | `/accounts` | Yes | Add a new account |
| DELETE | `/accounts/{id}` | Yes | Delete an account |
| GET | `/transactions` | Yes | Get transactions (with optional filters) |
| POST | `/transactions` | Yes | Create a new transaction |
| PUT | `/transactions/{id}` | Yes | Update a transaction |
| DELETE | `/transactions/{id}` | Yes | Delete a transaction |
| GET | `/transactions/monthly-income` | Yes | Total income for a given month |
| GET | `/transactions/monthly-spending` | Yes | Total spending for a given month |
| GET | `/transactions/spending-by-category` | Yes | Spending breakdown by category |
| GET | `/dashboard/summary` | Yes | High-level financial summary |

---

## Running Tests

### Frontend
```bash
cd frontend
npm run test                                          # Run all tests
npx vitest run src/pages/Dashboard.test.jsx          # Run a single test file
```

### Backend
```bash
cd backend
source .venv/bin/activate
pytest tests/                                         # Run all tests
pytest tests/test_routes.py                          # Run a single test file
```

---

## Auth Flow

1. User submits login or signup credentials on the `/login` page
2. Backend validates with Supabase and returns a Supabase JWT (`access_token`)
3. Frontend stores the token in `localStorage`
4. All subsequent API requests include `Authorization: Bearer <token>` in the header
5. Backend `verify_token` dependency validates the token against Supabase on every protected route
6. `ProtectedRoute` in `App.jsx` redirects unauthenticated users to `/login`
