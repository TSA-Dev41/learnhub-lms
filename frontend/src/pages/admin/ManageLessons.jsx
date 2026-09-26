import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

const emptyForm = {
  title: "",
  description: "",
  content: "",
  videoUrl: "",
  order: 1,
  duration: 0,
  published: false,
};

export default function ManageLessons() {
  const { id: courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = creating new
  const [submitting, setSubmitting] = useState(false);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/admin/lessons/course/${courseId}`);
      setLessons(res.data.data);
    } catch {
      setError("Unable to load lessons.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    let isMounted = true;

    const loadLessons = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get(`/admin/lessons/course/${courseId}`);
        if (isMounted) {
          setLessons(res.data.data);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load lessons.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLessons();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const startEdit = (lesson) => {
    setEditingId(lesson._id);
    setForm({
      title: lesson.title || "",
      description: lesson.description || "",
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || "",
      order: lesson.order || 1,
      duration: lesson.duration || 0,
      published: !!lesson.published,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (editingId) {
        await api.put(`/admin/lessons/${editingId}`, form);
      } else {
        await api.post(`/admin/lessons`, { ...form, course: courseId });
      }
      cancelEdit();
      fetchLessons();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save lesson.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/lessons/${lessonId}`);
      fetchLessons();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to delete lesson.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Lessons</h1>
        <Link to="/admin/courses" className="text-blue-600 hover:underline text-sm">
          ← Back to Courses
        </Link>
      </div>

      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>
      )}

      {/* Lesson list */}
      {loading ? (
        <p className="text-gray-500">Loading lessons...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Title</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Published</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson._id} className="border-t">
                  <td className="p-3">{lesson.order}</td>
                  <td className="p-3 font-medium">{lesson.title}</td>
                  <td className="p-3">{lesson.duration || 0} min</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        lesson.published
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {lesson.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => startEdit(lesson)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lesson._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {lessons.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No lessons yet. Add one below.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit form */}
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-lg font-bold mb-4">
          {editingId ? "Edit Lesson" : "Add New Lesson"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={5}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Video URL (optional)
            </label>
            <input
              name="videoUrl"
              value={form.videoUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Order</label>
              <input
                type="number"
                name="order"
                value={form.order}
                onChange={handleChange}
                min={1}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                min={0}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
              id="published"
            />
            <label htmlFor="published" className="text-sm font-medium">
              Published
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Lesson"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded border hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}