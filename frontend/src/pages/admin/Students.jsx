import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const ignoreRef = useRef(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/admin/students");
      if (!ignoreRef.current) setStudents(res.data.data);
    } catch {
      if (!ignoreRef.current) setError("Unable to load students.");
    } finally {
      if (!ignoreRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadStudents = async () => {
      ignoreRef.current = false;
      if (active) {
        await fetchStudents();
      }
    };

    loadStudents();

    return () => {
      active = false;
      ignoreRef.current = true;
    };
  }, [fetchStudents]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
        Students
      </h1>

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
            onClick={fetchStudents}
            className="text-sm font-medium underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-surface rounded-lg shadow-sm overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
          <table className="w-full text-sm min-w-[500px]">
            <thead style={{ background: "var(--color-primary-light)" }}>
              <tr className="text-left">
                <th className="p-3" style={{ color: "var(--color-text)" }}>Name</th>
                <th className="p-3" style={{ color: "var(--color-text)" }}>Email</th>
                <th className="p-3" style={{ color: "var(--color-text)" }}>Joined</th>
                <th className="p-3" style={{ color: "var(--color-text)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t border-gray-100">
                  <td className="p-3 font-medium" style={{ color: "var(--color-text)" }}>
                    {s.name}
                  </td>
                  <td className="p-3" style={{ color: "var(--color-text-muted)" }}>
                    {s.email}
                  </td>
                  <td className="p-3" style={{ color: "var(--color-text-muted)" }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/admin/students/${s._id}`}
                      className="hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-6 text-center"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    No students yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}