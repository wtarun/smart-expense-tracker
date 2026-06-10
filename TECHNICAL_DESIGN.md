# Smart Expense Tracker — Technical Design Document

> **Role:** Senior Software Architect
> **Status:** Pre-implementation design. No code generated.
> **Date:** 2026-06-10

---

## Context

A production-ready Smart Expense Tracker built from scratch. Users can log expenses, manage budgets, visualize spending patterns via charts, set up recurring expenses, and receive budget alerts. The system is a decoupled architecture: a Django REST API backend served on Render, a React + Vite SPA frontend deployed on Vercel, and a managed PostgreSQL database on Render.

---

## 1. Project Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│              React + Vite SPA (Vercel CDN)                   │
│   React Router │ MUI │ Axios │ Chart.js │ React Hook Form    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (JWT in Authorization header)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   DJANGO REST API (Render)                    │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐  │
│  │  urls.py │→ │   Views    │→ │Serializers│→ │ Services │  │
│  │ (routing)│  │(DRF APIView│  │(validate/ │  │(business │  │
│  │          │  │/ViewSets)  │  │ serialize)│  │  logic)  │  │
│  └──────────┘  └────────────┘  └──────────┘  └────┬─────┘  │
│                                                     │        │
│  ┌──────────────────────────────────────────────────▼─────┐ │
│  │                    Django ORM / Models                   │ │
│  └──────────────────────────────────────────────────────── ┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ TCP / SSL
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               PostgreSQL (Render Managed DB)                  │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow (JWT)

```
1. POST /api/auth/login/ → {access, refresh}
2. Frontend stores access token in memory (not localStorage)
   and refresh token in httpOnly cookie
3. Axios request interceptor attaches: Authorization: Bearer <access>
4. Axios response interceptor catches 401 → calls POST /api/auth/token/refresh/
5. On refresh success → retry original request with new access token
6. On refresh failure → logout, redirect to /login
```

### Django Internal Layering

```
Request → urls.py → Middleware (CORS, JWT) → ViewSet/APIView
       → Permission classes → Serializer (validate)
       → Service layer (business logic, DB writes)
       → Model (ORM) → PostgreSQL
       → Serializer (serialize output) → Response
```

### Docker Compose Topology (Local Dev)

```
services:
  db          → postgres:16-alpine   port 5432
  backend     → django + gunicorn    port 8000  (depends: db)
  frontend    → node + vite dev      port 5173  (depends: backend)
```

---

## 2. Complete Folder Structure

### Backend (Django)

```
smart-expense-tracker/
└── backend/
    ├── manage.py
    ├── requirements.txt
    ├── requirements-dev.txt
    ├── Dockerfile
    ├── .env.example
    ├── .gitignore
    │
    ├── config/                         # Django project config
    │   ├── __init__.py
    │   ├── urls.py                     # Root URL router
    │   ├── wsgi.py
    │   ├── asgi.py
    │   └── settings/
    │       ├── __init__.py
    │       ├── base.py                 # Shared settings
    │       ├── development.py          # DEBUG=True, local DB
    │       └── production.py           # Render env vars, security headers
    │
    ├── apps/
    │   ├── authentication/             # User registration, login, JWT, profile
    │   │   ├── __init__.py
    │   │   ├── models.py               # UserProfile (extends AbstractUser)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── permissions.py
    │   │   └── migrations/
    │   │
    │   ├── expenses/                   # Core expense CRUD
    │   │   ├── __init__.py
    │   │   ├── models.py               # Expense, ExpenseTag (M2M)
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── filters.py              # django-filter: date range, category, tag
    │   │   ├── services.py             # Business logic (bulk create, validation)
    │   │   └── migrations/
    │   │
    │   ├── categories/                 # Expense categories (system + user-defined)
    │   │   ├── __init__.py
    │   │   ├── models.py               # Category
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   └── migrations/
    │   │
    │   ├── tags/                       # Freeform tags for expenses
    │   │   ├── __init__.py
    │   │   ├── models.py               # Tag
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   └── migrations/
    │   │
    │   ├── budgets/                    # Monthly/custom budgets per category
    │   │   ├── __init__.py
    │   │   ├── models.py               # Budget
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── services.py             # Budget utilization calculation
    │   │   └── migrations/
    │   │
    │   ├── recurring/                  # Recurring expense templates
    │   │   ├── __init__.py
    │   │   ├── models.py               # RecurringExpense
    │   │   ├── serializers.py
    │   │   ├── views.py
    │   │   ├── urls.py
    │   │   ├── services.py             # Spawn expense instances from templates
    │   │   └── migrations/
    │   │
    │   ├── analytics/                  # Aggregated reporting endpoints
    │   │   ├── __init__.py
    │   │   ├── views.py                # Dashboard, monthly trend, category breakdown
    │   │   ├── serializers.py
    │   │   ├── services.py             # Complex DB aggregations
    │   │   └── urls.py
    │   │
    │   └── notifications/              # In-app budget alerts
    │       ├── __init__.py
    │       ├── models.py               # Notification
    │       ├── serializers.py
    │       ├── views.py
    │       └── migrations/
    │
    └── utils/
        ├── __init__.py
        ├── response.py                 # Standardized R.success() / R.error()
        ├── pagination.py               # Custom PageNumberPagination
        ├── exceptions.py              # Global DRF exception handler
        ├── permissions.py             # IsOwner permission class
        └── validators.py              # Reusable field validators
```

