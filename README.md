# 💰 FinanceFlow API

A complete backend + interactive dashboard for finance data processing with role-based access control, financial records CRUD, and real-time analytics.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Runtime** | Node.js + Express | Fast to develop, industry standard |
| **Database** | SQLite (via `sql.js`) | Zero config, file-based, portable |
| **Auth** | JWT (`jsonwebtoken` + `bcryptjs`) | Stateless token auth |
| **Validation** | Joi | Declarative schema validation |
| **Charts** | Chart.js | Interactive charts in the dashboard |
| **Architecture** | MVC + Services | Clean separation of concerns |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Seed the database with demo data
npm run seed

# 3. Start the server
npm start

# 4. Open the dashboard
# Visit http://localhost:4000 in your browser
```

The server runs on **http://localhost:4000** by default.

---

## 🖥️ Interactive Dashboard

The frontend dashboard is served automatically at the root URL (`/`). Features include:

- **Login screen** with demo account quick-access buttons
- **Dynamic filter bar** — filter by date range, type, category, and user ID
- **Animated summary cards** — total income, expenses, net balance, record count
- **Monthly Trends chart** — bar chart comparing income vs expenses per month
- **Category Breakdown** — doughnut chart showing spending distribution
- **Recent Activity table** — latest transactions with color-coded badges
- **Create Record modal** — admin users can add new records directly from the UI
- **Role-based UI** — viewers see 🔒 on analytics, admins get the create button
- **Toast notifications** — real-time feedback on all actions

---

## Demo Accounts

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@finance.com` | `admin123` | Full access — CRUD, analytics, user management |
| **Analyst** | `analyst@finance.com` | `analyst123` | View records + analytics |
| **Viewer** | `viewer@finance.com` | `viewer123` | View records + recent activity only |

---

## Role-Based Access Control

| Action | Public | Viewer | Analyst | Admin |
|--------|--------|--------|---------|-------|
| Register / Login | ✅ | — | — | — |
| View Records | ❌ | ✅ | ✅ | ✅ |
| View Recent Activity | ❌ | ✅ | ✅ | ✅ |
| View Summary / Analytics | ❌ | ❌ | ✅ | ✅ |
| Create / Edit / Delete Records | ❌ | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |

Implemented as composable middleware: `auth()` → `rbac('admin', 'analyst')`.

---

## API Endpoints

### Health Check
```
GET /api/health
```
Returns server status, uptime, and timestamp.

---

### Auth (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/register` | Public | Register a new user (default role: `viewer`) |
| `POST` | `/login` | Public | Login with email + password, returns JWT |
| `GET` | `/me` | Authenticated | Get current user profile |

**Register:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finance.com","password":"admin123"}'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "admin",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Get Profile:**
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Users (`/api/users`) — Admin Only

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | List all users (paginated) |
| `GET` | `/:id` | Get user by ID |
| `PATCH` | `/:id/role` | Update user role (`viewer`, `analyst`, `admin`) |
| `PATCH` | `/:id/status` | Activate/deactivate user (`active`, `inactive`) |
| `DELETE` | `/:id` | Delete user permanently |

**Examples:**
```bash
# List all users
curl http://localhost:4000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Change user role to analyst
curl -X PATCH http://localhost:4000/api/users/3/role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"analyst"}'

# Deactivate a user
curl -X PATCH http://localhost:4000/api/users/3/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'

# Delete a user
curl -X DELETE http://localhost:4000/api/users/3 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### Financial Records (`/api/records`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/` | Admin | Create a financial record |
| `GET` | `/` | Viewer+ | List records (filtered, paginated, sorted) |
| `GET` | `/:id` | Viewer+ | Get a single record |
| `PUT` | `/:id` | Admin | Update a record |
| `DELETE` | `/:id` | Admin | Soft-delete a record |

**Query Parameters for `GET /api/records`:**

| Parameter | Type | Default | Options |
|-----------|------|---------|---------|
| `type` | string | — | `income`, `expense` |
| `category` | string | — | Partial match (LIKE search) |
| `from` | string | — | Start date (`YYYY-MM-DD`) |
| `to` | string | — | End date (`YYYY-MM-DD`) |
| `page` | number | `1` | Page number (1+) |
| `limit` | number | `20` | Results per page (1–100) |
| `sort` | string | `date` | `date`, `amount`, `category`, `created_at` |
| `order` | string | `desc` | `asc`, `desc` |

