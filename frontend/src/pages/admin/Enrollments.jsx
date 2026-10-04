import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

export default function Enrollments() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback((nextPage) => {
    setLoading(true);
    setError("");
    api
      .get("/admin/enrollments", { params: { page: nextPage, limit: 10 } })
      .then((res) => {
        setRows(res.data.data);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setPage(res.data.pagination?.page || nextPage);
      })
      .catch(() => setError("Unable to load enrollments."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => load(1), 0);
    return () => clearTimeout(timeoutId);
  }, [load]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
        Enrollments
      </h1>

      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg skeleton" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          className="p-3 rounded-lg flex items-center justify-between gap-3"
          style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
        >
          <span>{error}</span>
          <button onClick={() => load(page)} className="text-sm font-medium underline">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>No enrollments yet.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow-sm" style={{ background: "var(--color-surface)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="p-3">Student</th>
                <th className="p-3">Course</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.enrollmentId} className="border-b border-gray-50">
                  <td className="p-3">
                    <p className="font-medium">{row.studentName}</p>
                    <p style={{ color: "var(--color-text-muted)" }}>{row.studentEmail}</p>
                  </td>
                  <td className="p-3">{row.courseTitle}</td>
                  <td className="p-3">{row.progressPercent}%</td>
                  <td className="p-3">{new Date(row.enrolledAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-3 mt-4 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className="px-3 py-1 rounded border disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
            className="px-3 py-1 rounded border disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
