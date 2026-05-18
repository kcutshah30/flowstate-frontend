import { useEffect, useState } from "react";
import type { TaskSession } from "../features/sessions/sessionTypes";

export const calculateElapsedSeconds = (
    session: TaskSession | null,
): number => {
    if (!session) return 0;

    if (session.status === "ended" || session.status === "paused") {
        return session.tracked_seconds;
    }

    const startedAt = new Date(session.started_at).getTime();
    if (Number.isNaN(startedAt)) return session.tracked_seconds;

    const elapsed =
        Math.floor((Date.now() - startedAt) / 1000) -
        session.total_paused_seconds;

    return Math.max(0, elapsed);
};

export const formatDuration = (totalSeconds: number): string => {
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [hours, minutes, remainingSeconds]
        .map((value) => String(value).padStart(2, "0"))
        .join(":");
};

export const useSessionTimer = (session: TaskSession | null) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(() =>
        calculateElapsedSeconds(session),
    );

    useEffect(() => {
        setElapsedSeconds(calculateElapsedSeconds(session));

        if (!session || session.status !== "running") {
            return;
        }

        const intervalId = window.setInterval(() => {
            setElapsedSeconds(calculateElapsedSeconds(session));
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [session]);

    return {
        elapsedSeconds,
        formatted: formatDuration(elapsedSeconds),
    };
};
