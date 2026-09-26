import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen p-8 max-w-5xl mx-auto"
    >
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
        Welcome, {user?.name}
      </h1>

      <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-text)" }}>
        My Courses
      </h2>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-lg skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          className="p-3 rounded-lg flex items-center justify-between gap-3"
          style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
        >
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
          <p className="mb-4" style={{ color: "var(--color-text-muted)" }}>
            You haven't enrolled in any courses yet.
          </p>
          <Link
            to="/"
            className="inline-block text-white px-5 py-2 rounded-lg transition-colors"
            style={{ background: "var(--color-primary)" }}
          >
            Browse Courses
          </Link>
        </div>
      )}

      {!loading && !error && enrollments.length > 0 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {enrollments.map((e) => (
            <motion.div
              key={e.enrollmentId}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <Link
                to={`/courses/${e.courseId}`}
                className="block bg-[var(--color-surface)] rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 h-full"
              >
                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--color-text)" }}>
                  {e.title}
                </h3>
                <p className="text-sm capitalize" style={{ color: "var(--color-text-muted)" }}>
                  {e.status}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                  Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}