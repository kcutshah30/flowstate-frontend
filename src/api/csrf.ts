import api from "./axios";

export const initCsrf = async () => {
  await api.get("/sanctum/csrf-cookie");
};