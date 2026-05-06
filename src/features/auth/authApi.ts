import api from "../../api/axios";

export const login = async (email: string, password: string) => {
  return api.post("/auth/login", {
    email,
    password,
  });
};

export const getUser = async () => {
  return api.get("/api/user");
};

export const logout = async () => {
  return api.post("/auth/logout");
};