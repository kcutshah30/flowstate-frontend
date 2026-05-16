# Feature: Task Categories (Frontend Integration)

## Goal

Integrate task categories into the frontend to enable task grouping, filtering, and better visual organization.

---

## Backend Status (Already Implemented)

The backend provides category support via API:

### Endpoints

- GET /api/categories → Fetch all categories
- GET /api/categories/{category} → Fetch single category (by id or slug depending on implementation)

### Task API Enhancements

Tasks now include:

- category_id
- category object (auto-loaded in response)

Task endpoints support:

- Filtering by category_id
- Filtering by category slug

---

## Frontend Responsibilities

### 1. Fetch Categories

- Fetch categories on app load or when opening task form
- Use GET /api/categories
- Store in frontend state (Context or local state)

---

### 2. Task Create / Edit

- Add category dropdown in task form
- Populate dropdown using categories API
- Submit `category_id` with task payload
- Default behavior: no category selected (or optional default if UI defines one)

---

### 3. Task List UI

- Display category name for each task
- Use category color for badge styling
- Optionally show category icon if available
- Ensure UI handles missing category gracefully

---

### 4. Task Filtering

- Add category filter in task dashboard
- Filter options:
    - All tasks
    - By category_id
    - By category slug (if used in UI routing/filtering)

- Filtering should work client-side OR via API query params

---

### 5. UI Rendering Rules

Category object structure received from API:

```json
{
    "id": 1,
    "name": "Work",
    "slug": "work",
    "color": "#3B82F6",
    "icon": "briefcase"
}
```
