import type { TaskSession } from "../features/sessions/sessionTypes";

type SessionControlsProps = {
    taskId: number;
    session: TaskSession | null;
    hasOtherActiveSession: boolean;
    busy?: boolean;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
};

const buttonClass =
    "rounded-full px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export function SessionControls({
    taskId,
    session,
    hasOtherActiveSession,
    busy = false,
    onStart,
    onPause,
    onResume,
}: SessionControlsProps) {
    const isThisTaskSession = session?.task_id === taskId;
    const activeSession = isThisTaskSession ? session : null;

    if (!activeSession) {
        return (
            <button
                type="button"
                onClick={onStart}
                disabled={busy || hasOtherActiveSession}
                title={
                    hasOtherActiveSession
                        ? "Finish your current task before starting another."
                        : undefined
                }
                className={`${buttonClass} bg-indigo-900 text-white hover:bg-indigo-700`}
            >
                {busy ? "Starting..." : "Track time"}
            </button>
        );
    }

    if (activeSession.status === "completed") {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {activeSession.status === "running" ? (
                <button
                    type="button"
                    onClick={onPause}
                    disabled={busy}
                    className={`${buttonClass} border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100`}
                >
                    {busy ? "Pausing..." : "Pause"}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onResume}
                    disabled={busy}
                    className={`${buttonClass} bg-indigo-900 text-white hover:bg-indigo-700`}
                >
                    {busy ? "Resuming..." : "Resume"}
                </button>
            )}
        </div>
    );
}
