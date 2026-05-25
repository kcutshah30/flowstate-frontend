export type SessionStatus = "running" | "paused" | "ended";

export type TaskSession = {
    id: number;
    task_id: number;
    user_id?: number;
    status: SessionStatus;
    started_at: string;
    ended_at: string | null;
    total_paused_seconds: number;
    tracked_seconds: number;
    timer_running?: boolean;
    timer_continues_from?: string;
};

const ACTIVE_STORAGE_KEY = "flowstate:activeSessionId";

export const getStoredActiveSessionId = (): number | null => {
    const raw = localStorage.getItem(ACTIVE_STORAGE_KEY);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
};

export const setStoredActiveSessionId = (sessionId: number | null) => {
    if (sessionId === null) {
        localStorage.removeItem(ACTIVE_STORAGE_KEY);
        return;
    }
    localStorage.setItem(ACTIVE_STORAGE_KEY, String(sessionId));
};

export const normalizeSession = (payload: unknown): TaskSession | null => {
    const record =
        payload && typeof payload === "object"
            ? "data" in payload &&
              payload.data &&
              typeof payload.data === "object"
                ? payload.data
                : "session" in payload &&
                    payload.session &&
                    typeof payload.session === "object"
                  ? payload.session
                  : payload
            : null;

    if (!record || typeof record !== "object") return null;

    const session = record as Record<string, unknown>;
    const id = Number(session.id);
    const taskId = Number(session.task_id);
    const status = session.status;
    if (
        status !== "running" &&
        status !== "paused" &&
        status !== "ended"
    ) {
        return null;
    }

    if (!Number.isFinite(id) || !Number.isFinite(taskId)) {
        return null;
    }

    const timerContinuesFrom = session.timer_continues_from;
    const timerRunning = session.timer_running;

    return {
        id,
        task_id: taskId,
        user_id:
            session.user_id !== undefined
                ? Number(session.user_id)
                : undefined,
        status,
        started_at: String(session.started_at),
        ended_at: session.ended_at ? String(session.ended_at) : null,
        total_paused_seconds: Number(session.total_paused_seconds) || 0,
        tracked_seconds: Number(session.tracked_seconds) || 0,
        timer_running:
            timerRunning === true || timerRunning === 1 || timerRunning === "1",
        timer_continues_from:
            typeof timerContinuesFrom === "string" && timerContinuesFrom
                ? timerContinuesFrom
                : undefined,
    };
};

export const isActiveSession = (session: TaskSession | null) =>
    session?.status === "running" || session?.status === "paused";

/** Elapsed active time from session wall-clock fields (documented source of truth). */
export const wallClockElapsedSeconds = (
    session: TaskSession,
    nowMs: number = Date.now(),
): number => {
    const startedAt = new Date(session.started_at).getTime();
    if (Number.isNaN(startedAt)) return session.tracked_seconds;

    return Math.max(
        0,
        Math.floor((nowMs - startedAt) / 1000) - session.total_paused_seconds,
    );
};

/**
 * Re-baseline client tick from wall-clock after any API sync while running.
 * Avoids double-count when the API sends live tracked_seconds with a stale anchor.
 */
export const anchorRunningSessionForClient = (
    session: TaskSession,
): TaskSession => {
    if (session.status !== "running") return session;

    return {
        ...session,
        tracked_seconds: wallClockElapsedSeconds(session),
        timer_running: true,
        timer_continues_from: new Date().toISOString(),
    };
};
