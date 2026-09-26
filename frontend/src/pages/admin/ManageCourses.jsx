import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";

const statusStyle = {
  published: { background: "var(--color-accent-light)", color: "var(--color-accent)" },
  draft: { background: "var(--color-warning-light)", color: "var(--color-warning)" },
  archived: { background: "#f3f4f6", color: "var(--color-text-muted)" },
};

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ignoreRef = useRef(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/courses", { params: { limit: 100 } });
      if (!ignoreRef.current) {
        setCourses(res.data.data);
      }
    } catch {
      if (!ignoreRef.current) {
        setError("Unable to load courses. Please try again.");
      }
    } finally {
      if (!ignoreRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    ignoreRef.current = false;

    const timer = window.setTimeout(() => {
      fetchCourses();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      ignoreRef.current = true;
    };
  }, [fetchCourses]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/courses/${id}/status`, { status });
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete course");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          Manage Courses
        </h1>
        <Link
          to="/admin/courses/new"
          className="text-white px-4 py-2 rounded-lg transition-colors"
          style={{ background: "var(--color-primary)" }}
        >
          + New Course
        </Link>
      </div>

      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 w-full rounded-lg skeleton" />
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
            onClick={fetchCourses}
            className="text-sm font-medium underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-surface rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--color-primary-light)" }}>
              <tr className="text-left">
                <th className="p-3" style={{ color: "var(--color-text)" }}>Title</th>
                <th className="p-3" style={{ color: "var(--color-text)" }}>Category</th>
                <th className="p-3" style={{ color: "var(--color-text)" }}>Status</th>
                <th className="p-3" style={{ color: "var(--color-text)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} className="border-t border-gray-100">
                  <td className="p-3 font-medium" style={{ color: "var(--color-text)" }}>
                    {course.title}
                  </td>
                  <td className="p-3" style={{ color: "var(--color-text-muted)" }}>
                    {course.category}
                  </td>
                  <td className="p-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs capitalize font-medium"
                      style={statusStyle[course.status]}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-3 text-sm">
                    <Link
                      to={`/admin/courses/${course._id}/edit`}
                      className="hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Edit
                    </Link>
                    {course.status !== "published" && (
                      <button
                        onClick={() => handleStatusChange(course._id, "published")}
                        className="hover:underline"
                        style={{ color: "var(--color-accent)" }}
                      >
                        Publish
                      </button>
                    )}
                    {course.status === "published" && (
                      <button
                        onClick={() => handleStatusChange(course._id, "archived")}
                        className="hover:underline"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Archive
                      </button>
                    )}
                    <Link
                      to={`/admin/courses/${course._id}/lessons`}
                      className="hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Lessons
                    </Link>
                    <Link
                      to={`/admin/courses/${course._id}/quizzes`}
                      className="hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Quizzes
                    </Link>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="hover:underline"
                      style={{ color: "var(--color-danger)" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center" style={{ color: "var(--color-text-muted)" }}>
                    No courses yet. Create your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}