### Frontend (React + Vite)

```
smart-expense-tracker/
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── .env.example
    ├── .gitignore
    ├── eslint.config.js
    ├── Dockerfile
    │
    └── src/
        ├── main.jsx                    # App entry, theme provider, router
        ├── App.jsx                     # Root component, route definitions
        │
        ├── api/                        # Axios instances + per-resource clients
        │   ├── axiosInstance.js        # Base axios config, interceptors, JWT refresh
        │   ├── authApi.js
        │   ├── expensesApi.js
        │   ├── categoriesApi.js
        │   ├── tagsApi.js
        │   ├── budgetsApi.js
        │   ├── recurringApi.js
        │   ├── analyticsApi.js
        │   └── notificationsApi.js
        │
        ├── routes/                     # Route definitions + guards
        │   ├── index.jsx               # All <Route> declarations
        │   ├── PrivateRoute.jsx        # Redirect to /login if not authenticated
        │   └── PublicRoute.jsx         # Redirect to /dashboard if authenticated
        │
        ├── theme/
        │   ├── index.js                # MUI createTheme (light + dark)
        │   ├── palette.js
        │   └── typography.js
        │
        ├── store/                      # React Context for global state
        │   ├── AuthContext.jsx         # User, tokens, login/logout actions
        │   └── NotificationContext.jsx # Snackbar / toast queue
        │
        ├── hooks/                      # Shared custom hooks
        │   ├── useAuth.js
        │   ├── useExpenses.js          # Fetch + mutate expenses
        │   ├── useBudgets.js
        │   ├── useAnalytics.js
        │   └── useDebounce.js
        │
        ├── components/                 # Pure, reusable UI components
        │   ├── layout/
        │   │   ├── AppLayout.jsx       # Sidebar + topbar wrapper
        │   │   ├── Sidebar.jsx
        │   │   ├── TopBar.jsx
        │   │   └── PageWrapper.jsx
        │   ├── common/
        │   │   ├── ConfirmDialog.jsx
        │   │   ├── LoadingSpinner.jsx
        │   │   ├── EmptyState.jsx
        │   │   ├── ErrorBoundary.jsx
        │   │   └── DataTable.jsx
        │   └── charts/
        │       ├── LineChart.jsx       # Monthly trend
        │       ├── PieChart.jsx        # Category breakdown
        │       ├── BarChart.jsx        # Budget vs actual
        │       └── chartDefaults.js    # Chart.js global defaults
        │
        ├── features/                   # Feature-sliced modules
        │   ├── auth/
        │   │   ├── LoginPage.jsx
        │   │   ├── RegisterPage.jsx
        │   │   └── ForgotPasswordPage.jsx
        │   │
        │   ├── dashboard/
        │   │   ├── DashboardPage.jsx
        │   │   ├── SummaryCards.jsx    # Total spent, budget remaining, etc.
        │   │   └── RecentExpenses.jsx
        │   │
        │   ├── expenses/
        │   │   ├── ExpensesPage.jsx
        │   │   ├── ExpenseList.jsx
        │   │   ├── ExpenseForm.jsx     # Add / Edit expense drawer
        │   │   ├── ExpenseFilters.jsx  # Date, category, tag, amount filters
        │   │   └── ExpenseCard.jsx
        │   │
        │   ├── budgets/
        │   │   ├── BudgetsPage.jsx
        │   │   ├── BudgetList.jsx
        │   │   ├── BudgetForm.jsx
        │   │   └── BudgetProgressBar.jsx
        │   │
        │   ├── categories/
        │   │   ├── CategoriesPage.jsx
        │   │   ├── CategoryList.jsx
        │   │   └── CategoryForm.jsx
        │   │
        │   ├── analytics/
        │   │   ├── AnalyticsPage.jsx
        │   │   ├── MonthlyTrendSection.jsx
        │   │   ├── CategoryBreakdownSection.jsx
        │   │   └── TopExpensesSection.jsx
        │   │
        │   ├── recurring/
        │   │   ├── RecurringPage.jsx
        │   │   ├── RecurringList.jsx
        │   │   └── RecurringForm.jsx
        │   │
        │   └── settings/
        │       ├── SettingsPage.jsx
        │       ├── ProfileForm.jsx
        │       └── ChangePasswordForm.jsx
        │
        └── utils/
            ├── formatCurrency.js
            ├── formatDate.js
            ├── constants.js            # API base URL, date formats, etc.
            └── validationSchemas.js    # Yup schemas shared across forms
```

