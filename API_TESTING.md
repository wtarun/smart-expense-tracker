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
