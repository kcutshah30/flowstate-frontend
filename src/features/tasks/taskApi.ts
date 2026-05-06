import api from "../../api/axios";
import { initCsrf } from "../../api/csrf";

export const getTasks = async () => {
    await initCsrf();
    const res = await api.get("/tasks");
    return res.data;
};