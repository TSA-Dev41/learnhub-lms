import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();

  const navLinkClass =
    "text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors";

  return (
    <nav className="bg-[var(--color-surface)] shadow-sm px-6 py-4 flex justify-between items-center">
      <Logo />
      <div className="flex items-center gap-5">
        <Link to="/" className={navLinkClass}>
          Courses
        </Link>
        {user ? (
          <>
            <Link to="/dashboard" className={navLinkClass}>
              Dashboard
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
    </nav>
  );
}