import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div>
            <h1>Dashboard</h1>
            {user && <p>Welcome, {user.name || user.email}</p>}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
