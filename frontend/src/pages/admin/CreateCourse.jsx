import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full rounded-lg px-3 py-2 border border-gray-200 bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow";
const labelClass = "block text-sm font-medium mb-1";

export default function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    instructor: user?.name || "",
    category: "",
    level: "beginner",
    thumbnail: "",
    status: "draft",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/admin/courses", form);
      const newCourseId = res.data.data._id;
      navigate(`/admin/courses/${newCourseId}/edit`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create course.");
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-2xl"
    >
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
        Create Course
      </h1>

      {error && (
        <p
          className="p-3 rounded-lg mb-4"
          style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass} style={{ color: "var(--color-text)" }}>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--color-text)" }}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--color-text)" }}>Instructor</label>
          <input name="instructor" value={form.instructor} onChange={handleChange} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--color-text)" }}>Category</label>
          <input name="category" value={form.category} onChange={handleChange} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--color-text)" }}>Level</label>
          <select name="level" value={form.level} onChange={handleChange} className={inputClass}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--color-text)" }}>
            Thumbnail URL (optional)
          </label>
          <input
            name="thumbnail"
            value={form.thumbnail}
            onChange={handleChange}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} style={{ color: "var(--color-text)" }}>Status</label>
          <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting}
            className="text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
            style={{ background: "var(--color-primary)" }}
          >
            {submitting ? "Creating..." : "Create Course"}
          </motion.button>
          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ color: "var(--color-text)" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}