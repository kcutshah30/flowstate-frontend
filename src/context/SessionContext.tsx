import {
    createContext,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import {
    getActiveSession,
    getSessionErrorMessage,
    pauseSession as apiPauseSession,
    resumeSession as apiResumeSession,
    startSession as apiStartSession,
    stopSession as apiStopSession,
} from "../features/sessions/sessionApi";
import {
    anchorRunningSessionForClient,
    isActiveSession,
    setStoredActiveSessionId,
    type TaskSession,
} from "../features/sessions/sessionTypes";
import { useAuth } from "../hooks/useAuth";

type SessionContextType = {
    activeSession: TaskSession | null;
    loading: boolean;
    busy: boolean;
    error: string | null;
    clearError: () => void;
    startSession: (taskId: number) => Promise<TaskSession>;
    pauseSession: () => Promise<TaskSession | null>;
    resumeSession: () => Promise<TaskSession | null>;
    stopSession: () => Promise<TaskSession | null>;
    refreshSession: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const { user, loading: authLoading } = useAuth();
    const [activeSession, setActiveSession] = useState<TaskSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    const applySession = useCallback(
        (session: TaskSession | null): TaskSession | null => {
            const next =
                session?.status === "running"
                    ? anchorRunningSessionForClient(session)
                    : session;
            setActiveSession(next);
            if (isActiveSession(next)) {
                setStoredActiveSessionId(next!.id);
            } else {
                setStoredActiveSessionId(null);
            }
            return next;
        },
        [],
    );

    const refreshSession = useCallback(async () => {
        try {
            const session = await getActiveSession();
            applySession(isActiveSession(session) ? session : null);
        } catch {
            applySession(null);
        }
    }, [applySession]);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            applySession(null);
            setLoading(false);
            return;
        }

        const restoreActiveSession = async () => {
            setLoading(true);
            try {
                await refreshSession();
            } finally {
                setLoading(false);
            }
        };

        restoreActiveSession();
    }, [user, authLoading, applySession, refreshSession]);

    const startSession = useCallback(
        async (taskId: number) => {
            setBusy(true);
            setError(null);
            try {
                const session = await apiStartSession(taskId);
                return applySession(session) ?? session;
            } catch (err) {
                const message = getSessionErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setBusy(false);
            }
        },
        [applySession],
    );

    const pauseSession = useCallback(async () => {
        if (!activeSession) return null;
        setBusy(true);
        setError(null);
        try {
            const session = await apiPauseSession(activeSession.id);
            return applySession(session);
        } catch (err) {
            setError(getSessionErrorMessage(err));
            throw err;
        } finally {
            setBusy(false);
        }
    }, [activeSession, applySession]);

    const resumeSession = useCallback(async () => {
        if (!activeSession) return null;
        setBusy(true);
        setError(null);
        try {
            const session = await apiResumeSession(activeSession.id);
            return applySession(session);
        } catch (err) {
            setError(getSessionErrorMessage(err));
            throw err;
        } finally {
            setBusy(false);
        }
    }, [activeSession, applySession]);

    const stopSession = useCallback(async () => {
        if (!activeSession) return null;
        setBusy(true);
        setError(null);
        try {
            const session = await apiStopSession(activeSession.id);
            applySession(null);
            return session;
        } catch (err) {
            setError(getSessionErrorMessage(err));
            throw err;
        } finally {
            setBusy(false);
        }
    }, [activeSession, applySession]);

    return (
        <SessionContext.Provider
            value={{
                activeSession,
                loading,
                busy,
                error,
                clearError,
                startSession,
                pauseSession,
                resumeSession,
                stopSession,
                refreshSession,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};
