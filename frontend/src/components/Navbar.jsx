import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass =
    "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors";

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className="bg-[var(--color-surface)] shadow-sm px-6 py-4 flex justify-between items-center relative"
      style={{ zIndex: 40 }}
    >
      <Logo />

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-5">
        <Link to="/" className={navLinkClass}>
          Courses
        </Link>
        <Link to="/faq" className={navLinkClass}>
          FAQ
        </Link>
        {user ? (
          <>
            <Link to="/dashboard" className={navLinkClass}>
              Dashboard
            </Link>
            <Link to="/profile" className={navLinkClass}>
              Profile
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" className={navLinkClass}>
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 text-sm transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={navLinkClass}>
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary-dark)] text-sm transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden p-1"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {menuOpen ? (
          <X className="w-6 h-6" style={{ color: "var(--color-text)" }} />
        ) : (
          <Menu className="w-6 h-6" style={{ color: "var(--color-text)" }} />
        )}
      </button>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden absolute top-full left-0 right-0 shadow-md flex flex-col p-4 gap-3"
            style={{ background: "var(--color-surface)" }}
          >
            <Link to="/" className={navLinkClass} onClick={closeMenu}>
              Courses
            </Link>
            <Link to="/faq" className={navLinkClass} onClick={closeMenu}>
              FAQ
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className={navLinkClass} onClick={closeMenu}>
                  Dashboard
                </Link>
                <Link to="/profile" className={navLinkClass} onClick={closeMenu}>
                  Profile
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" className={navLinkClass} onClick={closeMenu}>
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm text-left transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass} onClick={closeMenu}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-[var(--color-primary)] text-white px-3 py-2 rounded-lg hover:bg-[var(--color-primary-dark)] text-sm text-center transition-colors"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}