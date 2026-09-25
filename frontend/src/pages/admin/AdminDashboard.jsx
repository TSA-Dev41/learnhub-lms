import { NavLink, Outlet } from "react-router-dom";

export default function AdminDashboard() {
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-white border-r p-4 space-y-1">
        <h2 className="text-lg font-bold mb-4 px-4">Admin Panel</h2>
        <NavLink to="/admin" end className={linkClass}>
          Overview
        </NavLink>
        <NavLink to="/admin/courses" className={linkClass}>
          Courses
        </NavLink>
        {/* Students, Enrollments links can be added here once those pages exist */}
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}