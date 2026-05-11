import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {user && (
            <span className="text-sm text-slate-600">
              Signed in as {user.name || user.email}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={busy}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {busy ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}
