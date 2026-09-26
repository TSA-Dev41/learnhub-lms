import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEnrollments = useCallback(() => {
    setLoading(true);
    setError("");

    api
      .get("/enrollments/me")
      .then((res) => setEnrollments(res.data.data))
      .catch(() => setError("Unable to load your courses. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(fetchEnrollments, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchEnrollments]);

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name}</h1>

      <h2 className="text-xl font-semibold mb-4">My Courses</h2>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-100 text-red-700 p-3 rounded flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            onClick={fetchEnrollments}
            className="text-sm font-medium underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && enrollments.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">
            You haven't enrolled in any courses yet.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {!loading && !error && enrollments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((e) => (
            <Link
              key={e.enrollmentId}
              to={`/courses/${e.courseId}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition p-4"
            >
              <h3 className="text-lg font-bold mb-1">{e.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{e.status}</p>
              <p className="text-xs text-gray-400 mt-2">
                Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}