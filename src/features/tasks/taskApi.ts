import api from "../../api/axios";
import { initCsrf } from "../../api/csrf";

export const getTasks = async () => {
    await initCsrf();
    const res = await api.get("/api/tasks");
    return res.data;
};

export const createTask = async (task: { title: string; description?: string }) => {
    await initCsrf();
    const res = await api.post("/api/tasks", task);
    return res.data;
};

export const updateTask = async (id: number, task: { title?: string; description?: string; completed?: boolean }) => {
    await initCsrf();
    const res = await api.put(`/api/tasks/${id}`, task);
    return res.data;
};

export const deleteTask = async (id: number) => {
    await initCsrf();
    const res = await api.delete(`/api/tasks/${id}`);
    return res.data;
};