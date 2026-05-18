import { useSessionTimer } from "../hooks/useSessionTimer";
import type { TaskSession } from "../features/sessions/sessionTypes";

type TaskTimerProps = {
    session: TaskSession | null;
    className?: string;
};

export function TaskTimer({ session, className = "" }: TaskTimerProps) {
    const { formatted } = useSessionTimer(session);

    if (!session) return null;

    const statusLabel =
        session.status === "running"
            ? "Tracking"
            : session.status === "paused"
              ? "Paused"
              : "Tracked";

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 font-mono text-xs font-semibold text-white ${className}`}
        >
            <span className="tabular-nums">{formatted}</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-300">
                {statusLabel}
            </span>
        </span>
    );
}
