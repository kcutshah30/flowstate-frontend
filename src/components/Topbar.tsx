import { useState } from "react";
import { Modal } from "./Modal";
import { TaskTimer } from "./TaskTimer";
import { useAuth } from "../hooks/useAuth";
import { useSession } from "../hooks/useSession";
import { isActiveSession } from "../features/sessions/sessionTypes";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { user, logout } = useAuth();
  const { activeSession } = useSession();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      setConfirmOpen(false);
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
          {isActiveSession(activeSession) ? (
            <TaskTimer session={activeSession} />
          ) : null}
          {user && (
            <span className="text-sm text-slate-600">
              Signed in as {user.name || user.email}
            </span>
          )}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            Logout
          </button>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => !busy && setConfirmOpen(false)}
        title="Sign out?"
        description="You will need to sign in again to access your account."
      >
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            disabled={busy}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={busy}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {busy ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </Modal>
    </header>
  );
}
