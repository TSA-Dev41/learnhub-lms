import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function Lesson() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loadedLessonId, setLoadedLessonId] = useState(null);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
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
      })
  }, [id]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await api.post(`/lessons/${id}/complete`);
      setLesson((prev) => ({ ...prev, completed: true }));
    } catch (err) {
      setError(
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
        <p className="text-red-600">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Back to courses
        </Link>
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
    </div>
  );
}