### Docker Compose Root

```
smart-expense-tracker/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
├── README.md
├── backend/
└── frontend/
```

---

## 3. Database Schema

All tables use PostgreSQL. UUID primary keys throughout for security and portability.

### Table: `users`
Extends Django AbstractUser.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| username | VARCHAR(150) | UNIQUE, NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| password | VARCHAR(255) | NOT NULL (hashed) |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'USD' |
| timezone | VARCHAR(50) | NOT NULL, DEFAULT 'UTC' |
| avatar_url | VARCHAR(500) | NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| date_joined | TIMESTAMPTZ | DEFAULT NOW() |
| last_login | TIMESTAMPTZ | NULL |

Indexes: `email`, `username`

---

### Table: `categories`
System-level defaults + user-defined categories.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NULL (NULL = system default) |
| name | VARCHAR(100) | NOT NULL |
| icon | VARCHAR(50) | NULL (icon name e.g. "FoodBankOutlined") |
| color | VARCHAR(7) | NULL (hex, e.g. "#FF6B6B") |
| is_system | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

Indexes: `user_id`, UNIQUE(`user_id`, `name`)

---

### Table: `tags`
Freeform labels attached to expenses.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| name | VARCHAR(50) | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

Indexes: `user_id`, UNIQUE(`user_id`, `name`)

---

### Table: `expenses`
Core transaction record.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| category_id | UUID | FK → categories.id, NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| amount | NUMERIC(12, 2) | NOT NULL, CHECK(amount > 0) |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'USD' |
| expense_date | DATE | NOT NULL |
| notes | TEXT | NULL |
| receipt_url | VARCHAR(500) | NULL |
| payment_method | VARCHAR(30) | CHECK IN ('cash','card','bank_transfer','upi','other') |
| is_recurring | BOOLEAN | DEFAULT FALSE |
| recurring_id | UUID | FK → recurring_expenses.id, NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

Indexes: `user_id`, `category_id`, `expense_date`, `recurring_id`

---

### Table: `expense_tags` (M2M join)

| Column | Type | Constraints |
|---|---|---|
| expense_id | UUID | FK → expenses.id |
| tag_id | UUID | FK → tags.id |

Primary Key: (`expense_id`, `tag_id`)

---

### Table: `budgets`
Monthly spending limits per category.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| category_id | UUID | FK → categories.id, NOT NULL |
| amount | NUMERIC(12, 2) | NOT NULL, CHECK(amount > 0) |
| period_type | VARCHAR(20) | CHECK IN ('monthly', 'weekly', 'yearly', 'custom') |
| start_date | DATE | NOT NULL |
| end_date | DATE | NULL (NULL = open-ended) |
| alert_threshold | NUMERIC(5, 2) | DEFAULT 80.00 (% at which to alert) |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

