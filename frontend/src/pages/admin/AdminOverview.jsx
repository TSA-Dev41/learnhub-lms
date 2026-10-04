import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data.data))
      .catch(() => setError("Unable to load the overview."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(loadStats, 0);
    return () => clearTimeout(timeoutId);
  }, [loadStats]);

  const cards = stats
    ? [
        { label: "Published courses", value: stats.publishedCourses },
        { label: "Draft courses", value: stats.draftCourses },
        { label: "Students", value: stats.students },
        { label: "Enrollments", value: stats.enrollments },
        { label: "Quiz attempts", value: stats.quizAttempts },
        { label: "Unread messages", value: stats.unreadMessages },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
        Welcome, Admin
      </h1>
      <p className="mb-6" style={{ color: "var(--color-text-muted)" }}>
        A quick look at courses, students, and messages waiting on you.
      </p>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          className="p-3 rounded-lg flex items-center justify-between gap-3"
          style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
        >
          <span>{error}</span>
          <button onClick={loadStats} className="text-sm font-medium underline">
            Retry
          </button>
        </div>
      )}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-lg p-4 shadow-sm"
                style={{ background: "var(--color-surface)" }}
              >
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {card.label}
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: "var(--color-text)" }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mb-8 text-sm">
            <Link to="/admin/courses" className="underline" style={{ color: "var(--color-primary)" }}>
              Manage courses
            </Link>
            <Link to="/admin/enrollments" className="underline" style={{ color: "var(--color-primary)" }}>
              View enrollments
            </Link>
            <Link to="/admin/messages" className="underline" style={{ color: "var(--color-primary)" }}>
              Read messages
            </Link>
          </div>

          <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--color-text)" }}>
            Recent enrollments
          </h2>
          {stats.recentEnrollments.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)" }}>No enrollments yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentEnrollments.map((item) => (
                <div
                  key={item.enrollmentId}
                  className="rounded-lg px-4 py-3 flex justify-between gap-3 text-sm"
                  style={{ background: "var(--color-surface)" }}
                >
                  <span>
                    <strong>{item.studentName}</strong> joined {item.courseTitle}
                  </span>
                  <span style={{ color: "var(--color-text-muted)" }}>
                    {new Date(item.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
