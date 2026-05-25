import { useEffect, useState } from "react";
import {
    wallClockElapsedSeconds,
    type TaskSession,
} from "../features/sessions/sessionTypes";

export const calculateElapsedSeconds = (
    session: TaskSession | null,
    nowMs: number = Date.now(),
): number => {
    if (!session) return 0;

    if (session.status === "ended" || session.status === "paused") {
        return session.tracked_seconds;
    }

    const wallClock = wallClockElapsedSeconds(session, nowMs);

    if (session.timer_running && session.timer_continues_from) {
        const continuesFrom = new Date(session.timer_continues_from).getTime();
        if (!Number.isNaN(continuesFrom)) {
            const anchored = Math.max(
                0,
                session.tracked_seconds +
                    Math.floor((nowMs - continuesFrom) / 1000),
            );
            if (Math.abs(anchored - wallClock) <= 2) {
                return anchored;
            }
        }
    }

    return wallClock;
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
