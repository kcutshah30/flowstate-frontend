export type TaskStatus = "todo" | "in_progress" | "completed";

const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "completed"];

export type BackendTaskStatus = {
    id?: number;
    slug?: string;
    key?: string;
    name?: string;
};

export const parseTaskStatus = (value: unknown): TaskStatus | null => {
    if (typeof value === "string") {
        const normalized = value.toLowerCase().replace(/\s+/g, "_");
        if (TASK_STATUSES.includes(normalized as TaskStatus)) {
            return normalized as TaskStatus;
        }
    }

    if (!value || typeof value !== "object") return null;

    const record = value as BackendTaskStatus;
    for (const candidate of [record.slug, record.key, record.name]) {
        const parsed = parseTaskStatus(candidate);
        if (parsed) return parsed;
    }

    return null;
};

export const resolveTaskStatus = (backendTask: {
    status?: unknown;
    task_status?: unknown;
    completed?: boolean;
}): TaskStatus => {
    const fromStatus = parseTaskStatus(backendTask.status);
    if (fromStatus) return fromStatus;

    const fromTaskStatus = parseTaskStatus(backendTask.task_status);
    if (fromTaskStatus) return fromTaskStatus;

    if (backendTask.completed) return "completed";

    return "todo";
};

export const resolveTaskStatusId = (backendTask: {
    task_status_id?: number;
    status?: BackendTaskStatus | null;
}): number | undefined => {
    const id = backendTask.task_status_id ?? backendTask.status?.id;
    return Number.isFinite(id) ? Number(id) : undefined;
};
