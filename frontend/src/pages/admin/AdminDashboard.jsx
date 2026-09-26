import { NavLink, Outlet } from "react-router-dom";
import Logo from "../../components/Logo";

const navItems = [
  { path: "/admin", label: "Overview", end: true },
  { path: "/admin/courses", label: "Manage Courses" },
  { path: "/admin/students", label: "Students" },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex">
      <aside
        className="w-56 min-h-screen p-4 shadow-sm"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="mb-6 px-1">
          <Logo />
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            Admin Panel
          </p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end}>
              {({ isActive }) => (
                <span
                  className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={
                    isActive
                      ? { background: "var(--color-primary)", color: "#fff" }
                      : { color: "var(--color-text-muted)" }
                  }
                >
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}