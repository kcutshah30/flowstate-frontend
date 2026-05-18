import axios from "axios";
import api from "../../api/axios";
import { initCsrf } from "../../api/csrf";
import { normalizeSession } from "./sessionTypes";
import type { TaskSession } from "./sessionTypes";

export const getSessionErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        if (typeof message === "string" && message.trim()) {
            return message;
        }
        if (error.response?.status === 401) {
            return "Your session has expired. Please sign in again.";
        }
    }
    return "Something went wrong. Please try again.";
};

export const startSession = async (taskId: number): Promise<TaskSession> => {
    await initCsrf();
    const res = await api.post(`/api/tasks/${taskId}/start`);
    const session = normalizeSession(res.data);
    if (!session) {
        throw new Error("Invalid session response from server.");
    }
    return session;
};

export const getSession = async (sessionId: number): Promise<TaskSession> => {
    await initCsrf();
    const res = await api.get(`/api/sessions/${sessionId}`);
    const session = normalizeSession(res.data);
    if (!session) {
        throw new Error("Invalid session response from server.");
    }
    return session;
};

export const pauseSession = async (sessionId: number): Promise<TaskSession> => {
    await initCsrf();
    const res = await api.post(`/api/sessions/${sessionId}/pause`);
    const session = normalizeSession(res.data);
    if (!session) {
        throw new Error("Invalid session response from server.");
    }
    return session;
};

export const resumeSession = async (
    sessionId: number,
): Promise<TaskSession> => {
    await initCsrf();
    const res = await api.post(`/api/sessions/${sessionId}/resume`);
    const session = normalizeSession(res.data);
    if (!session) {
        throw new Error("Invalid session response from server.");
    }
    return session;
};

export const stopSession = async (sessionId: number): Promise<TaskSession> => {
    await initCsrf();
    const res = await api.post(`/api/sessions/${sessionId}/stop`);
    const session = normalizeSession(res.data);
    if (!session) {
        throw new Error("Invalid session response from server.");
    }
    return session;
};
