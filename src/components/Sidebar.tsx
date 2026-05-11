import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Tasks", path: "/tasks" },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-72 flex-col border-r border-slate-200 bg-white">
      <div className="px-6 py-6 border-b border-slate-200">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">FlowState</p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Productivity</h1>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