Indexes: `user_id`, `category_id`, UNIQUE(`user_id`, `category_id`, `start_date`)

---

### Table: `recurring_expenses`
Templates that auto-generate expense records.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| category_id | UUID | FK → categories.id, NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| amount | NUMERIC(12, 2) | NOT NULL, CHECK(amount > 0) |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'USD' |
| frequency | VARCHAR(20) | CHECK IN ('daily','weekly','monthly','yearly') |
| interval | SMALLINT | DEFAULT 1 (every N frequency units) |
| start_date | DATE | NOT NULL |
| end_date | DATE | NULL |
| next_due_date | DATE | NOT NULL |
| last_generated_at | TIMESTAMPTZ | NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| notes | TEXT | NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

Indexes: `user_id`, `next_due_date`, `is_active`

---

### Table: `notifications`
In-app alerts (budget threshold reached, recurring upcoming).

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| type | VARCHAR(30) | CHECK IN ('budget_alert','recurring_due','system') |
| title | VARCHAR(200) | NOT NULL |
| message | TEXT | NOT NULL |
| is_read | BOOLEAN | DEFAULT FALSE |
| related_budget_id | UUID | FK → budgets.id, NULL |
| related_recurring_id | UUID | FK → recurring_expenses.id, NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

Indexes: `user_id`, `is_read`, `created_at`

---

## 4. ER Diagram Description

### Entities and Relationships

**users (1) → (many) categories**
A user can create their own custom categories. System categories have `user_id = NULL` and are shared across all users.

**users (1) → (many) tags**
Each tag belongs to exactly one user. Tags are personal and not shared.

**users (1) → (many) expenses**
Each expense is owned by exactly one user. A user can have unlimited expenses.

**users (1) → (many) budgets**
A user can have one active budget per category per time period.

**users (1) → (many) recurring_expenses**
A user can configure unlimited recurring expense templates.

**users (1) → (many) notifications**
Each notification targets exactly one user.

**categories (1) → (many) expenses**
Each expense is assigned to exactly one category. A category can have many expenses.

**categories (1) → (many) budgets**
Each budget is tied to exactly one category. A category can have multiple budgets (different time periods).

**categories (1) → (many) recurring_expenses**
Each recurring template is assigned one category.

**expenses (many) ↔ (many) tags**  (via `expense_tags`)
An expense can have zero or more tags. A tag can be applied to many expenses. The join table `expense_tags` enforces the M2M relationship.

**recurring_expenses (1) → (many) expenses**
When a recurring template fires, it creates an `expense` record and sets `expenses.recurring_id` back to the template. This allows seeing all instances generated from one template.

**budgets (1) → (many) notifications**
When budget utilization crosses `alert_threshold`, a notification is created referencing the budget.

**recurring_expenses (1) → (many) notifications**
When a recurring expense is upcoming, an alert notification is created.

### Cardinality Summary

```
users          1 ── * categories         (user_id nullable for system cats)
users          1 ── * tags
users          1 ── * expenses
users          1 ── * budgets
users          1 ── * recurring_expenses
users          1 ── * notifications
categories     1 ── * expenses
categories     1 ── * budgets
categories     1 ── * recurring_expenses
expenses       * ── * tags               (via expense_tags)
recurring_expenses 1 ── * expenses       (recurring_id on expense)
budgets        1 ── * notifications
recurring_expenses 1 ── * notifications
```

---

## 5. API Design

### Conventions
- Base URL: `https://api.smartexpense.app/api/v1`
- Auth: `Authorization: Bearer <access_token>` on all protected routes
- Response envelope:
  ```json
  { "success": true, "data": {}, "message": "OK" }
  { "success": false, "error": "Validation failed", "details": {} }
  ```
- Pagination: `?page=1&page_size=20` → `{ "count": 100, "next": "...", "results": [] }`
- Dates: ISO 8601 (`YYYY-MM-DD`)
- Amounts: string-encoded decimals (`"42.50"`) to avoid float precision issues

