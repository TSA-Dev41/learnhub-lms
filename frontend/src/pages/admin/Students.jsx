import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = useCallback(() => {
    let isActive = true;

    setLoading(true);
    setError("");

    api
      .get("/admin/students")
      .then((res) => {
        if (isActive) setStudents(res.data.data);
      })
      .catch(() => {
        if (isActive) setError("Unable to load students.");
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    api
      .get("/admin/students")
      .then((res) => {
        if (isActive) setStudents(res.data.data);
      })
      .catch(() => {
        if (isActive) setError("Unable to load students.");
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Students</h1>

      {loading && <p className="text-gray-500">Loading students...</p>}

      {!loading && error && (
        <div className="bg-red-100 text-red-700 p-3 rounded flex items-center justify-between gap-3">
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3">{s.email}</td>
                  <td className="p-3">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/admin/students/${s._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
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