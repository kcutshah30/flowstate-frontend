import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            console.error(err);
            alert("Login failed");
        }
    };

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
