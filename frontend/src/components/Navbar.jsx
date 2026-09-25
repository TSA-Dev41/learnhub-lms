import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">
        LearnHub
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/" className="text-gray-700 hover:text-blue-600">
          Courses
        </Link>
        {user ? (
          <>
            {user.role === "admin" && (
              <Link to="/admin" className="text-gray-700 hover:text-blue-600">
                Admin Panel
              </Link>
            )}
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" className="text-gray-700 hover:text-blue-600">
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-gray-200 px-3 py-1.5 rounded hover:bg-gray-300 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}