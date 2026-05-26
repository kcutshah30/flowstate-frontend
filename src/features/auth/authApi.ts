import axios from "axios";
import api from "../../api/axios";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export const register = async (payload: RegisterPayload) => {
  return api.post("/auth/register", payload);
};

export const getAuthErrorMessages = (
  error: unknown,
): { form: string; fields: Record<string, string> } => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;

    if (error.response?.status === 422 && data?.errors) {
      const fields: Record<string, string> = {};
      for (const [key, messages] of Object.entries(data.errors)) {
        const first = messages?.[0];
        if (first) {
          fields[key] = first;
        }
      }
      return {
        form: data.message ?? "Please fix the errors below.",
        fields,
      };
    }

    const message = data?.message;
    if (typeof message === "string" && message.trim()) {
      return { form: message, fields: {} };
    }
  }

  return { form: "Something went wrong. Please try again.", fields: {} };
};

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