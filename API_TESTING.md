# API Testing — cURL Reference

Base URL: `http://localhost:8000/api/v1`

After login, copy the `access` and `refresh` values and replace every
`<ACCESS_TOKEN>` / `<REFRESH_TOKEN>` placeholder below.

---

## Authentication

### Register

```bash
curl -s -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123",
    "currency": "USD",
    "timezone": "UTC"
  }'
```

Expected: `201`
```json
{ "success": true, "data": { "id": "...", "email": "...", "username": "..." }, "message": "Account created successfully." }
```

---

### Login

```bash
curl -s -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Expected: `200`
```json
{ "success": true, "data": { "access": "...", "refresh": "...", "user": { ... } }, "message": "Login successful." }
```

---

### Get Profile

```bash
curl -s -X GET http://localhost:8000/api/v1/auth/me/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Expected: `200`
```json
{ "success": true, "data": { "id": "...", "email": "...", "full_name": "...", ... }, "message": "OK" }
```

---

### Update Profile

```bash
curl -s -X PATCH http://localhost:8000/api/v1/auth/me/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jonathan",
    "currency": "EUR",
    "timezone": "America/New_York"
  }'
```

Expected: `200`
```json
{ "success": true, "data": { "first_name": "Jonathan", "currency": "EUR", ... }, "message": "Profile updated." }
```

---

### Refresh Token

```bash
curl -s -X POST http://localhost:8000/api/v1/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "<REFRESH_TOKEN>"
  }'
```

Expected: `200`
```json
{ "success": true, "data": { "access": "...", "refresh": "..." }, "message": "Token refreshed." }
```

---

### Change Password

```bash
curl -s -X POST http://localhost:8000/api/v1/auth/change-password/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "SecurePass123",
    "new_password": "NewSecurePass456",
    "new_password_confirm": "NewSecurePass456"
  }'
```

Expected: `200`
```json
{ "success": true, "data": null, "message": "Password changed successfully. Please log in again." }
```

---

### Logout

```bash
curl -s -X POST http://localhost:8000/api/v1/auth/logout/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "<REFRESH_TOKEN>"
  }'
```

Expected: `200`
```json
{ "success": true, "data": null, "message": "Logged out successfully." }
```

---

## Error Cases

### Wrong password
```bash
curl -s -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "wrongpassword"}'
```
Expected: `401` — `"error": "Invalid credentials."`

---

### No token on protected route
```bash
curl -s -X GET http://localhost:8000/api/v1/auth/me/
```
Expected: `401` — `"error": "Authentication credentials were not provided."`

---

### Duplicate email on register
```bash
curl -s -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "other",
    "first_name": "A",
    "last_name": "B",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123"
  }'
```
Expected: `400` — `"error": "A user with this email already exists."`

---

### Blacklisted refresh token (use a token after logout)
```bash
curl -s -X POST http://localhost:8000/api/v1/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<USED_REFRESH_TOKEN>"}'
```
Expected: `400` — `"error": "Token is invalid or expired"`

---

## Categories

### List all categories (system + your own)

```bash
curl -s http://localhost:8000/api/v1/categories/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Expected: `200` — array of 8 system categories + any custom ones you created.

---

### Create a custom category

```bash
curl -s -X POST http://localhost:8000/api/v1/categories/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Travel",
    "icon": "flight",
    "color": "#FFD700"
  }'
```

Expected: `201` — `{ "success": true, "data": { "id": "...", "name": "Travel", "is_system": false, ... } }`

---

### Update a custom category

```bash
curl -s -X PATCH http://localhost:8000/api/v1/categories/<CATEGORY_ID>/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"color": "#FFA500"}'
```

Expected: `200` — updated category object.

---

### Delete a custom category

```bash
curl -s -X DELETE http://localhost:8000/api/v1/categories/<CATEGORY_ID>/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Expected: `204` — no content.
Error if expenses are linked: `409` — `"Cannot delete a category that has expenses linked to it."`

---

## Expenses

### Create an expense

Replace `<CATEGORY_ID>` with any ID from `GET /categories/`.

```bash
curl -s -X POST http://localhost:8000/api/v1/expenses/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Grocery run",
    "amount": "42.50",
    "expense_date": "2026-06-10",
    "category_id": "<CATEGORY_ID>",
    "payment_method": "card",
    "notes": "Weekly groceries",
    "currency": "USD"
  }'
```

Expected: `201` — full expense object with nested category.

---

### List expenses (paginated)

```bash
curl -s http://localhost:8000/api/v1/expenses/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Expected: `200` — `{ "data": { "count": N, "next": null, "results": [...] } }`

---

### Get a single expense

```bash
curl -s http://localhost:8000/api/v1/expenses/<EXPENSE_ID>/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Expected: `200` — single expense object.

---

### Update an expense (partial)

```bash
curl -s -X PATCH http://localhost:8000/api/v1/expenses/<EXPENSE_ID>/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "amount": "55.00"
  }'
```

Expected: `200` — updated expense object.

---

### Delete an expense

```bash
curl -s -X DELETE http://localhost:8000/api/v1/expenses/<EXPENSE_ID>/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Expected: `204` — no content.

---

## Expenses — Filters & Search

All query params can be combined.

### Filter by category

```bash
curl -s "http://localhost:8000/api/v1/expenses/?category=<CATEGORY_ID>" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Filter by date range

