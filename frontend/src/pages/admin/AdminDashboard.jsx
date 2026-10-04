import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "../../components/Logo";

const navItems = [
  { path: "/admin", label: "Overview", end: true },
  { path: "/admin/courses", label: "Manage Courses" },
  { path: "/admin/students", label: "Students" },
  { path: "/admin/enrollments", label: "Enrollments" },
  { path: "/admin/messages", label: "Messages" },
];

const SidebarContent = ({ onNavigate }) => (
  <div className="flex flex-col h-full min-h-0">
    <div className="mb-6 px-1">
      <Logo />
      <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
        Admin Panel
      </p>
    </div>

    <nav className="space-y-1 flex-1 overflow-y-auto">
      {navItems.map((item) => (
        <NavLink key={item.path} to={item.path} end={item.end} onClick={onNavigate}>
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

    <NavLink to="/" className="pt-3 mt-3 border-t border-gray-100" onClick={onNavigate}>
      <span
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
        style={{ color: "var(--color-text-muted)" }}
      >
        ← Home
      </span>
    </NavLink>
  </div>
);

export default function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 shadow-sm"
        style={{ background: "var(--color-surface)" }}
      >
        <Logo />
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="w-6 h-6" style={{ color: "var(--color-text)" }} />
        </button>
      </div>

      {/* Mobile off-canvas sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2 }}
              className="fixed top-0 left-0 h-full w-64 max-w-[80vw] p-4 shadow-md z-50 flex flex-col md:hidden overflow-hidden"
              style={{ background: "var(--color-surface)" }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end mb-2"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" style={{ color: "var(--color-text)" }} />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:flex-col w-56 min-h-screen p-4 shadow-sm"
        style={{ background: "var(--color-surface)" }}
      >
        <SidebarContent />
      </aside>

      <main className="flex-1 min-w-0 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}