# Frontend API Integration

## Auth Flow
1. GET /sanctum/csrf-cookie
2. POST /login
3. Session stored automatically
4. GET /api/user

---

## Axios Rules
- withCredentials = true required
- CSRF always fetched before login

---

## Task API
- GET /tasks
- POST /tasks
- PUT /tasks/{id}
- DELETE /tasks/{id}
- PATCH /tasks/{id}/complete