---

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register/` | No | Create account |
| POST | `/auth/login/` | No | Get access + refresh token |
| POST | `/auth/token/refresh/` | No | Refresh access token |
| POST | `/auth/logout/` | Yes | Blacklist refresh token |
| GET | `/auth/me/` | Yes | Get current user profile |
| PATCH | `/auth/me/` | Yes | Update profile (name, currency, timezone) |
| POST | `/auth/change-password/` | Yes | Change password |

**POST /auth/register/**
```
Request:  { "email", "username", "first_name", "last_name", "password", "password_confirm" }
Response: 201 { "data": { "id", "email", "username" }, "message": "Account created" }
Errors:   400 (validation), 409 (email/username taken)
```

**POST /auth/login/**
```
Request:  { "email", "password" }
Response: 200 { "data": { "access", "refresh", "user": { "id", "email", "username", "currency" } } }
Errors:   401 (invalid credentials), 403 (inactive account)
```

---

### Expenses Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/expenses/` | Yes | List expenses (filtered, paginated) |
| POST | `/expenses/` | Yes | Create expense |
| GET | `/expenses/{id}/` | Yes | Get single expense |
| PATCH | `/expenses/{id}/` | Yes | Partial update expense |
| DELETE | `/expenses/{id}/` | Yes | Delete expense |
| POST | `/expenses/bulk/` | Yes | Bulk create expenses (CSV import) |

