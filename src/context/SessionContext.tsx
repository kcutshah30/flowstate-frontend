import {
    createContext,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import {
    getSession,
    getSessionErrorMessage,
    pauseSession as apiPauseSession,
    resumeSession as apiResumeSession,
    startSession as apiStartSession,
    stopSession as apiStopSession,
} from "../features/sessions/sessionApi";
import {
    getStoredActiveSessionId,
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

    const applySession = useCallback((session: TaskSession | null) => {
        setActiveSession(session);
        if (isActiveSession(session)) {
            setStoredActiveSessionId(session!.id);
        } else {
            setStoredActiveSessionId(null);
        }
    }, []);

    const refreshSession = useCallback(async () => {
        const storedId = getStoredActiveSessionId();
        if (!storedId) {
            applySession(null);
            return;
        }

        try {
            const session = await getSession(storedId);
            if (isActiveSession(session)) {
                applySession(session);
            } else {
                applySession(null);
            }
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
                applySession(session);
                return session;
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
            applySession(session);
            return session;
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
            applySession(session);
            return session;
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
