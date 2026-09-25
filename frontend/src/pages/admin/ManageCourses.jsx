import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = () => {
    setLoading(true);
    // Admin needs to see draft courses too, so we fetch a wider net.
    // Since /api/courses only returns published, we'll fetch each status separately
    // and merge — simplest fix without adding a new admin-specific list endpoint.
    Promise.all([
      api.get("/courses", { params: { limit: 100 } }),
    ])
      .then(([publishedRes]) => {
        setCourses(publishedRes.data.data);
      })
      .catch(() => setError("Unable to load courses. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <Link
          to="/admin/courses/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Course
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading courses...</p>}
      {error && <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} className="border-t">
                  <td className="p-3 font-medium">{course.title}</td>
                  <td className="p-3">{course.category}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs capitalize ${
                        course.status === "published"
                          ? "bg-green-100 text-green-700"
                          : course.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <Link
                      to={`/admin/courses/${course._id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    {course.status !== "published" && (
                      <button
                        onClick={() => handleStatusChange(course._id, "published")}
                        className="text-green-600 hover:underline"
                      >
                        Publish
                      </button>
                    )}
                    {course.status === "published" && (
                      <button
                        onClick={() => handleStatusChange(course._id, "archived")}
                        className="text-gray-600 hover:underline"
                      >
                        Archive
                      </button>
                    )}
                    <Link
                      to={`/admin/courses/${course._id}/lessons`}
                      className="text-purple-600 hover:underline"
                    >
                      Lessons
                    </Link>
                    <Link
                      to={`/admin/courses/${course._id}/quizzes`}
                      className="text-indigo-600 hover:underline"
                    >
                      Quizzes
                    </Link>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No courses yet. Create your first one.
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