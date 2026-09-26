import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";

export default function Lesson() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loadedLessonId, setLoadedLessonId] = useState(null);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState("");
  const cancelledRef = useRef(false);

  const fetchLesson = useCallback(() => {
    setLoadedLessonId(null);
    setError("");

    api
      .get(`/lessons/${id}`)
      .then((res) => {
        if (cancelledRef.current) return;
        setLesson(res.data.data);
        setError("");
        setLoadedLessonId(id);
      })
      .catch((err) => {
        if (cancelledRef.current) return;
        setError(
          err.response?.data?.message ||
            "Unable to load this lesson. Please try again."
        );
        setLoadedLessonId(id);
      });
  }, [id]);

  useEffect(() => {
    cancelledRef.current = false;
    fetchLesson();
    return () => {
      cancelledRef.current = true;
    };
  }, [fetchLesson]);

  const handleComplete = async () => {
    setCompleting(true);
    setCompleteError("");
    try {
      await api.post(`/lessons/${id}/complete`);
      setLesson((prev) => ({ ...prev, completed: true }));
    } catch (err) {
      setCompleteError(
        err.response?.data?.message || "Unable to mark this lesson complete."
      );
    } finally {
      setCompleting(false);
    }
  };

  if (loadedLessonId !== id) {
    return (
      <div className="min-h-screen p-8 max-w-3xl mx-auto">
        <div className="h-4 w-20 rounded skeleton mb-2" />
        <div className="h-9 w-2/3 rounded skeleton mb-4" />
        <div className="h-64 w-full rounded-lg skeleton mb-6" />
        <div className="h-10 w-40 rounded-lg skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="mb-3" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchLesson}
            className="text-sm font-medium underline"
            style={{ color: "var(--color-primary)" }}
          >
            Retry
          </button>
          <Link to="/" className="hover:underline text-sm" style={{ color: "var(--color-primary)" }}>
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen p-8 max-w-3xl mx-auto"
    >
      <p className="text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>
        Lesson {lesson.order}
      </p>
      <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
        {lesson.title}
      </h1>

      {lesson.videoUrl && (
        <div className="mb-6 aspect-video bg-black rounded-lg overflow-hidden">
          <video src={lesson.videoUrl} controls className="w-full h-full" />
        </div>
      )}

      <div
        className="bg-[var(--color-surface)] rounded-lg shadow-sm p-6 mb-6 whitespace-pre-line"
        style={{ color: "var(--color-text)" }}
      >
        {lesson.content || "No content added for this lesson yet."}
      </div>

      <div className="flex items-center gap-4">
        {lesson.completed ? (
          <span
            className="px-4 py-2 rounded-lg font-medium"
            style={{ background: "var(--color-accent-light)", color: "var(--color-accent)" }}
          >
            ✓ Completed
          </span>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleComplete}
            disabled={completing}
            className="text-white px-5 py-2 rounded-lg disabled:opacity-50 transition-colors"
            style={{ background: "var(--color-primary)" }}
          >
            {completing ? "Saving..." : "Mark as Complete"}
          </motion.button>
        )}
      </div>

      {completeError && (
        <p className="text-sm mt-2" style={{ color: "var(--color-danger)" }}>
          {completeError}
        </p>
      )}
    </motion.div>
  );
}