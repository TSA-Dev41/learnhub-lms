import { Link, Outlet, useLocation } from "react-router-dom";

const navItems = [
  { path: "/admin", label: "Overview", end: true },
  { path: "/admin/courses", label: "Manage Courses" },
  { path: "/admin/students", label: "Students" },
];

export default function AdminDashboard() {
  const location = useLocation();

  const isActive = (path, end) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r min-h-screen p-4">
        <h2 className="text-lg font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded text-sm ${
                isActive(item.path, item.end)
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}