**Examples:**
```bash
# List all income records from January 2026
curl "http://localhost:4000/api/records?type=income&from=2026-01-01&to=2026-01-31" \
  -H "Authorization: Bearer TOKEN"

# Create a new record
curl -X POST http://localhost:4000/api/records \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "category": "Salary",
    "amount": 5000,
    "date": "2026-04-15",
    "description": "April salary"
  }'

# Update a record
curl -X PUT http://localhost:4000/api/records/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 9000, "description": "Updated salary"}'

# Soft-delete a record
curl -X DELETE http://localhost:4000/api/records/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### Dashboard (`/api/dashboard`) — Dynamic Analytics

All dashboard endpoints accept **dynamic query filters**:

| Parameter | Description |
|-----------|-------------|
| `from` | Start date (`YYYY-MM-DD`) |
| `to` | End date (`YYYY-MM-DD`) |
| `type` | Filter by `income` or `expense` |
| `category` | Filter by category name (partial match) |
| `user_id` | Filter by specific user ID |

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/summary` | Analyst+ | Total income, expenses, net balance, record count |
| `GET` | `/category-breakdown` | Analyst+ | Category-wise totals grouped by type |
| `GET` | `/monthly-trends` | Analyst+ | Monthly income vs expense |
| `GET` | `/recent-activity` | Viewer+ | Recent records (also accepts `limit` param) |

**Examples:**
```bash
# Full summary
curl http://localhost:4000/api/dashboard/summary \
  -H "Authorization: Bearer TOKEN"

# Summary for February 2026 only
curl "http://localhost:4000/api/dashboard/summary?from=2026-02-01&to=2026-02-28" \
  -H "Authorization: Bearer TOKEN"

# Summary for a specific user's income
curl "http://localhost:4000/api/dashboard/summary?user_id=1&type=income" \
  -H "Authorization: Bearer TOKEN"

# Category breakdown for expenses
curl "http://localhost:4000/api/dashboard/category-breakdown?type=expense" \
  -H "Authorization: Bearer TOKEN"

# Monthly trends for Rent only
curl "http://localhost:4000/api/dashboard/monthly-trends?category=Rent" \
  -H "Authorization: Bearer TOKEN"

# Last 5 income transactions
curl "http://localhost:4000/api/dashboard/recent-activity?type=income&limit=5" \
  -H "Authorization: Bearer TOKEN"
```

**Summary Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "total_income": 46450,
      "total_expenses": 15400,
      "net_balance": 31050,
      "record_count": 28,
      "filters_applied": ["from", "to"]
    }
  }
}
```

---

## Error Handling

All errors follow a consistent JSON format:

```json
{
  "status": "fail",
  "message": "Validation error: \"email\" must be a valid email"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Validation error / bad request |
| `401` | Not authenticated / invalid or expired token |
| `403` | Forbidden — insufficient role permissions |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate email on registration) |
| `500` | Internal server error |

---

## Project Structure

```
finance-api/
├── public/
│   └── index.html               — Interactive dashboard (frontend)
├── src/
│   ├── config/
│   │   └── database.js           — SQLite init + schema (sql.js)
│   ├── middleware/
│   │   ├── auth.js               — JWT verification
│   │   ├── rbac.js               — Role-based access control
│   │   ├── validate.js           — Request validation (Joi)
│   │   └── errorHandler.js       — Global error handler
│   ├── routes/
│   │   ├── auth.routes.js        — POST /register, /login, GET /me
│   │   ├── user.routes.js        — Admin user management
│   │   ├── record.routes.js      — CRUD financial records
│   │   └── dashboard.routes.js   — Analytics endpoints
│   ├── services/
│   │   ├── auth.service.js       — Register, login, JWT logic
│   │   ├── user.service.js       — User CRUD, role management
│   │   ├── record.service.js     — Financial record operations
│   │   └── dashboard.service.js  — Aggregation queries
│   ├── validators/
│   │   ├── auth.validator.js     — Register/login schemas
│   │   ├── user.validator.js     — Role/status update schemas
│   │   ├── record.validator.js   — Record CRUD + query schemas
│   │   └── dashboard.validator.js— Dashboard filter schemas
│   └── utils/
│       ├── AppError.js           — Custom error class
│       └── helpers.js            — Response envelope, pagination
├── app.js                        — Express setup + route mounting
├── server.js                     — Entry point (async init)
├── seed.js                       — Demo data seeder
├── package.json
├── .env                          — Environment config
└── README.md                     — This file
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer'  CHECK(role IN ('viewer','analyst','admin')),
  status        TEXT NOT NULL DEFAULT 'active'  CHECK(status IN ('active','inactive')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Financial Records Table
```sql
CREATE TABLE financial_records (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  type        TEXT NOT NULL CHECK(type IN ('income','expense')),
  category    TEXT NOT NULL,
  amount      REAL NOT NULL CHECK(amount > 0),
  date        TEXT NOT NULL,           -- YYYY-MM-DD
  description TEXT,
  is_deleted  INTEGER NOT NULL DEFAULT 0,  -- soft delete
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=4000
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
DB_PATH=./finance.db
```

---

## Seeded Demo Data

Running `npm run seed` populates:
- **5 users** (1 admin, 2 analysts, 2 viewers)
- **28 financial records** across 3 months (Jan–Mar 2026)
- **10 income records**: Salary, Freelance, Investments, Bonus
- **18 expense records**: Rent, Utilities, Groceries, Transport, Entertainment, Healthcare, Subscriptions, Education

**Totals**: $46,450 income / $15,400 expenses / $31,050 net balance