```bash
curl -s "http://localhost:8000/api/v1/expenses/?date_from=2026-06-01&date_to=2026-06-30" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Filter by amount range

```bash
curl -s "http://localhost:8000/api/v1/expenses/?amount_min=10&amount_max=100" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Filter by payment method

```bash
curl -s "http://localhost:8000/api/v1/expenses/?payment_method=card" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Valid values: `cash`, `card`, `bank_transfer`, `upi`, `other`

### Search by title or notes

```bash
curl -s "http://localhost:8000/api/v1/expenses/?search=grocery" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Order by field

```bash
# Ascending amount
curl -s "http://localhost:8000/api/v1/expenses/?ordering=amount" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Descending date (default)
curl -s "http://localhost:8000/api/v1/expenses/?ordering=-expense_date" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Valid values: `expense_date`, `-expense_date`, `amount`, `-amount`, `created_at`, `-created_at`

### Combined example

```bash
curl -s "http://localhost:8000/api/v1/expenses/?date_from=2026-06-01&category=<CATEGORY_ID>&ordering=-amount&page=1&page_size=10" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## Expense Error Cases

### Invalid amount (zero or negative)

```bash
curl -s -X POST http://localhost:8000/api/v1/expenses/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Bad","amount":"-5","expense_date":"2026-06-10","category_id":"<CATEGORY_ID>"}'
```

Expected: `400` — `"Amount must be greater than zero."`

### Category not owned by you

```bash
curl -s -X POST http://localhost:8000/api/v1/expenses/ \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","amount":"10","expense_date":"2026-06-10","category_id":"00000000-0000-0000-0000-000000000000"}'
```

Expected: `400` — `"Category not found or does not belong to you."`

### Access another user's expense

```bash
curl -s http://localhost:8000/api/v1/expenses/<OTHER_USER_EXPENSE_ID>/ \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

Expected: `404` — `"Expense not found."` (ownership enforced via queryset — no 403 leakage)

---

## Analytics

All analytics endpoints require a Bearer token. All amounts are string-encoded
decimals. Chart.js-ready `labels` / `data` arrays are included alongside `raw`
detail so the frontend can use either.

---

### Summary (dashboard cards)

```bash
curl -s "http://localhost:8000/api/v1/analytics/summary/?month=2026-06" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Omit `?month` to default to the current calendar month.

Expected: `200`
```json
{
  "data": {
    "month": "2026-06",
    "total_spent": "1412.50",
    "total_spent_last_month": "410.00",
    "month_over_month_change": "244.5",
    "total_expenses_count": 5,
    "top_category": { "name": "Housing", "color": "#45B7D1", "icon": "home", "amount": "1200.00" },
    "recent_expenses": [ ...5 expense objects... ]
  }
}
```

---

### Category breakdown (Pie / Doughnut chart)

```bash
# Current month
curl -s "http://localhost:8000/api/v1/analytics/category-breakdown/?date_from=2026-06-01&date_to=2026-06-30" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# All time (omit both dates)
curl -s "http://localhost:8000/api/v1/analytics/category-breakdown/" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Expected: `200`
```json
{
  "data": {
    "labels": ["Housing", "Food & Dining", "Transport"],
    "background_colors": ["#45B7D1", "#FF6B6B", "#4ECDC4"],
    "amounts": [1200.0, 150.0, 62.5],
    "total": "1412.50",
    "breakdown": [
      { "category_name": "Housing", "amount": "1200.00", "percentage": "85.0", "count": 1 },
      { "category_name": "Food & Dining", "amount": "150.00", "percentage": "10.6", "count": 2 },
      { "category_name": "Transport", "amount": "62.50", "percentage": "4.4", "count": 2 }
    ]
  }
}
```

Chart.js usage:
```js
{ labels: data.labels, datasets: [{ data: data.amounts, backgroundColor: data.background_colors }] }
```

---

### Monthly trend (Line chart)

```bash
# Last 6 months (default)
curl -s "http://localhost:8000/api/v1/analytics/monthly-trend/" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Last 12 months
curl -s "http://localhost:8000/api/v1/analytics/monthly-trend/?months=12" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

`months` accepts 1–24. Months with zero spending are included as `0.0`
so Chart.js renders a continuous line without gaps.

Expected: `200`
```json
{
  "data": {
    "labels": ["2026-04", "2026-05", "2026-06"],
    "data": [1200.0, 410.0, 1412.5],
    "months_requested": 3,
    "trend": [
      { "month": "2026-04", "total": "1200.00", "count": 1 },
      { "month": "2026-05", "total": "410.00",  "count": 2 },
      { "month": "2026-06", "total": "1412.50", "count": 5 }
    ]
  }
}
```

Chart.js usage:
```js
{ labels: data.labels, datasets: [{ label: "Monthly Spending", data: data.data }] }
```

---

### Analytics error cases

#### Invalid month format
```bash
curl -s "http://localhost:8000/api/v1/analytics/summary/?month=June-2026" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
Expected: `400` — `"Invalid query parameters."`

#### date_from after date_to
```bash
curl -s "http://localhost:8000/api/v1/analytics/category-breakdown/?date_from=2026-12-01&date_to=2026-01-01" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
Expected: `400` — `"date_from must be before date_to."`

#### months out of range
```bash
curl -s "http://localhost:8000/api/v1/analytics/monthly-trend/?months=99" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
Expected: `400` — validation error (max 24).
