# Task Meta Configuration (Frontend)

## Goal

Create a centralized configuration file that defines all UI metadata for:

- Task priorities
- Task categories

This ensures consistent UI rendering across the application and removes hardcoded values from components.

---

## File to Create

Create this file:

src/config/taskMeta.js

---

## What to Implement in taskMeta.js

### 1. Priority Meta

Define all task priorities with:

- label (display name)
- color (hex code for UI)
- emoji (for quick visual indicator)

Allowed priorities:

- critical
- high
- medium
- low

---

### 2. Category Meta

Define default categories with:

- label
- color (hex)
- emoji

Categories:

- work
- study
- personal
- health
- finance
- project
- admin

---

## Required Structure Example

The file MUST export:

- TASK_PRIORITY_META
- TASK_CATEGORY_META
- getPriorityMeta(priority)
- getCategoryMeta(slug)

Each getter must safely fallback to default values if key does not exist.

---

## Example Behavior Rules

### Priority fallback:

If priority is missing or invalid → return "medium"

### Category fallback:

If category slug is missing → return "Uncategorized"

---

## Integration Rules (IMPORTANT)

### 1. Task List UI

Replace all hardcoded priority/category display logic with:

- getPriorityMeta(task.priority)
- getCategoryMeta(task.category?.slug)

---

### 2. Task Badge Rendering

All UI rendering MUST use this config:

❌ DO NOT:

- hardcode emojis in components
- hardcode colors in JSX
- use if/else for mapping UI

---

### 3. Task Form Integration

When rendering task create/edit form:

- Priority dropdown options MUST come from TASK_PRIORITY_META keys
- Category dropdown options MUST come from TASK_CATEGORY_META keys OR API categories

---

### 4. Data Flow Rule

Backend provides:

- priority (string)
- category object (with slug)

Frontend is responsible for:

- visual representation
- colors
- emojis
- labels

---

## Component Changes Expected

Update these components:

- TaskList.jsx → show priority + category badges
- TaskItem.jsx → visual indicators
- TaskForm.jsx → dropdowns for priority & category
- TaskFilters.jsx → filtering support (optional enhancement)

---

## File Responsibilities

### taskMeta.js handles:

- UI mapping logic
- colors
- labels
- emojis
- safe fallback logic

### Components handle:

- rendering only
- no business logic
- no mapping logic

---

## Future Upgrade Path

This system should later support:

- icon system (emoji → lucide-react icons)
- theme-based color overrides
- dynamic category loading from API (optional migration)
- analytics grouping based on meta values

---

## Definition of Done

- No hardcoded priority/category UI in components
- All UI mapping uses taskMeta.js
- Task list visually reflects priority and category consistently
