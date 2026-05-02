# Sprint 2 — Teammate TODO: API Integration + Backend + DB

This document outlines the work needed from two teammates to wire up real data to the
Goals and Budget pages that now use hardcoded mock data.

---

## Teammate A: Frontend API Integration

The Goals and Budget pages are fully built with local mock data. Your job is to
replace the mock data with live API calls once the backend is ready.

### Files to edit
- `frontend/src/services/api.js` — add the two new API modules below
- `frontend/src/pages/Goals.jsx` — search for `TODO: replace with goalsApi.getAll()`
- `frontend/src/pages/Budget.jsx` — search for `TODO: replace with budgetApi.get()`

### goalsApi — add to `api.js`

```js
export const goalsApi = {
  getAll: () =>
    fetch(`${BASE_URL}/goals`, { headers: authHeader() }).then(r => r.json()),
  create: (data) =>
    fetch(`${BASE_URL}/goals`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  update: (id, data) =>
    fetch(`${BASE_URL}/goals/${id}`, {
      method: 'PUT',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  delete: (id) =>
    fetch(`${BASE_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }).then(r => r.json()),
}
```

### budgetApi — add to `api.js`

```js
export const budgetApi = {
  get: (year, month) =>
    fetch(`${BASE_URL}/budgets?year=${year}&month=${month}`, { headers: authHeader() }).then(r => r.json()),
  upsert: (data) =>
    fetch(`${BASE_URL}/budgets`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  delete: (id) =>
    fetch(`${BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }).then(r => r.json()),
}
```

### Expected API response shapes

**GET /goals** → array of:
```json
{
  "id": "uuid",
  "name": "Emergency Fund",
  "category": "Savings",
  "target": 5000.00,
  "current": 3200.00,
  "endDate": "2026-12-31"
}
```

**GET /budgets?year=2026&month=4** → array of:
```json
{
  "budget_id": "uuid",
  "category_id": 1,
  "category_title": "Groceries",
  "monthly_limit": 500.00,
  "spent": 450.00
}
```

### How to swap in Goals.jsx

Replace the `MOCK_GOALS` initial state with an empty array and load via `useEffect`:

```js
// Remove: const [goals, setGoals] = useState(MOCK_GOALS)
// Add:
const [goals, setGoals] = useState([])
useEffect(() => {
  goalsApi.getAll().then(setGoals).catch(() => {})
}, [])
```

Similarly replace the local add/edit/delete handlers with API calls then refetch.

### How to swap in Budget.jsx

Replace the `MOCK_BUDGET_CATEGORIES` initial state and load via `useEffect`:

```js
const [categories, setCategories] = useState([])
useEffect(() => {
  const now = new Date()
  budgetApi.get(now.getFullYear(), now.getMonth() + 1)
    .then(data => setCategories(data.map(b => ({
      id: b.category_id,
      title: b.category_title,
      limit: b.monthly_limit,
      spent: b.spent,
    }))))
    .catch(() => {})
}, [])
```

---

## Teammate B: Backend Routes + DB

### Goals — table already exists (`FinancialGoal`)
Schema: `GoalID` (uuid PK), `Goal_Name`, `Goal_End` (date), `End_Goal_Amount` (numeric),
`Current_Goal_Amount` (numeric), `UserID` (uuid FK)

#### Supabase RPC functions needed

```sql
-- get_goals(user_id uuid)
-- create_goal(user_id uuid, name text, category text, target numeric, current numeric, end_date date)
-- update_goal(goal_id uuid, user_id uuid, name text, category text, target numeric, current numeric, end_date date)
-- delete_goal(goal_id uuid, user_id uuid)
```

#### FastAPI routes to add (`Routes/Goals.py`)

```
GET    /goals          → calls get_goals RPC, returns list
POST   /goals          → calls create_goal RPC
PUT    /goals/{id}     → calls update_goal RPC
DELETE /goals/{id}     → calls delete_goal RPC
```

All routes must use `verify_token` dependency from `auth.py`.

Request body for POST/PUT:
```json
{ "name": "string", "category": "string", "target": 0.0, "current": 0.0, "endDate": "YYYY-MM-DD" }
```

---

### Budget — new table needed

```sql
CREATE TABLE BudgetTable (
  BudgetID    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  UserID      uuid NOT NULL REFERENCES auth.users(id),
  CategoryID  int4 NOT NULL,
  MonthlyLimit numeric(10,2) NOT NULL DEFAULT 0,
  Month       date NOT NULL  -- always store as first of month, e.g. 2026-04-01
);
```

#### Supabase RPC functions needed

```sql
-- get_budgets(p_user_id uuid, p_year int, p_month int)
--   JOINs TransactionTable to compute spent per category for that month
--   Returns: budget_id, category_id, category_title, monthly_limit, spent

-- upsert_budget(p_user_id uuid, p_category_id int, p_limit numeric, p_year int, p_month int)
-- delete_budget(p_budget_id uuid, p_user_id uuid)
```

#### FastAPI routes to add (`Routes/Budget.py`)

```
GET    /budgets            ?year=&month=   → calls get_budgets RPC
POST   /budgets            → upsert (create or update limit for category+month)
DELETE /budgets/{id}       → calls delete_budget RPC
```

Request body for POST:
```json
{ "category_id": 1, "monthly_limit": 500.0, "year": 2026, "month": 4 }
```

---

## Notes

- Both pages already handle empty state gracefully (show "No goals yet" / empty category list).
- The income value in Budget (`MOCK_INCOME = 4500`) has no backend counterpart yet; it is
  stored in local React state. A future sprint can persist it to a `UserSettings` table.
- Category IDs in Budget match the existing transaction categories — coordinate with the
  TransactionTable schema to ensure IDs align.