**GET /expenses/**
```
Query params:
  category_id, tag_id, payment_method,
  date_from (YYYY-MM-DD), date_to (YYYY-MM-DD),
  amount_min, amount_max,
  search (title/notes fulltext),
  ordering (expense_date, amount, created_at; prefix - for desc),
  page, page_size

Response: 200 paginated list of expense objects
```

**Expense Object:**
```json
{
  "id": "uuid",
  "title": "Grocery run",
  "amount": "42.50",
  "currency": "USD",
  "expense_date": "2026-06-10",
  "category": { "id": "uuid", "name": "Food", "icon": "...", "color": "#FF6B6B" },
  "tags": [{ "id": "uuid", "name": "weekly" }],
  "payment_method": "card",
  "notes": "Farmer's market",
  "receipt_url": null,
  "is_recurring": false,
  "created_at": "2026-06-10T08:00:00Z"
}
```

**POST /expenses/**
```
Request:  { "title", "amount", "currency"?, "expense_date", "category_id",
            "tag_ids"?: [], "payment_method"?, "notes"?, "receipt_url"? }
Response: 201 expense object
Errors:   400 (validation), 404 (category not found or not owned by user)
```

---

### Categories Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/categories/` | Yes | List all (system + user's own) |
| POST | `/categories/` | Yes | Create custom category |
| PATCH | `/categories/{id}/` | Yes | Update (own only) |
| DELETE | `/categories/{id}/` | Yes | Delete (own only, if no expenses linked) |

---

### Tags Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/tags/` | Yes | List user's tags |
| POST | `/tags/` | Yes | Create tag |
| DELETE | `/tags/{id}/` | Yes | Delete tag |

---

### Budgets Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/budgets/` | Yes | List budgets with utilization |
| POST | `/budgets/` | Yes | Create budget |
| GET | `/budgets/{id}/` | Yes | Get budget + utilization detail |
| PATCH | `/budgets/{id}/` | Yes | Update budget |
| DELETE | `/budgets/{id}/` | Yes | Delete budget |

**Budget Object (with utilization):**
```json
{
  "id": "uuid",
  "category": { "id": "uuid", "name": "Food", "color": "#FF6B6B" },
  "amount": "500.00",
  "period_type": "monthly",
  "start_date": "2026-06-01",
  "end_date": null,
  "alert_threshold": 80.0,
  "is_active": true,
  "utilization": {
    "spent": "320.50",
    "remaining": "179.50",
    "percentage": 64.1
  }
}
```

---

### Recurring Expenses Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/recurring/` | Yes | List recurring templates |
| POST | `/recurring/` | Yes | Create recurring template |
| GET | `/recurring/{id}/` | Yes | Get template + generated history |
| PATCH | `/recurring/{id}/` | Yes | Update template |
| DELETE | `/recurring/{id}/` | Yes | Deactivate template |
| POST | `/recurring/{id}/generate/` | Yes | Manually trigger generation |

---

### Analytics Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/analytics/dashboard/` | Yes | Summary cards data |
| GET | `/analytics/monthly-trend/` | Yes | Spending by month (last N months) |
| GET | `/analytics/category-breakdown/` | Yes | Spending % by category |
| GET | `/analytics/top-expenses/` | Yes | Top N expenses in period |
| GET | `/analytics/budget-vs-actual/` | Yes | Budget vs actual per category |

**GET /analytics/dashboard/**
```
Query: month (YYYY-MM, default current month)
Response:
{
  "total_spent_this_month": "1240.00",
  "total_spent_last_month": "980.50",
  "month_over_month_change": 26.5,
  "active_budgets_count": 4,
  "budgets_exceeded": 1,
  "top_category": { "name": "Food", "amount": "420.00" },
  "recent_expenses": [ ...5 expense objects... ]
}
```

**GET /analytics/monthly-trend/**
```
Query: months=6 (how many months back)
Response: { "data": [ { "month": "2026-01", "total": "980.00" }, ... ] }
```

**GET /analytics/category-breakdown/**
```
Query: date_from, date_to
Response: { "data": [ { "category": "Food", "amount": "420.00", "percentage": 33.9 }, ... ] }
```

---

### Notifications Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications/` | Yes | List notifications (unread first) |
| PATCH | `/notifications/{id}/read/` | Yes | Mark as read |
| POST | `/notifications/mark-all-read/` | Yes | Mark all as read |
| DELETE | `/notifications/{id}/` | Yes | Delete notification |

---

## 6. Development Roadmap

### Phase 1 — Project Scaffolding + Authentication
**Duration:** ~1 week
**Goal:** Working dev environment, user registration + login with JWT.

**Backend deliverables:**
- Django project created with `config/settings/` (base / development / production)
- `apps/authentication` with User model, register, login, refresh, logout, /me endpoints
- `utils/` layer: `response.py`, `exceptions.py`, `pagination.py`
- PostgreSQL connected, migrations running
- CORS configured for Vite dev server
- `.env.example` with all required variables documented

**Frontend deliverables:**
- Vite + React project scaffolded
- MUI theme configured (light/dark toggle)
- `src/api/axiosInstance.js` with JWT interceptors (attach token, auto-refresh, logout on 401)
- `AuthContext` with login/logout/register actions
- `PrivateRoute` / `PublicRoute` guards
- Login page, Register page (React Hook Form + Yup validation)
- React Router configured with all top-level routes declared

**Docker:**
- `docker-compose.yml` with `db`, `backend`, `frontend` services
- Backend Dockerfile (python:3.12-slim + gunicorn)
- Frontend Dockerfile (node:20-alpine + vite)

**Acceptance criteria:**
- `docker compose up` starts all three services
- User can register, log in, receive tokens, and access a protected `/api/v1/auth/me/` endpoint
- Axios interceptor successfully refreshes expired access token without user action

---

### Phase 2 — Core Expense CRUD
**Duration:** ~1 week
**Goal:** Users can create, read, update, and delete expenses with categories and tags.

**Backend deliverables:**
- `apps/categories` — CRUD, system seed data (Food, Transport, Housing, Health, Entertainment, Shopping, Other)
- `apps/tags` — CRUD
- `apps/expenses` — full CRUD with filtering (`django-filter`), ordering, search, pagination
- `IsOwner` permission class: users can only access their own data
- All expense endpoints tested manually via Postman / curl

**Frontend deliverables:**
- Dashboard page shell with placeholder cards
- Expenses list page with sortable table / card layout
- Expense form (add / edit) as a MUI Drawer
- Category and Tag selectors in expense form
- Filters panel (date range, category, tag, amount range)
- Delete confirmation dialog
- Currency and date formatting utilities

**Acceptance criteria:**
- Full expense lifecycle works in the browser (create → read → update → delete)
- Filters correctly narrow the expense list
- Data is paginated (20 per page)
- User A cannot access User B's expenses (403 returned)

---

### Phase 3 — Budgets + Recurring Expenses
**Duration:** ~1 week
**Goal:** Users can set category budgets and configure auto-recurring expenses.

**Backend deliverables:**
- `apps/budgets` — CRUD + utilization calculation (aggregate expenses in budget period)
- Budget alert logic: when `spent / budget >= alert_threshold`, create a `notifications` record
- `apps/recurring` — CRUD for templates + `generate` action that creates an expense from template
- Management command: `python manage.py generate_recurring_expenses` (runs daily via Render cron)
- `apps/notifications` — list, mark read, delete endpoints

**Frontend deliverables:**
- Budgets page: list with `BudgetProgressBar` (color-coded: green < 60%, yellow 60-80%, red > 80%)
- Budget form: create/edit drawer
- Recurring expenses page: list with frequency badge
- Recurring form: create/edit
- Notification bell in TopBar with unread count badge
- Notification dropdown with mark-all-read

**Acceptance criteria:**
- Creating a budget and logging expenses updates the utilization in real time
- Budget exceeding threshold creates a notification visible in TopBar
- Recurring template generates expense record when "Generate Now" is triggered
- Management command correctly advances `next_due_date` after generation

---

### Phase 4 — Analytics + Dashboard
**Duration:** ~1 week
**Goal:** Visual insights into spending patterns using Chart.js.

**Backend deliverables:**
- `apps/analytics` — all five analytics endpoints
- Dashboard summary endpoint with MoM comparison
- Monthly trend query (GROUP BY month, aggregate SUM)
- Category breakdown query (percentage of total per category)
- Budget vs actual comparison endpoint
- Top expenses endpoint

**Frontend deliverables:**
- Dashboard fully populated: summary cards (total spent, budget remaining, MoM change, top category), recent expenses table
- Analytics page with:
  - `LineChart` — monthly spending trend (last 6 months)
  - `PieChart` — category breakdown (current month)
  - `BarChart` — budget vs actual per category
  - Top 5 expenses table
- Chart.js global defaults configured (colors, fonts, tooltips matching MUI theme)
- Date range picker to re-query analytics for custom periods

**Acceptance criteria:**
- Dashboard loads in < 2s on Render free tier
- Charts render correctly with real data
- Changing date range re-fetches and re-renders all charts
- Empty state shown when no data exists for the period

---

### Phase 5 — Settings, Export, and Deployment
**Duration:** ~1 week
**Goal:** Production deployment live on Vercel + Render with CI discipline.

**Backend deliverables:**
- Settings endpoints (profile update, change password, currency preference)
- Expense export: `GET /expenses/export/?format=csv` returns downloadable CSV
- Production settings: `ALLOWED_HOSTS`, `SECURE_*` headers, `CONN_MAX_AGE`, whitenoise for static
- `gunicorn` with `--workers 2` for Render free tier
- Environment variable documentation for Render dashboard

**Frontend deliverables:**
- Settings page: profile form, change password form, currency/timezone selector
- Export button on Expenses page that triggers CSV download
- Dark/light mode toggle persisted in localStorage
- Error boundary wrapping all pages
- 404 and 500 error pages

**Deployment:**
- Backend: Render Web Service connected to GitHub, auto-deploy on `main` push
- Render PostgreSQL instance provisioned, `DATABASE_URL` env var set
- Frontend: Vercel connected to GitHub, `VITE_API_BASE_URL` env var set to Render backend URL
- `docker-compose.prod.yml` for optional self-hosted deployment

**Acceptance criteria:**
- Live URL accessible for both frontend and backend
- JWT login works end-to-end on production URLs
- Database migrations run on Render deploy via `release command`
- CSV export downloads correctly in the browser
- HTTPS enforced on both frontend and backend

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| UUID PKs | Yes | Prevents enumeration attacks, safe for external APIs |
| Token storage | Access: memory, Refresh: httpOnly cookie | Balances XSS and CSRF protection |
| Soft delete | No | Hard delete with DB constraints; simpler schema |
| Currency handling | NUMERIC(12,2) + string serialization | Avoids float precision loss |
| Recurring generation | Management command (cron) | Simpler than Celery for this scale; upgrade path available |
| State management | React Context only | No Redux needed; server state via Axios + useEffect hooks |
| API versioning | `/api/v1/` prefix | Forward-compatible without breaking existing clients |
| System categories | Seeded via migration | Always available; user can add custom ones on top |
