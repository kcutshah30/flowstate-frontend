import api from "../../api/axios";
import { initCsrf } from "../../api/csrf";

export type TaskCreatePayload = {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: string;
    category_id?: number | null;
    tags?: number[];
};

export type TaskUpdatePayload = {
    title?: string;
    description?: string;
    completed?: boolean;
    dueDate?: string;
    priority?: string;
    category_id?: number | null;
    tags?: number[];
};

export const getTasks = async () => {
    await initCsrf();
    const res = await api.get("/api/tasks");
    return res.data;
};

export const getCategories = async () => {
    await initCsrf();
    const res = await api.get("/api/categories");
    return res.data;
};

export const getTags = async () => {
    await initCsrf();
    const res = await api.get("/api/tags");
    return res.data;
};

export const createTask = async (task: TaskCreatePayload) => {
    await initCsrf();
    const res = await api.post("/api/tasks", task);
    return res.data;
};

export const updateTask = async (id: number, task: TaskUpdatePayload) => {
    await initCsrf();
    const res = await api.put(`/api/tasks/${id}`, task);
    return res.data;
};

export const deleteTask = async (id: number) => {
    await initCsrf();
    const res = await api.delete(`/api/tasks/${id}`);
    return res.data;
};

export const completeTask = async (id: number) => {
    await initCsrf();
    const res = await api.patch(`/api/tasks/${id}/complete`, { completed: true });
    return res.data;
};