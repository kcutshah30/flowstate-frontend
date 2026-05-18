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
    };
};

export const isActiveSession = (session: TaskSession | null) =>
    session?.status === "running" || session?.status === "paused";
