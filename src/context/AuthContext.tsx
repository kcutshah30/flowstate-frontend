import { createContext, useEffect, useState } from "react";
import {
    getUser,
    login as apiLogin,
    logout as apiLogout,
} from "../features/auth/authApi";
import { initCsrf } from "../api/csrf";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState(null);
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
            value={{ user, loading, login, logout, loadUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};
