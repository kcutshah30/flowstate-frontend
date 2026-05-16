# Feature: Task Tags

## Goal

Integrate task tags to support:

- multi-tag task organization
- task filtering
- contextual grouping
- lightweight metadata display

Tags should remain flexible, reusable, and visually lightweight.

---

# Backend Support (Already Implemented)

## API Endpoints

- GET /api/tags → fetch all tags
- GET /api/tags/{tag} → fetch single tag

---

## Task API Behavior

Tasks include tags in responses:

Example:

Task:

- id: 1
- title: Fix auth issue
- tags: array of tag objects

Each tag:

- id: number
- name: string
- slug: string

---

## Task Create Payload

Example:

- title: Fix auth issue
- tags: [1, 2, 5]

---

## Task Update Payload

Example:

- tags: [2, 4, 7]

---

# Responsibilities

## 1. Fetch Tags

- Call GET /api/tags on app load or when needed
- Store tags in local state or global state

---

## 2. Task Form (Create / Edit)

- Add multi-select tag input
- Allow selecting multiple tags
- Send selected tag IDs to backend

---

## 3. Task List UI

- Display tags as small chips or badges
- Example UI:
  [backend] [urgent] [api]

- Tags must be visually secondary to priority and category

---

## 4. Task Filtering

Support filtering by:

- single tag
- multiple tags (future enhancement)

---

# Data Flow

## App Load

- fetch tags from API
- store in state

## Task Create

- user selects tags
- send tag IDs to backend

## Task Render

- backend returns tags
- frontend renders dynamically

---

# UI Rules

- tags must be lightweight
- no heavy colors
- no hardcoded tag styling
- tags must wrap if too many exist
- always render dynamically from API data

---

# Component Impact

Likely affected components:

- TaskForm
- TaskList
- TaskItem
- TaskFilters

Optional reusable components:

- TagChip
- TagSelector

---

# Suggested Component Behavior

## TagChip

- renders single tag
- displays tag name
- optional subtle styling

---

## TagSelector

- shows available tags
- allows multi-select
- returns selected tag IDs

---

# State Shape Example

Task object:

- id: 1
- title: Fix auth issue
- tags:
    - id: 1
    - name: backend
    - slug: backend

---

# Styling Rules

## DO

- render tags dynamically
- keep UI minimal
- reuse components
- keep tags visually subtle

## DO NOT

- hardcode tags in UI
- create tag-specific logic in components
- assign fixed colors per tag
- mix tags with priority/category styling

---

# Integration Rules

- extend existing task UI only
- do not redesign dashboard
- do not refactor architecture
- keep implementation minimal and consistent

---

# Error Handling

Must handle:

- empty tags array
- missing tag data
- null values
- API failure gracefully

---

# Performance Rules

- fetch tags once
- reuse tag data across components
- avoid repeated API calls

---

# Future Enhancements (Not Now)

Frontend:

- tag autocomplete
- tag search
- quick tag creation
- tag analytics

---

# Definition of Done

- tags fetched from API
- multi-select working in task form
- tags saved and updated correctly
- tags rendered in task list
- filtering by tag works
- no hardcoded tag logic anywhere
