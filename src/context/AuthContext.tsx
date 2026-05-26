import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
    getUser,
    login as apiLogin,
    logout as apiLogout,
    register as apiRegister,
} from "../features/auth/authApi";
import type { RegisterPayload } from "../features/auth/authApi";
import { initCsrf } from "../api/csrf";

interface User {
    id: number;
    name?: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        try {
            const res = await getUser();
            setUser(res.data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        await apiLogin(email, password);
        await loadUser();
    };

    const register = async (payload: RegisterPayload) => {
        await apiRegister(payload);
        await loadUser();
    };

    const logout = async () => {
        await apiLogout();
        setUser(null);
    };

    useEffect(() => {
        // Initialize CSRF token and load user on app startup
        const initializeAuth = async () => {
            try {
                await initCsrf();
            } catch (error) {
                console.error("Failed to initialize CSRF:", error);
            } finally {
                await loadUser();
            }
        };
        initializeAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout, loadUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};
