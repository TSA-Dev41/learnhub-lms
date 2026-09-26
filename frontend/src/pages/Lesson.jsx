import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function Lesson() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loadedLessonId, setLoadedLessonId] = useState(null);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState("");

  const fetchLesson = useCallback(() => {
    setLoadedLessonId(null);
    setError("");

    api
      .get(`/lessons/${id}`)
      .then((res) => {
        setLesson(res.data.data);
        setError("");
        setLoadedLessonId(id);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Unable to load this lesson. Please try again."
        );
        setLoadedLessonId(id);
      });
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    api
      .get(`/lessons/${id}`)
      .then((res) => {
        if (cancelled) return;
        setLesson(res.data.data);
        setError("");
        setLoadedLessonId(id);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err.response?.data?.message ||
            "Unable to load this lesson. Please try again."
        );
        setLoadedLessonId(id);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

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
    return <p className="p-8 text-gray-500">Loading lesson...</p>;
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600 mb-3">{error}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchLesson}
            className="text-sm font-medium text-blue-600 underline"
          >
            Retry
          </button>
          <Link to="/" className="text-blue-600 hover:underline text-sm">
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-3xl mx-auto">
      <p className="text-sm text-gray-500 mb-2">Lesson {lesson.order}</p>
      <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>

      {lesson.videoUrl && (
        <div className="mb-6 aspect-video bg-black rounded overflow-hidden">
          <video src={lesson.videoUrl} controls className="w-full h-full" />
        </div>
      )}

      <div className="bg-white border rounded p-6 mb-6 whitespace-pre-line">
        {lesson.content || "No content added for this lesson yet."}
      </div>

      <div className="flex items-center gap-4">
        {lesson.completed ? (
          <span className="bg-green-100 text-green-700 px-4 py-2 rounded">
            ✓ Completed
          </span>
        ) : (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {completing ? "Saving..." : "Mark as Complete"}
          </button>
        )}
      </div>

      {completeError && (
        <p className="text-sm mt-2 text-red-600">{completeError}</p>
      )}
    </div>
  );
}