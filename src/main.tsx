import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SessionProvider } from "./context/SessionContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <AuthProvider>
        <SessionProvider>
            <App />
        </SessionProvider>
    </AuthProvider>,
);
