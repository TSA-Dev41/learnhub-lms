import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";

export default function StudentDetail() {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState({ lessons: [], quizzes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudentDetail = useCallback(() => {
    setLoading(true);
    setError("");

    Promise.all([
      api.get(`/admin/students/${id}`),
      api.get(`/admin/students/${id}/enrollments`),
      api.get(`/admin/students/${id}/progress`),
    ])
      .then(([studentRes, enrollRes, progressRes]) => {
        setStudent(studentRes.data.data);
        setEnrollments(enrollRes.data.data);
        setProgress(progressRes.data.data);
      })
      .catch(() => setError("Unable to load student details."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchStudentDetail, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchStudentDetail]);

  if (loading) {
    return (
      <div>
        <div className="h-4 w-32 rounded skeleton mb-4" />
        <div className="h-8 w-1/3 rounded skeleton mb-2" />
        <div className="h-4 w-1/4 rounded skeleton mb-6" />
        <div className="h-40 w-full rounded-lg skeleton mb-8" />
        <div className="h-40 w-full rounded-lg skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p className="mb-3" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchStudentDetail}
            className="text-sm font-medium underline"
            style={{ color: "var(--color-primary)" }}
          >
            Retry
          </button>
          <Link
            to="/admin/students"
            className="hover:underline text-sm"
            style={{ color: "var(--color-primary)" }}
          >
            ← Back to Students
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to="/admin/students"
        className="hover:underline text-sm"
        style={{ color: "var(--color-primary)" }}
      >
        ← Back to Students
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-1" style={{ color: "var(--color-text)" }}>
        {student.name}
      </h1>
      <p className="mb-6" style={{ color: "var(--color-text-muted)" }}>
        {student.email}
      </p>

      {/* Enrollments */}
      <h2 className="text-lg font-bold mb-3" style={{ color: "var(--color-text)" }}>
        Enrollments
      </h2>
      <div className="bg-surface rounded-lg shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--color-primary-light)" }}>
            <tr className="text-left">
              <th className="p-3" style={{ color: "var(--color-text)" }}>Course</th>
              <th className="p-3" style={{ color: "var(--color-text)" }}>Status</th>
              <th className="p-3" style={{ color: "var(--color-text)" }}>Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.enrollmentId} className="border-t border-gray-100">
                <td className="p-3 font-medium" style={{ color: "var(--color-text)" }}>
                  {e.courseTitle}
                </td>
                <td className="p-3 capitalize" style={{ color: "var(--color-text-muted)" }}>
                  {e.status}
                </td>
                <td className="p-3" style={{ color: "var(--color-text-muted)" }}>
                  {new Date(e.enrolledAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan="3" className="p-6 text-center" style={{ color: "var(--color-text-muted)" }}>
                  Not enrolled in any courses.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Lesson progress */}
      <h2 className="text-lg font-bold mb-3" style={{ color: "var(--color-text)" }}>
        Completed Lessons
      </h2>
      <div className="bg-surface rounded-lg shadow-sm overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--color-primary-light)" }}>
            <tr className="text-left">
              <th className="p-3" style={{ color: "var(--color-text)" }}>Lesson</th>
              <th className="p-3" style={{ color: "var(--color-text)" }}>Course</th>
              <th className="p-3" style={{ color: "var(--color-text)" }}>Completed</th>
            </tr>
          </thead>
          <tbody>
            {progress.lessons.map((l, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="p-3 font-medium" style={{ color: "var(--color-text)" }}>
                  {l.lessonTitle}
                </td>
                <td className="p-3" style={{ color: "var(--color-text-muted)" }}>
                  {l.courseTitle}
                </td>
                <td className="p-3" style={{ color: "var(--color-text-muted)" }}>
                  {new Date(l.completedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {progress.lessons.length === 0 && (
              <tr>
                <td colSpan="3" className="p-6 text-center" style={{ color: "var(--color-text-muted)" }}>
                  No lessons completed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quiz attempts */}
      <h2 className="text-lg font-bold mb-3" style={{ color: "var(--color-text)" }}>
        Quiz Attempts
      </h2>
      <div className="bg-surface rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--color-primary-light)" }}>
            <tr className="text-left">
              <th className="p-3" style={{ color: "var(--color-text)" }}>Quiz</th>
              <th className="p-3" style={{ color: "var(--color-text)" }}>Score</th>
              <th className="p-3" style={{ color: "var(--color-text)" }}>Result</th>
              <th className="p-3" style={{ color: "var(--color-text)" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {progress.quizzes.map((q, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="p-3 font-medium" style={{ color: "var(--color-text)" }}>
                  {q.quizTitle}
                </td>
                <td className="p-3" style={{ color: "var(--color-text-muted)" }}>
                  {q.score}%
                </td>
                <td className="p-3">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={
                      q.passed
                        ? { background: "var(--color-accent-light)", color: "var(--color-accent)" }
                        : { background: "var(--color-danger-light)", color: "var(--color-danger)" }
                    }
                  >
                    {q.passed ? "Passed" : "Failed"}
                  </span>
                </td>
                <td className="p-3" style={{ color: "var(--color-text-muted)" }}>
                  {new Date(q.attemptedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {progress.quizzes.length === 0 && (
              <tr>
                <td colSpan="4" className="p-6 text-center" style={{ color: "var(--color-text-muted)" }}>
                  No quiz attempts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}