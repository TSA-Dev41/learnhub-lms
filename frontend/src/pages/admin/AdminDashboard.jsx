import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { path: "/admin", label: "Overview", end: true },
  { path: "/admin/courses", label: "Manage Courses" },
  { path: "/admin/students", label: "Students" },
];

export default function AdminDashboard() {
  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded text-sm ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r min-h-screen p-4">
        <h2 className="text-lg font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={linkClass}
            >
              {item.label}
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