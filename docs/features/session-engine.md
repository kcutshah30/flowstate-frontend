# FlowState Session Engine Integration

## Overview

This document describes how the FlowState frontend integrates with the session tracking backend.

The session system enables:

- Task time tracking
- Start / Pause / Resume / Stop interactions
- Live timer display
- Session state synchronization
- Accurate backend-driven duration tracking

---

# Backend Routes

The frontend communicates with the following endpoints:

- POST /tasks/{task}/start
- GET /sessions/{session}
- POST /sessions/{session}/pause
- POST /sessions/{session}/resume
- POST /sessions/{session}/stop

---

# Where Things Live

## API Layer

src/api/session.js

Responsibilities:

- start session request
- pause session request
- resume session request
- stop session request
- fetch session details

---

## Hooks Layer

Use:

src/hooks/useSessionTimer.js

Responsibilities:

- live timer calculation
- interval management
- duration formatting
- syncing with session state

---

## Features Layer

src/features/tasks/

Responsibilities:

- session UI
- session controls inside task cards
- integrating timer display with task components
- managing task-level session state

---

## Components Layer

Reusable UI components:

- TaskTimer component
- SessionControls component (buttons: start/pause/resume/stop)

These should remain stateless where possible.

---

# Session State Model

The logic should manage:

- id
- task_id
- status (running | paused | completed)
- started_at
- ended_at
- total_paused_seconds
- tracked_seconds

---

# Session Status Behavior

## running

- Timer is active
- Show Pause + Stop buttons

---

## paused

- Timer is frozen visually
- Show Resume + Stop buttons

---

## completed

- Timer is finalized
- Show only read-only duration

---

# Session Flow

## Start Session

- Call: POST /tasks/{task}/start
- Store returned session
- Start timer rendering

---

## Pause Session

- Call: POST /sessions/{session}/pause
- Update local session state
- Freeze timer display

---

## Resume Session

- Call: POST /sessions/{session}/resume
- Update session state
- Resume timer rendering

---

## Stop Session

- Call: POST /sessions/{session}/stop
- Finalize session
- Stop timer
- Display final tracked duration

---

# Timer Calculation Logic

The frontend does NOT store truth.

It derives time using:

- started_at
- total_paused_seconds
- current timestamp

Formula:

elapsed =
(current time - started_at) - total_paused_seconds

---

# Session Synchronization Strategy

The frontend should sync session state when:

- app loads
- session actions occur
- page refresh happens

This ensures consistency with backend state.

---

# Active Session Handling

Only one active session is allowed per user.

Active means:

- running
- paused

Before starting a new session:

- check backend or cached state
- prevent duplicate active sessions

---

# API Usage Pattern (src/api/session.js)

This file should expose functions like:

- startSession(taskId)
- getSession(sessionId)
- pauseSession(sessionId)
- resumeSession(sessionId)
- stopSession(sessionId)

All API communication is centralized here.

---

# Hooks Responsibility (useSessionTimer)

This hook handles:

- setInterval lifecycle
- elapsed time calculation
- formatting (HH:MM:SS)
- syncing with session state

It should NOT call APIs directly.

---

# Feature Integration

Inside task feature UI:

- Attach session controls to each task
- Display live timer when session is active
- Reflect session status visually

---

# Error Handling

Should handle:

- active session conflicts
- invalid state transitions
- failed API calls
- authentication expiration

Show user-friendly messages.

---

# Session Persistence

On page reload:

- fetch active session from backend
- restore session state
- resume timer rendering automatically

---

# Future Extensions

This architecture supports:

- analytics dashboards
- session history views
- productivity tracking
- pomodoro system
- idle detection
- real-time sync
- collaborative sessions

---
