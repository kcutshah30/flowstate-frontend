import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (!loading && user) {
            navigate("/");
        }
    }, [user, loading, navigate]);

    const handleLogin = async () => {
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            console.error(err);
            alert("Login failed");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <input
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
            />
            <input
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
